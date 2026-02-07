const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Initialize database
const dbPath = path.join(__dirname, 'scores.db');
const db = new Database(dbPath);

// Create scores table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index on user_id for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_user_id ON scores(user_id)
`);

// Create index on timestamp for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_timestamp ON scores(timestamp DESC)
`);

/**
 * Hash an email address using SHA-256
 * @param {string} email - The email to hash
 * @returns {string} The hashed email
 */
function hashEmail(email) {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

/**
 * Save a score to the database
 * @param {string} email - The user's email address
 * @param {number} score - The score to save
 * @returns {Object} The inserted score record
 */
function saveScore(email, score) {
  const userId = hashEmail(email);
  const stmt = db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)');
  const info = stmt.run(userId, score);

  return {
    id: info.lastInsertRowid,
    user_id: userId,
    score: score,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get all scores for a user
 * @param {string} email - The user's email address
 * @returns {Array} Array of score records
 */
function getUserScores(email) {
  const userId = hashEmail(email);
  const stmt = db.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY timestamp DESC');
  return stmt.all(userId);
}

/**
 * Get the top scores across all users
 * @param {number} limit - Maximum number of scores to return (default: 10)
 * @returns {Array} Array of top score records
 */
function getTopScores(limit = 10) {
  const stmt = db.prepare('SELECT * FROM scores ORDER BY score DESC, timestamp ASC LIMIT ?');
  return stmt.all(limit);
}

module.exports = {
  db,
  hashEmail,
  saveScore,
  getUserScores,
  getTopScores
};
