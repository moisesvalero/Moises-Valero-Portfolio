import { getCaseStudy as getCaseStudyStatic } from '$lib/data/case-studies';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { CaseStudy } from '$lib/types/case-study';
import { localizeCaseStudy } from './case-study-localize';
import { fetchCaseStudyFromSanity } from './sanity/fetch-case-study';

/**
 * Carga el case study en idioma “fuente” (español desde Sanity / JSON) sin aplicar capa EN.
 */
export async function loadCaseStudyBase(slug: string): Promise<CaseStudy | undefined> {
  const fromCms = await fetchCaseStudyFromSanity(slug);
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
  const base = await loadCaseStudyBase(slug);
  if (!base) {
    return undefined;
  }
  return localizeCaseStudy(base, locale);
}
