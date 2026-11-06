import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db, checkDatabaseConnection } from '../db';
import { users, userHobbies, userUnlockedTypes, authOtps, bubbles, bubbleHobbies, NEUTRAL_AVATAR } from '../db/schema';
import { eq, and, gt, sql, or } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../services/authService';
import { sendOtpEmail } from '../services/emailService';
import { UserProfile, BubbleType } from '../../shared/types';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const authRoutes = new Hono();

// In-memory token session cache for fast stateless / mobile verification
export const activeSessions = new Map<string, string>(); // token -> userId

// Neon Auth JWKS setup
const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
const neonJwks = jwksUrl ? createRemoteJWKSet(new URL(jwksUrl)) : null;

export async function verifyNeonAuthJwt(token: string): Promise<{ sub?: string; email?: string } | null> {
  if (!neonJwks) return null;
  try {
    const { payload } = await jwtVerify(token, neonJwks);
    return {
      sub: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(c: any): string | null {
  // 1. Check Bearer token in Authorization header (Mobile / React Native ready)
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (activeSessions.has(token)) {
      return activeSessions.get(token)!;
    }
  }

  // 2. Check Cookie
  const cookieHeader = c.req.header('Cookie') || '';
  const match = cookieHeader.match(/bubl_session=([^;]+)/);
  if (match && activeSessions.has(match[1])) {
    return activeSessions.get(match[1])!;
  }

  return null;
}

export async function buildUserProfile(u: typeof users.$inferSelect): Promise<UserProfile> {
  const hobbiesRecords = await db.select().from(userHobbies).where(eq(userHobbies.userId, u.id));
  const typesRecords = await db.select().from(userUnlockedTypes).where(eq(userUnlockedTypes.userId, u.id));
  return {
    id: u.id,
    email: u.email || undefined,
    nickname: u.nickname,
    dob: u.dob || undefined,
    age: u.age,
    pronouns: u.pronouns,
    location: u.location,
    latitude: u.latitude || undefined,
    longitude: u.longitude || undefined,
    bio: u.bio,
    languages: (u.languages as string[]) || ['English'],
    exchangeInterest: u.exchangeInterest,
    avatar: u.avatar,
    hobbies: hobbiesRecords.map((h) => h.hobby),
    unlockedBubbleTypes: (typesRecords.map((t) => t.bubbleType) as BubbleType[]) || ['thought', 'echo'],
    lastBubblePublishedAt: u.lastBubblePublishedAt,
    dailyBurstsRemaining: u.dailyBurstsRemaining,
    dailyBurstsResetDate: u.dailyBurstsResetDate,
    burstBubbleIdsToday: [],
    breathLevel: u.breathLevel,
    breathExp: u.breathExp,
    dailyBreathEnergy: u.dailyBreathEnergy,
    mixtureVialMl: u.mixtureVialMl,
    lastDewRefillDate: u.lastDewRefillDate || undefined,
    moderationWarningsCount: u.moderationWarningsCount,
    suspendedUntil: u.suspendedUntil,
    moderationWarningsHistory: []
  };
}

// Return Neon & Auth services configuration status
authRoutes.get('/services', async (c) => {
  const isDbConnected = await checkDatabaseConnection();
  return c.json({
    postgres: {
      connected: isDbConnected,
      branch: process.env.NEON_BRANCH || 'production',
      isNeon: Boolean(process.env.DATABASE_URL?.includes('neon.tech'))
    },
    auth: {
      provider: 'Neon Auth',
      configured: Boolean(process.env.NEON_AUTH_BASE_URL),
      baseUrl: process.env.NEON_AUTH_BASE_URL || null,
      jwksUrl: process.env.NEON_AUTH_JWKS_URL || null
    }
  });
});

// 1. Password Login (Accepts Identifier = Username or Email)
const LoginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'Password is required')
});

