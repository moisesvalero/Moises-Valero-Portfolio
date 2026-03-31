import { getCaseStudy as getCaseStudyStatic } from '$lib/data/case-studies';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { CaseStudy } from '$lib/types/case-study';
import { localizeCaseStudy } from './case-study-localize';
import { fetchCaseStudyFromSanity } from './sanity/fetch-case-study';

/**
 * Carga el case study desde Sanity (si existe) en el locale pedido; si no, usa fallback estático.
 */
export async function loadCaseStudyBase(
  slug: string,
  locale: SiteLocale = 'es'
): Promise<CaseStudy | undefined> {
  const fromCms = await fetchCaseStudyFromSanity(slug, locale);
  if (fromCms) {
    return fromCms;
  }
  return getCaseStudyStatic(slug);
}

/**
 * Resuelve un case study: primero Sanity, si no `case-studies.ts`; aplica traducción EN si `locale === 'en'`.
 */
export async function resolveCaseStudy(
  slug: string,
  locale: SiteLocale = 'es'
): Promise<CaseStudy | undefined> {
  const base = await loadCaseStudyBase(slug, locale);
  if (!base) {
    return undefined;
  }
  return localizeCaseStudy(base, locale);
}
