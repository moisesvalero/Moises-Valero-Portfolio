import { PORTFOLIO_LOCALE_COOKIE, resolveSiteLocale, type SiteLocale } from '$lib/i18n/site-locale';
import type { RequestEvent } from '@sveltejs/kit';

/** Locale AEO: cookie → Accept-Language (solo si no hay cookie) → es. */
export function resolveAeoLocale(event: RequestEvent): SiteLocale {
	const cookieValue = event.cookies.get(PORTFOLIO_LOCALE_COOKIE);
	const fromCookie = resolveSiteLocale(cookieValue);
	if (cookieValue) return fromCookie;
	const accept = event.request.headers.get('accept-language') ?? '';
	if (/\ben\b/i.test(accept) && !/\bes\b/i.test(accept.split(',')[0] ?? '')) {
		return 'en';
	}
	return 'es';
}
