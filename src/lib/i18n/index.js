import { writable, derived } from 'svelte/store';
import { LOCALE_LOAD_DEPENDENCY } from '$lib/i18n/site-locale';
import en from './en.json';
import es from './es.json';

/** @type {Record<string, any>} */
const translations = { en, es };

/** @param {string | null | undefined} lang */
export function normalizeLocale(lang) {
  if (!lang) return 'es';
  const lower = String(lang).toLowerCase();
  if (lower === 'en' || lower.startsWith('en-')) return 'en';
  if (lower === 'es' || lower.startsWith('es')) return 'es';
  return 'es';
}

/**
 * Store de UI (JSON estático). El layout sincroniza con `data.locale` del servidor tras cada load.
 */
export const locale = writable('es');

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
    }
  );
});

/**
 * Persiste idioma en cookie (httpOnly), actualiza el store y dispara `invalidate(LOCALE_LOAD_DEPENDENCY)` para repetir fetch a Sanity.
 * @param {string} lang
 */
export async function setLocale(lang) {
  const normalized = normalizeLocale(lang);
  const res = await fetch('/api/locale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: normalized })
  });
  if (!res.ok) return;
  locale.set(normalized);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lang', normalized);
    localStorage.setItem('lang_manual', '1');
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
  }
  const { invalidate } = await import('$app/navigation');
  await invalidate(LOCALE_LOAD_DEPENDENCY);
}
