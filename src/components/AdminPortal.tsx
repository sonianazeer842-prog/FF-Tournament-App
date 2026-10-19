import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  Edit,
  CopyPlus,
  Search,
  Filter,
  CheckSquare,
  Square,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  UserX,
  UserCheck,
  Flame,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
  Award,
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
  UserProfile,
} from '../types/tournament';
import { sounds } from '../utils/audio';
import mapBermuda from '../assets/images/ff_map_bermuda_1792304114277.jpg';
import trophyImg from '../assets/images/ff_esports_trophy_1792304112984.jpg';
import heroImg from '../assets/images/ff_tournament_hero_1792304112893.jpg';
import {
  updateTournamentInDb,
  deleteTournamentInDb,
  duplicateTournamentInDb,
  createTournamentInDb,
  approveDepositInDb,
  rejectDepositInDb,
  deleteDepositInDb,
  updateDepositAmountInDb,
  approveWithdrawalInDb,
  completeWithdrawalInDb,
  rejectWithdrawalInDb,
  deleteWithdrawalInDb,
  updateRoomCredentialsInDb,
  declareWinnerInDb,
  saveAdminSettingsInDb,
  deleteMatchProofInDb,
  updateMatchProofInDb,
  submitMatchProofInDb,
  distributePrizeToWinnerInDb,
  batchDeleteTournaments,
  batchDeleteDeposits,
  batchDeleteWithdrawals,
  batchDeleteProofs,
  subscribeAllUsers,
  toggleBlockUserInDb,
} from '../lib/tournamentService';

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
  const [activeTab, setActiveTab] = useState<
    'tournaments' | 'deposits' | 'withdrawals' | 'rooms' | 'results' | 'settings' | 'users'
  >('tournaments');
  const [successToast, setSuccessToast] = useState('');

  // All registered users in Firestore
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Search queries per tab
  const [tournSearch, setTournSearch] = useState('');
  const [depSearch, setDepSearch] = useState('');
  const [wdrSearch, setWdrSearch] = useState('');
  const [proofSearch, setProofSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Batch selection states
  const [selectedTournIds, setSelectedTournIds] = useState<string[]>([]);
  const [selectedDepIds, setSelectedDepIds] = useState<string[]>([]);
  const [selectedWdrIds, setSelectedWdrIds] = useState<string[]>([]);
  const [selectedProofIds, setSelectedProofIds] = useState<string[]>([]);

  // Deletion Confirmation Modal State ("Kya delete karna hai?")
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  // Edit Tournament Modal State
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // Edit Deposit Amount Modal State
  const [editingDeposit, setEditingDeposit] = useState<DepositRequest | null>(null);
  const [editDepAmountInput, setEditDepAmountInput] = useState<number>(0);

  // Edit Match Result / Proof Modal State
  const [editingProof, setEditingProof] = useState<MatchProofSubmission | null>(null);

  // Upload Result / Manual Booyah Modal State
  const [uploadResultOpen, setUploadResultOpen] = useState(false);
  const [resTournId, setResTournId] = useState(tournaments[0]?.id || '');
  const [resWinnerTeam, setResWinnerTeam] = useState('');
  const [resWinnerIgn, setResWinnerIgn] = useState('');
  const [resWinnerUid, setResWinnerUid] = useState('');
  const [resPrizeAmount, setResPrizeAmount] = useState<number>(2500);

  // Create Tournament form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<MatchMode>('Squad');
  const [map, setMap] = useState<MatchMap>('Bermuda');
  const [entryFee, setEntryFee] = useState(50);
  const [prizePool, setPrizePool] = useState(2500);
  const [perKill, setPerKill] = useState(25);
  const [startTimeMinutes, setStartTimeMinutes] = useState(45);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [gunAttributes, setGunAttributes] = useState(false);
  const [limitedAmmo, setLimitedAmmo] = useState(true);
  const [characterSkills, setCharacterSkills] = useState(true);
  const [emulatorAllowed, setEmulatorAllowed] = useState(false);
  const [customNote, setCustomNote] = useState('Official FFWS Pakistan rules. Mobile only. Emulators blocked.');

  // Room broadcast form
  const [selectedTournForRoom, setSelectedTournForRoom] = useState(tournaments[0]?.id || '');
  const [broadcastRoomId, setBroadcastRoomId] = useState('');
  const [broadcastPass, setBroadcastPass] = useState('');

  // Settings edit form
  const [epNumber, setEpNumber] = useState(adminSettings.easypaisaNumber || '03182655142');
  const [epTitle, setEpTitle] = useState(adminSettings.easypaisaTitle || 'Saad Kazi (Qazi Battle Official)');
  const [jcNumber, setJcNumber] = useState(adminSettings.jazzcashNumber || '03182655142');
  const [jcTitle, setJcTitle] = useState(adminSettings.jazzcashTitle || 'Saad Kazi');
  const [adminPin, setAdminPin] = useState(adminSettings.adminPin || '7860');
  const [supportWhatsapp, setSupportWhatsapp] = useState(adminSettings.supportWhatsapp || '+92 318 2655142');
  const [merchantApiEnabled, setMerchantApiEnabled] = useState(adminSettings.merchantApiEnabled || false);
  const [merchantApiKey, setMerchantApiKey] = useState(adminSettings.merchantApiKey || '');
  const [merchantStoreId, setMerchantStoreId] = useState(adminSettings.merchantStoreId || '');

  // Keep settings form in sync when props update
  useEffect(() => {
    setEpNumber(adminSettings.easypaisaNumber || '03182655142');
    setEpTitle(adminSettings.easypaisaTitle || 'Saad Kazi (Qazi Battle Official)');
    setJcNumber(adminSettings.jazzcashNumber || '03182655142');
    setJcTitle(adminSettings.jazzcashTitle || 'Saad Kazi');
    setAdminPin(adminSettings.adminPin || '7860');
    setSupportWhatsapp(adminSettings.supportWhatsapp || '+92 318 2655142');
    setMerchantApiEnabled(adminSettings.merchantApiEnabled || false);
  }, [adminSettings]);

  // Subscribe to all users in Firestore
  useEffect(() => {
    const unsubUsers = subscribeAllUsers((users) => {
      setAllUsers(users);
    });
    return () => unsubUsers();
  }, []);

  // Lockout timer check on mount & interval
  useEffect(() => {
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
      } catch {}
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

  // ==========================================
  // 1. TOURNAMENT ACTIONS (Edit, Delete, Duplicate, Create)
  // ==========================================

  const handleOpenEditTournament = (t: Tournament) => {
    sounds.playClick();
    setEditingTournament({ ...t });
  };

  const handleSaveEditedTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTournament) return;
    try {
      await updateTournamentInDb(editingTournament.id, {
        title: editingTournament.title,
        mode: editingTournament.mode,
        map: editingTournament.map,
        entryFee: Number(editingTournament.entryFee),
        prizePool: Number(editingTournament.prizePool),
        maxSlots: Number(editingTournament.maxSlots),
        startTime: editingTournament.startTime,
        imageUrl: editingTournament.imageUrl || '',
        rules: editingTournament.rules,
        prizeBreakdown: {
          first: Math.round(Number(editingTournament.prizePool) * 0.5),
          second: Math.round(Number(editingTournament.prizePool) * 0.25),
          third: Math.round(Number(editingTournament.prizePool) * 0.15),
          fourthToTenth: Math.round(Number(editingTournament.prizePool) * 0.02),
          perKill: editingTournament.prizeBreakdown?.perKill || 25,
        },
      });
      sounds.playVictory();
      showToast(`Tournament "${editingTournament.title}" updated in Firestore!`);
      setEditingTournament(null);
    } catch (err) {
      console.error('Error saving tournament:', err);
      showToast('Error saving changes to Firestore.');
    }
  };

  const handleDeleteTournamentClick = (t: Tournament) => {
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Delete Tournament)',
      description: `Kya aap waqai "${t.title}" ko delete karna chahte hain? Ye match Firestore aur Player App se foran remove ho jayega.`,
      onConfirm: async () => {
        await deleteTournamentInDb(t, 'deleted');
        sounds.playClick();
        showToast(`Tournament "${t.title}" deleted from Firestore!`);
        setSelectedTournIds((prev) => prev.filter((id) => id !== t.id));
      },
    });
  };

  const handleDuplicateTournamentClick = async (t: Tournament) => {
    sounds.playVictory();
    try {
      const copy = await duplicateTournamentInDb(t);
      showToast(`Tournament duplicated successfully! "${copy.title}"`);
    } catch (err) {
      console.error('Error duplicating tournament:', err);
      showToast('Error duplicating tournament.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
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
      players: [],
      startTime: new Date(Date.now() + 1000 * 60 * startTimeMinutes).toISOString(),
      status: 'upcoming',
      roomId: `FF-${Math.floor(100000 + Math.random() * 900000)}`,
      roomPassword: `QAZI_${Math.floor(1000 + Math.random() * 9000)}`,
      roomRevealed: false,
      version: emulatorAllowed ? 'All Devices' : 'Mobile Only',
      imageUrl: imageUrlInput.trim() || undefined,
      rules: {
        gunAttributes,
        characterSkills,
        limitedAmmo,
        emulatorAllowed,
        customNote,
      },
    };

    sounds.playJoin();
    await createTournamentInDb(newTournament);
    onCreateTournament(newTournament);
    showToast(language === 'ur' ? `Tournament "${newTournament.title}" Firestore me shamil ho gaya!` : `Tournament "${newTournament.title}" created in Firestore!`);
    setTitle('');
    setImageUrlInput('');
    setShowCreateForm(false);
  };

  // ==========================================
  // 2. DEPOSIT ACTIONS (Approve, Reject, Delete, Edit Amount)
  // ==========================================

  const handleApproveDepositClick = async (dep: DepositRequest) => {
    try {
      sounds.playVictory();
      await approveDepositInDb(dep);
      onApproveDeposit(dep.id);
      showToast(`Rs. ${dep.amountPkr} PKR successfully credited to ${dep.playerIgn}'s wallet!`);
    } catch (err) {
      console.error('Error approving deposit:', err);
      showToast('Failed to approve deposit.');
    }
  };

  const handleRejectDepositClick = async (dep: DepositRequest) => {
    try {
      sounds.playClick();
      await rejectDepositInDb(dep.id);
      onRejectDeposit(dep.id);
      showToast(`Deposit request of Rs. ${dep.amountPkr} from ${dep.playerIgn} rejected.`);
    } catch (err) {
      console.error('Error rejecting deposit:', err);
    }
  };

  const handleDeleteDepositClick = (dep: DepositRequest) => {
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Delete Deposit Request)',
      description: `Delete deposit request of Rs. ${dep.amountPkr} PKR for ${dep.playerIgn} (TID: ${dep.trxId})?`,
      onConfirm: async () => {
        await deleteDepositInDb(dep.id);
        sounds.playClick();
        showToast('Deposit request permanently deleted from Firestore.');
        setSelectedDepIds((prev) => prev.filter((id) => id !== dep.id));
      },
    });
  };

  const handleSaveEditDepositAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeposit) return;
    try {
      await updateDepositAmountInDb(editingDeposit.id, Number(editDepAmountInput));
      sounds.playVictory();
      showToast(`Deposit amount updated to Rs. ${editDepAmountInput} PKR in Firestore!`);
      setEditingDeposit(null);
    } catch (err) {
      console.error('Error updating deposit amount:', err);
      showToast('Failed to update deposit amount.');
    }
  };

  // ==========================================
  // 3. WITHDRAWAL ACTIONS (Approve, Mark as Paid, Reject, Delete)
  // ==========================================

  const handleApproveWithdrawalClick = async (wdr: WithdrawalRequest) => {
    try {
      sounds.playVictory();
      await approveWithdrawalInDb(wdr.id);
      showToast(`Withdrawal of Rs. ${wdr.amountPkr} for ${wdr.playerIgn} marked as Approved!`);
    } catch (err) {
      console.error('Error approving withdrawal:', err);
    }
  };

  const handleMarkPaidWithdrawalClick = async (wdr: WithdrawalRequest) => {
    const refId = `EP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    try {
      sounds.playVictory();
      await completeWithdrawalInDb(wdr.id, refId);
      onCompleteWithdrawal(wdr.id, refId);
      showToast(`Withdrawal of Rs. ${wdr.amountPkr} to ${wdr.accountNumber} marked as Paid (Ref: ${refId})!`);
    } catch (err) {
      console.error('Error completing withdrawal:', err);
    }
  };

  const handleRejectWithdrawalClick = async (wdr: WithdrawalRequest) => {
    try {
      sounds.playClick();
      await rejectWithdrawalInDb(wdr);
      onRejectWithdrawal(wdr.id);
      showToast(`Withdrawal rejected and Rs. ${wdr.amountPkr} refunded to player wallet.`);
    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
    }
  };

  const handleDeleteWithdrawalClick = (wdr: WithdrawalRequest) => {
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Delete Withdrawal Request)',
      description: `Delete withdrawal request of Rs. ${wdr.amountPkr} PKR for ${wdr.playerIgn}?`,
      onConfirm: async () => {
        await deleteWithdrawalInDb(wdr.id);
        sounds.playClick();
        showToast('Withdrawal record deleted from Firestore.');
        setSelectedWdrIds((prev) => prev.filter((id) => id !== wdr.id));
      },
    });
  };

  // ==========================================
  // 4. RESULTS & PROOFS ACTIONS (Upload, Edit, Delete, Distribute Prize)
  // ==========================================

  const handleDistributePrizeClick = async (proof: MatchProofSubmission) => {
    const prize = proof.awardedPrize || 1500;
    try {
      const res = await distributePrizeToWinnerInDb({
        winnerIgn: proof.playerIgn,
        winnerUid: proof.playerUid,
        userId: proof.userId,
        amountPkr: prize,
        tournamentTitle: proof.tournamentTitle,
        tournamentId: proof.tournamentId,
        proofId: proof.id,
      });
      sounds.playVictory();
      try {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      } catch {}
      showToast(res.message);
    } catch (err) {
      console.error('Error distributing prize:', err);
      showToast('Error distributing prize to wallet.');
    }
  };

  const handleDeleteProofClick = (proof: MatchProofSubmission) => {
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Delete Match Result / Proof)',
      description: `Delete match proof from ${proof.playerIgn} for "${proof.tournamentTitle}"?`,
      onConfirm: async () => {
        await deleteMatchProofInDb(proof.id);
        sounds.playClick();
        showToast('Match result deleted from Firestore.');
        setSelectedProofIds((prev) => prev.filter((id) => id !== proof.id));
      },
    });
  };

  const handleSaveEditProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProof) return;
    try {
      await updateMatchProofInDb(editingProof.id, {
        claimedRank: Number(editingProof.claimedRank),
        claimedKills: Number(editingProof.claimedKills),
        awardedPrize: Number(editingProof.awardedPrize),
        status: editingProof.status,
      });
      sounds.playVictory();
      showToast('Match result updated in Firestore!');
      setEditingProof(null);
    } catch (err) {
      console.error('Error updating proof:', err);
      showToast('Failed to update result.');
    }
  };

  const handleUploadResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resWinnerIgn.trim()) return;

    const selectedTourn = tournaments.find((t) => t.id === resTournId);
    const newProof: MatchProofSubmission = {
      id: `prf-admin-${Date.now()}`,
      tournamentId: resTournId || 'custom-match',
      tournamentTitle: selectedTourn?.title || 'Qazi Battle Championship Match',
      playerIgn: resWinnerIgn.trim(),
      playerUid: resWinnerUid.trim() || 'FF-' + Math.floor(10000000 + Math.random() * 90000000),
      claimedRank: 1,
      claimedKills: 8,
      submissionTime: 'Just now (Admin Declared)',
      status: 'approved',
      awardedPrize: resPrizeAmount,
    };

    try {
      await submitMatchProofInDb(newProof);
      if (resTournId) {
        await declareWinnerInDb(resTournId, resWinnerTeam.trim() || 'Winner Squad', resWinnerIgn.trim());
      }
      sounds.playVictory();
      showToast(`Match result published & Booyah Champion "${resWinnerIgn}" declared!`);
      setUploadResultOpen(false);
      setResWinnerIgn('');
      setResWinnerTeam('');
      setResWinnerUid('');
    } catch (err) {
      console.error('Error publishing result:', err);
      showToast('Error declaring winner.');
    }
  };

  // ==========================================
  // 5. SAAD KAZI PAYMENT SETTINGS SAVE
  // ==========================================

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: AdminPaymentSettings = {
      easypaisaNumber: epNumber.trim(),
      easypaisaTitle: epTitle.trim(),
      jazzcashNumber: jcNumber.trim(),
      jazzcashTitle: jcTitle.trim(),
      adminPin: adminPin || '7860',
      supportWhatsapp: supportWhatsapp.trim(),
      merchantApiEnabled,
      merchantApiKey: merchantApiKey.trim(),
      merchantStoreId: merchantStoreId.trim(),
    };

    try {
      await saveAdminSettingsInDb(updatedSettings);
      onUpdateSettings(updatedSettings);
      sounds.playVictory();
      showToast('Saad Kazi EasyPaisa & JazzCash numbers saved in Firestore!');
    } catch (err) {
      console.error('Error saving settings in DB:', err);
      showToast('Error saving payment settings.');
    }
  };

  // ==========================================
  // 6. BATCH DELETION ACTIONS
  // ==========================================

  const handleBatchDeleteTournaments = () => {
    if (selectedTournIds.length === 0) return;
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Batch Delete Tournaments)',
      description: `Kya aap waqai ${selectedTournIds.length} select kiye gaye tournaments ko delete karna chahte hain? Ye Firestore se foran delete ho jayenge.`,
      onConfirm: async () => {
        await batchDeleteTournaments(selectedTournIds);
        sounds.playClick();
        showToast(`${selectedTournIds.length} tournaments deleted from Firestore!`);
        setSelectedTournIds([]);
      },
    });
  };

  const handleBatchDeleteDeposits = () => {
    if (selectedDepIds.length === 0) return;
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Batch Delete Deposits)',
      description: `Delete ${selectedDepIds.length} selected deposit requests from Firestore?`,
      onConfirm: async () => {
        await batchDeleteDeposits(selectedDepIds);
        sounds.playClick();
        showToast(`${selectedDepIds.length} deposit requests deleted from Firestore!`);
        setSelectedDepIds([]);
      },
    });
  };

  const handleBatchDeleteWithdrawals = () => {
    if (selectedWdrIds.length === 0) return;
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Batch Delete Withdrawals)',
      description: `Delete ${selectedWdrIds.length} selected withdrawal records from Firestore?`,
      onConfirm: async () => {
        await batchDeleteWithdrawals(selectedWdrIds);
        sounds.playClick();
        showToast(`${selectedWdrIds.length} withdrawal records deleted from Firestore!`);
        setSelectedWdrIds([]);
      },
    });
  };

  const handleBatchDeleteProofs = () => {
    if (selectedProofIds.length === 0) return;
    sounds.playClick();
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Kya delete karna hai? (Batch Delete Match Results)',
      description: `Delete ${selectedProofIds.length} selected match results/proofs from Firestore?`,
      onConfirm: async () => {
        await batchDeleteProofs(selectedProofIds);
        sounds.playClick();
        showToast(`${selectedProofIds.length} match proofs deleted from Firestore!`);
        setSelectedProofIds([]);
      },
    });
  };

  // ==========================================
  // 7. USER MANAGEMENT (BLOCK / UNBLOCK)
  // ==========================================

  const handleToggleBlockUser = async (u: UserProfile) => {
    const newStatus = !u.isBlocked;
    try {
      await toggleBlockUserInDb(u.id, newStatus);
      sounds.playClick();
      showToast(newStatus ? `Player ${u.displayName} blocked.` : `Player ${u.displayName} unblocked.`);
    } catch (err) {
      console.error('Error updating user block status:', err);
    }
  };

  // Filtered lists for Admin views
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const q = tournSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.map.toLowerCase().includes(q) ||
        t.mode.toLowerCase().includes(q) ||
        (t.roomId && t.roomId.toLowerCase().includes(q))
      );
    });
  }, [tournaments, tournSearch]);

  const filteredDeposits = useMemo(() => {
    return depositRequests.filter((d) => {
      const q = depSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        d.playerIgn.toLowerCase().includes(q) ||
        d.playerUid.toLowerCase().includes(q) ||
        d.trxId.toLowerCase().includes(q) ||
        d.senderNumber.toLowerCase().includes(q) ||
        d.method.toLowerCase().includes(q)
      );
    });
  }, [depositRequests, depSearch]);

  const filteredWithdrawals = useMemo(() => {
    return withdrawalRequests.filter((w) => {
      const q = wdrSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        w.playerIgn.toLowerCase().includes(q) ||
        w.playerUid.toLowerCase().includes(q) ||
        w.accountNumber.toLowerCase().includes(q) ||
        w.accountTitle.toLowerCase().includes(q) ||
        w.method.toLowerCase().includes(q)
      );
    });
  }, [withdrawalRequests, wdrSearch]);

  const filteredProofs = useMemo(() => {
    return pendingProofs.filter((p) => {
      const q = proofSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        p.playerIgn.toLowerCase().includes(q) ||
        p.playerUid.toLowerCase().includes(q) ||
        p.tournamentTitle.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    });
  }, [pendingProofs, proofSearch]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.ffUid && u.ffUid.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [allUsers, userSearch]);

  // Security gate if not unlocked
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
            lockoutRemaining > 0
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
          }`}
        >
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-display font-bold text-white">Qazi Battle Master Admin Panel</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {lockoutRemaining > 0
              ? `Security Lockout Active. Try again in ${Math.floor(lockoutRemaining / 60)}m ${lockoutRemaining % 60}s.`
              : 'Saad Kazi Official Esports Control Panel. Enter security PIN to unlock.'}
          </p>
        </div>

        {lockoutRemaining > 0 ? (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs space-y-2">
            <div className="font-mono text-2xl font-black text-red-400">
              {String(Math.floor(lockoutRemaining / 60)).padStart(2, '0')}:{String(lockoutRemaining % 60).padStart(2, '0')}
            </div>
            <p>10-Minute Security Lockout Active.</p>
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
                placeholder="Enter Admin PIN (7860)"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Unlock className="w-4 h-4 stroke-[2.5]" />
                <span>Unlock Master Admin Panel</span>
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
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Full Admin Control Center</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400">Firestore Powered</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white flex items-center gap-2">
            <span>Qazi Battle Master Admin Panel</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Saad Kazi
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Complete management for tournaments, EasyPaisa/JazzCash deposits, player cashouts, match results, and receiving numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setIsUnlocked(false);
              onExitAdmin();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>← Exit to Player App</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setIsUnlocked(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('deposits')}
          className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Pending Deposits</span>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-1">
            {pendingDepositsCount} Requests
          </div>
          <span className="text-[11px] text-neutral-400">EasyPaisa & JazzCash</span>
        </div>

        <div
          onClick={() => setActiveTab('withdrawals')}
          className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Pending Cashouts</span>
          <div className="text-xl font-bold font-mono text-orange-400 tabular-nums mt-1">
            {pendingWithdrawalsCount} Requests
          </div>
          <span className="text-[11px] text-neutral-400">Player Withdrawals</span>
        </div>

        <div
          onClick={() => setActiveTab('tournaments')}
          className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Active Tournaments</span>
          <div className="text-xl font-bold font-mono text-neutral-200 tabular-nums mt-1">
            {tournaments.length} Matches
          </div>
          <span className="text-[11px] text-neutral-400">Bermuda / Kalahari / Alpine</span>
        </div>

        <div
          onClick={() => setActiveTab('settings')}
          className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Saad Kazi Receiving Till</span>
          <div className="text-xs font-mono font-bold text-emerald-400 truncate mt-1">
            {adminSettings.easypaisaNumber || '03182655142'}
          </div>
          <span className="text-[11px] text-neutral-400">EasyPaisa & JazzCash Direct</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto text-xs font-semibold scrollbar-none">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('tournaments');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tournaments' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Active Tournaments ({tournaments.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('deposits');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'deposits' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
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
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'withdrawals' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
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
            setActiveTab('results');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'results' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Results & Proofs ({pendingProofs.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('rooms');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rooms' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Room ID Broadcast</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('users');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Users ({allUsers.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('settings');
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Admin Payment Settings</span>
          <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-amber-400 font-bold text-[9px]">Saad Kazi</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE TOURNAMENTS (With [Edit] [Delete] [Duplicate] on each card) */}
      {/* ========================================================================= */}
      {activeTab === 'tournaments' && (
        <div className="space-y-5">
          {/* Action Bar with Search and Create Button */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tournSearch}
                  onChange={(e) => setTournSearch(e.target.value)}
                  placeholder="Search tournaments by title, map, mode, room ID..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {selectedTournIds.length > 0 && (
                <button
                  onClick={handleBatchDeleteTournaments}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedTournIds.length})</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setShowCreateForm(!showCreateForm);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{showCreateForm ? 'Close Create Form' : '+ Create New Tournament'}</span>
            </button>
          </div>

          {/* Collapsible Create Tournament Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateSubmit} className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-500" />
                  <span>Create Tournament in Firestore (collection "tournaments")</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Tournament Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Qazi Battle Bermuda Squad Cup"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Map</label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value as MatchMap)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                    <option value="Craftland">Craftland</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Match Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as MatchMode)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Squad">Squad (12 Teams / 48 Players)</option>
                    <option value="Solo">Solo (48 Single Contenders)</option>
                    <option value="Duo">Duo (24 Teams)</option>
                    <option value="Clash Squad">Clash Squad 4v4</option>
                    <option value="1v1">1v1 Custom Duel</option>
                    <option value="2v2">2v2 Custom Match</option>
                    <option value="3v3">3v3 Custom Match</option>
                    <option value="4v4">4v4 Custom Match</option>
                    <option value="Lone Wolf">Lone Wolf</option>
                    <option value="Full Map Custom">Full Map Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Entry Fee (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Total Prize Pool (PKR)</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Per Kill Reward (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={perKill}
                    onChange={(e) => setPerKill(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Start Delay (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    step={5}
                    value={startTimeMinutes}
                    onChange={(e) => setStartTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-neutral-300 font-semibold mb-1">Custom Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/banner.jpg or leave blank for default map banner"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Publish to Firestore</span>
                </button>
              </div>
            </form>
          )}

          {/* Select All Checkbox Header */}
          <div className="flex items-center justify-between px-2 text-xs text-neutral-400">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={selectedTournIds.length > 0 && selectedTournIds.length === filteredTournaments.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTournIds(filteredTournaments.map((t) => t.id));
                  } else {
                    setSelectedTournIds([]);
                  }
                }}
                className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Select All Tournaments ({filteredTournaments.length})</span>
            </label>
            <span className="text-[11px] text-neutral-500 font-mono">
              Showing {filteredTournaments.length} of {tournaments.length}
            </span>
          </div>

          {/* Tournaments Grid */}
          {filteredTournaments.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center space-y-3">
              <Trophy className="w-10 h-10 text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Koi tournament nahi mila</h4>
              <p className="text-xs text-neutral-400">Search filter ko clear karein ya naya tournament banayein.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTournaments.map((t) => {
                const isSelected = selectedTournIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`bg-neutral-900 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                      isSelected ? 'border-amber-500 shadow-md ring-1 ring-amber-500/50' : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Top Banner */}
                    <div className="relative h-32 w-full bg-neutral-950 overflow-hidden">
                      <img
                        src={t.imageUrl || mapBermuda}
                        alt={t.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

                      {/* Checkbox Overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTournIds((prev) => [...prev, t.id]);
                            } else {
                              setSelectedTournIds((prev) => prev.filter((id) => id !== t.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-950/80 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </div>

                      {/* Map & Mode Badges */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-950/90 text-amber-400 font-bold border border-neutral-800">
                          {t.mode}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-neutral-950/90 text-neutral-200 font-semibold border border-neutral-800">
                          {t.map}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <div className="absolute bottom-2.5 left-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'room_open'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : t.status === 'completed'
                              ? 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                          }`}
                        >
                          {t.status === 'room_open' ? 'Room Open' : t.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1 mb-1" title={t.title}>
                          {t.title}
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-y border-neutral-800/80 my-2">
                          <div>
                            <span className="text-neutral-500 block">Entry Fee</span>
                            <span className="font-bold text-emerald-400 font-mono">Rs. {t.entryFee} PKR</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Prize Pool</span>
                            <span className="font-bold text-amber-400 font-mono">Rs. {t.prizePool} PKR</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Slots Joined</span>
                            <span className="font-bold text-neutral-200 font-mono">
                              {t.registeredCount} / {t.maxSlots}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Room ID</span>
                            <span className="font-mono text-neutral-300 font-semibold truncate block">
                              {t.roomId || 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3 CRITICAL BUTTONS: [Edit] [Delete] [Duplicate] */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => handleOpenEditTournament(t)}
                          className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Edit Title, Prize, Map, Date, Image, Rules"
                        >
                          <Edit className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateTournamentClick(t)}
                          className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Duplicate Tournament with 1-click in Firestore"
                        >
                          <CopyPlus className="w-3 h-3 text-cyan-400" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          onClick={() => handleDeleteTournamentClick(t)}
                          className="px-2 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EASYPAISA & JAZZCASH DEPOSIT APPROVALS */}
      {/* ========================================================================= */}
      {activeTab === 'deposits' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>EasyPaisa & JazzCash Deposit Verification</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Players submit their Transaction ID (TID) after sending money to Saad Kazi. Verify and click Approve to credit balance immediately.
              </p>
            </div>

            {selectedDepIds.length > 0 && (
              <button
                onClick={handleBatchDeleteDeposits}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedDepIds.length})</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={depSearch}
                onChange={(e) => setDepSearch(e.target.value)}
                placeholder="Search by Player IGN, UID, TRX ID / TID, or Sender Mobile..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer hover:text-white shrink-0">
              <input
                type="checkbox"
                checked={selectedDepIds.length > 0 && selectedDepIds.length === filteredDeposits.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDepIds(filteredDeposits.map((d) => d.id));
                  } else {
                    setSelectedDepIds([]);
                  }
                }}
                className="rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Select All ({filteredDeposits.length})</span>
            </label>
          </div>

          {filteredDeposits.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">No deposit requests matched your search.</div>
          ) : (
            <div className="space-y-3">
              {filteredDeposits.map((dep) => {
                const isSelected = selectedDepIds.includes(dep.id);
                return (
                  <div
                    key={dep.id}
                    className={`p-4 rounded-xl bg-neutral-950 border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                      isSelected ? 'border-amber-500' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepIds((prev) => [...prev, dep.id]);
                          } else {
                            setSelectedDepIds((prev) => prev.filter((id) => id !== dep.id));
                          }
                        }}
                        className="mt-1 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              dep.method === 'EasyPaisa'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {dep.method}
                          </span>
                          <span className="font-bold text-white text-base font-mono tabular-nums">
                            Rs. {dep.amountPkr} PKR
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-200 font-semibold">{dep.playerIgn}</span>
                          <span className="text-neutral-500 font-mono">(UID: {dep.playerUid})</span>
                          {dep.status === 'approved' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle className="w-3 h-3" /> Approved & Credited
                            </span>
                          )}
                          {dep.status === 'rejected' && (
                            <span className="text-red-400 font-semibold text-[11px]">Rejected</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-400 text-[11px]">
                          <span>
                            Sender Mobile: <strong className="text-neutral-200 font-mono">{dep.senderNumber}</strong>{' '}
                            {dep.senderName && `(${dep.senderName})`}
                          </span>
                          <span>·</span>
                          <span>
                            TRX ID / TID: <strong className="text-amber-400 font-mono">{dep.trxId}</strong>
                          </span>
                          <span>·</span>
                          <span className="text-neutral-500">{dep.submittedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buttons: [Approve & Add Balance] [Reject] [Delete Request] [Edit Amount] */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-center">
                      {dep.status === 'pending' && (
                        <button
                          onClick={() => handleApproveDepositClick(dep)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve & Add Balance</span>
                        </button>
                      )}

                      {dep.status === 'pending' && (
                        <button
                          onClick={() => handleRejectDepositClick(dep)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sounds.playClick();
                          setEditingDeposit(dep);
                          setEditDepAmountInput(dep.amountPkr);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Edit Deposit Amount"
                      >
                        <Edit className="w-3 h-3 text-amber-400" />
                        <span>Edit Amount</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDepositClick(dep)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete Request from Firestore"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLAYER WITHDRAWALS */}
      {/* ========================================================================= */}
      {activeTab === 'withdrawals' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Player Cashout / Withdrawal Queue</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Send PKR directly to player mobile accounts via your EasyPaisa / JazzCash app, then mark as Paid.
              </p>
            </div>

            {selectedWdrIds.length > 0 && (
              <button
                onClick={handleBatchDeleteWithdrawals}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedWdrIds.length})</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={wdrSearch}
                onChange={(e) => setWdrSearch(e.target.value)}
                placeholder="Search by Player IGN, UID, Mobile Number, or Title..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer hover:text-white shrink-0">
              <input
                type="checkbox"
                checked={selectedWdrIds.length > 0 && selectedWdrIds.length === filteredWithdrawals.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedWdrIds(filteredWithdrawals.map((w) => w.id));
                  } else {
                    setSelectedWdrIds([]);
                  }
                }}
                className="rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Select All ({filteredWithdrawals.length})</span>
            </label>
          </div>

          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">No withdrawal requests found.</div>
          ) : (
            <div className="space-y-3">
              {filteredWithdrawals.map((wdr) => {
                const isSelected = selectedWdrIds.includes(wdr.id);
                return (
                  <div
                    key={wdr.id}
                    className={`p-4 rounded-xl bg-neutral-950 border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                      isSelected ? 'border-amber-500' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWdrIds((prev) => [...prev, wdr.id]);
                          } else {
                            setSelectedWdrIds((prev) => prev.filter((id) => id !== wdr.id));
                          }
                        }}
                        className="mt-1 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              wdr.method === 'EasyPaisa'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {wdr.method}
                          </span>
                          <span className="font-bold text-white text-base font-mono tabular-nums">
                            Rs. {wdr.amountPkr} PKR
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-200 font-semibold">{wdr.playerIgn}</span>
                          {wdr.playerUid && <span className="text-neutral-500 font-mono">(UID: {wdr.playerUid})</span>}
                          {wdr.status === 'completed' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle className="w-3 h-3" /> Transferred & Paid
                            </span>
                          )}
                          {wdr.status === 'rejected' && (
                            <span className="text-red-400 font-semibold text-[11px]">Rejected / Refunded</span>
                          )}
                          {wdr.status === 'approved' && (
                            <span className="text-amber-400 font-semibold text-[11px]">Approved (Processing)</span>
                          )}
                        </div>

                        {/* SEND MONEY TO: Clear user account information */}
                        <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300 text-[11px] space-y-0.5">
                          <div className="text-neutral-400 font-semibold">
                            Send Payment To:{' '}
                            <span className="text-amber-400 font-mono font-bold text-sm">
                              {wdr.accountNumber}
                            </span>{' '}
                            ({wdr.method})
                          </div>
                          <div className="text-neutral-400">
                            Account Holder Title: <strong className="text-white">{wdr.accountTitle}</strong>
                          </div>
                          {wdr.referenceId && (
                            <div className="text-neutral-500 font-mono text-[10px]">
                              Ref ID: {wdr.referenceId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buttons: [Approve] [Mark as Paid] [Reject] [Delete] */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-center">
                      {wdr.status === 'pending' && (
                        <button
                          onClick={() => handleApproveWithdrawalClick(wdr)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {wdr.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkPaidWithdrawalClick(wdr)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Mark as Paid</span>
                        </button>
                      )}

                      {wdr.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectWithdrawalClick(wdr)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteWithdrawalClick(wdr)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Delete Withdrawal Record"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RESULTS & PROOFS (Upload, Edit, Delete, Distribute Prize) */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-5">
          {/* Top Bar with Declare Result Modal Toggle */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Match Results & Winner Prize Distribution</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Declare Booyah Champions, review player screenshot proofs, and auto-transfer prize money directly to their wallet in Firestore.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedProofIds.length > 0 && (
                <button
                  onClick={handleBatchDeleteProofs}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedProofIds.length})</span>
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playClick();
                  setUploadResultOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Upload / Declare Match Result</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={proofSearch}
                onChange={(e) => setProofSearch(e.target.value)}
                placeholder="Search results by Player IGN, UID, or Tournament Title..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer hover:text-white shrink-0">
              <input
                type="checkbox"
                checked={selectedProofIds.length > 0 && selectedProofIds.length === filteredProofs.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProofIds(filteredProofs.map((p) => p.id));
                  } else {
                    setSelectedProofIds([]);
                  }
                }}
                className="rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Select All Results ({filteredProofs.length})</span>
            </label>
          </div>

          {/* Results List */}
          {filteredProofs.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center text-neutral-500 text-xs">
              No match results or screenshot claims recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProofs.map((p) => {
                const isSelected = selectedProofIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl bg-neutral-950 border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                      isSelected ? 'border-amber-500' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProofIds((prev) => [...prev, p.id]);
                          } else {
                            setSelectedProofIds((prev) => prev.filter((id) => id !== p.id));
                          }
                        }}
                        className="mt-1 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 cursor-pointer"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.playerIgn}</span>
                          <span className="text-neutral-500 font-mono">(UID: {p.playerUid})</span>
                          <span className="text-neutral-600">·</span>
                          <span className="text-amber-400 font-semibold">{p.tournamentTitle}</span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                              p.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : p.status === 'rejected'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>

                        <div className="text-neutral-400 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Claimed Rank: <strong className="text-white font-mono">#{p.claimedRank}</strong></span>
                          <span>·</span>
                          <span>Kills: <strong className="text-white font-mono">{p.claimedKills}</strong></span>
                          <span>·</span>
                          <span>
                            Prize Awarded:{' '}
                            <strong className="text-emerald-400 font-mono">Rs. {p.awardedPrize || 0} PKR</strong>
                          </span>
                          <span>·</span>
                          <span className="text-neutral-500">{p.submissionTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: [Distribute Prize] [Edit Result] [Delete Match Result] */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleDistributePrizeClick(p)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        title="Auto send prize directly to player's wallet"
                      >
                        <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Distribute Prize</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          setEditingProof({ ...p });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs flex items-center gap-1 cursor-pointer"
                        title="Edit Result Details"
                      >
                        <Edit className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProofClick(p)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-medium text-xs flex items-center gap-1 cursor-pointer"
                        title="Delete Match Result"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ROOM ID BROADCASTER */}
      {/* ========================================================================= */}
      {activeTab === 'rooms' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedTournForRoom || !broadcastRoomId.trim() || !broadcastPass.trim()) return;
            onUpdateRoomCredentials(selectedTournForRoom, broadcastRoomId.trim(), broadcastPass.trim(), true);
            sounds.playVictory();
            showToast('Room credentials successfully broadcasted to registered players!');
          }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase">
            <Key className="w-4 h-4" />
            <span>Room ID & Password Distribution</span>
          </div>

          <p className="text-xs text-neutral-400">
            Create the custom room in Free Fire, input the credentials below, and unlock it for confirmed participants.
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
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Broadcast Room ID to Registered Players</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ALL USERS (Signup Stats & Player List) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Registered Players & Signup Management</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live list of all contenders who registered accounts with their own Email, Free Fire IGN, and UID.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total Signups</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{allUsers.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Active Players</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {allUsers.filter((u) => !u.isBlocked).length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Blocked Contenders</span>
              <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
                {allUsers.filter((u) => u.isBlocked).length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total Wallet Holdings</span>
              <div className="text-sm font-bold font-mono text-amber-400 mt-1 truncate">
                Rs. {allUsers.reduce((sum, u) => sum + (u.walletBalance || 0), 0)} PKR
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by Name, UID, Email, or WhatsApp..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">No registered players found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800 text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Sr.</th>
                    <th className="px-4 py-3">Player Name (IGN)</th>
                    <th className="px-4 py-3">FF Numeric UID</th>
                    <th className="px-4 py-3">Email / Contact</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 bg-neutral-900/60 font-mono">
                  {filteredUsers.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-3 text-neutral-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-sans font-bold text-white">{u.displayName || 'Unnamed'}</td>
                      <td className="px-4 py-3 text-amber-400">{u.ffUid || 'N/A'}</td>
                      <td className="px-4 py-3 text-neutral-300 font-sans">{u.email || u.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">Rs. {u.walletBalance || 0}</td>
                      <td className="px-4 py-3 font-sans">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800 font-semibold">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        <button
                          onClick={() => handleToggleBlockUser(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            u.isBlocked
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-950/60 hover:bg-red-900/80 text-red-300'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SAAD KAZI ADMIN PAYMENT SETTINGS (Editable in Firestore) */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span>Admin Payment Settings (Saad Kazi Receiving Wallets)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Edit Saad Kazi’s personal EasyPaisa and JazzCash numbers directly from this panel. Changes save to Firestore collection "adminSettings" and update across the entire Player App immediately!
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Direct Mobile Transfer 100% Active</span>
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
                <span className="text-[10px] text-neutral-500 font-mono">Telenor Microfinance</span>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">EasyPaisa Mobile Number</label>
                <input
                  type="text"
                  required
                  value={epNumber}
                  onChange={(e) => setEpNumber(e.target.value)}
                  placeholder="0318-2655142"
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
                <span className="text-[10px] text-neutral-500 font-mono">Mobilink Microfinance</span>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">JazzCash Mobile Number</label>
                <input
                  type="text"
                  required
                  value={jcNumber}
                  onChange={(e) => setJcNumber(e.target.value)}
                  placeholder="0318-2655142"
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
                placeholder="+92 318 2655142"
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
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <span className="text-[11px] text-neutral-400">
              Numbers will update immediately in the Player App Wallet screen without modifying any code.
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

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT TOURNAMENT POPUP */}
      {/* ========================================================================= */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                <span>Edit Tournament ({editingTournament.title})</span>
              </h3>
              <button
                onClick={() => setEditingTournament(null)}
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTournament} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingTournament.title}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Map</label>
                  <select
                    value={editingTournament.map}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, map: e.target.value as MatchMap })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                    <option value="Craftland">Craftland</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Mode</label>
                  <select
                    value={editingTournament.mode}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, mode: e.target.value as MatchMode })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Squad">Squad</option>
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Clash Squad">Clash Squad</option>
                    <option value="1v1">1v1</option>
                    <option value="2v2">2v2</option>
                    <option value="4v4">4v4</option>
                    <option value="Lone Wolf">Lone Wolf</option>
                    <option value="Full Map Custom">Full Map Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Entry Fee (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingTournament.entryFee}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, entryFee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Prize Pool (PKR)</label>
                  <input
                    type="number"
                    min={100}
                    value={editingTournament.prizePool}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, prizePool: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Max Slots</label>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={editingTournament.maxSlots}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, maxSlots: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Start Date & Time (ISO)</label>
                  <input
                    type="text"
                    value={editingTournament.startTime}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={editingTournament.imageUrl || ''}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTournament({ ...editingTournament, imageUrl: mapBermuda })}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 cursor-pointer"
                    >
                      Bermuda Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTournament({ ...editingTournament, imageUrl: trophyImg })}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 cursor-pointer"
                    >
                      Trophy Arena
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTournament({ ...editingTournament, imageUrl: heroImg })}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 cursor-pointer"
                    >
                      Hero Wallpaper
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-neutral-300 font-semibold mb-1">Custom Rules Note</label>
                  <input
                    type="text"
                    value={editingTournament.rules?.customNote || ''}
                    onChange={(e) =>
                      setEditingTournament({
                        ...editingTournament,
                        rules: { ...editingTournament.rules, customNote: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes in Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRMATION MODAL ("Kya delete karna hai?") */}
      {/* ========================================================================= */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-red-800/80 rounded-2xl p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-700 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-display font-black text-white">{deleteConfirmModal.title}</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {deleteConfirmModal.description}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel (Ruk Jao)
              </button>

              <button
                onClick={async () => {
                  await deleteConfirmModal.onConfirm();
                  setDeleteConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-red-950 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Haan, Delete Karein</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT DEPOSIT AMOUNT MODAL */}
      {/* ========================================================================= */}
      {editingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                <span>Edit Deposit Amount (PKR)</span>
              </h3>
              <button onClick={() => setEditingDeposit(null)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDepositAmount} className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block mb-1">
                  Player: <strong className="text-white">{editingDeposit.playerIgn}</strong> (TID: {editingDeposit.trxId})
                </span>
                <label className="block text-neutral-300 font-semibold mb-1">Corrected Amount in PKR</label>
                <input
                  type="number"
                  required
                  min={10}
                  step={10}
                  value={editDepAmountInput}
                  onChange={(e) => setEditDepAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDeposit(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Save in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT MATCH RESULT / PROOF MODAL */}
      {/* ========================================================================= */}
      {editingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                <span>Edit Match Result / Proof</span>
              </h3>
              <button onClick={() => setEditingProof(null)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProof} className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block mb-2">
                  Player: <strong className="text-white">{editingProof.playerIgn}</strong> · {editingProof.tournamentTitle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Rank (#)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingProof.claimedRank}
                    onChange={(e) => setEditingProof({ ...editingProof, claimedRank: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Kills</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProof.claimedKills}
                    onChange={(e) => setEditingProof({ ...editingProof, claimedKills: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Awarded Prize (PKR)</label>
                <input
                  type="number"
                  min={0}
                  value={editingProof.awardedPrize || 0}
                  onChange={(e) => setEditingProof({ ...editingProof, awardedPrize: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Status</label>
                <select
                  value={editingProof.status}
                  onChange={(e) => setEditingProof({ ...editingProof, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingProof(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Save in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: UPLOAD / DECLARE MATCH RESULT MODAL */}
      {/* ========================================================================= */}
      {uploadResultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Upload & Declare Match Result</span>
              </h3>
              <button onClick={() => setUploadResultOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadResultSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Select Tournament</label>
                <select
                  value={resTournId}
                  onChange={(e) => setResTournId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.mode} · Rs. {t.prizePool} PKR)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Winning Squad / Team</label>
                  <input
                    type="text"
                    value={resWinnerTeam}
                    onChange={(e) => setResWinnerTeam(e.target.value)}
                    placeholder="e.g. Team Falcon"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Booyah Winner Player IGN</label>
                  <input
                    type="text"
                    required
                    value={resWinnerIgn}
                    onChange={(e) => setResWinnerIgn(e.target.value)}
                    placeholder="e.g. FALCON・Sniper"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Free Fire UID (Optional)</label>
                  <input
                    type="text"
                    value={resWinnerUid}
                    onChange={(e) => setResWinnerUid(e.target.value)}
                    placeholder="e.g. 192849102"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Prize Amount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={resPrizeAmount}
                    onChange={(e) => setResPrizeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setUploadResultOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Publish Result in Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
