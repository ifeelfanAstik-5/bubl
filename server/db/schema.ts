import { pgTable, text, integer, bigint, boolean, timestamp, jsonb, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { AvatarConfig, MediaAttachment } from '../../shared/types';

export const NEUTRAL_AVATAR: AvatarConfig = {
  skinColor: '#F5D0C5',
  hairStyle: 'classic',
  hairColor: '#4A3E3D',
  eyeStyle: 'calm',
  mouthStyle: 'calm',
  glassesStyle: 'none',
  clothingStyle: 'sweater',
  clothingColor: '#6B7280',
  bgTint: '#F3EFEA'
};

// USERS TABLE
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  nickname: text('nickname').notNull().default(''),
  dob: text('dob'),
  age: integer('age').notNull().default(18),
  pronouns: text('pronouns').notNull().default('they/them'),
  location: text('location').notNull().default(''),
  latitude: real('latitude'),
  longitude: real('longitude'),
  bio: text('bio').notNull().default(''),
  languages: jsonb('languages').$type<string[]>().notNull().default(['English']),
  exchangeInterest: text('exchange_interest').notNull().default(''),
  avatar: jsonb('avatar').$type<AvatarConfig>().notNull().default(NEUTRAL_AVATAR),
  // Breath & Soap Mixture Vial system
  breathLevel: integer('breath_level').notNull().default(1),
  breathExp: integer('breath_exp').notNull().default(0),
  dailyBreathEnergy: integer('daily_breath_energy').notNull().default(100),
  mixtureVialMl: integer('mixture_vial_ml').notNull().default(100),
  lastDewRefillDate: text('last_dew_refill_date'),
  dailyBurstsRemaining: integer('daily_bursts_remaining').notNull().default(3),
  dailyBurstsResetDate: text('daily_bursts_reset_date').notNull().default(''),
  lastBubblePublishedAt: bigint('last_bubble_published_at', { mode: 'number' }),
  moderationWarningsCount: integer('moderation_warnings_count').notNull().default(0),
  suspendedUntil: bigint('suspended_until', { mode: 'number' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// USER HOBBIES
export const userHobbies = pgTable('user_hobbies', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hobby: text('hobby').notNull()
});

// USER UNLOCKED BUBBLE TYPES
export const userUnlockedTypes = pgTable('user_unlocked_types', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bubbleType: text('bubble_type').notNull()
});

// COMMUNITY & USER BUBBLES
export const bubbles = pgTable('bubbles', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  promptQuestion: text('prompt_question'),
  bubbleType: text('bubble_type').notNull().default('thought'),
  bubbleColor: text('bubble_color').notNull().default('#8D7B68'),
  mixtureEssence: text('mixture_essence'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  distanceKm: integer('distance_km').notNull().default(4200),
  breathEffort: text('breath_effort').notNull().default('balanced'),
  isUserBubble: boolean('is_user_bubble').notNull().default(false),
  moderationStatus: text('moderation_status').notNull().default('clean'),
  flaggedReason: text('flagged_reason'),
  flaggedKeywords: jsonb('flagged_keywords').$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// BUBBLE HOBBIES TAGS
export const bubbleHobbies = pgTable('bubble_hobbies', {
  id: text('id').primaryKey(),
  bubbleId: text('bubble_id').notNull().references(() => bubbles.id, { onDelete: 'cascade' }),
  hobby: text('hobby').notNull()
});

// DAILY BURST LOGS
export const burstLogs = pgTable('burst_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bubbleId: text('bubble_id').notNull().references(() => bubbles.id, { onDelete: 'cascade' }),
  burstDate: text('burst_date').notNull(), // YYYY-MM-DD
  burstAt: timestamp('burst_at', { withTimezone: true }).notNull().defaultNow()
});

// CONNECTIONS / PEN PAL ORBITS (Max 50 Quota)
export const connections = pgTable('connections', {
  id: text('id').primaryKey(),
  userAId: text('user_a_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userBId: text('user_b_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'), // 'active' | 'removed_by_a' | 'removed_by_b'
  distanceKm: integer('distance_km').notNull().default(5000),
  mediaHandshake: jsonb('media_handshake').$type<{
    requestedByMe: boolean;
    requestedByThem: boolean;
    approvedByMe: boolean;
    approvedByThem: boolean;
  }>().notNull().default({
    requestedByMe: false,
    requestedByThem: false,
    approvedByMe: false,
    approvedByThem: false
  }),
  lastMessageSnippet: text('last_message_snippet').default(''),
  lastMessageTime: bigint('last_message_time', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// DISPATCHES / MESSAGES (Paced by wind & breath duration)
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  connectionId: text('connection_id').notNull().references(() => connections.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: text('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  body: text('body').notNull(),
  bubbleType: text('bubble_type').default('thought'),
  breathEffort: text('breath_effort').default('balanced'),
  sentAt: bigint('sent_at', { mode: 'number' }).notNull(),
  deliveryDurationMs: bigint('delivery_duration_ms', { mode: 'number' }).notNull(),
  arrivalAt: bigint('arrival_at', { mode: 'number' }).notNull(),
  mediaAttachments: jsonb('media_attachments').$type<MediaAttachment[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// MODERATION WARNINGS (3 Strikes with 7-Day Suspension)
export const moderationWarnings = pgTable('moderation_warnings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bubbleId: text('bubble_id'),
  bubbleTitle: text('bubble_title').notNull(),
  flaggedWords: jsonb('flagged_words').$type<string[]>().notNull(),
  reason: text('reason').notNull(),
  warningNumber: integer('warning_number').notNull(),
  resultedInSuspension: boolean('resulted_in_suspension').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// AUTH OTPs (Passwordless Sign-In)
export const authOtps = pgTable('auth_otps', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true })
});

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  hobbies: many(userHobbies),
  unlockedTypes: many(userUnlockedTypes),
  bubbles: many(bubbles),
  burstLogs: many(burstLogs),
  warnings: many(moderationWarnings)
}));

export const bubblesRelations = relations(bubbles, ({ one, many }) => ({
  author: one(users, {
    fields: [bubbles.authorId],
    references: [users.id]
  }),
  hobbies: many(bubbleHobbies),
  burstLogs: many(burstLogs)
}));

export const connectionsRelations = relations(connections, ({ one, many }) => ({
  userA: one(users, {
    fields: [connections.userAId],
    references: [users.id]
  }),
  userB: one(users, {
    fields: [connections.userBId],
    references: [users.id]
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  connection: one(connections, {
    fields: [messages.connectionId],
    references: [connections.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id]
  })
}));
