import React, { useState } from 'react';
import { BubblePost, UserProfile, BubbleType } from '../types';
import { ALL_HOBBIES, BUBBLE_PALETTES, BUBBLE_TYPES, THOUGHT_SPARKS, SENSITIVE_ANTI_DATING_KEYWORDS, HOBBY_ICONS } from '../data/mockData';
import {
  analyzeTitle,
  cleanseTitle,
  analyzeContent,
  TITLE_MAX_WORDS
} from '../services/moderationService';
import {
  X,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  CircleDot,
  FileText,
  HelpCircle,
  Sparkles,
  Lamp,
  Flame,
  Feather,
  Lock,
  Wind
} from 'lucide-react';
import { playBreezeBlowingSound } from '../services/soundEffects';

interface CreateBubbleModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (bubble: Omit<BubblePost, 'id' | 'publishedAt'>) => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const TYPE_ICONS: Record<BubbleType, React.ReactNode> = {
  thought: <FileText className="w-4 h-4 text-stone-700" />,
  echo: <HelpCircle className="w-4 h-4 text-sky-700" />,
  resonance: <Sparkles className="w-4 h-4 text-amber-700" />,
  lantern: <Lamp className="w-4 h-4 text-amber-600" />,
  ember: <Flame className="w-4 h-4 text-rose-600" />,
  haiku: <Feather className="w-4 h-4 text-emerald-700" />
};

