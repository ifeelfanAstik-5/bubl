import React from 'react';
import { BubblePost, UserProfile } from '../types';
import { Trash2, Eye, Plus, Clock, ShieldAlert, Loader2, AlertTriangle, Wind, Sparkles } from 'lucide-react';

interface MyPublishedBubblesProps {
  userBubbles: BubblePost[];
  currentUser: UserProfile;
  onOpenBubble: (bubble: BubblePost) => void;
  onDeleteBubble: (id: string) => void;
  onCreateBubbleClick: () => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const MyPublishedBubbles: React.FC<MyPublishedBubblesProps> = ({
  userBubbles,
  currentUser,
  onOpenBubble,
  onDeleteBubble,
  onCreateBubbleClick
}) => {
  const now = Date.now();
  const timeSinceLastPublish = currentUser.lastBubblePublishedAt
    ? now - currentUser.lastBubblePublishedAt
    : Infinity;
  const canPublish = timeSinceLastPublish >= SEVEN_DAYS_MS;
  const daysUntilNextPublish = canPublish
    ? 0
    : Math.ceil((SEVEN_DAYS_MS - timeSinceLastPublish) / (24 * 60 * 60 * 1000));

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#FAF8F5]/90 via-[#F7F2EC]/80 to-[#F2EBE3]/90 border border-white/80 shadow-[0_16px_40px_-15px_rgba(180,165,150,0.18)] p-6 md:p-8 space-y-5 backdrop-blur-md overflow-hidden">
      {/* Header with Weekly Limit status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🫧</span>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight font-serif-letter">
              My Floating Airspace
            </h2>
            <span className="text-xs text-stone-300 font-mono">·</span>
            <span className="text-xs text-stone-500 font-sans">
              1 Bubble per week quota
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Your active thoughts drifting peacefully in the global atmosphere.
          </p>
        </div>

        {/* Weekly Quota Badge */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-stone-200/70 text-xs text-stone-700 shadow-2xs self-start sm:self-auto font-mono">
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          {canPublish ? (
            <span className="text-emerald-700 font-medium">
              Weekly Quota Ready
            </span>
          ) : (
            <span className="text-stone-600">
              Next release in {daysUntilNextPublish}d
            </span>
          )}
        </div>
      </div>

      {/* User's Bubbles List */}
      {userBubbles.length === 0 ? (
        <div className="p-8 text-center bg-white/60 backdrop-blur-xs rounded-2xl border border-dashed border-stone-300">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2 text-lg shadow-2xs">
            🫧
          </div>
          <h4 className="text-sm font-semibold text-stone-800 font-serif-letter">
            No bubbles drifting right now
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-serif-letter">
            Share what's on your mind. Travelers browsing the atmosphere can burst your bubble
            to read your thoughts and connect with you directly.
          </p>
          <button
            onClick={onCreateBubbleClick}
            className="mt-4 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-teal-900 hover:to-stone-900 rounded-full transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blow This Week's Bubble</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {userBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="bg-white/80 backdrop-blur-xs rounded-2xl border border-white p-5 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-200/80 transition-all relative overflow-hidden"
            >
              {/* Specular sheen */}
              <div className="absolute top-2 left-4 w-28 h-2 bg-gradient-to-r from-white to-transparent rounded-full opacity-60 pointer-events-none" />

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-stone-400">
                    RELEASED{' '}
                    {new Date(bubble.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>

                  {bubble.moderationStatus === 'scanning' ? (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-600" />
                      ASYNC SCANNING
                    </span>
                  ) : bubble.moderationStatus === 'flagged_taken_down' ? (
                    <span className="text-[10px] text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold">
                      <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                      BROUGHT DOWN · VIOLATION
                    </span>
                  ) : (
                    <span className="text-[10px] text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 border border-teal-200/60">
                      <Wind className="w-3 h-3 text-teal-600" />
                      DRIFTING IN AIRSPACE
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-stone-900 tracking-tight font-serif-letter">
                  {bubble.title}
                </h3>

                {bubble.moderationStatus === 'flagged_taken_down' ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-[11px] text-rose-800">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Taken down by Content Moderation Service</span>
                    </div>
                    <p className="text-[11px] text-rose-800 leading-snug">
                      {bubble.flaggedReason || 'Sensitive or cringe keywords detected during background review.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-600 font-serif-letter line-clamp-2 max-w-2xl leading-relaxed">
                    {bubble.content}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-0.5">
                  {bubble.hobbies.map((h, i) => (
                    <React.Fragment key={h}>
                      <span className="bg-stone-100/80 px-2 py-0.5 rounded-md text-stone-600">
                        {h}
                      </span>
                      {i < bubble.hobbies.length - 1 && <span>·</span>}
                    </React.Fragment>
                  ))}
                  <span className="text-stone-300">·</span>
                  <span className="font-mono text-stone-500 uppercase text-[10px]">
                    {bubble.bubbleType}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => onOpenBubble(bubble)}
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 rounded-xl border border-stone-200/80 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => onDeleteBubble(bubble.id)}
                  title="Pop and delete this bubble"
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-stone-200/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
