import { env } from '$env/dynamic/public';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SitePage } from '$lib/site-pages';
import type { SeoFaqItem } from '$lib/seo';

const DEFAULT_SITE_URL = 'https://moisesvalero.es';

export function getAeoBaseUrl(): string {
	try {
		const parsed = new URL((env.PUBLIC_SITE_URL ?? '').trim() || DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	} catch {
		return new URL(DEFAULT_SITE_URL).toString().replace(/\/$/, '');
	}
}

export function pageTitle(page: SitePage, locale: SiteLocale): string {
	if (locale === 'en' && page.titleEn) return page.titleEn;
	return page.titleEs ?? page.path;
}

export function pageDescription(page: SitePage, locale: SiteLocale): string {
	if (locale === 'en' && page.descEn) return page.descEn;
	return page.descEs ?? '';
}

export function appendFaqSection(lines: string[], faq: SeoFaqItem[], heading = 'FAQ'): void {
	if (!faq.length) return;
	lines.push('');
	lines.push(`## ${heading}`);
	for (const item of faq) {
		lines.push('');
		lines.push(`### ${item.question}`);
		lines.push(item.answer);
	}
}

export function buildSitePageMarkdown(
	page: SitePage,
	locale: SiteLocale,
	extraSections?: string[]
): string {
	const baseUrl = getAeoBaseUrl();
	const title = pageTitle(page, locale);
	const description = pageDescription(page, locale);
	const lines: string[] = [
		`# ${title}`,
		'',
		`URL: ${baseUrl}${page.path}`,
		'',
		description
	];
	if (extraSections?.length) {
		for (const section of extraSections) {
			lines.push('');
			lines.push(section);
		}
	}
	return lines.join('\n');
}

export const stripHtml = (input: string): string =>
	input
		.replace(/<\s*br\s*\/?\s*>/gi, '\n')
		.replace(/<\/p\s*>/gi, '\n\n')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
