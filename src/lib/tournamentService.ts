import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
  arrayUnion,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Tournament,
  PlayerSlot,
  DepositRequest,
  WithdrawalRequest,
  AdminPaymentSettings,
  WalletTransaction,
  UserProfile,
  CompletedRoom,
  MatchProofSubmission,
} from '../types/tournament';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_DEPOSIT_REQUESTS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_PENDING_PROOFS,
} from '../data/mockTournaments';

// ==========================================
// 1. Tournaments Subscriptions & Operations
// ==========================================

export function subscribeTournaments(onUpdate: (tournaments: Tournament[]) => void) {
  const tournamentsCol = collection(db, 'tournaments');

  const unsubscribe = onSnapshot(
    tournamentsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial tournaments if Firestore collection is empty
        console.log('Seeding initial tournaments in Firestore...');
        for (const t of INITIAL_TOURNAMENTS) {
          const docRef = doc(db, 'tournaments', t.id);
          await setDoc(docRef, {
            ...t,
            players: t.players || (t.id === 'ff-tourn-01' ? ['demo-player-uid'] : []),
          });
        }
        return;
      }

      const list: Tournament[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Tournament);
      });

      // Sort: upcoming & room_open first, then completed
      list.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      onUpdate(list);
    },
    (error) => {
      console.error('Error subscribing to tournaments:', error);
      // Fallback to initial
      onUpdate(INITIAL_TOURNAMENTS);
    }
  );

  return unsubscribe;
}

export async function createTournamentInDb(tournament: Tournament) {
  const docRef = doc(db, 'tournaments', tournament.id);
  await setDoc(docRef, {
    ...tournament,
    players: tournament.players || [],
  });
}

export async function updateRoomCredentialsInDb(
  tournamentId: string,
  roomId: string,
  roomPassword: string,
  revealNow: boolean
) {
  const docRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(docRef, {
    roomId,
    roomPassword,
    roomRevealed: revealNow,
    status: revealNow ? 'room_open' : 'upcoming',
  });
}

export async function declareWinnerInDb(
  tournamentId: string,
  winnerTeam: string,
  winnerBooyahIgn: string
) {
  const docRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(docRef, {
    winnerTeam,
    winnerBooyahIgn,
    status: 'completed',
  });
}

export async function updateTournamentInDb(
  tournamentId: string,
  updates: Partial<Tournament>
) {
  const docRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function duplicateTournamentInDb(tournament: Tournament): Promise<Tournament> {
  const newId = `ff-tourn-${Date.now()}`;
  const copyTitle = tournament.title.startsWith('[Copy]') ? tournament.title : `[Copy] ${tournament.title}`;
  const duplicate: Tournament = {
    ...tournament,
    id: newId,
    title: copyTitle,
    registeredCount: 0,
    slots: [],
    players: [],
    status: 'upcoming',
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    roomId: `FF-${Math.floor(100000 + Math.random() * 900000)}`,
    roomPassword: `QAZI_${Math.floor(1000 + Math.random() * 9000)}`,
    roomRevealed: false,
  };
  await setDoc(doc(db, 'tournaments', newId), duplicate);
  return duplicate;
}

// ==========================================
// 2. Tournament Registration Flow
// ==========================================

export async function registerPlayerForTournament(
  tournament: Tournament,
  userId: string,
  playerIgn: string,
  playerUid: string,
  currentBalance: number
): Promise<{ success: boolean; error?: string; assignedSlot?: PlayerSlot }> {
  // Check if player account is blocked by Admin
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data()?.isBlocked) {
      return {
        success: false,
        error: 'account_blocked',
      };
    }
  } catch (e) {
    console.warn('Could not check user blocked status:', e);
  }

  // 1. Prevent double registration
  if (tournament.players?.includes(userId)) {
    return {
      success: false,
      error: 'already_registered',
      assignedSlot: tournament.slots?.find((s) => s.userId === userId || s.leaderUid === playerUid),
    };
  }

  // 2. Check balance
  if (currentBalance < tournament.entryFee) {
    return {
      success: false,
      error: 'insufficient_balance',
    };
  }

  // 3. Check slots
  if (tournament.registeredCount >= tournament.maxSlots) {
    return {
      success: false,
      error: 'slots_full',
    };
  }

  const newSlotNumber = (tournament.registeredCount || 0) + 1;
  const newSlot: PlayerSlot = {
    slotNumber: newSlotNumber,
    teamName: tournament.mode === 'Solo' ? undefined : `${playerIgn}'s Team`,
    leaderIgn: playerIgn,
    leaderUid: playerUid,
    userId,
    registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  try {
    // A. Deduct Fee from Player's Wallet & Record Transaction & Increment matches played
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      walletBalance: increment(-tournament.entryFee),
      registeredTournaments: arrayUnion(tournament.id),
      totalMatchesPlayed: increment(1),
      updatedAt: new Date().toISOString(),
    });

    // Add entry fee debit transaction in user's individual transactions ledger
    const txDocRef = doc(collection(db, 'users', userId, 'transactions'));
    const txData: WalletTransaction = {
      id: txDocRef.id,
      userId,
      type: 'entry_fee',
      amount: -tournament.entryFee,
      description: `Entry Fee: ${tournament.title}`,
      timestamp: 'Just now',
      status: 'completed',
    };
    await setDoc(txDocRef, txData);

    // B. Add Player UID and Slot to Tournament in Firestore
    const tournDocRef = doc(db, 'tournaments', tournament.id);
    await updateDoc(tournDocRef, {
      registeredCount: increment(1),
      players: arrayUnion(userId),
      slots: arrayUnion(newSlot),
    });

    return {
      success: true,
      assignedSlot: newSlot,
    };
  } catch (err: any) {
    console.error('Registration error in Firestore:', err);
    throw err;
  }
}

