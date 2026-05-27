import { serveMarkdownTwin } from '$lib/aeo';
import { markdownTwinPath } from '$lib/aeo/paths';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => {
	const twinPath = markdownTwinPath(`/blog/${event.params.slug}`);
	return serveMarkdownTwin(event, twinPath);
};
