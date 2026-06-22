import type { PageServerLoad } from './$types';
import { projectLiveUrls, resolveCaseStudyLiveUrl } from '$lib/data/project-live-urls';
import { fetchCaseStudyFromSanity } from '$lib/server/sanity/fetch-case-study';

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const study = await fetchCaseStudyFromSanity('galeria-nova', locale);

	return {
		liveUrl: resolveCaseStudyLiveUrl('galeria-nova', study?.liveUrl) || projectLiveUrls.galeriaNova
	};
};
