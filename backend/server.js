require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const { saveScore, getUserScores, getTopScores, getNickname, setNickname } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.join(__dirname, 'locations_prod.json');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to parse JSON bodies
app.use(express.json());

let locations = [];
let selected_locations = [];

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error('locations.json does not contain an array');
      locations = [];
    } else {
      // add a stable id field so frontend can reference items
      locations = parsed.map((loc, idx) => ({ id: idx, ...loc }));
    }
  } catch (err) {
    console.error('Failed to read/parse locations.json:', err);
    locations = [];
  }
}

loadData();

// minimal CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const MAX_SCORE = 15000; // 3 levels × 5000 max points
const NICKNAME_PATTERN = /^[\p{L}\p{N} _.-]{3,20}$/u;

/**
 * Verify a Google ID token and return its payload.
 * Sends the error response itself and returns null on failure.
 */
async function verifyCredential(credential, res) {
  if (!credential) {
    res.status(400).json({ error: 'No credential provided' });
    return null;
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID is not set in environment variables');
    res.status(500).json({ error: 'Server configuration error' });
    return null;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email) {
      res.status(400).json({ error: 'Email not found in token' });
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}

// Google OAuth verification endpoint
app.post('/api/auth/google', async (req, res) => {
  const payload = await verifyCredential(req.body.credential, res);
  if (!payload) return;

  res.json({
    sub: payload.sub, // Google's unique user ID
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    email_verified: payload.email_verified,
    nickname: getNickname(payload.email),
  });
});

// Set or change the user's public nickname - requires authentication
app.post('/api/users/nickname', async (req, res) => {
  const nickname = typeof req.body.nickname === 'string' ? req.body.nickname.trim() : '';

  if (!NICKNAME_PATTERN.test(nickname)) {
    return res.status(400).json({
      error: 'Nickname must be 3-20 characters: letters, numbers, spaces, _ . -',
    });
  }

  const payload = await verifyCredential(req.body.credential, res);
  if (!payload) return;

  try {
    if (!setNickname(payload.email, nickname)) {
      return res.status(409).json({ error: 'Nickname is already taken' });
    }
    res.json({ success: true, nickname });
  } catch (error) {
    console.error('Error saving nickname:', error);
    res.status(500).json({ error: 'Failed to save nickname' });
  }
});

// Save score endpoint - requires authentication
app.post('/api/scores', async (req, res) => {
  const { score } = req.body;

  if (typeof score !== 'number' || score < 0 || score > MAX_SCORE) {
    return res.status(400).json({ error: 'Invalid score value' });
  }

  const payload = await verifyCredential(req.body.credential, res);
  if (!payload) return;

  try {
    // Save the score with hashed email
    const savedScore = saveScore(payload.email, score);

    res.json({
      success: true,
      score: {
        id: savedScore.id,
        score: savedScore.score,
        timestamp: savedScore.timestamp
      }
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Get the current user's best scores - requires authentication
app.post('/api/scores/user', async (req, res) => {
  const payload = await verifyCredential(req.body.credential, res);
  if (!payload) return;

  try {
    const limit = Math.min(parseInt(req.body.limit) || 10, 100);
    res.json({
      success: true,
      scores: getUserScores(payload.email, limit)
    });
  } catch (error) {
    console.error('Error fetching user scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Get top scores (best score per player) - public endpoint
app.get('/api/scores/top', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const topScores = getTopScores(limit);

    res.json({
      success: true,
      scores: topScores
    });
  } catch (error) {
    console.error('Error fetching top scores:', error);
    res.status(500).json({ error: 'Failed to fetch top scores' });
  }
});

// returns the number of available locations
app.get('/api/locations/count', (req, res) => {
  res.json({ count: locations.length });
});

app.get('/api/locations/random', (req, res) => {
  if (selected_locations.length === 3) {
    selected_locations = [];
  }
  let rand = Math.floor(Math.random() * locations.length);
  while (selected_locations.includes(rand)) {
    rand = Math.floor(Math.random() * locations.length);
  }
  const loc = locations.find((l) => l.id === rand);
  res.json(loc);
  selected_locations.push(rand);
});

// returns a single location by numeric id (index from file)
app.get('/api/locations/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const loc = locations.find((l) => l.id === id);
  if (!loc) return res.status(404).json({ error: 'not found' });
  res.json(loc);
});

// development helper: reloads locations.json without restarting the server
app.post('/__reload', (req, res) => {
  loadData();
  res.json({ reloaded: true, count: locations.length });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
