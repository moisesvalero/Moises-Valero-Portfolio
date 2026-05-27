import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_SITE_URL = 'https://moisesvalero.es';

function normalizeBaseUrl(url: string | undefined): string {
	try {
		const parsed = new URL((url || DEFAULT_SITE_URL).trim());
		return parsed.toString().replace(/\/$/, '');
	} catch {
		return DEFAULT_SITE_URL;
	}
}

function normalizeUrls(urls: string[], host: string): string[] {
	const unique = new Set<string>();
	for (const raw of urls) {
		const candidate = raw.trim();
		if (!candidate) continue;
		try {
			const absolute = candidate.startsWith('http')
				? new URL(candidate)
				: new URL(candidate.startsWith('/') ? candidate : `/${candidate}`, host);
			unique.add(absolute.toString());
		} catch {
			// Ignora URLs inválidas sin abortar todo el envío.
		}
	}
	return [...unique];
}

export type IndexNowSubmitResult = {
	ok: boolean;
	status: number;
	submitted: number;
	endpoint: string;
	detail?: string;
};

export async function submitToIndexNow(urls: string[]): Promise<IndexNowSubmitResult> {
	const key = privateEnv.INDEXNOW_KEY?.trim();
	if (!key) {
		return {
			ok: false,
			status: 500,
			submitted: 0,
			endpoint: INDEXNOW_ENDPOINT,
			detail: 'INDEXNOW_KEY no está configurada.'
		};
	}

	const host = normalizeBaseUrl(publicEnv.PUBLIC_SITE_URL).replace(/\/$/, '');
	const normalizedUrls = normalizeUrls(urls, host);
	if (!normalizedUrls.length) {
		return {
			ok: false,
			status: 400,
			submitted: 0,
			endpoint: INDEXNOW_ENDPOINT,
			detail: 'No hay URLs válidas para enviar.'
		};
	}

	const keyLocation = `${host}/indexnow-key.txt`;
	const response = await fetch(INDEXNOW_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({
			host: new URL(host).hostname,
			key,
			keyLocation,
			urlList: normalizedUrls
		})
	});

	const detail = await response.text().catch(() => '');
	return {
		ok: response.ok,
		status: response.status,
		submitted: normalizedUrls.length,
		endpoint: INDEXNOW_ENDPOINT,
		detail: detail.slice(0, 500)
	};
}
