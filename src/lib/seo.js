import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';

const DEFAULT_SITE_URL = 'http://localhost:5173';
const baseUrl = new URL(env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).toString().replace(/\/$/, '');

/** Debe coincidir con el portfolio real: los crawlers (WhatsApp, etc.) leen el HTML en SSR antes de que $effect actualice el store. */
export const defaultSeo = {
	title: 'Moisés Valero – Desarrollador Web | SvelteKit, WordPress, Soporte IT',
	description:
		'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico. Disponible para empresa o proyectos freelance.',
	ogTitle: 'Moisés Valero – Desarrollador Web',
	ogDescription:
		'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico.',
	ogImage: `${baseUrl}/og-image.png`,
	ogUrl: baseUrl,
	twitterCard: 'summary_large_image',
	canonical: baseUrl
};

export const seo = writable(defaultSeo);

export const setSeo = (data = {}) => {
	seo.set({
		...defaultSeo,
		...data
	});
};
