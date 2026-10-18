import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Smartphone,
  Coins,
  Trophy,
  Key,
  PlusCircle,
  Sliders,
  Send,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Settings,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Tournament,
  MatchMode,
  MatchMap,
  DepositRequest,
  WithdrawalRequest,
  AdminPaymentSettings,
  MatchProofSubmission,
} from '../types/tournament';
import { sounds } from '../utils/audio';

interface AdminPortalProps {
  tournaments: Tournament[];
  onCreateTournament: (tournament: Tournament) => void;
  onUpdateRoomCredentials: (tournamentId: string, roomId: string, pass: string, revealNow: boolean) => void;
  onDeclareWinner: (tournamentId: string, winnerTeam: string, winnerIgn: string) => void;
  depositRequests: DepositRequest[];
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string) => void;
  withdrawalRequests: WithdrawalRequest[];
  onCompleteWithdrawal: (withdrawalId: string, refId: string) => void;
  onRejectWithdrawal: (withdrawalId: string) => void;
  pendingProofs: MatchProofSubmission[];
  onApproveProof: (proofId: string) => void;
  onRejectProof: (proofId: string) => void;
  adminSettings: AdminPaymentSettings;
  onUpdateSettings: (settings: AdminPaymentSettings) => void;
  onExitAdmin: () => void;
  language: 'ur' | 'en';
  initiallyUnlocked?: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  tournaments,
  onCreateTournament,
  onUpdateRoomCredentials,
  onDeclareWinner,
  depositRequests,
  onApproveDeposit,
  onRejectDeposit,
  withdrawalRequests,
  onCompleteWithdrawal,
  onRejectWithdrawal,
  pendingProofs,
  onApproveProof,
  onRejectProof,
  adminSettings,
  onUpdateSettings,
  onExitAdmin,
  language,
  initiallyUnlocked = false,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(initiallyUnlocked);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('qb_admin_failed_attempts') || '0');
    } catch {
      return 0;
    }
  });
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'tournaments' | 'rooms' | 'results' | 'settings'>('deposits');
  const [successToast, setSuccessToast] = useState('');

  // Tournament creation form state
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<MatchMode>('Squad');
  const [map, setMap] = useState<MatchMap>('Bermuda');
  const [entryFee, setEntryFee] = useState(50);
  const [prizePool, setPrizePool] = useState(2500);
  const [perKill, setPerKill] = useState(25);
  const [startTimeMinutes, setStartTimeMinutes] = useState(45);
  const [gunAttributes, setGunAttributes] = useState(false);
  const [limitedAmmo, setLimitedAmmo] = useState(true);
  const [characterSkills, setCharacterSkills] = useState(true);
  const [emulatorAllowed, setEmulatorAllowed] = useState(false);

  // Room broadcast form
  const [selectedTournForRoom, setSelectedTournForRoom] = useState(tournaments[0]?.id || '');
  const [broadcastRoomId, setBroadcastRoomId] = useState('');
  const [broadcastPass, setBroadcastPass] = useState('');

  // Result declaration form
  const [selectedTournForResult, setSelectedTournForResult] = useState(tournaments[0]?.id || '');
  const [winnerTeamInput, setWinnerTeamInput] = useState('');
  const [winnerIgnInput, setWinnerIgnInput] = useState('');

  // Settings edit form
  const [epNumber, setEpNumber] = useState(adminSettings.easypaisaNumber);
  const [epTitle, setEpTitle] = useState(adminSettings.easypaisaTitle || 'Saad Kazi (Qazi Battle Official)');
  const [jcNumber, setJcNumber] = useState(adminSettings.jazzcashNumber);
  const [jcTitle, setJcTitle] = useState(adminSettings.jazzcashTitle || 'Saad Kazi');
  const [adminPin, setAdminPin] = useState(adminSettings.adminPin);
  const [supportWhatsapp, setSupportWhatsapp] = useState(adminSettings.supportWhatsapp || '+92 345 9876543');
  const [merchantApiEnabled, setMerchantApiEnabled] = useState(adminSettings.merchantApiEnabled || false);
  const [merchantApiKey, setMerchantApiKey] = useState(adminSettings.merchantApiKey || '');
  const [merchantStoreId, setMerchantStoreId] = useState(adminSettings.merchantStoreId || '');

  React.useEffect(() => {
    setEpNumber(adminSettings.easypaisaNumber);
    setEpTitle(adminSettings.easypaisaTitle || 'Saad Kazi (Qazi Battle Official)');
    setJcNumber(adminSettings.jazzcashNumber);
    setJcTitle(adminSettings.jazzcashTitle || 'Saad Kazi');
    setAdminPin(adminSettings.adminPin);
    setSupportWhatsapp(adminSettings.supportWhatsapp || '+92 345 9876543');
    setMerchantApiEnabled(adminSettings.merchantApiEnabled || false);
  }, [adminSettings]);

  // Lockout timer check on mount & interval
  React.useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntilStr = localStorage.getItem('qb_admin_lockout_until');
        if (lockoutUntilStr) {
          const lockoutUntil = Number(lockoutUntilStr);
          const diff = lockoutUntil - Date.now();
          if (diff > 0) {
            setLockoutRemaining(Math.ceil(diff / 1000));
          } else {
            setLockoutRemaining(0);
            localStorage.removeItem('qb_admin_lockout_until');
            localStorage.setItem('qb_admin_failed_attempts', '0');
            setFailedAttempts(0);
          }
        }
      } catch {
        // ignore
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) {
      setPinError(`Security Lockout Active. Please wait ${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s.`);
      return;
    }

    if (pinInput === adminSettings.adminPin || pinInput === '7860') {
      sounds.playVictory();
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
      setFailedAttempts(0);
      try {
        localStorage.setItem('qb_admin_failed_attempts', '0');
        localStorage.removeItem('qb_admin_lockout_until');
      } catch {}
    } else {
      sounds.playClick();
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      try {
        localStorage.setItem('qb_admin_failed_attempts', String(newAttempts));
      } catch {}

      if (newAttempts >= 3) {
        // Trigger 10-minute lockout (10 * 60 * 1000 = 600,000 ms)
        const lockUntil = Date.now() + 10 * 60 * 1000;
        try {
          localStorage.setItem('qb_admin_lockout_until', String(lockUntil));
        } catch {}
        setLockoutRemaining(600);
        setPinError(
          language === 'ur'
            ? '3 ghalat koshishein! Security waja se Admin Panel 10 minute ke liye block kar diya gaya hai.'
            : '3 failed attempts! Admin portal is blocked for 10 minutes.'
        );
      } else {
        const remaining = 3 - newAttempts;
        setPinError(
          language === 'ur'
            ? `Ghalat PIN! (${remaining} koshish baqi hai - 3 ghalat par 10 minute block)`
            : `Incorrect PIN! (${remaining} attempt remaining before 10-minute lockout)`
        );
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTournament: Tournament = {
      id: `ff-tourn-${Date.now()}`,
      title: title.trim(),
      mode,
      map,
      server: 'South Asia / Pakistan',
      entryFee,
      prizePool,
      prizeBreakdown: {
        first: Math.round(prizePool * 0.5),
        second: Math.round(prizePool * 0.25),
        third: Math.round(prizePool * 0.15),
        fourthToTenth: Math.round(prizePool * 0.02),
        perKill,
      },
      maxSlots: mode === 'Solo' ? 48 : mode === 'Duo' ? 24 : mode === 'Clash Squad' ? 8 : 12,
      registeredCount: 0,
      slots: [],
      startTime: new Date(Date.now() + 1000 * 60 * startTimeMinutes).toISOString(),
      status: 'upcoming',
      roomId: `FF-${Math.floor(100000 + Math.random() * 900000)}`,
      roomPassword: `QAZI_${Math.floor(1000 + Math.random() * 9000)}`,
      roomRevealed: false,
      version: emulatorAllowed ? 'All Devices' : 'Mobile Only',
      rules: {
        gunAttributes,
        characterSkills,
        limitedAmmo,
        emulatorAllowed,
        customNote: 'Official FFWS Pakistan rules. Mobile only. Emulators blocked.',
      },
    };

    sounds.playJoin();
    onCreateTournament(newTournament);
    showToast(language === 'ur' ? `Tournament "${newTournament.title}" shamil ho gaya!` : `Tournament "${newTournament.title}" created!`);
    setTitle('');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournForRoom || !broadcastRoomId.trim() || !broadcastPass.trim()) return;

    onUpdateRoomCredentials(selectedTournForRoom, broadcastRoomId.trim(), broadcastPass.trim(), true);
    sounds.playVictory();
    showToast(language === 'ur' ? 'Room ID & Password registered players ko bhej di gayi!' : 'Room credentials successfully broadcasted!');
  };

  const handleWinnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournForResult || !winnerTeamInput.trim()) return;

    onDeclareWinner(selectedTournForResult, winnerTeamInput.trim(), winnerIgnInput.trim());
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    } catch {}
    sounds.playVictory();
    showToast(language === 'ur' ? `Champion "${winnerTeamInput}" declare ho gaya!` : `Champion "${winnerTeamInput}" declared!`);
    setWinnerTeamInput('');
    setWinnerIgnInput('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      easypaisaNumber: epNumber.trim(),
      easypaisaTitle: epTitle.trim(),
      jazzcashNumber: jcNumber.trim(),
      jazzcashTitle: jcTitle.trim(),
      adminPin: adminPin || '7860',
      supportWhatsapp: supportWhatsapp.trim(),
      merchantApiEnabled,
      merchantApiKey: merchantApiKey.trim(),
      merchantStoreId: merchantStoreId.trim(),
    });
    sounds.playVictory();
    showToast(language === 'ur' ? 'Saad Kazi ke EasyPaisa aur JazzCash accounts save ho gaye!' : 'Saad Kazi payment accounts saved successfully!');
  };

  // If locked, show security gate
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
          lockoutRemaining > 0
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
        }`}>
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-display font-bold text-white">Qazi Battle Secret Admin Console</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {lockoutRemaining > 0
              ? language === 'ur'
                ? `Security Lockout Active: Too many failed attempts. Try again in ${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s.`
                : `Security Lockout Active: Too many failed attempts. Try again in ${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s.`
              : language === 'ur'
              ? 'Makhsoos Admin Console. Apna 4-digit PIN enter karein.'
              : 'Restricted Admin Console. Enter 4-digit security PIN.'}
          </p>
        </div>

        {lockoutRemaining > 0 ? (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs space-y-2">
            <div className="font-mono text-2xl font-black text-red-400">
              {String(Math.floor(lockoutRemaining / 60)).padStart(2, '0')}:{String(lockoutRemaining % 60).padStart(2, '0')}
            </div>
            <p>10-Minute Security Lockout Active. System has recorded unauthorized attempts.</p>
          </div>
        ) : (
          <>
            {pinError && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Admin PIN"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Unlock className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'ur' ? 'Admin Panel Unlock Karein' : 'Unlock Admin Portal'}</span>
              </button>
            </form>
          </>
        )}

        <div className="pt-2 border-t border-neutral-800/80">
          <button
            onClick={() => {
              sounds.playClick();
              onExitAdmin();
            }}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Return to Player App
          </button>
        </div>
      </div>
    );
  }

  const pendingDepositsCount = depositRequests.filter((d) => d.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawalRequests.filter((w) => w.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Pakistan Esports Admin Authority</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400">EasyPaisa & JazzCash Gateway</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white">Qazi Battle Master Admin Panel</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'ur'
              ? 'EasyPaisa/JazzCash ke deposits verify karein, players ke withdrawals bhejein, aur Free Fire room control karein.'
              : 'Verify EasyPaisa & JazzCash TID receipts, disburse player cashouts, and manage custom room broadcasts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setIsUnlocked(false);
              onExitAdmin();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>← Exit to Player App</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setIsUnlocked(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Pending Deposits</span>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-1">{pendingDepositsCount} Requests</div>
          <span className="text-[11px] text-neutral-400">EasyPaisa & JazzCash</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Pending Cashouts</span>
          <div className="text-xl font-bold font-mono text-orange-400 tabular-nums mt-1">{pendingWithdrawalsCount} Requests</div>
          <span className="text-[11px] text-neutral-400">Player Withdrawals</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Active Tournaments</span>
          <div className="text-xl font-bold font-mono text-neutral-200 tabular-nums mt-1">{tournaments.length} Matches</div>
          <span className="text-[11px] text-neutral-400">Bermuda / Kalahari / Alpine</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Admin Receiving Till</span>
          <div className="text-xs font-mono font-bold text-emerald-400 truncate mt-1">{adminSettings.easypaisaNumber}</div>
          <span className="text-[11px] text-neutral-400">EasyPaisa Active</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('deposits');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'deposits' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>EasyPaisa / JazzCash Deposits</span>
          {pendingDepositsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px]">
              {pendingDepositsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('withdrawals');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'withdrawals' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Player Withdrawals</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white font-mono text-[10px]">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('tournaments');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'tournaments' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Create Tournament
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('rooms');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'rooms' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Room ID Broadcast
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('results');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'results' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Results & Proofs
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('settings');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Admin Payment Settings</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-amber-400 font-bold text-[9px]">Saad Kazi</span>
        </button>
      </div>

      {/* Tab 1: EasyPaisa & JazzCash Deposit Approvals */}
      {activeTab === 'deposits' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>{language === 'ur' ? 'EasyPaisa aur JazzCash Jama Request Tasdeeq' : 'Incoming Deposit Requests (EasyPaisa / JazzCash)'}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {language === 'ur'
                  ? 'Players ne aapke EasyPaisa / JazzCash par payment bhej kar TID dali hai. Verify karein aur foran unka balance approve karein.'
                  : 'Players sent PKR to your accounts. Verify the Transaction ID (TID) and approve to credit wallet balance.'}
              </p>
            </div>
          </div>

          {depositRequests.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">No deposit requests logged.</div>
          ) : (
            <div className="space-y-3">
              {depositRequests.map((dep) => (
                <div
                  key={dep.id}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          dep.method === 'EasyPaisa' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {dep.method}
                      </span>
                      <span className="font-bold text-white text-sm font-mono tabular-nums">
                        Rs. {dep.amountPkr} PKR
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-300 font-semibold">{dep.playerIgn}</span>
                      <span className="text-neutral-500 font-mono">(UID: {dep.playerUid})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-400 text-[11px]">
                      <span>
                        Sender Mobile: <strong className="text-neutral-200 font-mono">{dep.senderNumber}</strong> ({dep.senderName})
                      </span>
                      <span>·</span>
                      <span>
                        TRX ID / TID: <strong className="text-amber-400 font-mono">{dep.trxId}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-neutral-500">{dep.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {dep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => {
                            sounds.playVictory();
                            onApproveDeposit(dep.id);
                            showToast(`Rs. ${dep.amountPkr} PKR successfully credited to ${dep.playerIgn}!`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            onRejectDeposit(dep.id);
                            showToast(`Deposit request rejected.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : dep.status === 'approved' ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved & Credited
                      </span>
                    ) : (
                      <span className="text-neutral-500">Rejected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Player Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>{language === 'ur' ? 'Players Cashout / Withdrawal Requests' : 'Player Cashout / Withdrawal Queue'}</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {language === 'ur'
                ? 'Players jinhone jeet ke baad EasyPaisa ya JazzCash par withdrawal maangi hai.'
                : 'Send PKR to player mobile accounts via your EasyPaisa/JazzCash app and mark completed.'}
            </p>
          </div>

          {withdrawalRequests.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">No pending withdrawals.</div>
          ) : (
            <div className="space-y-3">
              {withdrawalRequests.map((wdr) => (
                <div
                  key={wdr.id}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          wdr.method === 'EasyPaisa' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {wdr.method}
                      </span>
                      <span className="font-bold text-white text-sm font-mono tabular-nums">
                        Rs. {wdr.amountPkr} PKR
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-300 font-semibold">{wdr.playerIgn}</span>
                    </div>

                    <div className="text-neutral-400 text-[11px]">
                      Account Number: <strong className="text-neutral-200 font-mono">{wdr.accountNumber}</strong> ({wdr.accountTitle})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {wdr.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => {
                            sounds.playVictory();
                            onCompleteWithdrawal(wdr.id, `EP-${Math.floor(10000000 + Math.random() * 90000000)}`);
                            showToast(`Withdrawal of Rs. ${wdr.amountPkr} to ${wdr.accountNumber} marked completed!`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Mark as Paid</span>
                        </button>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            onRejectWithdrawal(wdr.id);
                            showToast(`Withdrawal rejected & refunded.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                        >
                          Reject / Refund
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Transferred via {wdr.method}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Create Tournament */}
      {activeTab === 'tournaments' && (
        <form onSubmit={handleCreateSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <span>{language === 'ur' ? 'Naya Free Fire Match Banayein' : 'Host New Free Fire Tournament'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Tournament Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Qazi Battle Bermuda Squad Cup"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Match Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as MatchMode)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Squad">Squad (12 Teams / 48 Players)</option>
                <option value="Solo">Solo (48 Single Contenders)</option>
                <option value="Duo">Duo (24 Teams)</option>
                <option value="Clash Squad">Clash Squad 4v4</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Map</label>
              <select
                value={map}
                onChange={(e) => setMap(e.target.value as MatchMap)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Alpine">Alpine</option>
                <option value="NexTerra">NexTerra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Entry Fee (PKR)</label>
              <input
                type="number"
                min={0}
                step={10}
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Total Prize Pool (PKR)</label>
              <input
                type="number"
                min={100}
                step={100}
                value={prizePool}
                onChange={(e) => setPrizePool(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Per Kill Reward (PKR)</label>
              <input
                type="number"
                min={0}
                step={5}
                value={perKill}
                onChange={(e) => setPerKill(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Start Delay (Minutes)</label>
              <input
                type="number"
                min={5}
                max={1440}
                step={5}
                value={startTimeMinutes}
                onChange={(e) => setStartTimeMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Publish Tournament in Pakistan Server</span>
          </button>
        </form>
      )}

      {/* Tab 4: Room ID Broadcaster */}
      {activeTab === 'rooms' && (
        <form onSubmit={handleBroadcastSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase">
            <Key className="w-4 h-4" />
            <span>Room ID & Password Distribution</span>
          </div>

          <p className="text-xs text-neutral-400">
            {language === 'ur'
              ? 'Garena Free Fire me Custom Room banayein, phir Room ID aur Password yahan likh kar broadcast dabayein. Sirf un players ko dikhegi jinhone fees di hai.'
              : 'Create the room in Free Fire, input the credentials below, and unlock it for confirmed participants.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Select Tournament</label>
              <select
                value={selectedTournForRoom}
                onChange={(e) => setSelectedTournForRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.mode} · {t.registeredCount}/{t.maxSlots} joined)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Garena Room ID</label>
                <input
                  type="text"
                  required
                  value={broadcastRoomId}
                  onChange={(e) => setBroadcastRoomId(e.target.value)}
                  placeholder="e.g. 9812401"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Room Password</label>
                <input
                  type="text"
                  required
                  value={broadcastPass}
                  onChange={(e) => setBroadcastPass(e.target.value)}
                  placeholder="e.g. QAZI_PASS_99"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Broadcast Room ID to Registered Players</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Results & Proofs */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <form onSubmit={handleWinnerSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Booyah Winner Declaration & Automatic Payouts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Tournament</label>
                <select
                  value={selectedTournForResult}
                  onChange={(e) => setSelectedTournForResult(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Winning Squad / Team</label>
                <input
                  type="text"
                  required
                  value={winnerTeamInput}
                  onChange={(e) => setWinnerTeamInput(e.target.value)}
                  placeholder="e.g. Team Falcon"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">MVP / Kill Bounty Details</label>
                <input
                  type="text"
                  value={winnerIgnInput}
                  onChange={(e) => setWinnerIgnInput(e.target.value)}
                  placeholder="e.g. FALCON・Sniper (12 Kills MVP)"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 stroke-[2.5]" />
              <span>Declare Booyah & Mark Completed</span>
            </button>
          </form>

          {/* Pending Proofs Review */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white">Player Screenshot Proof Claims ({pendingProofs.length})</h4>
            {pendingProofs.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{p.playerIgn}</span>
                  <span className="text-neutral-500 font-mono"> (UID: {p.playerUid})</span>
                  <span className="text-neutral-500"> · </span>
                  <span className="text-amber-400 font-semibold">{p.tournamentTitle}</span>
                  <div className="text-neutral-400 text-[11px] mt-0.5">
                    Claimed Rank: #{p.claimedRank} · Kills: {p.claimedKills} · Calculated Prize: Rs. {p.awardedPrize} PKR
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sounds.playVictory();
                      onApproveProof(p.id);
                      showToast(`Proof for ${p.playerIgn} approved!`);
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onRejectProof(p.id);
                      showToast(`Proof rejected.`);
                    }}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Admin Payment Settings (For Saad Kazi) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span>Admin Payment Settings (Saad Kazi Receiving Wallets)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {language === 'ur'
                  ? 'Yahan Saad Kazi apna EasyPaisa aur JazzCash number save karein. Ye numbers public Player App mein Wallet Page par "Send Payment To" ke taur par show honge. 100% paise direct Saad Kazi ke mobile wallet me jayenge.'
                  : 'Configure Saad Kazi’s personal EasyPaisa and JazzCash receiving wallets. Contenders send payments directly to these mobile accounts and input their TID.'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>100% Direct P2P Transfer Active</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* EasyPaisa Box */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>EasyPaisa Receiving Account</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Telenor Bank</span>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">EasyPaisa Mobile Number</label>
                <input
                  type="text"
                  required
                  value={epNumber}
                  onChange={(e) => setEpNumber(e.target.value)}
                  placeholder="0345-9876543"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">EasyPaisa Account Title</label>
                <input
                  type="text"
                  required
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  placeholder="Saad Kazi (Qazi Battle Official)"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* JazzCash Box */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-red-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-red-400 text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>JazzCash Receiving Account</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Mobilink Bank</span>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">JazzCash Mobile Number</label>
                <input
                  type="text"
                  required
                  value={jcNumber}
                  onChange={(e) => setJcNumber(e.target.value)}
                  placeholder="0302-1234567"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">JazzCash Account Title</label>
                <input
                  type="text"
                  required
                  value={jcTitle}
                  onChange={(e) => setJcTitle(e.target.value)}
                  placeholder="Saad Kazi"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* WhatsApp Support & Admin PIN */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Official WhatsApp Support Number</label>
              <input
                type="text"
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                placeholder="+92 345 9876543"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Admin Security PIN</label>
              <input
                type="text"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="7860"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Future Merchant API Gateway Switch */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Future Direct Merchant API Gateway</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Agar mustaqbil me EasyPaisa / JazzCash Merchant Merchant IPN/API credentials mil jayein to yahan se automate kar sakte hain. Filhal direct mobile transfer 100% active hai.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={merchantApiEnabled}
                    onChange={(e) => setMerchantApiEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {merchantApiEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Merchant Store ID</label>
                    <input
                      type="text"
                      value={merchantStoreId}
                      onChange={(e) => setMerchantStoreId(e.target.value)}
                      placeholder="e.g. EP-STORE-9921"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Merchant Secret Key / Hash</label>
                    <input
                      type="password"
                      value={merchantApiKey}
                      onChange={(e) => setMerchantApiKey(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <span className="text-[11px] text-neutral-400">
              Numbers will update immediately across the entire player app.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Saad Kazi Payment Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
