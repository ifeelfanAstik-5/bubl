import { BubbleType, BubbleTypeDefinition } from './types';

export const MAX_ORBITS = 50;
export const DAILY_BURSTS_LIMIT = 3;
export const DAILY_ATMOSPHERE_BUBBLES = 5;
export const TITLE_MAX_WORDS = 10;
export const WEEKLY_PUBLISH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
export const SUSPENSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const ALL_HOBBIES = [
  'Literature',
  'Cinema',
  'Coffee Brewing',
  'Stargazing',
  'Indie Music',
  'Vinyl Records',
  'Architecture',
  'Film Photography',
  'Ceramics',
  'Philosophy',
  'Botanical Gardening',
  'Poetry',
  'Baking',
  'Hiking & Mountains',
  'Watercolor Painting',
  'Board Games',
  'Language Learning',
  'Old Bookstores',
  'Folk Lore',
  'Tea Ceremonies',
  'Cycling',
  'Psychology'
];

export interface HobbyCategory {
  id: string;
  name: string;
  icon: string;
  hobbies: string[];
}

export const HOBBY_CATEGORIES: HobbyCategory[] = [
  {
    id: 'letters',
    name: 'Letters & Thought',
    icon: '📖',
    hobbies: ['Literature', 'Philosophy', 'Old Bookstores', 'Poetry', 'Psychology']
  },
  {
    id: 'living',
    name: 'Sensory & Slow Living',
    icon: '☕',
    hobbies: ['Coffee Brewing', 'Tea Ceremonies', 'Baking', 'Ceramics', 'Folk Lore']
  },
  {
    id: 'nature',
    name: 'Nature & Skies',
    icon: '✨',
    hobbies: ['Stargazing', 'Botanical Gardening', 'Hiking & Mountains', 'Cycling']
  },
  {
    id: 'arts',
    name: 'Analog & Visual Arts',
    icon: '🎞️',
    hobbies: ['Film Photography', 'Vinyl Records', 'Architecture', 'Watercolor Painting', 'Cinema']
  },
  {
    id: 'mind',
    name: 'Wonders & Learning',
    icon: '🧩',
    hobbies: ['Board Games', 'Language Learning', 'Indie Music']
  }
];

export const HOBBY_ICONS: Record<string, string> = {
  'Literature': '📖',
  'Cinema': '🎬',
  'Coffee Brewing': '☕',
  'Stargazing': '🌌',
  'Indie Music': '🎵',
  'Vinyl Records': '📻',
  'Architecture': '🏛️',
  'Film Photography': '📷',
  'Ceramics': '🏺',
  'Philosophy': '💭',
  'Botanical Gardening': '🌿',
  'Poetry': '🪶',
  'Baking': '🥐',
  'Hiking & Mountains': '⛰️',
  'Watercolor Painting': '🎨',
  'Board Games': '🎲',
  'Language Learning': '🗣️',
  'Old Bookstores': '📚',
  'Folk Lore': '📜',
  'Tea Ceremonies': '🍵',
  'Cycling': '🚲',
  'Psychology': '🧠'
};

export const BUBBLE_TYPES: BubbleTypeDefinition[] = [
  {
    id: 'thought',
    name: 'Thought Bubble',
    tagline: 'Deep written reflection',
    description: 'Long-form personal perspectives, book insights, crafts, and life philosophies.',
    icon: 'file-text',
    color: '#8D7B68',
    isStarterChoice: true,
    unlockRequirement: 'Available at start'
  },
  {
    id: 'echo',
    name: 'Echo Bubble',
    tagline: 'A poignant question to answer',
    description: 'Carries a single thoughtful question. Readers must answer the question to exchange thoughts.',
    icon: 'help-circle',
    color: '#4D7C9E',
    isStarterChoice: true,
    unlockRequirement: 'Available at start'
  },
  {
    id: 'resonance',
    name: 'Resonance Bubble',
    tagline: 'Tuned to shared passions',
    description: 'Encapsulated with a harmonic frequency. Can only be burst if you share matching hobbies.',
    icon: 'sparkles',
    color: '#D97757',
    isStarterChoice: false,
    unlockRequirement: 'Unlock by reaching Breath Level 2 or receiving one from a friend'
  },
  {
    id: 'lantern',
    name: 'Lantern Bubble',
    tagline: 'Midnight & dusk thoughts',
    description: 'Glows with quiet warmth for night owls, stargazers, and late-night thinkers.',
    icon: 'lamp',
    color: '#C4973B',
    isStarterChoice: false,
    unlockRequirement: 'Unlock after 7 days of steady, unhurried communications'
  },
  {
    id: 'ember',
    name: 'Slow Ember Bubble',
    tagline: 'A gentle patience capsule',
    description: 'A slow-burning bubble that asks for a moment of quiet meditation before unveiling its words.',
    icon: 'flame',
    color: '#B05D3B',
    isStarterChoice: false,
    unlockRequirement: 'Unlock by reaching Breath Level 3'
  },
  {
    id: 'haiku',
    name: 'Haiku & Verse Bubble',
    tagline: 'Rhythmic poetic verses',
    description: 'Minimalist 3-to-5 line poetry capturing a fleeting observation, weather, or season.',
    icon: 'feather',
    color: '#5E8B67',
    isStarterChoice: false,
    unlockRequirement: 'Unlock when a pen pal sends you a verse or through steady presence'
  }
];

export const BUBBLE_PALETTES = [
  { id: 'rose', name: 'Morning Mist Rose', tint: '#FDF0EC', border: '#F2C8BD', badge: '#D97757' },
  { id: 'sage', name: 'Quiet Sage Leaf', tint: '#EDF4EE', border: '#C0DBC4', badge: '#5E8B67' },
  { id: 'amber', name: 'Warm Amber Sun', tint: '#FCF7EB', border: '#EBD7A7', badge: '#C4973B' },
  { id: 'sky', name: 'Open Ocean Dusk', tint: '#EDF3F7', border: '#BDD4E3', badge: '#4D7C9E' },
  { id: 'lavender', name: 'Dusk Violet', tint: '#F5F0F7', border: '#D9C8DF', badge: '#825B96' }
];

export const SENSITIVE_ANTI_DATING_KEYWORDS = [
  'dating',
  'date me',
  'hookup',
  'hook up',
  'single guy',
  'single girl',
  'single female',
  'single male',
  'seeking boyfriend',
  'seeking girlfriend',
  'looking for love',
  'looking for romance',
  'looking for soulmate',
  'looking for a partner',
  'cuddle',
  'kiss',
  'sexy',
  'hot girl',
  'hot guy',
  'babe',
  'bae',
  'sugar daddy',
  'sugar mommy',
  'marry me',
  'horny',
  'attractive',
  'lonely man',
  'lonely woman',
  'need a companion',
  'desperate',
  'flirt',
  'flirting',
  'swipe right',
  'swipe left',
  'hit me up',
  'dm me',
  'hate',
  'ugly',
  'stupid',
  'idiot',
  'kill'
];
