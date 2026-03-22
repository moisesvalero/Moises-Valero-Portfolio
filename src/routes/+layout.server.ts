import {
  LOCALE_LOAD_DEPENDENCY,
  PORTFOLIO_LOCALE_COOKIE,
  resolveSiteLocale
} from '$lib/i18n/site-locale';
import { fetchSitePortfolio } from '$lib/server/fetch-site-portfolio';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, depends }) => {
  depends(LOCALE_LOAD_DEPENDENCY);
  const locale = resolveSiteLocale(cookies.get(PORTFOLIO_LOCALE_COOKIE));
  const site = await fetchSitePortfolio(locale);
  return { site, locale };
};
