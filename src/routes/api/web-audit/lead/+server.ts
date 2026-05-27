import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { getSanityWriteClient } from '$lib/server/sanity/get-server-client';
import type { RequestHandler } from './$types';

type LeadPayload = {
  email?: unknown;
  url?: unknown;
  score?: unknown;
  overallScore?: unknown;
  finalUrl?: unknown;
  deliveryVerdict?: unknown;
  severity?: unknown;
  categoryScores?: unknown;
  metrics?: unknown;
  categories?: unknown;
  issues?: unknown;
  passedChecks?: unknown;
  signals?: unknown;
  highlights?: unknown;
  analysisMode?: unknown;
  analysisNote?: unknown;
  website?: unknown; // honeypot
};

type EmailIssue = {
  severity: string;
  category: string;
  title: string;
  why: string;
  fix: string;
  evidence: string;
};

type EmailCategory = {
  id: string;
  label: string;
  score: number | null;
  issues: EmailIssue[];
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

function asScore(value: unknown): number | null {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;
}

function scoreTone(score: number | null): { label: string; color: string; bg: string } {
  if (score === null) return { label: 'Sin datos', color: '#64748b', bg: '#e2e8f0' };
  if (score >= 90) return { label: 'Bien', color: '#047857', bg: '#d1fae5' };
  if (score >= 60) return { label: 'Mejorable', color: '#b45309', bg: '#fef3c7' };
  return { label: 'Critico', color: '#be123c', bg: '#ffe4e6' };
}

function scoreBarHtml(score: number | null, color = '#0d71e3'): string {
  const width = score === null ? 0 : score;
  return `
    <div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
      <div style="height:8px;width:${width}%;background:${color};border-radius:999px;"></div>
    </div>
  `;
}

function formatBytes(value: unknown): string {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '-';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function listSignal(value: unknown): string {
  if (!Array.isArray(value)) return '-';
  const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 8);
  return items.length ? items.join(', ') : '-';
}

function metricCardHtml(label: string, value: string): string {
  return `
    <td style="width:50%;padding:8px;">
      <div style="border:1px solid #dbeafe;background:#f8fbff;border-radius:14px;padding:14px;">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;font-weight:700;">${toSafeHtml(label)}</div>
        <div style="font-size:22px;line-height:1.15;color:#0f172a;font-weight:800;margin-top:6px;">${toSafeHtml(value || '-')}</div>
      </div>
    </td>
  `;
}

function severityLabel(value: string): string {
  if (value === 'critical') return 'Critico';
  if (value === 'warning') return 'Revisar';
  if (value === 'info') return 'Aviso';
  if (value === 'pass') return 'Correcto';
  return value || '-';
}

function verdictLabel(value: string): string {
  if (value === 'block') return 'Bloqueante';
  if (value === 'review') return 'Necesita revision';
  if (value === 'ready') return 'Buen estado';
  return value || '-';
}

function parseIssues(value: unknown): EmailIssue[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        severity: toCleanString(record.severity),
        category: toCleanString(record.category),
        title: toCleanString(record.title),
        why: toCleanString(record.why),
        fix: toCleanString(record.fix),
        evidence: toCleanString(record.evidence)
      };
    })
    .filter((item): item is EmailIssue => Boolean(item?.title))
    .slice(0, 12);
}

function parseCategories(value: unknown): EmailCategory[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        id: toCleanString(record.id),
        label: toCleanString(record.label),
        score: asScore(record.score),
        issues: parseIssues(record.issues)
      };
    })
    .filter((item): item is EmailCategory => Boolean(item?.label))
    .slice(0, 12);
}

function fallbackEmailCategories(categoryScores: Record<string, unknown> | null): EmailCategory[] {
  return [
    ['security', 'Seguridad'],
    ['cms', 'CMS / WordPress'],
    ['seo', 'SEO tecnico'],
    ['ai', 'AEO / IA'],
    ['accessibility', 'Accesibilidad'],
    ['performance', 'Rendimiento'],
    ['privacy', 'Privacidad / legal'],
    ['quality', 'Calidad visible'],
    ['trust', 'Confianza comercial'],
    ['delivery', 'Entrega']
  ].map(([id, label]) => ({
    id,
    label,
    score: asScore(categoryScores?.[id]),
    issues: []
  }));
}

