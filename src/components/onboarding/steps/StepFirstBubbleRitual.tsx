import React, { useState } from 'react';
import { Sparkles, Wind, ArrowLeft, Droplets, AlertCircle } from 'lucide-react';
import { playWandBlowSound, playBubblePopSound } from '../../../services/soundEffects';

interface StepFirstBubbleRitualProps {
  firstBubbleTitle: string;
  onTitleChange: (val: string) => void;
  firstBubbleContent: string;
  onContentChange: (val: string) => void;
  bubbleType: string;
  onBubbleTypeChange: (val: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

const STARTER_PROMPTS = [
  'What quiet ritual or craft centers you when the hurried world feels overwhelming?',
  'A book, film, or memory that gently altered how you see life?',
  'What is a question you have been holding quietly without an easy answer?'
];

export const StepFirstBubbleRitual: React.FC<StepFirstBubbleRitualProps> = ({
  firstBubbleTitle,
  onTitleChange,
  firstBubbleContent,
  onContentChange,
  bubbleType,
  onBubbleTypeChange,
  onSubmit,
  onBack,
  isSubmitting,
  error
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isBlowing, setIsBlowing] = useState(false);

  const wordCount = firstBubbleTitle.trim() ? firstBubbleTitle.trim().split(/\s+/).length : 0;
  const isTitleTooLong = wordCount > 10;

  const handleApplyPrompt = (prompt: string) => {
    onContentChange(prompt);
  };

  const handleHoldToBlow = () => {
    setLocalError(null);

    if (!firstBubbleTitle.trim()) {
      setLocalError('Please write a mindful title for your debut bubble.');
      return;
    }

    if (isTitleTooLong) {
      setLocalError('Titles are limited to 10 mindful words.');
      return;
    }

    if (!firstBubbleContent.trim() || firstBubbleContent.trim().length < 15) {
      setLocalError('Please write at least a few thoughtful sentences (15+ characters).');
      return;
    }

    setIsBlowing(true);
    playWandBlowSound();

    setTimeout(() => {
      setIsBlowing(false);
      playBubblePopSound();
      onSubmit();
    }, 1800);
  };

  return (
    <div className="space-y-5 animate-fade-in text-stone-800">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Uncork Your Vial · First Bubble Ritual
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Every traveler is gifted a 100ml Starter Soap Mixture Vial. Blowing your debut thought expends 25ml.
        </p>
      </div>

      {/* Vial Graphic & Physics Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50/70 via-sky-50/50 to-rose-50/70 border border-stone-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 rounded-2xl bg-white border border-stone-200 p-1 flex flex-col items-center justify-end overflow-hidden shadow-xs relative">
            {/* Liquid level */}
            <div className="w-full bg-gradient-to-t from-sky-400/80 to-amber-300/80 rounded-b-xl h-3/4 transition-all animate-pulse" />
            <Droplets className="w-4 h-4 text-sky-700 absolute top-2 inset-x-0 mx-auto" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5 font-serif">
              <span>Starter Soap Mixture Vial</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                100ml Capacity
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
              Expends <strong>-25ml</strong> for this first blow (leaves <strong>75ml</strong>). Refilled by morning dew (+30ml) & breath pauses.
            </p>
          </div>
        </div>
      </div>

      {(error || localError) && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Starter Prompts */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
          Inspirations for your debut thought:
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPrompt(prompt)}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-300 text-stone-700 text-xs transition-colors line-clamp-1"
            >
              💭 "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Bubble Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-stone-700 uppercase tracking-wider">
            Debut Bubble Title <span className="text-rose-500">*</span>
          </label>
          <span className={`font-mono text-[11px] ${isTitleTooLong ? 'text-rose-600 font-bold' : 'text-stone-400'}`}>
            {wordCount}/10 words
          </span>
        </div>
        <input
          type="text"
          value={firstBubbleTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Quiet Morning Light and Secondhand Paperbacks"
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400 font-serif"
          required
        />
      </div>

      {/* Bubble Reflection Content */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
          Reflection Body <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          value={firstBubbleContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Write your genuine reflection to the community airspace. What thoughts or curiosities are you releasing to the world today?"
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400 leading-relaxed resize-none"
          required
        />
      </div>

      {/* Wand Hold-to-Blow Button */}
      <div className="pt-2 space-y-3">
        <button
          type="button"
          onClick={handleHoldToBlow}
          disabled={isSubmitting || isBlowing || !firstBubbleTitle.trim() || isTitleTooLong}
          className={`w-full py-4 px-6 rounded-2xl text-white font-medium text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden ${
            isBlowing
              ? 'bg-amber-600 scale-[0.99] ring-4 ring-amber-300/50'
              : 'bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:pointer-events-none'
          }`}
        >
          {isBlowing ? (
            <>
              <Wind className="w-5 h-5 text-amber-200 animate-pulse" />
              <span>Blowing Debut Bubble into Airspace... (-25ml)</span>
            </>
          ) : isSubmitting ? (
            <>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span>Establishing Soul Presence in Atmosphere...</span>
            </>
          ) : (
            <>
              <span className="text-lg">🫧</span>
              <span>Uncork Wand & Blow First Bubble (-25ml)</span>
            </>
          )}
        </button>

        <div className="flex justify-between items-center text-xs text-stone-400 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-stone-600 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Passions</span>
          </button>
          <span>You will enter at Breath Level 1 (0 XP) with 75ml vial remaining</span>
        </div>
      </div>
    </div>
  );
};
