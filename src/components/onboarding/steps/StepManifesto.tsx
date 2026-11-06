import React from 'react';
import { Compass, Feather, Wind, ShieldCheck, HeartHandshake } from 'lucide-react';

interface StepManifestoProps {
  onAgree: () => void;
}

export const StepManifesto: React.FC<StepManifestoProps> = ({ onAgree }) => {
  return (
    <div className="space-y-6 text-stone-800 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-100 via-rose-100 to-sky-100 p-1 flex items-center justify-center shadow-xs">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">
            🫧
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          The Bubl Manifesto
        </h2>
        <p className="text-xs text-stone-500 font-sans max-w-md mx-auto">
          A tranquil refuge from algorithmic noise, superficial swiping, and instant gratification.
        </p>
      </div>

      {/* Four Sacred Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-medium text-sm">
            <Feather className="w-4 h-4 text-amber-700" />
            <span>Anti-Lookism · 2D Avatars Only</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            No profile photos, zero appearance bias. We connect through the resonance of our thoughts, craft, and literary reflections.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-sky-900 font-medium text-sm">
            <Wind className="w-4 h-4 text-sky-700" />
            <span>Atmospheric Wind Transit</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Letters travel across physical geodesic distance at the pace of real winds. No blue ticks, no pressure for immediate reply.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-medium text-sm">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>The Soap Mixture Vial (100ml)</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Blowing a bubble requires 25ml of solution. Refilled by morning dew (+30ml), mindful breath pauses (+15ml), and thoughtful letters.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-900 font-medium text-sm">
            <ShieldCheck className="w-4 h-4 text-rose-700" />
            <span>Intentional Quotas</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            1 Bubble released per week. Burst and explore at most 3 of 5 daily drifting bubbles. Maximum 50 deep pen pal connections.
          </p>
        </div>
      </div>

      {/* Agreement action */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={onAgree}
          className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <HeartHandshake className="w-4 h-4 text-amber-300" />
          <span>I Honor This Pace · Enter the Airspace</span>
        </button>
      </div>
    </div>
  );
};
