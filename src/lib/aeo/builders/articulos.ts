import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { SiteLocale } from '$lib/i18n/site-locale';
import { getAeoBaseUrl } from '../shared';
import { buildSitePageMarkdownByPath } from './site-page';

export async function buildArticulosMarkdown(locale: SiteLocale): Promise<string> {
  const intro = buildSitePageMarkdownByPath('/blog', locale);
  const baseUrl = getAeoBaseUrl();
  const articles = await fetchLandingSupportArticles().catch(() => []);
  if (!articles.length) return intro;

  const lines = [intro, '', '## Guías técnicas'];
  for (const article of articles) {
    lines.push('');
    lines.push(`### ${article.title}`);
    lines.push(`URL: ${baseUrl}/blog/${article.slug}`);
    if (article.excerpt) lines.push(article.excerpt);
  }
  return lines.join('\n');
}
