import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import {
	appendHtmlAeoHeaders,
	canonicalHtmlPath,
	getPageMarkdown,
	hasMarkdownTwin,
	htmlPathFromMdUrl,
	isAiBot,
	isNotAcceptable,
	markdownTwinHeaders,
	markdownTwinPath,
	normalizePathname,
	prefersMarkdown,
	resolveAeoLocale,
	shouldSkipAeo
} from '$lib/aeo';
import { PORTFOLIO_LOCALE_COOKIE, resolveSiteLocale, type SiteLocale } from '$lib/i18n/site-locale';

/** Locale para SSR: cookie del selector → Accept-Language → fallback es. */
function resolveRequestLocale(event: Parameters<Handle>[0]['event']): SiteLocale {
	const cookieValue = event.cookies.get(PORTFOLIO_LOCALE_COOKIE);
	const fromCookie = resolveSiteLocale(cookieValue);
	if (cookieValue) return fromCookie;
	const accept = event.request.headers.get('accept-language') ?? '';
	if (/\ben\b/i.test(accept) && !/\bes\b/i.test(accept.split(',')[0] ?? '')) {
		return 'en';
	}
	return 'es';
}

/**
 * CSP ajustada a recursos reales del sitio: Spline, Sanity CDN, GA4 con inline gtag,
 * Typebot (jsdelivr + *.typebot.io), Iconify.
 * En desarrollo no se envía CSP para no interferir con Vite/HMR.
 */
function productionContentSecurityPolicy(): string {
	const directives = [
		"default-src 'self'",
		"base-uri 'self'",
		"form-action 'self'",
		"object-src 'none'",
		`script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net`,
		`style-src 'self' 'unsafe-inline'`,
		// Imágenes desde Sanity CDN o URL absoluta en documentos (case studies, CMS)
		`img-src 'self' data: blob: https:`,
		`font-src 'self' data:`,
		`connect-src 'self' https://cdn.jsdelivr.net https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://*.googletagmanager.com https://typebot.io https://*.typebot.io wss://typebot.io wss://*.typebot.io`,
		`frame-src 'self' https://my.spline.design https://typebot.io https://*.typebot.io`,
		`worker-src 'self' blob:`,
		"frame-ancestors 'self'",
		'upgrade-insecure-requests'
	];
	return directives.join('; ');
}

const PERMISSIONS_POLICY =
	'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()';

/** Refuerza UTF-8 en HTML para evitar interpretaciones erróneas del juego de caracteres. */
const LEGACY_COMMERCIAL_PATH_RE = /^\/diseno-web(?:-alcoy)?(?:\.md|\/|$)/;
const SANITY_STUDIO_HOST = 'admin.moisesvalero.es';
const SANITY_STUDIO_ORIGIN = 'https://moisesvalero-portfolio.sanity.studio';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.hostname === SANITY_STUDIO_HOST) {
		const target = new URL(`${event.url.pathname}${event.url.search}`, SANITY_STUDIO_ORIGIN);
		return Response.redirect(target.toString(), 308);
	}

	const pathname = normalizePathname(event.url.pathname);
	const accept = event.request.headers.get('accept') ?? '';
	const userAgent = event.request.headers.get('user-agent') ?? '';
	const mdHtmlPath = htmlPathFromMdUrl(pathname);
	const htmlPath = canonicalHtmlPath(mdHtmlPath ?? pathname);

	if (LEGACY_COMMERCIAL_PATH_RE.test(pathname)) {
		return Response.redirect(new URL('/proyectos', event.url), 301);
	}

	if (!shouldSkipAeo(pathname)) {
		const wantsMarkdown = mdHtmlPath !== null || prefersMarkdown(accept) || isAiBot(userAgent);

		if (hasMarkdownTwin(htmlPath) && wantsMarkdown) {
			const locale = resolveAeoLocale(event);
			const body = await getPageMarkdown(htmlPath, locale);
			if (body) {
				return new Response(body, { headers: markdownTwinHeaders(body) });
			}
		}

		if (
			hasMarkdownTwin(htmlPath) &&
			isNotAcceptable(accept) &&
			!prefersMarkdown(accept) &&
			!isAiBot(userAgent)
		) {
			return new Response('Not Acceptable', {
				status: 406,
				headers: { Vary: 'Accept' }
			});
		}
	}

	const lang = resolveRequestLocale(event);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('lang="%lang%"', `lang="${lang}"`)
	});

	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);

	if (!dev) {
		response.headers.set('Content-Security-Policy', productionContentSecurityPolicy());
	}
	const type = response.headers.get('content-type');
	if (type?.startsWith('text/html') && !/charset=/i.test(type)) {
		response.headers.set('content-type', 'text/html; charset=utf-8');
	}
	if (type?.startsWith('text/html') && response.status >= 200 && response.status < 300) {
		const resolvedHtmlPath = canonicalHtmlPath(normalizePathname(event.url.pathname));
		if (!shouldSkipAeo(pathname) && hasMarkdownTwin(resolvedHtmlPath)) {
			appendHtmlAeoHeaders(response.headers, markdownTwinPath(resolvedHtmlPath));
		}
	}
	return response;
};
