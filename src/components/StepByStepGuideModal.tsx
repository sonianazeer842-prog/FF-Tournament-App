import React, { useState } from 'react';
import { tournamentGuideSteps } from '../data/guideData';
import { Shield, CheckSquare, Square, ChevronRight, Lightbulb, BookOpen, Key, Users, Trophy, Coins, Sliders } from 'lucide-react';
import { sounds } from '../utils/audio';

interface StepByStepGuideProps {
  language: 'ur' | 'en';
}

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ language }) => {
  const [selectedStepId, setSelectedStepId] = useState<number>(1);
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  const toggleChecklist = (key: string) => {
    sounds.playClick();
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentStep = tournamentGuideSteps.find((s) => s.id === selectedStepId) || tournamentGuideSteps[0];

  const getStepIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return <Shield className="w-5 h-5 text-amber-500" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5 text-orange-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'Key':
        return <Key className="w-5 h-5 text-emerald-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-amber-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Esports Blueprint & Masterclass</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white mb-2">
          {language === 'ur'
            ? 'Free Fire Tournament App Ka Mukammal Step-by-Step Guide'
            : 'Complete Step-by-Step Free Fire Tournament Organizer Guide'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
          {language === 'ur'
            ? 'Agar aap Free Fire ke matches organize karna chahte hain aur community se munafa kamana chahte hain, to is guide me Room Card se le kar EasyPaisa/JazzCash payout tak har step samjhaya gaya hai.'
            : 'From acquiring Garena Custom Room Cards to anti-cheat enforcement, slot management, and fast winner payouts — here is your complete esports workflow.'}
        </p>
      </div>

      {/* Main 2-Column Split: Steps Navigator & Active Step Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step List (Left Column) */}
        <div className="lg:col-span-5 space-y-2">
          {tournamentGuideSteps.map((step) => {
            const isActive = step.id === selectedStepId;
            return (
              <div
                key={step.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedStepId(step.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-neutral-900 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isActive ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    0{step.id}
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                      {language === 'ur' ? step.titleUrdu : step.titleEn}
                    </h4>
                    <span className="text-[11px] text-neutral-500 line-clamp-1">
                      {language === 'ur' ? step.descUrdu : step.descEn}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-neutral-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Active Step Detailed Content (Right Column) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              {getStepIcon(currentStep.iconName)}
            </div>
            <div>
              <span className="text-[11px] text-amber-500 font-mono font-semibold uppercase">Step 0{currentStep.id} OF 06</span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                {language === 'ur' ? currentStep.titleUrdu : currentStep.titleEn}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
            {language === 'ur' ? currentStep.descUrdu : currentStep.descEn}
          </p>

          {/* Bullet Points */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              {language === 'ur' ? 'Amali Iqdamat (Action Items):' : 'Key Directives:'}
            </span>
            {(language === 'ur' ? currentStep.bulletPointsUrdu : currentStep.bulletPointsEn).map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-semibold block mb-0.5">
                {language === 'ur' ? 'Pro Organizer Secret:' : 'Pro Organizer Secret:'}
              </strong>
              <span>{language === 'ur' ? currentStep.proTipUrdu : currentStep.proTipEn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Host Checklist Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
          <CheckSquare className="w-4 h-4" />
          <span>Interactive Match Day Checklist</span>
        </div>
        <h3 className="text-lg font-display font-bold text-white mb-4">
          {language === 'ur' ? 'Match Day Host Verification Checklist' : 'Match Day Host Verification Checklist'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div
            onClick={() => toggleChecklist('step1')}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
          >
            {checklist.step1 ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-neutral-600" />}
            <span className={checklist.step1 ? 'line-through text-neutral-500' : 'text-neutral-200'}>
              {language === 'ur' ? 'Custom Room Card check kar liya hai' : 'Custom Room Card verified in Free Fire'}
            </span>
          </div>

          <div
            onClick={() => toggleChecklist('step2')}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
          >
            {checklist.step2 ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-neutral-600" />}
            <span className={checklist.step2 ? 'line-through text-neutral-500' : 'text-neutral-200'}>
              {language === 'ur' ? 'Gun attributes OFF aur Block Emulator YES kiya' : 'Gun attributes OFF & Block Emulators set to YES'}
            </span>
          </div>

          <div
            onClick={() => toggleChecklist('step3')}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
          >
            {checklist.step3 ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-neutral-600" />}
            <span className={checklist.step3 ? 'line-through text-neutral-500' : 'text-neutral-200'}>
              {language === 'ur' ? '12 Squads slots finalize kiye' : 'All 12 Squad slots verified with Free Fire UIDs'}
            </span>
          </div>

          <div
            onClick={() => toggleChecklist('step4')}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
          >
            {checklist.step4 ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-neutral-600" />}
            <span className={checklist.step4 ? 'line-through text-neutral-500' : 'text-neutral-200'}>
              {language === 'ur' ? 'Match se 15m pehle Room ID & Pass share kiya' : 'Room ID & Pass broadcasted 15m before start'}
            </span>
          </div>

          <div
            onClick={() => toggleChecklist('step5')}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors md:col-span-2"
          >
            {checklist.step5 ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-neutral-600" />}
            <span className={checklist.step5 ? 'line-through text-neutral-500' : 'text-neutral-200'}>
              {language === 'ur' ? 'Winner ka match screenshot check karke EasyPaisa/JazzCash transfer kiya' : 'Validated match recap screenshot and disbursed instant cashout'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
