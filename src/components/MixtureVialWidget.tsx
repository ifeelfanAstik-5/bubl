import React, { useState } from 'react';
import { Droplets, Wind, Sparkles, X, Heart } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { playVialSloshSound, playDewChimeSound } from '../services/soundEffects';

interface MixtureVialWidgetProps {
  mixtureVialMl: number;
  onVialRefilled: (newMl: number) => void;
}

export const MixtureVialWidget: React.FC<MixtureVialWidgetProps> = ({
  mixtureVialMl,
  onVialRefilled
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathTimer, setBreathTimer] = useState(16);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const fillPercentage = Math.min(100, Math.max(5, mixtureVialMl));

  const startBreathingPause = () => {
    setIsBreathingModalOpen(true);
    setIsBreathingActive(true);
    setBreathTimer(16);
    playVialSloshSound();

    let count = 16;
    const interval = setInterval(() => {
      count -= 1;
      setBreathTimer(count);

      const mod = count % 8;
      if (mod >= 4) {
        setBreathPhase('inhale');
      } else {
        setBreathPhase('exhale');
      }

      if (count <= 0) {
        clearInterval(interval);
        setIsBreathingActive(false);
        // Award refill
        apiClient.takeBreathPause().then((res) => {
          if (res) {
            onVialRefilled(res.mixtureVialMl);
            playDewChimeSound();
          }
        });
      }
    }, 1000);
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setIsTooltipOpen(!isTooltipOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/80 hover:bg-white border border-stone-200/80 shadow-xs transition-all text-xs font-serif group"
          title="Soap Mixture Vial"
        >
          {/* Glass Vial with Liquid Level */}
          <div className="w-5 h-7 rounded-b-md rounded-t-sm border border-stone-400 bg-stone-100/50 p-0.5 relative overflow-hidden flex flex-col justify-end shadow-inner">
            {/* Cork topper */}
            <div className="absolute top-0 left-0.5 right-0.5 h-1 bg-amber-800/80 rounded-t-xs" />
            {/* Shimmering Liquid */}
            <div
              className="w-full bg-linear-to-t from-teal-600/70 via-emerald-500/60 to-cyan-400/50 rounded-b-xs transition-all duration-500"
              style={{ height: `${fillPercentage}%` }}
            />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
              Mixture Vial
            </span>
            <span className="font-semibold text-stone-800 font-mono text-[11px]">
              {mixtureVialMl} / 100 ml
            </span>
          </div>
        </button>

        {/* Informative Tooltip Popover */}
        {isTooltipOpen && (
          <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-72 p-4 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-base">🧪</span>
                <h4 className="font-serif font-bold text-xs text-stone-900">
                  Pure Soap Solution
                </h4>
              </div>
              <button
                onClick={() => setIsTooltipOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed font-serif">
              You dip your wand into this vial to blow mindful bubbles into the sky. Blowing a bubble costs{' '}
              <strong className="text-stone-900">25ml</strong> of mixture.
            </p>

            <div className="space-y-1.5 text-[11px] text-stone-600">
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  <strong>+30ml:</strong> Morning dew at sunrise (daily)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>
                  <strong>+15ml:</strong> Mindful breath pause
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>+10ml:</strong> Replying to a pen-pal letter
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsTooltipOpen(false);
                startBreathingPause();
              }}
              className="w-full py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Take a 16s Breath Pause (+15ml)</span>
            </button>
          </div>
        )}
      </div>

      {/* Mindful Breathing Pause Modal */}
      {isBreathingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-[#FAF7F2] border border-amber-900/10 rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-800 bg-teal-800/10 px-3 py-1 rounded-full">
                Mindful Restoration
              </span>
              <h3 className="font-serif text-xl text-stone-900 pt-2">
                {isBreathingActive ? 'Breathe with the Atmosphere' : 'Mixture Infused!'}
              </h3>
              <p className="text-xs text-stone-500 font-serif">
                {isBreathingActive
                  ? 'Gently expand your lungs and let your mind settle.'
                  : '+15ml of fresh Soap Mixture has been added to your vial.'}
              </p>
            </div>

            {/* Breathing Ring Animation */}
            <div className="flex items-center justify-center py-6">
              <div
                className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                  breathPhase === 'inhale'
                    ? 'scale-125 border-teal-500 bg-teal-50 shadow-lg shadow-teal-200/50'
                    : 'scale-90 border-amber-500/60 bg-amber-50 shadow-inner'
                }`}
              >
                <div className="flex flex-col items-center">
                  <Wind className="w-8 h-8 text-teal-700 animate-pulse" />
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-teal-900 mt-1">
                    {breathPhase}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">{breathTimer}s</span>
                </div>
              </div>
            </div>

            {!isBreathingActive && (
              <button
                type="button"
                onClick={() => setIsBreathingModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-xs font-medium shadow-sm transition-all"
              >
                Return to Airspace
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
