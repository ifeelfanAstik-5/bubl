import React, { useState } from 'react';
import { BubblePost, UserProfile, DeclineReason } from '../types';
import { Avatar2D } from './Avatar2D';
import { playBreezeBlowingSound } from '../services/soundEffects';
import {
  X,
  MapPin,
  Send,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Wind,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface BurstBubbleModalProps {
  bubble: BubblePost | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendResponse: (
    bubble: BubblePost,
    messageText: string,
    breathEffort: 'gentle' | 'balanced' | 'deep'
  ) => void;
  onDeclineBubble: (bubbleId: string, reason: DeclineReason, customNote?: string) => void;
  canAddFriend: boolean;
  activeFriendsCount: number;
}

export const BurstBubbleModal: React.FC<BurstBubbleModalProps> = ({
  bubble,
  currentUser,
  isOpen,
  onClose,
  onSendResponse,
  onDeclineBubble,
  canAddFriend,
  activeFriendsCount
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [breathEffort, setBreathEffort] = useState<'gentle' | 'balanced' | 'deep'>('gentle');
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState<DeclineReason>('no_shared_interests');
  const [customDeclineNote, setCustomDeclineNote] = useState('');

  if (!isOpen || !bubble) return null;

  const handleSend = () => {
    if (!responseText.trim() || responseText.trim().length < 15) return;
    playBreezeBlowingSound();
    onSendResponse(bubble, responseText.trim(), breathEffort);
    setIsReplying(false);
    setResponseText('');
    onClose();
  };

  const handleConfirmDecline = () => {
    onDeclineBubble(bubble.id, declineReason, customDeclineNote.trim());
    setIsDeclining(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F8F4EE] to-[#F3ECE4] rounded-[2.5rem] border border-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Soap Bubble Specular Crescent Highlight on the Modal Top */}
        <div className="bubble-specular-crescent opacity-70" />

        {/* Top Header: Atmospheric Floating Dome */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-stone-200/60 bg-white/60 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-200 to-sky-200 flex items-center justify-center text-xs shadow-2xs">
              🫧
            </div>
            <span className="text-xs uppercase tracking-wider font-mono text-stone-800 font-semibold">
              BURST BUBBLE REVEALED
            </span>
            <span className="text-xs text-stone-300">·</span>
            <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
              <Wind className="w-3 h-3 text-stone-400" />
              ~{bubble.distanceKm.toLocaleString()} KM AWAY
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-stone-200/60 border border-stone-200/50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Chamber */}
        <div className="flex-1 overflow-y-auto p-7 md:p-9 space-y-6 relative z-10">
          {/* Author Orb Header */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-stone-200/60">
            <div className="flex items-center gap-4">
              <div className="relative p-1 rounded-full bg-white ring-2 ring-white/90 shadow-xs">
                <Avatar2D config={bubble.authorAvatar} size="lg" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] shadow-xs">
                  🫧
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900 font-serif-letter">
                  {bubble.authorName}, {bubble.authorAge}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{bubble.authorLocation}</span>
                </div>
                {/* Hobbies list */}
                <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-2 font-medium">
                  {bubble.hobbies.map((h, idx) => (
                    <React.Fragment key={h}>
                      <span className="bg-white/70 px-2 py-0.5 rounded-md border border-stone-200/50">
                        {h}
                      </span>
                      {idx < bubble.hobbies.length - 1 && (
                        <span className="text-stone-300" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-stone-400">
              <span className="uppercase px-2.5 py-1 rounded-full bg-white/80 border border-stone-200/60 text-stone-700 text-[10px] inline-block mb-1">
                {bubble.bubbleType} BUBBLE
              </span>
              <span className="block text-stone-500 text-[11px]">
                {new Date(bubble.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Echo Bubble Prompt Callout */}
          {bubble.bubbleType === 'echo' && bubble.promptQuestion && (
            <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/80 space-y-1 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-900 font-mono uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                <span>The Echo Question:</span>
              </div>
              <p className="text-sm font-semibold text-sky-950 font-serif-letter italic">
                "{bubble.promptQuestion}"
              </p>
            </div>
          )}

          {/* Resonance Bubble Celebration */}
          {bubble.bubbleType === 'resonance' && (
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/70 flex items-center gap-2 text-xs text-amber-900 font-medium backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Resonated through shared passion for{' '}
                {bubble.hobbies.filter((h) => currentUser.hobbies.includes(h)).join(', ')}.
              </span>
            </div>
          )}

          {/* Title & Revealed Inner Prose */}
          <div className="space-y-4 bg-white/70 backdrop-blur-xs p-6 rounded-3xl border border-white/90 shadow-inner">
            <h1 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight leading-snug font-serif-letter">
              {bubble.title}
            </h1>
            <div
              className={`text-stone-800 text-[15px] md:text-base leading-relaxed font-serif-letter whitespace-pre-line space-y-3 ${
                bubble.bubbleType === 'haiku'
                  ? 'italic text-base md:text-lg pl-4 border-l-2 border-amber-300'
                  : ''
              }`}
            >
              {bubble.content}
            </div>
          </div>

          {/* Decline Sub-view */}
          {isDeclining && (
            <div className="p-5 bg-white/80 rounded-3xl border border-stone-200 space-y-3 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span>🫧</span>
                  <span>Release Bubble Back to Wind</span>
                </span>
                <span className="text-xs text-stone-500">
                  Polite reason or silent release
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'no_shared_interests',
                    label: 'Looking for different shared hobbies'
                  },
                  {
                    id: 'too_many_connections',
                    label: 'Currently at friend circle capacity (50)'
                  },
                  {
                    id: 'looking_for_different_pace',
                    label: 'Looking for a different pace'
                  },
                  { id: 'silent', label: 'Release quietly without a note' }
                ].map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setDeclineReason(reason.id as DeclineReason)}
                    className={`px-3 py-2 text-xs text-left rounded-xl border transition-all ${
                      declineReason === reason.id
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>

              {declineReason !== 'silent' && (
                <div>
                  <label className="text-[11px] text-stone-500 block mb-1">
                    Optional kind note:
                  </label>
                  <input
                    type="text"
                    value={customDeclineNote}
                    onChange={(e) => setCustomDeclineNote(e.target.value)}
                    placeholder="Wishing you calm conversations across the breeze..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDeclining(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmDecline}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs"
                >
                  Confirm Release
                </button>
              </div>
            </div>
          )}

          {/* Response Composer with Breath Mechanics */}
          {isReplying && (
            <div className="p-6 bg-white/90 rounded-3xl border border-white shadow-md space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <span>🌬️</span>
                    <span>Blowing a Return Bubble to {bubble.authorName}</span>
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    {bubble.bubbleType === 'echo'
                      ? 'Answer their echo question to establish a connection'
                      : 'Connecting forms a 1-on-1 mindful bond in your circle'}
                    {' '}({activeFriendsCount}/50 friends)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Est. drift: {breathEffort === 'deep' ? '~18 mins' : breathEffort === 'gentle' ? '~15 mins' : '~10 mins'}
                  </span>
                </div>
              </div>

              {/* Breath Effort Selector */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50/60 to-sky-50/60 rounded-2xl border border-teal-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-800 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-teal-600" />
                    <span>Breath Intensity:</span>
                  </label>
                  <span className="text-[10px] text-teal-800 font-mono">
                    Steadier breath earns +15 Breath XP
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      id: 'deep',
                      label: 'Deep Exhale',
                      desc: '~18m · +15 XP'
                    },
                    {
                      id: 'gentle',
                      label: 'Balanced Puff',
                      desc: '~15m · +10 XP'
                    },
                    {
                      id: 'balanced',
                      label: 'Swift Breeze',
                      desc: '~10m · +5 XP'
                    }
                  ].map((effort) => (
                    <button
                      key={effort.id}
                      type="button"
                      onClick={() => setBreathEffort(effort.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        breathEffort === effort.id
                          ? 'border-teal-500 bg-white font-medium text-stone-900 shadow-xs'
                          : 'border-transparent bg-white/60 text-stone-600 hover:bg-white'
                      }`}
                    >
                      <span className="block font-medium text-[11px]">{effort.label}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{effort.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={5}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={
                  bubble.bubbleType === 'echo'
                    ? `Answering your question "${bubble.promptQuestion}"...\n\nFor me, this thought resonates because...`
                    : `Greetings ${bubble.authorName},\n\nYour bubble drifted across my airspace. What struck me was...`
                }
                className="w-full p-3.5 text-sm bg-[#FAF8F5] border border-stone-200 rounded-2xl font-serif-letter focus:outline-none focus:ring-1 focus:ring-stone-800 resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-400">
                  🫧 Drift begins immediately upon release
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={responseText.trim().length < 15}
                    className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-teal-900 hover:to-stone-900 rounded-xl flex items-center gap-1.5 shadow-xs disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Blow Bubble</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isReplying && !isDeclining && (
          <div className="px-7 py-4 border-t border-stone-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between relative z-10">
            <button
              onClick={() => setIsDeclining(true)}
              className="text-xs font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Release Bubble
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setIsReplying(true)}
                disabled={!canAddFriend}
                className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-amber-950 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{bubble.bubbleType === 'echo' ? 'Answer Echo & Connect' : 'Blow Reply & Connect'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
