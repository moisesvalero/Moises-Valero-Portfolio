import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const key = env.INDEXNOW_KEY?.trim();
	if (!key) {
		return new Response('INDEXNOW_KEY not configured', {
			status: 404,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}

	return new Response(key, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=300, s-maxage=300'
		}
	});
};
