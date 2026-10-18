import React, { useState } from 'react';
import { PlusCircle, Key, CheckCircle, Trophy, Shield, Sliders, Radio, AlertCircle, Sparkles, Check, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tournament, MatchMode, MatchMap, MatchProofSubmission } from '../types/tournament';
import { sounds } from '../utils/audio';

interface OrganizerStudioProps {
  tournaments: Tournament[];
  onCreateTournament: (tournament: Tournament) => void;
  onUpdateRoomCredentials: (tournamentId: string, roomId: string, pass: string, revealNow: boolean) => void;
  onDeclareWinner: (tournamentId: string, winnerTeam: string, winnerIgn: string) => void;
  pendingProofs: MatchProofSubmission[];
  onApproveProof: (proofId: string) => void;
  onRejectProof: (proofId: string) => void;
  language: 'ur' | 'en';
}

export const OrganizerStudio: React.FC<OrganizerStudioProps> = ({
  tournaments,
  onCreateTournament,
  onUpdateRoomCredentials,
  onDeclareWinner,
  pendingProofs,
  onApproveProof,
  onRejectProof,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'rooms' | 'proofs' | 'results'>('create');

  // Form states for creating tournament
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<MatchMode>('Squad');
  const [map, setMap] = useState<MatchMap>('Bermuda');
  const [entryFee, setEntryFee] = useState(50);
  const [prizePool, setPrizePool] = useState(2500);
  const [perKill, setPerKill] = useState(25);
  const [maxSlots, setMaxSlots] = useState(12);
  const [startTimeMinutes, setStartTimeMinutes] = useState(60);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [gunAttributes, setGunAttributes] = useState(false);
  const [limitedAmmo, setLimitedAmmo] = useState(true);
  const [characterSkills, setCharacterSkills] = useState(true);
  const [emulatorAllowed, setEmulatorAllowed] = useState(false);
  const [customNote, setCustomNote] = useState('Official FFWS rules. Emulators strictly blocked.');
  const [successMsg, setSuccessMsg] = useState('');

  // Room broadcast form
  const [selectedTournForRoom, setSelectedTournForRoom] = useState(tournaments[0]?.id || '');
  const [broadcastRoomId, setBroadcastRoomId] = useState('');
  const [broadcastPass, setBroadcastPass] = useState('');

  // Winner declaration form
  const [selectedTournForResult, setSelectedTournForResult] = useState(tournaments[0]?.id || '');
  const [winnerTeamInput, setWinnerTeamInput] = useState('');
  const [winnerIgnInput, setWinnerIgnInput] = useState('');

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

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
      startTime: new Date(Date.now() + 1000 * 60 * startTimeMinutes).toISOString(),
      status: 'upcoming',
      roomId: roomId.trim() || `FF-${Math.floor(100000 + Math.random() * 900000)}`,
      roomPassword: roomPassword.trim() || `PASS_${Math.floor(1000 + Math.random() * 9000)}`,
      roomRevealed: false,
      version: emulatorAllowed ? 'All Devices' : 'Mobile Only',
      rules: {
        gunAttributes,
        characterSkills,
        limitedAmmo,
        emulatorAllowed,
        customNote,
      },
    };

    sounds.playJoin();
    onCreateTournament(newTournament);
    setSuccessMsg(
      language === 'ur'
        ? `Tournament "${newTournament.title}" kamiyabi se ban gaya!`
        : `Tournament "${newTournament.title}" created successfully!`
    );
    setTitle('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleBroadcastRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournForRoom || !broadcastRoomId.trim() || !broadcastPass.trim()) return;

    onUpdateRoomCredentials(selectedTournForRoom, broadcastRoomId.trim(), broadcastPass.trim(), true);
    sounds.playVictory();
    setSuccessMsg(
      language === 'ur'
        ? 'Room ID & Password registered khilariyon ko broadcast ho gayi!'
        : 'Room credentials successfully broadcasted to contenders!'
    );
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeclareWinnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournForResult || !winnerTeamInput.trim()) return;

    onDeclareWinner(selectedTournForResult, winnerTeamInput.trim(), winnerIgnInput.trim());
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    } catch {}
    sounds.playVictory();
    setSuccessMsg(
      language === 'ur'
        ? `Booyah Winner "${winnerTeamInput}" declare ho gaya aur inamat disburse ho gaye!`
        : `Booyah Winner "${winnerTeamInput}" declared and prizes credited!`
    );
    setWinnerTeamInput('');
    setWinnerIgnInput('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Tournament Host & Organizer Management Suite</span>
          </div>
          <h2 className="text-2xl font-display font-black text-white">
            {language === 'ur' ? 'Free Fire Host Control Room' : 'Host Organizer Control Center'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'ur'
              ? 'Naya match banayein, Custom Room ID & Password khilariyon ko bhejein, aur matches ke results verify karein.'
              : 'Create custom tournaments, release Room credentials securely, approve player proofs, and declare match winners.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 overflow-x-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('create');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'create' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? '+ Naya Match Banayein' : '+ Create Tournament'}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('rooms');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'rooms' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? 'Room ID Broadcast' : 'Room ID Broadcaster'}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('proofs');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'proofs' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>{language === 'ur' ? 'Proof Verifications' : 'Proof Claims'}</span>
            {pendingProofs.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-mono">
                {pendingProofs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('results');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'results' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'ur' ? 'Declare Booyah' : 'Declare Results'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab 1: Create New Tournament */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateTournament} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <span>{language === 'ur' ? 'Naye Tournament Ki Tafseelat' : 'Tournament Configuration'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Tournament Ka Naam' : 'Tournament Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Fire Mega Squad Championship"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Mode */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Match Mode' : 'Match Mode'}
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as MatchMode)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Squad">Squad (4v4v4... 12 Teams / 48 Players)</option>
                <option value="Solo">Solo (48 Single Players)</option>
                <option value="Duo">Duo (24 Teams / 48 Players)</option>
                <option value="Clash Squad">Clash Squad (8 Teams Knockout)</option>
              </select>
            </div>

            {/* Map */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Map Ka Intikhab' : 'Map'}
              </label>
              <select
                value={map}
                onChange={(e) => setMap(e.target.value as MatchMap)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Bermuda">Bermuda (Standard Esports)</option>
                <option value="Purgatory">Purgatory (High Elevation Sniper)</option>
                <option value="Kalahari">Kalahari (Fast Rush Hour)</option>
                <option value="Alpine">Alpine (Snow Terrain)</option>
                <option value="NexTerra">NexTerra (Futuristic)</option>
              </select>
            </div>

            {/* Entry Fee */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Entry Fee (Coins / PKR)' : 'Entry Fee (Coins)'}
              </label>
              <input
                type="number"
                min={0}
                step={10}
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">0 = Free Tournament</span>
            </div>

            {/* Total Prize Pool */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Total Prize Pool (Coins)' : 'Total Prize Pool (Coins)'}
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={prizePool}
                onChange={(e) => setPrizePool(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-amber-500/80 mt-1 block">
                1st Prize: {Math.round(prizePool * 0.5)} Coins · 2nd: {Math.round(prizePool * 0.25)} Coins
              </span>
            </div>

            {/* Per Kill Bounty */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Per Kill Bounty (Coins)' : 'Per Kill Bounty (Coins)'}
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={perKill}
                onChange={(e) => setPerKill(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Start time in minutes */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Match Shuru Hone Ka Waqt (Minutes)' : 'Start Delay (Minutes)'}
              </label>
              <input
                type="number"
                min={5}
                max={1440}
                step={5}
                value={startTimeMinutes}
                onChange={(e) => setStartTimeMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Esports Room Rules Options */}
          <div className="pt-4 border-t border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>{language === 'ur' ? 'Garena Custom Room Ki Settings' : 'Esports Room Configurations'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={limitedAmmo}
                  onChange={(e) => setLimitedAmmo(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-neutral-300">Limited Ammo (Yes)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gunAttributes}
                  onChange={(e) => setGunAttributes(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-neutral-300">Gun Attributes (ON)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={characterSkills}
                  onChange={(e) => setCharacterSkills(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-neutral-300">Character Skills (ON)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emulatorAllowed}
                  onChange={(e) => setEmulatorAllowed(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-neutral-300">Emulator / PC Allowed</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ur' ? 'Tournament Publish Karein' : 'Publish Tournament'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Room ID Broadcaster */}
      {activeTab === 'rooms' && (
        <form onSubmit={handleBroadcastRoom} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase">
            <Key className="w-4 h-4" />
            <span>Room ID & Password Distribution Controller</span>
          </div>

          <p className="text-xs text-neutral-400">
            {language === 'ur'
              ? 'Free Fire game me Custom Room create karein, phir yahan Room ID aur Password likh kar broadcast dabayein. Sirf registered players ko credentials foran mil jayenge!'
              : 'Create the custom room inside Garena Free Fire, enter the ID and password below, and broadcast to all registered participants instantly.'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Tournament Select Karein' : 'Select Tournament'}
              </label>
              <select
                value={selectedTournForRoom}
                onChange={(e) => setSelectedTournForRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.mode} · {t.map} · {t.registeredCount}/{t.maxSlots} joined)
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
                  placeholder="e.g. FF-992102"
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
                  placeholder="e.g. BOOYAH_PASS"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ur' ? 'Broadcast Room ID to Registered Squads' : 'Broadcast Room ID to Registered Squads'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Proof Submissions Review */}
      {activeTab === 'proofs' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-500" />
            <span>{language === 'ur' ? 'Match Screenshots & Inamat Ki Tasdeeq' : 'Contender Proof Claims'}</span>
          </h3>

          {pendingProofs.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              {language === 'ur' ? 'Filhal koi pending proof nahi hai.' : 'No pending proof claims to review.'}
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-neutral-200">{proof.playerIgn}</span>
                      <span className="text-neutral-500 font-mono">UID: {proof.playerUid}</span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-amber-400 font-semibold">{proof.tournamentTitle}</span>
                    </div>

                    <div className="flex items-center gap-3 text-neutral-400">
                      <span>
                        Claimed Rank: <strong className="text-white">#{proof.claimedRank}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Kills: <strong className="text-orange-400">{proof.claimedKills} Kills</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Calculated Prize: <strong className="text-amber-400">{proof.awardedPrize} Coins</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        sounds.playJoin();
                        onApproveProof(proof.id);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'Approve & Pay' : 'Approve & Pay'}</span>
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onRejectProof(proof.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                    >
                      {language === 'ur' ? 'Reject' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Results & Booyah Declaration */}
      {activeTab === 'results' && (
        <form onSubmit={handleDeclareWinnerSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase">
            <Trophy className="w-4 h-4" />
            <span>Booyah Champion & Official Result Declaration</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                {language === 'ur' ? 'Tournament Select Karein' : 'Select Tournament'}
              </label>
              <select
                value={selectedTournForResult}
                onChange={(e) => setSelectedTournForResult(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {language === 'ur' ? 'Booyah Winner Squad / Player Naam' : 'Booyah Winner Team / Player'}
                </label>
                <input
                  type="text"
                  required
                  value={winnerTeamInput}
                  onChange={(e) => setWinnerTeamInput(e.target.value)}
                  placeholder="e.g. NOVA Esports"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {language === 'ur' ? 'Top Fragger / MVP Details' : 'MVP / Kills Summary'}
                </label>
                <input
                  type="text"
                  value={winnerIgnInput}
                  onChange={(e) => setWinnerIgnInput(e.target.value)}
                  placeholder="e.g. NOVA・Shadow (11 Kills MVP)"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ur' ? 'Declare Champion & Auto-Credit Prizes' : 'Declare Champion & Auto-Credit Prizes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
