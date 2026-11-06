import React, { useState } from 'react';
import { UserProfile, AvatarConfig } from '../../types';
import { apiClient } from '../../services/apiClient';
import { StepManifesto } from './steps/StepManifesto';
import { StepOtpVerify } from './steps/StepOtpVerify';
import { StepSoulIdentity } from './steps/StepSoulIdentity';
import { StepAvatarStudio } from './steps/StepAvatarStudio';
import { StepHobbiesPicker } from './steps/StepHobbiesPicker';
import { StepFirstBubbleRitual } from './steps/StepFirstBubbleRitual';
import { X } from 'lucide-react';

interface OnboardingWizardProps {
  initialEmail: string;
  onComplete: (user: UserProfile) => void;
  onCancel: () => void;
}

const NEUTRAL_INITIAL_AVATAR: AvatarConfig = {
  skinColor: '#F5D0C5',
  hairStyle: 'classic',
  hairColor: '#4A3E3D',
  eyeStyle: 'calm',
  mouthStyle: 'calm',
  glassesStyle: 'none',
  clothingStyle: 'sweater',
  clothingColor: '#7A8B7B',
  bgTint: '#F3EFEA'
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialEmail,
  onComplete,
  onCancel
}) => {
  // Wizard Step (1: Manifesto, 2: OTP & Password, 3: Identity, 4: Avatar, 5: Hobbies, 6: First Bubble)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Registration Payload State (100% blank slate!)
  const [email] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(0);
  const [pronouns, setPronouns] = useState('they/them');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [exchangeInterest, setExchangeInterest] = useState('');
  const [avatar, setAvatar] = useState<AvatarConfig>(NEUTRAL_INITIAL_AVATAR);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [firstBubbleTitle, setFirstBubbleTitle] = useState('');
  const [firstBubbleContent, setFirstBubbleContent] = useState('');
  const [bubbleType, setBubbleType] = useState('thought');

  // UI States
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendOtp = async () => {
    setError(null);
    const res = await apiClient.requestOtp(email, 'signup');
    if (!res.success) {
      setError(res.error || 'Failed to resend verification code.');
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const res = await apiClient.onboard({
      email,
      code,
      password,
      nickname,
      dob,
      age,
      pronouns,
      location,
      latitude,
      longitude,
      bio,
      languages,
      exchangeInterest,
      hobbies,
      avatar,
      firstBubble: {
        title: firstBubbleTitle.trim(),
        content: firstBubbleContent.trim(),
        bubbleType,
        bubbleColor: '#8D7B68'
      }
    });

    setIsSubmitting(false);

    if (res.success && res.data?.user) {
      onComplete(res.data.user);
    } else {
      setError(res.error || 'Registration failed. Please check your verification code.');
      // If code was invalid, jump back to Step 2
      if (res.error?.toLowerCase().includes('code')) {
        setStep(2);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-[#FAF8F5] rounded-3xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(40,30,20,0.3)] overflow-hidden">
        {/* Top Progress & Cancel */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <span className="text-sm">🫧</span>
            <span className="font-serif font-semibold text-xs text-stone-700 tracking-wide uppercase">
              Step {step} of 6
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-amber-600'
                    : s < step
                    ? 'w-2 bg-stone-400'
                    : 'w-2 bg-stone-200'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Cancel onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Active Step */}
        <div className="p-6 md:p-8">
          {step === 1 && (
            <StepManifesto onAgree={() => setStep(2)} />
          )}

          {step === 2 && (
            <StepOtpVerify
              email={email}
              code={code}
              onCodeChange={setCode}
              password={password}
              onPasswordChange={setPassword}
              onVerify={() => setStep(3)}
              onResendOtp={handleResendOtp}
              isVerifying={isVerifying}
              error={error}
            />
          )}

          {step === 3 && (
            <StepSoulIdentity
              nickname={nickname}
              onNicknameChange={setNickname}
              dob={dob}
              onDobChange={(newDob, newAge) => {
                setDob(newDob);
                setAge(newAge);
              }}
              pronouns={pronouns}
              onPronounsChange={setPronouns}
              location={location}
              onLocationChange={(loc, lat, lon) => {
                setLocation(loc);
                if (lat !== undefined) setLatitude(lat);
                if (lon !== undefined) setLongitude(lon);
              }}
              bio={bio}
              onBioChange={setBio}
              languages={languages}
              onLanguagesChange={setLanguages}
              exchangeInterest={exchangeInterest}
              onExchangeInterestChange={setExchangeInterest}
              onNext={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <StepAvatarStudio
              avatar={avatar}
              onChange={setAvatar}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <StepHobbiesPicker
              selectedHobbies={hobbies}
              onChange={setHobbies}
              onNext={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <StepFirstBubbleRitual
              firstBubbleTitle={firstBubbleTitle}
              onTitleChange={setFirstBubbleTitle}
              firstBubbleContent={firstBubbleContent}
              onContentChange={setFirstBubbleContent}
              bubbleType={bubbleType}
              onBubbleTypeChange={setBubbleType}
              onSubmit={handleFinalSubmit}
              onBack={() => setStep(5)}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};
