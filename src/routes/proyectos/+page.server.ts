import { fetchProjectArchive } from '$lib/server/fetch-project-archive';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { locale } = await parent();
  const projects = await fetchProjectArchive(locale);

  return { projects };
};
