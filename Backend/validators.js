// Validation utilities for Saheli Backend

export function isValidProfileId(id) {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

export function isValidDateStr(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return false;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonths[month - 1];
}

export const VALID_BLEEDING_VALUES = ['None', 'Spotting', 'Light', 'Medium', 'Heavy'];

export function validateLogPayload(body, dateParam = null) {
  const errors = [];

  // Date validation
  const targetDate = dateParam || body.date;
  if (!targetDate || !isValidDateStr(targetDate)) {
    errors.push('Invalid date format. Expected YYYY-MM-DD.');
  }

  // Bleeding enum
  if (body.bleeding !== undefined && !VALID_BLEEDING_VALUES.includes(body.bleeding)) {
    errors.push(`Invalid bleeding value. Allowed: ${VALID_BLEEDING_VALUES.join(', ')}.`);
  }

  // Pain score 0-10
  if (body.painScore !== undefined) {
    const num = Number(body.painScore);
    if (!Number.isInteger(num) || num < 0 || num > 10) {
      errors.push('Pain score must be an integer between 0 and 10.');
    }
  }

  // Energy & Mood 1-5
  if (body.energyRating !== undefined) {
    const num = Number(body.energyRating);
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      errors.push('Energy rating must be an integer between 1 and 5.');
    }
  }

  if (body.moodRating !== undefined) {
    const num = Number(body.moodRating);
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      errors.push('Mood rating must be an integer between 1 and 5.');
    }
  }

  // Symptoms and Impact types text arrays
  if (body.symptoms !== undefined) {
    if (!Array.isArray(body.symptoms)) {
      errors.push('Symptoms must be an array of strings.');
    } else if (body.symptoms.length > 50) {
      errors.push('Symptoms array cannot exceed 50 items.');
    } else if (body.symptoms.some((s) => typeof s !== 'string' || s.length > 100)) {
      errors.push('Each symptom must be a string up to 100 characters.');
    }
  }

  if (body.impactTypes !== undefined) {
    if (!Array.isArray(body.impactTypes)) {
      errors.push('Impact types must be an array of strings.');
    } else if (body.impactTypes.length > 20) {
      errors.push('Impact types array cannot exceed 20 items.');
    } else if (body.impactTypes.some((t) => typeof t !== 'string' || t.length > 100)) {
      errors.push('Each impact type must be a string up to 100 characters.');
    }
  }

  // Notes max 500 characters
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== 'string') {
      errors.push('Notes must be a string.');
    } else if (body.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    targetDate
  };
}
