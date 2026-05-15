import { env } from '$env/dynamic/public';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import { markdownTwinPath, pagesWithTwins, publicPages } from '$lib/site-pages';

const DEFAULT_SITE_URL = 'http://localhost:5173';

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

const escapeXml = (/** @type {string} */ value) =>
	value.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return '&apos;';
			default:
				return '&quot;';
		}
	});

export const GET = async () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);
	const now = new Date().toISOString();

	const articles = await fetchLandingSupportArticles().catch(() => []);

	/** @type {{ loc: string; lastmod: string; changefreq: string; priority: number; alternates?: string[] }[]} */
	const entries = publicPages().map((page) => {
		const locales = page.locales ?? ['es'];
		return {
			loc: `${baseUrl}${page.path}`,
			lastmod: now,
			changefreq: page.changefreq,
			priority: page.priority,
			alternates: locales
		};
	});

	// Artículos del CMS: una sola URL canónica en Alcoy (no duplicar /diseno-web/...)
	for (const article of articles) {
		entries.push({
			loc: `${baseUrl}/diseno-web-alcoy/${article.slug}`,
			lastmod: now,
			changefreq: 'weekly',
			priority: 0.65,
			alternates: ['es']
		});
	}

	// Twins Markdown AEO (noindex; descubrimiento para crawlers IA)
	for (const page of pagesWithTwins()) {
		entries.push({
			loc: `${baseUrl}${markdownTwinPath(page.path)}`,
			lastmod: now,
			changefreq: page.changefreq,
			priority: Math.max(0.1, page.priority - 0.05),
			alternates: []
		});
	}
	for (const article of articles) {
		entries.push({
			loc: `${baseUrl}/diseno-web-alcoy/${article.slug}.md`,
			lastmod: now,
			changefreq: 'weekly',
			priority: 0.6,
			alternates: []
		});
	}

	const urls = entries
		.map((e) => {
			const alts = (e.alternates ?? [])
				.map(
					(loc) =>
						`    <xhtml:link rel="alternate" hreflang="${loc}" href="${escapeXml(e.loc)}" />`
				)
				.join('\n');
			const xDefault = (e.alternates ?? []).length
				? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(e.loc)}" />`
				: '';
			return `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>
${alts}${xDefault}
  </url>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
