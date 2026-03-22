import { getCaseStudy as getCaseStudyStatic } from '$lib/data/case-studies';
import type { CaseStudy } from '$lib/types/case-study';
import { fetchCaseStudyFromSanity } from './sanity/fetch-case-study';

/**
 * Resuelve un case study del CPT plantilla: primero Sanity (si hay proyecto configurado),
 * si no hay documento o Sanity no está configurado, usa `case-studies.ts` (JSON estático).
 */
export async function resolveCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  const fromCms = await fetchCaseStudyFromSanity(slug);
  if (fromCms) {
    return fromCms;
  }
  return getCaseStudyStatic(slug);
}
