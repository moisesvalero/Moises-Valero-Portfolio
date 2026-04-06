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
    error(404, 'Articulo no encontrado');
  }

  return {
    article,
    relatedArticles,
    basePath: '/diseno-web',
    /** Metadatos y JSON-LD apuntan a la URL canónica en Alcoy (mismo contenido). */
    seoCanonicalBasePath: '/diseno-web-alcoy'
  };
};
