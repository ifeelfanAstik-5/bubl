import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db, checkDatabaseConnection } from '../db';
import { bubbles, bubbleHobbies, burstLogs, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUserIdFromRequest } from './auth';
import { INITIAL_BUBBLES, INITIAL_USER_PUBLISHED_BUBBLES } from '../../src/data/mockData';
import { analyzeTitle, analyzeContent } from '../../shared/moderation';
import { WEEKLY_PUBLISH_INTERVAL_MS, DAILY_BURSTS_LIMIT } from '../../shared/constants';
import { BubblePost } from '../../shared/types';

export const bubbleRoutes = new Hono();

// GET /api/bubbles/atmosphere (5 Daily Drifting Bubbles)
bubbleRoutes.get('/atmosphere', async (c) => {
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: true, data: INITIAL_BUBBLES });
  }

  try {
    const records = await db
      .select()
      .from(bubbles)
      .where(and(eq(bubbles.isUserBubble, false), eq(bubbles.moderationStatus, 'clean')))
      .limit(5);

    if (records.length === 0) {
      return c.json({ success: true, data: INITIAL_BUBBLES });
    }

    const items: BubblePost[] = [];
    for (const b of records) {
      const hRecords = await db
        .select()
        .from(bubbleHobbies)
        .where(eq(bubbleHobbies.bubbleId, b.id));

      const authorRecords = await db.select().from(users).where(eq(users.id, b.authorId));
      const author = authorRecords[0];

      items.push({
        id: b.id,
        authorId: b.authorId,
        authorName: author?.nickname || 'Penpal',
        authorAge: author?.age || 25,
        authorLocation: author?.location || 'Florence, Italy',
        authorAvatar: author?.avatar || {
          skinColor: '#F7D9C4',
          hairStyle: 'curly',
          hairColor: '#5C3826',
          eyeStyle: 'gentle',
          mouthStyle: 'warm_grin',
          glassesStyle: 'wire',
          clothingStyle: 'cardigan',
          clothingColor: '#C48B71',
          bgTint: '#FBECE3'
        },
        title: b.title,
        content: b.content,
        promptQuestion: b.promptQuestion || undefined,
        bubbleType: b.bubbleType as any,
        bubbleColor: b.bubbleColor,
        distanceKm: b.distanceKm,
        publishedAt: b.createdAt.getTime(),
        hobbies: hRecords.map((h) => h.hobby),
        isUserBubble: false,
        moderationStatus: b.moderationStatus as any
      });
    }

    return c.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    return c.json({ success: true, data: INITIAL_BUBBLES });
  }
});

