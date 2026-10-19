/**
 * On-device OCR Nutrition Label Parser.
 * Uses resilient regex patterns to detect and extract nutrition facts
 * from OCR text blocks offline.
 */

export interface ParsedNutritionLabel {
  isPer100g: boolean;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  saturatedFat?: number;
  transFat?: number;
  fiber?: number;
  sugars?: number;
  sodium?: number; // in mg
  rawText: string;
}

export function parseNutritionLabel(text: string): ParsedNutritionLabel {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const fullText = lines.join(' ');

  // 1. Check whether label is per 100g or per 100ml
  const isPer100g = /\b(per\s+100\s*(g|ml)|100g|100ml)\b/i.test(fullText);

  // 2. Extract Calories / Energy
  const calories = extractValue(lines, [
    /\b(?:energy|calories|cal|kcal)\b[^\d]*?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:kcal|calories)\b/i,
  ]);

  // 3. Extract Protein
  const protein = extractValue(lines, [
    /\b(?:protein|proteins)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
    /\b(\d+(?:\.\d+)?)\s*g?\s*protein\b/i,
  ]);

  // 4. Extract Total Carbohydrates
  const carbohydrates = extractValue(lines, [
    /\b(?:total\s*carbohydrate|carbohydrate|carbs|carb)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
    /\b(\d+(?:\.\d+)?)\s*g?\s*(?:carbs|carbohydrates)\b/i,
  ]);

  // 5. Extract Total Fat
  const fat = extractValue(lines, [
    /\b(?:total\s*fat|fat|lipides)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
    /\b(\d+(?:\.\d+)?)\s*g?\s*total\s*fat\b/i,
  ]);

  // 6. Saturated Fat
  const saturatedFat = extractValue(lines, [
    /\b(?:saturated\s*fat|saturated|sat\s*fat)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
  ]);

  // 7. Trans Fat
  const transFat = extractValue(lines, [
    /\b(?:trans\s*fat|trans)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
  ]);

  // 8. Fiber
  const fiber = extractValue(lines, [
    /\b(?:dietary\s*fiber|fiber|fibre)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
  ]);

  // 9. Sugars
  const sugars = extractValue(lines, [
    /\b(?:total\s*sugars|sugars|sugar)\b[^\d]*?(\d+(?:\.\d+)?)\s*g?/i,
  ]);

  // 10. Sodium (in mg) or Salt (in g -> 1g salt ≈ 400mg sodium)
  const sodium = extractSodium(lines);

  // 11. Serving size
  const { size: servingSize, unit: servingUnit } = extractServingSize(lines);

  return {
    isPer100g,
    servingSize,
    servingUnit,
    calories,
    protein,
    carbohydrates,
    fat,
    saturatedFat,
    transFat,
    fiber,
    sugars,
    sodium,
    rawText: text,
  };
}

function extractValue(lines: string[], patterns: RegExp[]): number | undefined {
  for (const regex of patterns) {
    for (const line of lines) {
      const match = line.match(regex);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) return val;
      }
    }
  }
  return undefined;
}

function extractSodium(lines: string[]): number | undefined {
  // Try sodium direct match (mg or g)
  const sodiumRegex = /\bsodium\b[^\d]*?(\d+(?:\.\d+)?)\s*(mg|g)?/i;
  for (const line of lines) {
    const match = line.match(sodiumRegex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        const unit = (match[2] || 'mg').toLowerCase();
        return unit === 'g' ? val * 1000 : val;
      }
    }
  }

  // Salt fallback: Salt (g) * 400 ≈ Sodium (mg)
  const saltRegex = /\bsalt\b[^\d]*?(\d+(?:\.\d+)?)\s*(g|mg)?/i;
  for (const line of lines) {
    const match = line.match(saltRegex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        const unit = (match[2] || 'g').toLowerCase();
        return unit === 'g' ? Math.round(val * 400) : Math.round((val / 1000) * 400);
      }
    }
  }

  return undefined;
}

function extractServingSize(lines: string[]): { size?: number; unit: string } {
  const servingRegex = /\bserving\s*size\b[^\d]*?(\d+(?:\.\d+)?)\s*(g|ml|oz|piece|cup|scoop)?/i;
  for (const line of lines) {
    const match = line.match(servingRegex);
    if (match && match[1]) {
      const size = parseFloat(match[1]);
      const unit = (match[2] || 'g').toLowerCase();
      return { size: isNaN(size) ? undefined : size, unit };
    }
  }
  return { unit: 'g' };
}
