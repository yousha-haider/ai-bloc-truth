# MySQL Database Setup

## Quick Setup

### 1. Install MySQL
If you don't have MySQL installed:
- **Windows**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
- **Mac**: `brew install mysql` or download installer
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian)

### 2. Start MySQL Server
- **Windows**: MySQL should start automatically, or use Services
- **Mac/Linux**: `sudo systemctl start mysql` or `brew services start mysql`

### 3. Set MySQL Root Password (if not set)
```bash
mysql -u root -p
# If no password, just press Enter, then:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password_here';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Create `.env` File
Create a file named `.env` in the `backend` folder with:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ai_bloc_truth
REAL_LABEL_ID=1
```

**Replace `your_mysql_password_here` with your actual MySQL root password!**

### 5. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 6. Run the Backend
```bash
python app.py
```

The database and tables will be created automatically on first run.

## Troubleshooting

### "Access denied" Error
- Make sure your MySQL password in `.env` is correct
- Verify MySQL server is running: `mysql -u root -p`
- Check if MySQL user exists and has permissions

### "Can't connect to MySQL server"
- Ensure MySQL server is running
- Check if port 3306 is correct (default MySQL port)
- Try `localhost` instead of `127.0.0.1` or vice versa

### Alternative: Use Environment Variables
Instead of `.env` file, you can set environment variables:
```bash
# Windows (Command Prompt)
set DB_PASSWORD=your_password
python app.py

# Windows (PowerShell)
$env:DB_PASSWORD="your_password"
python app.py

# Mac/Linux
export DB_PASSWORD=your_password
python app.py
```

