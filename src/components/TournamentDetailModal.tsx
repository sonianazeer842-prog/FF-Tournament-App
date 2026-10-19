import React, { useState } from 'react';
import { X, Copy, Check, Clock, Trophy, Shield, Users, MapPin, Key, AlertTriangle, ExternalLink, Flame } from 'lucide-react';
import { Tournament } from '../types/tournament';
import mapBermuda from '../assets/images/ff_map_bermuda_1792304114277.jpg';
import trophyImg from '../assets/images/ff_esports_trophy_1792304112984.jpg';
import { sounds } from '../utils/audio';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onJoin: (tournament: Tournament) => void;
  onSubmitProof: (tournament: Tournament) => void;
  isRegistered: boolean;
  language: 'ur' | 'en';
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  onClose,
  onJoin,
  onSubmitProof,
  isRegistered,
  language,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'prizes' | 'rules'>('slots');

  if (!tournament) return null;

  const handleCopyId = () => {
    if (!tournament.roomId) return;
    navigator.clipboard.writeText(tournament.roomId);
    sounds.playCopy();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPass = () => {
    if (!tournament.roomPassword) return;
    navigator.clipboard.writeText(tournament.roomPassword);
    sounds.playCopy();
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const isFull = tournament.registeredCount >= tournament.maxSlots;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-neutral-950 overflow-hidden">
          <img
            src={tournament.imageUrl || mapBermuda}
            alt={tournament.title || tournament.map}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Details */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <span>{tournament.map}</span>
              <span className="text-neutral-500">·</span>
              <span>{tournament.mode} Match</span>
              <span className="text-neutral-500">·</span>
              <span>{tournament.version}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white">{tournament.title}</h2>
          </div>
        </div>

        {/* Room ID & Password High Security Box */}
        <div className="p-4 sm:p-6 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-white text-sm sm:text-base">
                {language === 'ur' ? 'Custom Room Credentials' : 'Custom Room Access'}
              </h3>
            </div>
            {tournament.roomRevealed ? (
              <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Room Credentials Active
              </span>
            ) : (
              <span className="text-xs text-neutral-400 font-mono">
                {language === 'ur' ? 'Match se 15m pehle unlock hogi' : 'Unlocks 15m prior to start'}
              </span>
            )}
          </div>

          {tournament.roomRevealed && isRegistered ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-4">
              {/* Room ID */}
              <div className="flex items-center justify-between bg-neutral-950 px-3 py-2.5 rounded-lg border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Room ID</span>
                  <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">{tournament.roomId}</span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                  title="Copy Room ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Room Password */}
              <div className="flex items-center justify-between bg-neutral-950 px-3 py-2.5 rounded-lg border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Password</span>
                  <span className="text-sm font-mono font-bold text-neutral-100">{tournament.roomPassword}</span>
                </div>
                <button
                  onClick={handleCopyPass}
                  className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                  title="Copy Room Password"
                >
                  {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="sm:col-span-2 text-xs text-neutral-400 mt-1">
                {language === 'ur'
                  ? 'Garena Free Fire kholein -> Custom -> Search Room ID -> Paste Password -> Apne assigned squad slot me baithein.'
                  : 'Open Free Fire -> Custom -> Search Room ID -> Enter Password -> Sit inside your assigned squad slot.'}
              </p>
            </div>
          ) : !isRegistered ? (
            <div className="bg-neutral-900/80 border border-dashed border-neutral-800 rounded-xl p-4 text-center">
              <p className="text-xs sm:text-sm text-neutral-300 mb-2">
                {language === 'ur'
                  ? 'Room ID aur Password sirf registered khilariyon ko nazar ata hai.'
                  : 'Room credentials are encrypted and visible only to confirmed registered contenders.'}
              </p>
              {!isFull && tournament.status !== 'completed' && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onJoin(tournament);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950"
                >
                  {language === 'ur' ? 'Abhi Register Karein' : 'Register Now to Unlock'}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 text-center text-xs text-neutral-400">
              <Clock className="w-4 h-4 text-amber-500 inline mr-2" />
              {language === 'ur'
                ? 'Aap registered hain! Match time se 15 minute pehle organizer room ID yahan live karega.'
                : 'You are registered! The organizer will broadcast credentials 15 minutes before match start.'}
            </div>
          )}
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-neutral-800 px-6 pt-3 bg-neutral-900">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('slots');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'slots'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tournament.mode === 'Solo' ? 'Player Slots' : 'Registered Squads'} ({tournament.registeredCount}/{tournament.maxSlots})
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('prizes');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'prizes'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {language === 'ur' ? 'Prize Distribution' : 'Prize Pool & Bounties'}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('rules');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {language === 'ur' ? 'Match Rules & Anti-Cheat' : 'Match Rules & Anti-Cheat'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
          {activeTab === 'slots' && (
            <div className="space-y-2">
              {tournament.slots.map((slot) => (
                <div
                  key={slot.slotNumber}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-amber-400 tabular-nums">
                      #{slot.slotNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-neutral-200">
                        {slot.teamName || slot.leaderIgn}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        UID: <span className="font-mono text-neutral-300">{slot.leaderUid}</span>
                        {slot.members && slot.members.length > 0 && (
                          <span className="hidden sm:inline"> · Roster: {slot.members.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-[11px] font-mono">{slot.registeredAt}</span>
                </div>
              ))}

              {Array.from({ length: tournament.maxSlots - tournament.slots.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/40 border border-dashed border-neutral-800/80 text-xs text-neutral-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-center font-mono tabular-nums text-neutral-500">
                      #{tournament.slots.length + idx + 1}
                    </span>
                    <span>{language === 'ur' ? 'Khali Slot (Available)' : 'Vacant Slot (Available)'}</span>
                  </div>
                  <span className="text-[11px] text-amber-500/80 font-medium">Open</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'prizes' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 p-4 rounded-xl border border-amber-900/30">
                <img
                  src={trophyImg}
                  alt="Championship Trophy"
                  className="w-16 h-16 rounded-lg object-cover border border-amber-500/30 shrink-0"
                />
                <div>
                  <span className="text-xs text-neutral-400 uppercase font-semibold">Total Prize Pool</span>
                  <div className="text-2xl font-display font-black text-amber-400 font-mono tabular-nums">
                    {tournament.prizePool.toLocaleString()} Coins
                  </div>
                  <span className="text-xs text-neutral-400">
                    {language === 'ur' ? 'Instant withdrawable ba-zariye EasyPaisa / JazzCash / UPI' : 'Instant withdrawable balance'}
                  </span>
                </div>
              </div>

              <div className="border border-neutral-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Position / Rank</th>
                      <th className="py-2.5 px-3">Prize Distribution</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono">
                    <tr className="bg-neutral-900/60">
                      <td className="py-2.5 px-3 font-semibold text-amber-400 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> 1st Place (Booyah)
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-300 tabular-nums">
                        {tournament.prizeBreakdown.first} Coins
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-300">12 Pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-200">2nd Place</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-200 tabular-nums">
                        {tournament.prizeBreakdown.second} Coins
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-400">9 Pts</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-neutral-300">3rd Place</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-300 tabular-nums">
                        {tournament.prizeBreakdown.third} Coins
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-400">8 Pts</td>
                    </tr>
                    {tournament.prizeBreakdown.fourthToTenth && (
                      <tr>
                        <td className="py-2.5 px-3 text-neutral-400">4th - 10th Place</td>
                        <td className="py-2.5 px-3 text-neutral-300 tabular-nums">
                          {tournament.prizeBreakdown.fourthToTenth} Coins each
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-400">7 - 1 Pts</td>
                      </tr>
                    )}
                    <tr className="bg-amber-950/20">
                      <td className="py-2.5 px-3 font-semibold text-orange-400">Per Kill Bounty</td>
                      <td className="py-2.5 px-3 font-bold text-orange-300 tabular-nums">
                        +{tournament.prizeBreakdown.perKill} Coins / Kill
                      </td>
                      <td className="py-2.5 px-3 text-right text-orange-400">+1 Pt / Kill</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3 text-xs text-neutral-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Gun Attributes</span>
                  <strong className={tournament.rules.gunAttributes ? 'text-amber-400' : 'text-neutral-200'}>
                    {tournament.rules.gunAttributes ? 'Active (Skin Buffs ON)' : 'OFF (Pure Esports Fair Aim)'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Character Skills</span>
                  <strong className="text-neutral-200">
                    {tournament.rules.characterSkills ? 'Allowed (Tactical Skills)' : 'Disabled'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Limited Ammo</span>
                  <strong className="text-neutral-200">
                    {tournament.rules.limitedAmmo ? 'Yes (Classic Ammo Rules)' : 'No (Infinite Ammo)'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Emulator / PC Players</span>
                  <strong className={tournament.rules.emulatorAllowed ? 'text-neutral-300' : 'text-red-400'}>
                    {tournament.rules.emulatorAllowed ? 'Allowed' : 'STRICTLY BLOCKED'}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 font-semibold block mb-1">Custom Guidelines:</span>
                <p className="text-neutral-300">{tournament.rules.customNote}</p>
              </div>

              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Zero-Tolerance Cheating Policy:</strong> Teaming, aimbot, config injector, or flying hacks will lead to immediate room kick, entry forfeiture, and permanent Free Fire UID ban in this platform.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-neutral-500 block">Entry Fee</span>
            <span className="text-sm sm:text-base font-bold font-mono text-amber-400">
              {tournament.entryFee === 0 ? 'FREE ENTRY' : `${tournament.entryFee} Coins`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRegistered && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onSubmitProof(tournament);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                {language === 'ur' ? 'Claim Win / Proof Submit' : 'Submit Match Proof'}
              </button>
            )}

            {!isRegistered && !isFull && tournament.status !== 'completed' && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onJoin(tournament);
                }}
                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm transition-all"
              >
                {language === 'ur' ? 'Register Slot' : 'Register Slot'}
              </button>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              {language === 'ur' ? 'Band Karein' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
