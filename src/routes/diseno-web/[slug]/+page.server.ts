import { fetchLandingSupportArticle } from '$lib/server/fetch-landing-support-article';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const article = await fetchLandingSupportArticle(params.slug);
  if (!article) {
    error(404, 'Articulo no encontrado');
  }

  redirect(301, `/diseno-web-alcoy/${article.slug}`);
};
