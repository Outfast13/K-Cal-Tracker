/**
 * Fitness, Nutrition Targets, BMI, Water, and Activity domain calculations.
 * Pure decoupled logic for fast deterministic testing.
 */

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
  isAdult: boolean;
}

/**
 * Calculates BMI based on weight (kg) and height (cm).
 * Formula: weight / (height / 100)^2
 */
export function calculateBmi(weightKg: number, heightCm: number, age: number = 25): BmiResult | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  const isAdult = age >= 18;
  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  let color = '#10B981'; // Green

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#3B82F6'; // Blue
  } else if (bmi <= 24.9) {
    category = 'Normal';
    color = '#10B981'; // Green
  } else if (bmi <= 29.9) {
    category = 'Overweight';
    color = '#F59E0B'; // Amber
  } else {
    category = 'Obese';
    color = '#EF4444'; // Red
  }

  return { bmi, category, color, isAdult };
}

/**
 * Standard MET values (Metabolic Equivalent of Task) for common activities.
 */
export const ACTIVITY_MET_TABLE: Record<string, { light: number; moderate: number; vigorous: number }> = {
  walking: { light: 2.8, moderate: 3.5, vigorous: 4.5 },
  running: { light: 6.0, moderate: 8.3, vigorous: 11.5 },
  cycling: { light: 4.0, moderate: 6.8, vigorous: 10.0 },
  swimming: { light: 5.0, moderate: 7.0, vigorous: 9.8 },
  strength: { light: 3.0, moderate: 4.5, vigorous: 6.0 },
  cardio: { light: 5.0, moderate: 7.5, vigorous: 9.5 },
  sports: { light: 4.5, moderate: 7.0, vigorous: 10.0 },
  yoga_mobility: { light: 2.0, moderate: 2.8, vigorous: 3.8 },
  general: { light: 3.0, moderate: 5.0, vigorous: 7.5 },
};

/**
 * Calculates estimated calorie expenditure based on MET, weight in kg, and duration in minutes.
 * Formula: Calories = MET * Weight(kg) * (Duration_mins / 60)
 */
export function calculateExerciseCalories(
  categoryKey: string,
  intensity: 'light' | 'moderate' | 'vigorous',
  durationMinutes: number,
  userWeightKg: number = 70
): number {
  if (durationMinutes <= 0 || userWeightKg <= 0) return 0;
  const activity = ACTIVITY_MET_TABLE[categoryKey.toLowerCase()] || ACTIVITY_MET_TABLE.general;
  const met = activity[intensity] || activity.moderate;
  const hours = durationMinutes / 60;
  return Math.round(met * userWeightKg * hours);
}

/**
 * Water unit conversions.
 * 1 US Fluid Ounce = 29.5735 mL
 */
export function mlToOz(ml: number): number {
  return Math.round((ml / 29.5735) * 10) / 10;
}

export function ozToMl(oz: number): number {
  return Math.round(oz * 29.5735);
}

/**
 * Macro preset calculation helper.
 * 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
 */
export interface MacroDistribution {
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
}

export function calculateMacrosFromPercentages(
  calories: number,
  proteinPct: number,
  carbPct: number,
  fatPct: number
): MacroDistribution {
  const safeCal = Math.max(500, calories);
  const pGrams = Math.round((safeCal * (proteinPct / 100)) / 4);
  const cGrams = Math.round((safeCal * (carbPct / 100)) / 4);
  const fGrams = Math.round((safeCal * (fatPct / 100)) / 9);

  return {
    proteinGrams: pGrams,
    carbGrams: cGrams,
    fatGrams: fGrams,
    proteinPct,
    carbPct,
    fatPct,
  };
}

export const MACRO_PRESETS: Record<
  string,
  { proteinPct: number; carbPct: number; fatPct: number; description: string }
> = {
  Balanced: {
    proteinPct: 25,
    carbPct: 45,
    fatPct: 30,
    description: '25% Protein, 45% Carbs, 30% Fat - Everyday health & energy',
  },
  'High Protein': {
    proteinPct: 40,
    carbPct: 35,
    fatPct: 25,
    description: '40% Protein, 35% Carbs, 25% Fat - Hypertrophy & lean muscle gain',
  },
  'Low Carb / Keto': {
    proteinPct: 25,
    carbPct: 10,
    fatPct: 65,
    description: '25% Protein, 10% Carbs, 65% Fat - Ketogenic & fat adaptation',
  },
  Endurance: {
    proteinPct: 20,
    carbPct: 55,
    fatPct: 25,
    description: '20% Protein, 55% Carbs, 25% Fat - Long distance running & cycling',
  },
};

/**
 * Checks for deduplication between Health Connect records and manual logs.
 * Two activities are considered duplicates if they overlap in timestamp within a 15-minute window and share category.
 */
export function isDuplicateActivity(
  manualActivity: { category: string; timestamp: number; durationMinutes: number },
  healthConnectRecord: { category: string; timestamp: number; durationMinutes: number }
): boolean {
  if (manualActivity.category.toLowerCase() !== healthConnectRecord.category.toLowerCase()) {
    return false;
  }
  const diffMs = Math.abs(manualActivity.timestamp - healthConnectRecord.timestamp);
  const fifteenMinutesMs = 15 * 60 * 1000;
  return diffMs <= fifteenMinutesMs;
}
