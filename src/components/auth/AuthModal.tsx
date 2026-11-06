import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { apiClient } from '../../services/apiClient';
import {
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  // Mode: 'signin' (existing user) or 'signup' (new user)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State (ID can be username or email)
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign In with Email OTP fallback
  const [isOtpSignInMode, setIsOtpSignInMode] = useState(false);
  const [otpSignInSent, setOtpSignInSent] = useState(false);
  const [otpSignInCode, setOtpSignInCode] = useState('');

  // Sign Up State
  const [signUpStep, setSignUpStep] = useState<'form' | 'verify'>('form');
  const [signUpNickname, setSignUpNickname] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpDob, setSignUpDob] = useState('');
  const [signUpOtpCode, setSignUpOtpCode] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Google Sign-In prompt modal state
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Existing User: Password Sign In (using ID: Username or Email)
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInIdentifier.trim()) {
      setError('Please enter your username or email address.');
      return;
    }
    if (!signInPassword) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await apiClient.login(signInIdentifier.trim(), signInPassword);
    setIsLoading(false);

    if (res.success && res.data?.user) {
      onSuccess(res.data.user);
    } else {
      setError(res.error || 'Invalid credentials. Please verify your ID and password.');
    }
  };

  // 2. Existing User: Request OTP for login
  const handleRequestSignInOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInIdentifier.trim() || !signInIdentifier.includes('@')) {
      setError('Please enter a valid email address to receive a login code.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await apiClient.requestOtp(signInIdentifier.trim(), 'login');
    setIsLoading(false);

    if (res.success) {
      setOtpSignInSent(true);
      setSuccessNotice(`Verification code sent to ${signInIdentifier.trim()}.`);
    } else {
      setError(res.error || 'Failed to dispatch verification code.');
    }
  };

  // 3. Existing User: Verify OTP for login
  const handleVerifySignInOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSignInCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await apiClient.verifyLoginOtp(signInIdentifier.trim(), otpSignInCode.trim());
    setIsLoading(false);

    if (res.success && res.data?.user) {
      onSuccess(res.data.user);
    } else {
      setError(res.error || 'Invalid or expired verification code.');
    }
  };

  // 4. New User: Step 1 - Submit Form & Dispatch Resend OTP
  const handleStartSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpNickname.trim()) {
      setError('Please choose a username.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await apiClient.requestOtp(signUpEmail.trim(), 'signup');
    setIsLoading(false);

    if (res.success) {
      setSignUpStep('verify');
      setSuccessNotice(`A 6-digit verification code has been dispatched to ${signUpEmail.trim()}`);
    } else {
      setError(res.error || 'Unable to register with this email. Please check your address or try signing in.');
    }
  };

  // 5. New User: Step 2 - Verify OTP & Create Account directly
  const handleCompleteSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpOtpCode.trim()) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await apiClient.registerSimple({
      nickname: signUpNickname.trim(),
      email: signUpEmail.trim(),
      password: signUpPassword,
      code: signUpOtpCode.trim(),
      dob: signUpDob || undefined
    });
    setIsLoading(false);

    if (res.success && res.data?.user) {
      onSuccess(res.data.user);
    } else {
      setError(res.error || 'Verification failed. Please check the code and try again.');
    }
  };

  // 6. Google Sign-In / Register Handler
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setError('Please provide a valid Google account email.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await apiClient.googleAuth({
      email: googleEmail.trim(),
      name: googleName.trim() || undefined
    });
    setIsLoading(false);

    if (res.success && res.data?.user) {
      setIsGooglePromptOpen(false);
      onSuccess(res.data.user);
    } else {
      setError(res.error || 'Google authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FCFBF9] rounded-3xl border border-stone-200/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden my-6">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-100/70 via-rose-100/30 to-transparent pointer-events-none" />

        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm border border-stone-200/80 text-2xl animate-float-slow">
              🫧
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-serif-letter">
                Welcome to Bubl
              </h1>
              <p className="text-xs text-stone-500 font-serif-letter mt-1">
                Mindful connections, slow atmospheric thoughts & drifting letters.
              </p>
            </div>
          </div>

          {/* Upfront Choice Segment: Existing User vs New User */}
          <div className="bg-stone-100/90 p-1 rounded-2xl flex items-center border border-stone-200/70 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signin'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Existing Member</span>
              <span className="text-[10px] opacity-60">(Sign In)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>New to Bubl</span>
              <span className="text-[10px] opacity-60">(Create Account)</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-rose-50/90 border border-rose-200/80 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successNotice}</span>
            </div>
          )}

          {/* Google Sign-In One-Click Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsGooglePromptOpen(true);
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-center gap-2.5 transition-all hover:border-stone-300 active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{authMode === 'signin' ? 'Sign In with Google' : 'Sign Up with Google (Instant)'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200/80" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-stone-400 font-mono">
                <span className="bg-[#FCFBF9] px-3 font-normal">
                  {authMode === 'signin' ? 'or sign in with id & password' : 'or register with username'}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: EXISTING MEMBER (SIGN IN) */}
          {/* ============================================================ */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              {!isOtpSignInMode ? (
                // Standard ID & Password Login
                <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                      Account ID (Username or Email)
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        placeholder="e.g. sky_wanderer or your@email.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSignInMode(true);
                          setError(null);
                        }}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-medium font-sans"
                      >
                        Sign in via Email Code
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-medium text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing in peacefully...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Airspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Email OTP Login Fallback
                <div className="space-y-3.5">
                  {!otpSignInSent ? (
                    <form onSubmit={handleRequestSignInOtp} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                          Your Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={signInIdentifier}
                            onChange={(e) => setSignInIdentifier(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifySignInOtp} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                          Enter 6-Digit Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpSignInCode}
                          onChange={(e) => setOtpSignInCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full py-3 text-center tracking-[0.3em] font-mono text-base bg-white border border-stone-200/90 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Verify & Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSignInMode(false);
                      setOtpSignInSent(false);
                      setError(null);
                    }}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-800 transition-all font-sans"
                  >
                    ← Back to Password Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: NEW TO BUBL (CREATE ACCOUNT) */}
          {/* ============================================================ */}
          {authMode === 'signup' && (
            <div className="space-y-4">
              {signUpStep === 'form' ? (
                // Step 1: Form
                <form onSubmit={handleStartSignUp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                      Choose Your Username
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={30}
                        value={signUpNickname}
                        onChange={(e) => setSignUpNickname(e.target.value)}
                        placeholder="e.g. river_wanderer"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                      Password (min. 6 chars)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-600 block">
                      Date of Birth (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={signUpDob}
                        onChange={(e) => setSignUpDob(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200/90 rounded-2xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending verification code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Email Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Step 2: 6-Digit Email Verification Code
                <form onSubmit={handleCompleteSignUp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-semibold text-stone-900 font-serif-letter">
                      Verify Your Email Address
                    </span>
                    <p className="text-[11px] text-stone-500 font-serif-letter">
                      Enter the 6-digit verification code sent via Resend to{' '}
                      <strong className="text-stone-800">{signUpEmail}</strong>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={signUpOtpCode}
                      onChange={(e) => setSignUpOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full py-3.5 text-center tracking-[0.35em] font-mono text-lg bg-white border border-stone-200/90 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account & Enter Airspace</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSignUpStep('form')}
                      className="text-stone-500 hover:text-stone-800 font-sans"
                    >
                      ← Edit details
                    </button>
                    <button
                      type="button"
                      onClick={handleStartSignUp}
                      disabled={isLoading}
                      className="text-amber-700 hover:text-amber-800 font-medium font-sans"
                    >
                      Resend code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-2 border-t border-stone-200/60 text-center">
            <p className="text-[10px] text-stone-400 font-serif-letter">
              Bubl preserves your session automatically. When you return, simply sign in with your ID and password.
            </p>
          </div>
        </div>
      </div>

      {/* Google Prompt Modal Dialog */}
      {isGooglePromptOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-stone-900 font-sans">
                  Continue with Google
                </h3>
              </div>
              <button
                onClick={() => setIsGooglePromptOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              Enter your Google account email to sign in or create your profile instantly.
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-500 block">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-stone-500 block">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsGooglePromptOpen(false)}
                  className="flex-1 py-2 px-3 border border-stone-200 text-stone-600 rounded-xl text-xs font-sans hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 bg-stone-900 text-white rounded-xl text-xs font-sans font-medium hover:bg-stone-800 disabled:opacity-50"
                >
                  {isLoading ? 'Attuning...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
