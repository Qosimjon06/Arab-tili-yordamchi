export interface WordItem {
  id: string;
  arabic: string;
  translation: string;
  correctCount: number;
  wrongCount: number;
  lastTested?: number;
}

export type ExamDirection = 'ar_to_uz' | 'uz_to_ar';

export interface ExamQuestion {
  word: WordItem;
  prompt: string;
  targetAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
  answeredAt?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  arabicHighlight?: string;
  feedbackType?: 'correct' | 'incorrect' | 'neutral';
  timestamp: number;
}

export interface ExamStats {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  streak: number;
  bestStreak: number;
}
