export interface AvatarConfig {
  skinColor: string;
  hairStyle: 'classic' | 'wavy' | 'curly' | 'bun' | 'bob' | 'short' | 'buzz' | 'ponytail';
  hairColor: string;
  eyeStyle: 'calm' | 'gentle' | 'smiling' | 'curious' | 'winking';
  mouthStyle: 'subtle_smile' | 'warm_grin' | 'calm' | 'thoughtful';
  glassesStyle: 'none' | 'round' | 'wire' | 'square';
  clothingStyle: 'sweater' | 'hoodie' | 'turtleneck' | 'buttondown' | 'cardigan';
  clothingColor: string;
  bgTint: string;
}

export type BubbleType =
  | 'thought'      // Deep written reflection (Starter)
  | 'echo'         // A single resonant question to be answered (Starter)
  | 'resonance'    // Only bursts for people with shared hobbies
  | 'lantern'      // Night owl / midnight thoughts
  | 'ember'        // Slow patience bubble (unhurried reveal)
  | 'haiku';       // Rhythmic short verse / poetry

export interface BubbleTypeDefinition {
  id: BubbleType;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  isStarterChoice: boolean;
  unlockRequirement: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  pronouns: string;
  location: string;
  bio: string;
  languages: string[];
  hobbies: string[];
  exchangeInterest: string; // What topics/ideas they enjoy discussing (e.g. "Literature & Book Discussions")
  avatar: AvatarConfig;
  lastBubblePublishedAt: number | null; // Timestamp of weekly bubble post
  dailyBurstsRemaining: number; // Max 3 bursts out of 5 daily drifting bubbles
  dailyBurstsResetDate: string; // YYYY-MM-DD
  burstBubbleIdsToday: string[]; // List of IDs burst today
  // Breath system
  breathLevel: number;
  breathExp: number;
  dailyBreathEnergy: number; // e.g. 100/100
  // Bubble Type unlocks
  unlockedBubbleTypes: BubbleType[];
  // Moderation & Suspension system
  moderationWarningsCount: number; // 0 to 3 warnings
  suspendedUntil: number | null; // Timestamp when 7-day suspension ends, or null
  moderationWarningsHistory: ModerationWarningRecord[];
}

export interface ModerationWarningRecord {
  id: string;
  bubbleId: string;
  bubbleTitle: string;
  flaggedWords: string[];
  reason: string;
  issuedAt: number;
  warningNumber: number;
  resultedInSuspension: boolean;
}

export interface MediaAttachment {
  id: string;
  type: 'photo' | 'audio' | 'video';
  url: string;
  caption?: string;
  durationOrSize?: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  title?: string;
  body: string;
  sentAt: number;
  deliveryDurationMs: number;
  arrivalAt: number;
  isDelivered: boolean;
  breathEffort?: 'gentle' | 'balanced' | 'deep';
  bubbleType?: BubbleType;
  mediaAttachments?: MediaAttachment[]; // Strictly in 1-on-1 upon mutual handshake
}

export interface Friend {
  id: string;
  name: string;
  age: number;
  location: string;
  pronouns: string;
  bio: string;
  languages: string[];
  hobbies: string[];
  exchangeInterest: string;
  avatar: AvatarConfig;
  status: 'active' | 'removed'; // 'removed' means stealth removed without notification
  distanceKm: number;
  mediaHandshake: {
    requestedByMe: boolean;
    requestedByThem: boolean;
    approvedByMe: boolean;
    approvedByThem: boolean;
  };
  lastMessageSnippet: string;
  lastMessageTime: number;
  inTransitCount?: number;
  unreadCount?: number;
}

export interface BubblePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAge: number;
  authorLocation: string;
  authorAvatar: AvatarConfig;
  title: string;
  content: string;
  hobbies: string[];
  publishedAt: number;
  distanceKm: number;
  bubbleColor: string;
  bubbleType: BubbleType;
  promptQuestion?: string; // If echo bubble
  isUserBubble?: boolean;
  moderationStatus?: 'clean' | 'scanning' | 'flagged_taken_down';
  flaggedReason?: string;
  flaggedKeywords?: string[];
}

export type DeclineReason =
  | 'no_shared_interests'
  | 'too_many_connections'
  | 'looking_for_different_pace'
  | 'silent';
