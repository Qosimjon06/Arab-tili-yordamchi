import { WordItem } from '../types';

/**
 * Removes Arabic harakat/tashkeel (vowels and diacritics)
 */
export function removeArabicDiacritics(text: string): string {
  if (!text) return '';
  return text
    // Arabic diacritics: fathatan, dammatan, kasratan, fatha, damma, kasra, shadda, sukun, dagger alif, tatweel
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // Normalize alif with hamza variants to plain alif for flexible match
    .replace(/[إأآا]/g, 'ا')
    // Normalize taa marbuta to haa if desired, or keep
    .replace(/ة/g, 'ه')
    // Normalize yeh
    .replace(/ى/g, 'ي')
    .trim();
}

/**
 * Normalizes Uzbek/Latin text for flexible matching:
 * - lowercase
 * - removes extra punctuation
 * - unifies Uzbek apostrophes: ', `, ’, ʻ, ‘
 */
export function normalizeUzbekText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[’`‘ʻ]/g, "'")
    .replace(/[.,!?;:"()[\]{}]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Checks whether user answer matches target answer.
 * Allows multiple comma-separated synonyms in target, e.g. "kitob, qo'llanma"
 */
export function verifyAnswer(
  userAnswer: string,
  targetAnswer: string,
  isArabicTarget: boolean = false
): boolean {
  if (!userAnswer || !targetAnswer) return false;

  const cleanUser = userAnswer.trim();

  // If target is Arabic
  if (isArabicTarget) {
    const rawMatch = cleanUser === targetAnswer.trim();
    if (rawMatch) return true;

    // Diacritic-insensitive check
    const normalizedUser = removeArabicDiacritics(cleanUser);
    const normalizedTarget = removeArabicDiacritics(targetAnswer);
    return normalizedUser === normalizedTarget;
  }

  // If target is Uzbek / translation
  const cleanTarget = normalizeUzbekText(targetAnswer);
  const normalizedUser = normalizeUzbekText(cleanUser);

  if (normalizedUser === cleanTarget) return true;

  // Check possible comma / slash separated synonyms in target
  const synonyms = targetAnswer
    .split(/[,/|;]/)
    .map(s => normalizeUzbekText(s))
    .filter(Boolean);

  if (synonyms.some(syn => syn === normalizedUser)) {
    return true;
  }

  // Also check if user typed all synonyms
  return false;
}

/**
 * Checks if a string contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Parses raw text input into list of WordItems.
 * Supports formats like:
 * كِتَابٌ - kitob
 * قَلَمٌ : qalam
 * bayt = uy
 * 1. مَدْرَسَةٌ - maktab
 * or tab-separated / space-separated
 */
export function parseVocabularyText(rawText: string): WordItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const results: WordItem[] = [];

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // Strip leading list numbers like "1.", "1)", "•", "-"
    const stripped = cleanLine.replace(/^(\d+[\.\)]|\*|•|-)\s*/, '').trim();

    // Try finding delimiter: "-", "—", ":", "=", "\t", "|"
    const delimiterMatch = stripped.match(/[-—:=|\t]/);

    let part1 = '';
    let part2 = '';

    if (delimiterMatch && delimiterMatch.index !== undefined) {
      part1 = stripped.slice(0, delimiterMatch.index).trim();
      part2 = stripped.slice(delimiterMatch.index + 1).trim();
    } else {
      // Split by spaces if one part is Arabic and the other is Latin
      const parts = stripped.split(/\s+/);
      if (parts.length >= 2) {
        // Find boundary between Arabic and Latin
        let splitIdx = -1;
        for (let i = 0; i < parts.length - 1; i++) {
          const isCurrAr = containsArabic(parts[i]);
          const isNextAr = containsArabic(parts[i + 1]);
          if (isCurrAr !== isNextAr) {
            splitIdx = i + 1;
            break;
          }
        }
        if (splitIdx !== -1) {
          part1 = parts.slice(0, splitIdx).join(' ').trim();
          part2 = parts.slice(splitIdx).join(' ').trim();
        } else {
          part1 = parts[0];
          part2 = parts.slice(1).join(' ');
        }
      }
    }

    if (!part1 || !part2) continue;

    let arabic = '';
    let translation = '';

    if (containsArabic(part1)) {
      arabic = part1;
      translation = part2;
    } else if (containsArabic(part2)) {
      arabic = part2;
      translation = part1;
    } else {
      // If neither is detected as Arabic, assume part1 is term, part2 is translation
      arabic = part1;
      translation = part2;
    }

    if (arabic && translation) {
      results.push({
        id: 'word_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        arabic,
        translation,
        correctCount: 0,
        wrongCount: 0,
      });
    }
  }

  return results;
}
