export type SiteLocale = 'es' | 'en';

export const SITE_LOCALES: SiteLocale[] = ['es', 'en'];

/** Misma clave en `depends()` del layout y en `invalidate()` al cambiar idioma. */
export const LOCALE_LOAD_DEPENDENCY = 'app:locale' as const;

/** Cookie leída en el servidor para GROQ/map y revalidada desde el header. */
export const PORTFOLIO_LOCALE_COOKIE = 'portfolio_locale';

export function parseSiteLocaleCookie(value: string | null | undefined): SiteLocale | null {
	if (!value) return null;
	const v = value.trim().toLowerCase();
	if (v === 'en') return 'en';
	if (v === 'es') return 'es';
	return null;
}

/**
 * Idioma por defecto **español** para SEO y primera visita.
 * El inglés solo entra si el usuario eligió explícitamente (cookie vía selector del header).
 */
export function resolveSiteLocale(cookieValue: string | null | undefined): SiteLocale {
	return parseSiteLocaleCookie(cookieValue) ?? 'es';
}
