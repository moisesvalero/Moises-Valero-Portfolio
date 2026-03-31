import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const articles = await fetchLandingSupportArticles();
  return { articles };
};
