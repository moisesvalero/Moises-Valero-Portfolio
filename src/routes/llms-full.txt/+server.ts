import { env } from '$env/dynamic/public';
import { publicPages } from '$lib/site-pages';
import type { RequestHandler } from './$types';

const DEFAULT_SITE_URL = 'https://moisesvalero.es';

const normalizeBaseUrl = (url: string | undefined): string => {
	try {
		const parsed = new URL((url ?? '').trim() || DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	} catch {
		return new URL(DEFAULT_SITE_URL).toString().replace(/\/$/, '');
	}
};

export const GET: RequestHandler = async () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);
	const pages = publicPages();

	const body = [
		'# moisesvalero.es - Contenido para LLMs',
		'',
		'> Portfolio profesional de Moises Valero, AI-Powered Full-Stack Developer especializado en SvelteKit, Next.js, Astro, TypeScript e integraciones de IA.',
		`> Ultima generacion: ${new Date().toISOString()}`,
		`> Sitio: ${baseUrl}`,
		'',
		'## Paginas publicas',
		...pages.map((page) => {
			const description = page.descEs ? `: ${page.descEs}` : '';
			return `- [${page.titleEs ?? page.path}](${baseUrl}${page.path})${description}`;
		}),
		'',
		'## Contacto',
		'',
		`- Formulario: ${baseUrl}/#contacto`,
		'- Email: info@moisesvalero.es'
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
