import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function normalizeE164(raw: string | undefined): string | null {
	if (!raw?.trim()) return null;
	const digits = raw.replace(/\D/g, '');
	if (digits.length < 10 || digits.length > 15) return null;
	return digits;
}

/**
 * Redirige a wa.me sin poner el número en el HTML de la página.
 */
export const GET: RequestHandler = () => {
	const id = normalizeE164(env.WHATSAPP_E164 || '34627950559');
	if (!id) {
		throw redirect(302, '/');
	}
	const text = encodeURIComponent('Hola, Moisés. He visto tu web y quería contactar contigo.');
	throw redirect(302, `https://wa.me/${id}?text=${text}`);
};
