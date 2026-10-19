import {
  FoodItem,
  DiaryEntry,
  UserProfile,
  BackupData,
  WeightEntry,
  WaterEntry,
  ExerciseEntry,
  ProgressPhoto,
  SavedRecipe,
  FoodDatasetInfo,
} from '../types/index.ts';
import { INITIAL_FOODS } from './defaultFoods.ts';
import {
  AVAILABLE_DATASETS,
  OPEN_FOOD_FACTS_SAMPLE_ITEMS,
  USDA_FOUNDATION_SAMPLE_ITEMS,
} from './downloadableDatasets.ts';

const FOODS_KEY = 'kcaltracker_foods_v2';
const LEGACY_FOODS_KEY = 'kcaltracker_foods_v1';
const DIARY_KEY = 'kcaltracker_diary_v2';
const LEGACY_DIARY_KEY = 'kcaltracker_diary_v1';
const PROFILE_KEY = 'kcaltracker_profile_v2';
const WEIGHT_KEY = 'kcaltracker_weight_v2';
const WATER_KEY = 'kcaltracker_water_v2';
const EXERCISE_KEY = 'kcaltracker_exercise_v2';
const RECIPES_KEY = 'kcaltracker_recipes_v2';
const PHOTOS_KEY = 'kcaltracker_photos_v2';
const DATASETS_KEY = 'kcaltracker_datasets_v2';

export const DEFAULT_USER_PROFILE: UserProfile = {
  dailyCalorieTarget: 2000,
  dailyProteinTarget: 140,
  dailyCarbTarget: 220,
  dailyFatTarget: 65,
  dailyWaterTargetMl: 2500,
  dailyStepTarget: 10000,
  weightTargetKg: 68,
  currentHeightCm: 175,
  weightUnit: 'kg',
  heightUnit: 'cm',
  waterUnit: 'ml',
  macroPreset: 'Balanced',
  healthConnectConnected: false,
  onlineLookupEnabled: true,
  dashboardCardOrder: ['calories', 'macros', 'water', 'steps', 'exercise', 'weight', 'quality'],
  hiddenDashboardCards: [],
  customMealTypes: [],
  updatedAt: Date.now(),
};

// Initial Seed for Weight
const INITIAL_WEIGHT_LOGS: WeightEntry[] = [
  {
    id: 'w_1',
    weightKg: 72.5,
    date: shiftDateString(getTodayDateString(), -14),
    timestamp: Date.now() - 14 * 86400000,
    source: 'MANUAL',
    measurements: { waistCm: 84, hipsCm: 99, chestCm: 102 },
  },
  {
    id: 'w_2',
    weightKg: 71.8,
    date: shiftDateString(getTodayDateString(), -7),
    timestamp: Date.now() - 7 * 86400000,
    source: 'MANUAL',
    measurements: { waistCm: 83.5, hipsCm: 98.5, chestCm: 101.5 },
  },
  {
    id: 'w_3',
    weightKg: 71.2,
    date: getTodayDateString(),
    timestamp: Date.now(),
    source: 'MANUAL',
    notes: 'Morning weigh-in after glass of water.',
    measurements: { waistCm: 83, hipsCm: 98, chestCm: 101 },
  },
];

// Initial Seed for Exercises
const INITIAL_EXERCISES: ExerciseEntry[] = [
  {
    id: 'ex_1',
    name: 'Brisk Morning Walk',
    category: 'Walking',
    durationMinutes: 30,
    distanceKm: 2.8,
    intensity: 'moderate',
    estimatedCalories: 130,
    date: getTodayDateString(),
    timestamp: Date.now() - 3600000,
    source: 'MANUAL',
  },
];

