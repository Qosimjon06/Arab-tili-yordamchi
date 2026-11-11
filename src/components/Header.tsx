import React from 'react';
import { BookOpen, MessageSquare, Play, Plus } from 'lucide-react';

interface HeaderProps {
  currentTab: 'exam' | 'chat' | 'vocabulary';
  onSelectTab: (tab: 'exam' | 'chat' | 'vocabulary') => void;
  wordCount: number;
  onStartExam: () => void;
  onOpenAddModal: () => void;
  isExamActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  wordCount,
  onStartExam,
  onOpenAddModal,
  isExamActive,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
          ع
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Arabcha So'z Imtihonchisi
        </span>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectTab('exam')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'exam'
              ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Imtihon</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'chat'
              ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Suhbat rejimi</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('vocabulary')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentTab === 'vocabulary'
              ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-[2px]'
              : 'hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>So'zlar ro'yxati ({wordCount})</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>So'z kiritish</span>
        </button>

        <button
          type="button"
          onClick={onStartExam}
          disabled={wordCount === 0}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            wordCount === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExamActive ? 'Qayta boshlash' : 'Testni boshlash'}</span>
        </button>
      </div>
    </header>
  );
};