function categoryRowsHtml(categories: EmailCategory[], categoryScores: Record<string, unknown> | null): string {
  const source = categories.length ? categories : fallbackEmailCategories(categoryScores);
  return source
    .map((category) => {
      const score = category.score;
      const tone = scoreTone(score);
      const issueCount = category.issues.length;
      return `
        <tr>
          <td style="padding:10px 0;color:#334155;font-weight:700;">${toSafeHtml(category.label)}${issueCount ? `<span style="display:block;color:#64748b;font-size:12px;font-weight:600;margin-top:2px;">${issueCount} hallazgos</span>` : ''}</td>
          <td style="padding:10px 0;width:90px;text-align:right;color:${tone.color};font-weight:800;">${score ?? '-'}/100</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0 0 8px;">${scoreBarHtml(score, tone.color)}</td>
        </tr>
      `;
    })
    .join('');
}

function issuesHtml(issues: EmailIssue[]): string {
  if (!issues.length) {
    return '<p style="margin:0;color:#475569;">No se han detectado problemas prioritarios en el resumen enviado.</p>';
  }
  return issues
    .map((issue) => {
      const tone =
        issue.severity === 'critical'
          ? { bg: '#ffe4e6', color: '#be123c' }
          : issue.severity === 'warning'
            ? { bg: '#fef3c7', color: '#b45309' }
            : { bg: '#e0f2fe', color: '#0369a1' };
      return `
        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:14px;margin:0 0 10px;background:#ffffff;">
          <div style="display:inline-block;background:${tone.bg};color:${tone.color};font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:5px 8px;">${severityLabel(issue.severity)}</div>
          <h4 style="font-size:16px;line-height:1.25;margin:10px 0 6px;color:#0f172a;">${toSafeHtml(issue.title)}</h4>
          ${issue.evidence ? `<p style="margin:0 0 6px;color:#64748b;font-size:13px;"><strong>Evidencia:</strong> ${toSafeHtml(issue.evidence)}</p>` : ''}
          ${issue.why ? `<p style="margin:0 0 6px;color:#475569;font-size:14px;">${toSafeHtml(issue.why)}</p>` : ''}
          ${issue.fix ? `<p style="margin:0;color:#0f172a;font-size:14px;"><strong>Que hacer:</strong> ${toSafeHtml(issue.fix)}</p>` : ''}
        </div>
      `;
    })
    .join('');
}

