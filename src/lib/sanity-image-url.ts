const SANITY_CDN_HOST = 'cdn.sanity.io';

export function isSanityCdnUrl(url: string): boolean {
  try {
    return new URL(url).hostname === SANITY_CDN_HOST;
  } catch {
    return false;
  }
}

/** Ajusta el parámetro `w` de una URL ya generada por Sanity (`auto=format`). */
export function sanityImageWithWidth(url: string, width: number): string {
  if (!isSanityCdnUrl(url)) {
    return url;
  }
  const parsed = new URL(url);
  parsed.searchParams.set('w', String(Math.max(1, Math.round(width))));
  if (!parsed.searchParams.has('auto')) {
    parsed.searchParams.set('auto', 'format');
  }
  return parsed.toString();
}

export function sanityImageSrcSet(url: string, widths: readonly number[]): string | undefined {
  if (!isSanityCdnUrl(url)) {
    return undefined;
  }
  const unique = [...new Set(widths.map((w) => Math.round(w)))].sort((a, b) => a - b);
  return unique.map((w) => `${sanityImageWithWidth(url, w)} ${w}w`).join(', ');
}

export function sanityDefaultSrc(url: string, width: number): string {
  return sanityImageWithWidth(url, width);
}
