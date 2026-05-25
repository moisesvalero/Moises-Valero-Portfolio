import { env } from '$env/dynamic/private';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
	auditPublicWebsite,
	computeDeliveryVerdict,
	isAllowedPublicAuditUrl,
	scoreCategoryFromIssues,
	type AuditCategory,
	type AuditCategoryId,
	type AuditIssue,
	type DeliveryVerdict,
	type PublicWebAudit
} from '$lib/server/web-delivery-auditor';

type Severity = 'slow' | 'needs_improvement' | 'fast';

export type AnalyzerResponse = {
  ok: true;
  requestedUrl: string;
  strategy: string;
  finalUrl?: string;
  performanceScore: number;
  overallScore: number;
  deliveryVerdict: DeliveryVerdict;
  severity: Severity;
  categoryScores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    security: number;
    quality: number;
  };
  metrics: {
    fcp: string;
    lcp: string;
    cls: string;
    tbt: string;
    imageWeight: string;
    pageWeight: string;
  };
  categories: AuditCategory[];
  issues: AuditIssue[];
  passedChecks: string[];
  signals: PublicWebAudit['signals'];
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

function scoreFromLighthouse(value: unknown): number {
  return typeof value === 'number' ? Math.round(value * 100) : 0;
}

function lighthouseIssue(
  id: string,
  category: AuditCategoryId,
  score: number,
  title: string,
  fix: string
): AuditIssue | null {
  if (score >= 90) return null;
  return {
    id,
    category,
    severity: score < 50 ? 'critical' : 'warning',
    title,
    why: 'Lighthouse marca esta categoria por debajo del nivel recomendable antes de entregar.',
    fix,
    evidence: `${score}/100`
  };
}

