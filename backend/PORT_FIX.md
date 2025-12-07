# Port 5000 Blocked on Windows - Quick Fix

## Problem
Windows Error 10013: Port 5000 is often reserved or blocked on Windows.

## Solution 1: Use Port 5001 (Already Configured)
The backend now defaults to port 5001. Just restart:
```bash
python app.py
```

## Solution 2: Use a Different Port
Set the PORT environment variable:
```bash
# Windows Command Prompt
set PORT=8000
python app.py

# Windows PowerShell
$env:PORT="8000"
python app.py
```

Then update `vite.config.ts` to match:
```typescript
target: "http://localhost:8000",
```

## Solution 3: Free Port 5000 (Advanced)
If you need port 5000 specifically:

1. **Check what's using it:**
```bash
netstat -ano | findstr :5000
```

2. **Stop the service using it** (if it's a Windows service)

3. **Or release the port reservation:**
```bash
netsh http delete urlacl url=http://+:5000/
```

## Current Configuration
- Backend: Port 5001 (default)
- Frontend: Port 8080
- Proxy: Frontend → Backend (8080 → 5001)

