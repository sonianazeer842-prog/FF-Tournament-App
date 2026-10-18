import React, { useState } from 'react';
import {
  X,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Send,
} from 'lucide-react';
import { WalletTransaction, DepositRequest, WithdrawalRequest, AdminPaymentSettings } from '../types/tournament';
import { sounds } from '../utils/audio';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  transactions: WalletTransaction[];
  adminSettings: AdminPaymentSettings;
  onSubmitDepositRequest: (req: Omit<DepositRequest, 'id' | 'submittedAt' | 'status'>) => void;
  onSubmitWithdrawalRequest: (req: Omit<WithdrawalRequest, 'id' | 'submittedAt' | 'status'>) => void;
  playerIgn: string;
  playerUid: string;
  userId?: string;
  language: 'ur' | 'en';
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  balance,
  transactions,
  adminSettings,
  onSubmitDepositRequest,
  onSubmitWithdrawalRequest,
  playerIgn,
  playerUid,
  userId,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('deposit');
  const [depositMethod, setDepositMethod] = useState<'EasyPaisa' | 'JazzCash'>('EasyPaisa');
  const [depositAmount, setDepositAmount] = useState<number>(300);
  const [senderNumber, setSenderNumber] = useState('03451234567');
  const [senderName, setSenderName] = useState('Saad Esports');
  const [trxId, setTrxId] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');

  // Withdrawal states
  const [withdrawMethod, setWithdrawMethod] = useState<'EasyPaisa' | 'JazzCash'>('EasyPaisa');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(200);
  const [withdrawAccount, setWithdrawAccount] = useState('03451234567');
  const [withdrawTitle, setWithdrawTitle] = useState('Saad Esports');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const activeReceiverNumber = depositMethod === 'EasyPaisa' ? adminSettings.easypaisaNumber : adminSettings.jazzcashNumber;
  const activeReceiverTitle = depositMethod === 'EasyPaisa' ? adminSettings.easypaisaTitle : adminSettings.jazzcashTitle;

  const handleCopyReceiver = () => {
    navigator.clipboard.writeText(activeReceiverNumber.replace(/[^0-9]/g, ''));
    sounds.playCopy();
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim() || trxId.length < 6) {
      setErrorMsg(
        language === 'ur'
          ? 'Meharbani farma kar SMS se aane wali sahi Transaction ID (TID) enter karein.'
          : 'Please enter the valid Transaction ID (TID) from your payment SMS.'
      );
      return;
    }
    if (depositAmount < 50) {
      setErrorMsg(language === 'ur' ? 'Kam az kam deposit Rs. 50 PKR hona chahiye.' : 'Minimum deposit is Rs. 50 PKR.');
      return;
    }

    sounds.playVictory();
    onSubmitDepositRequest({
      userId,
      playerIgn,
      playerUid,
      amountPkr: depositAmount,
      method: depositMethod,
      senderNumber,
      senderName,
      trxId: trxId.trim(),
      screenshotName: screenshotName || `${depositMethod.toLowerCase()}_receipt.jpg`,
    });

    setDepositSuccessMsg(
      language === 'ur'
        ? `Deposit Request (TID: ${trxId}) submit ho gayi hai! Saad Kazi verify karke aapka balance add kar dega.`
        : `Deposit request submitted with TID ${trxId}! Saad Kazi will verify and credit Rs. ${depositAmount} PKR to your wallet.`
    );
    setTrxId('');
    setScreenshotName('');
    setErrorMsg('');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > balance || withdrawAmount <= 0) {
      setErrorMsg(language === 'ur' ? 'Aapke wallet me itna balance nahi hai.' : 'Insufficient balance.');
      return;
    }
    if (!withdrawAccount.trim()) {
      setErrorMsg(language === 'ur' ? 'EasyPaisa / JazzCash number enter karein.' : 'Enter account number.');
      return;
    }

    sounds.playCopy();
    onSubmitWithdrawalRequest({
      playerIgn,
      playerUid,
      amountPkr: withdrawAmount,
      method: withdrawMethod,
      accountNumber: withdrawAccount,
      accountTitle: withdrawTitle,
    });

    setWithdrawSuccessMsg(
      language === 'ur'
        ? `Withdrawal request submit ho gayi! Rs. ${withdrawAmount} PKR aapke ${withdrawMethod} (${withdrawAccount}) me bhej diye jayenge.`
        : `Withdrawal request submitted! Rs. ${withdrawAmount} PKR will be transferred to your ${withdrawMethod} account.`
    );
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl my-6">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">Qazi Battle Wallet (Pakistan)</h2>
              <span className="text-[11px] text-neutral-400">EasyPaisa · JazzCash · 100% Real Payouts</span>
            </div>
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

        {/* Balance Strip */}
        <div className="p-5 bg-gradient-to-br from-neutral-950 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block mb-0.5">Wallet Balance</span>
            <div className="text-3xl font-display font-black text-amber-400 font-mono tabular-nums">
              Rs. {balance.toLocaleString()} <span className="text-sm font-sans font-semibold text-neutral-300">PKR</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">1 Coin = 1 Pakistani Rupee (PKR)</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('deposit');
                setDepositSuccessMsg('');
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('withdraw');
                setWithdrawSuccessMsg('');
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 px-5 pt-2 bg-neutral-950 text-xs font-semibold">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('deposit');
            }}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'deposit' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            EasyPaisa / JazzCash Deposit
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('withdraw');
            }}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'withdraw' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Cashout / Withdrawal
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('overview');
            }}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            History ({transactions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-96 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Deposit via EasyPaisa / JazzCash */}
          {activeTab === 'deposit' && (
            <div className="space-y-4 text-xs">
              {depositSuccessMsg ? (
                <div className="p-6 text-center space-y-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Deposit Request Masool Ho Gayi!</h3>
                  <p className="text-xs text-neutral-300 max-w-sm mx-auto">{depositSuccessMsg}</p>
                  <button
                    onClick={() => setDepositSuccessMsg('')}
                    className="px-4 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg"
                  >
                    Naya Deposit Karein
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  {/* Step 1: Select Method */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5">
                      1. Payment Channel Select Karein (Pakistan):
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setDepositMethod('EasyPaisa');
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                          depositMethod === 'EasyPaisa'
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                          {depositMethod === 'EasyPaisa' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                        </div>
                        <div>
                          <span className="block text-sm font-display font-bold">EasyPaisa</span>
                          <span className="text-[10px] text-neutral-400">Telenor Microfinance Bank</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setDepositMethod('JazzCash');
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                          depositMethod === 'JazzCash'
                            ? 'border-red-500 bg-red-950/40 text-red-300 font-bold'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 flex items-center justify-center">
                          {depositMethod === 'JazzCash' && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                        </div>
                        <div>
                          <span className="block text-sm font-display font-bold">JazzCash</span>
                          <span className="text-[10px] text-neutral-400">Mobilink Microfinance Bank</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Official Receiver Details Box (Saad Kazi) */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">
                        2. Send Payment To: Saad Kazi ({depositMethod})
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        100% Direct P2P
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Saad Kazi Mobile Number</span>
                        <span className="font-mono text-base font-bold text-white tracking-wider">{activeReceiverNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyReceiver}
                        className="px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>Account Title: <strong className="text-neutral-200">{activeReceiverTitle}</strong></span>
                      <span className="text-[10px] text-neutral-500">Official Qazi Battle Admin</span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2">
                      Apni <strong>{depositMethod} App</strong> kholein aur ooper diye gaye <strong>Saad Kazi</strong> ke number par raqam bhejein. Paise direct Saad Kazi ke wallet me jayenge.
                    </p>
                  </div>

                  {/* Step 3: Amount selection */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">3. Amount Select Karein (PKR):</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[100, 300, 500, 1000].map((amt) => (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className={`py-2 text-center rounded-lg border font-mono font-bold text-xs cursor-pointer ${
                            depositAmount === amt
                              ? 'border-amber-500 bg-amber-500 text-neutral-950'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                          }`}
                        >
                          Rs. {amt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Step 4: Sender Details & TID */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Aapka Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Sender Account Naam</label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Ali Khan"
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 flex items-center justify-between">
                      <span>SMS Transaction ID (TID / TRX ID)</span>
                      <span className="text-[10px] text-amber-500 font-normal">3737 ya 8558 SMS se</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. 37379812401 ya 8558190284"
                      className="w-full px-3 py-2.5 bg-neutral-950 border border-amber-500/50 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-amber-500 tracking-wider"
                    />
                  </div>

                  {/* Step 5: Optional Screenshot Upload */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 flex items-center justify-between">
                      <span>Payment Receipt Screenshot</span>
                      <span className="text-[10px] text-neutral-400 font-normal">Optional confirmation</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setScreenshotName(e.target.files[0].name);
                        }
                      }}
                      className="w-full text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5"
                    />
                    {screenshotName && (
                      <span className="text-[10px] text-emerald-400 mt-1 block">Uploaded: {screenshotName}</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>Submit Deposit Request (Rs. {depositAmount} PKR)</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Cashout / Withdrawal */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4 text-xs">
              {withdrawSuccessMsg ? (
                <div className="p-6 text-center space-y-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Withdrawal Request Submit!</h3>
                  <p className="text-xs text-neutral-300 max-w-sm mx-auto">{withdrawSuccessMsg}</p>
                  <button
                    onClick={() => setWithdrawSuccessMsg('')}
                    className="px-4 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg"
                  >
                    Wapis Wallet Par Jayein
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Select Cashout Method:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('EasyPaisa')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors ${
                          withdrawMethod === 'EasyPaisa'
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        EasyPaisa
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('JazzCash')}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors ${
                          withdrawMethod === 'JazzCash'
                            ? 'border-red-500 bg-red-950/40 text-red-400'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        JazzCash
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Account Holder Name (As per CNIC)</label>
                    <input
                      type="text"
                      required
                      value={withdrawTitle}
                      onChange={(e) => setWithdrawTitle(e.target.value)}
                      placeholder="e.g. Muhammad Saad"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      {withdrawMethod} Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-neutral-300 font-semibold mb-1">
                      <span>Withdraw Amount (PKR)</span>
                      <span className="text-neutral-500 font-mono">Max: Rs. {balance} PKR</span>
                    </div>
                    <input
                      type="number"
                      min={50}
                      max={balance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawAmount > balance || withdrawAmount <= 0}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      withdrawAmount <= balance && withdrawAmount > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    <span>Submit Instant Withdrawal Request</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Overview Transactions */}
          {activeTab === 'overview' && (
            <div className="space-y-2.5 text-xs">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                        tx.amount > 0 ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/60 text-red-400'
                      }`}
                    >
                      {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-200 block">{tx.description}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">{tx.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold tabular-nums block ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-neutral-200'
                      }`}
                    >
                      {tx.amount > 0 ? `+Rs. ${tx.amount}` : `-Rs. ${Math.abs(tx.amount)}`} PKR
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
