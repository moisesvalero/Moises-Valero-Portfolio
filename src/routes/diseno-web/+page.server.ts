import { fetchLandingDisenoWeb } from '$lib/server/fetch-landing-diseno-web';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [landing, supportArticles] = await Promise.all([
    fetchLandingDisenoWeb(),
    fetchLandingSupportArticles(4)
  ]);
  return { landing, supportArticles };
};
