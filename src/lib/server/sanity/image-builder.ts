import imageUrlBuilder from '@sanity/image-url';

export function createImageUrlBuilder(projectId: string, dataset: string) {
	return imageUrlBuilder({ projectId, dataset });
}

/** Acepta objeto `image` de Sanity (con `asset`) tal como devuelve GROQ. */
export function imageUrl(
	projectId: string,
	dataset: string,
	source: unknown,
	width?: number,
	quality = 82
): string | undefined {
	if (!source || typeof source !== 'object') {
		return undefined;
	}
	try {
		let b = createImageUrlBuilder(projectId, dataset).image(source as never);
		if (width) {
			b = b.width(width);
		}
		return b.auto('format').quality(quality).url();
	} catch {
		return undefined;
	}
}
