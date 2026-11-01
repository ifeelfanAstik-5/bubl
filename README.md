# 🫧 Bubble — Mindful Pen Pal & Thought Exchange

> A slow-paced, stationery-inspired sanctuary for introverts and deep thinkers to connect across the world through ideas, questions, and calm epistolary pacing.

---

## 📖 Product Philosophy & Guidelines
For a comprehensive overview of the product vision, metaphors, community rules, and design guidelines, please read the [**Application Manifesto (APP_MANIFESTO.md)**](./APP_MANIFESTO.md).

---

## 🌟 Core Concepts at a Glance

1. **Drifting Thought Bubbles**:
   - Instead of instant posts or endless feeds, ideas drift across the atmosphere as gentle, iridescent bubbles.
   - External membrane shows the author's 2D stationery avatar, origin, distance, and a concise title (max 10 words).
   - The deeper thought is revealed only when you intentionally choose to **burst** the bubble.

2. **Scarcity & The 3-out-of-5 Daily Selection**:
   - Each drift cycle presents 5 drifting bubbles.
   - Users can choose to burst at most 3 bubbles per cycle, cultivating mindful attention over mindless swiping.

3. **Anti-Dating & Anti-Lookism Ethos**:
   - **No selfies or face photos**: Identities are expressed through 2D illustrated stationery avatars.
   - **Strictly ideas and wonderings**: Content filters and moderation safeguard the platform from cheesy romance solicitations, hookup culture, and cringe spam.
   - **10-Word Title Rule**: Encourages thoughtful, focused questions and reflections.
   - **3-Strike Moderation**: Content undergoes real-time title screening and asynchronous deep scanning, with 3 warnings resulting in a 7-day suspension.

4. **Mutual Media Handshake**:
   - Open bubbles contain pure text (no photos, videos, or external links).
   - Audio notes and visual media can only be exchanged once two users have formed a 1-on-1 friendship and **both** have accepted a mutual media handshake.

5. **Calm Delivery Pacing**:
   - Letters and replies travel on simulated atmospheric wind currents with realistic delivery delays (5 to 30 minutes).
   - A strict **50 Friends Quota** prioritizes meaningful, enduring pen pal relationships.
   - Friendships can be released quietly and gracefully without notifications or awkwardness.

6. **Tactile Stationery Aesthetic**:
   - Soft pastel stationery palette (`#FAF7F2`, `#F4EFEA`) with warm terracotta accents, deckle edges, vintage postage motifs, and literary typography.

---

## 🛠️ Project Structure

- `APP_MANIFESTO.md`: The complete philosophical and architectural manifesto for future reference and redesigns.
- `src/types/index.ts`: Core models for bubbles, moderation warnings, user profiles, and friendships.
- `src/services/moderationService.ts`: Real-time title screening, content guidance, and asynchronous scanning pipeline.
- `src/components/`:
  - `Header.tsx`: Navigation, daily burst indicator, and breath status.
  - `OpenBubblesSky.tsx`: Drifting bubbles airspace with aggregate remaining burst counter.
  - `CreateBubbleModal.tsx`: Bubble creation with 10-word title counter, live rephrase advice, and one-click title cleansing.
  - `MyPublishedBubbles.tsx`: Author's released bubbles with real-time flight and moderation status indicators.
  - `FriendListSidebar.tsx`: 50-friend quota tracker, quiet release, and active pen pals.
  - `LetterDetailModal.tsx`: Burst animation and letter reader.
  - `ModerationWarningModal.tsx`: Visual warning progression meter and guidelines refresher.
