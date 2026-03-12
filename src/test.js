const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Hardcoded credentials
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SuperSecret123!',
  database: 'app_db',
});
const JWT_SECRET = "hardcoded-secret-abc123";

db.connect();

// SQL injection + stack trace leak
app.get('/users/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err }); // leaks stack trace
    res.json(results);
  });
});

// XSS
app.get('/greet', (req, res) => {
  res.send(`<h1>Hello, ${req.query.name}!</h1>`);
});

// Missing await + no try/catch
async function fetchUser(id) {
  const response = axios.get(`https://api.example.com/users/${id}`); // missing await
  return response.data; // undefined
}
app.get('/profile/:id', async (req, res) => {
  const user = await fetchUser(req.params.id); // unhandled rejection = server crash
  res.json(user);
});

// Off-by-one + wrong operator
function getTopN(users, n) {
  const sorted = users.sort((a, b) => b.score - a.score);
  const result = [];
  for (let i = 0; i <= n; i++) { // should be i < n
    result.push(sorted[i]);
  }
  return result;
}

function isEligible(user) {
  return user.isPremium & user.orders > 5; // & not &&
}

// Null dereference + double response
app.post('/orders', (req, res) => {
  const userId = req.body.user.id; // crashes if user is null
  db.query(`INSERT INTO orders SET ?`, { userId }, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed' });
      // missing return — sends response twice
    }
    res.json({ success: true });
  });
});

// Race condition
let seats = 10;
app.post('/book', async (req, res) => {
  if (seats <= 0) return res.status(400).json({ error: 'Sold out' });
  await new Promise(r => setTimeout(r, 5)); // race window
  seats--;
  res.json({ seatsLeft: seats });
});

// Memory leak + N+1 query
const logs = [];
app.use((req, res, next) => { logs.push(req.path); next(); }); // grows forever

app.get('/orders', async (req, res) => {
  const orders = await dbQuery('SELECT * FROM orders'); // no LIMIT
  for (const order of orders) {
    order.user = await dbQuery(`SELECT * FROM users WHERE id = ${order.user_id}`); // N+1 + sqli
  }
  res.json(orders);
});

// Weak crypto + swallowed error
function hashPassword(pw) {
  return crypto.createHash('md5').update(pw).digest('hex'); // md5, no salt
}

async function saveUser(user) {
  try {
    await dbQuery('INSERT INTO users SET ?', user);
  } catch (e) {
    // swallowed
  }
}

// Wrong status codes
app.post('/login', (req, res) => {
  if (!req.body.password) return res.status(200).json({ error: 'Missing' }); // should be 400
  if (req.body.password !== 'admin') return res.status(403).json({ error: 'Wrong' }); // should be 401
  res.json({ token: JWT_SECRET }); // returning the secret!
});

// forEach + async = fire and forget
async function notifyAll(users) {
  users.forEach(async (u) => {
    await sendEmail(u.email); // not awaited by forEach
  });
  console.log('done'); // logs before emails send
}

// Unreachable code
function getShipping(weight) {
  if (weight > 10) {
    return 25;
    console.log('heavy'); // unreachable
  }
  return 5;
}

app.listen(3000, '0.0.0.0'); // hardcoded port, exposed on all interfaces

function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}