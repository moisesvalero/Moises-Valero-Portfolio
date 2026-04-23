import type { PageServerLoad } from './$types';
import { fetchCaseStudyFromSanity } from '$lib/server/sanity/fetch-case-study';

const FALLBACK_LIVE_URL = 'https://galerianova.es';

export const load: PageServerLoad = async ({ parent }) => {
	const { locale } = await parent();
	const study = await fetchCaseStudyFromSanity('galeria-nova', locale);

	return {
		liveUrl: study?.liveUrl || FALLBACK_LIVE_URL
	};
};
