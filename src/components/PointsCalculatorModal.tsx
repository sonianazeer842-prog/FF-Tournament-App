import React, { useState } from 'react';
import { Trophy, Crosshair, Calculator, ShieldCheck, Flame } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PointsCalculatorProps {
  language: 'ur' | 'en';
}

export const PointsCalculator: React.FC<PointsCalculatorProps> = ({ language }) => {
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [kills, setKills] = useState<number>(8);

  const placementPointsMap: { [rank: number]: number } = {
    1: 12,
    2: 9,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1,
    11: 0,
    12: 0,
  };

  const placementPts = placementPointsMap[selectedRank] || 0;
  const killPts = kills * 1;
  const totalScore = placementPts + killPts;

  const getTier = (score: number) => {
    if (score >= 20) return { label: 'S+ Grandmaster Tier', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score >= 15) return { label: 'Heroic Tier', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    if (score >= 10) return { label: 'Diamond Tier', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    return { label: 'Challenger Tier', color: 'text-neutral-400 bg-neutral-900 border-neutral-800' };
  };

  const tier = getTier(totalScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
          <Calculator className="w-4 h-4" />
          <span>Official FFWS Points System</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white mb-2">
          {language === 'ur'
            ? 'Free Fire Esports Points Calculator & Rulebook'
            : 'Official FFWS Points Calculator & Rulebook'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
          {language === 'ur'
            ? 'Garena Free Fire World Series (FFWS) ka official scoring system yahan mojood hai. Match me aane wale rank aur kills enter karke apna live score check karein.'
            : 'Interactive FFWS point tabulation: test placement points, kill bounties, and aggregate tournament standings in real-time.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Calculator (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span>{language === 'ur' ? 'Live Match Score Simulator' : 'Live Match Score Simulator'}</span>
          </h3>

          {/* Rank Slider / Selector */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-2">
              <span>{language === 'ur' ? 'Match Rank / Position:' : 'Match Rank / Placement:'}</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                Rank #{selectedRank} {selectedRank === 1 ? '(Booyah!)' : ''}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const rankNum = i + 1;
                const isSelected = selectedRank === rankNum;
                return (
                  <button
                    key={rankNum}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedRank(rankNum);
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    #{rankNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kills Counter */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-2">
              <span>{language === 'ur' ? 'Squad / Player Kills:' : 'Total Match Kills:'}</span>
              <span className="font-mono text-orange-400 font-bold tabular-nums">{kills} Kills</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={30}
                value={kills}
                onChange={(e) => setKills(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-neutral-950 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-sm font-bold text-white w-8 text-right tabular-nums">{kills}</span>
            </div>
          </div>

          {/* Calculated Output Breakdown Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Placement Pts</span>
                <span className="text-lg font-mono font-bold text-amber-400 tabular-nums">+{placementPts}</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Kill Pts</span>
                <span className="text-lg font-mono font-bold text-orange-400 tabular-nums">+{killPts}</span>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Total Match Score</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400 tabular-nums">{totalScore}</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border text-xs text-center font-bold ${tier.color}`}>
              {tier.label} ({totalScore} Total Esports Points)
            </div>
          </div>
        </div>

        {/* Official FFWS Points Matrix Table (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Garena FFWS Standard</span>
          </div>
          <h3 className="text-base font-display font-bold text-white">Points Reference Matrix</h3>

          <div className="border border-neutral-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Position</th>
                  <th className="py-2 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono">
                <tr className="bg-amber-950/20 text-amber-300 font-bold">
                  <td className="py-1.5 px-3">1st (Booyah)</td>
                  <td className="py-1.5 px-3 text-right">12 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-200">2nd Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-300">9 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-300">3rd Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">8 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-300">4th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">7 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-300">5th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">6 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-400">6th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">5 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-400">7th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">4 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-400">8th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">3 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-400">9th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">2 Pts</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-neutral-400">10th Place</td>
                  <td className="py-1.5 px-3 text-right text-neutral-400">1 Pt</td>
                </tr>
                <tr className="text-neutral-500">
                  <td className="py-1.5 px-3">11th & 12th Place</td>
                  <td className="py-1.5 px-3 text-right">0 Pts</td>
                </tr>
                <tr className="bg-orange-950/20 text-orange-300 font-semibold">
                  <td className="py-2 px-3">Every Single Kill</td>
                  <td className="py-2 px-3 text-right">+1 Pt / Kill</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
