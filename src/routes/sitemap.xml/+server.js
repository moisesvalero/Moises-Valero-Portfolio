import { env } from '$env/dynamic/public';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';

const DEFAULT_SITE_URL = 'http://localhost:5173';
const staticRoutes = [
	'/',
	'/cookies',
	'/privacidad',
	'/diseno-web-alcoy',
	'/diseno-web',
	'/proyectos/vshield',
	'/proyectos/ember-iron',
	'/proyectos/galeria-nova',
	'/proyectos/chatbot',
	'/proyectos/novakit'
];

/** @param {string | undefined} url */
const normalizeBaseUrl = (url) => {
	try {
		const candidate = typeof url === 'string' ? url.trim() : '';
		const parsed = new URL(candidate || DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	} catch {
		const parsed = new URL(DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	}
};

export const GET = async () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);
	const now = new Date().toISOString();
	const articles = await fetchLandingSupportArticles();

	// Artículos: una sola URL canónica (/diseno-web-alcoy/...) — evita duplicados con /diseno-web/...
	const dynamicRoutes = [
		'/diseno-web-alcoy/articulos',
		...articles.map((article) => `/diseno-web-alcoy/${article.slug}`)
	];

	const urls = [...staticRoutes, ...dynamicRoutes]
		.map(
			(route) => `<url>
  <loc>${baseUrl}${route}</loc>
  <lastmod>${now}</lastmod>
  <changefreq>${route.startsWith('/diseno-web-alcoy/') || route.startsWith('/diseno-web/') ? 'weekly' : 'weekly'}</changefreq>
  <priority>${route === '/' ? '1.0' : route === '/diseno-web-alcoy' || route === '/diseno-web' ? '0.9' : route === '/diseno-web-alcoy/articulos' || route === '/diseno-web/articulos' ? '0.75' : 0.7}</priority>
</url>`
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
