import { error } from '@sveltejs/kit';
import { loadCaseStudyBase } from '$lib/server/case-study-resolver';
import { localizeCaseStudy } from '$lib/server/case-study-localize';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
  const { locale } = await parent();
  const studySeo = await loadCaseStudyBase(params.slug);
  if (!studySeo) {
    error(404, 'Proyecto no encontrado');
  }
  const study = localizeCaseStudy(studySeo, locale);
  return { study, studySeo, locale };
};
