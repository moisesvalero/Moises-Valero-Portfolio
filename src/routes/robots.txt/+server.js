import { env } from '$env/dynamic/public';

const DEFAULT_SITE_URL = 'http://localhost:5173';

/** @param {string | undefined} url */
const normalizeBaseUrl = (url) => {
	const parsed = new URL(url || DEFAULT_SITE_URL);
	return parsed.toString().replace(/\/$/, '');
};

export const GET = () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);

	const body = `User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
