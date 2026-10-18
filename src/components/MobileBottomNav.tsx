import React from 'react';
import { Home, Trophy, Wallet, Calculator, User, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface MobileBottomNavProps {
  activeTab: 'tournaments' | 'guide' | 'points' | 'wallet' | 'profile';
  setActiveTab: (tab: 'tournaments' | 'guide' | 'points' | 'wallet' | 'profile') => void;
  walletBalance: number;
  language: 'ur' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  language,
}) => {
  const navItems = [
    {
      id: 'tournaments' as const,
      labelUrdu: 'Home',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'guide' as const,
      labelUrdu: 'Guide',
      labelEn: 'Guide',
      icon: BookOpen,
    },
    {
      id: 'points' as const,
      labelUrdu: 'Points',
      labelEn: 'Points',
      icon: Calculator,
    },
    {
      id: 'wallet' as const,
      labelUrdu: 'Wallet',
      labelEn: 'Wallet',
      icon: Wallet,
      badge: `Rs.${walletBalance}`,
    },
    {
      id: 'profile' as const,
      labelUrdu: 'Profile',
      labelEn: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 px-2 py-1 shadow-2xl">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              style={{ minHeight: '52px' }}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-500' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-amber-500 text-neutral-950 font-mono text-[9px] font-extrabold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate w-full text-center">
                {language === 'ur' ? item.labelUrdu : item.labelEn}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-amber-500 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
