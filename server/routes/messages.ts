import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db, checkDatabaseConnection } from '../db';
import { messages, connections, users } from '../db/schema';
import { eq, or, and, asc } from 'drizzle-orm';
import { getUserIdFromRequest } from './auth';
import { DirectMessage } from '../../shared/types';
import {
  getAtmosphericWind,
  calculateGeodesicDistanceKm,
  calculateWindPacedTransitMs
} from '../services/weatherService';

export const messageRoutes = new Hono();

// GET /api/orbits/:friendId/messages (Fetch correspondence thread with live delivery evaluation)
messageRoutes.get('/:friendId/messages', async (c) => {
  const userId = getUserIdFromRequest(c);
  const friendId = c.req.param('friendId');
  const isDbConnected = await checkDatabaseConnection();

  if (!isDbConnected) {
    return c.json({ success: true, data: [] });
  }

  try {
    const connRecords = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.userAId, userId || ''), eq(connections.userBId, friendId)),
          and(eq(connections.userAId, friendId), eq(connections.userBId, userId || ''))
        )
      );

    if (connRecords.length === 0) {
      return c.json({ success: true, data: [] });
    }

    const conn = connRecords[0];
    const rawMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.connectionId, conn.id))
      .orderBy(asc(messages.sentAt));

    const now = Date.now();
    const evaluated: DirectMessage[] = rawMessages.map((m) => {
      const isDelivered = now >= m.arrivalAt;
      return {
        id: m.id,
        conversationId: friendId,
        senderId: m.senderId,
        recipientId: m.recipientId,
        title: m.title || undefined,
        body: m.body,
        sentAt: m.sentAt,
        deliveryDurationMs: m.deliveryDurationMs,
        arrivalAt: m.arrivalAt,
        isDelivered,
        breathEffort: m.breathEffort as any,
        bubbleType: m.bubbleType as any,
        mediaAttachments: m.mediaAttachments || undefined
      };
    });

    return c.json({ success: true, data: evaluated });
  } catch (error) {
    console.error(error);
    return c.json({ success: true, data: [] });
  }
});

const SendMessageSchema = z.object({
  body: z.string().min(1),
  bubbleType: z.string().default('thought'),
  breathEffort: z.enum(['gentle', 'balanced', 'deep']).default('balanced'),
  mediaAttachments: z.array(z.any()).optional()
});

// POST /api/orbits/:friendId/messages (Send paced bubble dispatch)
messageRoutes.post('/:friendId/messages', zValidator('json', SendMessageSchema), async (c) => {
  const userId = getUserIdFromRequest(c);
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized.' }, 401);
  }
  const friendId = c.req.param('friendId');
  const data = c.req.valid('json');

  const now = Date.now();
  const isDbConnected = await checkDatabaseConnection();

  let distanceKm = 1200;
  let windSpeedKmH = 9;

  if (isDbConnected) {
    try {
      const senderRecords = await db.select().from(users).where(eq(users.id, userId));
      const recipientRecords = await db.select().from(users).where(eq(users.id, friendId));
      if (senderRecords.length > 0 && recipientRecords.length > 0) {
        const s = senderRecords[0];
        const r = recipientRecords[0];
        if (s.latitude && s.longitude && r.latitude && r.longitude) {
          distanceKm = calculateGeodesicDistanceKm(s.latitude, s.longitude, r.latitude, r.longitude);
          const weather = await getAtmosphericWind(s.latitude, s.longitude);
          windSpeedKmH = weather.windSpeedKmH;
        }

        // Award +10ml Soap Mixture for thoughtful letter reply
        const currentVial = s.mixtureVialMl ?? 100;
        await db
          .update(users)
          .set({ mixtureVialMl: Math.min(100, currentVial + 10), updatedAt: new Date() })
          .where(eq(users.id, userId));
      }
    } catch (e) {
      console.error('Error computing letter transit:', e);
    }
  }

  const deliveryDurationMs = calculateWindPacedTransitMs(distanceKm, windSpeedKmH, data.breathEffort);
  const arrivalAt = now + deliveryDurationMs;

  if (!isDbConnected) {
    const fallbackMsg: DirectMessage = {
      id: `msg-${now}`,
      conversationId: friendId,
      senderId: userId,
      recipientId: friendId,
      body: data.body,
      sentAt: now,
      deliveryDurationMs,
      arrivalAt,
      isDelivered: false,
      breathEffort: data.breathEffort,
      bubbleType: data.bubbleType as any,
      mediaAttachments: data.mediaAttachments
    };
    return c.json({
      success: true,
      message: `Bubble sent! Airmail drift in progress (~${Math.round(deliveryDurationMs / 60000)}m).`,
      data: fallbackMsg
    });
  }

  try {
    // Find or create connection
    let connRecords = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.userAId, userId), eq(connections.userBId, friendId)),
          and(eq(connections.userAId, friendId), eq(connections.userBId, userId))
        )
      );

    let connectionId = '';
    if (connRecords.length === 0) {
      connectionId = `conn_${now}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(connections).values({
        id: connectionId,
        userAId: userId,
        userBId: friendId,
        status: 'active',
        lastMessageSnippet: data.body.substring(0, 80),
        lastMessageTime: now
      });
    } else {
      connectionId = connRecords[0].id;
      await db
        .update(connections)
        .set({
          lastMessageSnippet: data.body.substring(0, 80),
          lastMessageTime: now
        })
        .where(eq(connections.id, connectionId));
    }

    const messageId = `msg_${now}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(messages).values({
      id: messageId,
      connectionId,
      senderId: userId,
      recipientId: friendId,
      body: data.body,
      bubbleType: data.bubbleType,
      breathEffort: data.breathEffort,
      sentAt: now,
      deliveryDurationMs,
      arrivalAt,
      mediaAttachments: data.mediaAttachments
    });

    const newMsg: DirectMessage = {
      id: messageId,
      conversationId: friendId,
      senderId: userId,
      recipientId: friendId,
      body: data.body,
      sentAt: now,
      deliveryDurationMs,
      arrivalAt,
      isDelivered: false,
      breathEffort: data.breathEffort,
      bubbleType: data.bubbleType as any,
      mediaAttachments: data.mediaAttachments
    };

    return c.json({
      success: true,
      message: `Bubble dispatched! Traveling on atmospheric currents (~${Math.round(deliveryDurationMs / 60000)}m).`,
      data: newMsg
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: 'Failed to send dispatch.' }, 500);
  }
});
