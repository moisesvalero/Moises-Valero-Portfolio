import { fetchSitePortfolio } from '$lib/server/fetch-site-portfolio';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  const site = await fetchSitePortfolio();
  return { site };
};
