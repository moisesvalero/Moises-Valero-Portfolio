import { fetchLandingDisenoWebAlcoy } from '$lib/server/fetch-landing-alcoy';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [landing, supportArticles] = await Promise.all([
    fetchLandingDisenoWebAlcoy(),
    fetchLandingSupportArticles(4)
  ]);
  return { landing, supportArticles };
};
