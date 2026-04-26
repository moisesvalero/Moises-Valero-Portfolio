import { fetchLandingDisenoWeb } from '$lib/server/fetch-landing-diseno-web';
import { fetchFeaturedLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [landing, supportArticles] = await Promise.all([
    fetchLandingDisenoWeb(),
    fetchFeaturedLandingSupportArticles('national', 4)
  ]);
  return { landing, supportArticles };
};
