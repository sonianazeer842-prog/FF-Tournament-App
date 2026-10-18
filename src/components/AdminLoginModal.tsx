import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, X, Eye, EyeOff, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  validPin?: string;
  language?: 'ur' | 'en';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  validPin = '7860',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setShowPin(false);
      setIsShaking(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerError = (msg: string) => {
    sounds.playClick();
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleVerify = (codeToTest?: string) => {
    const code = codeToTest !== undefined ? codeToTest : pin;
    if (!code || code.trim().length === 0) {
      triggerError('Please enter your password');
      return;
    }

    // Verify against 7860 or configured PIN
    if (code.trim() === '7860' || code.trim() === validPin) {
      try {
        sounds.playVictory();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      onSuccess();
      onClose();
    } else {
      triggerError('Incorrect password! Please try again.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  const handleKeypadDigit = (digit: string) => {
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      sounds.playClick();

      // Auto-submit when exactly 4 digits entered and matches password
      if (nextPin === '7860' || nextPin === validPin) {
        setTimeout(() => {
          handleVerify(nextPin);
        }, 150);
      }
    }
  };

  const handleKeypadBackspace = () => {
    sounds.playClick();
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleKeypadClear = () => {
    sounds.playClick();
    setPin('');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Amber Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg font-display font-black text-white">
                Admin Panel Login
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Enter your master password to access the control panel
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Password Input Display (No password hint for complete privacy) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Password</span>
              </span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyPress}
                placeholder="••••"
                className="w-full text-center text-2xl font-mono font-black tracking-[0.35em] py-3 px-10 bg-neutral-950 border border-neutral-800 rounded-xl text-amber-400 placeholder:text-neutral-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1"
                title={showPin ? 'Hide Password' : 'Show Password'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Numeric Keypad for Mobile and Touchscreens */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadDigit(digit)}
                className="py-2.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 active:scale-95 border border-neutral-800/80 text-white font-mono font-bold text-base transition-all select-none shadow-sm cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeypadClear}
              className="py-2.5 rounded-xl bg-neutral-950/80 hover:bg-red-950/40 hover:text-red-300 active:scale-95 border border-neutral-800/80 text-neutral-400 font-bold text-xs uppercase tracking-wider transition-all select-none cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadDigit('0')}
              className="py-2.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 active:scale-95 border border-neutral-800/80 text-white font-mono font-bold text-base transition-all select-none shadow-sm cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="py-2.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 active:scale-95 border border-neutral-800/80 text-neutral-300 font-bold text-sm transition-all select-none cursor-pointer"
              title="Backspace"
            >
              ⌫
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => handleVerify()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:opacity-95 active:scale-[0.99] text-neutral-950 font-display font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>Unlock Admin Panel</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
