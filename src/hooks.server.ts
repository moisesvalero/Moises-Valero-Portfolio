import type { Handle } from '@sveltejs/kit';

const PRIMARY_CANONICAL_HOST = 'moisesvalero.es';
const SEO_LANDING_PATH_RE = /^\/diseno-web(?:-alcoy)?(?:\/|$)/;
const PRODUCTION_ROBOTS = 'index, follow';
const NON_PRODUCTION_ROBOTS = 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate';

/** Refuerza UTF-8 en HTML para evitar interpretaciones erróneas del juego de caracteres. */
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
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
