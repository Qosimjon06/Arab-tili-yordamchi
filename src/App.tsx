import { useState, useEffect } from 'react';
import { WordItem } from './types';
import { getStarterWords } from './utils/presetWords';
import { Header } from './components/Header';
import { QuickExamView } from './components/QuickExamView';
import { ChatExaminer } from './components/ChatExaminer';
import { WordManager } from './components/WordManager';
import { ExamSummary } from './components/ExamSummary';

const STORAGE_KEY = 'arabic_vocab_words_v1';

export default function App() {
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to starter words
    }
    return getStarterWords();
  });

  const [currentTab, setCurrentTab] = useState<'exam' | 'chat' | 'vocabulary' | 'summary'>('exam');
  const [activeExamWords, setActiveExamWords] = useState<WordItem[]>(words);
  const [summaryData, setSummaryData] = useState<{
    total: number;
    correct: number;
    incorrect: number;
    wrongWords: WordItem[];
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (err) {
      console.error('Failed to save words to localStorage', err);
    }
  }, [words]);

  // Handle adding words
  const handleAddWords = (newWords: WordItem[]) => {
    setWords(prev => {
      // Avoid duplicate arabic words
      const existingArabic = new Set(prev.map(w => w.arabic.trim()));
      const filteredNew = newWords.filter(w => !existingArabic.has(w.arabic.trim()));
      return [...prev, ...filteredNew];
    });
  };

  // Handle deleting word
  const handleDeleteWord = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
    setActiveExamWords(prev => prev.filter(w => w.id !== id));
  };

  // Handle clear all words
  const handleClearAll = () => {
    setWords([]);
    setActiveExamWords([]);
    setSummaryData(null);
  };

  // Handle updating score
  const handleUpdateWordScore = (wordId: string, isCorrect: boolean) => {
    setWords(prev =>
      prev.map(w => {
        if (w.id === wordId) {
          return {
            ...w,
            correctCount: isCorrect ? w.correctCount + 1 : w.correctCount,
            wrongCount: isCorrect ? w.wrongCount : w.wrongCount + 1,
            lastTested: Date.now(),
          };
        }
        return w;
      })
    );
  };

  // Start exam with all words
  const handleStartExam = () => {
    setActiveExamWords(words);
    setSummaryData(null);
    setCurrentTab('exam');
  };

  // Finish an exam round
  const handleFinishRound = (results: {
    total: number;
    correct: number;
    incorrect: number;
    wrongWords: WordItem[];
  }) => {
    setSummaryData(results);
    setCurrentTab('summary');
  };

  // Retest only mistaken words
  const handleRetestWrongWords = (wrongWords: WordItem[]) => {
    setActiveExamWords(wrongWords);
    setSummaryData(null);
    setCurrentTab('exam');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Top Bar Contract compliant navigation */}
      <Header
        currentTab={currentTab === 'summary' ? 'exam' : currentTab}
        onSelectTab={tab => {
          setSummaryData(null);
          setCurrentTab(tab);
        }}
        wordCount={words.length}
        onStartExam={handleStartExam}
        onOpenAddModal={() => setCurrentTab('vocabulary')}
        isExamActive={currentTab === 'exam'}
      />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'exam' && (
          <QuickExamView
            words={activeExamWords.length > 0 ? activeExamWords : words}
            onFinishRound={handleFinishRound}
            onUpdateWordScore={handleUpdateWordScore}
            onGoToWordManager={() => setCurrentTab('vocabulary')}
          />
        )}

        {currentTab === 'chat' && (
          <ChatExaminer
            words={words}
            onAddWords={handleAddWords}
            onUpdateWordScore={handleUpdateWordScore}
          />
        )}

        {currentTab === 'vocabulary' && (
          <WordManager
            words={words}
            onAddWords={handleAddWords}
            onDeleteWord={handleDeleteWord}
            onClearAll={handleClearAll}
            onStartExam={handleStartExam}
          />
        )}

        {currentTab === 'summary' && summaryData && (
          <ExamSummary
            total={summaryData.total}
            correct={summaryData.correct}
            incorrect={summaryData.incorrect}
            wrongWords={summaryData.wrongWords}
            onRestartAll={handleStartExam}
            onRetestWrongWords={handleRetestWrongWords}
            onGoToVocabulary={() => setCurrentTab('vocabulary')}
          />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="py-4 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>Arabcha So'z Imtihonchisi</span>
          <span aria-hidden="true">·</span>
          <span>Faqat foydalanuvchi kiritgan so'zlar asosida</span>
          <span aria-hidden="true">·</span>
          <span>Web Speech API talaffuz qo'llab-quvvatlovi</span>
        </div>
      </footer>
    </div>
  );
}
