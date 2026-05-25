import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { getSanityWriteClient } from '$lib/server/sanity/get-server-client';
import type { RequestHandler } from './$types';

type LeadPayload = {
  email?: unknown;
  url?: unknown;
  score?: unknown;
  severity?: unknown;
  metrics?: unknown;
  highlights?: unknown;
  website?: unknown; // honeypot
};

const LEAD_WINDOW_MS = 60 * 60 * 1000;
const LEAD_MAX_PER_IP = 8;
const LEAD_COOLDOWN_MS = 120 * 1000;
const leadHitsByIp = new Map<string, number[]>();
const leadLastByEmail = new Map<string, number>();

function toCleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function toSafeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parsePageWeightMb(label: string): number | null {
  const clean = label.trim().toLowerCase().replace(',', '.');
  const match = clean.match(/([\d.]+)\s*(b|kb|mb)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const unit = match[2];
  if (unit === 'mb') return value;
  if (unit === 'kb') return value / 1024;
  if (unit === 'b') return value / (1024 * 1024);
  return null;
}

function pageWeightStatus(label: string): { text: string; emoji: string } {
  const mb = parsePageWeightMb(label);
  if (mb === null) return { text: 'Sin datos', emoji: '⚪' };
  if (mb < 1) return { text: 'Ligera', emoji: '🟢' };
  if (mb <= 2) return { text: 'Aceptable', emoji: '🟡' };
  return { text: 'Pesada', emoji: '🔴' };
}

function extractDomain(rawUrl: string): string | null {
  const clean = rawUrl.trim();
  if (!clean) return null;
  const candidate = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  try {
    return new URL(candidate).hostname.replace(/^www\./i, '');
  } catch {
    return null;
  }
}

function normalizeUrlForSanity(rawUrl: string): string | undefined {
  const clean = rawUrl.trim();
  if (!clean) return undefined;
  const candidate = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
}

function normalizeE164(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

async function sendResendEmail({
  apiKey,
  from,
  to,
  subject,
  text,
  html
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html
    })
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(details.slice(0, 260));
  }
}

