import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

type AnalyzePayload = {
  url?: unknown;
  strategy?: unknown;
};

type Severity = 'slow' | 'needs_improvement' | 'fast';
type AnalyzerResponse = {
  ok: true;
  requestedUrl: string;
  strategy: string;
  performanceScore: number;
  severity: Severity;
  metrics: {
    fcp: string;
    lcp: string;
    imageWeight: string;
    pageWeight: string;
  };
  highlights: string[];
  cached: boolean;
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const PAGESPEED_TIMEOUT_MS = 30000;
const ipHits = new Map<string, number[]>();
const responseCache = new Map<string, { expiresAt: number; data: AnalyzerResponse }>();
const dailyBudget = new Map<string, number>();

function toCleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeUrl(input: string): string | null {
  if (!input) return null;
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function formatMetric(value?: number, unit: 'seconds' | 'milliseconds' | 'numeric' = 'numeric'): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/D';
  if (unit === 'seconds') return `${(value / 1000).toFixed(1)} s`;
  if (unit === 'milliseconds') return `${Math.round(value)} ms`;
  return `${value}`;
}

function formatBytes(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/D';
  if (value < 1024) return `${Math.round(value)} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function getImageBytes(audits: Record<string, { numericValue?: number; details?: { items?: Array<{ resourceType?: string; label?: string; transferSize?: number; }> } }>): number | undefined {
  const fromTotalWeight = audits['total-byte-weight']?.details?.items
    ?.filter((item) => typeof item?.resourceType === 'string' && item.resourceType.toLowerCase() === 'image')
    ?.reduce((sum, item) => sum + (typeof item?.transferSize === 'number' ? item.transferSize : 0), 0);

  if (typeof fromTotalWeight === 'number' && fromTotalWeight > 0) {
    return fromTotalWeight;
  }

  const fromResourceSummary = audits['resource-summary']?.details?.items
    ?.filter((item) => {
      const resourceType = typeof item?.resourceType === 'string' ? item.resourceType.toLowerCase() : '';
      const label = typeof item?.label === 'string' ? item.label.toLowerCase() : '';
      return resourceType === 'image' || label.includes('image');
    })
    ?.reduce((sum, item) => sum + (typeof item?.transferSize === 'number' ? item.transferSize : 0), 0);

  if (typeof fromResourceSummary === 'number' && fromResourceSummary > 0) {
    return fromResourceSummary;
  }

  return undefined;
}

function severityFromScore(score: number): Severity {
  if (score < 50) return 'slow';
  if (score < 90) return 'needs_improvement';
  return 'fast';
}

function highlightsFromScore(score: number): string[] {
  if (score < 50) {
    return [
      'Tu web carga lenta en movil y puede perder clientes antes de ver el contenido.',
      'Optimizar imagenes, scripts y cache mejoraria velocidad y posicionamiento local.',
      'Podemos prepararla para que convierta mejor en Alcoy y alrededores.'
    ];
  }
  if (score < 90) {
    return [
      'La velocidad es mejorable, sobre todo en movil.',
      'Con ajustes tecnicos se puede reducir el tiempo de carga y mejorar experiencia.',
      'Una optimizacion enfocada a conversion local puede marcar diferencia.'
    ];
  }
  return [
    'La base de rendimiento es buena.',
    'Aun se puede trabajar conversion, mensajes y SEO local para captar mas contactos.',
    'Podemos ayudarte a mantener esta nota y mejorar resultados de negocio.'
  ];
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  let body: AnalyzePayload;
  try {
    body = (await request.json()) as AnalyzePayload;
  } catch {
    return json({ ok: false, error: 'JSON invalido.' }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(toCleanString(body.url));
  if (!normalizedUrl) {
    return json({ ok: false, error: 'Introduce una URL valida.' }, { status: 400 });
  }
  const requestedStrategy = toCleanString(body.strategy).toLowerCase();
  const strategy = requestedStrategy === 'desktop' ? 'desktop' : 'mobile';
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

  const cacheKey = normalizedUrl.toLowerCase();
  const cachedEntry = responseCache.get(cacheKey);
  if (cachedEntry && cachedEntry.expiresAt > now) {
    return json({ ...cachedEntry.data, cached: true });
  }

  const dayKey = new Date(now).toISOString().slice(0, 10);
  const maxCallsPerDay = Math.max(1, Number(env.PAGESPEED_MAX_CALLS_PER_DAY || 250));
  const todayCalls = dailyBudget.get(dayKey) || 0;
  if (todayCalls >= maxCallsPerDay) {
    return json(
      { ok: false, error: 'El analizador ha alcanzado su cupo diario. Prueba de nuevo manana.' },
      { status: 429 }
    );
  }

  const apiKey = env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return json({ ok: false, error: 'Falta configurar PAGESPEED_API_KEY en el servidor.' }, { status: 500 });
  }

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', normalizedUrl);
  endpoint.searchParams.set('strategy', strategy);
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('key', apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const details = await response.text().catch(() => 'Sin detalles');
      console.error('[pagespeed-analyze] PSI error', details.slice(0, 400));
      return json({ ok: false, error: 'No se pudo analizar la URL.' }, { status: 502 });
    }

    const psiData = (await response.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<
          string,
          {
            numericValue?: number;
            details?: {
              items?: Array<{
                resourceType?: string;
                label?: string;
                transferSize?: number;
              }>;
            };
          }
        >;
      };
    };

    const performanceScoreRaw = psiData.lighthouseResult?.categories?.performance?.score;
    const performanceScore = typeof performanceScoreRaw === 'number' ? Math.round(performanceScoreRaw * 100) : 0;
    const audits = psiData.lighthouseResult?.audits ?? {};
    const imageBytes = getImageBytes(audits);

    const result: AnalyzerResponse = {
      ok: true,
      requestedUrl: normalizedUrl,
      strategy,
      performanceScore,
      severity: severityFromScore(performanceScore),
      metrics: {
        fcp: formatMetric(audits['first-contentful-paint']?.numericValue, 'seconds'),
        lcp: formatMetric(audits['largest-contentful-paint']?.numericValue, 'seconds'),
        imageWeight: formatBytes(imageBytes),
        pageWeight: formatBytes(audits['total-byte-weight']?.numericValue)
      },
      highlights: highlightsFromScore(performanceScore),
      cached: false
    };

    responseCache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      data: result
    });
    dailyBudget.set(dayKey, todayCalls + 1);

    return json(result);
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      return json(
        { ok: false, error: 'El analisis esta tardando demasiado. Prueba de nuevo en unos segundos.' },
        { status: 504 }
      );
    }
    return json({ ok: false, error: 'No se pudo completar el analisis en este momento.' }, { status: 504 });
  }
};
