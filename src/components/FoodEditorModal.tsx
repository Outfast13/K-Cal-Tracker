import React, { useState } from 'react';
import { FoodItem } from '../types/index.ts';
import { saveFoodItem, deleteFoodItem } from '../data/storage.ts';
import { X, Save, Trash2, Barcode, Scale, AlertCircle } from 'lucide-react';

interface FoodEditorModalProps {
  initialFood?: Partial<FoodItem> | null;
  onClose: () => void;
  onSaved: (food: FoodItem) => void;
  onDeleted?: (foodId: string) => void;
}

export const FoodEditorModal: React.FC<FoodEditorModalProps> = ({
  initialFood,
  onClose,
  onSaved,
  onDeleted,
}) => {
  const isEditing = Boolean(initialFood?.id);

  const [name, setName] = useState(initialFood?.name || '');
  const [brand, setBrand] = useState(initialFood?.brand || '');
  const [barcode, setBarcode] = useState(initialFood?.barcode || '');
  const [basis, setBasis] = useState<'100G' | 'SERVING'>(initialFood?.basis || 'SERVING');
  const [servingSize, setServingSize] = useState(initialFood?.servingSize?.toString() || '1');
  const [servingUnit, setServingUnit] = useState(initialFood?.servingUnit || 'piece');

  const [calories, setCalories] = useState(initialFood?.calories?.toString() || '');
  const [protein, setProtein] = useState(initialFood?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(initialFood?.carbohydrates?.toString() || '');
  const [fat, setFat] = useState(initialFood?.fat?.toString() || '');

  const [fiber, setFiber] = useState(initialFood?.fiber?.toString() || '');
  const [sugars, setSugars] = useState(initialFood?.sugars?.toString() || '');
  const [sodium, setSodium] = useState(initialFood?.sodium?.toString() || '');
  const [saturatedFat, setSaturatedFat] = useState(initialFood?.saturatedFat?.toString() || '');
  const [notes, setNotes] = useState(initialFood?.notes || '');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const calNum = parseFloat(calories);
    const pNum = parseFloat(protein);
    const cNum = parseFloat(carbs);
    const fNum = parseFloat(fat);
    const sSizeNum = parseFloat(servingSize);

    if (!name.trim()) {
      setError('Please provide a food name.');
      return;
    }

    if (isNaN(calNum) || calNum < 0 || isNaN(pNum) || pNum < 0 || isNaN(cNum) || cNum < 0 || isNaN(fNum) || fNum < 0) {
      setError('Calories, protein, carbs, and fat must be valid non-negative numbers.');
      return;
    }

    if (isNaN(sSizeNum) || sSizeNum <= 0) {
      setError('Serving size must be greater than zero.');
      return;
    }

    const foodPayload: FoodItem = {
      id: initialFood?.id || 'food_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      brand: brand.trim() || undefined,
      barcode: barcode.trim() || undefined,
      basis,
      servingSize: sSizeNum,
      servingUnit: servingUnit.trim() || (basis === '100G' ? 'g' : 'serving'),
      calories: Math.round(calNum * 10) / 10,
      protein: Math.round(pNum * 10) / 10,
      carbohydrates: Math.round(cNum * 10) / 10,
      fat: Math.round(fNum * 10) / 10,
      fiber: fiber ? Math.round(parseFloat(fiber) * 10) / 10 : 0,
      sugars: sugars ? Math.round(parseFloat(sugars) * 10) / 10 : 0,
      sodium: sodium ? Math.round(parseFloat(sodium)) : 0,
      saturatedFat: saturatedFat ? Math.round(parseFloat(saturatedFat) * 10) / 10 : 0,
      notes: notes.trim() || undefined,
      category: 'Custom',
      createdAt: initialFood?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    const res = saveFoodItem(foodPayload);
    if (!res.success) {
      setError(res.error || 'Failed to save food');
      return;
    }

    onSaved(foodPayload);
  };

  const handleDelete = () => {
    if (!initialFood?.id) return;
    if (confirm(`Are you sure you want to delete "${name}" from your food library?`)) {
      deleteFoodItem(initialFood.id);
      if (onDeleted) onDeleted(initialFood.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg my-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg leading-tight">
                {isEditing ? 'Edit Food' : 'Create Custom Food'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Stored permanently in your offline device database
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="food-name" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Food Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="food-name"
                type="text"
                required
                placeholder="e.g. Chicken Biryani, Roti..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="food-brand" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Brand / Source (Optional)
              </label>
              <input
                id="food-brand"
                type="text"
                placeholder="e.g. Shan, Homemade, Karachi..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Barcode Field with custom assignment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="food-barcode" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Custom Barcode / UPC (Optional)
              </label>
              <span className="text-[11px] text-zinc-400">EAN-13, EAN-8, UPC-A, UPC-E</span>
            </div>
            <input
              id="food-barcode"
              type="text"
              placeholder="Scan or type barcode (e.g. 8961014111223)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Once saved, scanning this physical barcode offline instantly recognizes this food item.
            </p>
          </div>

          {/* Nutrient Reference Basis Toggle */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nutritional Values Are Based On:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBasis('SERVING');
                  if (servingSize === '100' && servingUnit === 'g') {
                    setServingSize('1');
                    setServingUnit('piece');
                  }
                }}
                className={`py-2 px-3 text-xs rounded-xl font-medium transition text-center border ${
                  basis === 'SERVING'
                    ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Per Serving / Unit
              </button>
              <button
                type="button"
                onClick={() => {
                  setBasis('100G');
                  setServingSize('100');
                  setServingUnit('g');
                }}
                className={`py-2 px-3 text-xs rounded-xl font-medium transition text-center border ${
                  basis === '100G'
                    ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Per 100g / 100ml
              </button>
            </div>

            {/* Serving Size and Unit */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label htmlFor="serving-size" className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Baseline Size <span className="text-rose-500">*</span>
                </label>
                <input
                  id="serving-size"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium"
                />
              </div>
              <div>
                <label htmlFor="serving-unit" className="block text-[11px] font-medium text-zinc-500 mb-1">
                  Serving Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  id="serving-unit"
                  type="text"
                  required
                  placeholder="g, ml, piece, cup, bowl..."
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Energy & Core Macros */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Core Nutritional Values
            </h4>

            <div>
              <label htmlFor="food-calories" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Calories (kcal) <span className="text-rose-500">*</span>
              </label>
              <input
                id="food-calories"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 text-base focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="food-protein" className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  Protein (g) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="food-protein"
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="food-carbs" className="block text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  Carbs (g) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="food-carbs"
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="food-fat" className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  Fat (g) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="food-fat"
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Optional Nutrients */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Optional Nutrients
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="food-fiber" className="block text-[11px] font-medium text-zinc-500 mb-1">Fiber (g)</label>
                <input
                  id="food-fiber"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>
              <div>
                <label htmlFor="food-sugars" className="block text-[11px] font-medium text-zinc-500 mb-1">Sugars (g)</label>
                <input
                  id="food-sugars"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={sugars}
                  onChange={(e) => setSugars(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>
              <div>
                <label htmlFor="food-sodium" className="block text-[11px] font-medium text-zinc-500 mb-1">Sodium (mg)</label>
                <input
                  id="food-sodium"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="food-notes" className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Personal Notes / Recipe Details
            </label>
            <textarea
              id="food-notes"
              rows={2}
              placeholder="e.g. Prepared with 1 tbsp olive oil, serves 4..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-600/30 transition text-sm"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Create Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
