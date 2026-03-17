import { writable, derived } from 'svelte/store';
import en from './en.json';
import es from './es.json';

/** @type {Record<string, any>} */
const translations = { en, es };

/** @param {string | null | undefined} lang */
function normalizeLocale(lang) {
  if (!lang) return 'en';
  const lower = lang.toLowerCase();
  if (lower.startsWith('es')) return 'es';
  return 'en';
}

const defaultLang = (() => {
  // En SSR y si no hay info del navegador, priorizamos ES
  if (typeof window === 'undefined') return 'es';

  const saved = localStorage.getItem('lang');
  const hasManualSelection = localStorage.getItem('lang_manual') === '1';

  // Si el usuario eligió manualmente idioma, respetamos siempre esa preferencia
  if (hasManualSelection && saved) {
    return normalizeLocale(saved);
  }

  const nav = navigator.language || 'es';
  const lower = nav.toLowerCase();

  // Solo navegadores explícitamente en inglés arrancan en EN; el resto, ES
  if (lower.startsWith('en')) return 'en';
  return 'es';
})();

export const locale = writable(defaultLang);

if (typeof document !== 'undefined') {
  document.documentElement.lang = defaultLang;
}

export const t = derived(locale, ($locale) => {
  return (
    /** @param {string} key */
    (key) => {
    const keys = key.split('.');
    /** @type {any} */
    let value = translations[$locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  });
});

/** @param {string} lang */
export function setLocale(lang) {
  const normalized = normalizeLocale(lang);
  locale.set(normalized);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lang', normalized);
    localStorage.setItem('lang_manual', '1');
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
  }
}
