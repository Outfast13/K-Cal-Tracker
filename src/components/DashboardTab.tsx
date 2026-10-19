import React, { useState } from 'react';
import { DiaryEntry, UserProfile } from '../types/index.ts';
import { saveUserProfile } from '../data/storage.ts';
import {
  Target,
  Flame,
  CheckCircle2,
  PieChart,
  Sliders,
  Sparkles,
  Info,
  Save,
} from 'lucide-react';

interface DashboardTabProps {
  profile: UserProfile;
  todayEntries: DiaryEntry[];
  onProfileUpdated: (newProfile: UserProfile) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  profile,
  todayEntries,
  onProfileUpdated,
}) => {
  const [calTarget, setCalTarget] = useState(profile.dailyCalorieTarget.toString());
  const [pTarget, setPTarget] = useState(profile.dailyProteinTarget.toString());
  const [cTarget, setCTarget] = useState(profile.dailyCarbTarget.toString());
  const [fTarget, setFTarget] = useState(profile.dailyFatTarget.toString());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Consumed today
  const consumedCal = todayEntries.reduce((s, e) => s + e.calories, 0);
  const consumedP = todayEntries.reduce((s, e) => s + e.protein, 0);
  const consumedC = todayEntries.reduce((s, e) => s + e.carbs, 0);
  const consumedF = todayEntries.reduce((s, e) => s + e.fat, 0);

  // Meal breakdown
  const mealBreakdown = {
    Breakfast: todayEntries.filter((e) => e.mealType === 'BREAKFAST').reduce((s, e) => s + e.calories, 0),
    Lunch: todayEntries.filter((e) => e.mealType === 'LUNCH').reduce((s, e) => s + e.calories, 0),
    Dinner: todayEntries.filter((e) => e.mealType === 'DINNER').reduce((s, e) => s + e.calories, 0),
    Snacks: todayEntries.filter((e) => e.mealType === 'SNACKS').reduce((s, e) => s + e.calories, 0),
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const c = Math.max(500, parseFloat(calTarget) || 2000);
    const p = Math.max(10, parseFloat(pTarget) || 120);
    const carb = Math.max(10, parseFloat(cTarget) || 200);
    const f = Math.max(10, parseFloat(fTarget) || 60);

    const updated: UserProfile = {
      dailyCalorieTarget: c,
      dailyProteinTarget: p,
      dailyCarbTarget: carb,
      dailyFatTarget: f,
      updatedAt: Date.now(),
    };

    saveUserProfile(updated);
    onProfileUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const applyPreset = (c: number, p: number, carb: number, f: number) => {
    setCalTarget(c.toString());
    setPTarget(p.toString());
    setCTarget(carb.toString());
    setFTarget(f.toString());
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Overview Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Today's Nutrition Summary
            </h3>
            <p className="text-xs text-zinc-400">Accurate offline target calculations</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Consumed
            </span>
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {Math.round(consumedCal)}{' '}
              <span className="text-xs font-normal text-zinc-400">kcal</span>
            </p>
            <p className="text-[11px] text-zinc-400">
              Target: {profile.dailyCalorieTarget} kcal
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Protein
            </span>
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {Math.round(consumedP)}g
            </p>
            <p className="text-[11px] text-zinc-400">
              Goal: {profile.dailyProteinTarget}g ({Math.round((consumedP / profile.dailyProteinTarget) * 100)}%)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Carbs
            </span>
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {Math.round(consumedC)}g
            </p>
            <p className="text-[11px] text-zinc-400">
              Goal: {profile.dailyCarbTarget}g ({Math.round((consumedC / profile.dailyCarbTarget) * 100)}%)
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Fat
            </span>
            <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {Math.round(consumedF)}g
            </p>
            <p className="text-[11px] text-zinc-400">
              Goal: {profile.dailyFatTarget}g ({Math.round((consumedF / profile.dailyFatTarget) * 100)}%)
            </p>
          </div>
        </div>

        {/* Meal Breakdown Distribution */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-teal-600" /> Calories By Meal
            </span>
            <span className="text-xs text-zinc-400">
              Total: {Math.round(consumedCal)} kcal
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {Object.entries(mealBreakdown).map(([meal, cal]) => {
              const pct = consumedCal > 0 ? Math.round((cal / consumedCal) * 100) : 0;
              return (
                <div
                  key={meal}
                  className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                >
                  <p className="text-[10px] text-zinc-500 font-medium">{meal}</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {Math.round(cal)} kcal
                  </p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Configuration Form */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Configure Nutritional Goals
              </h3>
              <p className="text-xs text-zinc-400">Personalized daily macronutrient thresholds</p>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Quick Nutrition Goal Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset(1700, 140, 160, 55)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition"
            >
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Fat Loss</p>
              <p className="text-[10px] text-zinc-400">1,700 kcal • High P</p>
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2000, 140, 220, 65)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition"
            >
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Balanced</p>
              <p className="text-[10px] text-zinc-400">2,000 kcal • 50/25/25</p>
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2400, 175, 275, 70)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition"
            >
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Athletic Gain</p>
              <p className="text-[10px] text-zinc-400">2,400 kcal • High P</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor="daily-cal-target" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Daily Calorie Target (kcal)
            </label>
            <input
              id="daily-cal-target"
              type="number"
              required
              min="500"
              max="10000"
              value={calTarget}
              onChange={(e) => setCalTarget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="protein-target-input" className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                Protein (g)
              </label>
              <input
                id="protein-target-input"
                type="number"
                required
                min="10"
                max="500"
                value={pTarget}
                onChange={(e) => setPTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label htmlFor="carbs-target-input" className="block text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
                Carbs (g)
              </label>
              <input
                id="carbs-target-input"
                type="number"
                required
                min="10"
                max="800"
                value={cTarget}
                onChange={(e) => setCTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label htmlFor="fat-target-input" className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                Fat (g)
              </label>
              <input
                id="fat-target-input"
                type="number"
                required
                min="10"
                max="300"
                value={fTarget}
                onChange={(e) => setFTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Calorie check note */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Target is mathematically calculated. Nutritional needs vary by age, height, weight, and activity level. Consult a registered dietitian for medical guidance.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Targets saved to local storage!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              Save Targets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
