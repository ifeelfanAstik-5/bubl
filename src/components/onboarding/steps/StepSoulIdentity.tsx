import React, { useState } from 'react';
import { User, Calendar, MapPin, Sparkles, MessageSquare, Globe, ArrowRight, AlertCircle } from 'lucide-react';

interface StepSoulIdentityProps {
  nickname: string;
  onNicknameChange: (val: string) => void;
  dob: string;
  onDobChange: (dob: string, age: number) => void;
  pronouns: string;
  onPronounsChange: (val: string) => void;
  location: string;
  onLocationChange: (loc: string, lat?: number, lon?: number) => void;
  bio: string;
  onBioChange: (val: string) => void;
  languages: string[];
  onLanguagesChange: (langs: string[]) => void;
  exchangeInterest: string;
  onExchangeInterestChange: (val: string) => void;
  onNext: () => void;
}

const GLOBAL_HUBS = [
  { city: 'Kyoto, Japan', lat: 35.0116, lon: 135.7681 },
  { city: 'Florence, Italy', lat: 43.7696, lon: 11.2558 },
  { city: 'Edinburgh, Scotland', lat: 55.9533, lon: -3.1883 },
  { city: 'Buenos Aires, Argentina', lat: -34.6037, lon: -58.3816 },
  { city: 'Vancouver, Canada', lat: 49.2827, lon: -123.1207 },
  { city: 'Wellington, New Zealand', lat: -41.2865, lon: 174.7762 },
  { city: 'Lisbon, Portugal', lat: 38.7223, lon: -9.1393 },
  { city: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426 },
  { city: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241 },
  { city: 'Melbourne, Australia', lat: -37.8136, lon: 144.9631 },
  { city: 'Ubud, Bali, Indonesia', lat: -8.5069, lon: 115.2625 },
  { city: 'Prague, Czechia', lat: 50.0755, lon: 14.4378 }
];

const POPULAR_LANGUAGES = [
  'English', 'Spanish', 'French', 'Japanese', 'Hindi', 'German',
  'Italian', 'Mandarin', 'Portuguese', 'Korean', 'Arabic', 'Russian'
];

export const StepSoulIdentity: React.FC<StepSoulIdentityProps> = ({
  nickname,
  onNicknameChange,
  dob,
  onDobChange,
  pronouns,
  onPronounsChange,
  location,
  onLocationChange,
  bio,
  onBioChange,
  languages,
  onLanguagesChange,
  exchangeInterest,
  onExchangeInterestChange,
  onNext
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleDobInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onDobChange('', 0);
      return;
    }
    const birthDate = new Date(val);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    onDobChange(val, Math.max(0, computedAge));
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        onLanguagesChange(languages.filter((l) => l !== lang));
      }
    } else {
      onLanguagesChange([...languages, lang]);
    }
  };

  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hub = GLOBAL_HUBS.find((h) => h.city === e.target.value);
    if (hub) {
      onLocationChange(hub.city, hub.lat, hub.lon);
    } else {
      onLocationChange(e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError('Please provide a name or pen name.');
      return;
    }

    if (!dob) {
      setError('Please provide your date of birth.');
      return;
    }

    // Age check
    const birthDate = new Date(dob);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    if (computedAge < 18) {
      setError('Bubl is a mindful space reserved for individuals 18 years and older.');
      return;
    }

    if (!location.trim()) {
      setError('Please specify your home city or region for wind calculation.');
      return;
    }

    if (!bio.trim()) {
      setError('Please write a brief about section describing your quiet contemplations.');
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in text-stone-800">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Soul Identity & Origins
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Start from a pure blank canvas. No prefilled identities — this is your authentic presence.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Pen Name & Pronouns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Name / Pen Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              placeholder="e.g. Sylvan, Rowan, Maya"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Pronouns
          </label>
          <select
            value={pronouns}
            onChange={(e) => onPronounsChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          >
            <option value="they/them">they/them</option>
            <option value="she/her">she/her</option>
            <option value="he/him">he/him</option>
            <option value="she/they">she/they</option>
            <option value="he/they">he/they</option>
            <option value="prefer not to say">prefer not to say</option>
          </select>
        </div>
      </div>

      {/* Row 2: Date of Birth & City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Date of Birth <span className="text-rose-500">* (18+)</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={dob}
              onChange={handleDobInput}
              max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Home City / Winds Origin <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={location}
              onChange={handleLocationSelect}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
              required
            >
              <option value="">Select your region...</option>
              {GLOBAL_HUBS.map((h) => (
                <option key={h.city} value={h.city}>
                  {h.city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Languages Spoken */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-stone-500" />
          <span>Languages for Letter Exchange</span>
        </label>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {POPULAR_LANGUAGES.map((lang) => {
            const isSelected = languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1 rounded-full text-xs transition-all border ${
                  isSelected
                    ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-medium'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                {lang} {isSelected ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Soul Bio / About Section */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            <span>About You (Soul Bio) <span className="text-rose-500">*</span></span>
          </span>
          <span className="text-[11px] text-stone-400 font-normal">{bio.length}/500</span>
        </label>
        <textarea
          rows={3}
          maxLength={500}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Share a quiet glimpse into what centers you: your ritual morning tea, analog hobbies, books that altered your thinking, or why you seek unhurried letters..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400 leading-relaxed resize-none"
          required
        />
      </div>

      {/* Row 5: Topics / Exchange Interest */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
          <span>Contemplations & Exchange Interests</span>
        </label>
        <input
          type="text"
          value={exchangeInterest}
          onChange={(e) => onExchangeInterestChange(e.target.value)}
          placeholder="e.g. Film Photography & Literature, Handcraft & Analog Audio, Stargazing"
          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Continue to Avatar Studio</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </form>
  );
};
