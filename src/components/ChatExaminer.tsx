import React, { useState, useRef, useEffect } from 'react';
import { WordItem, ChatMessage } from '../types';
import { parseVocabularyText, verifyAnswer } from '../utils/textNormalizer';
import { speakWord } from '../utils/speech';
import { Send, Volume2, RotateCcw } from 'lucide-react';

interface ChatExaminerProps {
  words: WordItem[];
  onAddWords: (newWords: WordItem[]) => void;
  onUpdateWordScore: (wordId: string, isCorrect: boolean) => void;
}

export const ChatExaminer: React.FC<ChatExaminerProps> = ({
  words,
  onAddWords,
  onUpdateWordScore,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [activeWords, setActiveWords] = useState<WordItem[]>(words);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sync active words when props change
  useEffect(() => {
    setActiveWords(words);
  }, [words]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start exam from index
  const askWordQuestion = (index: number, wordList: WordItem[]) => {
    if (index >= wordList.length) {
      // Test ended
      setCurrentWordIndex(null);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          sender: 'assistant',
          text: `Imtihon yakunlandi. Barcha ${wordList.length} ta so'z tekshirildi. Qayta boshlash uchun "boshlash" deb yozing yoki yangi so'zlar ro'yxatini yuboring.`,
          feedbackType: 'neutral',
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const word = wordList[index];
    setCurrentWordIndex(index);
    setMessages(prev => [
      ...prev,
      {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        // Rule 2 exact prompt structure:
        text: `Bu so'zning tarjimasi qanday: ${word.arabic}?`,
        arabicHighlight: word.arabic,
        feedbackType: 'neutral',
        timestamp: Date.now(),
      },
    ]);
  };

  // User sends message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText) return;

    // Add user message to log
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Case 1: In the middle of an examination question
    if (currentWordIndex !== null && activeWords[currentWordIndex]) {
      const currentWord = activeWords[currentWordIndex];
      const isCorrect = verifyAnswer(cleanText, currentWord.translation, false);
      onUpdateWordScore(currentWord.id, isCorrect);

      setTimeout(() => {
        // Rule 3: "Foydalanuvchi javob yozgach, uning javobi to'g'ri yoki noto'g'riligini qisqacha ayt va keyingi so'zga o't."
        const feedbackText = isCorrect
          ? "To'g'ri!"
          : `Noto'g'ri. To'g'ri javob: ${currentWord.translation}`;

        const assistantFeedbackMsg: ChatMessage = {
          id: 'msg_' + Date.now() + '_fb',
          sender: 'assistant',
          text: feedbackText,
          feedbackType: isCorrect ? 'correct' : 'incorrect',
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantFeedbackMsg]);

        // Move to next word immediately
        setTimeout(() => {
          askWordQuestion(currentWordIndex + 1, activeWords);
        }, 350);
      }, 250);
      return;
    }

    // Case 2: User sends "boshlash", "test", "start" or wants to start exam
    const lower = cleanText.toLowerCase();
    if (lower === 'boshlash' || lower === 'test' || lower === 'start' || lower === 'imtihon') {
      if (activeWords.length === 0) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'msg_' + Date.now(),
              sender: 'assistant',
              text: "Ro'yxatda so'z yo'q. Avval yodlagan so'zlaringizni yuboring (masalan: كِتَابٌ - kitob).",
              feedbackType: 'neutral',
              timestamp: Date.now(),
            },
          ]);
        }, 200);
      } else {
        setTimeout(() => {
          askWordQuestion(0, activeWords);
        }, 200);
      }
      return;
    }

    // Case 3: User inputs new word(s)
    // Rule 1: "Foydalanuvchi o'zi yodlagan arabcha so'zlar ro'yxatini (yoki bitta so'zni) senga yuboradi."
    const parsed = parseVocabularyText(cleanText);
    if (parsed.length > 0) {
      onAddWords(parsed);
      const updatedList = [...activeWords, ...parsed];
      setActiveWords(updatedList);

      setTimeout(() => {
        // Confirm words received and immediately ask first question!
        askWordQuestion(0, updatedList);
      }, 250);
      return;
    }

    // Case 4: Other text, when no words are yet provided
    setTimeout(() => {
      // Adhering to Rule 4: "Foydalanuvchi so'z kiritmaguncha yoki testni boshlashni so'ramaguncha ortiqcha gapirma."
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_' + Date.now(),
          sender: 'assistant',
          text: "Iltimos, yodlagan so'zlaringizni yuboring (masalan: كِتَابٌ - kitob) yoki 'boshlash' deb yozing.",
          feedbackType: 'neutral',
          timestamp: Date.now(),
        },
      ]);
    }, 200);
  };

  const handleStartExamNow = () => {
    if (activeWords.length === 0) return;
    askWordQuestion(0, activeWords);
  };

  const handleResetChat = () => {
    setMessages([]);
    setCurrentWordIndex(null);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-160px)] min-h-[500px] bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/70">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Imtihonchi Yordamchi
          </h3>
          <p className="text-xs text-slate-500">
            Faqat siz yuborgan so'zlar asosida sinov oladi · Ortiqcha gapirmaydi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeWords.length > 0 && currentWordIndex === null && (
            <button
              type="button"
              onClick={handleStartExamNow}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              Testni boshlash ({activeWords.length} ta so'z)
            </button>
          )}

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Suhbatni tozalash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA]">
        {/* Rule 4: Waiting state if no messages */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-xl mb-3">
              ع
            </div>
            <h4 className="text-base font-semibold text-slate-800 mb-1">
              Imtihonchi kutmoqda
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
              Yodlagan so'zlaringizni yuboring (masalan: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-arabic text-sm">كِتَابٌ - kitob</code>) yoki quyidagi tugma orqali mavjud so'zlardan testni boshlang.
            </p>

            {activeWords.length > 0 ? (
              <button
                type="button"
                onClick={handleStartExamNow}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Mavjud {activeWords.length} ta so'zdan testni boshlash
              </button>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                Hozircha so'z kiritilmagan. So'zlaringizni quyidagi maydonga yozing.
              </p>
            )}
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map(msg => {
          const isAssistant = msg.sender === 'assistant';
          const isCorrect = msg.feedbackType === 'correct';
          const isIncorrect = msg.feedbackType === 'incorrect';

          return (
            <div
              key={msg.id}
              className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  isAssistant
                    ? isCorrect
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium'
                      : isIncorrect
                      ? 'bg-red-50 border border-red-200 text-red-900'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                    : 'bg-slate-900 text-white font-medium'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm leading-relaxed">{msg.text}</span>

                  {msg.arabicHighlight && (
                    <button
                      type="button"
                      onClick={() => speakWord(msg.arabicHighlight!, 'ar')}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors shrink-0 cursor-pointer"
                      title="Tinglash"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={chatInputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={
              currentWordIndex !== null
                ? "Javobingizni yozing..."
                : "So'zlarni yuboring (masalan: كِتَابٌ - kitob) yoki 'boshlash' deb yozing..."
            }
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500"
            autoFocus
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white rounded-xl transition-colors cursor-pointer"
            title="Yuborish"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
