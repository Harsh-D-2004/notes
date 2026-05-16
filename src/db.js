require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.ENV === 'prod';

// Pick the right database URL based on the ENV variable
const dbUrl = isProduction
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_DEV;

if (!dbUrl) {
  console.error('Missing DATABASE_URL_' + (isProduction ? 'PROD' : 'DEV') + ' in .env');
  process.exit(1);
}

// Use SSL for any remote URL; skip it only for localhost
const isLocalDB = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDB ? false : { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS notes (
      id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      title      VARCHAR(500) NOT NULL,
      content    TEXT         NOT NULL,
      owner_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notes_owner ON notes(owner_id);

    CREATE TABLE IF NOT EXISTS note_shares (
      note_id              UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
      shared_with_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (note_id, shared_with_user_id)
    );
  `);

  console.log('Database ready [' + (isProduction ? 'prod' : 'dev') + ']');
}

module.exports = { pool, initDB };