authRoutes.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { identifier, email, password } = c.req.valid('json');
  const targetId = (identifier || email || '').trim().toLowerCase();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: false, error: 'Database service is currently unreachable.' }, 503);
  }

  if (!targetId) {
    return c.json({ success: false, error: 'Please enter your username or email address.' }, 400);
  }

  try {
    const userRecords = await db
      .select()
      .from(users)
      .where(
        sql`lower(${users.email}) = ${targetId} OR lower(${users.nickname}) = ${targetId}`
      );

    if (userRecords.length === 0) {
      return c.json({ success: false, error: 'No account found with this ID (Username or Email). Please create an account.' }, 404);
    }

    const u = userRecords[0];
    if (!u.passwordHash) {
      return c.json({ success: false, error: 'Password not set for this account. Please sign in via verification code.' }, 400);
    }

    const passwordValid = verifyPassword(password, u.passwordHash);
    if (!passwordValid) {
      return c.json({ success: false, error: 'Incorrect password. Please try again or sign in with email code.' }, 401);
    }

    // Generate Session
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeSessions.set(token, u.id);

    c.header(
      'Set-Cookie',
      `bubl_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    const profile = await buildUserProfile(u);
    return c.json({
      success: true,
      data: {
        token,
        user: profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'An unexpected error occurred during login.' }, 500);
  }
});

// Google Instant Sign-In / Register
const GoogleAuthSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  googleId: z.string().optional(),
  picture: z.string().optional()
});

authRoutes.post('/google', zValidator('json', GoogleAuthSchema), async (c) => {
  const { email, name } = c.req.valid('json');
  const normalizedEmail = email.toLowerCase().trim();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: false, error: 'Database service is currently unreachable.' }, 503);
  }

  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail));
    let userId: string;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      // Auto-register new Google user with standard clean defaults
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const todayStr = new Date().toISOString().split('T')[0];
      const nickname = (name || normalizedEmail.split('@')[0]).trim().slice(0, 30);

      await db.insert(users).values({
        id: userId,
        email: normalizedEmail,
        nickname: nickname || 'Traveler',
        age: 24,
        pronouns: 'they/them',
        location: 'Local Airspace',
        bio: '',
        languages: ['English'],
        exchangeInterest: 'Quiet Conversations',
        avatar: NEUTRAL_AVATAR,
        breathLevel: 1,
        breathExp: 0,
        dailyBreathEnergy: 100,
        mixtureVialMl: 100,
        lastDewRefillDate: todayStr,
        dailyBurstsRemaining: 3,
        dailyBurstsResetDate: todayStr,
        moderationWarningsCount: 0,
        suspendedUntil: null
      });

      await db.insert(userUnlockedTypes).values([
        { id: `ut_${userId}_thought`, userId, bubbleType: 'thought' },
        { id: `ut_${userId}_echo`, userId, bubbleType: 'echo' }
      ]);
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeSessions.set(token, userId);

    c.header(
      'Set-Cookie',
      `bubl_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    const userRecords = await db.select().from(users).where(eq(users.id, userId));
    const profile = await buildUserProfile(userRecords[0]);

    return c.json({
      success: true,
      data: {
        token,
        user: profile
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return c.json({ success: false, error: 'Google authentication failed.' }, 500);
  }
});

// Simple Direct Registration (Username + Email + Password + OTP code)
const SimpleRegisterSchema = z.object({
  nickname: z.string().min(2, 'Username must be at least 2 characters').max(30),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  code: z.string().min(4).max(8),
  dob: z.string().optional()
});

authRoutes.post('/register-simple', zValidator('json', SimpleRegisterSchema), async (c) => {
  const { nickname, email, password, code, dob } = c.req.valid('json');
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedNickname = nickname.trim();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: false, error: 'Database service is currently unreachable.' }, 503);
  }

  try {
    // 1. Verify OTP code
    const otpRecords = await db
      .select()
      .from(authOtps)
      .where(
        and(
          eq(authOtps.email, normalizedEmail),
          eq(authOtps.code, code.trim()),
          gt(authOtps.expiresAt, new Date())
        )
      );

    if (otpRecords.length === 0) {
      return c.json({ success: false, error: 'Invalid or expired verification code. Please check your email.' }, 400);
    }

    // 2. Check if email or username is already taken
    const existingEmail = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existingEmail.length > 0) {
      return c.json({ success: false, error: 'An account with this email already exists. Please sign in.' }, 409);
    }

    const existingNickname = await db
      .select()
      .from(users)
      .where(sql`lower(${users.nickname}) = ${trimmedNickname.toLowerCase()}`);
    if (existingNickname.length > 0) {
      return c.json({ success: false, error: 'This username is already taken. Please choose another.' }, 409);
    }

    // 3. Mark OTP as used
    await db.update(authOtps).set({ usedAt: new Date() }).where(eq(authOtps.id, otpRecords[0].id));

    // 4. Hash password
    const passwordHash = hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // Standard initial defaults: Level 1 breath, 0 XP, 100ml vial, standard clean profile
    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      nickname: trimmedNickname,
      dob: dob || null,
      age: 24,
      pronouns: 'they/them',
      location: 'Local Airspace',
      bio: '',
      languages: ['English'],
      exchangeInterest: 'Quiet Conversations',
      avatar: NEUTRAL_AVATAR,
      breathLevel: 1,
      breathExp: 0,
      dailyBreathEnergy: 100,
      mixtureVialMl: 100,
      lastDewRefillDate: todayStr,
      dailyBurstsRemaining: 3,
      dailyBurstsResetDate: todayStr,
      moderationWarningsCount: 0,
      suspendedUntil: null
    });

    // Default unlocked bubble types
    await db.insert(userUnlockedTypes).values([
      { id: `ut_${userId}_thought`, userId, bubbleType: 'thought' },
      { id: `ut_${userId}_echo`, userId, bubbleType: 'echo' }
    ]);

    // Establish persistent session
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeSessions.set(token, userId);

    c.header(
      'Set-Cookie',
      `bubl_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    const userRecords = await db.select().from(users).where(eq(users.id, userId));
    const profile = await buildUserProfile(userRecords[0]);

    return c.json({
      success: true,
      data: {
        token,
        user: profile
      }
    });
  } catch (error) {
    console.error('Simple registration error:', error);
    return c.json({ success: false, error: 'Registration failed. Please try again.' }, 500);
  }
});

// 2. Request OTP Code (for Login or Signup)
const RequestOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['login', 'signup']).default('signup')
});

authRoutes.post('/otp/request', zValidator('json', RequestOtpSchema), async (c) => {
  const { email, purpose } = c.req.valid('json');
  const normalizedEmail = email.toLowerCase().trim();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: false, error: 'Database is currently offline.' }, 503);
  }

  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail));

    if (purpose === 'login' && existingUsers.length === 0) {
      return c.json({ success: false, error: 'No account found with this email. Please begin your journey to create one.' }, 404);
    }

    if (purpose === 'signup' && existingUsers.length > 0) {
      return c.json({ success: false, error: 'An account with this email already exists. Please sign in.' }, 409);
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.insert(authOtps).values({
      id: `otp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      code,
      expiresAt
    });

    // Send real email via Resend
    const sendResult = await sendOtpEmail(normalizedEmail, code, purpose);
    if (!sendResult.success) {
      console.warn(`[Resend Notice] Could not deliver email to ${normalizedEmail}: ${sendResult.error}`);
    }

    return c.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}.`,
      // Expose code in development/test runner only for automated verification
      ...(process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? { testCode: code } : {})
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return c.json({ success: false, error: 'Failed to dispatch verification code.' }, 500);
  }
});

// 3. Verify OTP for Returning User Login (Passwordless)
const VerifyLoginOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8)
});

authRoutes.post('/otp/verify-login', zValidator('json', VerifyLoginOtpSchema), async (c) => {
  const { email, code } = c.req.valid('json');
  const normalizedEmail = email.toLowerCase().trim();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: false, error: 'Database is offline.' }, 503);
  }

  try {
    const otpRecords = await db
      .select()
      .from(authOtps)
      .where(
        and(
          eq(authOtps.email, normalizedEmail),
          eq(authOtps.code, code.trim()),
          gt(authOtps.expiresAt, new Date())
        )
      );

    if (otpRecords.length === 0) {
      return c.json({ success: false, error: 'Invalid or expired verification code.' }, 400);
    }

    const userRecords = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (userRecords.length === 0) {
      return c.json({ success: false, error: 'User profile not found. Please complete registration.' }, 404);
    }

    // Mark OTP as used
    await db.update(authOtps).set({ usedAt: new Date() }).where(eq(authOtps.id, otpRecords[0].id));

    const u = userRecords[0];
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeSessions.set(token, u.id);

    c.header(
      'Set-Cookie',
      `bubl_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    const profile = await buildUserProfile(u);
    return c.json({
      success: true,
      data: {
        token,
        user: profile
      }
    });
  } catch (error) {
    console.error('Verify login error:', error);
    return c.json({ success: false, error: 'Verification failed.' }, 500);
  }
});

