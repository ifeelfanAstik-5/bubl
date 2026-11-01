import { Hono } from 'hono';
import { db, checkDatabaseConnection } from '../db';
import { connections, users, userHobbies, messages } from '../db/schema';
import { eq, or, and } from 'drizzle-orm';
import { getUserIdFromRequest } from './auth';
import { INITIAL_FRIENDS } from '../../src/data/mockData';
import { MAX_ORBITS } from '../../shared/constants';
import { Friend } from '../../shared/types';

export const orbitRoutes = new Hono();

// GET /api/orbits (List active and quietly released pen pal orbits)
orbitRoutes.get('/', async (c) => {
  const userId = getUserIdFromRequest(c);
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: true, data: INITIAL_FRIENDS });
  }

  try {
    const connRecords = await db
      .select()
      .from(connections)
      .where(or(eq(connections.userAId, userId), eq(connections.userBId, userId)));

    if (connRecords.length === 0) {
      return c.json({ success: true, data: INITIAL_FRIENDS });
    }

    const friendsList: Friend[] = [];

    for (const conn of connRecords) {
      const friendId = conn.userAId === userId ? conn.userBId : conn.userAId;
      const friendUserRecords = await db.select().from(users).where(eq(users.id, friendId));
      const friendUser = friendUserRecords[0];

      if (!friendUser) continue;

      const friendHobbies = await db
        .select()
        .from(userHobbies)
        .where(eq(userHobbies.userId, friendId));

      // Calculate in-transit messages count
      const inTransitRecords = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.connectionId, conn.id),
            eq(messages.recipientId, userId)
          )
        );

      const inTransitCount = inTransitRecords.filter((m) => m.arrivalAt > Date.now()).length;

      friendsList.push({
        id: friendUser.id,
        name: friendUser.nickname,
        age: friendUser.age,
        location: friendUser.location,
        pronouns: friendUser.pronouns,
        bio: friendUser.bio,
        languages: ['English'],
        hobbies: friendHobbies.map((h) => h.hobby),
        exchangeInterest: friendUser.exchangeInterest,
        avatar: friendUser.avatar,
        status: conn.status as any,
        distanceKm: conn.distanceKm,
        mediaHandshake: conn.mediaHandshake,
        lastMessageSnippet: conn.lastMessageSnippet || '',
        lastMessageTime: conn.lastMessageTime || conn.createdAt.getTime(),
        inTransitCount,
        unreadCount: 0
      });
    }

    return c.json({ success: true, data: friendsList });
  } catch (error) {
    console.error(error);
    return c.json({ success: true, data: INITIAL_FRIENDS });
  }
});

// POST /api/orbits/:friendId/release (Stealth remove without notification)
orbitRoutes.post('/:friendId/release', async (c) => {
  const userId = getUserIdFromRequest(c);
  const friendId = c.req.param('friendId');
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      await db
        .update(connections)
        .set({ status: 'removed' })
        .where(
          or(
            and(eq(connections.userAId, userId), eq(connections.userBId, friendId)),
            and(eq(connections.userAId, friendId), eq(connections.userBId, userId))
          )
        );
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({
    success: true,
    message: 'Pen pal quietly released from orbit. No notification was sent.'
  });
});

// POST /api/orbits/:friendId/restore
orbitRoutes.post('/:friendId/restore', async (c) => {
  const userId = getUserIdFromRequest(c);
  const friendId = c.req.param('friendId');
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      await db
        .update(connections)
        .set({ status: 'active' })
        .where(
          or(
            and(eq(connections.userAId, userId), eq(connections.userBId, friendId)),
            and(eq(connections.userAId, friendId), eq(connections.userBId, userId))
          )
        );
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({ success: true, message: 'Pen pal restored to active orbit.' });
});

// POST /api/orbits/:friendId/handshake (Request or Approve mutual media)
orbitRoutes.post('/:friendId/handshake', async (c) => {
  const userId = getUserIdFromRequest(c);
  const friendId = c.req.param('friendId');
  const { action } = await c.req.json(); // 'request' | 'approve'
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    try {
      const records = await db
        .select()
        .from(connections)
        .where(
          or(
            and(eq(connections.userAId, userId), eq(connections.userBId, friendId)),
            and(eq(connections.userAId, friendId), eq(connections.userBId, userId))
          )
        );

      if (records.length > 0) {
        const conn = records[0];
        const current = conn.mediaHandshake;
        const updated =
          action === 'approve'
            ? { ...current, approvedByMe: true, approvedByThem: true }
            : { ...current, requestedByMe: true, approvedByMe: true };

        await db
          .update(connections)
          .set({ mediaHandshake: updated })
          .where(eq(connections.id, conn.id));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return c.json({
    success: true,
    message:
      action === 'approve'
        ? 'Mutual media handshake approved! Craft photos & soundscapes unlocked.'
        : 'Media handshake requested. Both users must approve.'
  });
});
