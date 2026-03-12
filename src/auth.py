import sqlite3

def login(username, password):
    conn = sqlite3.connect("users.db")
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    result = conn.execute(query)
    if result.fetchone():
        return True
    return False

def get_user_data(user_id):
    conn = sqlite3.connect("users.db")
    query = "SELECT * FROM users WHERE id = " + str(user_id)
    return conn.execute(query).fetchall()

def hash_password(password):
    import md5
    return md5.new(password).hexdigest()

SECRET_KEY = "example_secret_do_not_use"
DEBUG = True