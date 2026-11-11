import React, { useState } from 'react';
import { WordItem } from '../types';
import { parseVocabularyText } from '../utils/textNormalizer';
import { speakWord } from '../utils/speech';
import { PRESET_COLLECTIONS } from '../utils/presetWords';
import { ArabicKeyboard } from './ArabicKeyboard';
import { 
  Volume2, 
  Trash2, 
  Search, 
  Plus, 
  FileText, 
  Download, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface WordManagerProps {
  words: WordItem[];
  onAddWords: (newWords: WordItem[]) => void;
  onDeleteWord: (id: string) => void;
  onClearAll: () => void;
  onStartExam: () => void;
}

export const WordManager: React.FC<WordManagerProps> = ({
  words,
  onAddWords,
  onDeleteWord,
  onClearAll,
  onStartExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [singleArabic, setSingleArabic] = useState('');
  const [singleTranslation, setSingleTranslation] = useState('');
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);
  const [activeInputForKeyboard, setActiveInputForKeyboard] = useState<'single' | 'batch'>('single');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filtered words
  const filteredWords = words.filter(
    w =>
      w.arabic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle single word add
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleArabic.trim() || !singleTranslation.trim()) return;

    const newWord: WordItem = {
      id: 'word_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      arabic: singleArabic.trim(),
      translation: singleTranslation.trim(),
      correctCount: 0,
      wrongCount: 0,
    };

    onAddWords([newWord]);
    setSingleArabic('');
    setSingleTranslation('');
  };

  // Handle batch import
  const handleBatchImport = () => {
    const parsed = parseVocabularyText(batchText);
    if (parsed.length > 0) {
      onAddWords(parsed);
      setBatchText('');
      setIsBatchOpen(false);
    }
  };

  // Insert character from Arabic keyboard
  const handleInsertChar = (char: string) => {
    if (activeInputForKeyboard === 'single') {
      setSingleArabic(prev => prev + char);
    } else {
      setBatchText(prev => prev + char);
    }
  };

  // Load a preset collection
  const handleLoadPreset = (collectionId: string) => {
    const collection = PRESET_COLLECTIONS.find(c => c.id === collectionId);
    if (!collection) return;

    const newWords: WordItem[] = collection.words.map((w, idx) => ({
      id: 'word_' + collectionId + '_' + idx + '_' + Date.now(),
      arabic: w.arabic,
      translation: w.translation,
      correctCount: 0,
      wrongCount: 0,
    }));

    onAddWords(newWords);
  };

  // Export word list
  const handleExportText = () => {
    const text = words.map(w => `${w.arabic} - ${w.translation}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const parsedPreview = batchText.trim() ? parseVocabularyText(batchText) : [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Yodlangan so'zlar bazasi
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Imtihon faqat ushbu ro'yxatdagi so'zlar bo'yicha olib boriladi ({words.length} ta so'z)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsBatchOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ro'yxatdan nusxa ko'chirish / Matn kiritish</span>
          </button>

          {words.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportText}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Ro'yxatni nusxalash"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nusxa olish</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tozalash</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preset collections quick-load if list is small or empty */}
      {words.length < 5 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-amber-900">
              Tayyor to'plamlar bilan sinab ko'rish
            </h3>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            O'zingizning shaxsiy so'zlaringiz bo'lmasa, quyidagi mavzuli to'plamlardan birini bitta bosish orqali qo'shishingiz mumkin:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLLECTIONS.map(col => (
              <button
                key={col.id}
                type="button"
                onClick={() => handleLoadPreset(col.id)}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-amber-100/60 text-slate-800 border border-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                + {col.title} ({col.words.length} ta)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single Word Input Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Bitta yangi so'z qo'shish</h3>
          <button
            type="button"
            onClick={() => {
              setActiveInputForKeyboard('single');
              setShowArabicKeyboard(v => !v);
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
          >
            {showArabicKeyboard ? "Arabcha klaviaturani yashirish" : "Arabcha harakatlar / klaviatura"}
          </button>
        </div>

        {showArabicKeyboard && (
          <div className="mb-3">
            <ArabicKeyboard onInsertChar={handleInsertChar} />
          </div>
        )}

        <form onSubmit={handleAddSingle} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Arabcha so'z
            </label>
            <input
              type="text"
              dir="rtl"
              value={singleArabic}
              onChange={e => setSingleArabic(e.target.value)}
              placeholder="كِتَابٌ"
              className="w-full px-3.5 py-2 text-lg font-arabic text-right bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              O'zbekcha tarjimasi (sinonimlarni vergul bilan yozish mumkin)
            </label>
            <input
              type="text"
              value={singleTranslation}
              onChange={e => setSingleTranslation(e.target.value)}
              placeholder="kitob, qo'llanma"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!singleArabic.trim() || !singleTranslation.trim()}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Qo'shish</span>
            </button>
          </div>
        </form>
      </div>

      {/* Batch Paste Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                So'zlar ro'yxatini matn sifatida joylash
              </h3>
              <button
                type="button"
                onClick={() => setIsBatchOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-3 text-xs text-slate-500 space-y-1">
              <p>Har bir qatorga bitta so'z va uning tarjimasini kiriting. Format avtomatik aniqlanadi:</p>
              <p className="font-mono bg-slate-50 p-2 rounded text-slate-700">
                كِتَابٌ - kitob<br/>
                قَلَمٌ : qalam<br/>
                بَيْتٌ = uy
              </p>
            </div>

            <div className="flex-1 min-h-[160px] flex flex-col mb-3">
              <textarea
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                placeholder="كِتَابٌ - kitob&#10;قَلَمٌ - qalam&#10;بَيْتٌ - uy"
                rows={8}
                className="w-full flex-1 p-3 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            {parsedPreview.length > 0 && (
              <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span>{parsedPreview.length} ta so'z muvaffaqiyatli aniqlandi</span>
                <span className="font-arabic font-semibold">{parsedPreview[0]?.arabic} ↔ {parsedPreview[0]?.translation}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                disabled={parsedPreview.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer"
              >
                {parsedPreview.length > 0 ? `${parsedPreview.length} ta so'zni qo'shish` : "So'z kiritilmagan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Words List Header & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="So'zlarni qidirish..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          {words.length > 0 && (
            <button
              type="button"
              onClick={onStartExam}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Ushbu {words.length} ta so'zdan imtihon topshirish</span>
            </button>
          )}
        </div>

        {/* Word Table */}
        {filteredWords.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              {words.length === 0 ? "Hozircha hech qanday so'z kiritilmagan" : "Qidiruv bo'yicha so'z topilmadi"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {words.length === 0
                ? "Imtihonni boshlash uchun yuqoridagi formadan so'z qo'shing yoki tayyor to'plamni yuklang."
                : "Boshqa so'z qidirib ko'ring."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4 text-right">Arabcha</th>
                  <th className="py-2.5 px-4">Talaffuz</th>
                  <th className="py-2.5 px-4">O'zbekcha tarjimasi</th>
                  <th className="py-2.5 px-4 text-center">Natijalar</th>
                  <th className="py-2.5 px-4 w-16 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWords.map((word, idx) => (
                  <tr key={word.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-400 text-center tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-arabic text-xl font-bold text-slate-900 tracking-wide">
                        {word.arabic}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => speakWord(word.arabic, 'ar')}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="Tinglash"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {word.translation}
                    </td>
                    <td className="py-3 px-4 text-center text-xs tabular-nums">
                      {word.correctCount > 0 || word.wrongCount > 0 ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-emerald-700 font-semibold">✓ {word.correctCount}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-red-600 font-semibold">✗ {word.wrongCount}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Sinovdan o'tmagan</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteWord(word.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
