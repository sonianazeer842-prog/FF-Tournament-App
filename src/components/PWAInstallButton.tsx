import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Check, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sounds } from '../utils/audio';

interface PWAInstallButtonProps {
  variant?: 'banner' | 'button' | 'badge';
  language?: 'ur' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'banner', language = 'ur' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running in standalone PWA mode or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    sounds.playClick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General fallback instructions for Chromium or manual install
      setShowIOSModal(true);
    }
  };

  // Compact Button Variant (e.g. for header or profile)
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{language === 'ur' ? 'Install App' : 'Install App'}</span>
        </button>

        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} language={language} isIOS={isIOS} />}
      </>
    );
  }

  // Home Screen Feature Banner Variant (100% Mobile Friendly)
  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 p-3.5 sm:p-4 mb-5 shadow-lg">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shrink-0 shadow-md">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm sm:text-base text-white">
                  Qazi Battle App Install Karein
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  PWA Mobile
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5">
                {language === 'ur'
                  ? 'Bina browser ke full-screen mobile app ki tarah chalaein. Fast speed aur real-time notifications!'
                  : 'Fast loading, offline cache, and full-screen gaming experience directly from your home screen.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setDismissed(true);
              }}
              className="p-1.5 text-neutral-500 hover:text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} language={language} isIOS={isIOS} />}
    </>
  );
};

// Modal for iOS Safari / Manual Installation
interface IOSModalProps {
  onClose: () => void;
  language: 'ur' | 'en';
  isIOS: boolean;
}

const IOSInstallModal: React.FC<IOSModalProps> = ({ onClose, language, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-neutral-100 shadow-2xl space-y-4">
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
          <Smartphone className="w-6 h-6 text-neutral-950 stroke-[2.5]" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-display font-bold text-white">
            {isIOS ? 'iPhone / iPad Par Install Karein' : 'Mobile Screen Par Add Karein'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Qazi Battle App ko apne mobile ki home screen par baghair download kiye install karein.
          </p>
        </div>

        <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-bold font-mono text-amber-400 shrink-0">
              1
            </div>
            <div>
              <p className="text-neutral-200">
                Safari browser ke neeche <strong>Share</strong> button dabayein:
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 text-blue-400 mt-1 text-[11px] font-semibold">
                <Share className="w-3.5 h-3.5" />
                <span>Share Icon (Square with Arrow)</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-neutral-800/80 pt-3">
            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-bold font-mono text-amber-400 shrink-0">
              2
            </div>
            <div>
              <p className="text-neutral-200">
                Menu scroll karein aur <strong>Add to Home Screen</strong> select karein:
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900 text-emerald-400 mt-1 text-[11px] font-semibold">
                <PlusSquare className="w-3.5 h-3.5" />
                <span>Add to Home Screen</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-neutral-800/80 pt-3">
            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center font-bold font-mono text-amber-400 shrink-0">
              3
            </div>
            <div>
              <p className="text-neutral-200">
                Top right par <strong>Add</strong> dabayein. App icon aapke mobile par show ho jayega!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all"
        >
          Samajh Gaya (Close)
        </button>
      </div>
    </div>
  );
};
