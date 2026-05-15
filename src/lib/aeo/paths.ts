/** Normaliza pathname (sin barra final salvo `/`). */
export function normalizePathname(pathname: string): string {
	const trimmed = pathname.trim();
	if (!trimmed || trimmed === '/') return '/';
	return trimmed.replace(/\/+$/, '') || '/';
}

/** Ruta HTML → URL twin Markdown (`/` → `/index.md`). */
export function markdownTwinPath(htmlPath: string): string {
	const norm = normalizePathname(htmlPath);
	if (norm === '/') return '/index.md';
	return `${norm}.md`;
}

/** Si la URL es `*.md`, devuelve la ruta HTML equivalente; si no, `null`. */
export function htmlPathFromMdUrl(pathname: string): string | null {
	const norm = normalizePathname(pathname);
	if (!norm.endsWith('.md')) return null;
	if (norm === '/index.md') return '/';
	return norm.slice(0, -3);
}

/**
 * Misma canónica que `+layout.server.ts`: artículos y slugs bajo `/diseno-web/`
 * apuntan a `/diseno-web-alcoy/…`.
 */
export function canonicalHtmlPath(pathname: string): string {
	const norm = normalizePathname(pathname);
	if (norm === '/diseno-web/articulos') return '/diseno-web-alcoy/articulos';
	const dup = /^\/diseno-web\/([^/]+)$/.exec(norm);
	if (dup && dup[1] !== 'articulos') {
		return `/diseno-web-alcoy/${dup[1]}`;
	}
	return norm;
}

/** Rutas que no deben pasar por negociación AEO. */
export function shouldSkipAeo(pathname: string): boolean {
	const norm = normalizePathname(pathname);
	if (norm.startsWith('/api/')) return true;
	if (norm.startsWith('/_app/')) return true;
	if (/\.[a-z0-9]{2,8}$/i.test(norm) && !norm.endsWith('.md')) return true;
	const skip = new Set([
		'/robots.txt',
		'/sitemap.xml',
		'/llms.txt',
		'/llms-full.txt',
		'/indexnow-key.txt',
		'/gracias',
		'/tracker-fiestas-2026',
		'/examples/landing'
	]);
	return skip.has(norm) || norm.startsWith('/tracker-fiestas-2026/');
}
