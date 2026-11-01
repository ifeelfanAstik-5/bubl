import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db, checkDatabaseConnection } from '../db';
import { users, userHobbies, userUnlockedTypes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getUserIdFromRequest } from './auth';
import { INITIAL_USER } from '../../src/data/mockData';
import { UserProfile, BubbleType } from '../../shared/types';

export const userRoutes = new Hono();

// GET /api/me
userRoutes.get('/me', async (c) => {
  const userId = getUserIdFromRequest(c);
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: true, data: INITIAL_USER });
  }

  try {
    const userRecords = await db.select().from(users).where(eq(users.id, userId));
    if (userRecords.length === 0) {
      return c.json({ success: true, data: INITIAL_USER });
    }

    const u = userRecords[0];
    const hobbiesRecords = await db.select().from(userHobbies).where(eq(userHobbies.userId, userId));
    const typesRecords = await db.select().from(userUnlockedTypes).where(eq(userUnlockedTypes.userId, userId));

    const todayStr = new Date().toISOString().split('T')[0];
    let dailyBurstsRemaining = u.dailyBurstsRemaining;
    if (u.dailyBurstsResetDate !== todayStr) {
      dailyBurstsRemaining = 3;
      await db
        .update(users)
        .set({ dailyBurstsRemaining: 3, dailyBurstsResetDate: todayStr })
        .where(eq(users.id, userId));
    }

    const profile: UserProfile = {
      id: u.id,
      email: u.email || undefined,
      nickname: u.nickname,
      age: u.age,
      pronouns: u.pronouns,
      location: u.location,
      bio: u.bio,
      languages: ['English'],
      exchangeInterest: u.exchangeInterest,
      avatar: u.avatar,
      hobbies: hobbiesRecords.map((h) => h.hobby),
      unlockedBubbleTypes: (typesRecords.map((t) => t.bubbleType) as BubbleType[]) || ['thought', 'echo'],
      lastBubblePublishedAt: u.lastBubblePublishedAt,
      dailyBurstsRemaining,
      dailyBurstsResetDate: todayStr,
      burstBubbleIdsToday: [],
      breathLevel: u.breathLevel,
      breathExp: u.breathExp,
      dailyBreathEnergy: u.dailyBreathEnergy,
      moderationWarningsCount: u.moderationWarningsCount,
      suspendedUntil: u.suspendedUntil,
      moderationWarningsHistory: []
    };

    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error(error);
    return c.json({ success: true, data: INITIAL_USER });
  }
});

// Update Profile Schema
const UpdateProfileSchema = z.object({
  nickname: z.string().min(1).max(40).optional(),
  age: z.number().min(18).max(100).optional(),
  pronouns: z.string().max(30).optional(),
  location: z.string().max(60).optional(),
  bio: z.string().max(500).optional(),
  exchangeInterest: z.string().optional(),
  hobbies: z.array(z.string()).max(8).optional(),
  unlockedBubbleTypes: z.array(z.string()).optional()
});

// PATCH /api/me
userRoutes.patch('/me', zValidator('json', UpdateProfileSchema), async (c) => {
  const userId = getUserIdFromRequest(c);
  const data = c.req.valid('json');
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: true, message: 'Profile updated in offline state.' });
  }

  try {
    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (data.nickname) updatePayload.nickname = data.nickname.trim();
    if (data.age) updatePayload.age = data.age;
    if (data.pronouns) updatePayload.pronouns = data.pronouns.trim();
    if (data.location) updatePayload.location = data.location.trim();
    if (data.bio !== undefined) updatePayload.bio = data.bio.trim();
    if (data.exchangeInterest) updatePayload.exchangeInterest = data.exchangeInterest;

    await db.update(users).set(updatePayload).where(eq(users.id, userId));

    // Update hobbies if provided
    if (data.hobbies) {
      await db.delete(userHobbies).where(eq(userHobbies.userId, userId));
      if (data.hobbies.length > 0) {
        await db.insert(userHobbies).values(
          data.hobbies.map((h) => ({
            id: `uh_${userId}_${h.replace(/\s+/g, '_')}`,
            userId,
            hobby: h
          }))
        );
      }
    }

    // Update starter types if provided
    if (data.unlockedBubbleTypes) {
      await db.delete(userUnlockedTypes).where(eq(userUnlockedTypes.userId, userId));
      await db.insert(userUnlockedTypes).values(
        data.unlockedBubbleTypes.map((t) => ({
          id: `ut_${userId}_${t}`,
          userId,
          bubbleType: t
        }))
      );
    }

    return c.json({ success: true, message: 'Soul profile updated successfully.' });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: 'Failed to update profile.' }, 500);
  }
});

// PATCH /api/me/avatar
userRoutes.patch('/me/avatar', async (c) => {
  const userId = getUserIdFromRequest(c);
  const avatarConfig = await c.req.json();
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      await db
        .update(users)
        .set({ avatar: avatarConfig, updatedAt: new Date() })
        .where(eq(users.id, userId));
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({ success: true, message: '2D avatar customized successfully.' });
});

// POST /api/me/breath-xp
userRoutes.post('/me/breath-xp', async (c) => {
  const userId = getUserIdFromRequest(c);
  const { xp } = await c.req.json();
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      const records = await db.select().from(users).where(eq(users.id, userId));
      if (records.length > 0) {
        const u = records[0];
        const newExp = u.breathExp + (Number(xp) || 10);
        const newLevel = newExp >= 50 ? 3 : newExp >= 20 ? 2 : 1;
        const newEnergy = Math.min(100, u.dailyBreathEnergy + 5);

        await db
          .update(users)
          .set({
            breathExp: newExp,
            breathLevel: newLevel,
            dailyBreathEnergy: newEnergy,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));

        return c.json({
          success: true,
          data: { breathExp: newExp, breathLevel: newLevel, dailyBreathEnergy: newEnergy }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({ success: true, data: { breathExp: 10, breathLevel: 1, dailyBreathEnergy: 100 } });
});
