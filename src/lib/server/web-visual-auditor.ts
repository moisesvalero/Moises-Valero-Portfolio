import { existsSync } from 'node:fs';
import type { AuditIssue } from './web-delivery-auditor';

export type VisualAuditSignals = {
	visualAuditAvailable: boolean;
	visualAuditReason: string;
	consoleErrors: number;
	consoleWarnings: number;
	renderedResourceErrors: number;
	failedRequests: number;
	smallTapTargets: number;
	lowContrastTexts: number;
	horizontalOverflowViewports: string[];
	brokenRenderedImages: number;
	cookiesBeforeConsent: number;
	viewportChecks: string[];
	blankRenderDetected: boolean;
};

type VisualViewportResult = {
	label: string;
	consoleErrors: number;
	consoleWarnings: number;
	renderedResourceErrors: number;
	failedRequests: number;
	smallTapTargets: number;
	lowContrastTexts: number;
	hasHorizontalOverflow: boolean;
	brokenRenderedImages: number;
	cookiesBeforeConsent: number;
	blankRenderDetected: boolean;
};

type VisualAuditResult = {
	available: boolean;
	issues: AuditIssue[];
	passed: string[];
	signals: VisualAuditSignals;
};

const DEFAULT_SIGNALS: VisualAuditSignals = {
	visualAuditAvailable: false,
	visualAuditReason: 'Auditoria visual no ejecutada.',
	consoleErrors: 0,
	consoleWarnings: 0,
	renderedResourceErrors: 0,
	failedRequests: 0,
	smallTapTargets: 0,
	lowContrastTexts: 0,
	horizontalOverflowViewports: [],
	brokenRenderedImages: 0,
	cookiesBeforeConsent: 0,
	viewportChecks: [],
	blankRenderDetected: false
};

const VIEWPORTS = [
	{ label: 'movil', width: 390, height: 844, isMobile: true },
	{ label: 'desktop', width: 1440, height: 900, isMobile: false }
];

export function isPrivateOrLocalResource(rawUrl: string): boolean {
	try {
		const parsed = new URL(rawUrl);
		if (!['http:', 'https:'].includes(parsed.protocol)) return true;
		const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
		if (
			hostname === 'localhost' ||
			hostname.endsWith('.localhost') ||
			hostname.endsWith('.local') ||
			hostname.endsWith('.internal') ||
			hostname.endsWith('.lan')
		) {
			return true;
		}
		const parts = hostname.split('.').map((part) => Number(part));
		if (parts.length === 4 && parts.every((part) => Number.isInteger(part))) {
			const [a, b] = parts;
			return (
				a === 0 ||
				a === 10 ||
				a === 127 ||
				(a === 169 && b === 254) ||
				(a === 172 && b >= 16 && b <= 31) ||
				(a === 192 && b === 168) ||
				a >= 224
			);
		}
		return hostname === '::1' || hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe80:');
	} catch {
		return true;
	}
}

function visualIssue(id: string, severity: AuditIssue['severity'], title: string, why: string, fix: string, evidence?: string): AuditIssue {
	return {
		id,
		category: id.startsWith('accessibility') ? 'accessibility' : id.startsWith('privacy') ? 'privacy' : 'delivery',
		severity,
		title,
		why,
		fix,
		evidence
	};
}

