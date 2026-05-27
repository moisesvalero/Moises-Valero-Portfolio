import { canonicalHtmlPath, hasMarkdownTwin, markdownTwinPath } from '$lib/aeo';
import {
	LOCALE_LOAD_DEPENDENCY,
	PORTFOLIO_LOCALE_COOKIE,
	resolveSiteLocale
} from '$lib/i18n/site-locale';
import { fetchSitePortfolio } from '$lib/server/fetch-site-portfolio';
import type { LayoutServerLoad } from './$types';

const PRIMARY_CANONICAL_HOST = 'moisesvalero.es';
const PRIMARY_CANONICAL_ORIGIN = `https://${PRIMARY_CANONICAL_HOST}`;

export const load: LayoutServerLoad = async ({ cookies, depends, url }) => {
	depends(LOCALE_LOAD_DEPENDENCY);
	const locale = resolveSiteLocale(cookies.get(PORTFOLIO_LOCALE_COOKIE));
	const site = await fetchSitePortfolio(locale);
	const hideSiteChrome =
		url.pathname === '/tracker-fiestas-2026' || url.pathname.startsWith('/tracker-fiestas-2026/');
	const isProductionHost =
		url.hostname === PRIMARY_CANONICAL_HOST || url.hostname === `www.${PRIMARY_CANONICAL_HOST}`;
	const normalizedPath = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
	const hideLocaleToggle = normalizedPath === '/tools/analizador-web';
	const canonicalOrigin = isProductionHost ? PRIMARY_CANONICAL_ORIGIN : url.origin;
	const canonicalPath = normalizedPath;
	const canonicalUrl = `${canonicalOrigin}${canonicalPath}`;
	const noIndex = !isProductionHost;
	const htmlPath = canonicalHtmlPath(normalizedPath);
	const markdownAlternateHref = hasMarkdownTwin(htmlPath) ? markdownTwinPath(htmlPath) : null;
	const xDefaultHref = canonicalUrl;
	return {
		site,
		locale,
		hideSiteChrome,
		hideLocaleToggle,
		canonicalUrl,
		noIndex,
		markdownAlternateHref,
		xDefaultHref
	};
};
