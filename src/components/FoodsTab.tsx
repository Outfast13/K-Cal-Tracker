import React, { useState, useMemo } from 'react';
import { FoodItem } from '../types/index.ts';
import {
  Search,
  Plus,
  Barcode,
  Camera,
  FileText,
  Utensils,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface FoodsTabProps {
  foods: FoodItem[];
  onOpenBarcodeScanner: () => void;
  onOpenOcrScanner: () => void;
  onAddNewFood: () => void;
  onEditFood: (food: FoodItem) => void;
  onLogFood: (food: FoodItem) => void;
  onDuplicateFood: (food: FoodItem) => void;
  onDeleteFood: (foodId: string) => void;
}

export const FoodsTab: React.FC<FoodsTabProps> = ({
  foods,
  onOpenBarcodeScanner,
  onOpenOcrScanner,
  onAddNewFood,
  onEditFood,
  onLogFood,
  onDuplicateFood,
  onDeleteFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Pakistani Staples',
    'Proteins',
    'Grains',
    'Dairy',
    'Fruits & Veg',
    'Snacks',
    'Custom',
  ];

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        food.name.toLowerCase().includes(q) ||
        (food.brand && food.brand.toLowerCase().includes(q)) ||
        (food.barcode && food.barcode.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Custom' ? food.category === 'Custom' : food.category === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [foods, searchQuery, selectedCategory]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Action Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search offline food library, brand, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onOpenBarcodeScanner}
            className="py-2.5 px-2 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-100 transition shadow-xs"
          >
            <Barcode className="w-4 h-4 text-teal-600" />
            Scan Barcode
          </button>
          <button
            type="button"
            onClick={onOpenOcrScanner}
            className="py-2.5 px-2 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-100 transition shadow-xs"
          >
            <FileText className="w-4 h-4 text-teal-600" />
            Scan Label (OCR)
          </button>
          <button
            type="button"
            onClick={onAddNewFood}
            className="py-2.5 px-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Food
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Items Count & Header */}
      <div className="flex items-center justify-between px-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Showing <strong className="text-zinc-800 dark:text-zinc-200">{filteredFoods.length}</strong> items
          in offline database
        </span>
        {selectedCategory === 'Pakistani Staples' && (
          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Pakistani Heritage Recipes
          </span>
        )}
      </div>

      {/* Foods List */}
      {filteredFoods.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <Utensils className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No foods found</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Try a different search query or create a new custom food item.
          </p>
          <button
            type="button"
            onClick={onAddNewFood}
            className="mt-4 py-2 px-4 rounded-xl bg-teal-600 text-white text-xs font-semibold"
          >
            Create Food Now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFoods.map((food) => {
            const basisLabel =
              food.basis === '100G'
                ? 'per 100g/ml'
                : `per ${food.servingSize} ${food.servingUnit}`;

            return (
              <div
                key={food.id}
                className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-teal-500/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {food.name}
                    </h4>
                    {food.brand && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        • {food.brand}
                      </span>
                    )}
                    {food.barcode && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-100/70 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-mono text-[10px] font-semibold flex items-center gap-1">
                        <Barcode className="w-3 h-3" />
                        {food.barcode}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <span className="font-semibold text-teal-700 dark:text-teal-400">
                      {food.calories} kcal
                    </span>{' '}
                    ({basisLabel}) • P: {food.protein}g | C: {food.carbohydrates}g | F: {food.fat}g
                    {food.fiber ? ` | Fib: ${food.fiber}g` : ''}
                    {food.sodium ? ` | Na: ${food.sodium}mg` : ''}
                  </p>

                  {food.notes && (
                    <p className="text-[11px] text-zinc-400 italic mt-0.5 truncate">{food.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onLogFood(food)}
                    className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Log
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditFood(food)}
                    className="p-2 text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Edit food"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateFood(food)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Duplicate food"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${food.name}" from your local library?`)) {
                        onDeleteFood(food.id);
                      }
                    }}
                    className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Delete food"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
