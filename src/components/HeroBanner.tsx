import React from 'react';
import { Search, Flame, Users, Award, ShieldCheck, Sparkles } from 'lucide-react';
import heroImg from '../assets/images/ff_tournament_hero_1792304112893.jpg';
import { sounds } from '../utils/audio';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  totalTournaments: number;
  totalPrizeDistributed: number;
  openGuide: () => void;
  language: 'ur' | 'en';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedMode,
  setSelectedMode,
  totalTournaments,
  totalPrizeDistributed,
  openGuide,
  language,
}) => {
  const modes = ['All', 'Squad', 'Solo', 'Duo', 'Clash Squad'];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 mb-8 shadow-2xl">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Free Fire Tournament Arena"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 opacity-40 mix-blend-luminosity filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
        {/* Subtle unboxed kicker without pill capsules */}
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Garena Free Fire Official Format</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-400">Battle Royale & Clash Squad</span>
          <span className="text-neutral-600">·</span>
          <span className="text-emerald-400">Verified Match Payouts</span>
        </div>

        {/* Headline with text-wrap: balance */}
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4 max-w-3xl leading-[1.15]" style={{ textWrap: 'balance' }}>
          {language === 'ur'
            ? 'Free Fire Esports Tournaments Khelein Aur Daily Cash Inam Jeetein'
            : 'Compete in Daily Free Fire Esports Tournaments & Win Real Bounties'}
        </h1>

        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mb-6 leading-relaxed">
          {language === 'ur'
            ? 'Custom Room ID & Password seedha app me hasil karein. Squad aur Solo matches, automated FFWS scoring rules, aur direct EasyPaisa / JazzCash instant prize withdrawal system.'
            : 'Get instant Custom Room credentials 15 minutes before match time. Compete in Solo, Duo, Squad, and Clash Squad showdowns with automated FFWS scoring and direct withdrawals.'}
        </p>

        {/* Action Controls & Guide Trigger */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => {
              sounds.playClick();
              openGuide();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-semibold border border-neutral-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{language === 'ur' ? 'Tournament Kaise Organise Karein? (Step Guide)' : 'How to Organize Tournaments? (Step Guide)'}</span>
          </button>
        </div>

        {/* Search & Filter Strip */}
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ur' ? 'Tournament ka naam ya map talash karein...' : 'Search by tournament title or map...'}
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs sm:text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Interactive Mode Segmented Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sounds.playClick();
                  setSelectedMode(mode);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  selectedMode === mode
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Quantitative Proof Strip */}
        <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center gap-y-3 gap-x-8 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <span>Active Contenders: <strong className="text-neutral-200 font-mono tabular-nums">1,480+</strong></span>
          </div>
          <span className="text-neutral-700">·</span>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Tournaments Hosted: <strong className="text-neutral-200 font-mono tabular-nums">{totalTournaments}</strong></span>
          </div>
          <span className="text-neutral-700">·</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Prize Pool Disbursed: <strong className="text-amber-400 font-mono tabular-nums">{totalPrizeDistributed.toLocaleString()} Coins</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
