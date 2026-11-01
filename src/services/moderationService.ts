import { SENSITIVE_ANTI_DATING_KEYWORDS } from '../data/mockData';

export const TITLE_MAX_WORDS = 10;

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
  'boyfriend material',
  'girlfriend material',
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
  'scam',
  'bitch',
  'asshole',
  'retard'
];

export const ALL_FLAGGED_KEYWORDS = Array.from(
  new Set([...SENSITIVE_ANTI_DATING_KEYWORDS, ...CRINGE_DATING_PATTERNS, ...OFFENSIVE_PATTERNS])
);

export interface TitleAnalysisResult {
  isValid: boolean;
  wordCount: number;
  maxWords: number;
  exceedsWordLimit: boolean;
  flaggedKeywords: string[];
  cleanSuggestedTitle: string;
  rephraseMessage?: string;
}

export interface ContentAnalysisResult {
  isClean: boolean;
  flaggedKeywords: string[];
  containsLinks: boolean;
  containsMedia: boolean;
  rephraseGuidance?: string;
}

export interface AsyncModerationResult {
  bubbleId: string;
  approved: boolean;
  flaggedWords: string[];
  reason?: string;
  processedAt: number;
}

/**
 * Counts words separated by whitespace
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Scans a string for sensitive or cringe dating keywords
 */
export function findFlaggedKeywords(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const keyword of ALL_FLAGGED_KEYWORDS) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, 'i');
    if (regex.test(lower)) {
      matched.add(keyword);
    }
  }

  return Array.from(matched);
}

/**
 * Sanitizes and cleanses title: removes cringe/dating/offensive keywords at all costs
 * and enforces the word limit.
 */
export function cleanseTitle(rawTitle: string): {
  cleanedTitle: string;
  removedWords: string[];
  wasTruncated: boolean;
} {
  if (!rawTitle) return { cleanedTitle: '', removedWords: [], wasTruncated: false };

  let workingTitle = rawTitle;
  const removedWords: string[] = [];

  // Remove offending keywords case-insensitively
  for (const keyword of ALL_FLAGGED_KEYWORDS) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (regex.test(workingTitle)) {
      removedWords.push(keyword);
      workingTitle = workingTitle.replace(regex, ' ');
    }
  }

  // Remove URLs or handles
  workingTitle = workingTitle.replace(/https?:\/\/\S+/gi, '').replace(/www\.\S+/gi, '');

  // Collapse excess whitespace and trim
  let words = workingTitle.trim().split(/\s+/).filter(Boolean);
  let wasTruncated = false;

  // Enforce word limit on title
  if (words.length > TITLE_MAX_WORDS) {
    words = words.slice(0, TITLE_MAX_WORDS);
    wasTruncated = true;
  }

  let cleanedTitle = words.join(' ');
  // If title was emptied completely by filtering, provide an elegant placeholder
  if (!cleanedTitle && rawTitle.trim()) {
    cleanedTitle = 'Quiet thoughts and morning observations';
  }

  return {
    cleanedTitle,
    removedWords,
    wasTruncated
  };
}

/**
 * Analyzes the title strictly for word limit, offensive language, and dating cringe keywords.
 */
export function analyzeTitle(rawTitle: string): TitleAnalysisResult {
  const trimmed = (rawTitle || '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const exceedsWordLimit = wordCount > TITLE_MAX_WORDS;
  const flaggedKeywords = findFlaggedKeywords(trimmed);
  const { cleanedTitle } = cleanseTitle(trimmed);

  let isValid = true;
  let rephraseMessage: string | undefined;

  if (wordCount < 1) {
    isValid = false;
    rephraseMessage = 'Title is required.';
  } else if (exceedsWordLimit) {
    isValid = false;
    rephraseMessage = `Title exceeds word limit (${wordCount}/${TITLE_MAX_WORDS} words). Make it concise to allow quick community scanning.`;
  } else if (flaggedKeywords.length > 0) {
    isValid = false;
    rephraseMessage = `Cringe / dating keywords detected in title: "${flaggedKeywords.join(
      ', '
    )}". Titles must be clean and unhurried. Please rephrase or use the Cleanse Title button.`;
  }

  return {
    isValid,
    wordCount,
    maxWords: TITLE_MAX_WORDS,
    exceedsWordLimit,
    flaggedKeywords,
    cleanSuggestedTitle: cleanedTitle,
    rephraseMessage
  };
}

/**
 * Analyzes content before publishing to prompt rephrasing if sensitive words or links are found.
 */
export function analyzeContent(
  content: string,
  promptQuestion?: string
): ContentAnalysisResult {
  const combined = `${content || ''} ${promptQuestion || ''}`.trim();
  const flaggedKeywords = findFlaggedKeywords(combined);

  const linkRegex = /(https?:\/\/|www\.|\.com\b|\.org\b|\.net\b|\.io\b|\.app\b|\.me\b|\.co\b|http:\/\/)/i;
  const containsLinks = linkRegex.test(combined);

  const mediaRegex = /<img|!\[.*\]\(.*\)/i;
  const containsMedia = mediaRegex.test(combined);

  const isClean = flaggedKeywords.length === 0 && !containsLinks && !containsMedia;

  let rephraseGuidance: string | undefined;
  if (flaggedKeywords.length > 0) {
    rephraseGuidance = `We noticed phrasing like "${flaggedKeywords.slice(0, 3).join(', ')}". Bubble is a sanctuary for ideas, crafts, and books—not dating or hookup solicitations. Please rephrase your thought around intellectual or observational themes before releasing.`;
  } else if (containsLinks) {
    rephraseGuidance = 'Public bubbles cannot include links or web URLs. Links can be shared in 1-on-1 conversations after mutual handshake.';
  } else if (containsMedia) {
    rephraseGuidance = 'Public bubbles cannot contain media attachments. Photos and voice memos are shared solely in 1-on-1 private correspondence.';
  }

  return {
    isClean,
    flaggedKeywords,
    containsLinks,
    containsMedia,
    rephraseGuidance
  };
}

/**
 * Asynchronous content moderation service.
 * Simulates deep asynchronous processing of bubble content in the background
 * after the title is approved and released to the public airspace.
 * If sensitive/cringe content is detected, it reports back to take down the bubble
 * and issue an official warning.
 */
export async function processBubbleContentAsync(
  bubbleId: string,
  title: string,
  content: string,
  promptQuestion?: string
): Promise<AsyncModerationResult> {
  // Simulate asynchronous background service pipeline (3.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 3500));

  const combined = `${content} ${promptQuestion || ''}`.toLowerCase();
  const flagged = findFlaggedKeywords(combined);

  // Check for external link violations
  const linkRegex = /(https?:\/\/|www\.|\.com\b|\.org\b|\.net\b|\.io\b|\.app\b|\.me\b|\.co\b)/i;
  const hasLinks = linkRegex.test(combined);

  if (flagged.length > 0) {
    return {
      bubbleId,
      approved: false,
      flaggedWords: flagged,
      reason: `Asynchronous content review flagged dating/cringe or offensive terms: "${flagged.join(
        ', '
      )}". Bubble strictly disallows dating solicitations, intimacy requests, and inappropriate language in public airspace.`,
      processedAt: Date.now()
    };
  }

  if (hasLinks) {
    return {
      bubbleId,
      approved: false,
      flaggedWords: ['unauthorized_link'],
      reason: 'Asynchronous review detected external URLs or links in public content. Public bubbles are link-free to protect community members.',
      processedAt: Date.now()
    };
  }

  return {
    bubbleId,
    approved: true,
    flaggedWords: [],
    processedAt: Date.now()
  };
}
