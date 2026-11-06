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
  console.log('Connecting to Neon PostgreSQL to purge all data...');
  await client`TRUNCATE TABLE messages, connections, bubble_hobbies, burst_logs, bubbles, moderation_warnings, user_hobbies, user_unlocked_types, auth_otps, users CASCADE;`;
  console.log('✨ All tables successfully truncated and cleaned!');
  await client.end({ timeout: 2 });
  process.exit(0);
}

main().catch((err) => {
  console.error('Truncate error:', err);
  process.exit(1);
});
