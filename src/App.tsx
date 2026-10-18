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
import { AuthModal } from './components/AuthModal';
import { RegistrationFeedbackModal, RegistrationModalType } from './components/RegistrationFeedbackModal';
import { useAuth } from './context/AuthContext';
import confetti from 'canvas-confetti';

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
  INITIAL_PENDING_PROOFS,
  INITIAL_DEPOSIT_REQUESTS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_ADMIN_SETTINGS,
} from './data/mockTournaments';
import {
  subscribeTournaments,
  subscribeDepositRequests,
  subscribeWithdrawalRequests,
  subscribeAdminSettings,
  registerPlayerForTournament,
  submitDepositRequest,
  approveDepositInDb,
  rejectDepositInDb,
  submitWithdrawalInDb,
  completeWithdrawalInDb,
  rejectWithdrawalInDb,
  updateRoomCredentialsInDb,
  createTournamentInDb,
  declareWinnerInDb,
  saveAdminSettingsInDb,
} from './lib/tournamentService';
import { sounds } from './utils/audio';
import { Trophy, Flame, Plus, ArrowRight, Lock, ShieldCheck, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'guide' | 'points' | 'wallet' | 'profile'>('tournaments');
  const [language, setLanguage] = useState<'ur' | 'en'>('ur');

  // Firebase Authentication Context (Individual player account system)
  const { user, userProfile, userTransactions, logout, updateProfileData } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Secret Admin Portal state (accessible via secret URL /qazi-admin-786 or via Footer with password 7860)
  const [isSecretAdminRoute, setIsSecretAdminRoute] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  // Active Player identity (Strictly unique per authenticated player)
  const playerIgn = userProfile?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest Contender');
  const playerUid = userProfile?.ffUid || (user ? 'UID-' + user.uid.slice(0, 8) : 'Not Logged In');
  const playerEmail = user?.email || userProfile?.email;
  const isLoggedIn = !!user;

  // Real-time Firestore synchronized states
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(INITIAL_DEPOSIT_REQUESTS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [adminSettings, setAdminSettings] = useState<AdminPaymentSettings>(INITIAL_ADMIN_SETTINGS);
  const [pendingProofs, setPendingProofs] = useState<MatchProofSubmission[]>(INITIAL_PENDING_PROOFS);

  // Individual player's wallet balance (0 by default, updated in real-time when Admin approves deposit)
  const walletBalance: number = userProfile?.walletBalance ?? 0;

  // Real-time Firestore subscriptions for tournaments, deposits, cashouts, and Saad Kazi's settings
  useEffect(() => {
    const unsubTourn = subscribeTournaments((ts) => {
      setTournaments(ts);
    });
    const unsubDep = subscribeDepositRequests((deps) => {
      setDepositRequests(deps);
    });
    const unsubWdr = subscribeWithdrawalRequests((wdrs) => {
      setWithdrawalRequests(wdrs);
    });
    const unsubSettings = subscribeAdminSettings((st) => {
      setAdminSettings(st);
    });

    return () => {
      unsubTourn();
      unsubDep();
      unsubWdr();
      unsubSettings();
    };
  }, []);

  // Compute registered tournament IDs specifically for THIS authenticated player
  const userRegisteredIds: string[] = React.useMemo(() => {
    if (!user) return [];
    if (userProfile?.registeredTournaments && userProfile.registeredTournaments.length > 0) {
      return userProfile.registeredTournaments;
    }
    return tournaments
      .filter((t) => t.players?.includes(user.uid) || t.slots?.some((s) => s.userId === user.uid))
      .map((t) => t.id);
  }, [user, userProfile, tournaments]);

  const handleUpdateIgnUid = async (newIgn: string, newUid: string) => {
    if (user) {
      await updateProfileData({
        displayName: newIgn,
        ffUid: newUid,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      sounds.playClick();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'room_open' | 'completed'>('all');

  // Modals
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [joiningTournament, setJoiningTournament] = useState<Tournament | null>(null);
  const [proofTournament, setProofTournament] = useState<Tournament | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);

  // Registration Feedback Modal State (Insufficient Balance / Success / Already Registered)
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: RegistrationModalType;
    tournament: Tournament | null;
    assignedSlot: PlayerSlot | null;
  }>({
    isOpen: false,
    type: 'success',
    tournament: null,
    assignedSlot: null,
  });

  // Check for Secret Admin Route on load and route changes (/qazi-admin-786)
  useEffect(() => {
    const checkSecretRoute = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

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

  // ========================================================
  // TOURNAMENT REGISTRATION WITH WALLET SYSTEM (Critical Flow)
  // ========================================================
  const handleRegisterTournament = async (tournament: Tournament) => {
    // Step 1: Ensure individual login
    if (!user) {
      sounds.playClick();
      setAuthModalOpen(true);
      return;
    }

    // Step 2: Prevent double registration
    const isAlreadyRegistered =
      userRegisteredIds.includes(tournament.id) ||
      tournament.players?.includes(user.uid) ||
      tournament.slots?.some((s) => s.userId === user.uid || s.leaderUid === playerUid);

    if (isAlreadyRegistered) {
      sounds.playClick();
      const assignedSlot =
        tournament.slots?.find((s) => s.userId === user.uid || s.leaderUid === playerUid) || null;
      setFeedbackModal({
        isOpen: true,
        type: 'already_registered',
        tournament,
        assignedSlot,
      });
      return;
    }

    // Step 3: Check wallet balance >= entry fee
    if (walletBalance < tournament.entryFee) {
      sounds.playClick();
      setFeedbackModal({
        isOpen: true,
        type: 'insufficient_balance',
        tournament,
        assignedSlot: null,
      });
      return;
    }

    // Step 4: Balance is enough -> Deduct fee in Firestore, add player UID to tournament, show success
    try {
      const result = await registerPlayerForTournament(
        tournament,
        user.uid,
        playerIgn,
        playerUid,
        walletBalance
      );

      if (result.success) {
        sounds.playVictory();
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#EF4444', '#10B981'],
          });
        } catch {}

        setFeedbackModal({
          isOpen: true,
          type: 'success',
          tournament,
          assignedSlot: result.assignedSlot || null,
        });
      } else if (result.error === 'already_registered') {
        setFeedbackModal({
          isOpen: true,
          type: 'already_registered',
          tournament,
          assignedSlot: result.assignedSlot || null,
        });
      } else if (result.error === 'insufficient_balance') {
        setFeedbackModal({
          isOpen: true,
          type: 'insufficient_balance',
          tournament,
          assignedSlot: null,
        });
      }
    } catch (err) {
      console.error('Error during tournament registration:', err);
    }
  };

  // Legacy modal joining support
  const handleJoinSuccess = async (tournamentId: string, slot: PlayerSlot, fee: number) => {
    const target = tournaments.find((t) => t.id === tournamentId);
    if (target) {
      await handleRegisterTournament(target);
    }
    setJoiningTournament(null);
  };

  // ========================================================
  // PAKISTAN WALLET DEPOSIT & CASHOUT (EasyPaisa & JazzCash)
  // ========================================================
  const handleSubmitDepositRequest = async (
    req: Omit<DepositRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    try {
      await submitDepositRequest({
        ...req,
        userId: user?.uid,
        playerIgn,
        playerUid,
      });
      sounds.playVictory();
    } catch (err) {
      console.error('Failed to submit deposit request:', err);
    }
  };

  // Admin approves EasyPaisa / JazzCash Deposit:
  // Automatically increments the specific player's wallet balance in Firestore!
  const handleApproveDeposit = async (depositId: string) => {
    const dep = depositRequests.find((d) => d.id === depositId);
    if (!dep) return;
    try {
      sounds.playVictory();
      await approveDepositInDb(dep);
    } catch (err) {
      console.error('Error approving deposit in Firestore:', err);
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    try {
      sounds.playClick();
      await rejectDepositInDb(depositId);
    } catch (err) {
      console.error('Error rejecting deposit:', err);
    }
  };

  const handleSubmitWithdrawalRequest = async (
    req: Omit<WithdrawalRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    try {
      sounds.playCopy();
      await submitWithdrawalInDb(req, user?.uid);
    } catch (err) {
      console.error('Error submitting withdrawal:', err);
    }
  };

  const handleCompleteWithdrawal = async (withdrawalId: string, refId: string) => {
    try {
      sounds.playVictory();
      await completeWithdrawalInDb(withdrawalId, refId);
    } catch (err) {
      console.error('Error completing withdrawal:', err);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const wdr = withdrawalRequests.find((w) => w.id === withdrawalId);
    if (!wdr) return;
    try {
      sounds.playClick();
      await rejectWithdrawalInDb(wdr);
    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
    }
  };

  // ========================================================
  // ADMIN PORTAL ACTIONS (Saad Kazi Tournament & Settings)
  // ========================================================
  const handleCreateTournament = async (newT: Tournament) => {
    try {
      sounds.playVictory();
      await createTournamentInDb(newT);
    } catch (err) {
      console.error('Error creating tournament in DB:', err);
    }
  };

  const handleUpdateRoomCredentials = async (
    tournamentId: string,
    roomId: string,
    pass: string,
    revealNow: boolean
  ) => {
    try {
      sounds.playJoin();
      await updateRoomCredentialsInDb(tournamentId, roomId, pass, revealNow);
    } catch (err) {
      console.error('Error updating room credentials in DB:', err);
    }
  };

  const handleDeclareWinner = async (
    tournamentId: string,
    winnerTeam: string,
    winnerIgn: string
  ) => {
    try {
      sounds.playVictory();
      await declareWinnerInDb(tournamentId, winnerTeam, winnerIgn);
    } catch (err) {
      console.error('Error declaring winner in DB:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: AdminPaymentSettings) => {
    try {
      sounds.playVictory();
      await saveAdminSettingsInDb(newSettings);
    } catch (err) {
      console.error('Error saving admin payment settings:', err);
    }
  };

  const handleSubmitProof = (proof: MatchProofSubmission) => {
    setPendingProofs((prev) => [proof, ...prev]);
  };

  const handleApproveProof = (proofId: string) => {
    setPendingProofs((prev) => prev.filter((p) => p.id !== proofId));
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
            onUpdateSettings={handleUpdateSettings}
            onExitAdmin={handleExitAdmin}
            language={language}
            initiallyUnlocked={isAdminAuthorized}
          />
        </main>
      </div>
    );
  }

  // PUBLIC PLAYER APP: Mobile-First Responsive PWA
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans overflow-x-hidden pb-20 md:pb-8">
      {/* Navigation Bar (Shows individual user profile, wallet balance, and logout) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openWallet={() => setWalletOpen(true)}
        walletBalance={walletBalance}
        language={language}
        setLanguage={setLanguage}
        openAuthModal={() => setAuthModalOpen(true)}
        isLoggedIn={isLoggedIn}
        playerIgn={playerIgn}
        playerUid={playerUid}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* PWA In-App Install Prompt Banner */}
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

            {/* Individual Account Status Notification */}
            {!isLoggedIn && (
              <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-neutral-900 to-orange-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Battle with Your Own Free Fire ID</span>
                    <span className="text-neutral-400">
                      Create an account with your Email, IGN & numeric UID to enter tournaments and receive room passwords.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer"
                >
                  Create Account / Login
                </button>
              </div>
            )}

            {/* EasyPaisa / JazzCash Fast Deposit Banner (Pakistan) */}
            <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-red-950/30 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 font-bold text-emerald-400 font-mono text-xs sm:text-sm">
                  <span>🇵🇰 EasyPaisa</span>
                  <span className="text-neutral-500">/</span>
                  <span className="text-red-400">JazzCash</span>
                </div>
                <span className="text-neutral-300">
                  {language === 'ur'
                    ? 'Saad Kazi ke mobile wallet par direct transfer karein aur Transaction ID submit karein.'
                    : 'Instant Pakistan deposits and cashouts via EasyPaisa and JazzCash.'}
                </span>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setWalletOpen(true);
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-neutral-950 font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <span>{language === 'ur' ? 'Deposit Karein' : 'Deposit via EasyPaisa'}</span>
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === 'completed' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ur' ? 'Results' : 'Results'} (
                {tournaments.filter((t) => t.status === 'completed').length})
              </button>
            </div>

            {/* Tournaments Grid */}
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
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
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
                    onJoin={(t) => handleRegisterTournament(t)}
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

        {/* Tab 4: Wallet Mobile View (EasyPaisa & JazzCash) */}
        {activeTab === 'wallet' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
              <span className="text-xs text-neutral-400 uppercase font-semibold">Your Wallet Balance</span>
              <div className="text-4xl font-display font-black text-amber-400 font-mono">
                Rs. {walletBalance} <span className="text-sm font-sans text-neutral-300">PKR</span>
              </div>
              <p className="text-xs text-neutral-400">EasyPaisa · JazzCash · Direct Transfer & Instant Approval</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setWalletOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Deposit & Cashout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Player Profile (Individual player data & logout button) */}
        {activeTab === 'profile' && (
          <PlayerProfileView
            playerIgn={playerIgn}
            playerUid={playerUid}
            playerEmail={playerEmail}
            walletBalance={walletBalance}
            openWallet={() => setWalletOpen(true)}
            matchesJoinedCount={userRegisteredIds.length}
            language={language}
            setLanguage={setLanguage}
            openAdminLogin={() => setAdminLoginOpen(true)}
            openAuthModal={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            onUpdateIgnUid={handleUpdateIgnUid}
          />
        )}
      </main>

      {/* Footer with English links and Admin Panel access */}
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

            {/* Admin Panel Button in Footer (Privacy protected, password entered in modal) */}
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

      {/* Mobile Bottom Navigation Bar */}
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

      {/* Tournament Details Modal */}
      <TournamentDetailModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onJoin={(t) => {
          setSelectedTournament(null);
          handleRegisterTournament(t);
        }}
        onSubmitProof={(t) => {
          setSelectedTournament(null);
          setProofTournament(t);
        }}
        isRegistered={selectedTournament ? userRegisteredIds.includes(selectedTournament.id) : false}
        language={language}
      />

      {/* Join Tournament Squad Modal */}
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
        initialIgn={playerIgn}
        initialUid={playerUid}
      />

      {/* Screenshot Match Proof Modal */}
      <SubmitProofModal
        tournament={proofTournament}
        onClose={() => setProofTournament(null)}
        onSubmit={handleSubmitProof}
        language={language}
        initialIgn={playerIgn}
        initialUid={playerUid}
      />

      {/* Wallet Modal with EasyPaisa & JazzCash Deposit and Cashout */}
      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        balance={walletBalance}
        transactions={userTransactions}
        adminSettings={adminSettings}
        onSubmitDepositRequest={handleSubmitDepositRequest}
        onSubmitWithdrawalRequest={handleSubmitWithdrawalRequest}
        playerIgn={playerIgn}
        playerUid={playerUid}
        userId={user?.uid}
        language={language}
      />

      {/* Registration Feedback Modal (Insufficient Balance, Success, or Already Registered) */}
      <RegistrationFeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        type={feedbackModal.type}
        tournament={feedbackModal.tournament}
        walletBalance={walletBalance}
        openWalletDeposit={() => {
          setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
          setWalletOpen(true);
        }}
        assignedSlot={feedbackModal.assignedSlot}
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

      {/* Player Authentication Modal (Email & Password Login / Signup) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