// ==========================================
// 3. Deposit Requests Flow (EasyPaisa / JazzCash)
// ==========================================

export function subscribeDepositRequests(onUpdate: (requests: DepositRequest[]) => void) {
  const colRef = collection(db, 'deposit_requests');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial demonstration requests for admin panel
        for (const dep of INITIAL_DEPOSIT_REQUESTS) {
          await setDoc(doc(db, 'deposit_requests', dep.id), dep);
        }
        return;
      }

      const list: DepositRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as DepositRequest);
      });

      // Sort pending first, then by date
      list.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.id.localeCompare(a.id);
      });

      onUpdate(list);
    },
    (err) => {
      console.error('Error subscribing to deposit requests:', err);
      onUpdate(INITIAL_DEPOSIT_REQUESTS);
    }
  );
}

export async function submitDepositRequest(
  req: Omit<DepositRequest, 'id' | 'submittedAt' | 'status'>
) {
  const id = `dep-pk-${Date.now()}`;
  const newReq: DepositRequest = {
    ...req,
    id,
    submittedAt: 'Just now',
    status: 'pending',
  };

  const docRef = doc(db, 'deposit_requests', id);
  await setDoc(docRef, newReq);
  return newReq;
}

export async function approveDepositInDb(deposit: DepositRequest) {
  // 1. Update deposit request status
  const depRef = doc(db, 'deposit_requests', deposit.id);
  await updateDoc(depRef, {
    status: 'approved',
  });

  // 2. If deposit has a userId, credit that specific player's wallet in Firestore
  if (deposit.userId) {
    try {
      const userDocRef = doc(db, 'users', deposit.userId);
      await updateDoc(userDocRef, {
        walletBalance: increment(deposit.amountPkr),
        updatedAt: new Date().toISOString(),
      });

      // Add transaction to the player's personal ledger
      const txDocRef = doc(collection(db, 'users', deposit.userId, 'transactions'));
      await setDoc(txDocRef, {
        id: txDocRef.id,
        userId: deposit.userId,
        type: 'deposit',
        amount: deposit.amountPkr,
        description: `${deposit.method} Deposit Verified (TID: ${deposit.trxId})`,
        timestamp: 'Just now',
        status: 'completed',
        paymentMethod: deposit.method,
        trxId: deposit.trxId,
      });
    } catch (err) {
      console.error('Error crediting player wallet in Firestore:', err);
    }
  }
}

export async function rejectDepositInDb(depositId: string) {
  const depRef = doc(db, 'deposit_requests', depositId);
  await updateDoc(depRef, {
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteDepositInDb(depositId: string) {
  const depRef = doc(db, 'deposit_requests', depositId);
  await deleteDoc(depRef);
}

export async function updateDepositAmountInDb(depositId: string, newAmount: number) {
  const depRef = doc(db, 'deposit_requests', depositId);
  await updateDoc(depRef, {
    amountPkr: newAmount,
    updatedAt: new Date().toISOString(),
  });
}

// ==========================================
// 4. Withdrawal Requests Flow
// ==========================================

export function subscribeWithdrawalRequests(onUpdate: (requests: WithdrawalRequest[]) => void) {
  const colRef = collection(db, 'withdrawal_requests');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial withdrawals
        for (const wdr of INITIAL_WITHDRAWAL_REQUESTS) {
          await setDoc(doc(db, 'withdrawal_requests', wdr.id), wdr);
        }
        return;
      }

      const list: WithdrawalRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as WithdrawalRequest);
      });
      list.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.id.localeCompare(a.id);
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Error subscribing to withdrawals:', err);
      onUpdate(INITIAL_WITHDRAWAL_REQUESTS);
    }
  );
}

