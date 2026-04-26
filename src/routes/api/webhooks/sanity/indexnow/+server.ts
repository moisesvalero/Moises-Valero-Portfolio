import { json } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { submitToIndexNow } from '$lib/server/indexnow';
import type { RequestHandler } from './$types';

type SanityWebhookBody = {
  _type?: unknown;
  slug?: unknown;
  operation?: unknown;
  transition?: unknown;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function resolveBaseUrl(): string {
  try {
    return new URL((publicEnv.PUBLIC_SITE_URL || 'https://moisesvalero.es').trim()).toString().replace(/\/$/, '');
  } catch {
    return 'https://moisesvalero.es';
  }
}

function resolveSlug(slugField: unknown): string | null {
  if (typeof slugField === 'string') {
    const clean = slugField.trim().replace(/^\/+|\/+$/g, '');
    return clean || null;
  }
  const rec = asRecord(slugField);
  const current = rec && typeof rec.current === 'string' ? rec.current.trim() : '';
  if (!current) return null;
  return current.replace(/^\/+|\/+$/g, '') || null;
}

function resolveIncomingToken(request: Request): string {
  const byHeader = request.headers.get('x-webhook-token')?.trim() || '';
  if (byHeader) return byHeader;
  const auth = request.headers.get('authorization')?.trim() || '';
  return auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
}

function shouldSkipByTransition(transition: string): boolean {
  // En borrados no tendremos página canónica accesible, así que evitamos notificar.
  return transition === 'disappear';
}

export const POST: RequestHandler = async ({ request }) => {
  const expectedToken = privateEnv.SANITY_WEBHOOK_TOKEN?.trim();
  if (!expectedToken) {
    return json(
      { ok: false, error: 'Falta SANITY_WEBHOOK_TOKEN en el servidor.' },
      { status: 500 }
    );
  }

  const incomingToken = resolveIncomingToken(request);
  if (!incomingToken || incomingToken !== expectedToken) {
    return json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  let body: SanityWebhookBody;
  try {
    body = (await request.json()) as SanityWebhookBody;
  } catch {
    return json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const type = typeof body._type === 'string' ? body._type : '';
  if (type !== 'landingSupportArticle') {
    return json({
      ok: true,
      skipped: true,
      reason: `Tipo ignorado: ${type || 'desconocido'}`
    });
  }

  const transition = typeof body.transition === 'string' ? body.transition : '';
  if (shouldSkipByTransition(transition)) {
    return json({
      ok: true,
      skipped: true,
      reason: 'Transición de borrado (disappear), no se notifica IndexNow.'
    });
  }

  const slug = resolveSlug(body.slug);
  if (!slug) {
    return json({ ok: false, error: 'Payload sin slug válido.' }, { status: 400 });
  }

  const baseUrl = resolveBaseUrl();
  const articleCanonical = `${baseUrl}/diseno-web-alcoy/${slug}`;
  const urls = [
    articleCanonical,
    `${baseUrl}/diseno-web-alcoy/articulos`,
    `${baseUrl}/diseno-web`,
    `${baseUrl}/diseno-web-alcoy`
  ];

  const result = await submitToIndexNow(urls);
  if (!result.ok) {
    return json(
      {
        ok: false,
        error: 'IndexNow devolvió error.',
        status: result.status,
        detail: result.detail || '',
        submitted: result.submitted
      },
      { status: 502 }
    );
  }

  return json({
    ok: true,
    submitted: result.submitted,
    article: articleCanonical
  });
};
