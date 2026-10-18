import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Key,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tournament, PlayerSlot } from '../types/tournament';
import { sounds } from '../utils/audio';

export type RegistrationModalType = 'insufficient_balance' | 'success' | 'already_registered';

interface RegistrationFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: RegistrationModalType;
  tournament: Tournament | null;
  walletBalance: number;
  openWalletDeposit: () => void;
  assignedSlot?: PlayerSlot | null;
  language?: 'ur' | 'en';
}

export const RegistrationFeedbackModal: React.FC<RegistrationFeedbackModalProps> = ({
  isOpen,
  onClose,
  type,
  tournament,
  walletBalance,
  openWalletDeposit,
  assignedSlot,
  language = 'ur',
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!isOpen || !tournament) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Insufficient Balance State */}
        {type === 'insufficient_balance' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-display font-black text-white">
                Insufficient Balance
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Please add cash to your wallet to register for this tournament.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Tournament Entry Fee:</span>
                <span className="font-mono font-bold text-white">Rs. {tournament.entryFee} PKR</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Your Current Balance:</span>
                <span className="font-mono font-bold text-red-400">Rs. {walletBalance} PKR</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800/80 pt-2 text-neutral-300 font-semibold">
                <span>Required Deposit:</span>
                <span className="font-mono font-bold text-amber-400">
                  Rs. {Math.max(0, tournament.entryFee - walletBalance)} PKR
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  openWalletDeposit();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:opacity-95 text-neutral-950 font-display font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Deposit via EasyPaisa / JazzCash</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 2. Registration Success State */}
        {type === 'success' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-display font-black text-white">
                Registered Successfully!
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Your slot is confirmed for <strong className="text-neutral-200">{tournament.title}</strong>
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs text-left">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">Assigned Slot:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
                  Slot #{assignedSlot?.slotNumber || tournament.registeredCount}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Free Fire IGN:</span>
                <span className="font-mono font-bold text-white">{assignedSlot?.leaderIgn}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Free Fire UID:</span>
                <span className="font-mono font-bold text-white">{assignedSlot?.leaderUid}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Fee Deducted:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {tournament.entryFee === 0 ? 'FREE' : `Rs. ${tournament.entryFee} PKR`}
                </span>
              </div>
            </div>

            {/* Room ID and Password Box */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/30 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" />
                  <span>Custom Room Credentials</span>
                </span>
                {tournament.roomRevealed ? (
                  <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                    Live Broadcasted
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Awaiting Broadcast
                  </span>
                )}
              </div>

              {tournament.roomRevealed && tournament.roomId ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-800">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase">Room ID</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{tournament.roomId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-200 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-800">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase">Room Password</span>
                      <span className="font-mono font-bold text-white text-sm">{tournament.roomPassword}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPass}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-200 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPass ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-neutral-400">
                    Room ID & Password will be revealed 15 minutes before the match start time once Admin Saad Kazi broadcasts it.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
            >
              Done & Return
            </button>
          </div>
        )}

        {/* 3. Already Registered State */}
        {type === 'already_registered' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-display font-black text-white">
                Already Registered
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Your Free Fire ID is already registered for <strong className="text-neutral-200">{tournament.title}</strong>. Double registration is prevented.
              </p>
            </div>

            {/* Room ID and Password Box */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" />
                  <span>Custom Room Status</span>
                </span>
                {tournament.roomRevealed ? (
                  <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                    Room Open
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Waiting for Broadcast
                  </span>
                )}
              </div>

              {tournament.roomRevealed && tournament.roomId ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-800">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase">Room ID</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{tournament.roomId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-200 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-900 px-3 py-2 rounded-lg border border-neutral-800">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase">Room Password</span>
                      <span className="font-mono font-bold text-white text-sm">{tournament.roomPassword}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPass}
                      className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-200 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPass ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Room credentials will be revealed 15 minutes before match start once admin broadcasts them.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
