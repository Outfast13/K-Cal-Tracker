export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  basis: '100G' | 'SERVING';
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugars?: number;
  sodium?: number; // in milligrams
  saturatedFat?: number;
  transFat?: number;
  notes?: string;
  category?: 'Pakistani Staples' | 'Proteins' | 'Grains' | 'Dairy' | 'Fruits & Veg' | 'Snacks' | 'Custom';
  isFavorite?: boolean;
  sourceDataset?: 'PERSONAL' | 'OPEN_FOOD_FACTS' | 'USDA' | 'ONLINE_LOOKUP';
  createdAt: number;
  updatedAt: number;
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | string;

export interface DiaryEntry {
  id: string;
  foodId: string;
  foodName: string;
  brand?: string;
  mealType: MealType;
  loggedAmount: number;
  loggedUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
  notes?: string;
  bodyFatPercentage?: number;
  measurements?: {
    waistCm?: number;
    hipsCm?: number;
    chestCm?: number;
    armsCm?: number;
    thighsCm?: number;
  };
  source: 'MANUAL' | 'HEALTH_CONNECT';
}

export interface WaterEntry {
  id: string;
  amountMl: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  category: 'Walking' | 'Running' | 'Cycling' | 'Swimming' | 'Strength' | 'Cardio' | 'Sports' | 'Mobility' | 'Custom';
  durationMinutes: number;
  distanceKm?: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  estimatedCalories: number;
  setsReps?: { sets: number; reps: number; weightKg?: number }[];
  date: string; // YYYY-MM-DD
  timestamp: number;
  notes?: string;
  source: 'MANUAL' | 'HEALTH_CONNECT';
}

export interface ProgressPhoto {
  id: string;
  photoUrl: string; // local base64/blob URL
  date: string; // YYYY-MM-DD
  timestamp: number;
  weightKg?: number;
  pose: 'Front' | 'Side' | 'Back';
  notes?: string;
}

export interface SavedRecipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  ingredients: {
    foodId: string;
    foodName: string;
    amount: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: number;
}

export interface FoodDatasetInfo {
  id: string;
  name: string;
  description: string;
  source: string;
  license: string;
  sizeFormatted: string;
  estimatedItemsCount: number;
  isInstalled: boolean;
  installedAt?: number;
  version: string;
}

export interface UserProfile {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  dailyWaterTargetMl: number;
  dailyStepTarget: number;
  weightTargetKg?: number;
  currentHeightCm: number;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'in';
  waterUnit: 'ml' | 'oz';
  macroPreset: string;
  healthConnectConnected: boolean;
  onlineLookupEnabled: boolean;
  dashboardCardOrder: string[];
  hiddenDashboardCards: string[];
  customMealTypes: string[];
  updatedAt?: number;
}

export interface BackupData {
  version: number;
  exportedAt: number;
  profile: UserProfile;
  foods: FoodItem[];
  diaryEntries: DiaryEntry[];
  weightEntries: WeightEntry[];
  waterEntries: WaterEntry[];
  exerciseEntries: ExerciseEntry[];
  recipes: SavedRecipe[];
  progressPhotos: ProgressPhoto[];
}
