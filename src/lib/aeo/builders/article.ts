import { fetchLandingSupportArticle } from '$lib/server/fetch-landing-support-article';
import type { SiteLocale } from '$lib/i18n/site-locale';
import { getAeoBaseUrl, stripHtml } from '../shared';

export async function buildArticleMarkdown(slug: string, _locale: SiteLocale): Promise<string> {
	const article = await fetchLandingSupportArticle(slug);
	if (!article) return '';

	const baseUrl = getAeoBaseUrl();
	const lines: string[] = [
		`# ${article.seoTitle || article.title}`,
		'',
		`URL: ${baseUrl}/blog/${article.slug}`,
		'',
		article.seoDescription || article.excerpt
	];
	if (article.publishedAt) {
		lines.push('');
		lines.push(`Publicado: ${article.publishedAt}`);
	}
	if (article.bodyHtml) {
		lines.push('');
		lines.push(stripHtml(article.bodyHtml));
	}
	return lines.join('\n');
}
