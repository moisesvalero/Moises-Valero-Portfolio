import { env as publicEnv } from '$env/dynamic/public';
import { sitePortfolioDefaults } from '$lib/data/site-portfolio-defaults';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SitePortfolioContent } from '$lib/types/site-portfolio';
import { sitePortfolioQuery } from './sanity/groq-site-portfolio';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { mapSanitySitePortfolio } from './sanity/map-site-portfolio';

function defaultBaseUrl(): string {
  return new URL(publicEnv.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
}

function enforceCareerFirstPortfolio(site: SitePortfolioContent): SitePortfolioContent {
  return {
    ...site,
    header: sitePortfolioDefaults.header,
    seo: {
      ...site.seo,
      title: sitePortfolioDefaults.seo.title,
      description: sitePortfolioDefaults.seo.description,
      ogTitle: sitePortfolioDefaults.seo.ogTitle,
      ogDescription: sitePortfolioDefaults.seo.ogDescription
    },
    hero: {
      ...site.hero,
      cvHref: sitePortfolioDefaults.hero.cvHref,
      ctaPrimaryLabel: sitePortfolioDefaults.hero.ctaPrimaryLabel,
      careerCtaLabel: sitePortfolioDefaults.hero.careerCtaLabel
    },
    about: {
      ...site.about,
      aboutHtml: sitePortfolioDefaults.about.aboutHtml
    },
    services: sitePortfolioDefaults.services,
    contact: sitePortfolioDefaults.contact,
    footer: {
      ...site.footer,
      copyrightTemplate: sitePortfolioDefaults.footer.copyrightTemplate,
      maltHref: ''
    }
  };
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
    return enforceCareerFirstPortfolio(mapSanitySitePortfolio(null, sitePortfolioDefaults, {
      projectId: '',
      dataset: '',
      baseUrl,
      locale
    }));
  }

  try {
    const raw = await client.fetch<Record<string, unknown> | null>(sitePortfolioQuery);
    return enforceCareerFirstPortfolio(mapSanitySitePortfolio(raw, sitePortfolioDefaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl,
      locale
    }));
  } catch (error) {
    console.warn('[portfolio] Sanity unavailable, using local defaults.', error);
    return enforceCareerFirstPortfolio(mapSanitySitePortfolio(null, sitePortfolioDefaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl,
      locale
    }));
  }
}
