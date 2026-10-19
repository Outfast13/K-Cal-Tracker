import React, { useState } from 'react';
import { FoodItem, MealType } from '../types/index.ts';
import { calculateNutrition } from '../domain/nutrition.ts';
import { X, Check, Utensils, Flame } from 'lucide-react';

interface LogFoodModalProps {
  food: FoodItem;
  initialMealType?: MealType;
  onClose: () => void;
  onConfirm: (food: FoodItem, mealType: MealType, amount: number) => void;
}

export const LogFoodModal: React.FC<LogFoodModalProps> = ({
  food,
  initialMealType = 'LUNCH',
  onClose,
  onConfirm,
}) => {
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [amountStr, setAmountStr] = useState<string>(food.servingSize.toString());

  const amount = parseFloat(amountStr) || 0;
  const calculated = calculateNutrition(food, amount);

  const mealTypes: { type: MealType; label: string }[] = [
    { type: 'BREAKFAST', label: 'Breakfast' },
    { type: 'LUNCH', label: 'Lunch' },
    { type: 'DINNER', label: 'Dinner' },
    { type: 'SNACKS', label: 'Snacks' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onConfirm(food, mealType, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg leading-tight">
                Log to Diary
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {food.brand ? `${food.brand} • ` : ''}
                {food.basis === '100G' ? 'Per 100g/ml' : `Per ${food.servingSize} ${food.servingUnit}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{food.name}</h4>
            {food.barcode && (
              <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
                Barcode: {food.barcode}
              </span>
            )}
          </div>

          {/* Meal Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Select Meal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map(({ type, label }) => {
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl transition border text-center ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/30 font-semibold'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input with Accurate Scaling */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="amount-input" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Portion Amount ({food.servingUnit})
              </label>
              {food.basis === '100G' && (
                <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  Scales accurately per gram/ml
                </span>
              )}
            </div>
            <div className="relative rounded-2xl shadow-xs">
              <input
                id="amount-input"
                type="number"
                step="any"
                min="0.1"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium pointer-events-none">
                {food.servingUnit}
              </span>
            </div>

            {/* Quick portions */}
            <div className="flex gap-2 mt-2">
              {[0.5, 1, 1.5, 2].map((multiplier) => {
                const quickVal = Math.round(food.servingSize * multiplier * 10) / 10;
                return (
                  <button
                    key={multiplier}
                    type="button"
                    onClick={() => setAmountStr(quickVal.toString())}
                    className="flex-1 py-1 px-2 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    {multiplier}x ({quickVal})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculated Output Summary Card */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> Total Energy
              </span>
              <span className="text-2xl font-black text-teal-700 dark:text-teal-300">
                {Math.round(calculated.calories)}{' '}
                <span className="text-xs font-normal text-zinc-500">kcal</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-teal-200/50 dark:border-teal-900/50 text-center">
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  Protein
                </p>
                <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                  {calculated.protein}g
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  Carbs
                </p>
                <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                  {calculated.carbohydrates}g
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                  Fat
                </p>
                <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">
                  {calculated.fat}g
                </p>
              </div>
            </div>

            {calculated.fiber > 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
                Fiber: {calculated.fiber}g • Sodium: {calculated.sodium}mg
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0}
              className="flex-1 py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              Log to Diary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
