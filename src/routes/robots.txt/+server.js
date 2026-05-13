import { env } from '$env/dynamic/public';

const DEFAULT_SITE_URL = 'http://localhost:5173';

/** @param {string | undefined} url */
const normalizeBaseUrl = (url) => {
	try {
		const parsed = new URL(url || DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	} catch {
		const parsed = new URL(DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	}
};

/**
 * robots.txt dinámico. Permite explícitamente crawlers de buscadores generativos
 * y bloquea endpoints internos. La línea Sitemap apunta a URL absoluta.
 */
export const GET = () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);

	const aiBots = [
		'OAI-SearchBot',
		'GPTBot',
		'ChatGPT-User',
		'Claude-Web',
		'ClaudeBot',
		'anthropic-ai',
		'PerplexityBot',
		'Google-Extended',
		'CCBot',
		'FacebookBot',
		'cohere-ai'
	];

	const body = [
		'# robots.txt dinámico — moisesvalero.es',
		'',
		'User-agent: *',
		'Allow: /',
		'Disallow: /api/',
		'',
		...aiBots.flatMap((agent) => [`User-agent: ${agent}`, 'Allow: /', 'Disallow: /api/', '']),
		`Sitemap: ${baseUrl}/sitemap.xml`,
		''
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
