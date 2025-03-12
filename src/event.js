
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

const eventsFilePath = path.join(__dirname, '../data/events.json');
const users = [];

// User Authentication
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ username });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

// Middleware for authentication
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, 'secretkey');
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// Event APIs
app.get('/events', auth, (req, res) => {
  const events = JSON.parse(fs.readFileSync(eventsFilePath));
  const userEvents = events.filter(e => e.user === req.user.username);
  res.json(userEvents);
});

app.post('/events', auth, (req, res) => {
  const events = JSON.parse(fs.readFileSync(eventsFilePath));
  const event = { id: Date.now(), user: req.user.username, ...req.body };
  events.push(event);
  fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
  res.status(201).json(event);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;