import React, { useState } from 'react';
import { UserProfile, BubbleType } from '../types';
import { ALL_HOBBIES, BUBBLE_TYPES, HOBBY_CATEGORIES, HOBBY_ICONS } from '../data/mockData';
import { Avatar2D } from './Avatar2D';
import {
  X,
  Sparkles,
  MapPin,
  BookOpen,
  Wind,
  Lock,
  CheckCircle2,
  CircleDot,
  User,
  HeartHandshake,
  Compass,
  Flame,
  Feather,
  Info,
  Check
} from 'lucide-react';

interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
  onOpenAvatarEditor: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onOpenAvatarEditor
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'breath' | 'passions'>('identity');
  const [hobbyCategoryFilter, setHobbyCategoryFilter] = useState<string>('all');
  const [nickname, setNickname] = useState(user.nickname);
  const [age, setAge] = useState(user.age);
  const [pronouns, setPronouns] = useState(user.pronouns);
  const [location, setLocation] = useState(user.location);
  const [bio, setBio] = useState(user.bio);
  const [exchangeInterest, setExchangeInterest] = useState(
    user.exchangeInterest || 'Literature & Philosophy Discussions'
  );
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(user.hobbies || []);
  const [unlockedTypes, setUnlockedTypes] = useState<BubbleType[]>(
    user.unlockedBubbleTypes || ['thought', 'echo']
  );

  if (!isOpen) return null;

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
    } else {
      if (selectedHobbies.length < 8) {
        setSelectedHobbies([...selectedHobbies, hobby]);
      }
    }
  };

  const toggleStarterBubbleType = (typeId: BubbleType) => {
    // Only starter choices can be toggled in profile (max 2)
    const def = BUBBLE_TYPES.find((b) => b.id === typeId);
    if (!def?.isStarterChoice) return;

    if (unlockedTypes.includes(typeId)) {
      if (unlockedTypes.length > 1) {
        setUnlockedTypes(unlockedTypes.filter((t) => t !== typeId));
      }
    } else {
      if (unlockedTypes.length < 2) {
        setUnlockedTypes([...unlockedTypes, typeId]);
      }
    }
  };

  const nextLevelExp = user.breathLevel === 1 ? 20 : user.breathLevel === 2 ? 50 : 100;
  const expPercentage = Math.min(100, Math.round((user.breathExp / nextLevelExp) * 100));

  const handleSave = () => {
    onSave({
      nickname: nickname.trim() || 'Penpal',
      age: Number(age) || 24,
      pronouns: pronouns.trim() || 'they/them',
      location: location.trim() || 'Earth',
      bio: bio.trim(),
      exchangeInterest,
      hobbies: selectedHobbies,
      unlockedBubbleTypes: unlockedTypes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F8F4EE] to-[#F2EBE3] rounded-[2.5rem] border border-white/90 shadow-[0_30px_70px_-15px_rgba(40,30,20,0.35)] overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Iridescent specular sheen */}
        <div className="bubble-specular-crescent opacity-70 pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-stone-200/70 bg-white/75 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-200 via-sky-200 to-rose-200 p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white/95 flex items-center justify-center text-sm">
                🫧
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight font-serif-letter flex items-center gap-2">
                Soul Profile & Breath Sanctuary
              </h2>
              <p className="text-[11px] text-stone-500 font-sans">
                Mind-to-mind kinship · 2D avatar only · Zero appearance bias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-stone-200/70 border border-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Breath Mastery & Avatar Pod */}
        <div className="px-6 sm:px-8 py-4 bg-gradient-to-r from-amber-50/60 via-stone-50/80 to-teal-50/60 border-b border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-300/40 via-sky-300/40 to-teal-300/40 ring-2 ring-white shadow-sm">
              <Avatar2D config={user.avatar} size="lg" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-2xs border border-stone-200 flex items-center justify-center text-[10px]">
                🫧
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 text-sm font-serif-letter">
                  {user.nickname}, {user.age}
                </h3>
                <span className="text-[11px] font-mono text-stone-400">({user.pronouns})</span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{user.location}</span>
              </p>
              {/* Breath Level & XP Meter */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-mono text-teal-800 shadow-2xs">
                  <Wind className="w-3 h-3 text-teal-600 animate-spin" />
                  <span>Level {user.breathLevel} Breather</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200/60">
                  <span>{user.breathExp}/{nextLevelExp} XP</span>
                  <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full"
                      style={{ width: `${expPercentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {user.dailyBreathEnergy}% Breath Capacity
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAvatarEditor}
            className="px-3.5 py-2 text-xs font-medium text-stone-800 bg-white hover:bg-stone-100 border border-stone-200/80 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Customize 2D Avatar</span>
          </button>
        </div>

        {/* Tab Navigation Segmented Bar */}
        <div className="px-6 sm:px-8 pt-3 pb-2 bg-white/40 border-b border-stone-200/50 flex items-center gap-2 relative z-10">
          <button
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'identity'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Soul Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('breath')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'breath'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Bubble Types & Breath</span>
          </button>

          <button
            onClick={() => setActiveTab('passions')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'passions'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Passions & Focus ({selectedHobbies.length}/8)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: Soul Identity */}
          {activeTab === 'identity' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Soul Alias / Pen Pal Name
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs"
                    placeholder="e.g. Sylvan, Clara, Rowan"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Pronouns
                  </label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs"
                    placeholder="e.g. they/them, she/her, he/him"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    City / Country / Region
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs"
                    placeholder="e.g. Kyoto, Japan · Bristol, UK"
                  />
                </div>
              </div>

              {/* Personal Reflection / Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-800 block">
                    Personal Reflection / Soul Bio
                  </label>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {bio.length} characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-stone-200/90 rounded-2xl focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none font-serif-letter shadow-2xs leading-relaxed"
                    placeholder="What quiet thoughts, questions, or artistic wonders occupy your mind? What kind of unhurried pen pal conversations do you cherish?"
                  />
                </div>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-stone-500 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Anti-dating principle:</strong> Bubble is strictly dedicated to thoughtful exchange. Solicitations for romance, dating, or physical appearance are filtered.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Breath Mastery & Bubble Types */}
          {activeTab === 'breath' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-white/90 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5 text-amber-700" />
                    <span>Starter Bubble Types ({unlockedTypes.length}/2 Active)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Choose at most 2
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  When starting out on Bubble, you may select at most 2 starter types. Advanced bubbles unlock naturally as you exchange thoughtful dispatches and expand your breath stamina.
                </p>
              </div>

              {/* Grid of Bubble Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUBBLE_TYPES.map((type) => {
                  const isUnlocked = unlockedTypes.includes(type.id);
                  const canToggle = type.isStarterChoice;

                  return (
                    <div
                      key={type.id}
                      onClick={() => canToggle && toggleStarterBubbleType(type.id)}
                      className={`p-3.5 rounded-2xl border transition-all relative ${
                        canToggle
                          ? 'cursor-pointer hover:border-stone-400 bg-white'
                          : 'cursor-default bg-stone-100/60'
                      } ${
                        isUnlocked
                          ? 'border-stone-900 shadow-sm ring-1 ring-stone-900/10'
                          : 'border-stone-200/80 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {type.id === 'thought' && '💭'}
                            {type.id === 'echo' && '🫧'}
                            {type.id === 'resonance' && '✨'}
                            {type.id === 'lantern' && '🏮'}
                            {type.id === 'ember' && '🔥'}
                            {type.id === 'haiku' && '🪶'}
                          </span>
                          <span className="font-semibold text-stone-900 text-xs">
                            {type.name}
                          </span>
                        </div>
                        {isUnlocked ? (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-stone-500 bg-stone-200/50 px-1.5 py-0.5 rounded-md">
                            <Lock className="w-3 h-3 text-stone-400" />
                            <span>Locked</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 font-serif-letter leading-snug">
                        {type.description}
                      </p>

                      <div className="mt-2 text-[10px] font-mono text-stone-400 border-t border-stone-100 pt-1.5">
                        {isUnlocked ? (
                          <span className="text-teal-700 font-medium">Ready to blow into the atmosphere</span>
                        ) : (
                          <span>{type.unlockRequirement}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Breath Capacity Explainer */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 to-sky-50/80 border border-teal-200/70 text-xs text-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-teal-900">
                  <Wind className="w-4 h-4 text-teal-700" />
                  <span>The Breath Capacity Analogy</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed font-serif-letter">
                  Every day you receive a measured supply of breath. The more steadily and patiently you communicate with pen pals, the deeper your breath capacity becomes — allowing your bubbles to travel further across the world’s air currents.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Passions & Focus */}
          {activeTab === 'passions' && (
            <div className="space-y-5 animate-fade-in">
              {/* Exchange Current */}
              <div>
                <label className="text-xs font-medium text-stone-800 block mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Primary Pen Pal Exchange Focus</span>
                </label>
                <select
                  value={exchangeInterest}
                  onChange={(e) => setExchangeInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200/90 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs font-serif-letter"
                >
                  <option value="Literature & Philosophy Discussions">
                    Literature & Philosophy Discussions (Classic texts, ideas, existential thoughts)
                  </option>
                  <option value="Cultural Observations & Local Daily Life">
                    Cultural Observations & Local Daily Life (Traditions, city walks, regional seasons)
                  </option>
                  <option value="Creative Crafts & Analog Hobbies">
                    Creative Crafts & Analog Hobbies (Pottery, film, woodwork, journaling)
                  </option>
                  <option value="Quiet Astronomy & Nature Thoughts">
                    Quiet Astronomy & Nature Thoughts (Night sky, weather patterns, botanical life)
                  </option>
                  <option value="Acoustic Soundscapes & Cinema Studies">
                    Acoustic Soundscapes & Cinema Studies (Ambient sound, score composition, auteur films)
                  </option>
                  <option value="Mindful Perspectives & Life Rituals">
                    Mindful Perspectives & Life Rituals (Morning anchors, slow living, reflective pauses)
                  </option>
                </select>
              </div>

              {/* RESTYLED: Soul Passions & Hobbies Section */}
              <div className="space-y-4">
                {/* 1. Active Passions Tray & Quota Progress */}
                <div className="p-4 bg-gradient-to-r from-amber-50/70 via-stone-50/80 to-teal-50/60 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✨</span>
                      <h4 className="text-xs font-semibold text-stone-900 font-serif-letter">
                        Your Chosen Passions ({selectedHobbies.length}/8)
                      </h4>
                    </div>

                    {/* Visual 8-slot quota dots */}
                    <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-full border border-stone-200/70 shadow-2xs">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 8 }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx < selectedHobbies.length
                                ? 'bg-amber-600 scale-110 shadow-2xs'
                                : 'bg-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 pl-1">
                        {selectedHobbies.length}/8
                      </span>
                    </div>
                  </div>

                  {/* Active Chips Tray */}
                  {selectedHobbies.length === 0 ? (
                    <p className="text-[11px] text-stone-500 font-serif-letter italic">
                      No passions chosen yet. Select up to 8 topics below to attract resonant bubbles across the atmosphere.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {selectedHobbies.map((hobby) => (
                        <span
                          key={hobby}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-900 text-white text-xs font-medium shadow-2xs group animate-fade-in"
                        >
                          <span className="text-xs">{HOBBY_ICONS[hobby] || '✦'}</span>
                          <span>{hobby}</span>
                          <button
                            type="button"
                            onClick={() => toggleHobby(hobby)}
                            title={`Remove ${hobby}`}
                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-rose-500 flex items-center justify-center text-white/80 hover:text-white transition-colors text-[10px] ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Category Filter Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-700">
                      Explore Topics by Category
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      Click to toggle (Max 8)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHobbyCategoryFilter('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                        hobbyCategoryFilter === 'all'
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      All (22)
                    </button>
                    {HOBBY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setHobbyCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                          hobbyCategoryFilter === cat.id
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Categorized Hobbies Chip Grid */}
                <div className="space-y-4 pt-1">
                  {HOBBY_CATEGORIES.filter(
                    (cat) => hobbyCategoryFilter === 'all' || hobbyCategoryFilter === cat.id
                  ).map((category) => (
                    <div
                      key={category.id}
                      className="p-3.5 bg-white/70 rounded-2xl border border-stone-200/70 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{category.icon}</span>
                        <h5 className="text-xs font-semibold text-stone-800 font-serif-letter">
                          {category.name}
                        </h5>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {category.hobbies.map((hobby) => {
                          const isSelected = selectedHobbies.includes(hobby);
                          const isMaxReached = selectedHobbies.length >= 8 && !isSelected;

                          return (
                            <button
                              key={hobby}
                              type="button"
                              disabled={isMaxReached}
                              onClick={() => toggleHobby(hobby)}
                              className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 relative select-none ${
                                isSelected
                                  ? 'bg-stone-900 text-white border border-stone-900 shadow-xs font-medium'
                                  : isMaxReached
                                  ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-50'
                                  : 'bg-white text-stone-700 border border-stone-200/90 hover:border-amber-400 hover:bg-amber-50/40 shadow-2xs'
                              }`}
                            >
                              <span>{HOBBY_ICONS[hobby] || '✦'}</span>
                              <span>{hobby}</span>
                              {isSelected ? (
                                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] ml-0.5">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400 ml-0.5">+</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 sm:px-8 py-4 border-t border-stone-200/70 bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Soul connection guaranteed: zero selfies, zero metrics</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
            >
              <span>Save Soul Profile</span>
              <span>🫧</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
