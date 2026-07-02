import { create } from 'zustand';
import i18n from '@/locales';

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'vi',
  setLanguage: (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('ums_language', lang);
    set({ language: lang });
  },
}));
