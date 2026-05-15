import { getChatbotPageCopy } from '$lib/i18n/proyectos/chatbot-copy';
import { getEmberPageCopy } from '$lib/i18n/proyectos/ember-copy';
import { getGaleriaNovaPageCopy } from '$lib/i18n/proyectos/galeria-nova-copy';
import { getVshieldPageCopy } from '$lib/i18n/proyectos/vshield-copy';
import type { SiteLocale } from '$lib/i18n/site-locale';
import { buildSitePageMarkdown, getAeoBaseUrl } from '../shared';
import { getSitePageByPath } from './site-page';

const PROJECT_COPY: Record<string, (locale: SiteLocale) => { summary: string }> = {
	'/proyectos/vshield': (locale) => {
		const c = getVshieldPageCopy(locale);
		return { summary: c.heroSub };
	},
	'/proyectos/ember-iron': (locale) => {
		const c = getEmberPageCopy(locale);
		return { summary: c.heroSub };
	},
	'/proyectos/galeria-nova': (locale) => {
		const c = getGaleriaNovaPageCopy(locale);
		return { summary: c.heroSub };
	},
	'/proyectos/chatbot': (locale) => {
		const c = getChatbotPageCopy(locale);
		return { summary: c.heroSub };
	}
};

export function buildProjectMarkdown(path: string, locale: SiteLocale): string {
	const page = getSitePageByPath(path);
	if (!page) return '';

	const copy = PROJECT_COPY[path]?.(locale);
	const lines: string[] = [];
	const base = buildSitePageMarkdown(page, locale);
	lines.push(base);
	if (copy?.summary) {
		lines.push('');
		lines.push(copy.summary);
	}
	lines.push('');
	lines.push(`## ${locale === 'en' ? 'Portfolio' : 'Portfolio'}`);
	lines.push(`${getAeoBaseUrl()}/`);
	return lines.join('\n');
}
