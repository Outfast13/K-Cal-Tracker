import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNutrition, roundToOneDecimal } from './nutrition.ts';

test('roundToOneDecimal rounds correctly', () => {
  assert.equal(roundToOneDecimal(15.44), 15.4);
  assert.equal(roundToOneDecimal(15.46), 15.5);
  assert.equal(roundToOneDecimal(20.0), 20.0);
});

test('calculateNutrition: scales per 100g basis accurately with fractional amounts', () => {
  // 250 kcal per 100g, 10g protein, 30g carbs, 10g fat
  const food = {
    basis: '100G' as const,
    servingSize: 100,
    servingUnit: 'g',
    calories: 250,
    protein: 10,
    carbohydrates: 30,
    fat: 10,
    fiber: 5,
    sodium: 200,
  };

  // Consumed 60g -> factor is 0.6
  const result = calculateNutrition(food, 60);

  assert.equal(result.calories, 150);
  assert.equal(result.protein, 6);
  assert.equal(result.carbohydrates, 18);
  assert.equal(result.fat, 6);
  assert.equal(result.fiber, 3);
  assert.equal(result.sodium, 120);
  assert.equal(result.scaleFactor, 0.6);
});

test('calculateNutrition: scales per SERVING basis with multiple servings', () => {
  // 1 Paratha (80g) = 290 kcal, 5g protein, 35g carbs, 14.5g fat
  const food = {
    basis: 'SERVING' as const,
    servingSize: 1,
    servingUnit: 'piece',
    calories: 290,
    protein: 5,
    carbohydrates: 35,
    fat: 14.5,
  };

  // Consumed 2.5 parathas
  const result = calculateNutrition(food, 2.5);

  assert.equal(result.calories, 725);
  assert.equal(result.protein, 12.5);
  assert.equal(result.carbohydrates, 87.5);
  assert.equal(result.fat, 36.3); // 14.5 * 2.5 = 36.25 -> 36.3
  assert.equal(result.scaleFactor, 2.5);
});

test('calculateNutrition: returns 0 for zero or negative amounts', () => {
  const food = {
    basis: '100G' as const,
    servingSize: 100,
    servingUnit: 'g',
    calories: 130,
    protein: 2.7,
    carbohydrates: 28.2,
    fat: 0.3,
  };

  const zeroResult = calculateNutrition(food, 0);
  assert.equal(zeroResult.calories, 0);
  assert.equal(zeroResult.protein, 0);

  const negResult = calculateNutrition(food, -50);
  assert.equal(negResult.calories, 0);
});
