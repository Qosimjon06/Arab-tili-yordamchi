import React, { useEffect } from 'react';
import { WordItem } from '../types';
import { speakWord } from '../utils/speech';
import confetti from 'canvas-confetti';
import { RotateCcw, Volume2, CheckCircle2, ArrowRight } from 'lucide-react';

interface ExamSummaryProps {
  total: number;
  correct: number;
  incorrect: number;
  wrongWords: WordItem[];
  onRestartAll: () => void;
  onRetestWrongWords: (wrongWords: WordItem[]) => void;
  onGoToVocabulary: () => void;
}

export const ExamSummary: React.FC<ExamSummaryProps> = ({
  total,
  correct,
  incorrect,
  wrongWords,
  onRestartAll,
  onRetestWrongWords,
  onGoToVocabulary,
}) => {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    if (percentage >= 80) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [percentage]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Imtihon yakunlandi!
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Siz kiritgan so'zlar bo'yicha to'liq sinov o'tkazildi
        </p>

        {/* Score grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
          <div>
            <span className="block text-2xl font-bold text-slate-900 tabular-nums">
              {percentage}%
            </span>
            <span className="text-xs text-slate-500">O'zlashtirish</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-emerald-600 tabular-nums">
              {correct}
            </span>
            <span className="text-xs text-slate-500">To'g'ri</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-red-600 tabular-nums">
              {incorrect}
            </span>
            <span className="text-xs text-slate-500">Xato</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {wrongWords.length > 0 && (
            <button
              type="button"
              onClick={() => onRetestWrongWords(wrongWords)}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xato qilingan {wrongWords.length} ta so'zni qayta topshirish</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRestartAll}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Barchasini qayta boshlash</span>
          </button>
        </div>
      </div>

      {/* Review Mistakes Section */}
      {wrongWords.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Xato qilingan so'zlar ({wrongWords.length} ta)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Quyidagi so'zlarni eslab qoling va qayta sinab ko'ring:
          </p>

          <div className="divide-y divide-slate-100">
            {wrongWords.map(word => (
              <div key={word.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-arabic text-2xl font-bold text-slate-900">
                    {word.arabic}
                  </span>
                  <button
                    type="button"
                    onClick={() => speakWord(word.arabic, 'ar')}
                    className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                    title="Tinglash"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-semibold text-emerald-800 text-right">
                  {word.translation}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onGoToVocabulary}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>So'zlar ro'yxatiga qaytish</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
