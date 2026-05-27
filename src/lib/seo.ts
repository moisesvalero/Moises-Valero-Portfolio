import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';
import type { SiteLocale } from '$lib/i18n/site-locale';

const DEFAULT_SITE_URL = 'https://moisesvalero.es';
const baseUrl = new URL(env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).toString().replace(/\/$/, '');

export type SeoSchemaType =
	| 'WebPage'
	| 'Article'
	| 'FAQPage'
	| 'HowTo'
	| 'CollectionPage'
	| 'SoftwareApplication';

export type SeoFaqItem = { question: string; answer: string };

export type SeoHowToStep = {
	name: string;
	text: string;
	url?: string;
};

export type SeoState = {
	title: string;
	description: string;
	ogTitle: string;
	ogDescription: string;
	ogImage: string;
	ogType: 'website' | 'article';
	ogUrl: string;
	twitterCard: 'summary' | 'summary_large_image';
	twitterCreator?: string;
	/** Reservado: el `<link rel="canonical">` real lo controla +layout.server.ts. */
	canonical: string;
	schemaType: SeoSchemaType;
	headline?: string;
	datePublished?: string;
	dateModified?: string;
	author?: string;
	keywords: string[];
	locale: SiteLocale;
	faq: SeoFaqItem[];
	howto: SeoHowToStep[];
	softwareName?: string;
	softwareCategory?: string;
};

/** Defaults SSR-safe: los crawlers leen el HTML antes de que `$effect` actualice el store. */
export const defaultSeo: SeoState = {
	title: 'Moisés Valero – Desarrollador Web | SvelteKit, WordPress, Performance',
	description:
		'Portfolio profesional de Moisés Valero, desarrollador web orientado a SvelteKit, WordPress, rendimiento, SEO técnico e integraciones.',
	ogTitle: 'Moisés Valero – Desarrollador Web',
	ogDescription: 'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico.',
	ogImage: `${baseUrl}/og-image-2026.png`,
	ogType: 'website',
	ogUrl: baseUrl,
	twitterCard: 'summary_large_image',
	twitterCreator: undefined,
	canonical: baseUrl,
	schemaType: 'WebPage',
	headline: undefined,
	datePublished: undefined,
	dateModified: undefined,
	author: 'Moisés Valero',
	keywords: [
		'desarrollo web',
		'SvelteKit',
		'WordPress',
		'performance',
		'SEO técnico',
		'TypeScript'
	],
	locale: 'es',
	faq: [],
	howto: [],
	softwareName: undefined,
	softwareCategory: undefined
};

export const seo = writable<SeoState>(defaultSeo);

/** API mínima para páginas: `setSeo({ title, description, ... })` o `setSeo()` para reset. */
export const setSeo = (data: Partial<SeoState> = {}): void => {
	seo.set({
		...defaultSeo,
		...data,
		keywords: data.keywords ?? defaultSeo.keywords,
		faq: data.faq ?? [],
		howto: data.howto ?? []
	});
};

/** Base URL pública resuelta una sola vez. Útil en JsonLd y endpoints SSR. */
export const SITE_BASE_URL = baseUrl;
