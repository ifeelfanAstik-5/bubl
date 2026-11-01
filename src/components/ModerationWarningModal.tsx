import React from 'react';
import { ModerationWarningRecord, UserProfile } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface ModerationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  warningRecord: ModerationWarningRecord | null;
  currentUser: UserProfile;
  onResetWarningsAndSuspension: () => void;
}

export const ModerationWarningModal: React.FC<ModerationWarningModalProps> = ({
  isOpen,
  onClose,
  warningRecord,
  currentUser,
  onResetWarningsAndSuspension
}) => {
  if (!isOpen || !warningRecord) return null;

  const warningCount = warningRecord.warningNumber;
  const isSuspended = warningRecord.resultedInSuspension || (currentUser.suspendedUntil && currentUser.suspendedUntil > Date.now());

  const suspensionEndDate = currentUser.suspendedUntil
    ? new Date(currentUser.suspendedUntil).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#FAF7F2] rounded-[2.5rem] border border-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative">
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isSuspended
              ? 'bg-rose-900 text-white border-rose-950'
              : 'bg-amber-100/80 text-amber-950 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className={`w-5 h-5 ${isSuspended ? 'text-rose-300' : 'text-amber-700'}`} />
            <div>
              <h3 className="font-semibold text-sm">
                {isSuspended
                  ? 'Account Suspended (7 Days)'
                  : `Community Moderation Warning (${warningCount} of 3)`}
              </h3>
              <p className={`text-[11px] ${isSuspended ? 'text-rose-200' : 'text-amber-800'}`}>
                {isSuspended
                  ? '3 content moderation violations reached'
                  : 'Asynchronous Content Moderation Service Notice'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isSuspended
                ? 'text-rose-200 hover:text-white hover:bg-rose-800'
                : 'text-amber-800 hover:text-stone-900 hover:bg-amber-200/50'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Taken Down Bubble Notice */}
          <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Bubble Brought Down from Community Airspace</span>
            </div>
            <p className="text-xs text-stone-700 font-serif-letter italic bg-stone-50 p-2.5 rounded-lg border border-stone-200">
              "{warningRecord.bubbleTitle}"
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              {warningRecord.reason}
            </p>
            {warningRecord.flaggedWords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-stone-400 font-mono">FLAGGED TERMS:</span>
                {warningRecord.flaggedWords.map((word) => (
                  <span
                    key={word}
                    className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-mono font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3 Warnings Progression Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800">Warning Status</span>
              <span className="font-mono text-stone-500">
                {warningCount}/3 Violations
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { step: 1, label: 'Warning 1', sub: 'First Notice' },
                { step: 2, label: 'Warning 2', sub: 'Final Notice' },
                { step: 3, label: 'Warning 3', sub: '1-Wk Suspension' }
              ].map((tier) => {
                const isActive = warningCount >= tier.step;
                const isCurrent = warningCount === tier.step;

                return (
                  <div
                    key={tier.step}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      tier.step === 3 && isActive
                        ? 'border-rose-500 bg-rose-50'
                        : isActive
                        ? 'border-amber-400 bg-amber-50/70'
                        : 'border-stone-200 bg-stone-50 opacity-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-stone-900 flex items-center justify-center gap-1">
                      {isActive ? (
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            tier.step === 3 ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-stone-300 inline-block" />
                      )}
                      <span>{tier.label}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {tier.sub}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suspension Callout */}
          {isSuspended && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Clock className="w-4 h-4 text-rose-700" />
                <span>Account Suspended for 7 Days</span>
              </div>
              <p className="text-xs leading-relaxed">
                You have reached 3 content warnings. To preserve our calm, intellectual environment, your account is suspended until <strong>{suspensionEndDate}</strong>. You cannot publish new bubbles, burst community bubbles, or send direct messages during this period.
              </p>
            </div>
          )}

          {/* Guidelines Reminder */}
          <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-200 space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Why Was My Bubble Brought Down?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600">
              Bubble is intentionally designed as an introverts' haven for thoughts, book reflections, and craft discussions. We actively filter cringe dating solicitations, pickup attempts, and offensive rhetoric to prevent lookism and superficial swipe behavior.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-100/70 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              onResetWarningsAndSuspension();
              onClose();
            }}
            title="Reset warnings for developer test"
            className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Dev Test: Reset Warnings</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors shadow-xs"
          >
            I Acknowledge & Understand
          </button>
        </div>
      </div>
    </div>
  );
};
