import React from 'react';
import { Trophy, Wallet, Smartphone, User, LogIn, LogOut, Crosshair } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { sounds } from '../utils/audio';

interface NavbarProps {
  activeTab: 'tournaments' | 'guide' | 'points' | 'wallet' | 'profile';
  setActiveTab: (tab: 'tournaments' | 'guide' | 'points' | 'wallet' | 'profile') => void;
  openWallet: () => void;
  walletBalance: number;
  language: 'ur' | 'en';
  setLanguage: (lang: 'ur' | 'en') => void;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  playerIgn: string;
  playerUid: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openWallet,
  walletBalance,
  language,
  setLanguage,
  openAuthModal,
  isLoggedIn,
  playerIgn,
  playerUid,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => {
            sounds.playClick();
            setActiveTab('tournaments');
          }}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
            <Trophy className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
          </div>
          <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white uppercase">
            Qazi<span className="text-amber-500">Battle</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tournaments');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              activeTab === 'tournaments'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            Tournaments
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('guide');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              activeTab === 'guide'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            Esports Guide
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('points');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              activeTab === 'points'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            FFWS Points Table
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('profile');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white cursor-pointer ${
              activeTab === 'profile'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            Player Profile
          </button>
        </nav>

        {/* Zone 3: Primary Action, Auth & Wallet */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* PWA Install Button in Header */}
          <PWAInstallButton variant="button" language={language} />

          {/* User Auth Button */}
          {isLoggedIn ? (
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('profile');
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 transition-colors cursor-pointer group"
              title={`Logged in as ${playerIgn} (UID: ${playerUid})`}
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                {playerIgn ? playerIgn.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-white text-xs truncate max-w-[100px] leading-tight">
                  {playerIgn}
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono leading-tight">
                  UID:{playerUid.slice(-4)}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                openAuthModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-neutral-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sign In</span>
            </button>
          )}

          {/* Wallet Balance with EasyPaisa / JazzCash badge */}
          <button
            onClick={() => {
              sounds.playClick();
              openWallet();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-mono font-bold text-amber-400">Rs.{walletBalance}</span>
            <span className="hidden sm:inline text-neutral-400 text-[10px]">PKR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
