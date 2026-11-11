import React from 'react';

interface ArabicKeyboardProps {
  onInsertChar: (char: string) => void;
}

const HARAKAT_CHARS = [
  { label: 'َ  (fatha)', char: '\u064E' },
  { label: 'ِ  (kasra)', char: '\u0650' },
  { label: 'ُ  (damma)', char: '\u064F' },
  { label: 'ً  (fathatan)', char: '\u064B' },
  { label: 'ٍ  (kasratan)', char: '\u064D' },
  { label: 'ٌ  (dammatan)', char: '\u064C' },
  { label: 'ْ  (sukun)', char: '\u0652' },
  { label: 'ّ  (shadda)', char: '\u0651' },
];

const SPECIAL_ARABIC_LETTERS = [
  'ء', 'أ', 'إ', 'آ', 'ؤ', 'ئ', 'ة', 'ى'
];

export const ArabicKeyboard: React.FC<ArabicKeyboardProps> = ({ onInsertChar }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-xs font-medium text-slate-500">Arabcha belgilar va harakatlar</span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {/* Harakat vowels */}
        <div className="flex items-center gap-1 p-0.5 bg-amber-50/60 rounded border border-amber-100/70">
          {HARAKAT_CHARS.map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onInsertChar(h.char)}
              title={h.label}
              className="w-7 h-7 text-sm font-arabic font-bold bg-white text-amber-900 border border-amber-200/60 rounded hover:bg-amber-100 hover:border-amber-300 transition-colors flex items-center justify-center cursor-pointer"
            >
              {'ـ' + h.char}
            </button>
          ))}
        </div>

        {/* Special letters */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-50 rounded border border-slate-200">
          {SPECIAL_ARABIC_LETTERS.map((letter, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onInsertChar(letter)}
              className="w-7 h-7 text-sm font-arabic font-bold bg-white text-slate-800 border border-slate-200 rounded hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
