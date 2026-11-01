import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL || 'postgres://bubl:bubl_secret_password@localhost:5432/bubl_db';

const isNeon = connectionString.includes('neon.tech');

// Create postgres query client with connection pool
const client = postgres(connectionString, {
  max: isNeon ? 20 : 10,
  idle_timeout: 20,
  connect_timeout: 15,
  ssl: isNeon ? 'require' : undefined,
  onnotice: () => {} // quiet notices
});

export const db = drizzle(client, { schema });
export { client };

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}