export function contrastRatio(foreground: [number, number, number], background: [number, number, number]): number {
	const luminance = ([r, g, b]: [number, number, number]) => {
		const values = [r, g, b].map((channel) => {
			const value = channel / 255;
			return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
		});
		return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
	};
	const lighter = Math.max(luminance(foreground), luminance(background));
	const darker = Math.min(luminance(foreground), luminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

export function isSmallTapTarget(width: number, height: number): boolean {
	return width > 0 && height > 0 && (width < 44 || height < 44);
}

function defaultUnavailable(reason: string): VisualAuditResult {
	return {
		available: false,
		issues: [
			visualIssue(
				'delivery.visual-audit-unavailable',
				'info',
				'Auditoria visual no disponible',
				'Los checks con navegador real no se han podido ejecutar en este entorno.',
				'El informe HTML/cabeceras sigue siendo valido; activa Chromium serverless para sumar revision visual.',
				reason
			)
		],
		passed: [],
		signals: { ...DEFAULT_SIGNALS, visualAuditReason: reason }
	};
}

type SparticuzChromium = typeof import('@sparticuz/chromium').default;

async function importRuntimeModule<T>(specifier: string): Promise<T> {
	const runtimeImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<T>;
	return runtimeImport(specifier);
}

async function resolveExecutablePath(chromiumPackage: SparticuzChromium): Promise<string | undefined> {
	const envPath = process.env.CHROME_EXECUTABLE_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
	if (envPath && existsSync(envPath)) return envPath;

	const localCandidates = [
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium',
		'/usr/bin/chromium-browser'
	];
	const local = localCandidates.find((candidate) => existsSync(candidate));
	if (local) return local;

	return chromiumPackage.executablePath();
}

function aggregateSignals(results: VisualViewportResult[], reason = 'Auditoria visual ejecutada con navegador real.'): VisualAuditSignals {
	return {
		visualAuditAvailable: true,
		visualAuditReason: reason,
		consoleErrors: Math.max(...results.map((result) => result.consoleErrors), 0),
		consoleWarnings: Math.max(...results.map((result) => result.consoleWarnings), 0),
		renderedResourceErrors: Math.max(...results.map((result) => result.renderedResourceErrors), 0),
		failedRequests: Math.max(...results.map((result) => result.failedRequests), 0),
		smallTapTargets: Math.max(...results.map((result) => result.smallTapTargets), 0),
		lowContrastTexts: Math.max(...results.map((result) => result.lowContrastTexts), 0),
		horizontalOverflowViewports: results.filter((result) => result.hasHorizontalOverflow).map((result) => result.label),
		brokenRenderedImages: Math.max(...results.map((result) => result.brokenRenderedImages), 0),
		cookiesBeforeConsent: Math.max(...results.map((result) => result.cookiesBeforeConsent), 0),
		viewportChecks: results.map((result) => result.label),
		blankRenderDetected: results.some((result) => result.blankRenderDetected)
	};
}

function issuesFromSignals(signals: VisualAuditSignals): AuditIssue[] {
	const issues: AuditIssue[] = [];

	if (signals.consoleErrors > 0) {
		issues.push(
			visualIssue(
				'delivery.console-errors',
				'warning',
				'Errores JavaScript en navegador',
				'La pagina renderizada emite errores de consola que pueden romper interacciones reales.',
				'Revisa la consola, corrige scripts fallidos y controla errores de cliente.',
				`${signals.consoleErrors} errores`
			)
		);
	}
	if (signals.renderedResourceErrors > 0 || signals.failedRequests > 0) {
		issues.push(
			visualIssue(
				'delivery.rendered-resource-errors',
				'warning',
				'Recursos fallan durante el render',
				'Despues de ejecutar la pagina en navegador hay recursos que devuelven error o no cargan.',
				'Corrige assets, endpoints, scripts de terceros o rutas generadas por JS.',
				`${signals.renderedResourceErrors} respuestas 4xx/5xx · ${signals.failedRequests} requests fallidas`
			)
		);
	}
	if (signals.blankRenderDetected) {
		issues.push(
			visualIssue(
				'delivery.blank-render',
				'critical',
				'Render visual casi vacio',
				'El navegador recibe una pagina con muy poco contenido visible tras cargar.',
				'Asegura render SSR/HTML inicial suficiente y revisa errores de hidratacion.',
				'Contenido visible insuficiente'
			)
		);
	}
	if (signals.horizontalOverflowViewports.length) {
		issues.push(
			visualIssue(
				'delivery.horizontal-overflow',
				'warning',
				'Overflow horizontal en responsive',
				'La pagina es mas ancha que el viewport y puede generar scroll lateral en dispositivos reales.',
				'Revisa anchos fijos, grids, imagenes y elementos absolutos.',
				signals.horizontalOverflowViewports.join(', ')
			)
		);
	}
	if (signals.brokenRenderedImages > 0) {
		issues.push(
			visualIssue(
				'delivery.rendered-broken-images',
				'warning',
				'Imagenes rotas en navegador',
				'Hay imagenes que el navegador no puede pintar aunque el HTML exista.',
				'Corrige URLs, CDN, formatos, permisos o transformaciones de imagen.',
				`${signals.brokenRenderedImages} imagenes`
			)
		);
	}
	if (signals.smallTapTargets > 0) {
		issues.push(
			visualIssue(
				'accessibility.tap-targets',
				'warning',
				'Objetivos tactiles pequenos',
				'Botones o enlaces pequenos son dificiles de pulsar en movil.',
				'Aumenta area tactil a unos 44x44 px o separa controles cercanos.',
				`${signals.smallTapTargets} elementos`
			)
		);
	}
	if (signals.lowContrastTexts > 0) {
		issues.push(
			visualIssue(
				'accessibility.visual-contrast',
				'warning',
				'Contraste visual bajo',
				'Textos visibles pueden no cumplir contraste suficiente sobre su fondo.',
				'Ajusta color, peso, tamano o fondo de los textos afectados.',
				`${signals.lowContrastTexts} textos`
			)
		);
	}
	if (signals.cookiesBeforeConsent > 0) {
		issues.push(
			visualIssue(
				'privacy.cookies-before-consent',
				'warning',
				'Cookies antes de consentimiento',
				'El navegador recibe cookies durante la primera carga antes de cualquier accion del usuario.',
				'Revisa que cookies no necesarias y tracking esperen consentimiento cuando aplique.',
				`${signals.cookiesBeforeConsent} cookies`
			)
		);
	}

	return issues;
}

export async function auditVisualWebsite(url: string, options: { timeoutMs?: number } = {}): Promise<VisualAuditResult> {
	if (process.env.DISABLE_BROWSER_AUDIT === '1') {
		return defaultUnavailable('DISABLE_BROWSER_AUDIT=1');
	}

	const timeoutMs = options.timeoutMs ?? 18_000;
	let playwright: typeof import('playwright-core');
	let chromiumPackage: SparticuzChromium;
	try {
		const [playwrightModule, chromiumModule] = await Promise.all([
			importRuntimeModule<typeof import('playwright-core')>('playwright-core'),
			importRuntimeModule<typeof import('@sparticuz/chromium')>('@sparticuz/chromium')
		]);
		playwright = playwrightModule;
		chromiumPackage = chromiumModule.default;
	} catch (error) {
		return defaultUnavailable(error instanceof Error ? error.message : 'No se pudieron cargar dependencias de navegador.');
	}

	let browser: Awaited<ReturnType<typeof playwright.chromium.launch>> | undefined;
	try {
		const executablePath = await resolveExecutablePath(chromiumPackage);
		if (!executablePath) return defaultUnavailable('No se encontro ejecutable Chromium.');

		browser = await playwright.chromium.launch({
			args: chromiumPackage.args,
			executablePath,
			headless: true
		});

		const results: VisualViewportResult[] = [];
		for (const viewport of VIEWPORTS) {
			const context = await browser.newContext({
				ignoreHTTPSErrors: true,
				isMobile: viewport.isMobile,
				userAgent:
					viewport.isMobile
						? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
						: undefined,
				viewport: { width: viewport.width, height: viewport.height }
			});
			const page = await context.newPage();
			const consoleErrors: string[] = [];
			const consoleWarnings: string[] = [];
			const failedRequests: string[] = [];
			const renderedResourceErrors: string[] = [];

			page.on('console', (message) => {
				if (message.type() === 'error') consoleErrors.push(message.text());
				if (message.type() === 'warning') consoleWarnings.push(message.text());
			});
			page.on('requestfailed', (request) => failedRequests.push(request.url()));
			page.on('response', (response) => {
				if (response.status() >= 400) renderedResourceErrors.push(`${response.status()} ${response.url()}`);
			});
			await page.route('**/*', async (route) => {
				const requestUrl = route.request().url();
				if (isPrivateOrLocalResource(requestUrl)) {
					failedRequests.push(requestUrl);
					await route.abort('blockedbyclient');
					return;
				}
				await route.continue();
			});

			await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
			await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
			await page.waitForTimeout(750);
			const cookies = await context.cookies(url).catch(() => []);
			const metrics = await page.evaluate(() => {
				const parseRgb = (value: string): [number, number, number] | null => {
					const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
					return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
				};
				const luminance = ([r, g, b]: [number, number, number]) => {
					const values = [r, g, b].map((channel) => {
						const normalized = channel / 255;
						return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
					});
					return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
				};
				const ratio = (fg: [number, number, number], bg: [number, number, number]) => {
					const lighter = Math.max(luminance(fg), luminance(bg));
					const darker = Math.min(luminance(fg), luminance(bg));
					return (lighter + 0.05) / (darker + 0.05);
				};
				const isVisible = (element: Element) => {
					const rect = element.getBoundingClientRect();
					const style = window.getComputedStyle(element);
					return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) !== 0;
				};
				const tapTargets = [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [tabindex]')]
					.filter(isVisible)
					.filter((element) => {
						const rect = element.getBoundingClientRect();
						return rect.width < 44 || rect.height < 44;
					}).length;
				const contrastCandidates = [...document.querySelectorAll('p, a, button, label, li, h1, h2, h3, h4, h5, h6, span')]
					.filter(isVisible)
					.filter((element) => (element.textContent ?? '').trim().length >= 3)
					.slice(0, 220);
				const lowContrast = contrastCandidates.filter((element) => {
					const style = window.getComputedStyle(element);
					const fg = parseRgb(style.color);
					let current: Element | null = element;
					let bg: [number, number, number] | null = null;
					while (current && !bg) {
						const value = window.getComputedStyle(current).backgroundColor;
						if (!/rgba\(0,\s*0,\s*0,\s*0\)|transparent/i.test(value)) bg = parseRgb(value);
						current = current.parentElement;
					}
					bg ??= parseRgb(window.getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255];
					if (!fg || !bg) return false;
					const fontSize = Number.parseFloat(style.fontSize);
					const threshold = fontSize >= 24 || Number.parseInt(style.fontWeight, 10) >= 700 ? 3 : 4.5;
					return ratio(fg, bg) < threshold;
				}).length;
				const brokenImages = [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length;
				const visibleTextLength = (document.body.innerText || '').replace(/\s+/g, ' ').trim().length;
				const bodyChildren = document.body.children.length;

				return {
					tapTargets,
					lowContrast,
					brokenImages,
					hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 4,
					blankRenderDetected: visibleTextLength < 80 && bodyChildren < 3
				};
			});

			results.push({
				label: viewport.label,
				consoleErrors: consoleErrors.length,
				consoleWarnings: consoleWarnings.length,
				renderedResourceErrors: renderedResourceErrors.length,
				failedRequests: failedRequests.length,
				smallTapTargets: metrics.tapTargets,
				lowContrastTexts: metrics.lowContrast,
				hasHorizontalOverflow: metrics.hasHorizontalOverflow,
				brokenRenderedImages: metrics.brokenImages,
				cookiesBeforeConsent: cookies.length,
				blankRenderDetected: metrics.blankRenderDetected
			});
			await context.close();
		}

		const signals = aggregateSignals(results);
		const issues = issuesFromSignals(signals);
		const passed = [
			'Auditoria visual con navegador ejecutada.',
			...(signals.consoleErrors === 0 ? ['Sin errores JavaScript de consola.'] : []),
			...(signals.renderedResourceErrors === 0 && signals.failedRequests === 0 ? ['Sin recursos fallidos tras render.'] : []),
			...(signals.horizontalOverflowViewports.length === 0 ? ['Sin overflow horizontal en viewports auditados.'] : [])
		];
		return { available: true, issues, passed, signals };
	} catch (error) {
		return defaultUnavailable(error instanceof Error ? error.message : 'No se pudo ejecutar Chromium.');
	} finally {
		await browser?.close().catch(() => undefined);
	}
}

export function visualAuditUnavailableSignals(reason: string): VisualAuditSignals {
	return { ...DEFAULT_SIGNALS, visualAuditReason: reason };
}
