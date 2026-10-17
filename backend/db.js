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

// Create users table to store public nicknames (user_id is the hashed email)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
 * Get the best scores for a user
 * @param {string} email - The user's email address
 * @param {number} limit - Maximum number of scores to return (default: 10)
 * @returns {Array} Array of score records
 */
function getUserScores(email, limit = 10) {
  const userId = hashEmail(email);
  const stmt = db.prepare(`
    SELECT id, score, timestamp FROM scores
    WHERE user_id = ?
    ORDER BY score DESC, timestamp ASC
    LIMIT ?
  `);
  return stmt.all(userId, limit);
}

/**
 * Get the top scores across all users, keeping only each player's best score.
 * Only users who have chosen a nickname appear on the leaderboard.
 * @param {number} limit - Maximum number of scores to return (default: 10)
 * @returns {Array} Array of { nickname, score, timestamp } records
 */
function getTopScores(limit = 10) {
  const stmt = db.prepare(`
    SELECT u.nickname, s.score, s.timestamp
    FROM scores s
    JOIN users u ON u.user_id = s.user_id
    WHERE s.id = (
      SELECT s2.id FROM scores s2
      WHERE s2.user_id = s.user_id
      ORDER BY s2.score DESC, s2.timestamp ASC
      LIMIT 1
    )
    ORDER BY s.score DESC, s.timestamp ASC
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Get a user's nickname
 * @param {string} email - The user's email address
 * @returns {string|null} The nickname, or null if not set
 */
function getNickname(email) {
  const userId = hashEmail(email);
  const row = db.prepare('SELECT nickname FROM users WHERE user_id = ?').get(userId);
  return row ? row.nickname : null;
}

/**
 * Set (or change) a user's nickname
 * @param {string} email - The user's email address
 * @param {string} nickname - The nickname to set
 * @returns {boolean} false if the nickname is already taken by another user
 */
function setNickname(email, nickname) {
  const userId = hashEmail(email);
  try {
    db.prepare(`
      INSERT INTO users (user_id, nickname) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET nickname = excluded.nickname
    `).run(userId, nickname);
    return true;
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return false;
    throw err;
  }
}

module.exports = {
  db,
  hashEmail,
  saveScore,
  getUserScores,
  getTopScores,
  getNickname,
  setNickname
};
