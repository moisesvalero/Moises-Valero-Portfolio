import type { SiteLocale } from '$lib/i18n/site-locale';
import { pagesWithTwins } from '$lib/site-pages';
import { buildArticulosMarkdown } from './builders/articulos';
import { buildArticleMarkdown } from './builders/article';
import { buildHomeMarkdown } from './builders/home';
import { buildProjectMarkdown } from './builders/project';
import { buildSitePageMarkdownByPath } from './builders/site-page';
import { canonicalHtmlPath } from './paths';

export type MarkdownBuilder = (locale: SiteLocale) => string | Promise<string>;

const STATIC_BUILDERS: Record<string, MarkdownBuilder> = {
	'/': (locale) => buildHomeMarkdown(locale),
	'/blog': (locale) => buildArticulosMarkdown(locale),
	'/proyectos/vshield': (locale) => buildProjectMarkdown('/proyectos/vshield', locale),
	'/proyectos/ember-iron': (locale) => buildProjectMarkdown('/proyectos/ember-iron', locale),
	'/proyectos/galeria-nova': (locale) => buildProjectMarkdown('/proyectos/galeria-nova', locale),
	'/proyectos/chatbot': (locale) => buildProjectMarkdown('/proyectos/chatbot', locale),
	'/privacidad': (locale) => buildSitePageMarkdownByPath('/privacidad', locale),
	'/cookies': (locale) => buildSitePageMarkdownByPath('/cookies', locale)
};

const ARTICLE_SLUG_RE = /^\/blog\/([^/]+)$/;

function articleSlugFromPath(path: string): string | null {
	const match = ARTICLE_SLUG_RE.exec(path);
	if (!match) return null;
	const slug = match[1];
	if (slug === 'articulos') return null;
	return slug;
}

/** Rutas HTML con twin registrado. */
export function hasMarkdownTwin(htmlPath: string): boolean {
	const path = canonicalHtmlPath(htmlPath);
	if (STATIC_BUILDERS[path]) return true;
	if (pagesWithTwins().some((p) => p.path === path)) return true;
	return articleSlugFromPath(path) !== null;
}

export async function getPageMarkdown(htmlPath: string, locale: SiteLocale): Promise<string | null> {
	const path = canonicalHtmlPath(htmlPath);
	const staticBuilder = STATIC_BUILDERS[path];
	if (staticBuilder) {
		const body = await staticBuilder(locale);
		return body || null;
	}

	const slug = articleSlugFromPath(path);
	if (slug) {
		const body = await buildArticleMarkdown(slug, locale);
		return body || null;
	}

	const page = pagesWithTwins().find((p) => p.path === path);
	if (page) {
		const body = buildSitePageMarkdownByPath(path, locale);
		return body || null;
	}

	return null;
}
