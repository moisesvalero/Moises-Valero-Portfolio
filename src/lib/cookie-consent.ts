import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type CookieConsentValue = 'all' | 'essential';

const STORAGE_KEY = 'mv_cookie_consent_v1';

function readStored(): CookieConsentValue | null {
  if (!browser) return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'all' || v === 'essential') return v;
  } catch {
    /* ignore */
  }
  return null;
}

/** `null` = usuario aún no ha elegido (mostrar banner). */
export const cookieConsent = writable<CookieConsentValue | null>(readStored());

/** Abre el banner de nuevo (p. ej. desde el pie “Preferencias”). */
export const cookiePreferencesOpen = writable(false);

export function setCookieConsent(value: CookieConsentValue) {
  if (browser) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }
  cookieConsent.set(value);
  cookiePreferencesOpen.set(false);
}

export function openCookiePreferences() {
  cookiePreferencesOpen.set(true);
}
