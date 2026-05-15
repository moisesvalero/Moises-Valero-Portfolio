import type { RequestEvent } from '@sveltejs/kit';
import { markdownTwinHeaders } from './headers';
import { resolveAeoLocale } from './locale';
import { canonicalHtmlPath, htmlPathFromMdUrl } from './paths';
import { getPageMarkdown } from './registry';

/** Sirve twin Markdown desde rutas `*.md/+server.ts`. */
export async function serveMarkdownTwin(event: RequestEvent, twinPath: string): Promise<Response> {
	const htmlFromTwin = htmlPathFromMdUrl(twinPath);
	const htmlPath = canonicalHtmlPath(htmlFromTwin ?? twinPath);
	const locale = resolveAeoLocale(event);
	const body = await getPageMarkdown(htmlPath, locale);
	if (!body) {
		return new Response('Not Found', { status: 404 });
	}
	return new Response(body, { headers: markdownTwinHeaders(body) });
}
