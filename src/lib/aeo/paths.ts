/** Normaliza pathname (sin barra final salvo `/`). */
export function normalizePathname(pathname: string): string {
	const trimmed = pathname.trim();
	if (!trimmed || trimmed === '/') return '/';
	return trimmed.replace(/\/+$/, '') || '/';
}

/** Ruta HTML -> URL twin Markdown (`/` -> `/index.md`). */
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

export function canonicalHtmlPath(pathname: string): string {
	return normalizePathname(pathname);
}

/** Rutas que no deben pasar por negociacion AEO. */
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
