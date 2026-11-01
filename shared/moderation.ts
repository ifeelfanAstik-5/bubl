import { SENSITIVE_ANTI_DATING_KEYWORDS, TITLE_MAX_WORDS } from './constants';

export const CRINGE_DATING_PATTERNS = [
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
  'intimacy',
  'soulmate'
];

export const OFFENSIVE_PATTERNS = [
  'hate',
  'ugly',
  'stupid',
  'idiot',
  'kill',
  'trash',
  'disgusting',
  'freak',
  'scam'
];

export interface TitleAnalysisResult {
  isValid: boolean;
  wordCount: number;
  exceedsWordLimit: boolean;
  detectedSensitiveKeywords: string[];
  rephraseMessage?: string;
}

export interface ContentAnalysisResult {
  isClean: boolean;
  detectedSensitiveKeywords: string[];
  containsLinks: boolean;
  containsMedia: boolean;
  rephraseGuidance?: string;
}

export function analyzeTitle(rawTitle: string): TitleAnalysisResult {
  const trimmed = rawTitle.trim();
  if (!trimmed) {
    return {
      isValid: false,
      wordCount: 0,
      exceedsWordLimit: false,
      detectedSensitiveKeywords: [],
      rephraseMessage: 'Title cannot be empty.'
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const exceedsWordLimit = wordCount > TITLE_MAX_WORDS;

  const lower = trimmed.toLowerCase();
  const detected = SENSITIVE_ANTI_DATING_KEYWORDS.filter((pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lower);
  });

  const isValid = !exceedsWordLimit && detected.length === 0;

  let rephraseMessage: string | undefined;
  if (exceedsWordLimit) {
    rephraseMessage = `Title exceeds ${TITLE_MAX_WORDS} words (currently ${wordCount} words). A mindful hook should be short and focused.`;
  } else if (detected.length > 0) {
    rephraseMessage = `Title contains sensitive/dating-oriented keywords (${detected.map((d) => `"${d}"`).join(', ')}). Bubl is strictly for platonic, intellectual pen pals. Please rephrase around a thought or craft.`;
  }

  return {
    isValid,
    wordCount,
    exceedsWordLimit,
    detectedSensitiveKeywords: detected,
    rephraseMessage
  };
}

export function cleanseTitle(rawTitle: string): string {
  let cleaned = rawTitle.trim();
  SENSITIVE_ANTI_DATING_KEYWORDS.forEach((pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '...');
  });
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > TITLE_MAX_WORDS) {
    return words.slice(0, TITLE_MAX_WORDS).join(' ') + '...';
  }
  return cleaned;
}

export function analyzeContent(rawContent: string): ContentAnalysisResult {
  const trimmed = rawContent.trim();
  const lower = trimmed.toLowerCase();

  const detected = SENSITIVE_ANTI_DATING_KEYWORDS.filter((pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lower);
  });

  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z0-9]+\.(com|org|net|io|co|app))/i;
  const containsLinks = urlRegex.test(trimmed);

  const mediaRegex = /\.(png|jpe?g|gif|webp|mp4|mov|mp3|wav|ogg)\b/i;
  const containsMedia = mediaRegex.test(trimmed);

  const isClean = detected.length === 0 && !containsLinks && !containsMedia;

  let rephraseGuidance: string | undefined;
  if (detected.length > 0) {
    rephraseGuidance = `We noticed words commonly associated with romantic solicitation or heated discussion (${detected.map((w) => `"${w}"`).join(', ')}). Please reshape this bubble around personal reflections, philosophy, or hobbies before blowing it into the atmosphere.`;
  } else if (containsLinks) {
    rephraseGuidance = 'Public bubbles cannot include links or URLs. Share links in 1-on-1 private correspondence once a mutual connection is forged.';
  } else if (containsMedia) {
    rephraseGuidance = 'Media file references are not permitted in public bubbles. Direct photos/soundscapes require mutual handshake approval in 1-on-1 chats.';
  }

  return {
    isClean,
    detectedSensitiveKeywords: detected,
    containsLinks,
    containsMedia,
    rephraseGuidance
  };
}