export const CreateBubbleModal: React.FC<CreateBubbleModalProps> = ({
  user,
  isOpen,
  onClose,
  onPublish
}) => {
  const unlockedList = user.unlockedBubbleTypes || ['thought', 'echo'];
  const [bubbleType, setBubbleType] = useState<BubbleType>(
    unlockedList[0] || 'thought'
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [promptQuestion, setPromptQuestion] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(
    (user.hobbies || []).slice(0, 3)
  );
  const [selectedPalette, setSelectedPalette] = useState(BUBBLE_PALETTES[0]);
  const [breathBlowingEffort, setBreathBlowingEffort] = useState<'gentle' | 'balanced' | 'deep'>('deep');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSuspended = Boolean(user.suspendedUntil && user.suspendedUntil > Date.now());
  const titleAnalysis = analyzeTitle(title);
  const contentAnalysis = analyzeContent(content, promptQuestion);

  // 1 bubble per week quota check
  const now = Date.now();
  const timeSinceLastPublish = user.lastBubblePublishedAt
    ? now - user.lastBubblePublishedAt
    : Infinity;
  const canPublish = timeSinceLastPublish >= SEVEN_DAYS_MS && !isSuspended;
  const daysUntilNextPublish = canPublish
    ? 0
    : Math.ceil((SEVEN_DAYS_MS - timeSinceLastPublish) / (24 * 60 * 60 * 1000));

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
    } else {
      if (selectedHobbies.length < 4) {
        setSelectedHobbies([...selectedHobbies, hobby]);
      }
    }
  };

  const handleValidateAndPublish = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSuspended) {
      setError(
        'Account Suspended: You have reached 3 content moderation violations. You cannot release bubbles during your 7-day suspension.'
      );
      return;
    }

    if (!canPublish) {
      setError(
        `Weekly limit: You can release 1 bubble per week. Your next bubble unlocks in ${daysUntilNextPublish} day(s).`
      );
      return;
    }

    if (!unlockedList.includes(bubbleType)) {
      setError('This bubble type is currently locked.');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // Strict Title Moderation: Word limit & Cringe/Dating/Offensive words
    if (!titleAnalysis.isValid) {
      setError(
        titleAnalysis.rephraseMessage ||
          'Title must be clean of cringe/dating keywords and within the 10-word limit.'
      );
      return;
    }

    if (trimmedTitle.length < 4) {
      setError('Please provide a thoughtful title hook (at least 4 characters).');
      return;
    }

    if (trimmedContent.length < 40) {
      setError(
        'A bubble encapsulates real thoughts. Please write at least 40 characters for readers to discover once burst.'
      );
      return;
    }

    if (bubbleType === 'echo' && promptQuestion.trim().length < 8) {
      setError('Please provide the echo question for readers to answer.');
      return;
    }

    // Privacy rule checks
    if (contentAnalysis.containsLinks) {
      setError(
        'Privacy rule: Public bubbles cannot contain links or URLs. You can share links and references only after mutual handshake in 1-on-1 private correspondence.'
      );
      return;
    }

    if (contentAnalysis.containsMedia) {
      setError(
        'Privacy rule: Photos or media cannot be attached to public bubbles. Pen pals must first mutually approve media in 1-on-1 private correspondence.'
      );
      return;
    }

    if (selectedHobbies.length === 0) {
      setError('Please select at least 1 matching hobby tag.');
      return;
    }

    playBreezeBlowingSound();
    onPublish({
      authorId: user.id,
      authorName: user.nickname,
      authorAge: user.age,
      authorLocation: user.location,
      authorAvatar: user.avatar,
      title: trimmedTitle,
      content: trimmedContent,
      promptQuestion: bubbleType === 'echo' ? promptQuestion.trim() : undefined,
      hobbies: selectedHobbies,
      bubbleColor: selectedPalette.tint,
      bubbleType,
      distanceKm: 0,
      isUserBubble: true,
      moderationStatus: 'scanning' // Enters community airspace immediately; deep asynchronous service analyzes content in background
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F8F4EE] to-[#F3ECE4] rounded-[2.5rem] border border-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Specular crescent */}
        <div className="bubble-specular-crescent opacity-70" />

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-stone-200/60 bg-white/70 backdrop-blur-md relative z-10">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 tracking-tight flex items-center gap-2 font-serif-letter">
              <span>🫧</span>
              <span>Blow & Release a Bubble</span>
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Drifts across the global atmosphere · 1 bubble per week limit
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-stone-200/60 border border-stone-200/50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suspension Notice */}
        {isSuspended && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-2 text-xs text-rose-900">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Account Suspended:</strong> You have reached 3 content violations. Releasing bubbles is disabled during your 7-day suspension.
            </span>
          </div>
        )}

        {/* Quota Notice */}
        {!canPublish && !isSuspended && (
          <div className="bg-amber-50 border-b border-amber-200/60 px-6 py-3 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Weekly quota: You have already released a bubble this week. Next
              bubble unlocks in <strong>{daysUntilNextPublish} days</strong>.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleValidateAndPublish}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Bubble Type Selector with Locked States */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-stone-700 block">
                Select Bubble Type (Unlocked: {unlockedList.length}/{BUBBLE_TYPES.length})
              </label>
              <span className="text-[11px] text-stone-400">
                More unlocked through breath mastery & gifts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BUBBLE_TYPES.map((type) => {
                const isUnlocked = unlockedList.includes(type.id);
                const isSelected = bubbleType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => setBubbleType(type.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      !isUnlocked
                        ? 'opacity-40 bg-stone-100/60 border-stone-200 cursor-not-allowed'
                        : isSelected
                        ? 'border-stone-900 bg-white shadow-xs ring-1 ring-stone-900'
                        : 'border-stone-200 bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-1 rounded-md bg-stone-100">
                        {TYPE_ICONS[type.id] || <FileText className="w-4 h-4 text-stone-700" />}
                      </div>
                      {!isUnlocked && <Lock className="w-3 h-3 text-stone-400" />}
                    </div>
                    <span className="text-xs font-semibold block text-stone-900 truncate">
                      {type.name}
                    </span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">
                      {isUnlocked ? type.tagline : type.unlockRequirement}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Echo Question Input (if Echo Bubble selected) */}
          {bubbleType === 'echo' && (
            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-1.5">
              <label className="text-xs font-medium text-sky-950 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                <span>The Echo Question (Respondents must answer to connect)</span>
              </label>
              <input
                type="text"
                value={promptQuestion}
                onChange={(e) => setPromptQuestion(e.target.value)}
                placeholder="e.g. What is a book or memory that completely shaped who you are?"
                className="w-full px-3 py-1.5 text-xs bg-white border border-sky-300 rounded-lg text-sky-900 focus:outline-none"
              />
            </div>
          )}

          {/* Thought Sparks (Slowly-style writing inspiration) */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Thought Sparks (Slowly-inspired writing prompts)</span>
              </div>
              <span className="text-[10px] text-amber-700/80">Click a spark to inspire your title & prose</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THOUGHT_SPARKS.map((spark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(spark.title);
                    if (!content.trim() || content.startsWith('Reflection on:')) {
                      setContent(`Reflection on "${spark.prompt}":\n\n`);
                    }
                  }}
                  className="text-left p-2 rounded-lg bg-white hover:bg-amber-100/50 border border-amber-200 hover:border-amber-400 transition-all text-xs group"
                >
                  <span className="font-semibold text-stone-900 block group-hover:text-amber-900 text-[11px]">
                    ✦ {spark.title}
                  </span>
                  <span className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                    {spark.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Hook with Strict 10-Word Limit and Auto-Cleanse */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700 block">
                Bubble Title / Hook
              </label>
              <span
                className={`text-[11px] font-mono ${
                  titleAnalysis.exceedsWordLimit
                    ? 'text-rose-600 font-bold'
                    : titleAnalysis.wordCount >= TITLE_MAX_WORDS - 2
                    ? 'text-amber-600 font-medium'
                    : 'text-stone-400'
                }`}
              >
                {titleAnalysis.wordCount}/{TITLE_MAX_WORDS} words max
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={title}
                disabled={!canPublish || isSuspended}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. On quiet Sunday mornings, pour-overs, and secondhand books"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none transition-all disabled:opacity-50 ${
                  titleAnalysis.flaggedKeywords.length > 0 || titleAnalysis.exceedsWordLimit
                    ? 'border-rose-300 focus:ring-1 focus:ring-rose-500'
                    : 'border-stone-200 focus:ring-1 focus:ring-stone-900'
                }`}
              />
            </div>

            {/* Title Flagged Alert & Auto-Cleanse Action */}
            {titleAnalysis.flaggedKeywords.length > 0 && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-800 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>
                    Dating/cringe terms detected:{' '}
                    <strong>{titleAnalysis.flaggedKeywords.join(', ')}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTitle(titleAnalysis.cleanSuggestedTitle)}
                  className="px-2.5 py-1 bg-white border border-rose-300 text-rose-900 rounded-lg text-[11px] font-medium hover:bg-rose-100/60 transition-colors shrink-0 shadow-2xs"
                  title="Remove all cringe keywords and sanitize title"
                >
                  ⚡ Cleanse Title
                </button>
              </div>
            )}

            {/* Word limit exceeded notice */}
            {titleAnalysis.exceedsWordLimit && (
              <p className="text-[11px] text-rose-600 font-medium">
                Title exceeds {TITLE_MAX_WORDS} words ({titleAnalysis.wordCount}/{TITLE_MAX_WORDS}). Shorten it so community members can scan quickly.
              </p>
            )}
          </div>

          {/* Breath Effort When Blowing this Bubble */}
          <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-800 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span>Breath Energy & Air Current</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                Steady breathing expands lung capacity
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'deep', label: 'Deep Calm Breath', xp: '+25 Breath XP' },
                { id: 'gentle', label: 'Gentle Steady Breath', xp: '+18 Breath XP' },
                { id: 'balanced', label: 'Focused Breath', xp: '+10 Breath XP' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBreathBlowingEffort(b.id as any)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    breathBlowingEffort === b.id
                      ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="block text-[11px] font-medium">{b.label}</span>
                  <span className="text-[10px] text-stone-400 font-mono">{b.xp}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Palette Tint Selector */}
          <div>
            <label className="text-xs font-medium text-stone-700 block mb-2">
              Bubble Aura Hue
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {BUBBLE_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setSelectedPalette(palette)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 ${
                    selectedPalette.id === palette.id
                      ? 'border-stone-900 shadow-xs ring-1 ring-stone-900 text-stone-900'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                  style={{ backgroundColor: palette.tint }}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: palette.badge }}
                  />
                  <span>{palette.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bubble Prose */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-700">
                Inner Thoughts (Revealed when burst)
              </label>
              <span className="text-[11px] text-stone-400">
                {content.length} chars (min 60)
              </span>
            </div>
            <div className="relative bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <textarea
                rows={6}
                value={content}
                disabled={!canPublish || isSuspended}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write from your soul. What makes you think? What rituals anchor you? What are you curious to know about a stranger's thoughts?..."
                className="w-full bg-transparent focus:outline-none text-sm text-stone-800 leading-relaxed font-serif-letter resize-none disabled:opacity-50"
              />
            </div>

            {/* Live Content Rephrase Guidance */}
            {content.length > 0 && !contentAnalysis.isClean && (
              <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-950 space-y-1 mt-2 animate-fade-in">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Thought Guidance & Rephrasing Advice</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {contentAnalysis.rephraseGuidance}
                </p>
                <p className="text-[10px] text-amber-700/80 font-mono pt-0.5">
                  ✦ Clean titles release immediately; our asynchronous service deep-reviews contents. If sensitive words are released, the bubble is brought down with a warning.
                </p>
              </div>
            )}
          </div>

          {/* Restyled Hobbies Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-800 flex items-center gap-1.5">
                <span>✦</span>
                <span>Tag Resonant Passions ({selectedHobbies.length}/4)</span>
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                Matches are attracted by shared topics
              </span>
            </div>

            {/* Active Selected Preview Pills */}
            {selectedHobbies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-amber-50/60 rounded-xl border border-amber-200/60">
                {selectedHobbies.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-900 text-white text-[11px] font-medium shadow-2xs"
                  >
                    <span>{HOBBY_ICONS[h] || '✦'}</span>
                    <span>{h}</span>
                    <button
                      type="button"
                      onClick={() => toggleHobby(h)}
                      className="ml-1 text-stone-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Scrollable Hobbies Grid */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-stone-100/70 rounded-xl border border-stone-200/80">
              {ALL_HOBBIES.map((hobby) => {
                const isSelected = selectedHobbies.includes(hobby);
                const isMax = selectedHobbies.length >= 4 && !isSelected;

                return (
                  <button
                    key={hobby}
                    type="button"
                    disabled={isMax}
                    onClick={() => toggleHobby(hobby)}
                    className={`px-2.5 py-1 text-xs rounded-xl border transition-all flex items-center gap-1.5 select-none ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-medium'
                        : isMax
                        ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
                        : 'bg-white text-stone-700 border-stone-200/90 hover:border-amber-400 hover:bg-amber-50/50 shadow-2xs'
                    }`}
                  >
                    <span>{HOBBY_ICONS[hobby] || '✦'}</span>
                    <span>{hobby}</span>
                    {isSelected && <span className="text-[10px] text-amber-300">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF7F2] flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Bubbles stay adrift for the community to discover
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleValidateAndPublish}
              disabled={!canPublish}
              className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Blow & Release Bubble
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
