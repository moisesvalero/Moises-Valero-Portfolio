import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { SiteLocale } from '$lib/i18n/site-locale';
import { getAeoBaseUrl } from '../shared';
import { buildSitePageMarkdownByPath } from './site-page';

export async function buildArticulosMarkdown(locale: SiteLocale): Promise<string> {
	const intro = buildSitePageMarkdownByPath('/diseno-web-alcoy/articulos', locale);
	const baseUrl = getAeoBaseUrl();
	const articles = await fetchLandingSupportArticles().catch(() => []);
	if (!articles.length) return intro;

	const lines = [intro, '', '## Artículos'];
	for (const article of articles) {
		lines.push('');
		lines.push(`### ${article.title}`);
		lines.push(`URL: ${baseUrl}/diseno-web-alcoy/${article.slug}`);
		if (article.excerpt) lines.push(article.excerpt);
	}
	return lines.join('\n');
}