export async function submitWithdrawalInDb(
  req: Omit<WithdrawalRequest, 'id' | 'submittedAt' | 'status'>,
  userId?: string
) {
  const id = `wdr-pk-${Date.now()}`;
  const newReq: WithdrawalRequest = {
    ...req,
    id,
    userId,
    submittedAt: 'Just now',
    status: 'pending',
  };

  // Deduct from player wallet immediately upon request
  if (userId) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      walletBalance: increment(-req.amountPkr),
      updatedAt: new Date().toISOString(),
    });

    const txDocRef = doc(collection(db, 'users', userId, 'transactions'));
    await setDoc(txDocRef, {
      id: txDocRef.id,
      userId,
      type: 'withdrawal',
      amount: -req.amountPkr,
      description: `Withdrawal to ${req.method} (${req.accountNumber})`,
      timestamp: 'Just now',
      status: 'processing',
      paymentMethod: req.method,
    });
  }

  await setDoc(doc(db, 'withdrawal_requests', id), newReq);
  return newReq;
}

export async function approveWithdrawalInDb(withdrawalId: string) {
  const docRef = doc(db, 'withdrawal_requests', withdrawalId);
  await updateDoc(docRef, {
    status: 'approved',
    updatedAt: new Date().toISOString(),
  });
}

export async function completeWithdrawalInDb(withdrawalId: string, referenceId: string) {
  const docRef = doc(db, 'withdrawal_requests', withdrawalId);
  await updateDoc(docRef, {
    status: 'completed',
    referenceId,
    updatedAt: new Date().toISOString(),
  });
}

