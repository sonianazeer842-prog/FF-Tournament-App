import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Shield, Users, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tournament, PlayerSlot } from '../types/tournament';
import { sounds } from '../utils/audio';

interface JoinTournamentModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onSuccess: (tournamentId: string, slot: PlayerSlot, fee: number) => void;
  walletBalance: number;
  openWallet: () => void;
  language: 'ur' | 'en';
  initialIgn?: string;
  initialUid?: string;
}

export const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({
  tournament,
  onClose,
  onSuccess,
  walletBalance,
  openWallet,
  language,
  initialIgn = 'SOUL・Predator',
  initialUid = '284918294',
}) => {
  const [ign, setIgn] = useState(initialIgn);
  const [uid, setUid] = useState(initialUid);
  const [teamName, setTeamName] = useState('Team Soul');
  const [teammate1, setTeammate1] = useState('SOUL・Blaze');
  const [teammate2, setTeammate2] = useState('SOUL・Viper');
  const [teammate3, setTeammate3] = useState('SOUL・Echo');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (tournament) {
      if (initialIgn) setIgn(initialIgn);
      if (initialUid) setUid(initialUid);
    }
  }, [tournament, initialIgn, initialUid]);

  if (!tournament) return null;

  const hasEnoughBalance = walletBalance >= tournament.entryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) {
      setError(language === 'ur' ? 'Free Fire In-Game Name (IGN) likhein' : 'Please enter your In-Game Name');
      return;
    }
    if (!uid.trim() || uid.length < 6) {
      setError(language === 'ur' ? 'Sahi Free Fire UID enter karein (kam az kam 6 numbers)' : 'Please enter a valid numeric Free Fire UID');
      return;
    }
    if (!hasEnoughBalance) {
      setError(language === 'ur' ? 'Wallet me balance kam hai. Pehle coins add karein.' : 'Insufficient wallet balance. Please top-up.');
      return;
    }

    const members =
      tournament.mode === 'Solo'
        ? [ign]
        : tournament.mode === 'Duo'
        ? [ign, teammate1 || 'Teammate 2']
        : [ign, teammate1 || 'Teammate 2', teammate2 || 'Teammate 3', teammate3 || 'Teammate 4'];

    const newSlot: PlayerSlot = {
      slotNumber: tournament.registeredCount + 1,
      teamName: tournament.mode === 'Solo' ? undefined : teamName || `${ign}'s Squad`,
      leaderIgn: ign,
      leaderUid: uid,
      members,
      registeredAt: 'Just now',
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981'],
      });
    } catch {
      // ignore
    }

    sounds.playJoin();
    onSuccess(tournament.id, newSlot, tournament.entryFee);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider block">
              {tournament.mode} Match Registration
            </span>
            <h2 className="text-lg font-display font-bold text-white truncate max-w-sm">{tournament.title}</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Fee Indicator */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-500" />
            <span className="text-neutral-400">{language === 'ur' ? 'Aapka Balance:' : 'Your Balance:'}</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">{walletBalance} Coins</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">{language === 'ur' ? 'Entry Fee:' : 'Entry Fee:'}</span>
            <span className="font-mono font-bold text-neutral-100 tabular-nums">
              {tournament.entryFee === 0 ? 'FREE' : `${tournament.entryFee} Coins`}
            </span>
          </div>
        </div>

        {!hasEnoughBalance && (
          <div className="p-4 bg-red-950/30 border-b border-red-900/40 text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{language === 'ur' ? 'Wallet me kam az kam entry fee honi chahiye.' : 'Insufficient funds for entry.'}</span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                openWallet();
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-red-800/80 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              {language === 'ur' ? 'Top-Up Coins' : 'Deposit Coins'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Captain / Solo IGN */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              {language === 'ur' ? 'Free Fire In-Game Name (IGN)' : 'Captain In-Game Name (IGN)'}
            </label>
            <input
              type="text"
              required
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="e.g. SOUL・Predator"
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono transition-colors"
            />
          </div>

          {/* Free Fire Numeric UID */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              {language === 'ur' ? 'Free Fire Numeric UID (In-Game Profile ID)' : 'Free Fire Profile UID'}
            </label>
            <input
              type="text"
              required
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. 284918294"
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500 font-mono transition-colors"
            />
          </div>

          {/* Squad Specific Fields */}
          {tournament.mode !== 'Solo' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {language === 'ur' ? 'Squad / Team Ka Naam' : 'Squad / Team Name'}
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Team Falcon"
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="block text-xs text-neutral-400 font-semibold">
                  {language === 'ur' ? 'Squad Sathiyon ke In-Game Names (IGNs):' : 'Teammate In-Game Names (IGNs):'}
                </span>

                <input
                  type="text"
                  value={teammate1}
                  onChange={(e) => setTeammate1(e.target.value)}
                  placeholder="Player 2 IGN (e.g. SOUL・Blaze)"
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                />

                {tournament.mode === 'Squad' && (
                  <>
                    <input
                      type="text"
                      value={teammate2}
                      onChange={(e) => setTeammate2(e.target.value)}
                      placeholder="Player 3 IGN (e.g. SOUL・Viper)"
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <input
                      type="text"
                      value={teammate3}
                      onChange={(e) => setTeammate3(e.target.value)}
                      placeholder="Player 4 IGN (e.g. SOUL・Echo)"
                      className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </>
                )}
              </div>
            </>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={!hasEnoughBalance}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
                hasEnoughBalance
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                {tournament.entryFee === 0
                  ? language === 'ur'
                    ? 'Free Me Slot Book Karein'
                    : 'Confirm Free Slot Booking'
                  : language === 'ur'
                  ? `Pay ${tournament.entryFee} Coins & Confirm Slot`
                  : `Pay ${tournament.entryFee} Coins & Confirm Slot`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
