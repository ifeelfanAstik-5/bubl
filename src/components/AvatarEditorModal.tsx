import React, { useState } from 'react';
import { AvatarConfig } from '../types';
import { Avatar2D } from './Avatar2D';
import { X, Dices, Check } from 'lucide-react';

interface AvatarEditorModalProps {
  initialConfig: AvatarConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: AvatarConfig) => void;
}

const SKIN_TONES = [
  '#FDEBE2',
  '#F7D9C4',
  '#F5D0C5',
  '#E8BEAC',
  '#D8A07A',
  '#C68642',
  '#8D5524',
  '#633A18'
];

const HAIR_STYLES: { id: AvatarConfig['hairStyle']; label: string }[] = [
  { id: 'wavy', label: 'Wavy' },
  { id: 'curly', label: 'Curly' },
  { id: 'classic', label: 'Classic' },
  { id: 'bob', label: 'Bob' },
  { id: 'bun', label: 'Top Bun' },
  { id: 'short', label: 'Short Crop' },
  { id: 'buzz', label: 'Buzz' },
  { id: 'ponytail', label: 'Ponytail' }
];

const HAIR_COLORS = [
  '#1E1917',
  '#3A2E2B',
  '#5C3826',
  '#B85D36',
  '#D4A373',
  '#6C757D',
  '#E5B94E',
  '#4A6B6C'
];

const EYE_STYLES: { id: AvatarConfig['eyeStyle']; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'gentle', label: 'Gentle' },
  { id: 'smiling', label: 'Smiling' },
  { id: 'curious', label: 'Curious' },
  { id: 'winking', label: 'Winking' }
];

const MOUTH_STYLES: { id: AvatarConfig['mouthStyle']; label: string }[] = [
  { id: 'subtle_smile', label: 'Subtle' },
  { id: 'warm_grin', label: 'Warm Grin' },
  { id: 'calm', label: 'Quiet' },
  { id: 'thoughtful', label: 'Thoughtful' }
];

const GLASSES_STYLES: { id: AvatarConfig['glassesStyle']; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round Tortoise' },
  { id: 'wire', label: 'Gold Wire' },
  { id: 'square', label: 'Modern Square' }
];

const CLOTHING_STYLES: { id: AvatarConfig['clothingStyle']; label: string }[] = [
  { id: 'sweater', label: 'Knit Sweater' },
  { id: 'cardigan', label: 'Cardigan' },
  { id: 'turtleneck', label: 'Turtleneck' },
  { id: 'hoodie', label: 'Cozy Hoodie' },
  { id: 'buttondown', label: 'Linen Shirt' }
];

const CLOTHING_COLORS = [
  '#7A8B7B',
  '#C48B71',
  '#394A59',
  '#4A6B6C',
  '#B05D3B',
  '#6C5B7B',
  '#455952',
  '#2C2724'
];

const BG_TINTS = [
  '#E8EFE9',
  '#FBECE3',
  '#E3ECFB',
  '#E5F0ED',
  '#F7EBE1',
  '#F4E8EE',
  '#F6F3EB',
  '#ECEFF1'
];

