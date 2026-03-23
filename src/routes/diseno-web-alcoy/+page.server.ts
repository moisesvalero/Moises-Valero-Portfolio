import { fetchLandingDisenoWebAlcoy } from '$lib/server/fetch-landing-alcoy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const landing = await fetchLandingDisenoWebAlcoy();
  return { landing };
};
