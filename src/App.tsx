import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { TournamentCard } from './components/TournamentCard';
import { TournamentDetailModal } from './components/TournamentDetailModal';
import { JoinTournamentModal } from './components/JoinTournamentModal';
import { SubmitProofModal } from './components/SubmitProofModal';
import { AdminPortal } from './components/AdminPortal';
import { StepByStepGuide } from './components/StepByStepGuideModal';
import { PointsCalculator } from './components/PointsCalculatorModal';
import { WalletModal } from './components/WalletModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PlayerProfileView } from './components/PlayerProfileView';
import { AdminLoginModal } from './components/AdminLoginModal';

import {
  Tournament,
  PlayerSlot,
  MatchProofSubmission,
  WalletTransaction,
  DepositRequest,
  WithdrawalRequest,
  AdminPaymentSettings,
} from './types/tournament';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_PENDING_PROOFS,
  INITIAL_DEPOSIT_REQUESTS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_ADMIN_SETTINGS,
} from './data/mockTournaments';
import { sounds } from './utils/audio';
import { Trophy, Flame, Plus, ArrowRight, Lock, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'guide' | 'points' | 'wallet' | 'profile'>('tournaments');
  const [language, setLanguage] = useState<'ur' | 'en'>('ur');

  // Secret Admin Portal state (accessible via secret URL or via Footer with password 7860)
  const [isSecretAdminRoute, setIsSecretAdminRoute] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  // Player identity for simulation
  const playerIgn = 'SOUL・Predator';
  const playerUid = '284918294';

  // Core App States (Shared between Player App and Admin Panel)
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [userRegisteredIds, setUserRegisteredIds] = useState<string[]>(['ff-tourn-01']);
  const [walletBalance, setWalletBalance] = useState<number>(850);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [pendingProofs, setPendingProofs] = useState<MatchProofSubmission[]>(INITIAL_PENDING_PROOFS);

  // Pakistan Payment States
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(INITIAL_DEPOSIT_REQUESTS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [adminSettings, setAdminSettings] = useState<AdminPaymentSettings>(INITIAL_ADMIN_SETTINGS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'room_open' | 'completed'>('all');

  // Modals
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [joiningTournament, setJoiningTournament] = useState<Tournament | null>(null);
  const [proofTournament, setProofTournament] = useState<Tournament | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);

  // Check for Secret Admin Route on load and route changes
  useEffect(() => {
    const checkSecretRoute = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Secret routes: /qazi-admin-786 or #qazi-admin-786 or ?admin=qazi-786
      const isSecret =
        path.includes('qazi-admin-786') ||
        hash.includes('qazi-admin-786') ||
        search.includes('qazi-admin-786');

      setIsSecretAdminRoute(isSecret);
    };

    checkSecretRoute();
    window.addEventListener('popstate', checkSecretRoute);
    window.addEventListener('hashchange', checkSecretRoute);

    return () => {
      window.removeEventListener('popstate', checkSecretRoute);
      window.removeEventListener('hashchange', checkSecretRoute);
    };
  }, []);

  const handleExitAdmin = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      if (window.location.pathname.includes('qazi-admin-786')) {
        window.history.pushState(null, '', '/');
      }
    }
    setIsSecretAdminRoute(false);
    setIsAdminAuthorized(false);
    setActiveTab('tournaments');
  };

  // Tournament Joining
  const handleJoinSuccess = (tournamentId: string, slot: PlayerSlot, fee: number) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            registeredCount: t.registeredCount + 1,
            slots: [...t.slots, slot],
          };
        }
        return t;
      })
    );

    setUserRegisteredIds((prev) => [...prev, tournamentId]);

    if (fee > 0) {
      setWalletBalance((prev) => prev - fee);
      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'entry_fee',
        amount: -fee,
        description: `Entry Fee: ${slot.teamName || slot.leaderIgn}`,
        timestamp: 'Just now',
        status: 'completed',
      };
      setTransactions((prev) => [newTx, ...prev]);
    }

    setJoiningTournament(null);

    const updated = tournaments.find((t) => t.id === tournamentId);
    if (updated) {
      setSelectedTournament({
        ...updated,
        registeredCount: updated.registeredCount + 1,
        slots: [...updated.slots, slot],
      });
    }
  };

  // Pakistan EasyPaisa / JazzCash Deposit Handler (From Player)
  const handleSubmitDepositRequest = (req: Omit<DepositRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: DepositRequest = {
      ...req,
      id: `dep-pk-${Date.now()}`,
      submittedAt: 'Just now',
      status: 'pending',
    };
    setDepositRequests((prev) => [newReq, ...prev]);
  };

  // Admin Approves EasyPaisa / JazzCash Deposit
  const handleApproveDeposit = (depositId: string) => {
    const dep = depositRequests.find((d) => d.id === depositId);
    if (!dep) return;

    setDepositRequests((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'approved' as const } : d))
    );

    setWalletBalance((prev) => prev + dep.amountPkr);
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      amount: dep.amountPkr,
      description: `${dep.method} Deposit Verified (TID: ${dep.trxId})`,
      timestamp: 'Just now',
      status: 'completed',
      paymentMethod: dep.method,
      trxId: dep.trxId,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Admin Rejects Deposit
  const handleRejectDeposit = (depositId: string) => {
    setDepositRequests((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'rejected' as const } : d))
    );
  };

  // Player Submits Cashout / Withdrawal
  const handleSubmitWithdrawalRequest = (req: Omit<WithdrawalRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newWdr: WithdrawalRequest = {
      ...req,
      id: `wdr-pk-${Date.now()}`,
      submittedAt: 'Just now',
      status: 'pending',
    };
    setWithdrawalRequests((prev) => [newWdr, ...prev]);

    setWalletBalance((prev) => prev - req.amountPkr);
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      amount: -req.amountPkr,
      description: `Withdrawal to ${req.method} (${req.accountNumber})`,
      timestamp: 'Just now',
      status: 'processing',
      paymentMethod: req.method,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Admin Completes Withdrawal
  const handleCompleteWithdrawal = (withdrawalId: string, refId: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'completed' as const, referenceId: refId } : w))
    );
  };

  // Admin Rejects Withdrawal
  const handleRejectWithdrawal = (withdrawalId: string) => {
    const wdr = withdrawalRequests.find((w) => w.id === withdrawalId);
    if (!wdr) return;

    setWithdrawalRequests((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'rejected' as const } : w))
    );

    setWalletBalance((prev) => prev + wdr.amountPkr);
  };

  // Tournament Management Handlers (Admin)
  const handleCreateTournament = (newT: Tournament) => {
    setTournaments((prev) => [newT, ...prev]);
  };

  const handleUpdateRoomCredentials = (tournamentId: string, roomId: string, pass: string, revealNow: boolean) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            roomId,
            roomPassword: pass,
            roomRevealed: revealNow,
            status: revealNow ? 'room_open' : t.status,
          };
        }
        return t;
      })
    );
  };

  const handleDeclareWinner = (tournamentId: string, winnerTeam: string, winnerIgn: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            winnerTeam,
            winnerBooyahIgn: winnerIgn,
            status: 'completed',
          };
        }
        return t;
      })
    );
  };

  const handleSubmitProof = (proof: MatchProofSubmission) => {
    setPendingProofs((prev) => [proof, ...prev]);
  };

  const handleApproveProof = (proofId: string) => {
    const proof = pendingProofs.find((p) => p.id === proofId);
    if (!proof) return;

    setPendingProofs((prev) => prev.filter((p) => p.id !== proofId));

    if (proof.awardedPrize && proof.awardedPrize > 0) {
      setWalletBalance((prev) => prev + proof.awardedPrize!);
      const prizeTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'prize_won',
        amount: proof.awardedPrize,
        description: `Prize Claim Approved: ${proof.tournamentTitle}`,
        timestamp: 'Just now',
        status: 'completed',
      };
      setTransactions((prev) => [prizeTx, ...prev]);
    }
  };

  const handleRejectProof = (proofId: string) => {
    setPendingProofs((prev) => prev.filter((p) => p.id !== proofId));
  };

  // Filtered Tournaments for Player
  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.map.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode = selectedMode === 'All' || t.mode === selectedMode;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'upcoming'
        ? t.status === 'upcoming'
        : statusFilter === 'room_open'
        ? t.status === 'room_open'
        : t.status === 'completed';

    return matchesSearch && matchesMode && matchesStatus;
  });

  const totalPrizeDistributed = tournaments.reduce((acc, t) => acc + t.prizePool, 0);

  // If secret admin URL is accessed OR authorized via password (7860), show Admin Portal
  if (isSecretAdminRoute || isAdminAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-x-hidden">
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6">
          <AdminPortal
            tournaments={tournaments}
            onCreateTournament={handleCreateTournament}
            onUpdateRoomCredentials={handleUpdateRoomCredentials}
            onDeclareWinner={handleDeclareWinner}
            depositRequests={depositRequests}
            onApproveDeposit={handleApproveDeposit}
            onRejectDeposit={handleRejectDeposit}
            withdrawalRequests={withdrawalRequests}
            onCompleteWithdrawal={handleCompleteWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            pendingProofs={pendingProofs}
            onApproveProof={handleApproveProof}
            onRejectProof={handleRejectProof}
            adminSettings={adminSettings}
            onUpdateSettings={setAdminSettings}
            onExitAdmin={handleExitAdmin}
            language={language}
            initiallyUnlocked={isAdminAuthorized}
          />
        </main>
      </div>
    );
  }

  // PUBLIC PLAYER APP: 100% Mobile-First Responsive PWA with NO Admin links whatsoever!
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-x-hidden pb-20 md:pb-8">
      {/* Navigation Bar (Pure Player Experience) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openWallet={() => setWalletOpen(true)}
        walletBalance={walletBalance}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* PWA In-App Install Prompt Banner (Visible on Home view) */}
        {activeTab === 'tournaments' && (
          <PWAInstallButton variant="banner" language={language} />
        )}

        {/* Tab 1: Tournaments Browser */}
        {activeTab === 'tournaments' && (
          <div>
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
              totalTournaments={tournaments.length}
              totalPrizeDistributed={totalPrizeDistributed}
              openGuide={() => setActiveTab('guide')}
              language={language}
            />

            {/* EasyPaisa / JazzCash Fast Action Notice for Pakistan */}
            <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-red-950/30 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 font-bold text-emerald-400 font-mono text-xs sm:text-sm">
                  <span>🇵🇰 EasyPaisa</span>
                  <span className="text-neutral-500">/</span>
                  <span className="text-red-400">JazzCash</span>
                </div>
                <span className="text-neutral-300">
                  {language === 'ur'
                    ? 'Direct EasyPaisa aur JazzCash se deposit karein aur winning amount foran cashout karein.'
                    : 'Instant Pakistan deposits and cashouts via EasyPaisa and JazzCash supported.'}
                </span>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setWalletOpen(true);
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <span>{language === 'ur' ? 'Deposit Karein' : 'Deposit PKR'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto mb-5 scrollbar-none">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('all');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === 'all' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'Tamam Matches' : 'All Matches'} ({tournaments.length})
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('room_open');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === 'room_open' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'Room Open' : 'Room Open'} (
                {tournaments.filter((t) => t.status === 'room_open').length})
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('upcoming');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === 'upcoming' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'Upcoming' : 'Upcoming'} (
                {tournaments.filter((t) => t.status === 'upcoming').length})
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter('completed');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === 'completed' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'Results' : 'Results'} (
                {tournaments.filter((t) => t.status === 'completed').length})
              </button>
            </div>

            {/* Tournaments Grid (Zero Horizontal Scroll, Mobile 1-Col, Tablet 2-Col, Desktop 3-Col) */}
            {filteredTournaments.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center space-y-3">
                <Flame className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Koi tournament nahi mila</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Filters reset karein ya thori dair baad check karein.
                </p>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setSearchQuery('');
                    setSelectedMode('All');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onSelect={(t) => setSelectedTournament(t)}
                    onJoin={(t) => setJoiningTournament(t)}
                    isRegistered={userRegisteredIds.includes(tournament.id)}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Step by Step Guide */}
        {activeTab === 'guide' && <StepByStepGuide language={language} />}

        {/* Tab 3: Points Calculator */}
        {activeTab === 'points' && <PointsCalculator language={language} />}

        {/* Tab 4: Wallet Mobile View (triggered from bottom nav) */}
        {activeTab === 'wallet' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
              <span className="text-xs text-neutral-400 uppercase font-semibold">Wallet Balance</span>
              <div className="text-4xl font-display font-black text-amber-400 font-mono">
                Rs. {walletBalance} <span className="text-sm font-sans text-neutral-300">PKR</span>
              </div>
              <p className="text-xs text-neutral-400">EasyPaisa · JazzCash · Instant Deposit & Cashout</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setWalletOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md"
                >
                  Open Deposit & Cashout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Player Profile */}
        {activeTab === 'profile' && (
          <PlayerProfileView
            playerIgn={playerIgn}
            playerUid={playerUid}
            walletBalance={walletBalance}
            openWallet={() => setWalletOpen(true)}
            matchesJoinedCount={userRegisteredIds.length}
            language={language}
            setLanguage={setLanguage}
            openAdminLogin={() => setAdminLoginOpen(true)}
          />
        )}
      </main>

      {/* Footer with Responsive Layout & Admin Access Option */}
      <footer className="border-t border-neutral-900 bg-neutral-950/90 py-6 mt-8 text-xs text-neutral-500 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-bold text-neutral-300">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>QAZI BATTLE ESPORTS (PAKISTAN)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('guide');
              }}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Step-by-Step Guide
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('points');
              }}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              FFWS Scoring
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setWalletOpen(true);
              }}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              EasyPaisa / JazzCash Cashout
            </button>

            {/* Admin Access Option in Footer */}
            <button
              onClick={() => {
                sounds.playClick();
                setAdminLoginOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-neutral-400 hover:text-amber-400 font-semibold transition-all cursor-pointer shadow-sm group"
              title="Admin Panel"
            >
              <Lock className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
              <span>Admin Panel</span>
            </button>
          </div>

          <div className="text-neutral-500 text-[11px] text-center md:text-right">
            Pakistan Esports Platform · Fair Play & Anti-Cheat Guaranteed
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (100% Mobile First Experience) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'wallet') {
            setWalletOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        walletBalance={walletBalance}
        language={language}
      />

      {/* Modals */}
      <TournamentDetailModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onJoin={(t) => {
          setSelectedTournament(null);
          setJoiningTournament(t);
        }}
        onSubmitProof={(t) => {
          setSelectedTournament(null);
          setProofTournament(t);
        }}
        isRegistered={selectedTournament ? userRegisteredIds.includes(selectedTournament.id) : false}
        language={language}
      />

      <JoinTournamentModal
        tournament={joiningTournament}
        onClose={() => setJoiningTournament(null)}
        onSuccess={handleJoinSuccess}
        walletBalance={walletBalance}
        openWallet={() => {
          setJoiningTournament(null);
          setWalletOpen(true);
        }}
        language={language}
      />

      <SubmitProofModal
        tournament={proofTournament}
        onClose={() => setProofTournament(null)}
        onSubmit={handleSubmitProof}
        language={language}
      />

      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        balance={walletBalance}
        transactions={transactions}
        adminSettings={adminSettings}
        onSubmitDepositRequest={handleSubmitDepositRequest}
        onSubmitWithdrawalRequest={handleSubmitWithdrawalRequest}
        playerIgn={playerIgn}
        playerUid={playerUid}
        language={language}
      />

      {/* Admin Login Modal (Unlocked via Password 7860) */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminAuthorized(true);
          setIsSecretAdminRoute(true);
        }}
        validPin={adminSettings.adminPin || '7860'}
        language={language}
      />
    </div>
  );
}