export const POST: RequestHandler = async ({ request, url: requestUrl, getClientAddress }) => {
  if (hasInvalidOrigin(request, requestUrl)) {
    return json({ ok: false, error: 'Origen no permitido.' }, { status: 403 });
  }

  const ip = getClientAddress();
  const now = Date.now();
  const ipHits = (leadHitsByIp.get(ip) || []).filter((at) => now - at < LEAD_WINDOW_MS);
  if (ipHits.length >= LEAD_MAX_PER_IP) {
    return json({ ok: false, error: 'Has superado el limite de envios por hora.' }, { status: 429 });
  }
  ipHits.push(now);
  leadHitsByIp.set(ip, ipHits);

  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return json({ ok: false, error: 'JSON invalido.' }, { status: 400 });
  }

  const email = toCleanString(body.email);
  const honeypot = toCleanString(body.website);
  const url = toCleanString(body.url);
  const normalizedUrl = normalizeUrlForSanity(url);
  const scoreRaw = Number(body.score);
  const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : null;
  const severity = toCleanString(body.severity);
  const metrics = asRecord(body.metrics);
  const fcp = toCleanString(metrics?.fcp);
  const lcp = toCleanString(metrics?.lcp);
  const imageWeight = toCleanString(metrics?.imageWeight);
  const pageWeight = toCleanString(metrics?.pageWeight);
  const highlights = Array.isArray(body.highlights)
    ? body.highlights.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 3)
    : [];

  const scoreLabel = `Nota de velocidad en movil (0-100): ${score ?? '-'}`;
  const metricLines = [
    `Tiempo hasta ver la pagina: ${fcp || '-'}`,
    `Tiempo de carga principal: ${lcp || '-'}`,
    `Peso total de imagenes: ${imageWeight || '-'}`,
    `Peso total de la pagina: ${pageWeight || '-'}`
  ];
  const weightStatus = pageWeightStatus(pageWeight || '');

  if (honeypot) {
    return json({ ok: true });
  }

  if (!email) {
    return json({ ok: false, error: 'Introduce tu email.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return json({ ok: false, error: 'El email no es valido.' }, { status: 400 });
  }
  if (email.length > 254 || url.length > 2048 || severity.length > 80) {
    return json({ ok: false, error: 'Alguno de los campos es demasiado largo.' }, { status: 400 });
  }
  const emailKey = email.toLowerCase();
  const lastSentAt = leadLastByEmail.get(emailKey) || 0;
  if (now - lastSentAt < LEAD_COOLDOWN_MS) {
    return json({ ok: false, error: 'Espera unos segundos antes de volver a enviar.' }, { status: 429 });
  }

  const resendApiKey = env.RESEND_API_KEY;
  if (!resendApiKey) {
    return json({ ok: false, error: 'Falta configurar RESEND_API_KEY en el servidor.' }, { status: 500 });
  }

  const toEmail = env.CONTACT_TO_EMAIL || env.PUBLIC_CONTACT_EMAIL || 'info@moisesvalero.es';
  const fromEmail = env.CONTACT_FROM_EMAIL || 'Web <onboarding@resend.dev>';
  const publicSiteUrl = (publicEnv.PUBLIC_SITE_URL || 'https://moisesvalero.es').replace(/\/$/, '');
  const whatsappId = normalizeE164(env.WHATSAPP_E164 || '34627950559');
  const whatsappText = encodeURIComponent(
    `Hola, Moisés. He recibido el informe de mi web (${url || 'sin URL'}) y quería comentarlo contigo.`
  );
  const whatsappHref = whatsappId
    ? `https://wa.me/${whatsappId}?text=${whatsappText}`
    : `${publicSiteUrl}/api/contact/whatsapp`;

  const ownerSubject = `Nuevo informe solicitado · ${email}`;
  const ownerText = [
    'Nuevo lead desde el analizador web',
    '',
    `Email: ${email}`,
    `URL analizada: ${url || '-'}`,
    scoreLabel,
    `Severidad: ${severity || '-'}`,
    `Estado del peso de pagina: ${weightStatus.text}`,
    ...metricLines,
    `IP: ${ip}`
  ].join('\n');

  const ownerHtml = `
    <h2>Nuevo lead desde el analizador web</h2>
    <p><strong>Email:</strong> ${toSafeHtml(email)}</p>
    <p><strong>URL analizada:</strong> ${toSafeHtml(url || '-')}</p>
    <p><strong>${toSafeHtml(scoreLabel)}</strong></p>
    <p><strong>Severidad:</strong> ${toSafeHtml(severity || '-')}</p>
    <p><strong>Estado peso de pagina:</strong> ${toSafeHtml(`${weightStatus.emoji} ${weightStatus.text}`)}</p>
    <ul>
      <li><strong>Tiempo hasta ver la pagina:</strong> ${toSafeHtml(fcp || '-')}</li>
      <li><strong>Tiempo de carga principal:</strong> ${toSafeHtml(lcp || '-')}</li>
      <li><strong>Peso total de imagenes:</strong> ${toSafeHtml(imageWeight || '-')}</li>
      <li><strong>Peso total de la pagina:</strong> ${toSafeHtml(pageWeight || '-')}</li>
    </ul>
    ${
      highlights.length
        ? `<p><strong>Highlights:</strong></p><ul>${highlights
            .map((line) => `<li>${toSafeHtml(line)}</li>`)
            .join('')}</ul>`
        : ''
    }
    <hr />
    <p><small>IP: ${toSafeHtml(ip)}</small></p>
  `;

  const analyzedDomain = extractDomain(url || '');
  const customerSubject = analyzedDomain
    ? `Resultado de tu analisis web: ${analyzedDomain}`
    : 'Resultado de tu analisis web';
  const customerText = [
    'Gracias por solicitar tu informe.',
    '',
    `Web analizada: ${url || '-'}`,
    scoreLabel,
    '',
    ...metricLines,
    '',
    `Estado de peso de pagina: ${weightStatus.emoji} ${weightStatus.text}`,
    '',
    ...highlights.map((line, index) => `${index + 1}. ${line}`),
    '',
    'Si quieres, te ayudo personalmente a mejorar estos puntos en tu web.'
  ].join('\n');

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a;">
      <h2 style="margin:0 0 12px;">Tu informe web esta listo</h2>
      <p style="margin:0 0 14px;color:#334155;">Gracias por solicitarlo. Aqui tienes el resumen de rendimiento de tu web.</p>
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;background:#f8fafc;">
        <p style="margin:0 0 8px;"><strong>Web analizada:</strong> ${toSafeHtml(url || '-')}</p>
        <p style="margin:0 0 8px;"><strong>Nota de velocidad en movil (0-100):</strong> ${score ?? '-'}</p>
        <p style="margin:0 0 8px;"><strong>Tiempo hasta ver la pagina:</strong> ${toSafeHtml(fcp || '-')}</p>
        <p style="margin:0 0 8px;"><strong>Tiempo de carga principal:</strong> ${toSafeHtml(lcp || '-')}</p>
        <p style="margin:0 0 8px;"><strong>Peso total de imagenes:</strong> ${toSafeHtml(imageWeight || '-')}</p>
        <p style="margin:0;"><strong>Peso total de la pagina:</strong> ${toSafeHtml(pageWeight || '-')}</p>
      </div>
      <p style="margin:12px 0 0;color:#334155;"><strong>Estado de peso de pagina:</strong> ${toSafeHtml(`${weightStatus.emoji} ${weightStatus.text}`)}</p>
      ${
        highlights.length
          ? `<h3 style="margin:18px 0 8px;">Mejoras recomendadas</h3><ul style="margin:0 0 16px;padding-left:20px;">${highlights
              .map((line) => `<li style="margin-bottom:6px;">${toSafeHtml(line)}</li>`)
              .join('')}</ul>`
          : ''
      }
      <p style="margin:14px 0 18px;color:#475569;">Si quieres, te puedo enviar una propuesta concreta para que tu web cargue mejor y convierta mas visitas en clientes.</p>
      <a href="${toSafeHtml(whatsappHref)}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;">Hablar por WhatsApp</a>
    </div>
  `;

  try {
    await sendResendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: toEmail,
      subject: ownerSubject,
      text: ownerText,
      html: ownerHtml
    });
    await sendResendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: email,
      subject: customerSubject,
      text: customerText,
      html: customerHtml
    });
  } catch (error) {
    console.error('[pagespeed-lead] Resend error', error);
    return json(
      {
        ok: false,
        error: 'No se pudo enviar el informe por email.'
      },
      { status: 502 }
    );
  }

  leadLastByEmail.set(emailKey, now);

  const sanityClient = getSanityWriteClient();
  if (sanityClient) {
    try {
      await sanityClient.create({
        _type: 'analyzerLead',
        email,
        url: normalizedUrl,
        score: score ?? undefined,
        severity: severity || undefined,
        fcp: fcp || undefined,
        lcp: lcp || undefined,
        imageWeight: imageWeight || undefined,
        pageWeight: pageWeight || undefined,
        source: 'tools-analizador-web',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('[pagespeed-lead] No se pudo guardar en Sanity', error);
    }
  }

  return json({ ok: true });
};
