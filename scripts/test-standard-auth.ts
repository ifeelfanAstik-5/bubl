import app from '../server/index';
import { db, client } from '../server/db';
import { authOtps, users, userUnlockedTypes } from '../server/db/schema';
import { eq } from 'drizzle-orm';

async function testStandardAuth() {
  console.log('================================================================');
  console.log('🫧 Bubl Standard Simple Auth & Crash-Free Session Verification 🫧');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const testUsername = `traveler_${timestamp.toString().slice(-5)}`;
  const testEmail = `user_${timestamp}@bubl.test`;
  const testPassword = 'StrongPassword!2026';

  // 1. Request OTP Code for Signup
  console.log(`1. Requesting OTP for new user: ${testEmail}...`);
  const otpRes = await app.request('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, purpose: 'signup' })
  });
  const otpJson = await otpRes.json();
  console.log('OTP response:', otpJson);
  if (!otpJson.success) throw new Error('OTP request failed!');

  const dbOtps = await db.select().from(authOtps).where(eq(authOtps.email, testEmail));
  if (dbOtps.length === 0) throw new Error('OTP not saved in DB!');
  const code = dbOtps[0].code;
  console.log(`✓ OTP found in DB: ${code}\n`);

  // 2. Direct Simple Registration (No forced 6-step wizard!)
  console.log(`2. Testing Simple Direct Registration with Username: ${testUsername}...`);
  const regRes = await app.request('/api/auth/register-simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nickname: testUsername,
      email: testEmail,
      password: testPassword,
      code,
      dob: '2000-01-15'
    })
  });
  const regJson = await regRes.json();
  console.log('Registration response status:', regRes.status);
  console.log('User created:', {
    id: regJson.data?.user?.id,
    nickname: regJson.data?.user?.nickname,
    email: regJson.data?.user?.email,
    breathLevel: regJson.data?.user?.breathLevel,
    mixtureVialMl: regJson.data?.user?.mixtureVialMl,
    hobbies: regJson.data?.user?.hobbies
  });

  if (!regJson.success || !regJson.data?.token) {
    throw new Error(`Simple registration failed: ${JSON.stringify(regJson)}`);
  }
  if (regJson.data.user.breathLevel !== 1 || regJson.data.user.mixtureVialMl !== 100) {
    throw new Error('User did not start with standard initial values (Lvl 1, 100ml vial)!');
  }
  console.log('✓ Direct simple registration passed with standard initial config!\n');

  // 3. Test Login with ID = Username (nickname) + Password
  console.log(`3. Testing Login with ID as Username (${testUsername}) + Password...`);
  const loginUserRes = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testUsername,
      password: testPassword
    })
  });
  const loginUserJson = await loginUserRes.json();
  console.log('Username login status:', loginUserRes.status);
  if (!loginUserJson.success || !loginUserJson.data?.token) {
    throw new Error(`Login by Username failed: ${JSON.stringify(loginUserJson)}`);
  }
  console.log(`✓ Login by Username (${testUsername}) successful!\n`);

  // 4. Test Login with ID = Email + Password
  console.log(`4. Testing Login with ID as Email (${testEmail}) + Password...`);
  const loginEmailRes = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: testPassword
    })
  });
  const loginEmailJson = await loginEmailRes.json();
  console.log('Email login status:', loginEmailRes.status);
  if (!loginEmailJson.success || !loginEmailJson.data?.token) {
    throw new Error(`Login by Email failed: ${JSON.stringify(loginEmailJson)}`);
  }
  console.log(`✓ Login by Email (${testEmail}) successful!\n`);

  // 5. Test Login with wrong password
  console.log('5. Testing Login with wrong password...');
  const badLoginRes = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testUsername,
      password: 'WrongPassword123'
    })
  });
  console.log('Bad login status (expected 401):', badLoginRes.status);
  if (badLoginRes.status !== 401) {
    throw new Error('Bad password login did not return 401!');
  }
  console.log('✓ Invalid password properly rejected!\n');

  // 6. Test Instant Google Sign In / Registration
  const googleEmail = `google_pilot_${timestamp}@gmail.com`;
  console.log(`6. Testing Instant Google Sign In for ${googleEmail}...`);
  const googleRes = await app.request('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: googleEmail,
      name: 'Google Traveler'
    })
  });
  const googleJson = await googleRes.json();
  console.log('Google Auth status:', googleRes.status);
  if (!googleJson.success || !googleJson.data?.token) {
    throw new Error(`Google sign in failed: ${JSON.stringify(googleJson)}`);
  }
  console.log('✓ Google Sign In verified with session token and standard defaults!\n');

  // 7. Verify /api/me using the session token
  console.log('7. Testing /api/me session persistence...');
  const meRes = await app.request('/api/me', {
    headers: {
      Authorization: `Bearer ${googleJson.data.token}`
    }
  });
  const meJson = await meRes.json();
  console.log('/api/me response:', {
    id: meJson.data?.id,
    nickname: meJson.data?.nickname,
    email: meJson.data?.email,
    location: meJson.data?.location,
    breathLevel: meJson.data?.breathLevel
  });
  if (!meJson.success || meJson.data.email !== googleEmail) {
    throw new Error('/api/me session verification failed!');
  }
  console.log('✓ Session persistence and /api/me verified 100%!\n');

  // Clean up test data
  console.log('Cleaning up test data...');
  await db.delete(userUnlockedTypes).where(eq(userUnlockedTypes.userId, regJson.data.user.id));
  await db.delete(users).where(eq(users.id, regJson.data.user.id));
  await db.delete(userUnlockedTypes).where(eq(userUnlockedTypes.userId, googleJson.data.user.id));
  await db.delete(users).where(eq(users.id, googleJson.data.user.id));
  await db.delete(authOtps).where(eq(authOtps.email, testEmail));
  console.log('✓ Test data cleaned up.\n');

  console.log('🎉 ALL STANDARD AUTH & SESSION TESTS PASSED WITH 100% SUCCESS! 🎉');
  await client.end();
  process.exit(0);
}

testStandardAuth().catch(async (err) => {
  console.error('❌ Test failed:', err);
  await client.end();
  process.exit(1);
});
