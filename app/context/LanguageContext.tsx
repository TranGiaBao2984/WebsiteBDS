'use client';

import { useSyncExternalStore } from 'react';
import { dictionaries, type Language } from './index';

const STORAGE_KEY = 'app_lang';
const listeners = new Set<() => void>();

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'ja';
}

function getSnapshot(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLanguage(saved) ? saved : 'en';
  } catch {
    return 'en';
  }
}

function getServerSnapshot(): Language {
  return 'en';
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function setLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore if blocked */
  }
  document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
  document.documentElement.lang = lang;
  listeners.forEach((listener) => listener());
}

export function useLanguage() {
  const currentLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { currentLang, setLanguage, t: dictionaries[currentLang] };
}

export type { Language };