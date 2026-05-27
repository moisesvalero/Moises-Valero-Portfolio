const SANITY_CDN_HOST = 'cdn.sanity.io';

export function isSanityCdnUrl(url: string): boolean {
	try {
		return new URL(url).hostname === SANITY_CDN_HOST;
	} catch {
		return false;
	}
}

/** Ajusta tamaño/calidad de una URL ya generada por Sanity (`auto=format`). */
export function sanityImageWithWidth(url: string, width: number, quality = 82): string {
	if (!isSanityCdnUrl(url)) {
		return url;
	}
	const parsed = new URL(url);
	parsed.searchParams.set('w', String(Math.max(1, Math.round(width))));
	if (!parsed.searchParams.has('auto')) {
		parsed.searchParams.set('auto', 'format');
	}
	if (!parsed.searchParams.has('q')) {
		parsed.searchParams.set('q', String(quality));
	}
	return parsed.toString();
}

export function sanityImageSrcSet(
	url: string,
	widths: readonly number[],
	quality = 82
): string | undefined {
	if (!isSanityCdnUrl(url)) {
		return undefined;
	}
	const unique = [...new Set(widths.map((w) => Math.round(w)))].sort((a, b) => a - b);
	return unique.map((w) => `${sanityImageWithWidth(url, w, quality)} ${w}w`).join(', ');
}

export function sanityDefaultSrc(url: string, width: number, quality = 82): string {
	return sanityImageWithWidth(url, width, quality);
}
