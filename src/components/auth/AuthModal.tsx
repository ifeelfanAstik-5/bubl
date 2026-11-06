import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { apiClient } from '../../services/apiClient';
import { Mail, Lock, KeyRound, Sparkles, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [isOtpLoginMode, setIsOtpLoginMode] = useState(false);
  const [otpLoginSent, setOtpLoginSent] = useState(false);
  const [otpLoginCode, setOtpLoginCode] = useState('');

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Sign In with Password
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await apiClient.login(signInEmail.trim(), signInPassword);
    setIsLoading(false);

    if (res.success && res.data?.user) {
      onSuccess(res.data.user);
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  // Handle Request OTP for Login
  const handleRequestLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await apiClient.requestOtp(signInEmail.trim(), 'login');
    setIsLoading(false);

    if (res.success) {
      setOtpLoginSent(true);
    } else {
      setError(res.error || 'Failed to dispatch verification code.');
    }
  };

  // Handle Verify Login OTP
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await apiClient.verifyLoginOtp(signInEmail.trim(), otpLoginCode.trim());
    setIsLoading(false);

    if (res.success && res.data?.user) {
      onSuccess(res.data.user);
    } else {
      setError(res.error || 'Invalid or expired verification code.');
    }
  };

  // Handle Start Sign Up Journey
  const handleStartSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await apiClient.requestOtp(signUpEmail.trim(), 'signup');
    setIsLoading(false);

    if (res.success) {
      setShowWizard(true);
    } else {
      setError(res.error || 'Unable to start journey with this email.');
    }
  };

  // If in Onboarding Wizard flow
  if (showWizard) {
    return (
      <OnboardingWizard
        initialEmail={signUpEmail.trim()}
        onComplete={(user) => {
          setShowWizard(false);
          onSuccess(user);
        }}
        onCancel={() => {
          setShowWizard(false);
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(40,30,20,0.3)] overflow-hidden">
        {/* Brand Banner */}
        <div className="text-center pt-8 pb-5 px-6 space-y-2 border-b border-stone-200/60 bg-gradient-to-b from-white/80 to-[#FAF8F5]">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-200 via-sky-200 to-rose-200 p-0.5 shadow-xs flex items-center justify-center animate-float-slow">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">
              🫧
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight font-serif-letter">
            Bubl
          </h1>
          <p className="text-xs text-stone-500 font-sans max-w-xs mx-auto">
            Mindful Pen Pals & Slow Thought Exchange carried by real global winds.
          </p>

          {/* Dual Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-stone-200/60 max-w-xs mx-auto mt-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                tab === 'signin'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                tab === 'signup'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Begin Journey
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <div>
              {!isOtpLoginMode ? (
                // 1A: Email + Password Login Form
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpLoginMode(true);
                          setOtpLoginSent(false);
                          setError(null);
                        }}
                        className="text-[11px] text-amber-800 hover:text-amber-900 hover:underline"
                      >
                        Sign in via email code instead
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !signInEmail || !signInPassword}
                      className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <>
                          <span>Sign In to Airspace</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : !otpLoginSent ? (
                // 1B: Request OTP for Login
                <form onSubmit={handleRequestLoginOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setIsOtpLoginMode(false)}
                      className="text-stone-500 hover:text-stone-800"
                    >
                      ← Back to password login
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !signInEmail}
                      className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <>
                          <span>Send Sign-In Code</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // 1C: Verify Login OTP
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                      Enter 6-Digit Code sent to {signInEmail}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpLoginCode}
                        onChange={(e) => setOtpLoginCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-center font-mono text-lg tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-stone-500">
                    <button
                      type="button"
                      onClick={() => setOtpLoginSent(false)}
                      className="hover:text-stone-800"
                    >
                      ← Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestLoginOtp}
                      className="text-amber-800 hover:underline"
                    >
                      Resend code
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || otpLoginCode.length !== 6}
                      className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <span>Verify & Sign In</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: BEGIN JOURNEY (SIGN UP) */}
          {tab === 'signup' && (
            <form onSubmit={handleStartSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                  Your Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed pt-0.5">
                  We will dispatch a 6-digit confirmation code via Resend to verify your inbox before guiding you through the sacred 6-step onboarding ritual.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !signUpEmail}
                  className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <>
                      <span>Begin Guided Journey</span>
                      <ArrowRight className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-stone-400">
            <span>Anti-Lookism · Physical Wind Pacing · 100ml Starter Vial</span>
          </div>
        </div>
      </div>
    </div>
  );
};
