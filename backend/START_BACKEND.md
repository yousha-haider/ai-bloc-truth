# How to Start the Backend Server

## Quick Start

1. **Open a terminal/command prompt**

2. **Navigate to the backend folder:**
   ```bash
   cd D:\ai-bloc-truth-main\backend
   ```

3. **Activate your virtual environment (if you have one):**
   ```bash
   .venv\Scripts\activate
   ```
   Or if you don't have a venv, skip this step.

4. **Install dependencies (if not already installed):**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the server:**
   ```bash
   python app.py
   ```

   You should see:
   ```
   Database initialized successfully
   INFO:     Uvicorn running on http://127.0.0.1:5000
   ```

## If You Get Errors

### Error: "Module not found"
Install missing packages:
```bash
pip install fastapi uvicorn pydantic mysql-connector-python python-dotenv torch transformers
```

### Error: "Database connection failed"
1. Make sure MySQL is installed and running
2. Create `backend/.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ai_bloc_truth
   ```

### Error: "Port 5000 already in use"
Use a different port:
```bash
set PORT=5001
python app.py
```
Then update `vite.config.ts` to use port 5001.

## Keep the Terminal Open
**Important:** Keep the terminal window open while using the app. Closing it will stop the backend server.

## Test It's Working
Once started, test in another terminal:
```bash
curl http://localhost:5000/api/auth/me
```
Should return `null` (which is correct - no user logged in).

