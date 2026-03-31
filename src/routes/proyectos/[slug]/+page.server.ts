import { error } from '@sveltejs/kit';
import { loadCaseStudyBase, resolveCaseStudy } from '$lib/server/case-study-resolver';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
  const { locale } = await parent();
  const studySeo = await loadCaseStudyBase(params.slug, 'es');
  if (!studySeo) {
    error(404, 'Proyecto no encontrado');
  }
  const study = await resolveCaseStudy(params.slug, locale);
  if (!study) {
    error(404, 'Proyecto no encontrado');
  }
  return { study, studySeo, locale };
};
