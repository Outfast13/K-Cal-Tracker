import React, { useState } from 'react';
import { DiaryEntry, FoodItem, MealType, UserProfile } from '../types/index.ts';
import {
  formatHumanDate,
  shiftDateString,
  getTodayDateString,
  copyMealsFromDateToDate,
  deleteDiaryEntry,
  updateDiaryEntryAmount,
} from '../data/storage.ts';
import { calculateNutrition } from '../domain/nutrition.ts';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Flame,
  CheckCircle,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';

interface DiaryTabProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  entries: DiaryEntry[];
  foods: FoodItem[];
  profile: UserProfile;
  onOpenFoodPicker: (mealType: MealType) => void;
  onRefreshEntries: () => void;
}

export const DiaryTab: React.FC<DiaryTabProps> = ({
  currentDate,
  onDateChange,
  entries,
  foods,
  profile,
  onOpenFoodPicker,
  onRefreshEntries,
}) => {
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [editAmountStr, setEditAmountStr] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Daily totals
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const totalCarbs = entries.reduce((sum, e) => sum + e.carbs, 0);
  const totalFat = entries.reduce((sum, e) => sum + e.fat, 0);

  const remainingCalories = Math.max(0, profile.dailyCalorieTarget - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / profile.dailyCalorieTarget) * 100));

  const mealTypes: { type: MealType; title: string; subtitle: string }[] = [
    { type: 'BREAKFAST', title: 'Breakfast', subtitle: 'Start your morning' },
    { type: 'LUNCH', title: 'Lunch', subtitle: 'Mid-day meal' },
    { type: 'DINNER', title: 'Dinner', subtitle: 'Evening nourishment' },
    { type: 'SNACKS', title: 'Snacks', subtitle: 'Light bites & drinks' },
  ];

  const handleCopyYesterday = () => {
    const yesterday = shiftDateString(currentDate, -1);
    const count = copyMealsFromDateToDate(yesterday, currentDate);
    if (count > 0) {
      setCopyFeedback(`Copied ${count} meal${count > 1 ? 's' : ''} from yesterday!`);
      onRefreshEntries();
    } else {
      setCopyFeedback('No meals logged for yesterday to copy.');
    }
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleStartEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setEditAmountStr(entry.loggedAmount.toString());
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    const newAmt = parseFloat(editAmountStr);
    if (isNaN(newAmt) || newAmt <= 0) return;

    const matchedFood = foods.find((f) => f.id === editingEntry.foodId);
    let newNutrients = {
      calories: editingEntry.calories,
      protein: editingEntry.protein,
      carbs: editingEntry.carbs,
      fat: editingEntry.fat,
      fiber: editingEntry.fiber,
    };

    if (matchedFood) {
      const calc = calculateNutrition(matchedFood, newAmt);
      newNutrients = {
        calories: calc.calories,
        protein: calc.protein,
        carbs: calc.carbohydrates,
        fat: calc.fat,
        fiber: calc.fiber,
      };
    } else {
      // Fallback ratio
      const ratio = newAmt / editingEntry.loggedAmount;
      newNutrients = {
        calories: Math.round(editingEntry.calories * ratio),
        protein: Math.round(editingEntry.protein * ratio * 10) / 10,
        carbs: Math.round(editingEntry.carbs * ratio * 10) / 10,
        fat: Math.round(editingEntry.fat * ratio * 10) / 10,
      };
    }

    updateDiaryEntryAmount(editingEntry.id, newAmt, newNutrients);
    setEditingEntry(null);
    onRefreshEntries();
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteDiaryEntry(entryId);
    setEditingEntry(null);
    onRefreshEntries();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Date Switcher */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(currentDate, -1))}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            {formatHumanDate(currentDate)}
          </span>
          {currentDate !== getTodayDateString() && (
            <button
              type="button"
              onClick={() => onDateChange(getTodayDateString())}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
            >
              Go to Today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDateChange(shiftDateString(currentDate, 1))}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Next Day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Target Progress Card */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-teal-700 via-teal-800 to-teal-950 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <p className="text-xs font-semibold text-teal-200/80 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Daily Calorie Budget
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">
                {Math.round(remainingCalories)}
              </span>
              <span className="text-xs text-teal-200/80 font-medium">remaining</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-teal-100">
              {Math.round(totalCalories)} / {profile.dailyCalorieTarget}{' '}
              <span className="text-xs font-normal text-teal-300">kcal</span>
            </span>
            <p className="text-[11px] text-teal-200/70">{caloriePercent}% consumed</p>
          </div>
        </div>

        {/* Linear Progress Indicator */}
        <div className="w-full bg-teal-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-teal-600/30">
          <div
            className="bg-linear-to-r from-teal-300 to-emerald-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>

        {/* Macro Breakdown Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-teal-700/60 text-center">
          <div className="p-2 rounded-2xl bg-teal-900/40 border border-teal-600/30">
            <p className="text-[10px] uppercase font-bold text-emerald-300">Protein</p>
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

          <div className="p-2 rounded-2xl bg-teal-900/40 border border-teal-600/30">
            <p className="text-[10px] uppercase font-bold text-sky-300">Carbs</p>
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

          <div className="p-2 rounded-2xl bg-teal-900/40 border border-teal-600/30">
            <p className="text-[10px] uppercase font-bold text-amber-300">Fat</p>
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

      {/* Copy Yesterday's Meals Button */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handleCopyYesterday}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy yesterday's meals to this day
        </button>

        {copyFeedback && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
            {copyFeedback}
          </span>
        )}
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        {mealTypes.map(({ type, title }) => {
          const mealEntries = entries.filter((e) => e.mealType === type);
          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <div
              key={type}
              className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {title}
                  </span>
                  {mealCalories > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold">
                      {Math.round(mealCalories)} kcal
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenFoodPicker(type)}
                  className="py-1 px-3 rounded-full bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Food
                </button>
              </div>

              {/* Items */}
              {mealEntries.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-1">
                  Nothing logged for {title.toLowerCase()} yet.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {mealEntries.map((item) => (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 rounded-xl px-1.5 transition"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.foodName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.loggedAmount} {item.loggedUnit} • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {Math.round(item.calories)} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit portion"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Entry Dialog */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Edit Portion
              </h4>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {editingEntry.foodName}
              </p>
              <label htmlFor="edit-portion-input" className="block text-xs text-zinc-400 mt-2 mb-1">
                Amount ({editingEntry.loggedUnit})
              </label>
              <input
                id="edit-portion-input"
                type="number"
                step="any"
                min="0.1"
                value={editAmountStr}
                onChange={(e) => setEditAmountStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base font-bold text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDeleteEntry(editingEntry.id)}
                className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
