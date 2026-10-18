import React, { useState } from 'react';
import {
  User,
  Shield,
  Trophy,
  Crosshair,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Globe,
  LogOut,
  LogIn,
  Edit2,
  Check,
  X,
  Mail,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sounds } from '../utils/audio';

interface PlayerProfileViewProps {
  playerIgn: string;
  playerUid: string;
  playerEmail?: string;
  walletBalance: number;
  openWallet: () => void;
  matchesJoinedCount: number;
  language: 'ur' | 'en';
  setLanguage: (lang: 'ur' | 'en') => void;
  openAdminLogin?: () => void;
  openAuthModal?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  onUpdateIgnUid?: (newIgn: string, newUid: string) => Promise<void>;
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  playerIgn,
  playerUid,
  playerEmail,
  walletBalance,
  openWallet,
  matchesJoinedCount,
  language,
  setLanguage,
  openAdminLogin,
  openAuthModal,
  onLogout,
  isLoggedIn = true,
  onUpdateIgnUid,
}) => {
  const { isInstalled } = usePWAInstall();
  const [isEditing, setIsEditing] = useState(false);
  const [editIgn, setEditIgn] = useState(playerIgn);
  const [editUid, setEditUid] = useState(playerUid);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!editIgn.trim() || !editUid.trim()) return;
    setSaving(true);
    try {
      if (onUpdateIgnUid) {
        await onUpdateIgnUid(editIgn.trim(), editUid.trim());
      }
      sounds.playVictory();
      setIsEditing(false);
    } catch {
      sounds.playClick();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* If Not Logged In Banner */}
      {!isLoggedIn && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>Login with your Email & Password</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Get your personal Free Fire Battle ID to join custom rooms and claim cash prizes.
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              openAuthModal?.();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs whitespace-nowrap cursor-pointer shadow-md"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Player Header Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shrink-0 shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center font-display font-black text-2xl text-amber-400">
                {playerIgn ? playerIgn.charAt(0).toUpperCase() : 'P'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {!isEditing ? (
                <>
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

                  {playerEmail && (
                    <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-neutral-500" />
                      <span className="truncate">{playerEmail}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2 py-1">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-semibold block mb-0.5">Edit IGN</label>
                    <input
                      type="text"
                      value={editIgn}
                      onChange={(e) => setEditIgn(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white font-bold w-full"
                      placeholder="Free Fire IGN"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-semibold block mb-0.5">Edit Free Fire UID</label>
                    <input
                      type="text"
                      value={editUid}
                      onChange={(e) => setEditUid(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-amber-400 font-mono w-full"
                      placeholder="Free Fire UID"
                    />
                  </div>
                </div>
              )}

              <span className="text-[11px] text-emerald-400 font-medium block mt-1">
                🇵🇰 Pakistan Region Server · Verified Contender ID
              </span>
            </div>
          </div>

          {/* Edit / Save Button */}
          {isLoggedIn && (
            <div className="flex sm:flex-col gap-2 shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setEditIgn(playerIgn);
                    setEditUid(playerUid);
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Edit Game ID</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    disabled={saving}
                    onClick={handleSaveProfile}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 text-xs font-semibold hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
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
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Deposit / Cashout
            </button>
          </div>
        </div>
      </div>

      {/* PWA Standalone Notice */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-white text-base">Mobile App Status</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isInstalled ? 'Installed Native' : 'PWA Ready'}
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          {isInstalled
            ? 'Qazi Battle App is installed and running in standalone native mode.'
            : 'Install app to your home screen for full-screen Free Fire tournament alerts.'}
        </p>

        {!isInstalled && <PWAInstallButton variant="button" language={language} />}
      </div>

      {/* App Preferences & Account Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3 text-xs">
        <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">Settings & Preferences</h4>

        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-200">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span>Language</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setLanguage(language === 'ur' ? 'en' : 'ur');
            }}
            className="px-3 py-1 rounded-md bg-neutral-950 border border-neutral-800 font-bold text-neutral-200 hover:text-white cursor-pointer"
          >
            {language === 'ur' ? 'English' : 'اردو'}
          </button>
        </div>

        {/* Account Authentication Action */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-200">
            <User className="w-4 h-4 text-neutral-400" />
            <span>Account Status</span>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => {
                sounds.playClick();
                onLogout?.();
              }}
              className="px-3 py-1 rounded-md bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 font-bold text-red-300 hover:text-red-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                openAuthModal?.();
              }}
              className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 font-bold text-neutral-950 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between py-2 text-neutral-400">
          <span>App Version</span>
          <span className="font-mono text-neutral-300 font-semibold">v2.5.0 (Firebase Auth)</span>
        </div>

        <div className="flex items-center justify-between py-2 text-neutral-400">
          <span>Platform Status</span>
          <span className="text-emerald-400 font-semibold">Firebase Cloud Sync Active</span>
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
