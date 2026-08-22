import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readFileSync, writeFileSync } from 'node:fs';

type ContactPayload = {
	name?: unknown;
	email?: unknown;
	phone?: unknown;
	message?: unknown;
	privacyAccepted?: unknown;
	website?: unknown; // honeypot
	company_hp?: unknown; // honeypot fallback
	honeypot?: unknown; // honeypot fallback
	_t?: unknown; // timestamp
};

const CONTACT_WINDOW_MS = 60 * 60 * 1000;
const CONTACT_MAX_PER_IP = 8;
const CONTACT_COOLDOWN_MS = 60 * 1000;
const contactHitsByIp = new Map<string, number[]>();
const contactLastByEmail = new Map<string, number>();

const LIMITS_FILE = join(tmpdir(), 'portfolio-contact-limits.json');

function loadLimits() {
	try {
		const raw = readFileSync(LIMITS_FILE, 'utf8');
		const parsed = JSON.parse(raw);
		if (parsed.contactHitsByIp && Array.isArray(parsed.contactHitsByIp)) {
			for (const [ip, hits] of parsed.contactHitsByIp) {
				contactHitsByIp.set(ip, hits);
			}
		}
		if (parsed.contactLastByEmail && Array.isArray(parsed.contactLastByEmail)) {
			for (const [email, at] of parsed.contactLastByEmail) {
				contactLastByEmail.set(email, at);
			}
		}
	} catch {
		// Silencioso si no existe archivo previo
	}
}

function saveLimits() {
	try {
		const payload = {
			contactHitsByIp: [...contactHitsByIp.entries()],
			contactLastByEmail: [...contactLastByEmail.entries()]
		};
		writeFileSync(LIMITS_FILE, JSON.stringify(payload), 'utf8');
	} catch {
		// Silencioso
	}
}

loadLimits();

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
	const referer = request.headers.get('referer');
	const secFetchSite = request.headers.get('sec-fetch-site');

	// 1. Si sec-fetch-site indica cross-site, denegar
	if (secFetchSite === 'cross-site') {
		return true;
	}

	// 2. Si viene cabecera Origin, debe coincidir con el origen de la app
	if (origin) {
		try {
			const originUrl = new URL(origin);
			if (originUrl.origin !== url.origin) {
				return true;
			}
		} catch {
			return true;
		}
	}

	// 3. Si viene cabecera Referer, debe coincidir con el origen de la app
	if (referer) {
		try {
			const refererUrl = new URL(referer);
			if (refererUrl.origin !== url.origin) {
				return true;
			}
		} catch {
			return true;
		}
	}

	// 4. En producción, bloquear envíos directos de scripts que no aporten ni Origin ni Referer
	const isProd = env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
	if (isProd && !origin && !referer) {
		return true;
	}

	return false;
}

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	// 1. Validación de Origen y CSRF
	if (hasInvalidOrigin(request, url)) {
		return json({ ok: false, error: 'Origen no permitido.' }, { status: 403 });
	}

	// 2. Rate Limiting por IP
	let ip = '127.0.0.1';
	try {
		ip = getClientAddress();
	} catch {
		// Fallback
	}

	const now = Date.now();
	const ipHits = (contactHitsByIp.get(ip) || []).filter((at) => now - at < CONTACT_WINDOW_MS);
	if (ipHits.length >= CONTACT_MAX_PER_IP) {
		return json(
			{ ok: false, error: 'Has superado el límite de envíos por hora. Inténtalo más tarde.' },
			{ status: 429 }
		);
	}
	ipHits.push(now);
	contactHitsByIp.set(ip, ipHits);
	saveLimits();

	let body: ContactPayload;
	try {
		body = (await request.json()) as ContactPayload;
	} catch {
		return json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
	}

	// 3. Trampa Honeypot: absorción silenciosa para bots
	const honeypot = toCleanString(body.website ?? body.company_hp ?? body.honeypot);
	if (honeypot) {
		return json({ ok: true });
	}

	// 4. Anti-bot por tiempo de interacción (< 800ms)
	const timestamp = typeof body._t === 'number' ? body._t : 0;
	if (timestamp > 0) {
		const elapsed = Date.now() - timestamp;
		if (elapsed > 0 && elapsed < 800) {
			return json({ ok: true });
		}
	}

	const name = toCleanString(body.name);
	const email = toCleanString(body.email);
	const phone = toCleanString(body.phone);
	const message = toCleanString(body.message);
	const privacyAccepted = body.privacyAccepted === true;

	// 5. Validaciones de presencia y formato
	if (!name || !email || !message || !privacyAccepted) {
		return json({ ok: false, error: 'Completa los campos obligatorios.' }, { status: 400 });
	}
	if (!isValidEmail(email)) {
		return json({ ok: false, error: 'El email no es válido.' }, { status: 400 });
	}
	if (message.length < 10) {
		return json({ ok: false, error: 'El mensaje es demasiado corto.' }, { status: 400 });
	}
	if (name.length > 120 || email.length > 254 || phone.length > 40 || message.length > 3000) {
		return json({ ok: false, error: 'Alguno de los campos es demasiado largo.' }, { status: 400 });
	}

	// 6. Cooldown por Email
	const emailKey = email.toLowerCase();
	const lastSentAt = contactLastByEmail.get(emailKey) ?? 0;
	if (now - lastSentAt < CONTACT_COOLDOWN_MS) {
		return json(
			{ ok: false, error: 'Por favor, espera un momento antes de enviar otro mensaje.' },
			{ status: 429 }
		);
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

	const sanitizedSubjectName = name.replace(/[\r\n]/g, ' ').slice(0, 60);
	const subject = `Nuevo lead web · ${sanitizedSubjectName}`;
	const text = [
		'Nuevo formulario de contacto',
		'',
		`Nombre: ${name}`,
		`Email: ${email}`,
		`Teléfono: ${phone || '-'}`,
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
    <p><strong>Teléfono:</strong> ${toSafeHtml(phone || '-')}</p>
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

	contactLastByEmail.set(emailKey, now);
	saveLimits();

	return json({ ok: true });
};
