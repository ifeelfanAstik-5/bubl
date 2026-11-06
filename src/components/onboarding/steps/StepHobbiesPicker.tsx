import React, { useState } from 'react';
import { HOBBY_CATEGORIES, HOBBY_ICONS } from '../../../../shared/constants';
import { Sparkles, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface StepHobbiesPickerProps {
  selectedHobbies: string[];
  onChange: (hobbies: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepHobbiesPicker: React.FC<StepHobbiesPickerProps> = ({
  selectedHobbies,
  onChange,
  onNext,
  onBack
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const toggleHobby = (hobby: string) => {
    setError(null);
    if (selectedHobbies.includes(hobby)) {
      onChange(selectedHobbies.filter((h) => h !== hobby));
    } else {
      if (selectedHobbies.length >= 6) {
        setError('You may select up to 6 core passions for mindful affinity.');
        return;
      }
      onChange([...selectedHobbies, hobby]);
    }
  };

  const handleProceed = () => {
    if (selectedHobbies.length < 3) {
      setError('Please select at least 3 passions to anchor your mindful affinity.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-5 animate-fade-in text-stone-800">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Passions, Craft & Analog Pleasures
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Choose 3 to 6 genuine interests. Other pen pals will discover your bubbles through harmonic shared resonance.
        </p>
      </div>

      {/* Counter Banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span className="text-stone-800 font-medium">Selected Passions:</span>
        </div>
        <div className="font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white border border-amber-300 text-amber-900">
          {selectedHobbies.length} / 6 (minimum 3)
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All Passions
        </button>
        {HOBBY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Hobbies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
        {HOBBY_CATEGORIES.flatMap((c) =>
          activeCategory === 'all' || activeCategory === c.id ? c.hobbies : []
        )
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((hobby) => {
            const isSelected = selectedHobbies.includes(hobby);
            const icon = HOBBY_ICONS[hobby] || '✨';
            return (
              <button
                key={hobby}
                type="button"
                onClick={() => toggleHobby(hobby)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 text-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-100/90 to-rose-100/70 border-amber-400 text-amber-950 font-semibold shadow-xs ring-1 ring-amber-300'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100/80 hover:border-stone-300'
                }`}
              >
                <span className="text-base shrink-0">{icon}</span>
                <span className="truncate flex-1">{hobby}</span>
                {isSelected && <span className="text-amber-800 text-[11px] font-bold">✓</span>}
              </button>
            );
          })}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl bg-stone-100 text-stone-700 font-medium text-xs hover:bg-stone-200 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          disabled={selectedHobbies.length < 3}
          className="flex-1 py-3 px-6 rounded-2xl bg-stone-900 text-white font-medium text-xs tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <span>Continue to First Bubble Ritual</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
