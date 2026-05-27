import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

type ContactPayload = {
	name?: unknown;
	email?: unknown;
	phone?: unknown;
	message?: unknown;
	privacyAccepted?: unknown;
	website?: unknown; // honeypot
};

const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_MAX_PER_IP = 12;
const contactHitsByIp = new Map<string, number[]>();

function toCleanString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toSafeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function hasInvalidOrigin(request: Request, url: URL): boolean {
	const origin = request.headers.get('origin');
	if (!origin) return false;
	try {
		return new URL(origin).origin !== url.origin;
	} catch {
		return true;
	}
}

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	if (hasInvalidOrigin(request, url)) {
		return json({ ok: false, error: 'Origen no permitido.' }, { status: 403 });
	}

	const ip = getClientAddress();
	const now = Date.now();
	const ipHits = (contactHitsByIp.get(ip) || []).filter((at) => now - at < CONTACT_WINDOW_MS);
	if (ipHits.length >= CONTACT_MAX_PER_IP) {
		return json(
			{ ok: false, error: 'Has superado el limite de envios por hora.' },
			{ status: 429 }
		);
	}
	ipHits.push(now);
	contactHitsByIp.set(ip, ipHits);

	let body: ContactPayload;
	try {
		body = (await request.json()) as ContactPayload;
	} catch {
		return json({ ok: false, error: 'JSON invalido.' }, { status: 400 });
	}

	const honeypot = toCleanString(body.website);
	if (honeypot) {
		return json({ ok: true });
	}

	const name = toCleanString(body.name);
	const email = toCleanString(body.email);
	const phone = toCleanString(body.phone);
	const message = toCleanString(body.message);
	const privacyAccepted = body.privacyAccepted === true;

	if (!name || !email || !message || !privacyAccepted) {
		return json({ ok: false, error: 'Completa los campos obligatorios.' }, { status: 400 });
	}
	if (!isValidEmail(email)) {
		return json({ ok: false, error: 'El email no es valido.' }, { status: 400 });
	}
	if (message.length < 10) {
		return json({ ok: false, error: 'El mensaje es demasiado corto.' }, { status: 400 });
	}
	if (name.length > 120 || email.length > 254 || phone.length > 40 || message.length > 3000) {
		return json({ ok: false, error: 'Alguno de los campos es demasiado largo.' }, { status: 400 });
	}

	const resendApiKey = env.RESEND_API_KEY;
	const toEmail = env.CONTACT_TO_EMAIL || env.PUBLIC_CONTACT_EMAIL || 'info@moisesvalero.es';
	const fromEmail = env.CONTACT_FROM_EMAIL || 'Web <onboarding@resend.dev>';

	if (!resendApiKey) {
		return json(
			{ ok: false, error: 'Falta configurar RESEND_API_KEY en el servidor.' },
			{ status: 500 }
		);
	}

	const subject = `Nuevo lead web · ${name}`;
	const text = [
		'Nuevo formulario de contacto',
		'',
		`Nombre: ${name}`,
		`Email: ${email}`,
		`Telefono: ${phone || '-'}`,
		'',
		'Mensaje:',
		message,
		'',
		`IP: ${ip}`
	].join('\n');

	const html = `
    <h2>Nuevo formulario de contacto</h2>
    <p><strong>Nombre:</strong> ${toSafeHtml(name)}</p>
    <p><strong>Email:</strong> ${toSafeHtml(email)}</p>
    <p><strong>Telefono:</strong> ${toSafeHtml(phone || '-')}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${toSafeHtml(message).replace(/\n/g, '<br />')}</p>
    <hr />
    <p><small>IP: ${toSafeHtml(ip)}</small></p>
  `;

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: fromEmail,
			to: [toEmail],
			subject,
			text,
			html
		})
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => 'Sin detalles');
		console.error('[contact-form] Resend error', errorText.slice(0, 400));
		return json({ ok: false, error: 'No se pudo enviar el email.' }, { status: 502 });
	}

	return json({ ok: true });
};
