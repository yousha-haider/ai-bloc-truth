# Project Setup Instructions

Complete guide to set up and run the AI + Blockchain Fake News Detector project on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node -v` and `npm -v`

2. **Python** (3.8 or higher)
   - Download from: https://www.python.org/downloads/
   - Verify installation: `python --version`

3. **MySQL** (8.0 or higher)
   - Download from: https://dev.mysql.com/downloads/installer/
   - Or use: `brew install mysql` (Mac) / `sudo apt-get install mysql-server` (Linux)
   - Verify installation: `mysql --version`

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/downloads

---

## Step-by-Step Setup

### Step 1: Clone/Download the Project

If using Git:
```bash
git clone <repository-url>
cd ai-bloc-truth-main
```

Or extract the project folder if downloaded as ZIP.

### Step 2: Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd D:\ai-bloc-truth-main
   # Or wherever your project is located
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages (React, Vite, etc.)

3. **Verify frontend setup:**
   - You should see `node_modules` folder created
   - No errors in the terminal

### Step 3: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # Mac/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   If `requirements.txt` doesn't exist, install manually:
   ```bash
   pip install fastapi uvicorn pydantic mysql-connector-python python-dotenv torch transformers
   ```

4. **Verify backend setup:**
   - Virtual environment should be activated (you'll see `(.venv)` in terminal)
   - All packages installed without errors

### Step 4: MySQL Database Setup

1. **Start MySQL Server:**
   - **Windows:** Check Services app, start MySQL service
   - **Mac:** `brew services start mysql`
   - **Linux:** `sudo systemctl start mysql`

2. **Set MySQL root password (if not set):**
   ```bash
   mysql -u root
   ```
   Then in MySQL:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Create `.env` file in `backend` folder:**
   ```bash
   cd backend
   # Create a new file named .env
   ```

   Add the following content to `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=ai_bloc_truth
   REAL_LABEL_ID=1
   ```
   
   **Important:** Replace `your_mysql_password_here` with your actual MySQL root password!

4. **Verify MySQL connection:**
   ```bash
   mysql -u root -p
   # Enter your password when prompted
   # If successful, you're connected!
   EXIT;
   ```

### Step 5: ML Model Setup (Optional for basic functionality)

The project expects a Transformers model in `backend/model/` or `backend/model/hf-model/`.

**Option A: If you have a model:**
- Place your model files in `backend/model/hf-model/` folder
- Should include: `config.json`, tokenizer files, model weights

**Option B: If you don't have a model yet:**
- The app will still run, but verification will fail
- You can test login/signup/dashboard without the model
- Add your model later when ready

### Step 6: Run the Project

You need **TWO terminal windows** - one for frontend, one for backend.

#### Terminal 1: Backend Server

```bash
# Navigate to backend folder
cd D:\ai-bloc-truth-main\backend

# Activate virtual environment (if using one)
.venv\Scripts\activate  # Windows
# OR
source .venv/bin/activate  # Mac/Linux

# Start the backend server
python app.py
```

**Expected output:**
```
Database initialized successfully
INFO:     Uvicorn running on http://127.0.0.1:5000
```

**Keep this terminal open!** Closing it will stop the backend.

#### Terminal 2: Frontend Server

```bash
# Navigate to project root
cd D:\ai-bloc-truth-main

# Start the frontend development server
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in XXXX ms

➜  Local:   http://localhost:8080/
```

**Keep this terminal open too!**

### Step 7: Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:8080**
3. You should see the Home page

---

## First Time Usage

1. **Sign Up:**
   - Click "Get Started - Login" or "Sign Up" button
   - Fill in your details
   - Click "Create Account"
   - You'll be redirected to Login page

2. **Log In:**
   - Enter your email and password
   - Click "Sign In"
   - You'll be redirected to Dashboard

3. **Verify News:**
   - Click "Verify News" in navigation
   - Paste article text or URL
   - Click "Verify Authenticity"
   - View results

---

## Troubleshooting

### Backend won't start

**Error: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
```

**Error: "Database connection failed"**
- Check MySQL is running
- Verify `.env` file exists in `backend/` folder
- Check password in `.env` matches your MySQL password
- Test connection: `mysql -u root -p`

**Error: "Port 5000 already in use"**
- Use a different port:
  ```bash
  set PORT=5001  # Windows
  export PORT=5001  # Mac/Linux
  python app.py
  ```
- Update `vite.config.ts` line 13: `target: "http://localhost:5001"`

**Error: "Model not found"**
- This is OK if you don't have a model yet
- Login/signup will still work
- Only verification will fail

### Frontend won't start

**Error: "Cannot find module"**
```bash
npm install
```

**Error: "Port 8080 already in use"**
- Kill the process using port 8080
- Or change port in `vite.config.ts`

**Error: "Proxy error"**
- Make sure backend is running on port 5000
- Check `vite.config.ts` proxy configuration

### Database errors

**"Access denied for user 'root'@'localhost'"**
- Check MySQL password in `.env` file
- Verify MySQL is running
- Try: `mysql -u root -p` to test connection

**"Unknown database 'ai_bloc_truth'"**
- This is normal! The database will be created automatically on first run
- Just make sure MySQL is running and credentials are correct

### Can't sign up/login

**"Signup failed" or "Login failed"**
- Check backend terminal for error messages
- Verify database connection is working
- Check browser console (F12) for network errors
- Make sure backend is running on port 5000

---

## Project Structure

```
ai-bloc-truth-main/
├── src/                    # Frontend React code
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   └── services/          # API services
├── backend/               # Backend Python code
│   ├── app.py            # Main FastAPI application
│   ├── database.py       # Database connection
│   ├── model/            # ML model files (if you have one)
│   └── .env              # Database configuration (create this)
├── package.json          # Frontend dependencies
└── vite.config.ts        # Vite configuration
```

---

## Environment Variables

Create `backend/.env` with:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_bloc_truth
REAL_LABEL_ID=1
```

---

## Common Commands

### Start Backend
```bash
cd backend
.venv\Scripts\activate  # Windows
python app.py
```

### Start Frontend
```bash
cd ai-bloc-truth-main
npm run dev
```

### Install Frontend Dependencies
```bash
npm install
```

### Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

---

## Need Help?

1. Check the terminal output for error messages
2. Check browser console (F12 → Console tab)
3. Verify all prerequisites are installed
4. Make sure both servers are running
5. Check database connection

---

## Quick Start Checklist

- [ ] Node.js installed
- [ ] Python installed
- [ ] MySQL installed and running
- [ ] Project folder downloaded/cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created in `backend/` folder
- [ ] MySQL password set in `.env`
- [ ] Backend server running (`python app.py`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Browser opened to http://localhost:8080

---

**Good luck! 🚀**

