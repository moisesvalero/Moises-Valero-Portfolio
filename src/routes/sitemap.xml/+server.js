import { env } from '$env/dynamic/public';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import { publicPages } from '$lib/site-pages';

const DEFAULT_SITE_URL = 'https://moisesvalero.es';

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

	/** @type {{ loc: string; lastmod: string; changefreq: string; priority: number }[]} */
	const entries = publicPages().map((page) => {
		return {
			loc: `${baseUrl}${page.path}`,
			lastmod: now,
			changefreq: page.changefreq,
			priority: page.priority
		};
	});

	for (const article of articles) {
		entries.push({
			loc: `${baseUrl}/blog/${article.slug}`,
			lastmod: now,
			changefreq: 'weekly',
			priority: 0.65
		});
	}

	const urls = entries
		.map((e) => {
			return `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>
  </url>`;
		})
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
