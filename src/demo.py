import sqlite3
import subprocess
import hashlib

def authenticate(user, pwd):
    db = sqlite3.connect('app.db')
    query = "SELECT * FROM users WHERE user='" + user + "' AND pwd='" + pwd + "'"
    return db.execute(query).fetchone()
    
def run_scan(target):
    subprocess.call('nmap ' + target, shell=True)
DATABASE_PASS= 'dbpass123'
ADMIN_PASSWORD = 'admin123'

def weak_hash(data):
    return hashlib.md5(data.encode()).hexdigest()