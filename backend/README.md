# Backend Setup with MySQL

## Prerequisites
- Python 3.8+
- MySQL Server installed and running
- MySQL user with database creation privileges

## Installation

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure MySQL connection:**
Create a `.env` file in the `backend` directory (or set environment variables):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_bloc_truth
REAL_LABEL_ID=1
```

3. **Start MySQL server** (if not already running)

4. **Run the backend:**
```bash
python app.py
```

The database and tables will be created automatically on first run.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Signup new user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me?userId=<id>` - Get current user

### Verifications
- `POST /api/verify` - Verify news article (text or URL)
- `GET /api/verifications?userId=<id>&limit=100` - Get verification history

## Database Schema

### Users Table
- `id` (VARCHAR) - Primary key
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - Hashed password
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `role` (VARCHAR) - Default: 'user'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Verifications Table
- `id` (VARCHAR) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `title` (VARCHAR)
- `source` (VARCHAR)
- `status` (ENUM: 'real', 'fake', 'uncertain')
- `confidence` (INT)
- `blockchain_hash` (VARCHAR)
- `credibility_score` (INT)
- `language_pattern` (TEXT)
- `fact_check` (TEXT)
- `source_reliability` (TEXT)
- `input_type` (ENUM: 'text', 'url')
- `input_url` (TEXT)
- `input_snippet` (TEXT)
- `timestamp` (TIMESTAMP)

