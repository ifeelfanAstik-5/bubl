import React, { useState } from 'react';
import { AvatarConfig } from '../../../types';
import { Avatar2D } from '../../Avatar2D';
import { Sparkles, Dices, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepAvatarStudioProps {
  avatar: AvatarConfig;
  onChange: (avatar: AvatarConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const SKIN_TONES = ['#F5D0C5', '#F7D9C4', '#FCD5B5', '#DDB196', '#C68662', '#8D5524', '#5A3825', '#3D2619'];
const HAIR_COLORS = ['#1C1917', '#3A2E2B', '#4A3E3D', '#78350F', '#B45309', '#CA8A04', '#9CA3AF', '#D1D5DB'];
const CLOTHING_COLORS = ['#7A8B7B', '#4D7C9E', '#8D7B68', '#9F1239', '#374151', '#1E293B', '#D97757', '#5E8B67'];
const BG_TINTS = ['#F3EFEA', '#EDF4EE', '#EDF3F7', '#FDF0EC', '#F5F0F7', '#FCF7EB', '#E7E5E4', '#E0F2FE'];

const HAIR_STYLES: Array<{ id: AvatarConfig['hairStyle']; label: string }> = [
  { id: 'classic', label: 'Classic' },
  { id: 'short', label: 'Short' },
  { id: 'wavy', label: 'Wavy' },
  { id: 'curly', label: 'Curly' },
  { id: 'bob', label: 'Bob' },
  { id: 'bun', label: 'Top Bun' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'buzz', label: 'Buzzcut' }
];

const EYE_STYLES: Array<{ id: AvatarConfig['eyeStyle']; label: string }> = [
  { id: 'calm', label: 'Calm' },
  { id: 'gentle', label: 'Gentle' },
  { id: 'smiling', label: 'Smiling' },
  { id: 'curious', label: 'Curious' },
  { id: 'winking', label: 'Playful' }
];

const MOUTH_STYLES: Array<{ id: AvatarConfig['mouthStyle']; label: string }> = [
  { id: 'subtle_smile', label: 'Subtle Smile' },
  { id: 'warm_grin', label: 'Warm Grin' },
  { id: 'calm', label: 'Neutral Calm' },
  { id: 'thoughtful', label: 'Thoughtful' }
];

const GLASSES_STYLES: Array<{ id: AvatarConfig['glassesStyle']; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round Wire' },
  { id: 'wire', label: 'Slim Wire' },
  { id: 'square', label: 'Classic Square' }
];

const CLOTHING_STYLES: Array<{ id: AvatarConfig['clothingStyle']; label: string }> = [
  { id: 'sweater', label: 'Cozy Sweater' },
  { id: 'cardigan', label: 'Wool Cardigan' },
  { id: 'turtleneck', label: 'Turtleneck' },
  { id: 'hoodie', label: 'Comfort Hoodie' },
  { id: 'buttondown', label: 'Oxford Shirt' }
];

export const StepAvatarStudio: React.FC<StepAvatarStudioProps> = ({
  avatar,
  onChange,
  onNext,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'complexion' | 'hair' | 'face' | 'attire' | 'aura'>('complexion');

  const updateAvatarField = <K extends keyof AvatarConfig>(field: K, value: AvatarConfig[K]) => {
    onChange({ ...avatar, [field]: value });
  };

  const handleRandomize = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    onChange({
      skinColor: randomItem(SKIN_TONES),
      hairStyle: randomItem(HAIR_STYLES).id,
      hairColor: randomItem(HAIR_COLORS),
      eyeStyle: randomItem(EYE_STYLES).id,
      mouthStyle: randomItem(MOUTH_STYLES).id,
      glassesStyle: randomItem(GLASSES_STYLES).id,
      clothingStyle: randomItem(CLOTHING_STYLES).id,
      clothingColor: randomItem(CLOTHING_COLORS),
      bgTint: randomItem(BG_TINTS)
    });
  };

  return (
    <div className="space-y-5 animate-fade-in text-stone-800">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          2D Soul Avatar Studio
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Craft your visual presence. In Bubl, everyone is represented through mindful 2D illustrations.
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#F9F6F0] to-[#F2EDE4] border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border border-white/80 p-0.5 bg-white">
              <Avatar2D config={avatar} size="lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-xs">
              ✨
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
              Anti-Lookism Avatar
            </span>
            <p className="text-xs text-stone-600 mt-1 max-w-xs leading-relaxed">
              Every detail is rendered through procedural vector graphics. No photos, no bias.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Dices className="w-3.5 h-3.5 text-stone-500" />
          <span>Inspire Me (Random)</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-stone-200/80 gap-1 pb-1 overflow-x-auto text-xs">
        {[
          { id: 'complexion', label: 'Complexion' },
          { id: 'hair', label: 'Hair & Tone' },
          { id: 'face', label: 'Expression' },
          { id: 'attire', label: 'Attire' },
          { id: 'aura', label: 'Aura Backdrop' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[170px] space-y-4 pt-1">
        {activeTab === 'complexion' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Skin Tone Palette</label>
              <div className="flex flex-wrap gap-2.5">
                {SKIN_TONES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateAvatarField('skinColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs ${
                      avatar.skinColor === color ? 'border-amber-600 scale-110 ring-2 ring-amber-200' : 'border-white hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Spectacles & Eyewear</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GLASSES_STYLES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => updateAvatarField('glassesStyle', g.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      avatar.glassesStyle === g.id
                        ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hair' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Hairstyle Silhouette</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HAIR_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => updateAvatarField('hairStyle', h.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      avatar.hairStyle === h.id
                        ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Hair Tone & Sheen</label>
              <div className="flex flex-wrap gap-2.5">
                {HAIR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateAvatarField('hairColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs ${
                      avatar.hairColor === color ? 'border-amber-600 scale-110 ring-2 ring-amber-200' : 'border-white hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'face' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Eye Mood & Gaze</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EYE_STYLES.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => updateAvatarField('eyeStyle', e.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      avatar.eyeStyle === e.id
                        ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Mouth Demeanor</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOUTH_STYLES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateAvatarField('mouthStyle', m.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      avatar.mouthStyle === m.id
                        ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attire' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Clothing Garment</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CLOTHING_STYLES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => updateAvatarField('clothingStyle', c.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      avatar.clothingStyle === c.id
                        ? 'bg-amber-100/80 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Garment Palette</label>
              <div className="flex flex-wrap gap-2.5">
                {CLOTHING_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateAvatarField('clothingColor', color)}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs ${
                      avatar.clothingColor === color ? 'border-amber-600 scale-110 ring-2 ring-amber-200' : 'border-white hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aura' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-stone-700 block">Atmospheric Backdrop Aura</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BG_TINTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateAvatarField('bgTint', color)}
                  style={{ backgroundColor: color }}
                  className={`h-12 rounded-xl border-2 transition-transform shadow-xs flex items-center justify-center ${
                    avatar.bgTint === color ? 'border-amber-600 ring-2 ring-amber-200 scale-105' : 'border-stone-200 hover:scale-102'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
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
          onClick={onNext}
          className="flex-1 py-3 px-6 rounded-2xl bg-stone-900 text-white font-medium text-xs tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Continue to Passions & Hobbies</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
