import React, { useState } from 'react';
import { UserProfile, AvatarConfig } from '../types';
import { Avatar2D } from './Avatar2D';
import { apiClient } from '../services/apiClient';
import { playDewChimeSound, playVialSloshSound, playBubblePopSound } from '../services/soundEffects';
import { ALL_HOBBIES } from '../data/mockData';
import {
  Sparkles,
  Wind,
  ShieldCheck,
  Feather,
  Mail,
  KeyRound,
  Compass,
  Check,
  ArrowRight,
  Dices,
  Clock,
  Droplets
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile) => void;
}

const GLOBAL_CITIES: { name: string; lat: number; lon: number }[] = [
  { name: 'Kyoto, Japan', lat: 35.0116, lon: 135.7681 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.006 },
  { name: 'San Francisco, USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Melbourne, Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Seoul, South Korea', lat: 37.5665, lon: 126.978 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Florence, Italy', lat: 43.7696, lon: 11.2558 },
  { name: 'Amsterdam, Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
  { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 },
  { name: 'Taipei, Taiwan', lat: 25.033, lon: 121.5654 },
  { name: 'Auckland, New Zealand', lat: -36.8485, lon: 174.7633 }
];

const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#F7D9C4',
  hairStyle: 'wavy',
  hairColor: '#3A2E2B',
  eyeStyle: 'gentle',
  mouthStyle: 'subtle_smile',
  glassesStyle: 'round',
  clothingStyle: 'sweater',
  clothingColor: '#7A8B7B',
  bgTint: '#F3EFEA'
};

const SKIN_TONES = ['#FDEBE2', '#F7D9C4', '#F5D0C5', '#E8BEAC', '#D8A07A', '#C68642', '#8D5524', '#633A18'];
const HAIR_COLORS = ['#1E1917', '#3A2E2B', '#5C3826', '#B85D36', '#D4A373', '#6C757D', '#E5B94E', '#4A6B6C'];
const HAIR_STYLES: AvatarConfig['hairStyle'][] = ['wavy', 'curly', 'classic', 'bob', 'bun', 'short', 'buzz', 'ponytail'];
const CLOTHING_STYLES: AvatarConfig['clothingStyle'][] = ['sweater', 'hoodie', 'turtleneck', 'buttondown', 'cardigan'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 2: Auth states
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 3: Profile states
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState(24);
  const [pronouns, setPronouns] = useState('they/them');
  const [selectedCity, setSelectedCity] = useState(GLOBAL_CITIES[0]);
  const [bio, setBio] = useState('Mindful thinker discovering slow dispatches from afar.');
  const [exchangeInterest, setExchangeInterest] = useState('Literature & Philosophy Discussions');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(['Reading', 'Tea & Coffee', 'Philosophy']);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);

  if (!isOpen) return null;

  // Handle Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await apiClient.requestOtp(email);
      if (res.success) {
        setIsOtpSent(true);
        if (res.devCode) {
          setDevCode(res.devCode);
          setCode(res.devCode); // Pre-fill in dev mode
        }
        playBubblePopSound();
      } else {
        setErrorMsg(res.message || 'Failed to send verification code.');
      }
    } catch {
      setErrorMsg('Could not reach the server. Please verify backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await apiClient.verifyOtp(email, code);
      if (res && res.user) {
        // If user already has a complete profile from before, log in directly!
        if (res.user.nickname && res.user.nickname !== email.split('@')[0]) {
          playDewChimeSound();
          onComplete(res.user);
          return;
        }
        // Otherwise, proceed to Step 3 for avatar and city formulation!
        setNickname(email.split('@')[0]);
        setStep(3);
        playVialSloshSound();
      } else {
        // New account or first-time email: proceed to step 3 with this verified code
        setNickname(email.split('@')[0]);
        setStep(3);
        playVialSloshSound();
      }
    } catch {
      setErrorMsg('Invalid or expired code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Onboarding
  const handleCompleteOnboard = async () => {
    if (!nickname.trim()) {
      setErrorMsg('Please choose a mindful pen-pal pseudonym or nickname.');
      return;
    }
    if (selectedHobbies.length === 0) {
      setErrorMsg('Please select at least 1 reflection hobby.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.onboard({
        email,
        code: code || '123456',
        nickname: nickname.trim(),
        age: Number(age) || 24,
        pronouns,
        location: selectedCity.name,
        latitude: selectedCity.lat,
        longitude: selectedCity.lon,
        bio,
        exchangeInterest,
        hobbies: selectedHobbies,
        avatar
      });

      if (res && res.user) {
        playDewChimeSound();
        onComplete(res.user);
      } else {
        setErrorMsg('Could not complete registration. Please try again.');
      }
    } catch {
      setErrorMsg('Server communication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle hobby
  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      if (selectedHobbies.length > 1) {
        setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
      }
    } else {
      if (selectedHobbies.length < 5) {
        setSelectedHobbies([...selectedHobbies, hobby]);
      }
    }
    playBubblePopSound();
  };

  // Randomize Avatar
  const randomizeAvatar = () => {
    setAvatar({
      skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
      hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyeStyle: 'gentle',
      mouthStyle: 'subtle_smile',
      glassesStyle: Math.random() > 0.5 ? 'round' : 'none',
      clothingStyle: CLOTHING_STYLES[Math.floor(Math.random() * CLOTHING_STYLES.length)],
      clothingColor: '#6B7A6E',
      bgTint: '#F3EFEA'
    });
    playVialSloshSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#FAF7F2] border border-amber-900/10 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header / Steps Stepper */}
        <div className="px-8 pt-8 pb-4 border-b border-amber-900/10 bg-[#F4EFEA]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-800/10 flex items-center justify-center text-amber-900 font-serif font-bold text-xl">
              🫧
            </div>
            <div>
              <h2 className="font-serif text-xl text-stone-900 tracking-tight">Welcome to Bubl</h2>
              <p className="text-xs text-stone-500 font-serif italic">
                A slow-paced sanctuary for mindful thinkers
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif transition-colors ${
                  step === s
                    ? 'bg-amber-800 text-amber-50 font-semibold shadow-sm'
                    : step > s
                    ? 'bg-amber-800/20 text-amber-900'
                    : 'bg-stone-200/60 text-stone-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: THE BUBL MANIFESTO */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 bg-amber-800/10 px-3 py-1 rounded-full">
                  The Four Pillars of Calm Epistolary
                </span>
                <h3 className="text-2xl font-serif text-stone-900 pt-2">
                  Communication that takes time to breathe
                </h3>
                <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                  Bubl is not an instant messenger or a swipe deck. It is an atmospheric sanctuary where
                  letters travel on simulated global wind currents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-stone-200/60 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800/10 flex items-center justify-center text-emerald-800">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-semibold text-stone-900 text-sm">1. Zero Lookism</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    No selfies, face filters, or superficial appearance judgements. Identity is expressed
                    solely through illustrated 2D avatars and thoughtful prose.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200/60 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-amber-800/10 flex items-center justify-center text-amber-800">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-semibold text-stone-900 text-sm">2. Soap Mixture Scarcity</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    You hold a 100ml Mixture Vial. Blowing a weekly bubble takes 25ml. Daily drift reveals
                    only 5 bubbles, and you may burst at most 3.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200/60 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-sky-800/10 flex items-center justify-center text-sky-800">
                    <Wind className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-semibold text-stone-900 text-sm">3. Wind-Paced Delays</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Real geographic distances and live atmospheric air currents determine when letters
                    arrive (10–25 minutes). Letters cannot be rushed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200/60 space-y-2 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-violet-800/10 flex items-center justify-center text-violet-800">
                    <Feather className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-semibold text-stone-900 text-sm">4. 10-Word Title Rule</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Membranes display a concise 10-word reflection title. Automated moderation protects the
                    space against romantic soliciting and spam.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setStep(2);
                    playBubblePopSound();
                  }}
                  className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>Enter the Atmosphere</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MINDFUL SIGN-IN (PASSWORDLESS OTP) */}
          {step === 2 && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-serif text-stone-900">Sign in with Magic Code</h3>
                <p className="text-xs text-stone-500 font-serif">
                  No passwords to remember. Enter your email to receive a mindful 6-digit access code.
                </p>
              </div>

              {!isOtpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-serif font-semibold text-stone-700">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Generating Mindful Code...' : 'Send Magic Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-semibold">A 6-digit code was sent to {email}</p>
                    {devCode && (
                      <p className="text-[11px] text-amber-700/80">
                        Zero friction testing code: <strong className="font-mono">{devCode}</strong>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-semibold text-stone-700">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        maxLength={8}
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/30 text-sm bg-white tracking-widest font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying Code...' : 'Verify & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-800 underline font-serif"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: IDENTITY & SOAP MIXTURE VIAL CRAFTING */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-serif text-stone-900">Craft Your Mindful Identity</h3>
                <p className="text-xs text-stone-500 font-serif">
                  Formulate your 2D avatar, set your global location, and uncork your 100ml Starter Soap Mixture.
                </p>
              </div>

              {/* Avatar Preview & Customizer */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white border border-stone-200/80">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-24 h-24 rounded-full border-2 border-amber-900/10 shadow-inner flex items-center justify-center overflow-hidden bg-[#FAF7F2]">
                    <Avatar2D config={avatar} size="lg" />
                  </div>
                  <button
                    type="button"
                    onClick={randomizeAvatar}
                    className="text-xs font-serif text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 text-xs w-full">
                  <div>
                    <label className="text-[10px] text-stone-500 font-serif block mb-1">Hair Style</label>
                    <select
                      value={avatar.hairStyle}
                      onChange={(e) => setAvatar({ ...avatar, hairStyle: e.target.value as any })}
                      className="w-full p-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      {HAIR_STYLES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 font-serif block mb-1">Clothing Style</label>
                    <select
                      value={avatar.clothingStyle}
                      onChange={(e) => setAvatar({ ...avatar, clothingStyle: e.target.value as any })}
                      className="w-full p-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      {CLOTHING_STYLES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 font-serif block mb-1">Skin Tone</label>
                    <div className="flex gap-1 flex-wrap">
                      {SKIN_TONES.slice(0, 5).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, skinColor: t })}
                          className={`w-4 h-4 rounded-full border ${
                            avatar.skinColor === t ? 'ring-2 ring-amber-800' : 'border-stone-300'
                          }`}
                          style={{ backgroundColor: t }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 font-serif block mb-1">Hair Color</label>
                    <div className="flex gap-1 flex-wrap">
                      {HAIR_COLORS.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, hairColor: c })}
                          className={`w-4 h-4 rounded-full border ${
                            avatar.hairColor === c ? 'ring-2 ring-amber-800' : 'border-stone-300'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nickname, Age, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-serif font-semibold text-stone-700">Pseudonym</label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Kaito"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-serif font-semibold text-stone-700">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-serif font-semibold text-stone-700">Pronouns</label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    placeholder="they/them"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* City Selection */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-semibold text-stone-700 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-800" />
                  <span>Your Sky Airspace / Coordinates (Used for real wind travel calculations)</span>
                </label>
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const match = GLOBAL_CITIES.find((c) => c.name === e.target.value);
                    if (match) setSelectedCity(match);
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                >
                  {GLOBAL_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (Lat: {c.lat.toFixed(2)}, Lon: {c.lon.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hobbies Selection */}
              <div className="space-y-2">
                <label className="text-xs font-serif font-semibold text-stone-700">
                  Select 1–5 Reflection Interests & Essences:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_HOBBIES.slice(0, 16).map((h) => {
                    const active = selectedHobbies.includes(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleHobby(h)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          active
                            ? 'bg-amber-800 text-amber-50 border-amber-800 font-medium'
                            : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        {h} {active && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Starter Soap Mixture Vial Badge */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-800/10 flex items-center justify-center text-amber-900 text-xl font-serif">
                    🧪
                  </div>
                  <div>
                    <h5 className="font-serif font-semibold text-xs text-amber-900">
                      Starter Soap Mixture Vial: 100ml Full
                    </h5>
                    <p className="text-[11px] text-amber-800/80">
                      Enough pure bubble solution to dip your wand and blow your first atmospheric reflection.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-full border border-amber-300">
                  100 ml
                </span>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompleteOnboard}
                  className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-serif text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Uncorking Vial...' : 'Uncork Vial & Enter Bubl'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
