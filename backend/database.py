"""
MySQL Database Connection and Setup
"""
import mysql.connector
from mysql.connector import Error
import os
from typing import Optional

# Try to load from .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, use environment variables only

# Database configuration from environment variables
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "ai_bloc_truth"),
}

def get_db_connection():
    """Create and return a MySQL database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise

def init_database():
    """Initialize database tables if they don't exist"""
    try:
        # First connect without database to create it if needed
        temp_config = DB_CONFIG.copy()
        db_name = temp_config.pop("database")
        
        conn = mysql.connector.connect(**temp_config)
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.close()
        conn.close()
        
        # Now connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Create verifications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS verifications (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255),
                title VARCHAR(500),
                source VARCHAR(500),
                status ENUM('real', 'fake', 'uncertain') NOT NULL,
                confidence INT NOT NULL,
                blockchain_hash VARCHAR(255),
                credibility_score INT,
                language_pattern TEXT,
                fact_check TEXT,
                source_reliability TEXT,
                input_type ENUM('text', 'url') NOT NULL,
                input_url TEXT,
                input_snippet TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_timestamp (timestamp),
                INDEX idx_status (status)
            )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully")
        
    except Error as e:
        print(f"Error initializing database: {e}")
        raise