// POST /api/bubbles/burst
bubbleRoutes.post('/burst', async (c) => {
  const userId = getUserIdFromRequest(c);
  const { bubbleId } = await c.req.json();
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({
      success: true,
      message: 'Bubble burst offline. Daily quota decremented, 10 XP awarded.'
    });
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userRecords = await db.select().from(users).where(eq(users.id, userId));
    if (userRecords.length === 0) {
      return c.json({ success: false, error: 'User not found.' }, 404);
    }

    const u = userRecords[0];
    if (u.dailyBurstsRemaining <= 0 && u.dailyBurstsResetDate === todayStr) {
      return c.json(
        {
          success: false,
          error: 'Daily burst limit reached: 3 of 5 bubbles opened today.'
        },
        429
      );
    }

    // Decrement daily quota and award 10 Breath XP
    const newRemaining = Math.max(0, u.dailyBurstsRemaining - 1);
    const newExp = u.breathExp + 10;
    const newLevel = newExp >= 50 ? 3 : newExp >= 20 ? 2 : 1;

    await db
      .update(users)
      .set({
        dailyBurstsRemaining: newRemaining,
        dailyBurstsResetDate: todayStr,
        breathExp: newExp,
        breathLevel: newLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Record burst log
    await db.insert(burstLogs).values({
      id: `bl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      bubbleId,
      burstDate: todayStr
    });

    return c.json({
      success: true,
      data: {
        dailyBurstsRemaining: newRemaining,
        breathExp: newExp,
        breathLevel: newLevel
      }
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: 'Failed to burst bubble.' }, 500);
  }
});

// Create Bubble Schema
const CreateBubbleSchema = z.object({
  title: z.string().min(4),
  content: z.string().min(40),
  bubbleType: z.string().default('thought'),
  bubbleColor: z.string().default('#8D7B68'),
  breathEffort: z.string().default('balanced'),
  hobbies: z.array(z.string()).min(1).max(4),
  promptQuestion: z.string().optional()
});

// POST /api/bubbles (Publish a weekly bubble)
bubbleRoutes.post('/', zValidator('json', CreateBubbleSchema), async (c) => {
  const userId = getUserIdFromRequest(c);
  const data = c.req.valid('json');

  // 1. Strict Server-Side Title Analysis (10 words max, clean of sensitive keywords)
  const titleCheck = analyzeTitle(data.title);
  if (!titleCheck.isValid) {
    return c.json(
      {
        success: false,
        error: titleCheck.rephraseMessage || 'Title does not meet mindful guidelines.'
      },
      400
    );
  }

  // 2. Content privacy & format validation
  const contentCheck = analyzeContent(data.content);
  if (!contentCheck.isClean) {
    return c.json(
      {
        success: false,
        error: contentCheck.rephraseGuidance || 'Content does not meet mindful guidelines.'
      },
      400
    );
  }

  const isDbConnected = await checkDatabaseConnection();
  if (!isDbConnected) {
    const newBubble: BubblePost = {
      id: `bubble-user-${Date.now()}`,
      authorId: userId,
      authorName: 'Haruki',
      authorAge: 26,
      authorLocation: 'Kyoto, Japan',
      authorAvatar: INITIAL_USER_PUBLISHED_BUBBLES[0].authorAvatar,
      title: data.title,
      content: data.content,
      hobbies: data.hobbies,
      publishedAt: Date.now(),
      distanceKm: 0,
      bubbleColor: data.bubbleColor,
      bubbleType: data.bubbleType as any,
      promptQuestion: data.promptQuestion,
      isUserBubble: true,
      moderationStatus: 'clean'
    };
    return c.json({ success: true, data: newBubble });
  }

  try {
    // 3. Check 1-Bubble-per-week quota
    const userRecords = await db.select().from(users).where(eq(users.id, userId));
    if (userRecords.length > 0) {
      const u = userRecords[0];
      if (u.suspendedUntil && u.suspendedUntil > Date.now()) {
        return c.json({ success: false, error: 'Account suspended.' }, 403);
      }
      if (
        u.lastBubblePublishedAt &&
        Date.now() - u.lastBubblePublishedAt < WEEKLY_PUBLISH_INTERVAL_MS
      ) {
        const daysLeft = Math.ceil(
          (WEEKLY_PUBLISH_INTERVAL_MS - (Date.now() - u.lastBubblePublishedAt)) /
            (24 * 60 * 60 * 1000)
        );
        return c.json(
          {
            success: false,
            error: `Weekly quota: You may blow a new bubble in ${daysLeft} days.`
          },
          429
        );
      }
    }

    const bubbleId = `bubble_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(bubbles).values({
      id: bubbleId,
      authorId: userId,
      title: data.title,
      content: data.content,
      promptQuestion: data.promptQuestion,
      bubbleType: data.bubbleType,
      bubbleColor: data.bubbleColor,
      breathEffort: data.breathEffort,
      isUserBubble: true,
      moderationStatus: 'clean',
      distanceKm: 0
    });

    // Insert hobbies tags
    for (const h of data.hobbies) {
      await db.insert(bubbleHobbies).values({
        id: `bh_${bubbleId}_${h.replace(/\s+/g, '_')}`,
        bubbleId,
        hobby: h
      });
    }

    // Award 25 Breath XP and update lastBubblePublishedAt
    const author = userRecords[0];
    const newExp = (author?.breathExp || 0) + 25;
    const newLevel = newExp >= 50 ? 3 : newExp >= 20 ? 2 : 1;

    await db
      .update(users)
      .set({
        lastBubblePublishedAt: Date.now(),
        breathExp: newExp,
        breathLevel: newLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return c.json({
      success: true,
      message: 'Bubble released into the atmosphere! 25 Breath XP awarded.',
      bubbleId
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: 'Failed to release bubble.' }, 500);
  }
});

// GET /api/bubbles/mine (User's published bubbles archive)
bubbleRoutes.get('/mine', async (c) => {
  const userId = getUserIdFromRequest(c);
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: true, data: INITIAL_USER_PUBLISHED_BUBBLES });
  }

  try {
    const records = await db
      .select()
      .from(bubbles)
      .where(and(eq(bubbles.authorId, userId), eq(bubbles.isUserBubble, true)))
      .orderBy(desc(bubbles.createdAt));

    if (records.length === 0) {
      return c.json({ success: true, data: INITIAL_USER_PUBLISHED_BUBBLES });
    }

    const list: BubblePost[] = [];
    const authorRecords = await db.select().from(users).where(eq(users.id, userId));
    const author = authorRecords[0];

    for (const b of records) {
      const hRecords = await db
        .select()
        .from(bubbleHobbies)
        .where(eq(bubbleHobbies.bubbleId, b.id));

      list.push({
        id: b.id,
        authorId: b.authorId,
        authorName: author?.nickname || 'Me',
        authorAge: author?.age || 26,
        authorLocation: author?.location || 'Kyoto, Japan',
        authorAvatar: author?.avatar || INITIAL_USER_PUBLISHED_BUBBLES[0].authorAvatar,
        title: b.title,
        content: b.content,
        promptQuestion: b.promptQuestion || undefined,
        bubbleType: b.bubbleType as any,
        bubbleColor: b.bubbleColor,
        distanceKm: 0,
        publishedAt: b.createdAt.getTime(),
        hobbies: hRecords.map((h) => h.hobby),
        isUserBubble: true,
        moderationStatus: b.moderationStatus as any
      });
    }

    return c.json({ success: true, data: list });
  } catch (error) {
    console.error(error);
    return c.json({ success: true, data: INITIAL_USER_PUBLISHED_BUBBLES });
  }
});

// DELETE /api/bubbles/:id
bubbleRoutes.delete('/:id', async (c) => {
  const bubbleId = c.req.param('id');
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      await db.delete(bubbles).where(eq(bubbles.id, bubbleId));
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({ success: true, message: 'Bubble gently popped from airspace.' });
});
