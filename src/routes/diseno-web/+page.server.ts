import { fetchLandingDisenoWeb } from '$lib/server/fetch-landing-diseno-web';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const landing = await fetchLandingDisenoWeb();
  return { landing };
};
