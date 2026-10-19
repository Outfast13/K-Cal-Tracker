/**
 * Domain logic for precise nutrition calculations.
 * Supports basis: '100G' (scaled by amount / 100) or 'SERVING' (scaled by amount / servingSize).
 */

export interface FoodNutrientBaseline {
  basis: '100G' | 'SERVING';
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugars?: number;
  sodium?: number;
  saturatedFat?: number;
  transFat?: number;
}

export interface CalculatedNutrients {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugars: number;
  sodium: number;
  saturatedFat: number;
  transFat: number;
  scaleFactor: number;
}

/**
 * Rounds to 1 decimal place cleanly.
 */
export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Calculates scaled nutrition based on consumed amount and baseline food definition.
 */
export function calculateNutrition(
  food: FoodNutrientBaseline,
  consumedAmount: number
): CalculatedNutrients {
  if (consumedAmount <= 0 || isNaN(consumedAmount)) {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugars: 0,
      sodium: 0,
      saturatedFat: 0,
      transFat: 0,
      scaleFactor: 0,
    };
  }

  let scaleFactor = 1.0;
  if (food.basis === '100G') {
    scaleFactor = consumedAmount / 100.0;
  } else {
    const baselineServing = food.servingSize > 0 ? food.servingSize : 1.0;
    scaleFactor = consumedAmount / baselineServing;
  }

  return {
    calories: roundToOneDecimal(food.calories * scaleFactor),
    protein: roundToOneDecimal(food.protein * scaleFactor),
    carbohydrates: roundToOneDecimal(food.carbohydrates * scaleFactor),
    fat: roundToOneDecimal(food.fat * scaleFactor),
    fiber: roundToOneDecimal((food.fiber ?? 0) * scaleFactor),
    sugars: roundToOneDecimal((food.sugars ?? 0) * scaleFactor),
    sodium: roundToOneDecimal((food.sodium ?? 0) * scaleFactor),
    saturatedFat: roundToOneDecimal((food.saturatedFat ?? 0) * scaleFactor),
    transFat: roundToOneDecimal((food.transFat ?? 0) * scaleFactor),
    scaleFactor,
  };
}
