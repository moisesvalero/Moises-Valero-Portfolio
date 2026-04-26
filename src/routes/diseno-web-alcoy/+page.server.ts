import { fetchLandingDisenoWebAlcoy } from '$lib/server/fetch-landing-alcoy';
import { fetchFeaturedLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [landing, supportArticles] = await Promise.all([
    fetchLandingDisenoWebAlcoy(),
    fetchFeaturedLandingSupportArticles('alcoy', 4)
  ]);
  return { landing, supportArticles };
};
