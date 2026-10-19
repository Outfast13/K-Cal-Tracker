import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNutritionLabel } from './labelParser.ts';

test('parseNutritionLabel: parses standard US nutrition facts correctly', () => {
  const ocrText = `
    Nutrition Facts
    Serving Size 55g
    Amount Per Serving
    Calories 230
    Total Fat 8g
    Saturated Fat 1g
    Trans Fat 0g
    Sodium 160mg
    Total Carbohydrate 37g
    Dietary Fiber 4g
    Total Sugars 12g
    Protein 3g
  `;

  const parsed = parseNutritionLabel(ocrText);
  assert.equal(parsed.calories, 230);
  assert.equal(parsed.protein, 3);
  assert.equal(parsed.carbohydrates, 37);
  assert.equal(parsed.fat, 8);
  assert.equal(parsed.saturatedFat, 1);
  assert.equal(parsed.transFat, 0);
  assert.equal(parsed.fiber, 4);
  assert.equal(parsed.sugars, 12);
  assert.equal(parsed.sodium, 160);
  assert.equal(parsed.isPer100g, false);
  assert.equal(parsed.servingSize, 55);
  assert.equal(parsed.servingUnit, 'g');
});

test('parseNutritionLabel: detects European per 100g and converts salt to sodium', () => {
  const ocrText = `
    NUTRITION INFORMATION
    Typical values per 100g:
    Energy 440 kcal
    Fat 16.5g
    Carbohydrate 64.0g
    Sugars 22.0g
    Protein 7.8g
    Salt 0.85g
  `;

  const parsed = parseNutritionLabel(ocrText);
  assert.equal(parsed.isPer100g, true);
  assert.equal(parsed.calories, 440);
  assert.equal(parsed.fat, 16.5);
  assert.equal(parsed.carbohydrates, 64.0);
  assert.equal(parsed.sugars, 22.0);
  assert.equal(parsed.protein, 7.8);
  // Salt 0.85g * 400 ≈ 340mg sodium
  assert.equal(parsed.sodium, 340);
});
