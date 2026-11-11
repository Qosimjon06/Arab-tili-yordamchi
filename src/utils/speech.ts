/**
 * Utility to speak Arabic or other words using the browser's Web Speech API
 */
export function speakWord(text: string, lang: 'ar' | 'uz' = 'ar'): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'uz-UZ';
    utterance.rate = 0.85; // slightly slower for clear pronunciation of Arabic diacritics

    // Attempt to pick an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ar') {
      const arVoice = voices.find(v => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic'));
      if (arVoice) {
        utterance.voice = arVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
