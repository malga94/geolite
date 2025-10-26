const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.join(__dirname, 'locations.json');

let locations = [];

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// returns the number of available locations
app.get('/api/locations/count', (req, res) => {
  res.json({ count: locations.length });
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