export const AvatarEditorModal: React.FC<AvatarEditorModalProps> = ({
  initialConfig,
  isOpen,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<
    'face' | 'hair' | 'expression' | 'style' | 'backdrop'
  >('face');

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
    const randomHairStyle =
      HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;
    const randomHairColor =
      HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const randomEye =
      EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)].id;
    const randomMouth =
      MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)].id;
    const randomGlasses =
      GLASSES_STYLES[Math.floor(Math.random() * GLASSES_STYLES.length)].id;
    const randomClothing =
      CLOTHING_STYLES[Math.floor(Math.random() * CLOTHING_STYLES.length)].id;
    const randomClothColor =
      CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)];
    const randomBg = BG_TINTS[Math.floor(Math.random() * BG_TINTS.length)];

    setConfig({
      skinColor: randomSkin,
      hairStyle: randomHairStyle,
      hairColor: randomHairColor,
      eyeStyle: randomEye,
      mouthStyle: randomMouth,
      glassesStyle: randomGlasses,
      clothingStyle: randomClothing,
      clothingColor: randomClothColor,
      bgTint: randomBg
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F8F4EE] to-[#F3ECE4] rounded-[2.5rem] border border-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Specular crescent */}
        <div className="bubble-specular-crescent opacity-70" />

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-stone-200/60 bg-white/70 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm">🫧</span>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight font-serif-letter">
              2D Avatar Studio
            </h2>
            <span className="text-xs text-stone-500 font-normal">
              · Illustrated Identity (No Photos Required)
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-stone-200/60 border border-stone-200/50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Left Canvas Preview */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col items-center">
              <Avatar2D config={config} size="2xl" showBorder={false} />
              <div className="mt-3 text-center">
                <span className="text-xs font-medium text-stone-600 block">
                  Public Dating Avatar
                </span>
                <span className="text-[11px] text-stone-400">
                  Minimalist & Privacy-Preserving
                </span>
              </div>
            </div>

            <button
              onClick={handleRandomize}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
            >
              <Dices className="w-3.5 h-3.5 text-stone-500" />
              Randomize Look
            </button>
          </div>

          {/* Right Editor Controls */}
          <div className="flex-1 w-full flex flex-col gap-5">
            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl overflow-x-auto">
              {(
                [
                  { id: 'face', label: 'Complexion' },
                  { id: 'hair', label: 'Hairstyle' },
                  { id: 'expression', label: 'Face' },
                  { id: 'style', label: 'Attire' },
                  { id: 'backdrop', label: 'Backdrop' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Face / Complexion */}
            {activeTab === 'face' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Skin Complexion
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, skinColor: tone }))
                        }
                        className={`w-9 h-9 rounded-full border-2 transition-transform ${
                          config.skinColor === tone
                            ? 'border-stone-900 scale-110 shadow-sm'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Eyewear
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GLASSES_STYLES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, glassesStyle: g.id }))
                        }
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                          config.glassesStyle === g.id
                            ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-[#FAF7F2] text-stone-600 hover:bg-white'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Hair */}
            {activeTab === 'hair' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Hair Cut & Texture
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HAIR_STYLES.map((h) => (
                      <button
                        key={h.id}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, hairStyle: h.id }))
                        }
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                          config.hairStyle === h.id
                            ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-[#FAF7F2] text-stone-600 hover:bg-white'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Hair Color
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HAIR_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, hairColor: color }))
                        }
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          config.hairColor === color
                            ? 'border-stone-900 scale-110 shadow-sm'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Expression */}
            {activeTab === 'expression' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Eye Mood
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EYE_STYLES.map((eye) => (
                      <button
                        key={eye.id}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, eyeStyle: eye.id }))
                        }
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                          config.eyeStyle === eye.id
                            ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-[#FAF7F2] text-stone-600 hover:bg-white'
                        }`}
                      >
                        {eye.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Mouth & Demeanor
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOUTH_STYLES.map((mouth) => (
                      <button
                        key={mouth.id}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            mouthStyle: mouth.id
                          }))
                        }
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                          config.mouthStyle === mouth.id
                            ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-[#FAF7F2] text-stone-600 hover:bg-white'
                        }`}
                      >
                        {mouth.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Style / Clothing */}
            {activeTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Clothing Garment
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CLOTHING_STYLES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            clothingStyle: c.id
                          }))
                        }
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                          config.clothingStyle === c.id
                            ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-xs'
                            : 'border-stone-200 bg-[#FAF7F2] text-stone-600 hover:bg-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 mb-2 block">
                    Clothing Fabric Hue
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {CLOTHING_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            clothingColor: color
                          }))
                        }
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          config.clothingColor === color
                            ? 'border-stone-900 scale-110 shadow-sm'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Backdrop */}
            {activeTab === 'backdrop' && (
              <div>
                <label className="text-xs font-medium text-stone-700 mb-2 block">
                  Pastel Stationery Background
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {BG_TINTS.map((tint) => (
                    <button
                      key={tint}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, bgTint: tint }))
                      }
                      className={`h-12 rounded-xl border-2 flex items-center justify-center transition-transform ${
                        config.bgTint === tint
                          ? 'border-stone-900 scale-105 shadow-xs'
                          : 'border-stone-200 hover:scale-102'
                      }`}
                      style={{ backgroundColor: tint }}
                    >
                      {config.bgTint === tint && (
                        <Check className="w-4 h-4 text-stone-700" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF7F2] flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Avatars update instantly across all letters
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(config);
                onClose();
              }}
              className="px-5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors shadow-xs"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
