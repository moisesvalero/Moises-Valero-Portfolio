import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { submitToIndexNow } from '$lib/server/indexnow';
import type { RequestHandler } from './$types';

type IndexNowBody = {
	urls?: unknown;
};

function unauthorized() {
	return json({ ok: false, error: 'No autorizado.' }, { status: 401 });
}

export const POST: RequestHandler = async ({ request }) => {
	const token = env.INDEXNOW_SUBMIT_TOKEN?.trim();
	const key = env.INDEXNOW_KEY?.trim();
	if (!token || !key) {
		return json(
			{
				ok: false,
				error: 'IndexNow no está configurado. Revisa INDEXNOW_KEY e INDEXNOW_SUBMIT_TOKEN.'
			},
			{ status: 500 }
		);
	}

	const authHeader = request.headers.get('authorization')?.trim() || '';
	const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
	const xToken = request.headers.get('x-indexnow-token')?.trim() || '';
	const incoming = bearer || xToken;
	if (!incoming || incoming !== token) {
		return unauthorized();
	}

	let payload: IndexNowBody;
	try {
		payload = (await request.json()) as IndexNowBody;
	} catch {
		return json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
	}

	const urls = Array.isArray(payload.urls)
		? payload.urls.filter((u): u is string => typeof u === 'string')
		: [];
	if (!urls.length) {
		return json({ ok: false, error: 'Debes enviar al menos una URL en "urls".' }, { status: 400 });
	}

	const result = await submitToIndexNow(urls);
	if (!result.ok) {
		return json(
			{
				ok: false,
				status: result.status,
				endpoint: result.endpoint,
				submitted: result.submitted,
				detail: result.detail || 'IndexNow devolvió error.'
			},
			{ status: 502 }
		);
	}

	return json({
		ok: true,
		status: result.status,
		endpoint: result.endpoint,
		submitted: result.submitted
	});
};
