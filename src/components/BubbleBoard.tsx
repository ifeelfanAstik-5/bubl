import React, { useState } from 'react';
import { BubblePost, UserProfile, BubbleType, WeatherCondition } from '../types';
import { Avatar2D } from './Avatar2D';
import { playBubblePopSound } from '../services/soundEffects';
import {
  Sparkles,
  MapPin,
  Wind,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lamp,
  Flame,
  Feather,
  Lock,
  Compass,
  Droplets
} from 'lucide-react';

interface BubbleBoardProps {
  bubbles: BubblePost[];
  currentUser: UserProfile;
  burstBubbleIdsToday: string[];
  weather?: WeatherCondition | null;
  onBurstBubble: (bubble: BubblePost) => void;
  onCreateBubbleClick: () => void;
}

const DEFAULT_TYPE_CONFIG: {
  label: string;
  icon: React.ReactNode;
  glowColor: string;
  auraClass: string;
} = {
  label: 'Thought Bubble',
  icon: <FileText className="w-3.5 h-3.5 text-stone-700" />,
  glowColor: 'rgba(230, 240, 255, 0.6)',
  auraClass: 'from-blue-50/60 to-indigo-50/40'
};

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; glowColor: string; auraClass: string }
> = {
  thought: DEFAULT_TYPE_CONFIG,
  echo: {
    label: 'Echo Bubble',
    icon: <HelpCircle className="w-3.5 h-3.5 text-sky-700" />,
    glowColor: 'rgba(224, 242, 254, 0.7)',
    auraClass: 'from-sky-50/70 to-cyan-50/40'
  },
  resonance: {
    label: 'Resonance Bubble',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-700" />,
    glowColor: 'rgba(254, 243, 199, 0.7)',
    auraClass: 'from-amber-50/70 to-orange-50/40'
  },
  lantern: {
    label: 'Lantern Bubble',
    icon: <Lamp className="w-3.5 h-3.5 text-amber-600" />,
    glowColor: 'rgba(255, 237, 213, 0.7)',
    auraClass: 'from-orange-50/70 to-yellow-50/40'
  },
  ember: {
    label: 'Slow Ember',
    icon: <Flame className="w-3.5 h-3.5 text-rose-600" />,
    glowColor: 'rgba(255, 228, 230, 0.7)',
    auraClass: 'from-rose-50/70 to-pink-50/40'
  },
  haiku: {
    label: 'Haiku Verse',
    icon: <Feather className="w-3.5 h-3.5 text-emerald-700" />,
    glowColor: 'rgba(209, 250, 229, 0.7)',
    auraClass: 'from-emerald-50/70 to-teal-50/40'
  }
};

