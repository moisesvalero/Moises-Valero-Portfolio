import { env as publicEnv } from '$env/dynamic/public';
import { buildPortfolioLocaleDefaults } from '$lib/data/site-portfolio-locale-en';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SitePortfolioContent } from '$lib/types/site-portfolio';
import { sitePortfolioQuery } from './sanity/groq-site-portfolio';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { mapSanitySitePortfolio } from './sanity/map-site-portfolio';

function defaultBaseUrl(): string {
  return new URL(publicEnv.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
}

/**
 * Carga el documento singleton `sitePortfolio` (id `portfolioSite`) o devuelve defaults locales.
 * Siempre se parte de defaults en **español**; con `locale === 'en'` el mapper aplica la capa EN (UI demo) sin tocar SEO.
 */
export async function fetchSitePortfolio(locale: SiteLocale = 'es'): Promise<SitePortfolioContent> {
  const baseUrl = defaultBaseUrl();
  const defaults = buildPortfolioLocaleDefaults(locale);
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client || !cfg) {
    return mapSanitySitePortfolio(null, defaults, {
      projectId: '',
      dataset: '',
      baseUrl,
      locale
    });
  }

  try {
    const raw = await client.fetch<Record<string, unknown> | null>(sitePortfolioQuery);
    return mapSanitySitePortfolio(raw, defaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl,
      locale
    });
  } catch (error) {
    console.warn('[portfolio] Sanity unavailable, using local defaults.', error);
    return mapSanitySitePortfolio(null, defaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl,
      locale
    });
  }
}
