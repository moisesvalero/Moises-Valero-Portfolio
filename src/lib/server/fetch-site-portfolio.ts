import { env as publicEnv } from '$env/dynamic/public';
import { sitePortfolioDefaults } from '$lib/data/site-portfolio-defaults';
import type { SitePortfolioContent } from '$lib/types/site-portfolio';
import { sitePortfolioQuery } from './sanity/groq-site-portfolio';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { mapSanitySitePortfolio } from './sanity/map-site-portfolio';

function defaultBaseUrl(): string {
  return new URL(publicEnv.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
}

function absolutizeOg(pathOrUrl: string, baseUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const base = baseUrl.replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

/**
 * Carga el documento singleton `sitePortfolio` (id `portfolioSite`) o devuelve defaults locales.
 */
export async function fetchSitePortfolio(): Promise<SitePortfolioContent> {
  const baseUrl = defaultBaseUrl();
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client || !cfg) {
    return {
      ...sitePortfolioDefaults,
      seo: {
        ...sitePortfolioDefaults.seo,
        ogImage: absolutizeOg(sitePortfolioDefaults.seo.ogImage, baseUrl)
      }
    };
  }

  const raw = await client.fetch<Record<string, unknown> | null>(sitePortfolioQuery);
  return mapSanitySitePortfolio(raw, sitePortfolioDefaults, {
    projectId: cfg.projectId,
    dataset: cfg.dataset,
    baseUrl
  });
}
