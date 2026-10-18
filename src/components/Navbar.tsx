import React from 'react';
import { Trophy, Wallet, Smartphone, User } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { sounds } from '../utils/audio';

interface NavbarProps {
  activeTab: 'tournaments' | 'guide' | 'points' | 'wallet' | 'profile';
  setActiveTab: (tab: 'tournaments' | 'guide' | 'points' | 'wallet' | 'profile') => void;
  openWallet: () => void;
  walletBalance: number;
  language: 'ur' | 'en';
  setLanguage: (lang: 'ur' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openWallet,
  walletBalance,
  language,
  setLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
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

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tournaments');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'tournaments'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            {language === 'ur' ? 'Tournaments' : 'Tournaments'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('guide');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'guide'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            {language === 'ur' ? 'Step-by-Step Rahnumai' : 'Esports Guide'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('points');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'points'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            {language === 'ur' ? 'FFWS Points Table' : 'FFWS Points Table'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('profile');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'profile'
                ? 'text-amber-400 font-semibold underline underline-offset-8 decoration-2 decoration-amber-500'
                : 'text-neutral-400'
            }`}
          >
            {language === 'ur' ? 'Player Profile' : 'Player Profile'}
          </button>
        </nav>

        {/* Zone 3: Primary Action, PWA Install & Wallet */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* PWA Install Button in Header */}
          <PWAInstallButton variant="button" language={language} />

          {/* Language Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setLanguage(language === 'ur' ? 'en' : 'ur');
            }}
            title="Switch Language / Zuban Badlein"
            className="px-2 py-1 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-md transition-colors"
          >
            {language === 'ur' ? 'English' : 'اردو'}
          </button>

          {/* Wallet Balance with EasyPaisa / JazzCash badge */}
          <button
            onClick={() => {
              sounds.playClick();
              openWallet();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 transition-colors"
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