// 4. Complete 6-Step Mindful Onboarding Registration
const OnboardSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nickname: z.string().min(2, 'Name must be at least 2 characters').max(40),
  dob: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(18, 'Must be 18 years or older').max(120),
  pronouns: z.string().default('they/them'),
  location: z.string().min(2, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bio: z.string().max(500).default(''),
  languages: z.array(z.string()).min(1).default(['English']),
  exchangeInterest: z.string().max(200).default(''),
  hobbies: z.array(z.string()).min(3, 'Select at least 3 hobbies').max(8),
  avatar: z.any(),
  firstBubble: z.object({
    title: z.string().min(1).max(120),
    content: z.string().min(1).max(2000),
    bubbleType: z.string().default('thought'),
    bubbleColor: z.string().default('#8D7B68')
  }).optional()
});

authRoutes.post('/onboard', zValidator('json', OnboardSchema), async (c) => {
  const data = c.req.valid('json');
  const normalizedEmail = data.email.toLowerCase().trim();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: false, error: 'Database service is currently unreachable.' }, 503);
  }

  try {
    // 1. Verify OTP code
    const otpRecords = await db
      .select()
      .from(authOtps)
      .where(
        and(
          eq(authOtps.email, normalizedEmail),
          eq(authOtps.code, data.code.trim()),
          gt(authOtps.expiresAt, new Date())
        )
      );

    if (otpRecords.length === 0) {
      return c.json({ success: false, error: 'Invalid or expired verification code.' }, 400);
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing.length > 0) {
      return c.json({ success: false, error: 'An account with this email is already registered.' }, 409);
    }

    // Mark OTP used
    await db.update(authOtps).set({ usedAt: new Date() }).where(eq(authOtps.id, otpRecords[0].id));

    // 2. Hash password
    const passwordHash = hashPassword(data.password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // 3. User begins at Level 1, 0 XP, 100ml vial - 25ml for first bubble = 75ml
    const initialVial = data.firstBubble ? 75 : 100;
    const initialExp = data.firstBubble ? 25 : 0; // Award 25 XP for blowing debut bubble

    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      nickname: data.nickname.trim(),
      dob: data.dob,
      age: data.age,
      pronouns: data.pronouns.trim() || 'they/them',
      location: data.location.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      bio: data.bio.trim(),
      languages: data.languages,
      exchangeInterest: data.exchangeInterest.trim(),
      avatar: data.avatar,
      breathLevel: 1,
      breathExp: initialExp,
      dailyBreathEnergy: 100,
      mixtureVialMl: initialVial,
      lastDewRefillDate: todayStr,
      dailyBurstsRemaining: 3,
      dailyBurstsResetDate: todayStr,
      lastBubblePublishedAt: data.firstBubble ? Date.now() : null,
      moderationWarningsCount: 0,
      suspendedUntil: null
    });

    // 4. Insert user hobbies
    for (const h of data.hobbies) {
      await db.insert(userHobbies).values({
        id: `uh_${userId}_${h.replace(/\s+/g, '_')}`,
        userId,
        hobby: h
      });
    }

    // 5. Insert starter unlocked bubble types
    await db.insert(userUnlockedTypes).values([
      { id: `ut_${userId}_thought`, userId, bubbleType: 'thought' },
      { id: `ut_${userId}_echo`, userId, bubbleType: 'echo' }
    ]);

    // 6. If first debut bubble was blown during ritual, publish it to airspace
    let debutBubbleId: string | null = null;
    if (data.firstBubble) {
      debutBubbleId = `bubble_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(bubbles).values({
        id: debutBubbleId,
        authorId: userId,
        title: data.firstBubble.title,
        content: data.firstBubble.content,
        bubbleType: data.firstBubble.bubbleType,
        bubbleColor: data.firstBubble.bubbleColor,
        breathEffort: 'balanced',
        mixtureEssence: 'Starter Solution',
        latitude: data.latitude,
        longitude: data.longitude,
        isUserBubble: true,
        moderationStatus: 'clean',
        distanceKm: 0
      });

      // Tag with user's top hobbies
      for (const h of data.hobbies.slice(0, 3)) {
        await db.insert(bubbleHobbies).values({
          id: `bh_${debutBubbleId}_${h.replace(/\s+/g, '_')}`,
          bubbleId: debutBubbleId,
          hobby: h
        });
      }
    }

    // 7. Establish session
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    activeSessions.set(token, userId);

    c.header(
      'Set-Cookie',
      `bubl_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    );

    const userRecords = await db.select().from(users).where(eq(users.id, userId));
    const profile = await buildUserProfile(userRecords[0]);

    return c.json({
      success: true,
      data: {
        token,
        user: profile,
        debutBubbleId
      }
    });
  } catch (error) {
    console.error('Onboard registration error:', error);
    return c.json({ success: false, error: 'Registration failed. Please try again.' }, 500);
  }
});

// 5. Logout
authRoutes.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (token && activeSessions.has(token)) {
    activeSessions.delete(token);
  }
  const cookieHeader = c.req.header('Cookie') || '';
  const match = cookieHeader.match(/bubl_session=([^;]+)/);
  if (match && activeSessions.has(match[1])) {
    activeSessions.delete(match[1]);
  }

  c.header('Set-Cookie', 'bubl_session=; Path=/; HttpOnly; Max-Age=0');
  return c.json({ success: true, message: 'Logged out peacefully.' });
});