function fallbackAudit(url: string, lighthouseScores: Partial<Record<AuditCategoryId, number>>, extraIssues: AuditIssue[]): PublicWebAudit {
  const auditUnavailable: AuditIssue = {
    id: 'quality.remote-audit-unavailable',
    category: 'quality',
    severity: 'warning',
    title: 'No se pudieron completar los checks propios',
    why: 'PageSpeed respondio, pero el analizador no pudo leer directamente la URL para revisar cabeceras, SEO y HTML.',
    fix: 'Reintenta el analisis y comprueba que la web sea publica, estable y no bloquee peticiones externas.'
  };
  const issues = [...extraIssues, auditUnavailable];
  const categoryIds: AuditCategoryId[] = ['performance', 'security', 'seo', 'accessibility', 'quality'];
  const labels: Record<AuditCategoryId, string> = {
    performance: 'Rendimiento',
    security: 'Seguridad',
    seo: 'SEO tecnico',
    accessibility: 'Accesibilidad',
    quality: 'Calidad visible'
  };
  const categories = categoryIds.map((id) => {
    const categoryIssues = issues.filter((item) => item.category === id);
    return {
      id,
      label: labels[id],
      score: scoreCategoryFromIssues(categoryIssues, lighthouseScores[id] ?? 100),
      issues: categoryIssues
    };
  });
  return {
    finalUrl: url,
    overallScore: Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length),
    verdict: computeDeliveryVerdict(issues),
    categories,
    issues,
    passedChecks: [],
    signals: {
      isHttps: url.startsWith('https://'),
      redirectsToHttps: false,
      hasRobotsTxt: false,
      hasSitemap: false,
      isWordPress: false,
      externalScripts: 0,
      internalLinks: 0,
      imagesWithoutAlt: 0
    }
  };
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
  endpoint.searchParams.append('category', 'performance');
  endpoint.searchParams.append('category', 'accessibility');
  endpoint.searchParams.append('category', 'best-practices');
  endpoint.searchParams.append('category', 'seo');
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
        categories?: {
          performance?: { score?: number };
          accessibility?: { score?: number };
          'best-practices'?: { score?: number };
          seo?: { score?: number };
        };
        audits?: Record<string, { numericValue?: number; details?: { items?: Array<{ resourceType?: string; label?: string; transferSize?: number }> } }>;
      };
    };
    const performanceScore = scoreFromLighthouse(psiData.lighthouseResult?.categories?.performance?.score);
    const accessibilityScore = scoreFromLighthouse(psiData.lighthouseResult?.categories?.accessibility?.score);
    const bestPracticesScore = scoreFromLighthouse(psiData.lighthouseResult?.categories?.['best-practices']?.score);
    const seoScore = scoreFromLighthouse(psiData.lighthouseResult?.categories?.seo?.score);
    const audits = psiData.lighthouseResult?.audits ?? {};
    const imageBytes = getImageBytes(audits);
    const lighthouseScores: Partial<Record<AuditCategoryId, number>> = {
      performance: performanceScore,
      accessibility: accessibilityScore || undefined,
      seo: seoScore || undefined,
      quality: bestPracticesScore || undefined
    };
    const lighthouseIssues = [
      lighthouseIssue(
        'lighthouse.performance',
        'performance',
        performanceScore,
        'Rendimiento por debajo del objetivo',
        'Revisa LCP, peso de recursos, imagenes, cache y JavaScript que bloquee la carga.'
      ),
      lighthouseIssue(
        'lighthouse.accessibility',
        'accessibility',
        accessibilityScore,
        'Accesibilidad por debajo del objetivo',
        'Corrige nombres accesibles, contraste, labels, estructura semantica y navegacion por teclado.'
      ),
      lighthouseIssue(
        'lighthouse.best-practices',
        'quality',
        bestPracticesScore,
        'Buenas practicas por debajo del objetivo',
        'Revisa errores de navegador, librerias inseguras, APIs obsoletas y configuracion general.'
      ),
      lighthouseIssue(
        'lighthouse.seo',
        'seo',
        seoScore,
        'SEO tecnico por debajo del objetivo',
        'Corrige indexabilidad, metadatos, enlaces, canonical y contenido interpretable por buscadores.'
      )
    ].filter((item): item is AuditIssue => item !== null);

    const publicAudit = await auditPublicWebsite(url, {
      timeoutMs: 18000,
      lighthouseScores,
      extraIssues: lighthouseIssues
    }).catch(() => fallbackAudit(url, lighthouseScores, lighthouseIssues));
  return {
    ok: true,
    requestedUrl: url,
    strategy,
    finalUrl: publicAudit.finalUrl,
    performanceScore,
    overallScore: publicAudit.overallScore,
    deliveryVerdict: publicAudit.verdict,
    severity: severityFromScore(performanceScore),
    categoryScores: {
      performance: performanceScore,
      accessibility: accessibilityScore,
      bestPractices: bestPracticesScore,
      seo: seoScore,
      security: publicAudit.categories.find((category) => category.id === 'security')?.score ?? 100,
      quality: publicAudit.categories.find((category) => category.id === 'quality')?.score ?? 100
    },
    metrics: {
      fcp: formatMetric(audits['first-contentful-paint']?.numericValue, 'seconds'),
      lcp: formatMetric(audits['largest-contentful-paint']?.numericValue, 'seconds'),
      cls: formatMetric(audits['cumulative-layout-shift']?.numericValue),
      tbt: formatMetric(audits['total-blocking-time']?.numericValue, 'milliseconds'),
      imageWeight: formatBytes(imageBytes),
      pageWeight: formatBytes(audits['total-byte-weight']?.numericValue)
    },
    categories: publicAudit.categories,
    issues: publicAudit.issues,
    passedChecks: publicAudit.passedChecks,
    signals: publicAudit.signals,
    highlights: [
      publicAudit.verdict === 'block'
        ? 'Hay fallos bloqueantes: no entregues esta web sin revisar los puntos criticos.'
        : publicAudit.verdict === 'review'
          ? 'La web se puede trabajar, pero hay mejoras importantes antes de entregarla.'
          : 'La web esta en buen estado para entrega segun los checks automaticos.',
      ...highlightsFromScore(performanceScore)
    ],
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
  if (!isAllowedPublicAuditUrl(normalizedUrl)) {
    return { ok: false as const, error: 'Solo se pueden analizar URLs publicas http/https.', statusCode: 400 };
  }

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

  if (env.VERCEL) {
    await processJob(id);
    const completedJob = jobs.get(id);
    if (completedJob?.status === 'completed' && completedJob.result) {
      return { ok: true as const, status: 'completed' as const, result: completedJob.result };
    }
    return {
      ok: false as const,
      error: completedJob?.error || 'No se pudo completar el analisis en este momento.',
      statusCode: 502
    };
  }

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