function signalsHtml(signals: Record<string, unknown> | null): string {
  const rows = [
    ['HTTPS', signals?.isHttps === true ? 'Correcto' : 'Revisar'],
    ['Redireccion HTTPS', signals?.redirectsToHttps === true ? 'Si' : 'No detectada'],
    ['robots.txt', signals?.hasRobotsTxt === true ? 'Detectado' : 'No detectado'],
    ['sitemap.xml', signals?.hasSitemap === true ? 'Detectado' : 'No detectado'],
    ['llms.txt', signals?.hasLlmsTxt === true ? 'Detectado' : 'No detectado'],
    ['security.txt', signals?.hasSecurityTxt === true ? 'Detectado' : 'No detectado'],
    ['WordPress', signals?.isWordPress === true ? 'Detectado' : 'No detectado'],
    ['Scripts externos', String(signals?.externalScripts ?? '-')],
    ['Enlaces internos', String(signals?.internalLinks ?? '-')],
    ['Imagenes sin alt', String(signals?.imagesWithoutAlt ?? '-')],
    ['Tiempo respuesta HTML', signals?.responseTimeMs ? `${signals.responseTimeMs} ms` : '-'],
    ['Recursos revisados', String(signals?.resourceCount ?? '-')],
    ['Recursos con error', String(signals?.resourceErrors ?? '-')],
    ['Enlaces internos rotos', String(signals?.brokenInternalLinks ?? '-')],
    ['Peso estimado de recursos', formatBytes(signals?.estimatedResourceBytes)],
    ['404 personalizada', signals?.hasCustom404 === true ? 'Detectada' : 'No detectada'],
    ['Tecnologias detectadas', listSignal(signals?.detectedTechnologies)],
    ['Plugins WordPress', listSignal(signals?.wordPressPlugins)],
    ['Auditoria visual', signals?.visualAuditAvailable === true ? 'Ejecutada' : toCleanString(signals?.visualAuditReason) || 'No disponible'],
    ['Errores JS consola', String(signals?.consoleErrors ?? '-')],
    ['Recursos rotos render', String(signals?.renderedResourceErrors ?? '-')],
    ['Requests fallidas render', String(signals?.failedRequests ?? '-')],
    ['Tap targets pequenos', String(signals?.smallTapTargets ?? '-')],
    ['Textos bajo contraste', String(signals?.lowContrastTexts ?? '-')],
    ['Overflow responsive', listSignal(signals?.horizontalOverflowViewports)],
    ['Imagenes rotas render', String(signals?.brokenRenderedImages ?? '-')],
    ['Cookies antes de consentimiento', String(signals?.cookiesBeforeConsent ?? '-')]
  ];
  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#64748b;">${label}</td>
          <td style="padding:8px 0;text-align:right;color:#0f172a;font-weight:700;">${value}</td>
        </tr>
      `
    )
    .join('');
}

function toSafeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
  const finalUrl = toCleanString(body.finalUrl);
  const score = asScore(body.score);
  const overallScore = asScore(body.overallScore);
  const deliveryVerdict = toCleanString(body.deliveryVerdict);
  const severity = toCleanString(body.severity);
  const categoryScores = asRecord(body.categoryScores);
  const issues = parseIssues(body.issues);
  const categories = parseCategories(body.categories);
  const criticalIssues = issues.filter((issue) => issue.severity === 'critical').length;
  const warningIssues = issues.filter((issue) => issue.severity === 'warning').length;
  const signals = asRecord(body.signals);
  const passedChecks = Array.isArray(body.passedChecks)
    ? body.passedChecks.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 10)
    : [];
  const analysisMode = toCleanString(body.analysisMode) === 'partial' ? 'partial' : 'complete';
  const analysisNote = toCleanString(body.analysisNote);
  const highlights = Array.isArray(body.highlights)
    ? body.highlights.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 5)
    : [];

  const scoreLabel = `Nota de rendimiento estructural (0-100): ${score ?? '-'}`;
  const overallScoreLabel = `Nota global del informe (0-100): ${overallScore ?? '-'}`;
  const metricLines = [
    `HTTPS: ${signals?.isHttps === true ? 'Correcto' : 'Revisar'}`,
    `robots.txt: ${signals?.hasRobotsTxt === true ? 'Detectado' : 'No detectado'}`,
    `sitemap.xml: ${signals?.hasSitemap === true ? 'Detectado' : 'No detectado'}`,
    `llms.txt: ${signals?.hasLlmsTxt === true ? 'Detectado' : 'No detectado'}`,
    `security.txt: ${signals?.hasSecurityTxt === true ? 'Detectado' : 'No detectado'}`,
    `Scripts externos: ${String(signals?.externalScripts ?? '-')}`,
    `Imagenes sin alt: ${String(signals?.imagesWithoutAlt ?? '-')}`,
    `Tiempo respuesta HTML: ${signals?.responseTimeMs ? `${signals.responseTimeMs} ms` : '-'}`,
    `Recursos revisados: ${String(signals?.resourceCount ?? '-')}`,
    `Recursos con error: ${String(signals?.resourceErrors ?? '-')}`,
    `Enlaces internos rotos: ${String(signals?.brokenInternalLinks ?? '-')}`,
    `Peso estimado de recursos: ${formatBytes(signals?.estimatedResourceBytes)}`,
    `404 personalizada: ${signals?.hasCustom404 === true ? 'Detectada' : 'No detectada'}`,
    `Tecnologias detectadas: ${listSignal(signals?.detectedTechnologies)}`,
    `Plugins WordPress: ${listSignal(signals?.wordPressPlugins)}`,
    `Auditoria visual: ${signals?.visualAuditAvailable === true ? 'Ejecutada' : toCleanString(signals?.visualAuditReason) || 'No disponible'}`,
    `Errores JS consola: ${String(signals?.consoleErrors ?? '-')}`,
    `Recursos rotos render: ${String(signals?.renderedResourceErrors ?? '-')}`,
    `Requests fallidas render: ${String(signals?.failedRequests ?? '-')}`,
    `Tap targets pequenos: ${String(signals?.smallTapTargets ?? '-')}`,
    `Textos bajo contraste: ${String(signals?.lowContrastTexts ?? '-')}`,
    `Overflow responsive: ${listSignal(signals?.horizontalOverflowViewports)}`,
    `Imagenes rotas render: ${String(signals?.brokenRenderedImages ?? '-')}`,
    `Cookies antes de consentimiento: ${String(signals?.cookiesBeforeConsent ?? '-')}`
  ];
  const scoreStyle = scoreTone(score);
  const overallStyle = scoreTone(overallScore);

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
    `URL final: ${finalUrl || '-'}`,
    scoreLabel,
    overallScoreLabel,
    `Veredicto: ${verdictLabel(deliveryVerdict)}`,
    `Modo de informe: ${analysisMode}`,
    analysisNote ? `Nota: ${analysisNote}` : '',
    `Severidad: ${severity || '-'}`,
    `Problemas: ${criticalIssues} criticos, ${warningIssues} avisos`,
    ...metricLines,
    '',
    ...issues.slice(0, 5).map((issue, index) => `${index + 1}. [${severityLabel(issue.severity)}] ${issue.title}`),
    `IP: ${ip}`
  ].filter(Boolean).join('\n');

  const ownerHtml = `
    <div style="font-family:Arial,sans-serif;max-width:720px;color:#0f172a;">
      <h2 style="margin:0 0 8px;">Nuevo lead desde el analizador web</h2>
      <p style="margin:0 0 14px;color:#475569;"><strong>Email:</strong> ${toSafeHtml(email)} · <strong>URL:</strong> ${toSafeHtml(url || '-')}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 12px;">
        <tr>
          ${metricCardHtml('Rendimiento estructural', score === null ? '-' : `${score}/100`)}
          ${metricCardHtml('Nota global', overallScore === null ? '-' : `${overallScore}/100`)}
        </tr>
        <tr>
          ${metricCardHtml('Veredicto', verdictLabel(deliveryVerdict))}
          ${metricCardHtml('Problemas', `${criticalIssues} criticos · ${warningIssues} avisos`)}
        </tr>
      </table>
      <p style="margin:0 0 8px;color:#475569;"><strong>Modo:</strong> ${analysisMode === 'partial' ? 'Parcial' : 'Completo'}${analysisNote ? ` · ${toSafeHtml(analysisNote)}` : ''}</p>
      <h3 style="margin:18px 0 8px;">Senales tecnicas</h3>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>${metricCardHtml('HTTPS', signals?.isHttps === true ? 'Correcto' : 'Revisar')}${metricCardHtml('WordPress', signals?.isWordPress === true ? 'Detectado' : 'No detectado')}</tr>
        <tr>${metricCardHtml('robots.txt', signals?.hasRobotsTxt === true ? 'Detectado' : 'No detectado')}${metricCardHtml('sitemap.xml', signals?.hasSitemap === true ? 'Detectado' : 'No detectado')}</tr>
        <tr>${metricCardHtml('Scripts externos', String(signals?.externalScripts ?? '-'))}${metricCardHtml('Imagenes sin alt', String(signals?.imagesWithoutAlt ?? '-'))}</tr>
        <tr>${metricCardHtml('Respuesta HTML', signals?.responseTimeMs ? `${signals.responseTimeMs} ms` : '-')}${metricCardHtml('Peso recursos', formatBytes(signals?.estimatedResourceBytes))}</tr>
        <tr>${metricCardHtml('Recursos con error', String(signals?.resourceErrors ?? '-'))}${metricCardHtml('Enlaces rotos', String(signals?.brokenInternalLinks ?? '-'))}</tr>
        <tr>${metricCardHtml('Tecnologias', listSignal(signals?.detectedTechnologies))}${metricCardHtml('Plugins WP', listSignal(signals?.wordPressPlugins))}</tr>
        <tr>${metricCardHtml('Auditoria visual', signals?.visualAuditAvailable === true ? 'Ejecutada' : 'No disponible')}${metricCardHtml('Consola JS', `${String(signals?.consoleErrors ?? '-')} errores`)}</tr>
        <tr>${metricCardHtml('Responsive real', listSignal(signals?.horizontalOverflowViewports) === '-' ? 'Sin overflow' : listSignal(signals?.horizontalOverflowViewports))}${metricCardHtml('Cookies render', String(signals?.cookiesBeforeConsent ?? '-'))}</tr>
      </table>
      <h3 style="margin:18px 0 8px;">Puntuaciones</h3>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${categoryRowsHtml(categories, categoryScores)}</table>
      <h3 style="margin:18px 0 8px;">Problemas prioritarios</h3>
      ${issuesHtml(issues)}
    ${
      highlights.length
        ? `<p style="margin:18px 0 6px;"><strong>Highlights:</strong></p><ul>${highlights
            .map((line) => `<li>${toSafeHtml(line)}</li>`)
            .join('')}</ul>`
        : ''
    }
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;" />
      <p style="margin:0;color:#64748b;font-size:12px;">IP: ${toSafeHtml(ip)}</p>
    </div>
  `;

  const analyzedDomain = extractDomain(url || '');
  const customerSubject = analyzedDomain
    ? `Resultado de tu analisis web: ${analyzedDomain}`
    : 'Resultado de tu analisis web';
  const customerText = [
    'Gracias por solicitar tu informe.',
    '',
    `Web analizada: ${url || '-'}`,
    finalUrl ? `URL final: ${finalUrl}` : '',
    scoreLabel,
    overallScoreLabel,
    `Veredicto: ${verdictLabel(deliveryVerdict)}`,
    analysisMode === 'partial' ? 'Nota: se ha generado un informe tecnico parcial con los checks disponibles.' : '',
    '',
    ...metricLines,
    '',
    `Problemas detectados: ${criticalIssues} criticos, ${warningIssues} avisos`,
    '',
    ...highlights.map((line, index) => `${index + 1}. ${line}`),
    '',
    ...issues.slice(0, 5).map((issue, index) => `${index + 1}. ${issue.title} - ${issue.fix}`),
    '',
    'Si quieres, te ayudo personalmente a mejorar estos puntos en tu web.'
  ].filter(Boolean).join('\n');

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#0f172a;background:#ffffff;">
      <div style="background:#061224;color:#ffffff;border-radius:18px 18px 0 0;padding:26px 28px;">
        <p style="margin:0 0 8px;color:#7dd3fc;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;">Informe web tecnico</p>
        <h2 style="margin:0;font-size:28px;line-height:1.1;">Tu informe web esta listo</h2>
        <p style="margin:12px 0 0;color:#cbd5e1;">${toSafeHtml(analyzedDomain || 'Web analizada')} · ${analysisMode === 'partial' ? 'informe parcial' : 'analisis completo'}</p>
      </div>
      <div style="border:1px solid #dbeafe;border-top:none;border-radius:0 0 18px 18px;padding:24px 28px;background:#f8fbff;">
        <p style="margin:0 0 16px;color:#334155;">Gracias por solicitarlo. Aqui tienes un resumen mas completo para entender que esta funcionando y que conviene revisar.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 10px;">
          <tr>
            <td style="width:50%;padding:8px;">
              <div style="background:${scoreStyle.bg};border-radius:16px;padding:18px;">
                <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${scoreStyle.color};font-weight:800;">Rendimiento estructural</div>
                <div style="font-size:42px;line-height:1;color:${scoreStyle.color};font-weight:900;margin-top:8px;">${score ?? '-'}</div>
                <div style="margin-top:10px;">${scoreBarHtml(score, scoreStyle.color)}</div>
              </div>
            </td>
            <td style="width:50%;padding:8px;">
              <div style="background:${overallStyle.bg};border-radius:16px;padding:18px;">
                <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${overallStyle.color};font-weight:800;">Nota global</div>
                <div style="font-size:42px;line-height:1;color:${overallStyle.color};font-weight:900;margin-top:8px;">${overallScore ?? '-'}</div>
                <div style="margin-top:10px;">${scoreBarHtml(overallScore, overallStyle.color)}</div>
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:8px 8px 18px;color:#475569;"><strong>Web analizada:</strong> ${toSafeHtml(url || '-')}${finalUrl ? `<br><strong>URL final:</strong> ${toSafeHtml(finalUrl)}` : ''}</p>
        ${
          analysisMode === 'partial'
            ? `<div style="border:1px solid #fde68a;background:#fffbeb;border-radius:14px;padding:12px 14px;margin:0 8px 18px;color:#92400e;"><strong>Nota:</strong> se ha generado un informe tecnico parcial con los checks propios disponibles.</div>`
            : ''
        }
        <h3 style="margin:22px 8px 8px;">Senales tecnicas clave</h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          <tr>${metricCardHtml('HTTPS', signals?.isHttps === true ? 'Correcto' : 'Revisar')}${metricCardHtml('WordPress', signals?.isWordPress === true ? 'Detectado' : 'No detectado')}</tr>
          <tr>${metricCardHtml('robots.txt', signals?.hasRobotsTxt === true ? 'Detectado' : 'No detectado')}${metricCardHtml('sitemap.xml', signals?.hasSitemap === true ? 'Detectado' : 'No detectado')}</tr>
          <tr>${metricCardHtml('Scripts externos', String(signals?.externalScripts ?? '-'))}${metricCardHtml('Imagenes sin alt', String(signals?.imagesWithoutAlt ?? '-'))}</tr>
          <tr>${metricCardHtml('Respuesta HTML', signals?.responseTimeMs ? `${signals.responseTimeMs} ms` : '-')}${metricCardHtml('Peso recursos', formatBytes(signals?.estimatedResourceBytes))}</tr>
          <tr>${metricCardHtml('Recursos con error', String(signals?.resourceErrors ?? '-'))}${metricCardHtml('Enlaces rotos', String(signals?.brokenInternalLinks ?? '-'))}</tr>
          <tr>${metricCardHtml('Tecnologias', listSignal(signals?.detectedTechnologies))}${metricCardHtml('Plugins WP', listSignal(signals?.wordPressPlugins))}</tr>
          <tr>${metricCardHtml('Auditoria visual', signals?.visualAuditAvailable === true ? 'Ejecutada' : 'No disponible')}${metricCardHtml('Consola JS', `${String(signals?.consoleErrors ?? '-')} errores`)}</tr>
          <tr>${metricCardHtml('Responsive real', listSignal(signals?.horizontalOverflowViewports) === '-' ? 'Sin overflow' : listSignal(signals?.horizontalOverflowViewports))}${metricCardHtml('Cookies render', String(signals?.cookiesBeforeConsent ?? '-'))}</tr>
        </table>
        <h3 style="margin:22px 8px 8px;">Puntuaciones por area</h3>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:12px 16px;margin:0 8px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${categoryRowsHtml(categories, categoryScores)}</table>
        </div>
        <h3 style="margin:22px 8px 8px;">Senales tecnicas detectadas</h3>
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:12px 16px;margin:0 8px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${signalsHtml(signals)}</table>
        </div>
      ${
        highlights.length
          ? `<h3 style="margin:22px 8px 8px;">Lectura rapida</h3><ul style="margin:0 8px 16px;padding-left:20px;color:#334155;">${highlights
              .map((line) => `<li style="margin-bottom:6px;">${toSafeHtml(line)}</li>`)
              .join('')}</ul>`
          : ''
      }
        <h3 style="margin:22px 8px 8px;">Problemas prioritarios</h3>
        <div style="margin:0 8px 18px;">${issuesHtml(issues.slice(0, 6))}</div>
        ${
          passedChecks.length
            ? `<h3 style="margin:22px 8px 8px;">Checks correctos</h3><ul style="margin:0 8px 18px;padding-left:20px;color:#334155;">${passedChecks
                .map((line) => `<li style="margin-bottom:5px;">${toSafeHtml(line)}</li>`)
                .join('')}</ul>`
            : ''
        }
        <p style="margin:18px 8px;color:#475569;">Si quieres, puedo revisar estos puntos contigo y priorizar que merece la pena tocar primero para mejorar rendimiento, SEO tecnico y confianza visual.</p>
        <a href="${toSafeHtml(whatsappHref)}" style="display:inline-block;background:#0d71e3;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:800;margin:0 8px 4px;">Comentar el informe</a>
      </div>
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
    console.error('[web-audit-lead] Resend error', error);
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
        source: 'tools-analizador-web',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('[web-audit-lead] No se pudo guardar en Sanity', error);
    }
  }

  return json({ ok: true });
};
