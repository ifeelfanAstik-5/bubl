import app from './server/index';
import { db, client } from './server/db';
import { authOtps, users, bubbles, bubbleHobbies, userUnlockedTypes, userHobbies } from './server/db/schema';
import { eq } from 'drizzle-orm';

async function runE2ETests() {
  console.log('================================================================');
  console.log('🫧 Bubl Authentic Auth & Blank-Slate Onboarding Verification 🫧');
  console.log('================================================================\n');

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

  // Test 2: Real Atmospheric Wind & Weather Service
  console.log('2. Testing /api/weather/current (Edinburgh, Scotland)...');
  const weatherRes = await app.request('/api/weather/current?lat=55.9533&lon=-3.1883');
  const weatherData = await weatherRes.json();
  console.log('Weather response:', weatherData);
  if (!weatherData.success || typeof weatherData.data?.windSpeedKmH !== 'number') {
    throw new Error('Weather service failed to fetch wind and conditions!');
  }
  console.log(`✓ Weather verified: ${weatherData.data.temperatureC}°C, ${weatherData.data.conditionDescription}, ${weatherData.data.windSpeedKmH} km/h wind.\n`);

  // Test 3: Resend OTP Request for Sign Up
  const testEmail = `pilgrim_${Date.now()}@bubl.test`;
  console.log(`3. Testing Resend OTP Request for ${testEmail}...`);
  const otpRes = await app.request('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, purpose: 'signup' })
  });
  const otpData = await otpRes.json();
  console.log('OTP Request response:', otpData);

  // Retrieve generated code from Neon DB auth_otps
  const dbOtps = await db.select().from(authOtps).where(eq(authOtps.email, testEmail));
  if (dbOtps.length === 0) {
    throw new Error('OTP was not persisted in Neon auth_otps table!');
  }
  const code = dbOtps[0].code;
  console.log(`✓ OTP successfully generated & recorded in Neon: ${code}\n`);

  // Test 4: Blank-Slate 6-Step Onboarding with Custom DOB, Bio, Avatar & Debut Bubble
  console.log('4. Testing Blank-Slate Onboarding (POST /api/auth/onboard)...');
  const testPassword = 'QuietSoul#2026';
  const onboardRes = await app.request('/api/auth/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code,
      password: testPassword,
      nickname: 'Kaito',
      dob: '1998-04-12',
      age: 28,
      pronouns: 'he/they',
      location: 'Edinburgh, Scotland',
      latitude: 55.9533,
      longitude: -3.1883,
      bio: 'Collector of antique compasses, rainy afternoon tea drinker, and analog journal keeper.',
      languages: ['English', 'Gaelic'],
      exchangeInterest: 'Antique Crafts & Highland Weather',
      hobbies: ['Literature', 'Coffee Brewing', 'Stargazing', 'Old Bookstores'],
      avatar: {
        skinColor: '#F5D0C5',
        hairStyle: 'classic',
        hairColor: '#4A3E3D',
        eyeStyle: 'calm',
        mouthStyle: 'calm',
        glassesStyle: 'round',
        clothingStyle: 'cardigan',
        clothingColor: '#4D7C9E',
        bgTint: '#EDF3F7'
      },
      firstBubble: {
        title: 'Morning Rain over the Old Stone Spires',
        content: 'There is a quiet patience in listening to cold rain tap against vintage windowpanes before writing a letter.',
        bubbleType: 'thought',
        bubbleColor: '#4D7C9E'
      }
    })
  });

  const onboardData = await onboardRes.json();
  console.log('Onboarding response:', onboardData);
  if (!onboardData.success || !onboardData.data?.token) {
    throw new Error(`Onboarding failed: ${JSON.stringify(onboardData)}`);
  }

  const sessionToken = onboardData.data.token;
  const user = onboardData.data.user;
  const debutBubbleId = onboardData.data.debutBubbleId;

  console.log(`User created: ${user.nickname} (${user.location}), DOB: ${user.dob}, Age: ${user.age}`);
  console.log(`Mixture Vial: ${user.mixtureVialMl}ml / 100ml (-25ml for debut bubble)`);
  console.log(`Breath Level: ${user.breathLevel}, Exp: ${user.breathExp} XP`);

  // Assertions
  if (user.nickname !== 'Kaito') throw new Error(`Expected nickname 'Kaito', got '${user.nickname}'`);
  if (user.dob !== '1998-04-12') throw new Error(`Expected dob '1998-04-12', got '${user.dob}'`);
  if (user.age !== 28) throw new Error(`Expected age 28, got ${user.age}`);
  if (user.breathLevel !== 1) throw new Error(`Expected Breath Level 1, got ${user.breathLevel}`);
  if (user.mixtureVialMl !== 75) throw new Error(`Expected 75ml vial remaining, got ${user.mixtureVialMl}ml`);
  if (!user.languages.includes('Gaelic')) throw new Error(`Expected languages to contain 'Gaelic', got ${user.languages}`);

  console.log('✓ Blank-slate user creation & debut bubble ritual passed!\n');

  // Test 5: Verify debut bubble in personal archive
  console.log('5. Verifying debut bubble in personal airspace archive...');
  const mineRes = await app.request('/api/bubbles/mine', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const mineData = await mineRes.json();
  console.log(`User archive has ${mineData.data?.length} bubble(s): "${mineData.data?.[0]?.title}"`);
  if (mineData.data?.length === 0 || mineData.data?.[0]?.id !== debutBubbleId) {
    throw new Error('Debut bubble was not found in personal archive!');
  }
  console.log('✓ Debut bubble archive verified!\n');

  // Test 6: Sign In with Password (Returning User Flow)
  console.log('6. Testing Password Sign In (POST /api/auth/login)...');
  const loginRes = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  const loginData = await loginRes.json();
  console.log('Login response user:', loginData.data?.user?.nickname);
  if (!loginData.success || !loginData.data?.token || loginData.data?.user?.id !== user.id) {
    throw new Error('Password login failed for valid credentials!');
  }
  console.log('✓ Valid password login passed!\n');

  // Test 7: Reject Invalid Password
  console.log('7. Testing Wrong Password Rejection...');
  const badLoginRes = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999' })
  });
  const badLoginData = await badLoginRes.json();
  console.log('Bad login response (expected 401):', badLoginRes.status, badLoginData.error);
  if (badLoginRes.status !== 401 || badLoginData.success) {
    throw new Error('Server accepted incorrect password!');
  }
  console.log('✓ Wrong password correctly rejected with 401!\n');

  // Test 8: Returning User Sign In via Email OTP (Passwordless Login Flow)
  console.log('8. Testing Passwordless Email OTP Login...');
  const loginOtpReqRes = await app.request('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, purpose: 'login' })
  });
  const loginOtpReqData = await loginOtpReqRes.json();
  if (!loginOtpReqData.success) {
    throw new Error(`Login OTP request failed: ${loginOtpReqData.error}`);
  }

  const latestOtps = await db
    .select()
    .from(authOtps)
    .where(eq(authOtps.email, testEmail));
  const loginCode = latestOtps[latestOtps.length - 1].code;

  const verifyLoginRes = await app.request('/api/auth/otp/verify-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code: loginCode })
  });
  const verifyLoginData = await verifyLoginRes.json();
  console.log('OTP Login response user:', verifyLoginData.data?.user?.nickname);
  if (!verifyLoginData.success || verifyLoginData.data?.user?.id !== user.id) {
    throw new Error('OTP login failed for returning user!');
  }
  console.log('✓ Passwordless OTP login passed!\n');

  // Clean up all test data strictly from Neon PostgreSQL
  console.log('9. Cleaning up test data in Neon Postgres...');
  if (debutBubbleId) {
    await db.delete(bubbleHobbies).where(eq(bubbleHobbies.bubbleId, debutBubbleId));
    await db.delete(bubbles).where(eq(bubbles.id, debutBubbleId));
  }
  if (user.id) {
    await db.delete(userHobbies).where(eq(userHobbies.userId, user.id));
    await db.delete(userUnlockedTypes).where(eq(userUnlockedTypes.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  }
  await db.delete(authOtps).where(eq(authOtps.email, testEmail));
  console.log('✓ Complete database test cleanup finished.\n');

  console.log('================================================================');
  console.log('🎉 ALL AUTHENTIC SYSTEMS & ONBOARDING VERIFIED END-TO-END! 🎉');
  console.log('================================================================');

  await client.end();
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Failure:', err);
  process.exit(1);
});
