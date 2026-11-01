import { Hono } from 'hono';
import { db, checkDatabaseConnection } from '../db';
import { messages, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getUserIdFromRequest } from './auth';

export const devRoutes = new Hono();

// POST /api/dev/accelerate-winds (Fast-forward delivery of all in-transit dispatches)
devRoutes.post('/accelerate-winds', async (c) => {
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      // Set arrivalAt of all messages to 1 second in the past
      await db.update(messages).set({ arrivalAt: Date.now() - 1000 });
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({
    success: true,
    message: 'Air currents accelerated! All dispatches have arrived.'
  });
});

// POST /api/dev/reset-suspension (Clear moderation strikes and lift suspension)
devRoutes.post('/reset-suspension', async (c) => {
  const userId = getUserIdFromRequest(c);
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      await db
        .update(users)
        .set({
          moderationWarningsCount: 0,
          suspendedUntil: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({
    success: true,
    message: 'Dev reset: Moderation strikes cleared and suspension lifted.'
  });
});
