import sqlite3
import subprocess
import pickle
import hashlib

# SQL Injection vulnerability
def get_user(username):
    conn = sqlite3.connect("app.db")
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return conn.execute(query).fetchall()

# Command injection vulnerability  
def run_command(user_input):
    result = subprocess.call("ping " + user_input, shell=True)
    return result

# Hardcoded credentials
DATABASE_PASSWORD = "super_secret_password_123"
ADMIN_TOKEN = "admin-token-do-not-share"

# Weak hashing
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

# Insecure deserialization
def load_user_data(data):
    return pickle.loads(data)

# No input validation
def delete_file(filename):
    import os
    os.remove("/uploads/" + filename)

# Storing passwords in plaintext
def register_user(username, password):
    conn = sqlite3.connect("app.db")
    conn.execute(f"INSERT INTO users VALUES ('{username}', '{password}')")
    conn.commit()