import { env } from '$env/dynamic/private';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

type Severity = 'slow' | 'needs_improvement' | 'fast';

export type AnalyzerResponse = {
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

export type AnalyzeJobState = {
  id: string;
  cacheKey: string;
  requestedUrl: string;
  strategy: 'mobile' | 'desktop';
  status: 'queued' | 'running' | 'completed' | 'error';
  result?: AnalyzerResponse;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const STALE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_PAGESPEED_TIMEOUT_MS = 90000;
const MAX_JOBS = 200;
const JOB_KEEP_MS = 10 * 60 * 1000;

const responseCache = new Map<string, { expiresAt: number; staleAt: number; data: AnalyzerResponse }>();
const inFlightRequests = new Map<string, Promise<AnalyzerResponse>>();
const jobs = new Map<string, AnalyzeJobState>();
const latestJobByCacheKey = new Map<string, string>();
let jobQueue: Promise<void> = Promise.resolve();
let persistentCacheLoaded = false;
const persistentCachePath = resolve(process.cwd(), '.cache', 'pagespeed-analyzer-cache.json');

function toCleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeUrl(input: string): string | null {
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

export function normalizeStrategy(input: unknown): 'mobile' | 'desktop' {
  const requested = toCleanString(input).toLowerCase();
  return requested === 'desktop' ? 'desktop' : 'mobile';
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

function getImageBytes(audits: Record<string, { numericValue?: number; details?: { items?: Array<{ resourceType?: string; label?: string; transferSize?: number }> } }>): number | undefined {
  const fromTotalWeight = audits['total-byte-weight']?.details?.items
    ?.filter((item) => typeof item?.resourceType === 'string' && item.resourceType.toLowerCase() === 'image')
    ?.reduce((sum, item) => sum + (typeof item?.transferSize === 'number' ? item.transferSize : 0), 0);

  if (typeof fromTotalWeight === 'number' && fromTotalWeight > 0) return fromTotalWeight;

  const fromResourceSummary = audits['resource-summary']?.details?.items
    ?.filter((item) => {
      const resourceType = typeof item?.resourceType === 'string' ? item.resourceType.toLowerCase() : '';
      const label = typeof item?.label === 'string' ? item.label.toLowerCase() : '';
      return resourceType === 'image' || label.includes('image');
    })
    ?.reduce((sum, item) => sum + (typeof item?.transferSize === 'number' ? item.transferSize : 0), 0);

  if (typeof fromResourceSummary === 'number' && fromResourceSummary > 0) return fromResourceSummary;
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

async function loadPersistentCacheIfNeeded() {
  if (persistentCacheLoaded) return;
  persistentCacheLoaded = true;
  try {
    const raw = await readFile(persistentCachePath, 'utf8');
    const parsed = JSON.parse(raw) as Array<[string, { expiresAt: number; staleAt: number; data: AnalyzerResponse }]>;
    const now = Date.now();
    for (const [key, entry] of parsed) {
      if (entry?.staleAt > now) responseCache.set(key, entry);
    }
  } catch {
    // Sin cache persistente inicial.
  }
}

async function persistCacheSnapshot() {
  try {
    const now = Date.now();
    const entries = [...responseCache.entries()].filter(([, value]) => value.staleAt > now);
    await mkdir(dirname(persistentCachePath), { recursive: true });
    await writeFile(persistentCachePath, JSON.stringify(entries), 'utf8');
  } catch {
    // Si no se puede persistir, mantenemos cache en memoria.
  }
}

function cacheKeyFor(url: string, strategy: 'mobile' | 'desktop'): string {
  return `${strategy}:${url.toLowerCase()}`;
}

function getCachedResponse(cacheKey: string, now: number): AnalyzerResponse | null {
  const cache = responseCache.get(cacheKey);
  if (!cache) return null;
  if (cache.expiresAt > now) return { ...cache.data, cached: true };
  return null;
}

function getStaleCachedResponse(cacheKey: string, now: number): AnalyzerResponse | null {
  const cache = responseCache.get(cacheKey);
  if (!cache) return null;
  if (cache.staleAt > now) return { ...cache.data, cached: true };
  return null;
}

function registerCache(cacheKey: string, data: AnalyzerResponse, now: number) {
  responseCache.set(cacheKey, {
    expiresAt: now + CACHE_TTL_MS,
    staleAt: now + STALE_CACHE_TTL_MS,
    data
  });
  void persistCacheSnapshot();
}

async function fetchAnalyze(url: string, strategy: 'mobile' | 'desktop'): Promise<AnalyzerResponse> {
  const apiKey = env.PAGESPEED_API_KEY;
  if (!apiKey) throw new Error('PAGESPEED_API_KEY_MISSING');

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('strategy', strategy);
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('key', apiKey);

  const configuredTimeoutMs = Number(env.PAGESPEED_TIMEOUT_MS || DEFAULT_PAGESPEED_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(configuredTimeoutMs)
    ? Math.max(30000, Math.min(180000, Math.round(configuredTimeoutMs)))
    : DEFAULT_PAGESPEED_TIMEOUT_MS;

  const fetchWithTimeout = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(endpoint, { method: 'GET', signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  };

  let response = await fetchWithTimeout();
  if (!response.ok && (response.status === 429 || response.status >= 500)) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    response = await fetchWithTimeout();
  }
  if (!response.ok) throw new Error('PSI_RESPONSE_NOT_OK');

    const psiData = (await response.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, { numericValue?: number; details?: { items?: Array<{ resourceType?: string; label?: string; transferSize?: number }> } }>;
      };
    };
    const performanceScoreRaw = psiData.lighthouseResult?.categories?.performance?.score;
    const performanceScore = typeof performanceScoreRaw === 'number' ? Math.round(performanceScoreRaw * 100) : 0;
    const audits = psiData.lighthouseResult?.audits ?? {};
    const imageBytes = getImageBytes(audits);
  return {
    ok: true,
    requestedUrl: url,
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
}

async function runAnalyzeWithCoalescing(cacheKey: string, url: string, strategy: 'mobile' | 'desktop') {
  const inflight = inFlightRequests.get(cacheKey);
  if (inflight) return inflight;
  const promise = fetchAnalyze(url, strategy).finally(() => {
    inFlightRequests.delete(cacheKey);
  });
  inFlightRequests.set(cacheKey, promise);
  return promise;
}

function cleanOldJobs(now: number) {
  for (const [id, job] of jobs) {
    if (now - job.updatedAt > JOB_KEEP_MS && (job.status === 'completed' || job.status === 'error')) {
      jobs.delete(id);
    }
  }
  while (jobs.size > MAX_JOBS) {
    const first = jobs.keys().next().value;
    if (!first) break;
    jobs.delete(first);
  }
}

async function processJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = 'running';
  job.updatedAt = Date.now();

  try {
    const result = await runAnalyzeWithCoalescing(job.cacheKey, job.requestedUrl, job.strategy);
    registerCache(job.cacheKey, result, Date.now());
    job.status = 'completed';
    job.result = result;
    job.updatedAt = Date.now();
  } catch (error) {
    const stale = getStaleCachedResponse(job.cacheKey, Date.now());
    if (stale) {
      job.status = 'completed';
      job.result = stale;
      job.updatedAt = Date.now();
      return;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      job.error = 'El analisis esta tardando demasiado. Prueba de nuevo en unos segundos.';
    } else if (error instanceof Error && error.message === 'PAGESPEED_API_KEY_MISSING') {
      job.error = 'Falta configurar PAGESPEED_API_KEY en el servidor.';
    } else {
      job.error = 'No se pudo completar el analisis en este momento.';
    }
    job.status = 'error';
    job.updatedAt = Date.now();
  } finally {
    cleanOldJobs(Date.now());
  }
}

export async function enqueueAnalyzeJob(inputUrl: string, inputStrategy: unknown) {
  await loadPersistentCacheIfNeeded();
  const normalizedUrl = normalizeUrl(toCleanString(inputUrl));
  if (!normalizedUrl) return { ok: false as const, error: 'Introduce una URL valida.', statusCode: 400 };

  const strategy = normalizeStrategy(inputStrategy);
  const now = Date.now();
  const cacheKey = cacheKeyFor(normalizedUrl, strategy);
  const cached = getCachedResponse(cacheKey, now);
  if (cached) {
    return { ok: true as const, status: 'completed' as const, result: cached };
  }

  const existingJobId = latestJobByCacheKey.get(cacheKey);
  if (existingJobId) {
    const existingJob = jobs.get(existingJobId);
    if (existingJob && (existingJob.status === 'queued' || existingJob.status === 'running')) {
      return { ok: true as const, status: 'queued' as const, jobId: existingJob.id, pollAfterMs: 1000 };
    }
  }

  const id = randomUUID();
  const job: AnalyzeJobState = {
    id,
    cacheKey,
    requestedUrl: normalizedUrl,
    strategy,
    status: 'queued',
    createdAt: now,
    updatedAt: now
  };
  jobs.set(id, job);
  latestJobByCacheKey.set(cacheKey, id);

  jobQueue = jobQueue.then(async () => {
    await processJob(id);
  });

  return { ok: true as const, status: 'queued' as const, jobId: id, pollAfterMs: 1000 };
}

export function getAnalyzeJob(jobId: string): AnalyzeJobState | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  return job;
}
