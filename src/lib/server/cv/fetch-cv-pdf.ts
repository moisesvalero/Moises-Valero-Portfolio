import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	getSanityProjectConfig,
	getSanityServerClient
} from '$lib/server/sanity/get-server-client';

const PDF_QUERY = `coalesce(
  *[_type == "sitePortfolio" && _id == "portfolioSite"][0],
  *[_type == "sitePortfolio"] | order(_updatedAt desc)[0]
){
  "pdfHref": hero.cvHref
}`;

const DEFAULT_PDF_PATH = '/imagenes/MOISES-VALERO-CV.pdf';
const SANITY_CDN_HOST = 'cdn.sanity.io';

type PdfAsset = {
	_id?: string;
	url?: string;
	originalFilename?: string;
};

type PdfSource = {
	pdfHref?: string | null;
	pdfAsset?: PdfAsset | null;
};

function buildCdnUrlFromRef(ref: string, projectId: string, dataset: string): string | null {
	const match = ref.match(/^file-([a-f0-9]+)-([a-z0-9]+)$/i);
	if (!match) return null;
	return `https://${SANITY_CDN_HOST}/files/${projectId}/${dataset}/${match[1]}.${match[2]}`;
}

function uniqueUrls(urls: Array<string | null | undefined>): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const u of urls) {
		const trimmed = u?.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		out.push(trimmed);
	}
	return out;
}

/** Descarga un PDF remoto; prueba Bearer y `?token=` (assets privados en Sanity CDN). */
async function fetchRemotePdf(url: string, token?: string): Promise<Response | null> {
	const attempts: Array<{ url: string; headers: Record<string, string> }> = [
		{ url, headers: { Accept: 'application/pdf' } }
	];

	if (token) {
		attempts.push({
			url,
			headers: { Accept: 'application/pdf', Authorization: `Bearer ${token}` }
		});
		const sep = url.includes('?') ? '&' : '?';
		attempts.push({
			url: `${url}${sep}token=${encodeURIComponent(token)}`,
			headers: { Accept: 'application/pdf' }
		});
	}

	for (const { url: attemptUrl, headers } of attempts) {
		try {
			const res = await fetch(attemptUrl, { headers, redirect: 'follow' });
			if (res.ok && res.body) return res;
		} catch {
			// Siguiente intento
		}
	}
	return null;
}

function inlinePdfResponse(
	body: ReadableStream<Uint8Array> | ArrayBuffer,
	contentLength?: string | null
): Response {
	const headers = new Headers({
		'Content-Type': 'application/pdf',
		'Content-Disposition': 'inline; filename="MOISES-VALERO-CV.pdf"',
		'Cache-Control': 'public, max-age=300, s-maxage=3600'
	});
	if (contentLength) headers.set('Content-Length', contentLength);
	return new Response(body, { status: 200, headers });
}

async function fetchSameOriginPdf(
	pathname: string,
	origin: string,
	kitFetch: typeof fetch
): Promise<Response | null> {
	const absolute = new URL(pathname, origin).toString();
	try {
		const res = await kitFetch(absolute, { headers: { Accept: 'application/pdf' } });
		if (res.ok && res.body) return res;
	} catch {
		// ignore
	}
	return null;
}

async function trySanityAsset(
	asset: PdfAsset,
	token: string | undefined,
	projectId: string,
	dataset: string
): Promise<Response | null> {
	const urls = uniqueUrls([
		asset.url,
		asset._id ? buildCdnUrlFromRef(asset._id, projectId, dataset) : null
	]);

	for (const remoteUrl of urls) {
		const upstream = await fetchRemotePdf(remoteUrl, token);
		if (upstream?.body) {
			return inlinePdfResponse(upstream.body, upstream.headers.get('content-length'));
		}
	}
	return null;
}

async function loadPdfSource(): Promise<PdfSource | null> {
	const client = getSanityServerClient();
	if (!client) return null;
	try {
		return await client.fetch<PdfSource>(PDF_QUERY);
	} catch {
		return null;
	}
}

/**
 * Resuelve y devuelve el CV como PDF con `Content-Disposition: inline` (mismo origen).
 */
export async function resolveCvPdfResponse(
	origin: string,
	kitFetch: typeof fetch
): Promise<Response> {
	const token = env.SANITY_READ_TOKEN?.trim();
	const config = getSanityProjectConfig();
	const source = await loadPdfSource();

	if (source?.pdfAsset && config) {
		const fromAsset = await trySanityAsset(
			source.pdfAsset,
			token,
			config.projectId,
			config.dataset
		);
		if (fromAsset) return fromAsset;
	}

	const pdfHref = source?.pdfHref?.trim();
	if (pdfHref) {
		let parsed: URL;
		try {
			parsed = new URL(pdfHref, origin);
		} catch {
			parsed = new URL(DEFAULT_PDF_PATH, origin);
		}

		if (parsed.origin === origin) {
			const local = await fetchSameOriginPdf(parsed.pathname + parsed.search, origin, kitFetch);
			if (local?.body) {
				return inlinePdfResponse(local.body, local.headers.get('content-length'));
			}
		} else if (parsed.hostname === SANITY_CDN_HOST) {
			const remote = await fetchRemotePdf(parsed.toString(), token);
			if (remote?.body) {
				return inlinePdfResponse(remote.body, remote.headers.get('content-length'));
			}
		}
	}

	const fallback = await fetchSameOriginPdf(DEFAULT_PDF_PATH, origin, kitFetch);
	if (fallback?.body) {
		return inlinePdfResponse(fallback.body, fallback.headers.get('content-length'));
	}

	throw error(
		404,
		token
			? 'No se pudo obtener el CV. Comprueba el PDF en Sanity o la ruta estática.'
			: 'No se pudo obtener el CV. Configura SANITY_READ_TOKEN si el PDF está en Sanity como privado.'
	);
}
