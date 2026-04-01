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
    url.pathname.startsWith('/diseno-web/');
  const isProductionHost =
    url.hostname === PRIMARY_CANONICAL_HOST || url.hostname === `www.${PRIMARY_CANONICAL_HOST}`;
  const normalizedPath = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
  const canonicalOrigin = isProductionHost ? `https://${PRIMARY_CANONICAL_HOST}` : url.origin;
  const canonicalUrl = `${canonicalOrigin}${normalizedPath}`;
  const noIndex = !isProductionHost;
  return { site, locale, hideSiteChrome, canonicalUrl, noIndex };
};
