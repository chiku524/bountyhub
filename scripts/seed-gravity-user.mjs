#!/usr/bin/env node
/**
 * Seed (or reset password for) the Gravity QA test user in D1.
 *
 * Usage:
 *   npm run seed:gravity-user           # local D1 (wrangler.dev.toml)
 *   npm run seed:gravity-user -- --remote  # production D1 (requires wrangler auth)
 *
 * Credentials are printed once. Override via env:
 *   GRAVITY_TEST_EMAIL, GRAVITY_TEST_USERNAME, GRAVITY_TEST_PASSWORD
 */
import { randomBytes, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

const email = (process.env.GRAVITY_TEST_EMAIL || 'gravity-qa@bountyhub.tech').toLowerCase().trim()
const username = (process.env.GRAVITY_TEST_USERNAME || 'gravityqa').trim()
const password =
  process.env.GRAVITY_TEST_PASSWORD ||
  `Grav!ty-${randomBytes(9).toString('base64url')}`

const remote = process.argv.includes('--remote')
const config = remote ? 'wrangler.workers.toml' : 'wrangler.dev.toml'
const dbName = remote ? 'bountyhub-db' : 'bountyhub-db-dev'
// Wrangler 4 defaults to local unless --remote is passed.
const locationFlags = remote ? ['--remote'] : ['--local']

const userId = randomUUID()
const walletId = randomUUID()
const profileId = randomUUID()
const hashed = bcrypt.hashSync(password, 12)

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

const sql = `
INSERT INTO users (id, email, username, password, role, reputation_points, integrity_score, total_ratings, created_at, updated_at)
VALUES (
  ${sqlLiteral(userId)},
  ${sqlLiteral(email)},
  ${sqlLiteral(username)},
  ${sqlLiteral(hashed)},
  'user',
  0,
  5.0,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT(email) DO UPDATE SET
  password = excluded.password,
  username = excluded.username,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO virtual_wallets (id, user_id, balance, total_deposited, total_withdrawn, total_earned, total_spent, created_at, updated_at)
SELECT
  ${sqlLiteral(walletId)},
  u.id,
  0, 0, 0, 0, 0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.email = ${sqlLiteral(email)}
  AND NOT EXISTS (SELECT 1 FROM virtual_wallets vw WHERE vw.user_id = u.id);

INSERT INTO profiles (id, user_id, first_name, last_name, bio, created_at, updated_at)
SELECT
  ${sqlLiteral(profileId)},
  u.id,
  'Gravity',
  'QA',
  'Seeded account for Gravity integration testing.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.email = ${sqlLiteral(email)}
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id);
`

try {
  execFileSync(
    'npx',
    [
      'wrangler',
      'd1',
      'execute',
      dbName,
      ...locationFlags,
      '--config',
      config,
      '--command',
      sql,
    ],
    { stdio: 'inherit' },
  )
} catch (err) {
  console.error('Failed to seed Gravity test user:', err instanceof Error ? err.message : err)
  process.exit(1)
}

console.log('')
console.log('Gravity QA test user ready')
console.log('--------------------------')
console.log(`Login URL : ${remote ? 'https://bountyhub.tech/login' : 'http://localhost:5173/login'}`)
console.log(`Email     : ${email}`)
console.log(`Username  : ${username}`)
console.log(`Password  : ${password}`)
console.log(`Target DB : ${dbName} (${remote ? 'remote' : 'local'})`)
console.log('')
console.log('Sign in with email + password on the Login page.')
