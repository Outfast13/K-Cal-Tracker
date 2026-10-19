import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBmi,
  calculateExerciseCalories,
  mlToOz,
  ozToMl,
  calculateMacrosFromPercentages,
  isDuplicateActivity,
} from './fitness.ts';

test('calculateBmi: correctly computes BMI and classifies adult ranges', () => {
  // 70 kg, 175 cm -> BMI = 70 / (1.75^2) = 22.86 -> 22.9 (Normal)
  const normal = calculateBmi(70, 175, 28);
  assert.equal(normal?.bmi, 22.9);
  assert.equal(normal?.category, 'Normal');

  // 95 kg, 175 cm -> BMI = 95 / (1.75^2) = 31.02 -> 31.0 (Obese)
  const obese = calculateBmi(95, 175, 30);
  assert.equal(obese?.bmi, 31.0);
  assert.equal(obese?.category, 'Obese');

  // 50 kg, 175 cm -> BMI = 50 / 3.0625 = 16.3 (Underweight)
  const under = calculateBmi(50, 175, 20);
  assert.equal(under?.bmi, 16.3);
  assert.equal(under?.category, 'Underweight');
});

test('calculateExerciseCalories: MET formula scales by weight and duration', () => {
  // Running moderate: MET 8.3, 70kg, 30 minutes (0.5 hours)
  // Calories = 8.3 * 70 * 0.5 = 290.5 -> 291 kcal
  const running = calculateExerciseCalories('running', 'moderate', 30, 70);
  assert.equal(running, 291);

  // Walking light: MET 2.8, 60kg, 60 minutes
  // Calories = 2.8 * 60 * 1 = 168 kcal
  const walking = calculateExerciseCalories('walking', 'light', 60, 60);
  assert.equal(walking, 168);
});

test('water conversions: converts ml to oz and back', () => {
  assert.equal(mlToOz(500), 16.9);
  assert.equal(ozToMl(16.9), 500);
});

test('calculateMacrosFromPercentages: produces balanced macro distribution', () => {
  // 2000 kcal, 40% carbs, 30% protein, 30% fat
  // Protein: (2000 * 0.3) / 4 = 150g
  // Carbs: (2000 * 0.4) / 4 = 200g
  // Fat: (2000 * 0.3) / 9 = 66.67 -> 67g
  const macros = calculateMacrosFromPercentages(2000, 30, 40, 30);
  assert.equal(macros.proteinGrams, 150);
  assert.equal(macros.carbGrams, 200);
  assert.equal(macros.fatGrams, 67);
});

test('isDuplicateActivity: detects overlap between manual and Health Connect activity', () => {
  const manual = { category: 'Running', timestamp: 1700000000000, durationMinutes: 30 };
  const healthConnectDuplicate = { category: 'running', timestamp: 1700000500000, durationMinutes: 30 }; // 8 mins later
  const healthConnectDifferent = { category: 'running', timestamp: 1700005000000, durationMinutes: 30 }; // >1 hour later

  assert.equal(isDuplicateActivity(manual, healthConnectDuplicate), true);
  assert.equal(isDuplicateActivity(manual, healthConnectDifferent), false);
});
