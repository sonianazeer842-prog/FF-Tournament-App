export type MatchMode = 'Solo' | 'Duo' | 'Squad' | 'Clash Squad';
export type MatchMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'NexTerra';
export type MatchStatus = 'upcoming' | 'room_open' | 'live' | 'completed';

export interface PlayerSlot {
  slotNumber: number;
  teamName?: string;
  leaderIgn: string;
  leaderUid: string;
  members?: string[];
  registeredAt: string;
  userId?: string;
}

export interface PrizeBreakdown {
  first: number;
  second: number;
  third: number;
  fourthToTenth?: number;
  perKill: number;
}

export interface Tournament {
  id: string;
  title: string;
  mode: MatchMode;
  map: MatchMap;
  server: string;
  entryFee: number; // In PKR (1 Coin = 1 PKR)
  prizePool: number; // In PKR
  prizeBreakdown: PrizeBreakdown;
  maxSlots: number;
  registeredCount: number;
  slots: PlayerSlot[];
  players?: string[]; // Array of registered player Auth UIDs to prevent double registration
  startTime: string; // ISO string
  status: MatchStatus;
  roomId?: string;
  roomPassword?: string;
  roomRevealed: boolean;
  version: 'Mobile Only' | 'All Devices' | 'PC Blocked';
  rules: {
    gunAttributes: boolean;
    characterSkills: boolean;
    limitedAmmo: boolean;
    emulatorAllowed: boolean;
    customNote?: string;
  };
  winnerTeam?: string;
  winnerBooyahIgn?: string;
}

export interface MatchProofSubmission {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  userId?: string;
  playerIgn: string;
  playerUid: string;
  claimedRank: number;
  claimedKills: number;
  screenshotUrl?: string;
  submissionTime: string;
  status: 'pending' | 'approved' | 'rejected';
  awardedPrize?: number;
}

export interface DepositRequest {
  id: string;
  userId?: string; // Auth UID of player
  playerIgn: string;
  playerUid: string;
  amountPkr: number;
  method: 'EasyPaisa' | 'JazzCash';
  senderNumber: string;
  senderName: string;
  trxId: string; // 11-12 digit TID from EasyPaisa / JazzCash SMS
  screenshotName?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface WithdrawalRequest {
  id: string;
  userId?: string; // Auth UID of player
  playerIgn: string;
  playerUid: string;
  amountPkr: number;
  method: 'EasyPaisa' | 'JazzCash';
  accountNumber: string;
  accountTitle: string;
  submittedAt: string;
  status: 'pending' | 'completed' | 'rejected';
  referenceId?: string;
}

export interface AdminPaymentSettings {
  easypaisaNumber: string;
  easypaisaTitle: string;
  jazzcashNumber: string;
  jazzcashTitle: string;
  adminPin: string;
  supportWhatsapp: string;
  merchantApiEnabled?: boolean;
  merchantApiKey?: string;
  merchantStoreId?: string;
}

export interface WalletTransaction {
  id: string;
  userId?: string;
  type: 'deposit' | 'entry_fee' | 'prize_won' | 'withdrawal';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
  paymentMethod?: 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';
  trxId?: string;
}

export interface GuideStep {
  id: number;
  titleUrdu: string;
  titleEn: string;
  descUrdu: string;
  descEn: string;
  bulletPointsUrdu: string[];
  bulletPointsEn: string[];
  proTipUrdu: string;
  proTipEn: string;
  iconName: string;
}

export interface UserProfile {
  id: string; // Auth UID
  email: string;
  displayName: string; // Free Fire IGN
  ffUid: string; // Free Fire numeric Game UID
  phone?: string;
  walletBalance: number;
  role: 'player' | 'admin';
  registeredTournaments?: string[];
  createdAt?: string;
  updatedAt?: string;
}
