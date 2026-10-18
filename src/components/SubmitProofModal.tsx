import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Trophy, Crosshair } from 'lucide-react';
import { Tournament, MatchProofSubmission } from '../types/tournament';
import { sounds } from '../utils/audio';

interface SubmitProofModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onSubmit: (submission: MatchProofSubmission) => void;
  language: 'ur' | 'en';
}

export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
  tournament,
  onClose,
  onSubmit,
  language,
}) => {
  const [playerIgn, setPlayerIgn] = useState('SOUL・Predator');
  const [playerUid, setPlayerUid] = useState('284918294');
  const [rank, setRank] = useState(1);
  const [kills, setKills] = useState(5);
  const [fileName, setFileName] = useState('ff_match_result_screenshot.png');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!tournament) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const estimatedPrize =
      (rank === 1
        ? tournament.prizeBreakdown.first
        : rank === 2
        ? tournament.prizeBreakdown.second
        : rank === 3
        ? tournament.prizeBreakdown.third
        : (tournament.prizeBreakdown.fourthToTenth || 0)) +
      kills * tournament.prizeBreakdown.perKill;

    const newProof: MatchProofSubmission = {
      id: `prf-${Date.now()}`,
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      playerIgn,
      playerUid,
      claimedRank: rank,
      claimedKills: kills,
      screenshotUrl: '/src/assets/images/ff_map_bermuda_1792304114277.jpg',
      submissionTime: 'Just now',
      status: 'pending',
      awardedPrize: estimatedPrize,
    };

    sounds.playVictory();
    setIsSuccess(true);
    setTimeout(() => {
      onSubmit(newProof);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider block">
              Match Proof & Prize Claim
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {language === 'ur' ? 'Proof Kamiyabi Se Submit Ho Gaya!' : 'Proof Submitted Successfully!'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {language === 'ur'
                ? 'Tournament host aapka screenshot aur kills verify kar ke wallet me inam transfer kar dega.'
                : 'Tournament referee is verifying your screenshot and kill count. Balance will be credited automatically.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs text-neutral-300">
              <p>
                {language === 'ur'
                  ? 'Garena Free Fire match end ka screenshot upload karein jis me aapka In-Game Name, kills aur rank saaf dikh rahi ho.'
                  : 'Submit your end-game match recap screenshot clearly showing your In-Game Name, team rank, and kills.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Your IGN</label>
                <input
                  type="text"
                  required
                  value={playerIgn}
                  onChange={(e) => setPlayerIgn(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Free Fire UID</label>
                <input
                  type="text"
                  required
                  value={playerUid}
                  onChange={(e) => setPlayerUid(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rank Placement</span>
                </label>
                <select
                  value={rank}
                  onChange={(e) => setRank(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>Rank 1 (Booyah #1)</option>
                  <option value={2}>Rank 2 (#2)</option>
                  <option value={3}>Rank 3 (#3)</option>
                  <option value={4}>Rank 4 (#4)</option>
                  <option value={5}>Rank 5 (#5)</option>
                  <option value={6}>Rank 6-12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-orange-500" />
                  <span>Kills Count</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={kills}
                  onChange={(e) => setKills(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Screenshot file upload zone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Match Summary Screenshot' : 'Match Summary Screenshot'}
              </label>
              <div className="border border-dashed border-neutral-800 hover:border-neutral-700 bg-neutral-950 rounded-xl p-4 text-center cursor-pointer">
                <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                <span className="text-xs font-medium text-neutral-300 block">{fileName}</span>
                <span className="text-[11px] text-neutral-500">PNG or JPG up to 10MB</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ur' ? 'Submit Claim & Inam Hasil Karein' : 'Submit Proof & Claim Bounty'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
