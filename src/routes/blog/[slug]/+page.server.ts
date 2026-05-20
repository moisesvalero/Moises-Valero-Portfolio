import { fetchLandingSupportArticle } from '$lib/server/fetch-landing-support-article';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const [article, relatedArticles] = await Promise.all([
    fetchLandingSupportArticle(params.slug),
    fetchLandingSupportArticles()
  ]);

  if (!article) {
    error(404, 'Artículo no encontrado');
  }

  return { article, relatedArticles };
};
