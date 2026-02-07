require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

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

// Google OAuth verification endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'No credential provided' });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Verify the token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extract user information
    const user = {
      sub: payload.sub, // Google's unique user ID
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };

    // Here you could:
    // 1. Save user to database
    // 2. Create a session
    // 3. Generate your own JWT token
    // For now, we just return the verified user info

    res.json(user);
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({ error: 'Invalid token' });
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
