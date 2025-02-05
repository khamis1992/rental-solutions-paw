import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language } from './translations';

interface TranslationStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  dir: () => "ltr" | "rtl";
}

export const useTranslation = create<TranslationStore>()(
  persist(
    (set, get) => ({
      language: 'ar', // Changed default to Arabic
      setLanguage: (language) => set({ language }),
      t: (key) => {
        const keys = key.split('.');
        let value: any = translations[get().language];
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        
        return String(value);
      },
      dir: () => get().language === 'ar' ? 'rtl' : 'ltr',
    }),
    {
      name: 'language-storage',
    }
  )
);