import { WordItem } from '../types';

export interface PresetCollection {
  id: string;
  title: string;
  description: string;
  words: Omit<WordItem, 'id' | 'correctCount' | 'wrongCount'>[];
}

export const PRESET_COLLECTIONS: PresetCollection[] = [
  {
    id: 'starter_basics',
    title: "Boshlang'ich so'zlar",
    description: "Kundalik eng ko'p ishlatiladigan 10 ta asosiy so'z",
    words: [
      { arabic: 'كِتَابٌ', translation: 'kitob' },
      { arabic: 'قَلَمٌ', translation: 'qalam' },
      { arabic: 'بَيْتٌ', translation: 'uy' },
      { arabic: 'مَدْرَسَةٌ', translation: 'maktab' },
      { arabic: 'بَابٌ', translation: 'eshik' },
      { arabic: 'مَاءٌ', translation: 'suv' },
      { arabic: 'طَالِبٌ', translation: 'talaba, o\'quvchi' },
      { arabic: 'أُسْتَاذٌ', translation: 'ustoz, o\'qituvchi' },
      { arabic: 'مَسْجِدٌ', translation: 'masjid' },
      { arabic: 'شَمْسٌ', translation: 'quyosh' },
    ]
  },
  {
    id: 'family_home',
    title: 'Oila va Uy',
    description: "Oila a'zolari va uy jihozlari",
    words: [
      { arabic: 'أَبٌ', translation: 'ota' },
      { arabic: 'أُمٌّ', translation: 'ona' },
      { arabic: 'أَخٌ', translation: 'aka, uka' },
      { arabic: 'أُخْتٌ', translation: 'opa, singil' },
      { arabic: 'غُرْفَةٌ', translation: 'xona' },
      { arabic: 'نَافِذَةٌ', translation: 'deraza' },
      { arabic: 'كُرْسِيٌّ', translation: 'stul, kursi' },
      { arabic: 'طَاوِلَةٌ', translation: 'stol' },
    ]
  },
  {
    id: 'nature_city',
    title: 'Tabiat va Shahar',
    description: 'Atrof-muhit va shahar tushunchalari',
    words: [
      { arabic: 'شَجَرَةٌ', translation: 'daraxt' },
      { arabic: 'قَمَرٌ', translation: 'oy' },
      { arabic: 'سَمَاءٌ', translation: 'osmon' },
      { arabic: 'أَرْضٌ', translation: 'yer' },
      { arabic: 'مَدِينَةٌ', translation: 'shahar' },
      { arabic: 'شَارِعٌ', translation: 'ko\'cha' },
      { arabic: 'سَيَّارَةٌ', translation: 'mashina, avtomobil' },
      { arabic: 'سُوقٌ', translation: 'bozor' },
    ]
  }
];

export function getStarterWords(): WordItem[] {
  return PRESET_COLLECTIONS[0].words.map((w, index) => ({
    id: 'word_preset_' + index + '_' + Date.now(),
    arabic: w.arabic,
    translation: w.translation,
    correctCount: 0,
    wrongCount: 0,
  }));
}