export async function rejectWithdrawalInDb(withdrawal: WithdrawalRequest) {
  const docRef = doc(db, 'withdrawal_requests', withdrawal.id);
  await updateDoc(docRef, {
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  });

  // Refund balance if rejected
  if (withdrawal.userId) {
    const userDocRef = doc(db, 'users', withdrawal.userId);
    await updateDoc(userDocRef, {
      walletBalance: increment(withdrawal.amountPkr),
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function deleteWithdrawalInDb(withdrawalId: string) {
  const docRef = doc(db, 'withdrawal_requests', withdrawalId);
  await deleteDoc(docRef);
}

// ==========================================
// 5. Saad Kazi Admin Payment Settings
// ==========================================

export function subscribeAdminSettings(onUpdate: (settings: AdminPaymentSettings) => void) {
  const docRef = doc(db, 'settings', 'admin_payment');
  const adminSettingsRef = doc(db, 'adminSettings', 'payment');

  return onSnapshot(
    docRef,
    async (snap) => {
      if (!snap.exists()) {
        try {
          const snap2 = await getDoc(adminSettingsRef);
          if (snap2.exists()) {
            onUpdate(snap2.data() as AdminPaymentSettings);
            return;
          }
        } catch {}

        console.log('Initializing Saad Kazi Admin Payment Settings in Firestore...');
        await setDoc(docRef, INITIAL_ADMIN_SETTINGS);
        try {
          await setDoc(adminSettingsRef, INITIAL_ADMIN_SETTINGS);
        } catch {}
        onUpdate(INITIAL_ADMIN_SETTINGS);
        return;
      }
      onUpdate(snap.data() as AdminPaymentSettings);
    },
    (err) => {
      console.error('Error reading admin payment settings:', err);
      onUpdate(INITIAL_ADMIN_SETTINGS);
    }
  );
}

export async function saveAdminSettingsInDb(settings: AdminPaymentSettings) {
  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  const docRef1 = doc(db, 'settings', 'admin_payment');
  const docRef2 = doc(db, 'adminSettings', 'payment');
  await Promise.all([
    setDoc(docRef1, payload),
    setDoc(docRef2, payload),
  ]);
}

// ==========================================
// 6. Custom Room / Tournament Delete & Recreate & History
// ==========================================

export async function deleteTournamentInDb(
  tournament: Tournament,
  reason: 'finished' | 'canceled_by_admin' | 'deleted' = 'deleted'
) {
  // Archive into completed_rooms
  const completedRoom: CompletedRoom = {
    id: `comp-${tournament.id}-${Date.now()}`,
    originalTournamentId: tournament.id,
    title: tournament.title,
    mode: tournament.mode,
    map: tournament.map,
    server: tournament.server || 'Pakistan',
    entryFee: tournament.entryFee,
    prizePool: tournament.prizePool,
    prizeBreakdown: tournament.prizeBreakdown,
    maxSlots: tournament.maxSlots,
    registeredCount: tournament.registeredCount || 0,
    slots: tournament.slots || [],
    players: tournament.players || [],
    startTime: tournament.startTime,
    completedAt: new Date().toISOString(),
    status: 'completed',
    roomId: tournament.roomId,
    winnerTeam: tournament.winnerTeam,
    winnerBooyahIgn: tournament.winnerBooyahIgn,
    deletedReason: reason,
  };

  const archiveRef = doc(db, 'completed_rooms', completedRoom.id);
  await setDoc(archiveRef, completedRoom);

  // Remove from active tournaments collection
  const tournRef = doc(db, 'tournaments', tournament.id);
  await deleteDoc(tournRef);
}

export async function recreateTournamentInDb(
  original: Tournament | CompletedRoom,
  overrides?: Partial<Tournament>
): Promise<Tournament> {
  const newId = `cr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Default start time: 30 minutes from now if previous was in past
  const defaultStartTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const newTournament: Tournament = {
    id: newId,
    title: overrides?.title || original.title,
    mode: overrides?.mode || original.mode,
    map: overrides?.map || original.map,
    server: 'Pakistan',
    entryFee: overrides?.entryFee !== undefined ? overrides.entryFee : original.entryFee,
    prizePool: overrides?.prizePool !== undefined ? overrides.prizePool : original.prizePool,
    prizeBreakdown: overrides?.prizeBreakdown || original.prizeBreakdown,
    maxSlots: overrides?.maxSlots !== undefined ? overrides.maxSlots : original.maxSlots,
    registeredCount: 0,
    slots: [],
    players: [],
    startTime: overrides?.startTime || defaultStartTime,
    status: 'upcoming',
    roomId: overrides?.roomId || '',
    roomPassword: overrides?.roomPassword || '',
    roomRevealed: false,
    version: overrides?.version || (original as Tournament).version || 'Mobile Only',
    isCustomRoom: overrides?.isCustomRoom !== undefined ? overrides.isCustomRoom : (original as Tournament).isCustomRoom ?? true,
    customRoomType: (overrides?.customRoomType || (original as Tournament).customRoomType || original.mode) as any,
    rules: overrides?.rules || (original as Tournament).rules || {
      gunAttributes: false,
      characterSkills: true,
      limitedAmmo: true,
      emulatorAllowed: false,
      customNote: 'Custom Match Official Rules. Emulators blocked.',
    },
  };

  const docRef = doc(db, 'tournaments', newId);
  await setDoc(docRef, newTournament);
  return newTournament;
}

export function subscribeCompletedRooms(onUpdate: (rooms: CompletedRoom[]) => void) {
  const colRef = collection(db, 'completed_rooms');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: CompletedRoom[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as CompletedRoom);
      });
      // Sort latest completed first
      list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.error('Error subscribing to completed_rooms:', err);
      onUpdate([]);
    }
  );
}

// ==========================================
// 7. User Management (All Users & Block System)
// ==========================================

export function subscribeAllUsers(onUpdate: (users: UserProfile[]) => void) {
  const usersCol = collection(db, 'users');

  return onSnapshot(
    usersCol,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as UserProfile);
      });
      // Sort newest users first
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      onUpdate(list);
    },
    (err) => {
      console.error('Error subscribing to all users:', err);
      onUpdate([]);
    }
  );
}

export async function toggleBlockUserInDb(userId: string, isBlocked: boolean) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isBlocked,
    updatedAt: new Date().toISOString(),
  });
}

// ==========================================
// 8. Match Proofs & Result Distribution in Firestore
// ==========================================

export function subscribeMatchProofs(onUpdate: (proofs: MatchProofSubmission[]) => void) {
  const colRef = collection(db, 'match_proofs');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial mock proofs for admin testing
        for (const p of INITIAL_PENDING_PROOFS) {
          await setDoc(doc(db, 'match_proofs', p.id), p);
        }
        return;
      }

      const list: MatchProofSubmission[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as MatchProofSubmission);
      });

      list.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.id.localeCompare(a.id);
      });

      onUpdate(list);
    },
    (err) => {
      console.error('Error subscribing to match proofs:', err);
      onUpdate(INITIAL_PENDING_PROOFS);
    }
  );
}

export async function submitMatchProofInDb(proof: MatchProofSubmission) {
  const docRef = doc(db, 'match_proofs', proof.id);
  await setDoc(docRef, {
    ...proof,
    createdAt: new Date().toISOString(),
  });
}

export async function updateMatchProofInDb(
  proofId: string,
  updates: Partial<MatchProofSubmission>
) {
  const docRef = doc(db, 'match_proofs', proofId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteMatchProofInDb(proofId: string) {
  const docRef = doc(db, 'match_proofs', proofId);
  await deleteDoc(docRef);
}

export async function distributePrizeToWinnerInDb(options: {
  winnerIgn: string;
  winnerUid?: string;
  userId?: string;
  amountPkr: number;
  tournamentTitle?: string;
  tournamentId?: string;
  proofId?: string;
}): Promise<{ success: boolean; creditedUser?: string; message: string }> {
  let targetUserId = options.userId;

  // Search users collection if user ID isn't directly passed
  try {
    const usersCol = collection(db, 'users');
    const usersSnap = await getDocs(usersCol);
    usersSnap.forEach((userDoc) => {
      const u = userDoc.data();
      const docId = userDoc.id;
      if (
        (options.winnerUid && (u.playerUid === options.winnerUid || u.uid === options.winnerUid || docId === options.winnerUid)) ||
        (options.winnerIgn && u.playerIgn && u.playerIgn.trim().toLowerCase() === options.winnerIgn.trim().toLowerCase())
      ) {
        targetUserId = docId;
      }
    });
  } catch (err) {
    console.error('Error scanning users in Firestore:', err);
  }

  if (targetUserId) {
    try {
      const userRef = doc(db, 'users', targetUserId);
      await updateDoc(userRef, {
        walletBalance: increment(options.amountPkr),
        updatedAt: new Date().toISOString(),
      });

      const txDocRef = doc(collection(db, 'users', targetUserId, 'transactions'));
      await setDoc(txDocRef, {
        id: txDocRef.id,
        userId: targetUserId,
        type: 'prize_won',
        amount: options.amountPkr,
        description: options.tournamentTitle
          ? `Prize Won: ${options.tournamentTitle}`
          : `Tournament Winner Prize (${options.winnerIgn})`,
        timestamp: 'Just now',
        status: 'completed',
      });
    } catch (err) {
      console.error('Error crediting winner wallet in Firestore:', err);
    }
  }

  // Update proof if proofId is provided
  if (options.proofId) {
    try {
      const proofRef = doc(db, 'match_proofs', options.proofId);
      await updateDoc(proofRef, {
        status: 'approved',
        awardedPrize: options.amountPkr,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating proof status:', err);
    }
  }

  // Update tournament if tournamentId is provided
  if (options.tournamentId) {
    try {
      const tournRef = doc(db, 'tournaments', options.tournamentId);
      await updateDoc(tournRef, {
        winnerBooyahIgn: options.winnerIgn,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error completing tournament:', err);
    }
  }

  return {
    success: true,
    creditedUser: targetUserId,
    message: targetUserId
      ? `Rs. ${options.amountPkr} PKR successfully transferred to ${options.winnerIgn}'s wallet!`
      : `Prize of Rs. ${options.amountPkr} PKR marked distributed for ${options.winnerIgn}!`,
  };
}

// ==========================================
// 9. Batch Deletion Helpers
// ==========================================

export async function batchDeleteTournaments(tournamentIds: string[]) {
  await Promise.all(tournamentIds.map((id) => deleteDoc(doc(db, 'tournaments', id))));
}

export async function batchDeleteDeposits(depositIds: string[]) {
  await Promise.all(depositIds.map((id) => deleteDoc(doc(db, 'deposit_requests', id))));
}

export async function batchDeleteWithdrawals(withdrawalIds: string[]) {
  await Promise.all(withdrawalIds.map((id) => deleteDoc(doc(db, 'withdrawal_requests', id))));
}

export async function batchDeleteProofs(proofIds: string[]) {
  await Promise.all(proofIds.map((id) => deleteDoc(doc(db, 'match_proofs', id))));
}


