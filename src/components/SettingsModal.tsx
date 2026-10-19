import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';
import { saveUserProfile } from '../data/storage.ts';
import { calculateMacrosFromPercentages, MACRO_PRESETS } from '../domain/fitness.ts';
import {
  X,
  Settings,
  Target,
  Sliders,
  Sparkles,
  Heart,
  Droplet,
  Footprints,
  Scale,
  Activity,
  CheckCircle2,
  Database,
  Smartphone,
  Save,
} from 'lucide-react';

interface SettingsModalProps {
  profile: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenDatabaseManager: () => void;
  onOpenAndroidProject: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onClose,
  onProfileUpdated,
  onOpenDatabaseManager,
  onOpenAndroidProject,
}) => {
  const [activeSection, setActiveSection] = useState<'nutrition' | 'activity' | 'units' | 'system'>('nutrition');

  // Form states
  const [calorieTarget, setCalorieTarget] = useState(profile.dailyCalorieTarget.toString());
  const [proteinTarget, setProteinTarget] = useState(profile.dailyProteinTarget.toString());
  const [carbTarget, setCarbTarget] = useState(profile.dailyCarbTarget.toString());
  const [fatTarget, setFatTarget] = useState(profile.dailyFatTarget.toString());
  const [macroPreset, setMacroPreset] = useState(profile.macroPreset || 'Balanced');

  const [waterTarget, setWaterTarget] = useState(profile.dailyWaterTargetMl.toString());
  const [stepTarget, setStepTarget] = useState(profile.dailyStepTarget.toString());
  const [weightTarget, setWeightTarget] = useState((profile.weightTargetKg || 70).toString());
  const [heightCm, setHeightCm] = useState(profile.currentHeightCm.toString());

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(profile.weightUnit || 'kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>(profile.heightUnit || 'cm');
  const [waterUnit, setWaterUnit] = useState<'ml' | 'oz'>(profile.waterUnit || 'ml');

  const [healthConnect, setHealthConnect] = useState(profile.healthConnectConnected);
  const [customMeals, setCustomMeals] = useState<string[]>(profile.customMealTypes || ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS']);
  const [newMealInput, setNewMealInput] = useState('');

  // Handle Preset Selection
  const handleApplyPreset = (presetKey: string) => {
    const cals = parseInt(calorieTarget, 10) || 2000;
    const preset = MACRO_PRESETS[presetKey];
    if (preset) {
      const dist = calculateMacrosFromPercentages(cals, preset.proteinPct, preset.carbPct, preset.fatPct);
      setProteinTarget(dist.proteinGrams.toString());
      setCarbTarget(dist.carbGrams.toString());
      setFatTarget(dist.fatGrams.toString());
      setMacroPreset(presetKey);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      dailyCalorieTarget: parseInt(calorieTarget, 10) || 2000,
      dailyProteinTarget: parseInt(proteinTarget, 10) || 140,
      dailyCarbTarget: parseInt(carbTarget, 10) || 200,
      dailyFatTarget: parseInt(fatTarget, 10) || 60,
      macroPreset,
      dailyWaterTargetMl: parseInt(waterTarget, 10) || 2500,
      dailyStepTarget: parseInt(stepTarget, 10) || 10000,
      weightTargetKg: parseFloat(weightTarget) || 70,
      currentHeightCm: parseInt(heightCm, 10) || 175,
      weightUnit,
      heightUnit,
      waterUnit,
      healthConnectConnected: healthConnect,
      customMealTypes: customMeals,
    };

    saveUserProfile(updated);
    onProfileUpdated(updated);
    onClose();
  };

  const handleAddCustomMeal = () => {
    const clean = newMealInput.trim().toUpperCase();
    if (clean && !customMeals.includes(clean)) {
      setCustomMeals([...customMeals, clean]);
      setNewMealInput('');
    }
  };

  const handleRemoveCustomMeal = (meal: string) => {
    if (['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].includes(meal)) return; // protect standard meals
    setCustomMeals(customMeals.filter((m) => m !== meal));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Settings &amp; Targets
              </h3>
              <p className="text-xs text-zinc-400">Configure your fitness goals and preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('nutrition')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              activeSection === 'nutrition'
                ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Nutrition &amp; Macros
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('activity')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              activeSection === 'activity'
                ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Body &amp; Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('units')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              activeSection === 'units'
                ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Units &amp; Meals
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('system')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              activeSection === 'system'
                ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Data &amp; App
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* SECTION 1: NUTRITION & MACROS */}
          {activeSection === 'nutrition' && (
            <div className="space-y-4">
              {/* Daily Calories */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Daily Calorie Budget (kcal)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  required
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-black text-lg"
                />
              </div>

              {/* Macro Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Macro Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(MACRO_PRESETS).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyPreset(key)}
                      className={`p-2.5 rounded-xl text-left border transition ${
                        macroPreset === key
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{key}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gram Targets */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={proteinTarget}
                    onChange={(e) => {
                      setProteinTarget(e.target.value);
                      setMacroPreset('Custom');
                    }}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    {Math.round((parseInt(proteinTarget, 10) * 4) || 0)} kcal
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={carbTarget}
                    onChange={(e) => {
                      setCarbTarget(e.target.value);
                      setMacroPreset('Custom');
                    }}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    {Math.round((parseInt(carbTarget, 10) * 4) || 0)} kcal
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={fatTarget}
                    onChange={(e) => {
                      setFatTarget(e.target.value);
                      setMacroPreset('Custom');
                    }}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    {Math.round((parseInt(fatTarget, 10) * 9) || 0)} kcal
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: BODY & ACTIVITY */}
          {activeSection === 'activity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5" /> Daily Water (mL)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    ≈ {Math.round(parseInt(waterTarget, 10) / 250)} standard cups
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5" /> Daily Step Target
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={stepTarget}
                    onChange={(e) => setStepTarget(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Steps per day
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" /> Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightTarget}
                    onChange={(e) => setWeightTarget(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Health Connect Toggle */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Android Health Connect Sync
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Sync steps, exercises, and weight with deduplication
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={healthConnect}
                  onChange={(e) => setHealthConnect(e.target.checked)}
                  className="w-5 h-5 accent-teal-600 rounded"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: UNITS & MEALS */}
          {activeSection === 'units' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Weight Unit</label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lb">Pounds (lb)</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Height Unit</label>
                  <select
                    value={heightUnit}
                    onChange={(e) => setHeightUnit(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="cm">Centimeters (cm)</option>
                    <option value="in">Inches (in)</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Water Unit</label>
                  <select
                    value={waterUnit}
                    onChange={(e) => setWaterUnit(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    <option value="ml">Milliliters (mL)</option>
                    <option value="oz">Fluid Ounces (fl oz)</option>
                  </select>
                </div>
              </div>

              {/* Custom Meal Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Daily Diary Meal Categories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {customMeals.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      {m}
                      {!['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'].includes(m) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomMeal(m)}
                          className="hover:text-rose-500"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newMealInput}
                    onChange={(e) => setNewMealInput(e.target.value)}
                    placeholder="Add meal (e.g. PRE-WORKOUT, SUPPER)"
                    className="flex-1 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomMeal}
                    className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DATA & APP DOWNLOAD */}
          {activeSection === 'system' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDatabaseManager();
                }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Offline Datasets Manager
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Download Open Food Facts &amp; USDA offline databases
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-600">Open →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAndroidProject();
                }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Native Android Studio Project
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      View all Kotlin source files, Room DB, Compose &amp; download APK build zip
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">Open →</span>
              </button>

              <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 text-[11px] text-zinc-500">
                100% Privacy-Preserving: KcalTracker runs on local Room SQLite / browser LocalStorage. No account or subscription ever required.
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};
