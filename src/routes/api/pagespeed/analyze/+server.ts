import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { enqueueAnalyzeJob } from '$lib/server/pagespeed-analyzer';
import type { RequestHandler } from './$types';

type AnalyzePayload = {
  url?: unknown;
  strategy?: unknown;
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ipHits = new Map<string, number[]>();
const dailyBudget = new Map<string, number>();

function toCleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
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

  let body: AnalyzePayload;
  try {
    body = (await request.json()) as AnalyzePayload;
  } catch {
    return json({ ok: false, error: 'JSON invalido.' }, { status: 400 });
  }

  const inputUrl = toCleanString(body.url);
  const strategy = toCleanString(body.strategy).toLowerCase();
  if (inputUrl.length > 2048 || strategy.length > 24) {
    return json({ ok: false, error: 'La URL o la estrategia son demasiado largas.' }, { status: 400 });
  }

  const requesterIp = getClientAddress();
  const now = Date.now();
  const hourlyLimit = Math.max(1, Number(env.PAGESPEED_RATE_LIMIT_PER_HOUR || 15));
  const currentHits = (ipHits.get(requesterIp) || []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
  if (currentHits.length >= hourlyLimit) {
    return json(
      { ok: false, error: 'Has superado el limite de analisis por hora. Prueba de nuevo en un rato.' },
      { status: 429 }
    );
  }
  currentHits.push(now);
  ipHits.set(requesterIp, currentHits);

  const dayKey = new Date(now).toISOString().slice(0, 10);
  const maxCallsPerDay = Math.max(1, Number(env.PAGESPEED_MAX_CALLS_PER_DAY || 250));
  const todayCalls = dailyBudget.get(dayKey) || 0;
  if (todayCalls >= maxCallsPerDay) {
    return json(
      { ok: false, error: 'El analizador ha alcanzado su cupo diario. Prueba de nuevo manana.' },
      { status: 429 }
    );
  }

  const queued = await enqueueAnalyzeJob(inputUrl, strategy);
  if (!queued.ok) {
    return json({ ok: false, error: queued.error }, { status: queued.statusCode });
  }
  if (queued.status === 'completed') {
    dailyBudget.set(dayKey, todayCalls + 1);
    return json(queued.result);
  }
  return json({
    ok: true,
    status: 'queued',
    jobId: queued.jobId,
    pollAfterMs: queued.pollAfterMs
  });
};
