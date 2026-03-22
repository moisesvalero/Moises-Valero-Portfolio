import { error } from '@sveltejs/kit';
import { resolveCaseStudy } from '$lib/server/case-study-resolver';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const study = await resolveCaseStudy(params.slug);
  if (!study) {
    error(404, 'Proyecto no encontrado');
  }
  return { study };
};
