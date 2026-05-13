import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { PORTFOLIO_LOCALE_COOKIE, resolveSiteLocale, type SiteLocale } from '$lib/i18n/site-locale';

const PRIMARY_CANONICAL_HOST = 'moisesvalero.es';
const SEO_LANDING_PATH_RE = /^\/diseno-web(?:-alcoy)?(?:\/|$)/;
const PRODUCTION_ROBOTS = 'index, follow';
const NON_PRODUCTION_ROBOTS = 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate';

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
 * Tailwind CDN (landing Alcoy), Typebot (jsdelivr + *.typebot.io), Iconify.
 * En desarrollo no se envía CSP para no interferir con Vite/HMR.
 */
function productionContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // `unsafe-eval`: requerido por el JIT de https://cdn.tailwindcss.com en /diseno-web-alcoy
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net`,
    `style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com`,
    // Imágenes desde Sanity CDN o URL absoluta en documentos (case studies, CMS)
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://*.googletagmanager.com https://typebot.io https://*.typebot.io wss://typebot.io wss://*.typebot.io`,
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
export const handle: Handle = async ({ event, resolve }) => {
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
    const isSeoLandingPath = SEO_LANDING_PATH_RE.test(event.url.pathname);
    const isProductionHost =
      event.url.hostname === PRIMARY_CANONICAL_HOST || event.url.hostname === `www.${PRIMARY_CANONICAL_HOST}`;
    if (isSeoLandingPath) {
      response.headers.set('X-Robots-Tag', isProductionHost ? PRODUCTION_ROBOTS : NON_PRODUCTION_ROBOTS);
    }
  }
  return response;
};
