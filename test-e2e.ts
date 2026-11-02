import app from './server/index';
import { db, client } from './server/db';
import { authOtps, users, bubbles, bubbleHobbies, userUnlockedTypes, userHobbies } from './server/db/schema';
import { eq } from 'drizzle-orm';

async function runE2ETests() {
  console.log('==================================================');
  console.log('🫧 Bubl Authentic System & Neon Services Verification 🫧');
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

  // Test 2: Real Atmospheric Wind & Weather Service
  console.log('2. Testing /api/weather/current (Kyoto, Japan)...');
  const weatherRes = await app.request('/api/weather/current?lat=35.0116&lon=135.7681');
  const weatherData = await weatherRes.json();
  console.log('Weather response:', weatherData);
  if (!weatherData.success || typeof weatherData.data?.windSpeedKmH !== 'number') {
    throw new Error('Weather service failed to fetch wind and conditions!');
  }
  console.log(`✓ Weather verified: ${weatherData.data.temperatureC}°C, ${weatherData.data.conditionDescription}, ${weatherData.data.windSpeedKmH} km/h wind.\n`);

  // Test 3: Auth services config
  console.log('3. Testing /api/auth/services...');
  const servicesRes = await app.request('/api/auth/services');
  const servicesData = await servicesRes.json();
  if (!servicesData.postgres.connected || !servicesData.postgres.isNeon) {
    throw new Error('Postgres service check failed!');
  }
  console.log('✓ Services status check passed!\n');

  // Test 4: Neon Auth JWKS Endpoint
  console.log('4. Testing Neon Auth JWKS URL...');
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) throw new Error('NEON_AUTH_JWKS_URL is missing in .env!');
  const jwksRes = await fetch(jwksUrl);
  const jwksData = await jwksRes.json();
  console.log(`Fetched JWKS from: ${jwksUrl}, Keys count: ${Array.isArray(jwksData.keys) ? jwksData.keys.length : 0}`);
  if (!Array.isArray(jwksData.keys) || jwksData.keys.length === 0) {
    throw new Error('Neon Auth JWKS returned empty keys array!');
  }
  console.log('✓ Neon Auth JWKS is active and reachable!\n');

  // Test 5: Mindful 3-Step Onboarding with Starter 100ml Mixture Vial
  const testEmail = `pilgrim_${Date.now()}@bubl.test`;
  console.log(`5. Testing Mindful Onboarding Flow for ${testEmail}...`);

  // Step 2: Request OTP
  const otpRes = await app.request('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const otpData = await otpRes.json();
  const code = otpData.devCode;
  console.log(`Requested OTP code: ${code}`);

  // Step 3: Complete Onboarding Profile & 100ml Vial Provisioning
  const onboardRes = await app.request('/api/auth/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code,
      nickname: 'Aoi',
      age: 27,
      pronouns: 'she/her',
      location: 'Kyoto, Japan',
      latitude: 35.0116,
      longitude: 135.7681,
      bio: 'Lover of slow tea ceremonies, analog film, and quiet conversations.',
      hobbies: ['Literature', 'Tea & Coffee', 'Film Photography'],
      exchangeInterest: 'Literature & Philosophy',
      avatar: {
        skinColor: '#F5D0C5',
        hairStyle: 'wavy',
        hairColor: '#3A2E2B',
        eyeStyle: 'calm',
        mouthStyle: 'subtle_smile',
        glassesStyle: 'round',
        clothingStyle: 'sweater',
        clothingColor: '#7A8B7B',
        bgTint: '#E8EFE9'
      }
    })
  });
  const onboardData = await onboardRes.json();
  console.log('Onboarding response:', onboardData);
  if (!onboardData.success || !onboardData.data?.token) {
    throw new Error(`Onboarding failed: ${JSON.stringify(onboardData)}`);
  }
  const sessionToken = onboardData.data.token;
  const createdUserId = onboardData.data.user.id;
  const initialVial = onboardData.data.user.mixtureVialMl;
  console.log(`User created (ID: ${createdUserId}), Starter Soap Mixture Vial: ${initialVial}ml`);
  if (initialVial !== 100) {
    throw new Error(`Expected starter vial 100ml, got ${initialVial}ml`);
  }
  console.log('✓ Mindful Onboarding & 100ml Soap Mixture Vial passed!\n');

  // Test 6: Mindful Breath Pause (+15ml Mixture)
  console.log('6. Testing Mindful Breath Pause (/api/users/breathe)...');
  const breatheRes = await app.request('/api/users/breathe', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const breatheData = await breatheRes.json();
  console.log('Breathe response:', breatheData);
  if (!breatheData.success) {
    throw new Error('Breathe pause endpoint failed!');
  }
  console.log('✓ Mindful Breath Pause passed!\n');

  // Test 7: Release Mindful Bubble (-25ml Mixture Vial deduction)
  console.log('7. Testing Bubble blowing with 25ml mixture deduction...');
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
      hobbies: ['Literature', 'Tea & Coffee']
    })
  });
  const releaseData = await releaseRes.json();
  console.log('Bubble release response:', releaseData);
  if (!releaseData.success || !releaseData.bubbleId) {
    throw new Error(`Bubble release failed: ${JSON.stringify(releaseData)}`);
  }
  const bubbleId = releaseData.bubbleId;
  console.log(`Bubble ${bubbleId} blown into airspace! Vial remaining: ${releaseData.mixtureVialMl}ml`);
  if (releaseData.mixtureVialMl > 75) {
    throw new Error(`Expected 25ml deduction from vial, remaining is ${releaseData.mixtureVialMl}ml`);
  }

  // Fetch Mine archive to ensure user can see their own published bubble
  const mineRes = await app.request('/api/bubbles/mine', {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  const mineData = await mineRes.json();
  console.log(`Retrieved ${mineData.data?.length} bubble(s) in personal archive.`);
  if (mineData.data?.length === 0) {
    throw new Error('Personal archive should contain the freshly released bubble!');
  }
  console.log('✓ Bubble blowing & Soap Mixture physics verified!\n');

  // Clean up all test data strictly
  console.log('8. Cleaning up test data in Neon Postgres...');
  if (bubbleId) {
    await db.delete(bubbleHobbies).where(eq(bubbleHobbies.bubbleId, bubbleId));
    await db.delete(bubbles).where(eq(bubbles.id, bubbleId));
  }
  if (createdUserId) {
    await db.delete(userHobbies).where(eq(userHobbies.userId, createdUserId));
    await db.delete(userUnlockedTypes).where(eq(userUnlockedTypes.userId, createdUserId));
    await db.delete(users).where(eq(users.id, createdUserId));
  }
  await db.delete(authOtps).where(eq(authOtps.email, testEmail));
  console.log('✓ Complete database test cleanup finished.\n');

  console.log('==================================================');
  console.log('🎉 ALL AUTHENTIC SERVICES VERIFIED END-TO-END! 🎉');
  console.log('==================================================');

  await client.end();
  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E Test Failure:', err);
  process.exit(1);
});