export const BubbleBoard: React.FC<BubbleBoardProps> = ({
  bubbles,
  currentUser,
  burstBubbleIdsToday,
  weather,
  onBurstBubble,
  onCreateBubbleClick
}) => {
  const [activeHobbyFilter, setActiveHobbyFilter] = useState<string>('all');
  const [poppingBubbleId, setPoppingBubbleId] = useState<string | null>(null);

  const safeHobbies = currentUser?.hobbies || [];
  const safeLocation = (currentUser?.location || 'Local').split(',')[0];
  const safeBurstsRemaining = currentUser?.dailyBurstsRemaining ?? 3;
  const safeBurstIds = burstBubbleIdsToday || [];

  // Exactly 5 daily curated drifting bubbles
  const driftingBubbles = bubbles.filter((b) => !b.isUserBubble).slice(0, 5);

  const filteredBubbles = driftingBubbles.filter((b) => {
    if (activeHobbyFilter === 'all') return true;
    if (activeHobbyFilter === 'shared') {
      return b.hobbies.some((h) => safeHobbies.includes(h));
    }
    return b.hobbies.includes(activeHobbyFilter);
  });

  const burstsUsedCount = 3 - safeBurstsRemaining;
  const canBurstMore = safeBurstsRemaining > 0;

  const handleCardClick = (bubble: BubblePost) => {
    const isAlreadyBurst = safeBurstIds.includes(bubble.id);

    // If already burst, open immediately without burst limit deduction
    if (isAlreadyBurst) {
      onBurstBubble(bubble);
      return;
    }

    if (!canBurstMore) {
      return;
    }

    // Check Resonance Bubble hobby match rule
    if (bubble.bubbleType === 'resonance') {
      const hasSharedHobby = bubble.hobbies.some((h) =>
        safeHobbies.includes(h)
      );
      if (!hasSharedHobby) {
        alert(
          `This Resonance Bubble is tuned to: ${bubble.hobbies.join(
            ', '
          )}. It only resonates with travelers who share these passions!`
        );
        return;
      }
    }

    // Play bubble pop acoustic sound and bursting animation
    playBubblePopSound();
    setPoppingBubbleId(bubble.id);

    setTimeout(() => {
      setPoppingBubbleId(null);
      onBurstBubble(bubble);
    }, 320);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-[#FAF8F5]/90 via-[#F7F2EC]/80 to-[#F2EBE3]/90 border border-white/80 shadow-[0_16px_40px_-15px_rgba(180,165,150,0.18)] p-6 md:p-8 space-y-6 backdrop-blur-md overflow-hidden">
      {/* Decorative ambient bubble glows in background */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-pink-100/40 via-sky-100/30 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-100/40 via-emerald-100/30 to-transparent blur-2xl pointer-events-none" />

      {/* Top Atmosphere Header & Aggregate Burst Counter */}
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200/80 to-rose-200/80 p-0.5 shadow-xs flex items-center justify-center animate-float-slow">
              <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center">
                <span className="text-sm">🫧</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 tracking-tight flex items-center gap-2 font-serif-letter">
                Current Atmosphere
                <span className="text-xs px-2.5 py-0.5 font-sans font-normal bg-stone-100 text-stone-600 rounded-full border border-stone-200/60">
                  {bubbles.length} Drifting Bubble{bubbles.length === 1 ? '' : 's'}
                </span>
              </h2>
              {weather && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500 font-mono">
                  <span>🌬️</span>
                  <span>
                    {safeLocation} Sky: {weather.temperatureC}°C, {weather.conditionDescription} ({weather.windSpeedKmH} km/h wind)
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1.5 max-w-xl font-normal leading-relaxed">
            Bubbles carried across the sky by global air currents. You can pop and explore at most{' '}
            <strong className="text-stone-800 font-semibold">3 out of the 5</strong> drifting bubbles each cycle.
          </p>
        </div>

        {/* Aggregate Bursts + Breath Capacity Card */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Breath Energy Pill */}
          <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-stone-200/80 shadow-xs text-xs">
            <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200/70 flex items-center justify-center">
              <Wind className="w-3.5 h-3.5 text-teal-600 animate-float-sway" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] text-stone-400 font-mono tracking-wider block">
                BREATH LVL {currentUser?.breathLevel ?? 1}
              </span>
              <span className="font-semibold text-stone-800 font-mono">
                {currentUser?.dailyBreathEnergy ?? 100}/100 Breath
              </span>
            </div>
          </div>

          {/* Aggregate 3 of 5 Bursts Indicator (Aggregated on top) */}
          <div className="flex items-center gap-3.5 bg-white/85 backdrop-blur-xs px-4 py-2 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center -space-x-1.5">
              {[0, 1, 2].map((idx) => {
                const isUsed = idx < burstsUsedCount;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all shadow-2xs ${
                      isUsed
                        ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300 text-amber-900 scale-95 opacity-80'
                        : 'bg-white border-sky-300/80 text-sky-700 shadow-[0_0_8px_rgba(186,230,253,0.6)] animate-pulse'
                    }`}
                    title={isUsed ? 'Burst opportunity used' : 'Bubble burst available'}
                  >
                    {isUsed ? '✦' : '🫧'}
                  </div>
                );
              })}
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-stone-900 font-mono">
                {safeBurstsRemaining} of 3 Bursts Left
              </div>
              <span className="text-[10px] text-stone-400 block font-mono">
                From 5 Daily Bubbles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs styled like light atmospheric currents */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setActiveHobbyFilter('all')}
          className={`px-3.5 py-1.5 font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeHobbyFilter === 'all'
              ? 'bg-stone-900 text-white shadow-xs scale-100'
              : 'bg-white/70 hover:bg-white text-stone-600 border border-stone-200/80'
          }`}
        >
          <span>🫧</span>
          <span>All 5 Drifting Bubbles</span>
        </button>
        <button
          onClick={() => setActiveHobbyFilter('shared')}
          className={`px-3.5 py-1.5 font-medium rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeHobbyFilter === 'shared'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white/70 hover:bg-white text-stone-600 border border-stone-200/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Shared Passions ({safeHobbies.slice(0, 2).join(', ')})</span>
        </button>

        {safeHobbies.slice(0, 3).map((hobby) => (
          <button
            key={hobby}
            onClick={() => setActiveHobbyFilter(hobby)}
            className={`px-3.5 py-1.5 font-medium rounded-full transition-all whitespace-nowrap ${
              activeHobbyFilter === hobby
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white/70 hover:bg-white text-stone-600 border border-stone-200/80'
            }`}
          >
            {hobby}
          </button>
        ))}
      </div>

      {/* Drifting Spheres or Serene Empty State */}
      {filteredBubbles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-stone-300 bg-white/50 backdrop-blur-xs space-y-4 shadow-inner">
          <div className="w-16 h-16 rounded-full bg-amber-100/70 border border-amber-200/80 flex items-center justify-center text-3xl shadow-xs animate-float-slow">
            🫧
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              The Atmosphere is Peaceful & Still
            </h3>
            <p className="text-xs text-stone-500 font-serif leading-relaxed">
              No bubbles are currently drifting through your local airspace. Dip your wand into your
              Soap Mixture Vial and blow the first thought into the sky.
            </p>
          </div>
          <button
            onClick={onCreateBubbleClick}
            className="px-5 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-xs font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <span>🧪</span>
            <span>Dip Wand & Blow a Bubble</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBubbles.map((bubble, index) => {
          const isPopping = poppingBubbleId === bubble.id;
          const isBurst = burstBubbleIdsToday.includes(bubble.id);
          const typeInfo = (bubble.bubbleType && TYPE_CONFIG[bubble.bubbleType]) || DEFAULT_TYPE_CONFIG;

          // Alternate subtle floating rhythms
          const floatClass =
            index % 3 === 0
              ? 'animate-float-slow'
              : index % 3 === 1
              ? 'animate-float-slow-reverse'
              : 'animate-float-sway';

          return (
            <div
              key={bubble.id}
              onClick={() => handleCardClick(bubble)}
              className={`group relative rounded-[2rem] p-6 cursor-pointer select-none transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isPopping ? 'animate-pop-burst' : floatClass
              } ${
                !isBurst && !canBurstMore ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: bubble.bubbleColor || '#FAF8F5',
                boxShadow: isBurst
                  ? '0 8px 25px -6px rgba(160, 180, 160, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
                  : '0 14px 35px -8px rgba(140, 125, 110, 0.16), inset 0 2px 4px rgba(255, 255, 255, 0.95), inset 0 -2px 6px rgba(180, 160, 140, 0.12)',
                border: isBurst
                  ? '1.5px solid rgba(180, 210, 180, 0.7)'
                  : '1.5px solid rgba(255, 255, 255, 0.85)'
              }}
            >
              {/* Soap Bubble Specular Crescent Highlight (Physical 3D Glass/Bubble curvature) */}
              <div className="bubble-specular-crescent" />

              {/* Iridescent edge refraction glow */}
              <div className="absolute inset-0 rounded-[2rem] bubble-iridescent-sheen opacity-40 pointer-events-none" />

              {/* Top Bubble Origin Info */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  {/* Author in an orb halo */}
                  <div className="flex items-center gap-3">
                    <div className="relative p-0.5 rounded-full bg-white/80 ring-2 ring-white/90 shadow-2xs">
                      <Avatar2D config={bubble.authorAvatar} size="sm" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[8px] shadow-2xs">
                        🫧
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                        <span>{bubble.authorName}</span>
                        <span className="text-stone-400 font-normal">({bubble.authorAge})</span>
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[120px]">
                          {bubble.authorLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bubble Type Pill */}
                  <div className="flex items-center gap-1 text-[10px] text-stone-700 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-200/60 font-mono shadow-2xs shrink-0">
                    {typeInfo.icon}
                    <span>{typeInfo.label}</span>
                  </div>
                </div>

                {/* 10-Word Title discipline */}
                <h3 className="text-sm font-semibold text-stone-900 tracking-tight mb-3 line-clamp-2 font-serif-letter leading-snug">
                  {bubble.title}
                </h3>

                {/* Encapsulated Inner Thought Membrane */}
                <div className="relative rounded-2xl overflow-hidden p-3.5 bg-white/75 backdrop-blur-xs border border-white/90 shadow-inner mb-4 transition-all">
                  {isBurst ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>BURST OPEN · REVEALED THOUGHT</span>
                      </div>
                      <p className="text-xs text-stone-700 font-serif-letter line-clamp-2 leading-relaxed">
                        {bubble.content}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-stone-600 font-serif-letter line-clamp-2 blur-[2px] select-none opacity-50">
                        {bubble.content}
                      </p>
                      {/* Interactive Burst Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
                        {canBurstMore ? (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-md group-hover:scale-105 group-hover:from-amber-900 group-hover:to-stone-900 transition-all">
                            <span className="text-xs">💥</span>
                            <span>Pop to Burst</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-stone-300 text-stone-600 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
                            <Lock className="w-3 h-3" />
                            <span>Daily Limit Reached</span>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Lower Orb Details: Passions & Distance */}
              <div className="relative z-10 pt-3 border-t border-stone-200/50 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <div className="flex items-center gap-1 truncate max-w-[65%]">
                  {(bubble.hobbies || []).slice(0, 2).map((h, i) => (
                    <React.Fragment key={h}>
                      <span
                        className={
                          safeHobbies.includes(h)
                            ? 'text-stone-900 font-medium font-sans bg-white/80 px-1.5 py-0.5 rounded-md'
                            : 'text-stone-600 font-sans'
                        }
                      >
                        {h}
                      </span>
                      {i < Math.min((bubble.hobbies || []).length, 2) - 1 && (
                        <span className="text-stone-300">·</span>
                      )}
                    </React.Fragment>
                  ))}
                  {(bubble.hobbies || []).length > 2 && (
                    <span className="text-stone-400">
                      +{(bubble.hobbies || []).length - 2}
                    </span>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1 text-[11px]">
                  {isBurst ? (
                    <span className="text-emerald-700 font-medium font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      EXPLORED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-stone-500">
                      <Wind className="w-3 h-3 text-stone-400" />
                      ~{bubble.distanceKm.toLocaleString()} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
