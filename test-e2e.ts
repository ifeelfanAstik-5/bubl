import app from './server/index';
import { db, client } from './server/db';
import { authOtps, users, bubbles, bubbleHobbies, userUnlockedTypes } from './server/db/schema';
import { eq } from 'drizzle-orm';

async function runE2ETests() {
  console.log('==================================================');
  console.log('🫧 Bubl End-to-End Neon Services Verification 🫧');
  console.log('==================================================\n');

  // Test 1: Health check
  console.log('1. Testing /api/health...');
  const healthRes = await app.request('/api/health');
  const healthData = await healthRes.json();
  console.log('Status code:', healthRes.status);
  console.log('Response:', JSON.stringify(healthData, null, 2));
  if (healthData.database.status !== 'connected' || healthData.database.provider !== 'Neon Postgres') {
    throw new Error('Health check failed: Neon Postgres not connected!');
  }
  console.log('✓ Health check passed!\n');

  // Test 2: Auth services config
  console.log('2. Testing /api/auth/services...');
  const servicesRes = await app.request('/api/auth/services');
  const servicesData = await servicesRes.json();
  console.log('Status code:', servicesRes.status);
  console.log('Response:', JSON.stringify(servicesData, null, 2));
  if (!servicesData.postgres.connected || !servicesData.postgres.isNeon) {
    throw new Error('Postgres service check failed!');
  }
  console.log('✓ Services status check passed!\n');

  // Test 3: Neon Auth JWKS Endpoint
  console.log('3. Testing Neon Auth JWKS URL...');
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) throw new Error('NEON_AUTH_JWKS_URL is missing in .env!');
  const jwksRes = await fetch(jwksUrl);
  const jwksData = await jwksRes.json();
  console.log(`Fetched JWKS from: ${jwksUrl}`);
  console.log('Keys count:', Array.isArray(jwksData.keys) ? jwksData.keys.length : 0);
  if (!Array.isArray(jwksData.keys) || jwksData.keys.length === 0) {
    throw new Error('Neon Auth JWKS returned empty keys array!');
  }
  console.log('✓ Neon Auth JWKS is active and reachable!\n');

  // Test 4: Neon Postgres Writes and Reads via OTP & User Lifecycle
  const testEmail = `tester_${Date.now()}@bubl.test`;
  console.log(`4. Testing OTP Request with email: ${testEmail}...`);
  const otpReqRes = await app.request('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const otpReqData = await otpReqRes.json();
  console.log('OTP Request response:', otpReqData);
  const code = otpReqData.devCode;

  // Verify OTP record exists directly in Neon Postgres table
  const dbOtps = await db.select().from(authOtps).where(eq(authOtps.email, testEmail));
  console.log(`Neon Postgres 'auth_otps' query found ${dbOtps.length} record(s). Code matches:`, dbOtps[0]?.code === code);
  if (dbOtps.length === 0 || dbOtps[0].code !== code) {
    throw new Error('OTP was not persisted in Neon Postgres auth_otps table!');
  }

  // Verify OTP and create user
  console.log('Verifying OTP...');
  const verifyRes = await app.request('/api/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code })
  });
  const verifyData = await verifyRes.json();
  console.log('Verification response user:', verifyData.data?.user?.email);
  const sessionToken = verifyData.data?.token;

  // Verify user record exists in Neon Postgres 'users' table
  const dbUsers = await db.select().from(users).where(eq(users.email, testEmail));
  console.log(`Neon Postgres 'users' query found ${dbUsers.length} user record(s):`, dbUsers[0]?.nickname);
  if (dbUsers.length === 0) {
    throw new Error('User was not created in Neon Postgres users table!');
  }
  console.log('✓ Neon Auth & Postgres user creation cycle passed!\n');

  // Test 5: Mindful Bubble Creation and Archive Retrieval in Neon
  console.log('5. Testing Mindful Bubble release into Neon Postgres...');
  const releaseRes = await app.request('/api/bubbles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({
      title: 'Morning Solitude and Warm Tea',
      content: 'The best conversations are the ones that take time to breathe quietly before speaking.',
      bubbleType: 'thought',
      bubbleColor: '#8D7B68',
      breathEffort: 'balanced',
      hobbies: ['Reading', 'Tea & Coffee']
    })
  });
  const releaseData = await releaseRes.json();
  console.log('Bubble release response:', releaseData);
  const bubbleId = releaseData.bubbleId;

  // Query Neon Postgres 'bubbles' table directly
  const dbBubbles = await db.select().from(bubbles).where(eq(bubbles.id, bubbleId));
  console.log(`Neon Postgres 'bubbles' query found record:`, dbBubbles[0]?.title);
  if (dbBubbles.length === 0) {
    throw new Error('Bubble was not saved to Neon Postgres!');
  }

  // Fetch Mine archive
  const mineRes = await app.request('/api/bubbles/mine', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const mineData = await mineRes.json();
  console.log(`Retrieved ${mineData.data?.length} bubbles in user archive from Neon Postgres.`);
  console.log('✓ Mindful bubble lifecycle in Neon Postgres passed!\n');

  // Clean up test data
  console.log('Cleaning up test data in Neon Postgres...');
  if (bubbleId) {
    await db.delete(bubbleHobbies).where(eq(bubbleHobbies.bubbleId, bubbleId));
    await db.delete(bubbles).where(eq(bubbles.id, bubbleId));
  }
  const testUserRecords = await db.select().from(users).where(eq(users.email, testEmail));
  if (testUserRecords.length > 0) {
    await db.delete(userUnlockedTypes).where(eq(userUnlockedTypes.userId, testUserRecords[0].id));
    await db.delete(users).where(eq(users.id, testUserRecords[0].id));
  }
  await db.delete(authOtps).where(eq(authOtps.email, testEmail));
  console.log('✓ Cleanup complete.\n');

  console.log('==================================================');
  console.log('🎉 ALL NEON SERVICES VERIFIED END-TO-END! 🎉');
  console.log('==================================================');

  await client.end();
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Failure:', err);
  process.exit(1);
});
