import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';

interface StepOtpVerifyProps {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  onVerify: () => void;
  onResendOtp: () => void;
  isVerifying: boolean;
  error?: string | null;
}

export const StepOtpVerify: React.FC<StepOtpVerifyProps> = ({
  email,
  code,
  onCodeChange,
  password,
  onPasswordChange,
  onVerify,
  onResendOtp,
  isVerifying,
  error
}) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (code.trim().length !== 6) {
      setLocalError('Please enter the 6-digit verification code.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    onVerify();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in text-stone-800">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800">
          <Mail className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
          Verify Your Email & Set Password
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          We sent a 6-digit single-use letter code via Resend to <strong className="text-stone-800 font-mono">{email}</strong>.
        </p>
      </div>

      {(error || localError) && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* 6-Digit Code */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
          6-Digit Verification Code
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono text-center text-lg tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-300 placeholder:tracking-widest"
            autoFocus
            required
          />
        </div>
        <div className="flex justify-between items-center pt-1 text-[11px] text-stone-500">
          <span>Check your spam or promotions folder if delayed</span>
          <button
            type="button"
            onClick={onResendOtp}
            className="text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Resend code</span>
          </button>
        </div>
      </div>

      {/* Password Creation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="At least 6 chars"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
              required
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isVerifying || code.length !== 6 || password.length < 6}
          className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 text-white font-medium text-sm tracking-wide hover:bg-stone-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
          ) : (
            <>
              <span>Verify & Continue to Identity</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
