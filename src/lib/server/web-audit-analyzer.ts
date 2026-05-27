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
	analysisMode: 'complete' | 'partial';
	analysisNote?: string;
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
const MAX_JOBS = 200;
const JOB_KEEP_MS = 10 * 60 * 1000;

const responseCache = new Map<string, { expiresAt: number; staleAt: number; data: AnalyzerResponse }>();
const inFlightRequests = new Map<string, Promise<AnalyzerResponse>>();
const jobs = new Map<string, AnalyzeJobState>();
const latestJobByCacheKey = new Map<string, string>();
let jobQueue: Promise<void> = Promise.resolve();
let persistentCacheLoaded = false;
const persistentCachePath = resolve(process.cwd(), '.cache', 'web-audit-analyzer-cache.json');

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

function severityFromScore(score: number): Severity {
	if (score < 50) return 'slow';
	if (score < 90) return 'needs_improvement';
	return 'fast';
}

function categoryScore(audit: PublicWebAudit, id: AuditCategoryId, fallback = 0): number {
	return audit.categories.find((category) => category.id === id)?.score ?? fallback;
}

function fallbackAudit(url: string, extraIssues: AuditIssue[]): PublicWebAudit {
	const auditUnavailable: AuditIssue = {
		id: 'quality.remote-audit-unavailable',
		category: 'quality',
		severity: 'warning',
		title: 'No se pudieron completar los checks propios',
		why: 'El analizador no pudo leer directamente la URL para revisar cabeceras, SEO y HTML.',
		fix: 'Reintenta el analisis y comprueba que la web sea publica, estable y no bloquee peticiones externas.'
	};
	const issues = [...extraIssues, auditUnavailable];
	const categoryIds: AuditCategoryId[] = [
		'security',
		'cms',
		'seo',
		'ai',
		'accessibility',
		'performance',
		'privacy',
		'quality',
		'trust',
		'delivery'
	];
	const labels: Record<AuditCategoryId, string> = {
		security: 'Seguridad',
		cms: 'CMS / WordPress',
		seo: 'SEO tecnico',
		ai: 'AEO / IA',
		accessibility: 'Accesibilidad',
		performance: 'Rendimiento estructural',
		privacy: 'Privacidad / legal',
		quality: 'Calidad visible',
		trust: 'Confianza comercial',
		delivery: 'Entrega'
	};
	const categories = categoryIds.map((id) => {
		const categoryIssues = issues.filter((item) => item.category === id);
		return {
			id,
			label: labels[id],
			score: scoreCategoryFromIssues(categoryIssues),
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
			hasLlmsTxt: false,
			hasSecurityTxt: false,
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
	const publicAudit = await auditPublicWebsite(url, { timeoutMs: 18000 }).catch(() =>
		fallbackAudit(url, [
			{
				id: 'quality.remote-audit-unavailable',
				category: 'quality',
				severity: 'warning',
				title: 'No se pudo leer la URL',
				why: 'El auditor propio no ha podido descargar la pagina para revisar HTML, cabeceras y senales visibles.',
				fix: 'Comprueba que la web sea publica, estable y no bloquee peticiones externas.'
			}
		])
	);
	const performanceScore = categoryScore(publicAudit, 'performance', publicAudit.overallScore);

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
			accessibility: categoryScore(publicAudit, 'accessibility', 0),
			bestPractices: categoryScore(publicAudit, 'quality', 0),
			seo: categoryScore(publicAudit, 'seo', 0),
			security: categoryScore(publicAudit, 'security', 0),
			quality: categoryScore(publicAudit, 'quality', 0)
		},
		metrics: {
			fcp: 'N/D',
			lcp: 'N/D',
			cls: 'N/D',
			tbt: 'N/D',
			imageWeight: 'N/D',
			pageWeight: 'N/D'
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
			'El informe revisa seguridad, CMS, SEO, AEO, accesibilidad, privacidad, confianza y calidad de entrega.',
			...publicAudit.issues.slice(0, 2).map((issue) => issue.title)
		],
		cached: false,
		analysisMode: 'complete'
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
	} catch {
		const stale = getStaleCachedResponse(job.cacheKey, Date.now());
		if (stale) {
			job.status = 'completed';
			job.result = stale;
			job.updatedAt = Date.now();
			return;
		}

		job.error = 'No se pudo completar el analisis en este momento.';
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