// Initial Seed for Water
const INITIAL_WATER_LOGS: WaterEntry[] = [
  {
    id: 'wat_1',
    amountMl: 500,
    date: getTodayDateString(),
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'wat_2',
    amountMl: 250,
    date: getTodayDateString(),
    timestamp: Date.now() - 3600000,
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatHumanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const todayStr = getTodayDateString();
  const yesterdayStr = shiftDateString(todayStr, -1);
  const tomorrowStr = shiftDateString(todayStr, 1);

  if (dateStr === todayStr) return 'Today, ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (dateStr === yesterdayStr) return 'Yesterday, ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (dateStr === tomorrowStr) return 'Tomorrow, ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------- FOOD STORE & LOOKUP ----------------

export function getStoredFoods(): FoodItem[] {
  try {
    let raw = localStorage.getItem(FOODS_KEY);
    if (!raw) {
      // Migrate from v1 if present
      const v1 = localStorage.getItem(LEGACY_FOODS_KEY);
      if (v1) {
        raw = v1;
      }
    }
    if (!raw) {
      // Merge initial staples + Open Food Facts sample items by default
      const combined = [...INITIAL_FOODS, ...OPEN_FOOD_FACTS_SAMPLE_ITEMS];
      localStorage.setItem(FOODS_KEY, JSON.stringify(combined));
      return combined;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_FOODS;
  } catch (e) {
    return INITIAL_FOODS;
  }
}

export function saveFoodItem(food: FoodItem): { success: boolean; error?: string } {
  try {
    const foods = getStoredFoods();
    const barcodeTrimmed = food.barcode?.trim() || undefined;

    if (barcodeTrimmed) {
      const collision = foods.find(
        (f) => f.id !== food.id && f.barcode && f.barcode.trim().toLowerCase() === barcodeTrimmed.toLowerCase()
      );
      if (collision) {
        return {
          success: false,
          error: `Barcode "${barcodeTrimmed}" is already registered to "${collision.name}". Edit or remove it from that item first.`,
        };
      }
    }

    const cleanFood: FoodItem = {
      ...food,
      barcode: barcodeTrimmed,
      updatedAt: Date.now(),
    };

    const existingIdx = foods.findIndex((f) => f.id === food.id);
    if (existingIdx >= 0) {
      foods[existingIdx] = cleanFood;
    } else {
      foods.unshift(cleanFood);
    }

    localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to save food' };
  }
}

export function deleteFoodItem(foodId: string): void {
  try {
    const foods = getStoredFoods().filter((f) => f.id !== foodId);
    localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
  } catch (e) {
    console.error('Failed deleting food:', e);
  }
}

export function toggleFoodFavorite(foodId: string): void {
  const foods = getStoredFoods();
  const idx = foods.findIndex((f) => f.id === foodId);
  if (idx >= 0) {
    foods[idx] = { ...foods[idx], isFavorite: !foods[idx].isFavorite };
    localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
  }
}

/**
 * Multi-tier Barcode Lookup:
 * Step A: Check personal saved foods & custom barcode mappings in local DB.
 * Step B: Check installed offline datasets (Open Food Facts / USDA).
 * Step C: Online lookup if enabled and connected.
 */
export async function lookupBarcodeMultiTier(barcode: string): Promise<{
  found: boolean;
  food?: FoodItem;
  source: 'PERSONAL' | 'OFFLINE_DATASET' | 'ONLINE_LOOKUP' | 'NONE';
  error?: string;
}> {
  const clean = barcode.trim().toLowerCase();
  if (!clean) return { found: false, source: 'NONE' };

  // Step A: Personal custom foods
  const foods = getStoredFoods();
  const personalMatch = foods.find(
    (f) => (!f.sourceDataset || f.sourceDataset === 'PERSONAL') && f.barcode && f.barcode.trim().toLowerCase() === clean
  );
  if (personalMatch) {
    return { found: true, food: personalMatch, source: 'PERSONAL' };
  }

  // Step B: Installed offline datasets
  const datasetMatch = foods.find(
    (f) => f.barcode && f.barcode.trim().toLowerCase() === clean
  );
  if (datasetMatch) {
    return { found: true, food: datasetMatch, source: 'OFFLINE_DATASET' };
  }

  // Step C: Optional Online Lookup (Open Food Facts API)
  const profile = getUserProfile();
  if (profile.onlineLookupEnabled && navigator.onLine) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${clean}.json`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 1 && data.product) {
          const p = data.product;
          const nutriments = p.nutriments || {};

          const onlineFood: FoodItem = {
            id: 'online_' + clean + '_' + Date.now(),
            name: p.product_name || p.generic_name || 'Packaged Product',
            brand: p.brands || undefined,
            barcode: clean,
            basis: '100G',
            servingSize: 100,
            servingUnit: 'g',
            calories: Math.round(Number(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0)),
            protein: Math.round(Number(nutriments.proteins_100g || 0) * 10) / 10,
            carbohydrates: Math.round(Number(nutriments.carbohydrates_100g || 0) * 10) / 10,
            fat: Math.round(Number(nutriments.fat_100g || 0) * 10) / 10,
            fiber: Math.round(Number(nutriments.fiber_100g || 0) * 10) / 10,
            sugars: Math.round(Number(nutriments.sugars_100g || 0) * 10) / 10,
            sodium: Math.round(Number(nutriments.sodium_100g || 0) * 1000), // convert g to mg
            sourceDataset: 'ONLINE_LOOKUP',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return { found: true, food: onlineFood, source: 'ONLINE_LOOKUP' };
        }
      }
    } catch (e) {
      // Gracefully fall back to unknown
    }
  }

  return { found: false, source: 'NONE' };
}

export function findFoodByBarcode(barcode: string): FoodItem | undefined {
  const clean = barcode.trim().toLowerCase();
  if (!clean) return undefined;
  const foods = getStoredFoods();
  return foods.find((f) => f.barcode && f.barcode.trim().toLowerCase() === clean);
}

// ---------------- DIARY STORE ----------------

export function getAllDiaryEntries(): DiaryEntry[] {
  try {
    let raw = localStorage.getItem(DIARY_KEY);
    if (!raw) {
      const v1 = localStorage.getItem(LEGACY_DIARY_KEY);
      if (v1) raw = v1;
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function getDiaryEntriesForDate(dateStr: string): DiaryEntry[] {
  return getAllDiaryEntries().filter((e) => e.date === dateStr);
}

export function addDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'timestamp'>): DiaryEntry {
  const all = getAllDiaryEntries();
  const newEntry: DiaryEntry = {
    ...entry,
    id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
  };
  all.push(newEntry);
  localStorage.setItem(DIARY_KEY, JSON.stringify(all));
  return newEntry;
}

export function updateDiaryEntryAmount(
  entryId: string,
  newAmount: number,
  newNutrients: { calories: number; protein: number; carbs: number; fat: number; fiber?: number }
): void {
  const all = getAllDiaryEntries();
  const idx = all.findIndex((e) => e.id === entryId);
  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      loggedAmount: newAmount,
      calories: newNutrients.calories,
      protein: newNutrients.protein,
      carbs: newNutrients.carbs,
      fat: newNutrients.fat,
      fiber: newNutrients.fiber ?? all[idx].fiber,
    };
    localStorage.setItem(DIARY_KEY, JSON.stringify(all));
  }
}

export function deleteDiaryEntry(entryId: string): void {
  const all = getAllDiaryEntries().filter((e) => e.id !== entryId);
  localStorage.setItem(DIARY_KEY, JSON.stringify(all));
}

export function copyMealsFromDateToDate(sourceDate: string, targetDate: string): number {
  const all = getAllDiaryEntries();
  const sourceEntries = all.filter((e) => e.date === sourceDate);
  if (sourceEntries.length === 0) return 0;

  const copied: DiaryEntry[] = sourceEntries.map((e) => ({
    ...e,
    id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: targetDate,
    timestamp: Date.now(),
  }));

  all.push(...copied);
  localStorage.setItem(DIARY_KEY, JSON.stringify(all));
  return copied.length;
}

// ---------------- WEIGHT STORE ----------------

export function getAllWeightEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(WEIGHT_KEY);
    if (!raw) {
      localStorage.setItem(WEIGHT_KEY, JSON.stringify(INITIAL_WEIGHT_LOGS));
      return INITIAL_WEIGHT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_WEIGHT_LOGS;
  } catch (e) {
    return INITIAL_WEIGHT_LOGS;
  }
}

export function addWeightEntry(entry: Omit<WeightEntry, 'id' | 'timestamp'>): WeightEntry {
  const all = getAllWeightEntries();
  const newEntry: WeightEntry = {
    ...entry,
    id: 'weight_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };
  // Sort chronologically ascending
  all.push(newEntry);
  all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(all));
  return newEntry;
}

export function deleteWeightEntry(id: string): void {
  const all = getAllWeightEntries().filter((w) => w.id !== id);
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(all));
}

// ---------------- WATER STORE ----------------

export function getAllWaterEntries(): WaterEntry[] {
  try {
    const raw = localStorage.getItem(WATER_KEY);
    if (!raw) {
      localStorage.setItem(WATER_KEY, JSON.stringify(INITIAL_WATER_LOGS));
      return INITIAL_WATER_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_WATER_LOGS;
  } catch (e) {
    return INITIAL_WATER_LOGS;
  }
}

export function getWaterEntriesForDate(dateStr: string): WaterEntry[] {
  return getAllWaterEntries().filter((w) => w.date === dateStr);
}

export function addWaterEntry(amountMl: number, dateStr: string): WaterEntry {
  const all = getAllWaterEntries();
  const newEntry: WaterEntry = {
    id: 'wat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    amountMl: Math.max(10, Math.round(amountMl)),
    date: dateStr,
    timestamp: Date.now(),
  };
  all.push(newEntry);
  localStorage.setItem(WATER_KEY, JSON.stringify(all));
  return newEntry;
}

export function deleteWaterEntry(id: string): void {
  const all = getAllWaterEntries().filter((w) => w.id !== id);
  localStorage.setItem(WATER_KEY, JSON.stringify(all));
}

// ---------------- EXERCISE STORE ----------------

export function getAllExerciseEntries(): ExerciseEntry[] {
  try {
    const raw = localStorage.getItem(EXERCISE_KEY);
    if (!raw) {
      localStorage.setItem(EXERCISE_KEY, JSON.stringify(INITIAL_EXERCISES));
      return INITIAL_EXERCISES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EXERCISES;
  } catch (e) {
    return INITIAL_EXERCISES;
  }
}

export function getExerciseEntriesForDate(dateStr: string): ExerciseEntry[] {
  return getAllExerciseEntries().filter((ex) => ex.date === dateStr);
}

export function addExerciseEntry(entry: Omit<ExerciseEntry, 'id' | 'timestamp'>): ExerciseEntry {
  const all = getAllExerciseEntries();
  const newEntry: ExerciseEntry = {
    ...entry,
    id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };
  all.push(newEntry);
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(all));
  return newEntry;
}

export function deleteExerciseEntry(id: string): void {
  const all = getAllExerciseEntries().filter((ex) => ex.id !== id);
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(all));
}

// ---------------- RECIPES STORE ----------------

export function getAllRecipes(): SavedRecipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveRecipe(recipe: SavedRecipe): void {
  const all = getAllRecipes();
  const idx = all.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    all[idx] = recipe;
  } else {
    all.unshift(recipe);
  }
  localStorage.setItem(RECIPES_KEY, JSON.stringify(all));
}

export function deleteRecipe(id: string): void {
  const all = getAllRecipes().filter((r) => r.id !== id);
  localStorage.setItem(RECIPES_KEY, JSON.stringify(all));
}

// ---------------- PROGRESS PHOTOS STORE ----------------

export function getAllProgressPhotos(): ProgressPhoto[] {
  try {
    const raw = localStorage.getItem(PHOTOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveProgressPhoto(photo: ProgressPhoto): void {
  const all = getAllProgressPhotos();
  all.unshift(photo);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(all));
}

export function deleteProgressPhoto(id: string): void {
  const all = getAllProgressPhotos().filter((p) => p.id !== id);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(all));
}

// ---------------- DATASET MANAGER ----------------

export function getInstalledDatasets(): FoodDatasetInfo[] {
  try {
    const raw = localStorage.getItem(DATASETS_KEY);
    if (!raw) {
      localStorage.setItem(DATASETS_KEY, JSON.stringify(AVAILABLE_DATASETS));
      return AVAILABLE_DATASETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : AVAILABLE_DATASETS;
  } catch (e) {
    return AVAILABLE_DATASETS;
  }
}

export function installDataset(datasetId: string): void {
  const datasets = getInstalledDatasets();
  const idx = datasets.findIndex((d) => d.id === datasetId);
  if (idx >= 0) {
    datasets[idx] = { ...datasets[idx], isInstalled: true, installedAt: Date.now() };
    localStorage.setItem(DATASETS_KEY, JSON.stringify(datasets));

    // Append items to food store
    const currentFoods = getStoredFoods();
    const itemsToAdd =
      datasetId === 'dataset_openfoodfacts_compact'
        ? OPEN_FOOD_FACTS_SAMPLE_ITEMS
        : USDA_FOUNDATION_SAMPLE_ITEMS;

    const merged = [...currentFoods];
    for (const item of itemsToAdd) {
      if (!merged.some((f) => f.id === item.id)) {
        merged.push(item);
      }
    }
    localStorage.setItem(FOODS_KEY, JSON.stringify(merged));
  }
}

export function uninstallDataset(datasetId: string): void {
  const datasets = getInstalledDatasets();
  const idx = datasets.findIndex((d) => d.id === datasetId);
  if (idx >= 0) {
    datasets[idx] = { ...datasets[idx], isInstalled: false, installedAt: undefined };
    localStorage.setItem(DATASETS_KEY, JSON.stringify(datasets));

    // Remove matching items from foods list while keeping personal foods intact
    const sourceTag = datasetId === 'dataset_openfoodfacts_compact' ? 'OPEN_FOOD_FACTS' : 'USDA';
    const filtered = getStoredFoods().filter((f) => f.sourceDataset !== sourceTag);
    localStorage.setItem(FOODS_KEY, JSON.stringify(filtered));
  }
}

// ---------------- USER PROFILE STORE ----------------

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      updatedAt: parsed.updatedAt || Date.now(),
    };
  } catch (e) {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  const clean: UserProfile = {
    ...profile,
    dailyCalorieTarget: Math.max(500, Math.round(profile.dailyCalorieTarget)),
    dailyProteinTarget: Math.max(10, Math.round(profile.dailyProteinTarget)),
    dailyCarbTarget: Math.max(10, Math.round(profile.dailyCarbTarget)),
    dailyFatTarget: Math.max(10, Math.round(profile.dailyFatTarget)),
    updatedAt: Date.now(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(clean));
}

// ---------------- CSV EXPORTS ----------------

export function exportDiaryToCsv(): string {
  const entries = getAllDiaryEntries();
  const headers = ['Date', 'Meal', 'Food Name', 'Brand', 'Amount', 'Unit', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)'];
  const rows = entries.map((e) => [
    e.date,
    e.mealType,
    `"${e.foodName.replace(/"/g, '""')}"`,
    `"${(e.brand || '').replace(/"/g, '""')}"`,
    e.loggedAmount,
    e.loggedUnit,
    e.calories,
    e.protein,
    e.carbs,
    e.fat,
    e.fiber || 0,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportWeightToCsv(): string {
  const weights = getAllWeightEntries();
  const headers = ['Date', 'Weight (kg)', 'Waist (cm)', 'Hips (cm)', 'Chest (cm)', 'Notes', 'Source'];
  const rows = weights.map((w) => [
    w.date,
    w.weightKg,
    w.measurements?.waistCm || '',
    w.measurements?.hipsCm || '',
    w.measurements?.chestCm || '',
    `"${(w.notes || '').replace(/"/g, '""')}"`,
    w.source,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ---------------- BACKUP & RESTORE ----------------

export function exportFullBackup(): BackupData {
  return {
    version: 2,
    exportedAt: Date.now(),
    profile: getUserProfile(),
    foods: getStoredFoods(),
    diaryEntries: getAllDiaryEntries(),
    weightEntries: getAllWeightEntries(),
    waterEntries: getAllWaterEntries(),
    exerciseEntries: getAllExerciseEntries(),
    recipes: getAllRecipes(),
    progressPhotos: getAllProgressPhotos(),
  };
}

export function restoreFullBackup(jsonString: string): { success: boolean; count?: number; error?: string } {
  try {
    const data = JSON.parse(jsonString) as Partial<BackupData>;

    if (!data.foods && !data.diaryEntries && !data.weightEntries) {
      return { success: false, error: 'File is not a valid calorie and fitness tracker backup.' };
    }

    let totalCount = 0;
    if (Array.isArray(data.foods)) {
      localStorage.setItem(FOODS_KEY, JSON.stringify(data.foods));
      totalCount += data.foods.length;
    }
    if (Array.isArray(data.diaryEntries)) {
      localStorage.setItem(DIARY_KEY, JSON.stringify(data.diaryEntries));
      totalCount += data.diaryEntries.length;
    }
    if (Array.isArray(data.weightEntries)) {
      localStorage.setItem(WEIGHT_KEY, JSON.stringify(data.weightEntries));
      totalCount += data.weightEntries.length;
    }
    if (Array.isArray(data.waterEntries)) {
      localStorage.setItem(WATER_KEY, JSON.stringify(data.waterEntries));
      totalCount += data.waterEntries.length;
    }
    if (Array.isArray(data.exerciseEntries)) {
      localStorage.setItem(EXERCISE_KEY, JSON.stringify(data.exerciseEntries));
      totalCount += data.exerciseEntries.length;
    }
    if (Array.isArray(data.recipes)) {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(data.recipes));
    }
    if (Array.isArray(data.progressPhotos)) {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(data.progressPhotos));
    }
    if (data.profile) {
      saveUserProfile(data.profile);
    }

    return { success: true, count: totalCount };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Invalid JSON format' };
  }
}

export function resetToInitialDatabase(): void {
  localStorage.setItem(FOODS_KEY, JSON.stringify([...INITIAL_FOODS, ...OPEN_FOOD_FACTS_SAMPLE_ITEMS]));
  localStorage.setItem(DIARY_KEY, JSON.stringify([]));
  localStorage.setItem(WEIGHT_KEY, JSON.stringify(INITIAL_WEIGHT_LOGS));
  localStorage.setItem(WATER_KEY, JSON.stringify(INITIAL_WATER_LOGS));
  localStorage.setItem(EXERCISE_KEY, JSON.stringify(INITIAL_EXERCISES));
  localStorage.setItem(RECIPES_KEY, JSON.stringify([]));
  localStorage.setItem(PHOTOS_KEY, JSON.stringify([]));
  localStorage.setItem(DATASETS_KEY, JSON.stringify(AVAILABLE_DATASETS));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
}
