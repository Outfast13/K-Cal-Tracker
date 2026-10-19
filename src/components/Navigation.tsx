import React from 'react';
import {
  CalendarDays,
  BookOpen,
  UtensilsCrossed,
  Activity,
  TrendingUp,
  QrCode,
} from 'lucide-react';

export type TabType = 'today' | 'diary' | 'foods' | 'activity' | 'progress';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickScan: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onQuickScan,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="max-w-xl mx-auto px-1 sm:px-3 py-1 flex items-center justify-between">
        {/* 1. Today */}
        <button
          type="button"
          onClick={() => onTabChange('today')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition ${
            currentTab === 'today'
              ? 'text-teal-700 dark:text-teal-300 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition ${
              currentTab === 'today'
                ? 'bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Today</span>
        </button>

        {/* 2. Diary */}
        <button
          type="button"
          onClick={() => onTabChange('diary')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition ${
            currentTab === 'diary'
              ? 'text-teal-700 dark:text-teal-300 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition ${
              currentTab === 'diary'
                ? 'bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Diary</span>
        </button>

        {/* Quick Scan Center FAB */}
        <div className="px-0.5 -mt-5">
          <button
            type="button"
            onClick={onQuickScan}
            className="w-12 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-600/35 hover:scale-105 active:scale-95 transition"
            title="Scan Barcode or Nutrition Label"
            aria-label="Scan Barcode or Nutrition Label"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* 3. Foods */}
        <button
          type="button"
          onClick={() => onTabChange('foods')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition ${
            currentTab === 'foods'
              ? 'text-teal-700 dark:text-teal-300 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition ${
              currentTab === 'foods'
                ? 'bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Foods</span>
        </button>

        {/* 4. Activity */}
        <button
          type="button"
          onClick={() => onTabChange('activity')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition ${
            currentTab === 'activity'
              ? 'text-teal-700 dark:text-teal-300 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition ${
              currentTab === 'activity'
                ? 'bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Activity</span>
        </button>

        {/* 5. Progress */}
        <button
          type="button"
          onClick={() => onTabChange('progress')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition ${
            currentTab === 'progress'
              ? 'text-teal-700 dark:text-teal-300 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition ${
              currentTab === 'progress'
                ? 'bg-teal-100/80 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Progress</span>
        </button>
      </div>
    </nav>
  );
};
