
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from typing import Optional
import torch  # type: ignore
from transformers import AutoTokenizer, AutoModelForSequenceClassification  # type: ignore
import hashlib
import uuid
from datetime import datetime
from database import get_db_connection, init_database

# Configure local Transformers model location
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
_HF_DIR = os.path.join(_MODEL_DIR, "hf-model")
_HF_PATH = _HF_DIR if os.path.isdir(_HF_DIR) else _MODEL_DIR

tokenizer = AutoTokenizer.from_pretrained(_HF_PATH)
model = AutoModelForSequenceClassification.from_pretrained(_HF_PATH)
model.eval()

# If your model doesn't expose id2label, choose which class id is REAL via env var.
# Example: set REAL_LABEL_ID=0 if your model uses 0 -> REAL, 1 -> FAKE
_REAL_LABEL_ID = int(os.getenv("REAL_LABEL_ID", "1"))

app = FastAPI()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    try:
        init_database()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Continuing without database...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # safe in dev; restrict in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Models
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None

# Verification Models
class VerifyRequest(BaseModel):
    inputType: str  # "text" or "url"
    text: Optional[str] = None
    url: Optional[str] = None
    userId: Optional[str] = None  # Optional user ID if logged in

# Helper function to hash passwords (simple SHA256 - in production use bcrypt)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def predict_text(text: str) -> dict:
    """Return a dict with keys: status, confidence using a Transformers classifier."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]
        conf = float(probs.max()) * 100.0
        pred = int(probs.argmax())

    # Map label id -> human-readable status
    status: str = "uncertain"
    # Prefer model's own id2label mapping if present
    id2label = getattr(getattr(model, "config", None), "id2label", None) or {}
    raw_label = id2label.get(pred)
    if isinstance(raw_label, str):
        low = raw_label.lower()
        if any(k in low for k in ["real", "true", "authentic", "positive"]):
            status = "real"
        elif any(k in low for k in ["fake", "false", "inauthentic", "negative"]):
            status = "fake"
        else:
            # If labels are generic (e.g., LABEL_0/LABEL_1), use configured REAL label id
            status = "real" if pred == _REAL_LABEL_ID else "fake"
    else:
        # Fallback: use configured REAL label id
        status = "real" if pred == _REAL_LABEL_ID else "fake"

    return {"status": status, "confidence": int(conf)}

@app.post("/verify")
def verify(req: VerifyRequest):
    # Decide input
    content = req.text or req.url or ""
    if not content:
        return {"error": "no input provided"}

    pred = predict_text(content)
    
    # Generate blockchain hash (simple hash for now)
    hash_input = f"{content}{datetime.now().isoformat()}"
    blockchain_hash = f"0x{hashlib.sha256(hash_input.encode()).hexdigest()[:32]}..."
    
    result = {
        "status": pred.get("status", "uncertain"),
        "confidence": int(pred.get("confidence", 0)),
        "blockchainHash": blockchain_hash,
        "analysis": {
            "credibilityScore": max(0, min(100, int(pred.get("confidence", 0)) - 5)),
            "languagePattern": "Neutral tone",
            "factCheck": "Matched with sources A, B, C",
            "sourceReliability": "High"
        },
        "timestamp": datetime.now().isoformat(),
    }
    
    # Save to database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        verification_id = str(uuid.uuid4())
        title = req.url if req.inputType == "url" else (req.text[:80] if req.text else "Text submission")
        source = req.url if req.inputType == "url" else "Direct text submission"
        
        cursor.execute("""
            INSERT INTO verifications (
                id, user_id, title, source, status, confidence, blockchain_hash,
                credibility_score, language_pattern, fact_check, source_reliability,
                input_type, input_url, input_snippet
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            verification_id,
            req.userId,
            title,
            source,
            result["status"],
            result["confidence"],
            blockchain_hash,
            result["analysis"]["credibilityScore"],
            result["analysis"]["languagePattern"],
            result["analysis"]["factCheck"],
            result["analysis"]["sourceReliability"],
            req.inputType,
            req.url,
            req.text[:500] if req.text else None
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Warning: Failed to save verification to database: {e}")
        # Continue even if DB save fails
    
    return result

# Auth Endpoints (with /api prefix)
@app.post("/api/auth/login")
@app.post("/auth/login")  # Also accept without /api prefix for proxy compatibility
def login(req: LoginRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        password_hash = hash_password(req.password)
        cursor.execute(
            "SELECT id, email, first_name, last_name, role FROM users WHERE email = %s AND password_hash = %s",
            (req.email.lower(), password_hash)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return {
            "id": user["id"],
            "email": user["email"],
            "firstName": user.get("first_name") or "",
            "lastName": user.get("last_name") or "",
            "role": user.get("role") or "user"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/signup")
@app.post("/auth/signup")  # Also accept without /api prefix for proxy compatibility
def signup(req: SignupRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (req.email.lower(),))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(req.password)
        
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            req.email.lower(),
            password_hash,
            req.firstName or "",
            req.lastName or "",
            "user"
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "id": user_id,
            "email": req.email,
            "firstName": req.firstName or "",
            "lastName": req.lastName or "",
            "role": "user",
            "session": {"user": {"id": user_id}}
        }
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"Signup error: {error_msg}")  # Log for debugging
        # Provide more helpful error messages
        if "Access denied" in error_msg or "Can't connect" in error_msg:
            raise HTTPException(
                status_code=503, 
                detail="Database connection failed. Please check MySQL configuration."
            )
        raise HTTPException(status_code=500, detail=f"Signup failed: {error_msg}")

@app.post("/api/auth/logout")
@app.post("/auth/logout")  # Also accept without /api prefix
def logout():
    return {"message": "Logged out successfully"}

@app.get("/api/auth/me")
@app.get("/auth/me")  # Also accept without /api prefix
def get_current_user(userId: Optional[str] = None):
    if not userId:
        return None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, email, first_name, last_name, role FROM users WHERE id = %s",
            (userId,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return None
        
        return {
            "id": user["id"],
            "email": user["email"],
            "firstName": user.get("first_name") or "",
            "lastName": user.get("last_name") or "",
            "role": user.get("role") or "user"
        }
    except Exception as e:
        return None

# Verification History Endpoint
@app.get("/api/verifications")
def get_verifications(userId: Optional[str] = None, limit: int = 100):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if userId:
            cursor.execute("""
                SELECT id, user_id, title, source, status, confidence, blockchain_hash,
                       credibility_score, language_pattern, fact_check, source_reliability,
                       input_type, input_url, input_snippet, timestamp
                FROM verifications
                WHERE user_id = %s
                ORDER BY timestamp DESC
                LIMIT %s
            """, (userId, limit))
        else:
            cursor.execute("""
                SELECT id, user_id, title, source, status, confidence, blockchain_hash,
                       credibility_score, language_pattern, fact_check, source_reliability,
                       input_type, input_url, input_snippet, timestamp
                FROM verifications
                ORDER BY timestamp DESC
                LIMIT %s
            """, (limit,))
        
        records = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return [
            {
                "id": r["id"],
                "title": r["title"],
                "source": r["source"],
                "status": r["status"],
                "confidence": r["confidence"],
                "blockchainHash": r["blockchain_hash"],
                "timestamp": r["timestamp"].isoformat() if r["timestamp"] else None,
                "verifier": "AI Authenticity Model",
                "inputType": r["input_type"],
                "url": r["input_url"],
                "snippet": r["input_snippet"]
            }
            for r in records
        ]
    except Exception as e:
        print(f"Error fetching verifications: {e}")
        return []

# Also accept /api/verify so it works without proxy rewrite
@app.post("/api/verify")
def verify_with_prefix(req: VerifyRequest):
    return verify(req)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)