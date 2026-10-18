import React from 'react';
import { User, Shield, Trophy, Crosshair, Wallet, ArrowDownLeft, ArrowUpRight, Smartphone, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sounds } from '../utils/audio';

interface PlayerProfileViewProps {
  playerIgn: string;
  playerUid: string;
  walletBalance: number;
  openWallet: () => void;
  matchesJoinedCount: number;
  language: 'ur' | 'en';
  setLanguage: (lang: 'ur' | 'en') => void;
  openAdminLogin?: () => void;
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  playerIgn,
  playerUid,
  walletBalance,
  openWallet,
  matchesJoinedCount,
  language,
  setLanguage,
  openAdminLogin,
}) => {
  const { isInstalled } = usePWAInstall();

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Player Header Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shrink-0 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center font-display font-black text-2xl text-amber-400">
              {playerIgn.charAt(0)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-lg sm:text-xl text-white truncate">{playerIgn}</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO Contender
              </span>
            </div>

            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
              <span>Free Fire UID:</span>
              <span className="font-mono font-bold text-neutral-200">{playerUid}</span>
            </div>

            <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">
              🇵🇰 Pakistan Region Server · Verified Player
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-neutral-800 text-center">
          <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Matches</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">{matchesJoinedCount}</span>
          </div>

          <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Total Kills</span>
            <span className="text-base font-bold font-mono text-orange-400 tabular-nums">48 Kills</span>
          </div>

          <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800/80">
            <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Win Rate</span>
            <span className="text-base font-bold font-mono text-amber-400 tabular-nums">64%</span>
          </div>
        </div>
      </div>

      {/* Wallet Summary Card with EasyPaisa / JazzCash */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-white text-base">Esports Wallet</h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">EasyPaisa · JazzCash</span>
        </div>

        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-500 block uppercase font-semibold">Current Balance</span>
            <div className="text-2xl font-display font-black text-amber-400 font-mono tabular-nums">
              Rs. {walletBalance} <span className="text-xs text-neutral-400 font-sans">PKR</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                openWallet();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                openWallet();
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA App Installation Status Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-white text-base">Mobile App (PWA)</h3>
          </div>
          {isInstalled ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Installed
            </span>
          ) : (
            <span className="text-xs text-amber-400 font-semibold">Install Available</span>
          )}
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          {isInstalled
            ? 'Qazi Battle App aapke mobile par pehle se install hai aur standalone native mode me chal rahi hai.'
            : 'App ko mobile home screen par install karein taake baghair browser bar ke full-screen Free Fire experience mile.'}
        </p>

        {!isInstalled && <PWAInstallButton variant="button" language={language} />}
      </div>

      {/* App Preferences */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 text-xs">
        <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">Settings & Preferences</h4>

        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-200">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span>Language (Zuban)</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setLanguage(language === 'ur' ? 'en' : 'ur');
            }}
            className="px-3 py-1 rounded-md bg-neutral-950 border border-neutral-800 font-bold text-neutral-200 hover:text-white"
          >
            {language === 'ur' ? 'اردو / Roman' : 'English'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 text-neutral-400">
          <span>App Version</span>
          <span className="font-mono text-neutral-300 font-semibold">v2.4.0 (PWA Mobile)</span>
        </div>

        <div className="flex items-center justify-between py-2 text-neutral-400">
          <span>Platform Status</span>
          <span className="text-emerald-400 font-semibold">Active & Encrypted</span>
        </div>

        {openAdminLogin && (
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-neutral-400">Organizer Controls</span>
            <button
              onClick={() => {
                sounds.playClick();
                openAdminLogin();
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
