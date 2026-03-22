import { env as publicEnv } from '$env/dynamic/public';
import { sitePortfolioDefaults } from '$lib/data/site-portfolio-defaults';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SitePortfolioContent } from '$lib/types/site-portfolio';
import { sitePortfolioQuery } from './sanity/groq-site-portfolio';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { mapSanitySitePortfolio } from './sanity/map-site-portfolio';

function defaultBaseUrl(): string {
  return new URL(publicEnv.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
}

/**
 * Carga el documento singleton `sitePortfolio` (id `portfolioSite`) o devuelve defaults locales.
 * Siempre se parte de defaults en **español**; con `locale === 'en'` el mapper aplica la capa EN (UI demo) sin tocar SEO.
 */
export async function fetchSitePortfolio(locale: SiteLocale = 'es'): Promise<SitePortfolioContent> {
  const baseUrl = defaultBaseUrl();
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client || !cfg) {
    return mapSanitySitePortfolio(null, sitePortfolioDefaults, {
      projectId: '',
      dataset: '',
      baseUrl,
      locale
    });
  }

  const raw = await client.fetch<Record<string, unknown> | null>(sitePortfolioQuery);
  return mapSanitySitePortfolio(raw, sitePortfolioDefaults, {
    projectId: cfg.projectId,
    dataset: cfg.dataset,
    baseUrl,
    locale
  });
}
