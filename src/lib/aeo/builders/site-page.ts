import type { SiteLocale } from '$lib/i18n/site-locale';
import { publicPages, type SitePage } from '$lib/site-pages';
import { buildSitePageMarkdown } from '../shared';

export function buildSitePageMarkdownByPath(path: string, locale: SiteLocale): string {
	const page = publicPages().find((p) => p.path === path);
	if (!page) return '';
	return buildSitePageMarkdown(page, locale);
}

export function getSitePageByPath(path: string): SitePage | undefined {
	return publicPages().find((p) => p.path === path);
}
