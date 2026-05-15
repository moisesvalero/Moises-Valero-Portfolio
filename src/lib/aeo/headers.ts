import { estimateMarkdownTokens } from './tokens';

export function markdownTwinHeaders(body: string): Headers {
	const headers = new Headers();
	headers.set('Content-Type', 'text/markdown; charset=utf-8');
	headers.set('Vary', 'Accept');
	headers.set('X-AEO-Version', '1.0');
	headers.set('X-Markdown-Tokens', String(estimateMarkdownTokens(body)));
	headers.set('X-Robots-Tag', 'noindex');
	headers.set('X-Content-Type-Options', 'nosniff');
	return headers;
}

export function appendHtmlAeoHeaders(headers: Headers, twinPath: string): void {
	const existing = headers.get('Link');
	const link = `<${twinPath}>; rel="alternate"; type="text/markdown"`;
	headers.set('Link', existing ? `${existing}, ${link}` : link);
	headers.append('Vary', 'Accept');
}
