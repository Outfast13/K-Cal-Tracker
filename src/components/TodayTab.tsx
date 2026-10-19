import React, { useState } from 'react';
import {
  DiaryEntry,
  UserProfile,
  WeightEntry,
  WaterEntry,
  ExerciseEntry,
} from '../types/index.ts';
import { addWaterEntry } from '../data/storage.ts';
import { calculateBmi } from '../domain/fitness.ts';
import {
  Flame,
  Droplet,
  Footprints,
  Dumbbell,
  Scale,
  Sparkles,
  Plus,
  Barcode,
  FileText,
  SlidersHorizontal,
  Activity,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Apple,
} from 'lucide-react';

interface TodayTabProps {
  currentDate: string;
  diaryEntries: DiaryEntry[];
  weightEntries: WeightEntry[];
  waterEntries: WaterEntry[];
  exerciseEntries: ExerciseEntry[];
  profile: UserProfile;
  onOpenBarcodeScanner: () => void;
  onOpenOcrScanner: () => void;
  onOpenAddFood: () => void;
  onOpenAddWeight: () => void;
  onOpenAddExercise: () => void;
  onRefreshData: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  currentDate,
  diaryEntries,
  weightEntries,
  waterEntries,
  exerciseEntries,
  profile,
  onOpenBarcodeScanner,
  onOpenOcrScanner,
  onOpenAddFood,
  onOpenAddWeight,
  onOpenAddExercise,
  onRefreshData,
  onNavigateToTab,
}) => {
  const [showCustomize, setShowCustomize] = useState(false);

  // Calculations
  const foodCalories = diaryEntries.reduce((sum, e) => sum + e.calories, 0);
  const exerciseCalories = exerciseEntries.reduce((sum, e) => sum + e.estimatedCalories, 0);
  const netCalories = foodCalories - exerciseCalories;
  const remainingCalories = profile.dailyCalorieTarget - foodCalories + exerciseCalories;

  const totalProtein = diaryEntries.reduce((sum, e) => sum + e.protein, 0);
  const totalCarbs = diaryEntries.reduce((sum, e) => sum + e.carbs, 0);
  const totalFat = diaryEntries.reduce((sum, e) => sum + e.fat, 0);
  const totalFiber = diaryEntries.reduce((sum, e) => sum + (e.fiber || 0), 0);

  const totalWaterMl = waterEntries.reduce((sum, w) => sum + w.amountMl, 0);
  const waterPercent = Math.min(100, Math.round((totalWaterMl / profile.dailyWaterTargetMl) * 100));

  // Current weight and trend
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;
  const previousWeight = weightEntries.length > 1 ? weightEntries[weightEntries.length - 2] : null;
  const weightDiff = latestWeight && previousWeight ? Math.round((latestWeight.weightKg - previousWeight.weightKg) * 10) / 10 : 0;
  const bmiInfo = latestWeight ? calculateBmi(latestWeight.weightKg, profile.currentHeightCm) : null;

  // Estimated steps from walking/running exercise + base
  const exerciseWalkMinutes = exerciseEntries
    .filter((e) => e.category === 'Walking' || e.category === 'Running')
    .reduce((s, e) => s + e.durationMinutes, 0);
  const estimatedSteps = Math.round(4200 + exerciseWalkMinutes * 110);
  const stepsPercent = Math.min(100, Math.round((estimatedSteps / profile.dailyStepTarget) * 100));

  const handleQuickAddWater = (amountMl: number) => {
    addWaterEntry(amountMl, currentDate);
    onRefreshData();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Quick Action Shortcuts Bar */}
      <div className="p-3 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={onOpenAddFood}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Log Food</span>
          </button>

          <button
            type="button"
            onClick={onOpenBarcodeScanner}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <Barcode className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Barcode</span>
          </button>

          <button
            type="button"
            onClick={onOpenOcrScanner}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Scan Label</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAddWater(250)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
              <Droplet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">+250ml</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddExercise}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Exercise</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddWeight}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Weight</span>
          </button>
        </div>
      </div>

      {/* Main Calorie Budget Card (MyNetDiary Signature Math) */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-teal-700 via-teal-800 to-teal-950 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200/90 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" /> Daily Energy Balance
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-900/80 border border-teal-500/30 text-teal-200 font-semibold">
            {profile.macroPreset} Plan
          </span>
        </div>

        {/* Dynamic equation: Budget - Food + Burned = Remaining */}
        <div className="grid grid-cols-4 gap-2 text-center py-2">
          <div>
            <p className="text-[10px] text-teal-200 uppercase font-bold">Budget</p>
            <p className="text-base sm:text-lg font-black text-white mt-0.5">
              {profile.dailyCalorieTarget}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-rose-300 uppercase font-bold">- Food</p>
            <p className="text-base sm:text-lg font-black text-rose-200 mt-0.5">
              {Math.round(foodCalories)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-emerald-300 uppercase font-bold">+ Burned</p>
            <p className="text-base sm:text-lg font-black text-emerald-200 mt-0.5">
              {Math.round(exerciseCalories)}
            </p>
          </div>
          <div className="border-l border-teal-600/40 pl-2">
            <p className="text-[10px] text-amber-300 uppercase font-bold">= Left</p>
            <p className="text-base sm:text-xl font-black text-amber-200 mt-0.5">
              {Math.round(remainingCalories)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-teal-950/60 rounded-full h-3 mt-3 overflow-hidden p-0.5 border border-teal-600/30">
          <div
            className="bg-linear-to-r from-teal-300 to-emerald-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, (foodCalories / profile.dailyCalorieTarget) * 100))}%` }}
          />
        </div>

        {/* Macro targets row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-teal-700/60 text-center">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 uppercase">Protein</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {Math.round(totalProtein)} / {profile.dailyProteinTarget}g
            </p>
            <div className="w-full bg-teal-950/50 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (totalProtein / profile.dailyProteinTarget) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-sky-300 uppercase">Carbs</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {Math.round(totalCarbs)} / {profile.dailyCarbTarget}g
            </p>
            <div className="w-full bg-teal-950/50 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (totalCarbs / profile.dailyCarbTarget) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-amber-300 uppercase">Fat</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {Math.round(totalFat)} / {profile.dailyFatTarget}g
            </p>
            <div className="w-full bg-teal-950/50 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (totalFat / profile.dailyFatTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Water & Hydration Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Water Hydration
              </h4>
              <p className="text-xs text-zinc-400">
                {totalWaterMl} / {profile.dailyWaterTargetMl} mL ({waterPercent}%)
              </p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAddWater(250)}
              className="py-1 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold transition"
            >
              +250ml
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddWater(500)}
              className="py-1 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold transition"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Water visual wave bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-linear-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${waterPercent}%` }}
          />
        </div>
      </div>

      {/* Activity & Steps Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Steps &amp; Activity
                </h4>
                {profile.healthConnectConnected ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Health Connect Synced
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-zinc-400">
                    Offline Counter
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                {estimatedSteps.toLocaleString()} / {profile.dailyStepTarget.toLocaleString()} steps ({stepsPercent}%)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('activity')}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-linear-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${stepsPercent}%` }}
          />
        </div>

        {exerciseEntries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
              {exerciseEntries.length} workout{exerciseEntries.length > 1 ? 's' : ''} logged today
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              +{Math.round(exerciseCalories)} kcal burned
            </span>
          </div>
        )}
      </div>

      {/* Weight & BMI Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Weight &amp; Body
              </h4>
              <p className="text-xs text-zinc-400">
                Target: {profile.weightTargetKg} kg
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('progress')}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Current</p>
            <p className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {latestWeight ? `${latestWeight.weightKg} kg` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Change</p>
            <p
              className={`text-base font-bold mt-0.5 flex items-center justify-center gap-0.5 ${
                weightDiff < 0
                  ? 'text-emerald-600'
                  : weightDiff > 0
                  ? 'text-amber-600'
                  : 'text-zinc-500'
              }`}
            >
              {weightDiff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {weightDiff > 0 ? `+${weightDiff}` : `${weightDiff}`} kg
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">BMI</p>
            <p
              className="text-base font-bold mt-0.5"
              style={{ color: bmiInfo?.color || '#10B981' }}
            >
              {bmiInfo ? `${bmiInfo.bmi} (${bmiInfo.category.slice(0, 4)})` : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
