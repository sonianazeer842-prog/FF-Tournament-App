import React from 'react';
import { Clock, MapPin, Users, Coins, Key, CheckCircle, ChevronRight, Trophy } from 'lucide-react';
import { Tournament } from '../types/tournament';
import mapBermuda from '../assets/images/ff_map_bermuda_1792304114277.jpg';
import { sounds } from '../utils/audio';

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
  onJoin: (tournament: Tournament) => void;
  isRegistered: boolean;
  language: 'ur' | 'en';
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onSelect,
  onJoin,
  isRegistered,
  language,
}) => {
  const isFull = tournament.registeredCount >= tournament.maxSlots;
  const fillPercentage = Math.min(100, Math.round((tournament.registeredCount / tournament.maxSlots) * 100));

  // Human readable time
  const formatStartTime = (iso: string) => {
    try {
      const date = new Date(iso);
      const diffMs = date.getTime() - Date.now();
      if (diffMs <= 0 && tournament.status === 'completed') {
        return language === 'ur' ? 'Match Khatam' : 'Match Ended';
      }
      if (diffMs <= 0 && tournament.status === 'live') {
        return language === 'ur' ? 'Abhi Khel Raha Hai' : 'Match Live Now';
      }
      const mins = Math.round(diffMs / 60000);
      if (mins <= 60) {
        return `${mins}m ${language === 'ur' ? 'baad' : 'away'}`;
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="group relative bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between">
      {/* Top Banner Image with Overlay */}
      <div className="relative h-36 w-full overflow-hidden bg-neutral-950">
        <img
          src={mapBermuda}
          alt={tournament.map}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />

        {/* Unboxed Metadata in Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-neutral-200 bg-neutral-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-neutral-800">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{tournament.map}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-amber-400 font-semibold">{tournament.mode}</span>
          </div>

          <div className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-sm border border-neutral-800">
            {tournament.status === 'room_open' && (
              <span className="text-emerald-400 flex items-center gap-1">
                <Key className="w-3 h-3" /> Room Open
              </span>
            )}
            {tournament.status === 'upcoming' && (
              <span className="text-neutral-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> {formatStartTime(tournament.startTime)}
              </span>
            )}
            {tournament.status === 'live' && <span className="text-orange-400">Match In Progress</span>}
            {tournament.status === 'completed' && <span className="text-neutral-400">Completed</span>}
          </div>
        </div>

        {/* Device Restriction Tag */}
        <div className="absolute bottom-2 left-3 text-xs text-neutral-400 font-medium">
          <span>{tournament.version}</span>
          <span className="mx-1 text-neutral-600">·</span>
          <span>{tournament.rules.limitedAmmo ? 'Limited Ammo' : 'Unlimited Ammo'}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => {
              sounds.playClick();
              onSelect(tournament);
            }}
            className="text-base sm:text-lg font-display font-bold text-white hover:text-amber-400 transition-colors cursor-pointer mb-2 line-clamp-1"
          >
            {tournament.title}
          </h3>

          {/* Quick Prize & Bounty Matrix */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-800/80 my-3 text-xs">
            <div>
              <span className="text-neutral-500 block uppercase text-[10px] tracking-wider font-semibold">Total Prize</span>
              <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
                {tournament.prizePool.toLocaleString()} Coins
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block uppercase text-[10px] tracking-wider font-semibold">Per Kill Bounty</span>
              <span className="text-sm font-semibold text-neutral-200 font-mono tabular-nums">
                +{tournament.prizeBreakdown.perKill} Coins
              </span>
            </div>
          </div>

          {/* Slots Fill Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-500" />
                <span>
                  {tournament.mode === 'Solo' ? 'Players' : 'Squads'}:{' '}
                  <strong className="text-neutral-200 font-mono tabular-nums">{tournament.registeredCount}</strong> /{' '}
                  <span className="font-mono tabular-nums">{tournament.maxSlots}</span>
                </span>
              </span>
              <span className="font-mono tabular-nums text-neutral-400">
                {fillPercentage}% {isFull ? '(Full)' : 'Filled'}
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? 'bg-red-500' : fillPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Winner highlight if completed */}
          {tournament.status === 'completed' && tournament.winnerTeam && (
            <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-2.5 mb-3 text-xs flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-neutral-300 truncate">
                Booyah: <strong className="text-amber-300">{tournament.winnerTeam}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onSelect(tournament);
            }}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors text-center"
          >
            {language === 'ur' ? 'Details & Slots' : 'Details & Slots'}
          </button>

          {isRegistered ? (
            <button
              onClick={() => {
                sounds.playClick();
                onSelect(tournament);
              }}
              className="py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'Registered' : 'Registered'}</span>
            </button>
          ) : tournament.status === 'completed' ? (
            <button
              onClick={() => {
                sounds.playClick();
                onSelect(tournament);
              }}
              className="py-2 px-3 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-400 cursor-not-allowed"
              disabled
            >
              {language === 'ur' ? 'Match Ended' : 'Ended'}
            </button>
          ) : isFull ? (
            <button
              onClick={() => {
                sounds.playClick();
                onSelect(tournament);
              }}
              className="py-2 px-3 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-400 cursor-not-allowed"
              disabled
            >
              {language === 'ur' ? 'Slots Full' : 'Slots Full'}
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playClick();
                onJoin(tournament);
              }}
              className="py-2 px-4 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>{tournament.entryFee === 0 ? 'Free Entry' : `${tournament.entryFee} Coins`}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
