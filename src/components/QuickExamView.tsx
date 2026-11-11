import React, { useState, useEffect, useRef } from 'react';
import { WordItem, ExamDirection } from '../types';
import { verifyAnswer } from '../utils/textNormalizer';
import { speakWord } from '../utils/speech';
import { ArabicKeyboard } from './ArabicKeyboard';
import { 
  Volume2, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  Keyboard
} from 'lucide-react';

interface QuickExamViewProps {
  words: WordItem[];
  onFinishRound: (results: { total: number; correct: number; incorrect: number; wrongWords: WordItem[] }) => void;
  onUpdateWordScore: (wordId: string, isCorrect: boolean) => void;
  onGoToWordManager: () => void;
}

export const QuickExamView: React.FC<QuickExamViewProps> = ({
  words,
  onFinishRound,
  onUpdateWordScore,
  onGoToWordManager,
}) => {
  const [direction, setDirection] = useState<ExamDirection>('ar_to_uz');
  const [isShuffled, setIsShuffled] = useState(true);
  const [examQueue, setExamQueue] = useState<WordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; target: string } | null>(null);
  const [wrongWordsInRound, setWrongWordsInRound] = useState<WordItem[]>([]);
  const [correctCountInRound, setCorrectCountInRound] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset exam queue
  const initExam = (directionChoice: ExamDirection = direction, shuffleChoice: boolean = isShuffled) => {
    if (words.length === 0) return;
    let list = [...words];
    if (shuffleChoice) {
      list = list.sort(() => Math.random() - 0.5);
    }
    setExamQueue(list);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowFeedback(false);
    setLastResult(null);
    setWrongWordsInRound([]);
    setCorrectCountInRound(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    initExam(direction, isShuffled);
  }, [words]);

  const currentWord = examQueue[currentIndex];

  // Auto focus input
  useEffect(() => {
    if (!showFeedback) {
      inputRef.current?.focus();
    }
  }, [currentIndex, showFeedback]);

  // Handle Answer Submission
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentWord || showFeedback || !userAnswer.trim()) return;

    const isArabicExpected = direction === 'uz_to_ar';
    const target = isArabicExpected ? currentWord.arabic : currentWord.translation;
    const isCorrect = verifyAnswer(userAnswer, target, isArabicExpected);

    setLastResult({ isCorrect, target });
    setShowFeedback(true);
    onUpdateWordScore(currentWord.id, isCorrect);

    if (isCorrect) {
      setCorrectCountInRound(prev => prev + 1);
    } else {
      setWrongWordsInRound(prev => [...prev, currentWord]);
    }
  };

  // Move to next question or finish round
  const handleNextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer('');
    setLastResult(null);

    if (currentIndex + 1 < examQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all words
      const total = examQueue.length;
      const correct = correctCountInRound + (lastResult?.isCorrect ? 1 : 0);
      const incorrect = total - correct;
      onFinishRound({
        total,
        correct,
        incorrect,
        wrongWords: wrongWordsInRound,
      });
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showFeedback && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleNextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, currentIndex, examQueue.length]);

  if (words.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Hozircha so'zlar kiritilmagan
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Imtihonchi yordamchi hech qanday yangi so'z o'ylab topmaydi. Sinovdan o'tish uchun avval o'zingiz yodlagan so'zlar ro'yxatini kiriting.
        </p>
        <button
          type="button"
          onClick={onGoToWordManager}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer"
        >
          So'zlar ro'yxatini kiritish
        </button>
      </div>
    );
  }

  if (!currentWord) return null;

  const promptText =
    direction === 'ar_to_uz'
      ? `Bu so'zning tarjimasi qanday: ${currentWord.arabic}?`
      : `Ushbu so'zning arabcha varianti qanday: ${currentWord.translation}?`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Examination Meta Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 tabular-nums">
            Savol {currentIndex + 1} / {examQueue.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-700 font-medium tabular-nums">
            To'g'ri: {correctCountInRound}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-red-600 font-medium tabular-nums">
            Xato: {wrongWordsInRound.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const newDir: ExamDirection = direction === 'ar_to_uz' ? 'uz_to_ar' : 'ar_to_uz';
              setDirection(newDir);
              initExam(newDir, isShuffled);
            }}
            className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
            title="Yo'nalishni o'zgartirish"
          >
            <span>{direction === 'ar_to_uz' ? 'Arabcha → O\'zbekcha' : 'O\'zbekcha → Arabcha'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsShuffled(!isShuffled);
              initExam(direction, !isShuffled);
            }}
            className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
              isShuffled ? 'text-emerald-700' : 'text-slate-400'
            }`}
            title="Tasodifiy tartib"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => initExam(direction, isShuffled)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / examQueue.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Strictly formatted prompt as requested in rule 2 */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-slate-500 mb-2">
            Imtihonchi savoli:
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {promptText}
          </h2>

          {/* Large display of the question word */}
          <div className="mt-5 py-6 px-4 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-center gap-4">
            {direction === 'ar_to_uz' ? (
              <span className="font-arabic text-4xl sm:text-5xl font-bold text-slate-950 tracking-wider">
                {currentWord.arabic}
              </span>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {currentWord.translation}
              </span>
            )}

            <button
              type="button"
              onClick={() => speakWord(currentWord.arabic, 'ar')}
              className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
              title="Ovozli tinglash"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Answer Form */}
        {!showFeedback ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-600">
                  {direction === 'ar_to_uz'
                    ? "O'zbekcha tarjimasini yozing:"
                    : "Arabcha so'zni yozing:"}
                </label>
                {direction === 'uz_to_ar' && (
                  <button
                    type="button"
                    onClick={() => setShowKeyboard(v => !v)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>{showKeyboard ? 'Klaviaturani yopish' : 'Arabcha harakatlar'}</span>
                  </button>
                )}
              </div>

              {showKeyboard && direction === 'uz_to_ar' && (
                <div className="mb-3">
                  <ArabicKeyboard onInsertChar={char => setUserAnswer(prev => prev + char)} />
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                dir={direction === 'uz_to_ar' ? 'rtl' : 'ltr'}
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder={
                  direction === 'ar_to_uz'
                    ? "Javobingizni kiriting va Enter tugmasini bosing..."
                    : "Arabcha so'zni kiriting..."
                }
                className={`w-full px-4 py-3.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                  direction === 'uz_to_ar'
                    ? 'font-arabic text-xl font-bold border-slate-300'
                    : 'border-slate-300 focus:border-emerald-600'
                }`}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Tasdiqlash uchun <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">Enter</kbd> bosing
              </span>

              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Javobni tekshirish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Rule 3: Concise verdict & immediate advance */
          <div className="space-y-4 pt-2">
            {lastResult?.isCorrect ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-lg mb-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>To'g'ri!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Sizning javobingiz: <strong className="font-semibold">{userAnswer}</strong>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-red-800 font-bold text-lg mb-1">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span>Noto'g'ri.</span>
                </div>
                <p className="text-sm text-red-900 mt-1">
                  To'g'ri javob:{' '}
                  <strong className={direction === 'uz_to_ar' ? 'font-arabic text-xl font-bold' : 'font-bold'}>
                    {lastResult?.target}
                  </strong>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Sizning javobingiz: {userAnswer || "(bo'sh)"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Keyingisiga o'tish uchun <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">Enter</kbd> yoki <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[11px]">Space</kbd> bosing
              </span>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <span>Keyingi so'z</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
