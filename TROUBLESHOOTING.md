# Troubleshooting Signup Issues

## Common Issues and Solutions

### 1. "Signup Failed" Error

#### Check Backend is Running
Make sure your backend server is running:
```bash
cd backend
python app.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:5000
```

#### Check Database Connection
The most common issue is MySQL not configured. Check:

1. **MySQL is installed and running**
   ```bash
   mysql --version
   ```

2. **Create `.env` file in `backend/` folder:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ai_bloc_truth
   ```

3. **Test database connection:**
   ```bash
   mysql -u root -p
   # Enter your password
   ```

#### Check Browser Console
Open browser DevTools (F12) → Console tab and look for:
- Network errors (CORS, connection refused)
- API response errors

#### Check Backend Logs
Look at the terminal where `python app.py` is running for error messages.

### 2. "Database connection failed" Error

This means MySQL is not accessible. Solutions:

1. **Install MySQL** if not installed
2. **Start MySQL service:**
   - Windows: Check Services app
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

3. **Verify credentials in `.env` file**

### 3. "Cannot connect to server" Error

This means the backend API is not reachable:

1. **Check backend is running** on port 5000
2. **Check Vite proxy** in `vite.config.ts` points to correct port
3. **Check firewall** isn't blocking port 5000

### 4. Quick Test

Test the signup endpoint directly:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

If this fails, the issue is with the backend/database.
If this works, the issue is with the frontend connection.

### 5. Enable Detailed Logging

Add this to see more details:
- Browser: Check Network tab in DevTools
- Backend: Errors will print to console

