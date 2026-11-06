import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is missing!');
  process.exit(1);
}

const client = postgres(connectionString, {
  max: 1,
  ssl: 'require',
  connect_timeout: 10
});

async function main() {
  console.log('Applying database schema additions to Neon...');
  await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;`;
  await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS dob text;`;
  await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS languages jsonb NOT NULL DEFAULT '["English"]';`;
  console.log('✓ Columns password_hash, dob, languages verified in users table.');
  await client.end({ timeout: 2 });
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
