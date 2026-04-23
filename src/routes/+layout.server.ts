import {
  LOCALE_LOAD_DEPENDENCY,
  PORTFOLIO_LOCALE_COOKIE,
  resolveSiteLocale
} from '$lib/i18n/site-locale';
import { fetchSitePortfolio } from '$lib/server/fetch-site-portfolio';
import type { LayoutServerLoad } from './$types';

const PRIMARY_CANONICAL_HOST = 'moisesvalero.es';

export const load: LayoutServerLoad = async ({ cookies, depends, url }) => {
  depends(LOCALE_LOAD_DEPENDENCY);
  const locale = resolveSiteLocale(cookies.get(PORTFOLIO_LOCALE_COOKIE));
  const site = await fetchSitePortfolio(locale);
  const hideSiteChrome =
    url.pathname === '/diseno-web-alcoy' ||
    url.pathname.startsWith('/diseno-web-alcoy/') ||
    url.pathname === '/diseno-web' ||
    url.pathname.startsWith('/diseno-web/') ||
    url.pathname === '/tracker-fiestas-2026' ||
    url.pathname.startsWith('/tracker-fiestas-2026/');
  const isProductionHost =
    url.hostname === PRIMARY_CANONICAL_HOST || url.hostname === `www.${PRIMARY_CANONICAL_HOST}`;
  const normalizedPath = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
  const canonicalOrigin = isProductionHost ? `https://${PRIMARY_CANONICAL_HOST}` : url.origin;
  /** Misma pieza de contenido bajo /diseno-web/... y /diseno-web-alcoy/... → canónica única en Alcoy. */
  let canonicalPath = normalizedPath;
  if (canonicalPath === '/diseno-web/articulos') {
    canonicalPath = '/diseno-web-alcoy/articulos';
  } else {
    const dup = /^\/diseno-web\/([^/]+)$/.exec(canonicalPath);
    if (dup && dup[1] !== 'articulos') {
      canonicalPath = `/diseno-web-alcoy/${dup[1]}`;
    }
  }
  const canonicalUrl = `${canonicalOrigin}${canonicalPath}`;
  const noIndex = !isProductionHost;
  return { site, locale, hideSiteChrome, canonicalUrl, noIndex };
};
