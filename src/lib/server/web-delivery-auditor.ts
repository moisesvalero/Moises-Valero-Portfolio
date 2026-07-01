import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { parse, HTMLElement } from 'node-html-parser';
import { isPrivateIp, isAllowedPublicAuditUrl } from './ip-validator.ts';
import {
	auditVisualWebsite,
	visualAuditUnavailableSignals,
	type VisualAuditSignals
} from './web-visual-auditor.ts';

export type AuditSeverity = 'critical' | 'warning' | 'info' | 'pass';
export type AuditCategoryId =
	| 'security'
	| 'cms'
	| 'seo'
	| 'ai'
	| 'accessibility'
	| 'performance'
	| 'privacy'
	| 'quality'
	| 'trust'
	| 'delivery';
export type DeliveryVerdict = 'block' | 'review' | 'ready';

export type AuditIssue = {
	id: string;
	category: AuditCategoryId;
	severity: AuditSeverity;
	title: string;
	why: string;
	fix: string;
	evidence?: string;
	confidence?: 'alta' | 'media' | 'baja';
	technicalContext?: string;
	affectedResources?: string[];
	repairSteps?: string[];
	aiPrompt?: string;
};

export type AuditCategory = {
	id: AuditCategoryId;
	label: string;
	score: number;
	issues: AuditIssue[];
};

export type PublicWebAudit = {
	finalUrl: string;
	overallScore: number;
	verdict: DeliveryVerdict;
	categories: AuditCategory[];
	issues: AuditIssue[];
	passedChecks: string[];
	signals: {
		isHttps: boolean;
		redirectsToHttps: boolean;
		hasRobotsTxt: boolean;
		hasSitemap: boolean;
		hasLlmsTxt: boolean;
		hasSecurityTxt: boolean;
		isWordPress: boolean;
		externalScripts: number;
		internalLinks: number;
		imagesWithoutAlt: number;
		responseTimeMs: number;
		resourceCount: number;
		resourceErrors: number;
		brokenInternalLinks: number;
		estimatedResourceBytes: number;
		detectedTechnologies: string[];
		wordPressPlugins: string[];
		hasCustom404: boolean;
	} & VisualAuditSignals;
};

type FetchSnapshot = {
	url: string;
	status: number;
	headers: Headers;
	html: string;
	responseTimeMs: number;
};

type ResourceCheck = {
	url: string;
	status: number;
	ok: boolean;
	bytes: number;
	contentType: string;
	kind: 'script' | 'style' | 'image' | 'link' | 'sensitive' | 'wordpress' | 'notFound';
};

const CATEGORY_LABELS: Record<AuditCategoryId, string> = {
	security: 'Seguridad',
	cms: 'CMS / WordPress',
	seo: 'SEO tecnico',
	ai: 'AEO / IA',
	accessibility: 'Accesibilidad',
	performance: 'Rendimiento estructural',
	privacy: 'Privacidad / legal',
	quality: 'Calidad visible',
	trust: 'Claridad y confianza',
	delivery: 'Entrega'
};

const SUSPICIOUS_HOST_PATTERNS = [
	/\bcasino\b/i,
	/\bbet\b/i,
	/\bloan\b/i,
	/\bpharma\b/i,
	/\bviagra\b/i,
	/\bcrypto\b/i,
	/\btelegram\b/i
];

const SENSITIVE_PATHS = [
	'/.env',
	'/.git/config',
	'/backup.zip',
	'/backup.sql',
	'/database.sql',
	'/phpinfo.php',
	'/server-status',
	'/admin',
	'/staging',
	'/test'
];

const CDN_HEADER_PATTERNS = [
	/cloudflare/i,
	/vercel/i,
	/akamai/i,
	/fastly/i,
	/cloudfront/i,
	/bunny/i,
	/netlify/i
];

function issue(
	id: string,
	category: AuditCategoryId,
	severity: AuditSeverity,
	title: string,
	why: string,
	fix: string,
	evidence?: string
): AuditIssue {
	return enrichIssue({ id, category, severity, title, why, fix, evidence });
}

function extractUrls(value?: string): string[] {
	if (!value) return [];
	return [...value.matchAll(/https?:\/\/[^\s"'<>),]+/gi)].map((match) => match[0]).slice(0, 5);
}

function inferIssueContext(
	issue: AuditIssue
): Pick<AuditIssue, 'confidence' | 'technicalContext' | 'affectedResources' | 'repairSteps'> {
	const urls = extractUrls(issue.evidence);
	const affectedResources = urls.length ? urls : issue.evidence ? [issue.evidence] : [];

	if (issue.id === 'security.mixed-content') {
		return {
			confidence: issue.evidence ? 'alta' : 'media',
			technicalContext:
				'Tipo: recurso HTTP dentro de una pagina HTTPS. Impacto: el navegador puede bloquearlo o mostrar advertencias de seguridad.',
			affectedResources,
			repairSteps: [
				'Busca la URL http:// exacta en el CMS, HTML, CSS, JavaScript o configuracion del tema.',
				'Sustituyela por https:// si el proveedor sirve el mismo recurso con TLS.',
				'Si no existe version HTTPS, descarga el recurso y sirvelo desde el propio dominio o cambia de proveedor.'
			]
		};
	}

	if (issue.id.startsWith('security.')) {
		return {
			confidence: 'alta',
			technicalContext: `Tipo: configuracion de seguridad HTTP. Impacto: ${issue.why}`,
			affectedResources,
			repairSteps: [
				'Comprueba la cabecera o ajuste indicado en el hosting, CDN o framework.',
				'Aplica el cambio en produccion o en la configuracion global de respuestas HTTP.',
				'Vuelve a analizar la URL y confirma que la cabecera aparece en la respuesta final.'
			]
		};
	}

	if (issue.id.startsWith('cms.') || issue.id.startsWith('wordpress.')) {
		return {
			confidence: issue.evidence ? 'alta' : 'media',
			technicalContext: `Tipo: exposicion de CMS o WordPress. Impacto: ${issue.why}`,
			affectedResources,
			repairSteps: [
				'Abre la ruta indicada en ventana privada y confirma si realmente es publica.',
				'Bloquea o limita el endpoint desde WordPress, servidor, plugin de seguridad o CDN.',
				'Actualiza WordPress/plugins y oculta versiones o listados que no deban ser publicos.'
			]
		};
	}

	if (issue.id.includes('image') || issue.id.includes('alt')) {
		return {
			confidence: 'alta',
			technicalContext: `Tipo: accesibilidad o entrega de imagenes. Impacto: ${issue.why}`,
			affectedResources,
			repairSteps: [
				'Localiza las imagenes afectadas en el HTML renderizado o en el gestor de contenidos.',
				'Anade alt descriptivo si la imagen aporta informacion, o alt vacio si es decorativa.',
				'Si la imagen esta rota, revisa URL, permisos, CDN, formato y transformaciones.'
			]
		};
	}

	if (
		issue.id.includes('link') ||
		issue.id.includes('resource') ||
		issue.id.includes('console') ||
		issue.id.includes('render')
	) {
		return {
			confidence: issue.evidence ? 'alta' : 'media',
			technicalContext: `Tipo: recurso, enlace o ejecucion en navegador. Impacto: ${issue.why}`,
			affectedResources,
			repairSteps: [
				'Reproduce la pagina en navegador y abre la pestana Network/Console.',
				'Busca la evidencia exacta del informe y confirma el archivo, endpoint o elemento afectado.',
				'Corrige la ruta, dependencia, script o enlace y repite el analisis.'
			]
		};
	}

	if (
		issue.id.includes('tap-target') ||
		issue.id.includes('contrast') ||
		issue.id.startsWith('accessibility.')
	) {
		return {
			confidence: 'media',
			technicalContext: `Tipo: accesibilidad automatica. Impacto: ${issue.why}`,
			affectedResources,
			repairSteps: [
				'Revisa el elemento afectado en movil y con inspector del navegador.',
				'Ajusta texto, color, foco, label o area tactil segun el problema indicado.',
				'Valida despues con teclado, lector de pantalla basico o una herramienta WCAG.'
			]
		};
	}

	return {
		confidence: issue.evidence ? 'media' : 'baja',
		technicalContext: `Tipo: ${CATEGORY_LABELS[issue.category]}. Impacto: ${issue.why}`,
		affectedResources,
		repairSteps: [
			'Revisa la evidencia y localiza el origen en el CMS, codigo o configuracion del servidor.',
			'Aplica la correccion recomendada en el informe.',
			'Vuelve a ejecutar el analizador para confirmar que el hallazgo desaparece.'
		]
	};
}

function buildAiPrompt(issue: AuditIssue): string {
	const affected = issue.affectedResources?.length
		? issue.affectedResources.join('\n')
		: 'No hay recurso exacto aislado; usa la evidencia y la URL analizada.';
	const steps = issue.repairSteps?.length
		? issue.repairSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')
		: issue.fix;
	return [
		'Actua como auditor senior web. Quiero corregir este problema sin romper la web.',
		`Problema: ${issue.title}`,
		`Categoria: ${CATEGORY_LABELS[issue.category]}`,
		`Severidad: ${issue.severity}`,
		`Confianza del hallazgo: ${issue.confidence ?? 'media'}`,
		issue.technicalContext ? `Contexto tecnico: ${issue.technicalContext}` : '',
		issue.evidence ? `Evidencia: ${issue.evidence}` : '',
		`Recursos o elementos afectados:\n${affected}`,
		`Pasos sugeridos:\n${steps}`,
		'Dame un plan de correccion paso a paso, dime donde buscarlo segun si la web es WordPress, SvelteKit u otro stack, y como comprobar que queda solucionado.'
	]
		.filter(Boolean)
		.join('\n');
}

export function enrichIssue(base: AuditIssue): AuditIssue {
	const inferred = inferIssueContext(base);
	const enriched = { ...base, ...inferred };
	return { ...enriched, aiPrompt: buildAiPrompt(enriched) };
}

function cleanHeader(value: string | null): string {
	return value?.trim() ?? '';
}

async function assertPublicNetworkTarget(url: URL) {
	if (!isAllowedPublicAuditUrl(url.toString())) {
		throw new Error('AUDIT_TARGET_NOT_ALLOWED');
	}
	if (isIP(url.hostname)) return;
	const addresses = await lookup(url.hostname, { all: true, verbatim: true });
	if (!addresses.length || addresses.some((address) => isPrivateIp(address.address))) {
		throw new Error('AUDIT_TARGET_NOT_ALLOWED');
	}
}

async function fetchWithSafeRedirects(
	inputUrl: string,
	init: RequestInit = {},
	maxRedirects = 4
): Promise<Response> {
	let current = new URL(inputUrl);
	for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
		await assertPublicNetworkTarget(current);
		const response = await fetch(current, {
			...init,
			redirect: 'manual',
			headers: {
				'user-agent':
					'MoisesValeroDeliveryAuditor/1.0 (+https://moisesvalero.es/tools/analizador-web)',
				accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				...(init.headers ?? {})
			}
		});
		if (![301, 302, 303, 307, 308].includes(response.status)) return response;
		const location = response.headers.get('location');
		if (!location) return response;
		current = new URL(location, current);
	}
	throw new Error('AUDIT_REDIRECT_LIMIT');
}

async function fetchBodyWithLimit(response: Response, limitBytes: number): Promise<ArrayBuffer> {
	const contentLength = Number(response.headers.get('content-length'));
	if (Number.isFinite(contentLength) && contentLength > limitBytes) {
		throw new Error('BODY_SIZE_LIMIT_EXCEEDED');
	}
	if (!response.body) {
		return new ArrayBuffer(0);
	}

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) {
			totalBytes += value.length;
			if (totalBytes > limitBytes) {
				reader.cancel();
				throw new Error('BODY_SIZE_LIMIT_EXCEEDED');
			}
			chunks.push(value);
		}
	}

	const result = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	return result.buffer;
}

async function fetchTextIfAvailable(
	url: string,
	timeoutMs: number
): Promise<{ ok: boolean; status: number; text: string }> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetchWithSafeRedirects(
			url,
			{ method: 'GET', signal: controller.signal },
			2
		);
		const buffer = await fetchBodyWithLimit(response, 2 * 1024 * 1024);
		const text = new TextDecoder('utf-8').decode(buffer);
		return { ok: response.ok, status: response.status, text };
	} catch {
		return { ok: false, status: 0, text: '' };
	} finally {
		clearTimeout(timer);
	}
}

async function fetchResourceIfAvailable(
	url: string,
	timeoutMs: number,
	kind: ResourceCheck['kind']
): Promise<ResourceCheck> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetchWithSafeRedirects(
			url,
			{ method: 'GET', signal: controller.signal },
			2
		);
		const contentType = response.headers.get('content-type') ?? '';
		const buffer = await fetchBodyWithLimit(response, 2 * 1024 * 1024).catch(
			() => new ArrayBuffer(0)
		);
		const bytes = buffer.byteLength;
		return {
			url: response.url || url,
			status: response.status,
			ok: response.ok,
			bytes,
			contentType,
			kind
		};
	} catch {
		return { url, status: 0, ok: false, bytes: 0, contentType: '', kind };
	} finally {
		clearTimeout(timer);
	}
}

async function fetchMainDocument(url: string, timeoutMs: number): Promise<FetchSnapshot> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	const startedAt = performance.now();
	try {
		const response = await fetchWithSafeRedirects(url, {
			method: 'GET',
			signal: controller.signal
		});
		const contentType = response.headers.get('content-type') ?? '';
		let html = '';
		if (contentType.includes('text/html')) {
			const buffer = await fetchBodyWithLimit(response, 4 * 1024 * 1024);
			html = new TextDecoder('utf-8').decode(buffer);
		}
		return {
			url: response.url || url,
			status: response.status,
			headers: response.headers,
			html,
			responseTimeMs: Math.round(performance.now() - startedAt)
		};
	} finally {
		clearTimeout(timer);
	}
}

function hasSecureDirective(csp: string, directive: string): boolean {
	return csp
		.split(';')
		.map((item) => item.trim().toLowerCase())
		.some((item) => item === directive || item.startsWith(`${directive} `));
}

export function auditClientLibraries(html: string): AuditIssue[] {
	const issues: AuditIssue[] = [];
	const scripts = getTags(html, 'script');

	let hasPolyfillIo = false;
	let jqueryVersion: string | null = null;
	let bootstrapVersion: string | null = null;

	for (const script of scripts) {
		const src = getAttr(script, 'src');
		if (!src) continue;

		if (/polyfill\.io/i.test(src)) {
			hasPolyfillIo = true;
		}

		const jqueryMatch =
			src.match(/jquery[.-](?:min[.-])?(\d+\.\d+\.\d+)/i) || src.match(/jquery\/(\d+\.\d+\.\d+)/i);
		if (jqueryMatch) {
			jqueryVersion = jqueryMatch[1];
		}

		const bootstrapMatch =
			src.match(/bootstrap[.-](?:min[.-])?(\d+\.\d+\.\d+)/i) ||
			src.match(/bootstrap\/(\d+\.\d+\.\d+)/i);
		if (bootstrapMatch) {
			bootstrapVersion = bootstrapMatch[1];
		}
	}

	if (hasPolyfillIo) {
		issues.push(
			issue(
				'security.polyfill-supply-chain',
				'security',
				'critical',
				'Uso crítico de CDN vulnerable (polyfill.io)',
				'El dominio original de polyfill.io fue vendido y se reportó que inyecta código malicioso en las webs cliente (ataque a la cadena de suministro).',
				'Elimina la carga de polyfill.io inmediatamente. Si necesitas polyfills, usa el CDN seguro de Cloudflare (cdnjs.cloudflare.com/polyfill) o compila localmente.'
			)
		);
	}

	if (jqueryVersion) {
		const parts = jqueryVersion.split('.').map(Number);
		const isOutdated = parts[0] < 3 || (parts[0] === 3 && parts[1] < 5);
		if (isOutdated) {
			issues.push(
				issue(
					'security.outdated-jquery',
					'security',
					'warning',
					'jQuery desactualizado y vulnerable',
					`Se detectó jQuery versión ${jqueryVersion}. Las versiones anteriores a la 3.5.0 contienen múltiples vulnerabilidades de seguridad conocidas (como XSS en regex de manipulación de HTML/CVE-2020-11022).`,
					'Actualiza a jQuery 3.5.0 o posterior, o preferiblemente migra a JS nativo moderno (vanilla JS).',
					`Versión detectada: ${jqueryVersion}`
				)
			);
		}
	}

	if (bootstrapVersion) {
		const parts = bootstrapVersion.split('.').map(Number);
		const isOutdated = parts[0] < 4 || (parts[0] === 4 && parts[1] < 5);
		if (isOutdated) {
			issues.push(
				issue(
					'security.outdated-bootstrap',
					'security',
					'warning',
					'Bootstrap JS desactualizado y vulnerable',
					`Se detectó Bootstrap JS versión ${bootstrapVersion}. Las versiones anteriores a la 4.5.0 son propensas a ataques de Cross-Site Scripting (XSS) en diversos componentes como tooltips y popovers.`,
					'Actualiza Bootstrap JS a la versión 4.5.0 o superior, o idealmente versión 5 que elimina la dependencia de jQuery.',
					`Versión detectada: ${bootstrapVersion}`
				)
			);
		}
	}

	return issues;
}

function analyzeHeaders(
	snapshot: FetchSnapshot,
	requestedUrl: string
): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const finalUrl = new URL(snapshot.url);
	const requested = new URL(requestedUrl);
	const csp = cleanHeader(snapshot.headers.get('content-security-policy'));
	const hsts = cleanHeader(snapshot.headers.get('strict-transport-security'));
	const frameOptions = cleanHeader(snapshot.headers.get('x-frame-options'));
	const referrerPolicy = cleanHeader(snapshot.headers.get('referrer-policy'));
	const permissionsPolicy = cleanHeader(snapshot.headers.get('permissions-policy'));
	const contentTypeOptions = cleanHeader(snapshot.headers.get('x-content-type-options'));
	const coop = cleanHeader(snapshot.headers.get('cross-origin-opener-policy'));
	const corp = cleanHeader(snapshot.headers.get('cross-origin-resource-policy'));
	const coep = cleanHeader(snapshot.headers.get('cross-origin-embedder-policy'));
	const exposedTechHeaders = [
		['Server', snapshot.headers.get('server')],
		['X-Powered-By', snapshot.headers.get('x-powered-by')],
		['X-AspNet-Version', snapshot.headers.get('x-aspnet-version')],
		['Via', snapshot.headers.get('via')]
	].filter(([, value]) => cleanHeader(value));

	if (finalUrl.protocol !== 'https:') {
		issues.push(
			issue(
				'security.https',
				'security',
				'critical',
				'La URL final no usa HTTPS',
				'Los formularios, cookies y datos del usuario quedan expuestos o generan avisos de navegador.',
				'Activa SSL y fuerza redirección permanente de HTTP a HTTPS.',
				snapshot.url
			)
		);
	} else {
		passed.push('La URL final usa HTTPS.');
	}

	if (requested.protocol === 'http:' && finalUrl.protocol !== 'https:') {
		issues.push(
			issue(
				'security.https-redirect',
				'security',
				'critical',
				'HTTP no redirige a HTTPS',
				'Un visitante puede entrar por una versión no segura.',
				'Configura una redirección 301 desde HTTP a HTTPS en hosting, CDN o servidor.'
			)
		);
	}

	if (!hsts) {
		issues.push(
			issue(
				'security.hsts',
				'security',
				'warning',
				'Falta Strict-Transport-Security',
				'HSTS ayuda a que el navegador recuerde que el sitio debe cargar siempre por HTTPS.',
				'Añade Strict-Transport-Security con max-age alto cuando HTTPS esté bien configurado.'
			)
		);
	} else {
		passed.push('HSTS está presente.');
	}

	if (!csp) {
		issues.push(
			issue(
				'security.csp',
				'security',
				'warning',
				'Falta Content-Security-Policy',
				'Una CSP reduce el impacto de inyecciones XSS y carga de scripts no deseados.',
				'Define una CSP ajustada a los dominios reales del proyecto.'
			)
		);
	} else if (!hasSecureDirective(csp, 'default-src') && !hasSecureDirective(csp, 'script-src')) {
		issues.push(
			issue(
				'security.csp-weak',
				'security',
				'warning',
				'CSP demasiado debil',
				'Una CSP sin default-src ni script-src protege poco frente a scripts inesperados.',
				'Incluye al menos default-src y script-src con origenes concretos.'
			)
		);
	} else {
		passed.push('CSP está presente.');
	}

	if (!frameOptions && !hasSecureDirective(csp, 'frame-ancestors')) {
		issues.push(
			issue(
				'security.clickjacking',
				'security',
				'warning',
				'Falta proteccion contra clickjacking',
				'Sin X-Frame-Options o frame-ancestors, otras webs podrían embeber la página.',
				'Usa frame-ancestors en CSP o X-Frame-Options: SAMEORIGIN.'
			)
		);
	}

	if (contentTypeOptions.toLowerCase() !== 'nosniff') {
		issues.push(
			issue(
				'security.nosniff',
				'security',
				'warning',
				'Falta X-Content-Type-Options: nosniff',
				'Evita que el navegador interprete archivos con un tipo distinto al declarado.',
				'Añade X-Content-Type-Options: nosniff.'
			)
		);
	}

	if (!referrerPolicy) {
		issues.push(
			issue(
				'security.referrer-policy',
				'security',
				'info',
				'Falta Referrer-Policy',
				'Reduce fugas de URLs internas o parametros hacia sitios externos.',
				'Usa strict-origin-when-cross-origin como base segura.'
			)
		);
	}

	if (!permissionsPolicy) {
		issues.push(
			issue(
				'security.permissions-policy',
				'security',
				'info',
				'Falta Permissions-Policy',
				'Permite limitar APIs del navegador que la web no necesita.',
				'Bloquea camara, microfono, geolocalizacion y otros permisos no usados.'
			)
		);
	}

	if (!coop) {
		issues.push(
			issue(
				'security.coop',
				'security',
				'info',
				'Falta Cross-Origin-Opener-Policy',
				'COOP ayuda a aislar la ventana frente a contextos cross-origin.',
				'Usa Cross-Origin-Opener-Policy: same-origin si no rompe integraciones.'
			)
		);
	}

	if (!corp) {
		issues.push(
			issue(
				'security.corp',
				'security',
				'info',
				'Falta Cross-Origin-Resource-Policy',
				'CORP reduce exposicion de recursos ante lecturas cross-origin no deseadas.',
				'Define same-origin o cross-origin segun los recursos que sirvas.'
			)
		);
	}

	if (!coep) {
		issues.push(
			issue(
				'security.coep',
				'security',
				'info',
				'Falta Cross-Origin-Embedder-Policy',
				'COEP completa el aislamiento cuando la web necesita APIs avanzadas o control estricto de embeds.',
				'Valora require-corp solo si tus recursos externos lo permiten.'
			)
		);
	}

	if (exposedTechHeaders.length) {
		issues.push(
			issue(
				'security.exposed-tech-headers',
				'security',
				'info',
				'Cabeceras revelan tecnologia',
				'Mostrar servidor, framework o version facilita fingerprinting tecnico.',
				'Oculta o reduce cabeceras como Server, X-Powered-By, X-AspNet-Version o Via si el hosting lo permite.',
				exposedTechHeaders.map(([name, value]) => `${name}: ${value}`).join(' · ')
			)
		);
	}

	for (const cookie of snapshot.headers.getSetCookie?.() ?? []) {
		const lower = cookie.toLowerCase();
		if (!lower.includes('secure') || !lower.includes('httponly') || !lower.includes('samesite')) {
			issues.push(
				issue(
					'security.cookie-flags',
					'security',
					'warning',
					'Cookie con flags incompletos',
					'Las cookies de sesion o preferencias deberian reducir robo, filtrado y uso cross-site.',
					'Configura Secure, HttpOnly cuando aplique y SameSite=Lax o Strict.',
					cookie.split(';')[0]
				)
			);
		}
	}

	const clientLibIssues = auditClientLibraries(snapshot.html);
	issues.push(...clientLibIssues);
	if (
		!clientLibIssues.some(
			(item) =>
				item.id.startsWith('security.outdated-') || item.id === 'security.polyfill-supply-chain'
		)
	) {
		passed.push(
			'No se detectan librerías cliente (jQuery/Bootstrap) vulnerables ni CDNs comprometidos (polyfill.io).'
		);
	}

	return { issues, passed };
}

function decodeHtmlText(value: string): string {
	return value
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/\s+/g, ' ')
		.trim();
}

function getTags(html: string, tagName: string): string[] {
	try {
		const root = parse(html);
		return root.querySelectorAll(tagName).map((el) => el.outerHTML);
	} catch {
		return [];
	}
}

function getAttr(tag: string, name: string): string {
	try {
		const root = parse(tag);
		const element = root.firstChild;
		if (element instanceof HTMLElement) {
			return (element.getAttribute(name) ?? '').trim();
		}
		return '';
	} catch {
		return '';
	}
}

function tagHasAttr(tag: string, name: string): boolean {
	try {
		const root = parse(tag);
		const element = root.firstChild;
		if (element instanceof HTMLElement) {
			return element.hasAttribute(name);
		}
		return false;
	} catch {
		return false;
	}
}

function tagText(html: string, tagName: string): string {
	try {
		const root = parse(html);
		const element = root.querySelector(tagName);
		return element ? decodeHtmlText(element.textContent || '') : '';
	} catch {
		return '';
	}
}

function allText(html: string): string {
	try {
		const root = parse(html);
		root.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
		return decodeHtmlText(root.textContent || '');
	} catch {
		return '';
	}
}

function metaContent(html: string, key: 'name' | 'property', value: string): string {
	try {
		const root = parse(html);
		const meta = root.querySelector(`meta[${key}="${value}" i]`);
		return meta ? (meta.getAttribute('content') ?? '') : '';
	} catch {
		return '';
	}
}

function canonicalHref(html: string): string {
	try {
		const root = parse(html);
		const link = root.querySelector('link[rel="canonical" i]');
		return link ? (link.getAttribute('href') ?? '') : '';
	} catch {
		return '';
	}
}

function scriptBody(scriptTag: string): string {
	try {
		const root = parse(scriptTag);
		const element = root.querySelector('script');
		return element ? (element.textContent || '').trim() : '';
	} catch {
		return '';
	}
}

function isLikelyExternalUrl(value: string, base: URL): boolean {
	if (
		!value ||
		value.startsWith('data:') ||
		value.startsWith('blob:') ||
		value.startsWith('mailto:') ||
		value.startsWith('tel:')
	) {
		return false;
	}
	try {
		const parsed = new URL(value, base);
		return parsed.origin !== base.origin;
	} catch {
		return false;
	}
}

function uniqueHost(value: string, base: URL): string {
	try {
		return new URL(value, base).hostname.replace(/^www\./i, '');
	} catch {
		return '';
	}
}

function uniqueValues(values: string[]): string[] {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function assetUrlFromTag(tag: string): string {
	return getAttr(tag, 'src') || getAttr(tag, 'href');
}

function sameOriginHttpUrl(value: string, base: URL): string | null {
	if (
		!value ||
		value.startsWith('#') ||
		value.startsWith('mailto:') ||
		value.startsWith('tel:') ||
		value.startsWith('javascript:')
	)
		return null;
	try {
		const parsed = new URL(value, base);
		if (!['http:', 'https:'].includes(parsed.protocol)) return null;
		if (parsed.origin !== base.origin) return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

function detectTechnologies(snapshot: FetchSnapshot): string[] {
	const html = snapshot.html;
	const headers = snapshot.headers;
	const generator = metaContent(html, 'name', 'generator');
	const poweredBy = cleanHeader(headers.get('x-powered-by'));
	const server = cleanHeader(headers.get('server'));
	const tags = [...getTags(html, 'script'), ...getTags(html, 'link')];
	const urls = tags.map(assetUrlFromTag).join(' ');
	const technologies = [
		/wordpress/i.test(generator) ||
		/\/wp-content\/|\/wp-includes\//i.test(urls) ||
		detectWordPress(html)
			? 'WordPress'
			: '',
		/\/plugins\/woocommerce\/|class="[^"]*\bwoocommerce\b/i.test(urls + html) ? 'WooCommerce' : '',
		/\/plugins\/elementor\/|class="[^"]*\belementor\b|id="[^"]*\belementor\b|data-elementor/i.test(
			urls + html
		)
			? 'Elementor'
			: '',
		/wp-content\/themes\/kadence/i.test(urls) ? 'Kadence' : '',
		/_app\/immutable|svelte-announcer|id="svelte"|svelte-kit/i.test(urls + html) ? 'SvelteKit' : '',
		/_next\/static|__next|__NEXT_DATA__/i.test(urls + html) ? 'Next.js' : '',
		/cdn\.shopify\.com|shopify-pay/i.test(urls + html) ||
		/shopify/i.test(urls) ||
		/Shopify\.(shop|theme)/.test(html)
			? 'Shopify'
			: '',
		/data-wf-page|data-wf-site|w-layout-grid/i.test(html) || /webflow/i.test(generator)
			? 'Webflow'
			: '',
		/wixstatic\.com|wix\.com/i.test(urls) || /wixEmbeds|wix-config/i.test(html) ? 'Wix' : '',
		/squarespace\.com/i.test(urls) || /Static\.SQUARESPACE_CONTEXT/i.test(html)
			? 'Squarespace'
			: '',
		/joomla/i.test(generator) || /\/media\/system\/js\//i.test(urls) ? 'Joomla' : '',
		/drupal/i.test(generator) ||
		/\/sites\/default\/files\/|\/core\/modules\//i.test(urls) ||
		/data-drupal-/i.test(html)
			? 'Drupal'
			: '',
		poweredBy ? `X-Powered-By: ${poweredBy}` : '',
		server ? `Server: ${server}` : ''
	];
	return uniqueValues(technologies);
}

function detectWordPressPlugins(html: string): string[] {
	return uniqueValues(
		[...html.matchAll(/\/wp-content\/plugins\/([^/?"'#]+)/gi)].map((match) => match[1])
	).slice(0, 12);
}

function detectWordPressVersion(html: string, sideText = ''): string {
	const generator = metaContent(html, 'name', 'generator');
	const generatorVersion = generator.match(/WordPress\s+([\d.]+)/i)?.[1];
	if (generatorVersion) return generatorVersion;
	const readmeVersion =
		sideText.match(/Version\s+([\d.]+)/i)?.[1] ?? sideText.match(/WordPress\s+([\d.]+)/i)?.[1];
	return readmeVersion ?? '';
}

function headerLooksLikeCdn(headers: Headers): boolean {
	const values = [
		headers.get('server') ?? '',
		headers.get('cf-ray') ?? '',
		headers.get('x-vercel-id') ?? '',
		headers.get('x-cache') ?? '',
		headers.get('via') ?? ''
	].join(' ');
	return CDN_HEADER_PATTERNS.some((pattern) => pattern.test(values));
}

function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
	if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	return `${Math.round(bytes / 1024)} KB`;
}

function resourceKindFromTag(tag: string): ResourceCheck['kind'] {
	if (/^<script\b/i.test(tag)) return 'script';
	if (/^<img\b/i.test(tag)) return 'image';
	return 'style';
}

export function detectWordPress(html: string): boolean {
	const generator = metaContent(html, 'name', 'generator');
	if (/wordpress/i.test(generator)) return true;

	const assetTags = [...getTags(html, 'link'), ...getTags(html, 'script'), ...getTags(html, 'img')];
	const hasWordPressAsset = assetTags.some((tag) => {
		const url = getAttr(tag, 'href') || getAttr(tag, 'src');
		return /\/wp-(?:content|includes)\//i.test(url) || /\/wp-json(?:\/|\?|$)/i.test(url);
	});

	if (hasWordPressAsset) return true;

	const anchors = getTags(html, 'a');
	return anchors.some((tag) =>
		/\/wp-(?:admin|login\.php|json)(?:\/|\?|$)/i.test(getAttr(tag, 'href'))
	);
}

function analyzeAccessibilityBasics(snapshot: FetchSnapshot): {
	issues: AuditIssue[];
	passed: string[];
} {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const html = snapshot.html;
	const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
	const lang = getAttr(htmlTag, 'lang');
	const images = getTags(html, 'img');
	const buttons = getTags(html, 'button');
	const links = getTags(html, 'a');
	const inputs = getTags(html, 'input').filter(
		(input) =>
			!['hidden', 'submit', 'button', 'reset'].includes(getAttr(input, 'type').toLowerCase())
	);
	const labels = getTags(html, 'label');
	const ids = [...html.matchAll(/\sid\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
	const idSet = new Set(ids);
	const hTags = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]));
	const imagesWithoutAlt = images.filter((img) => !tagHasAttr(img, 'alt')).length;
	const emptyButtons = buttons.filter(
		(button) =>
			!decodeHtmlText(button).trim() &&
			!getAttr(button, 'aria-label') &&
			!getAttr(button, 'aria-labelledby') &&
			!getAttr(button, 'title')
	).length;
	const emptyLinks = links.filter(
		(link) =>
			getAttr(link, 'href') &&
			!decodeHtmlText(link).trim() &&
			!getAttr(link, 'aria-label') &&
			!getAttr(link, 'aria-labelledby') &&
			!getAttr(link, 'title')
	).length;
	const duplicateIds = ids.length - idSet.size;
	const brokenAriaRefs = [
		...html.matchAll(/\saria-(?:labelledby|describedby)\s*=\s*(["'])(.*?)\1/gi)
	]
		.flatMap((match) => match[2].split(/\s+/))
		.filter((id) => id && !idSet.has(id)).length;
	const focusableHidden = [
		...html.matchAll(/<([a-z0-9-]+)\b[^>]*aria-hidden\s*=\s*(["'])true\2[^>]*>[\s\S]*?<\/\1>/gi)
	].filter((match) =>
		/<(?:a|button|input|select|textarea)\b|\stabindex\s*=\s*(["'])?0/i.test(match[0])
	).length;
	const dialogRoleTags = html.match(/<[^>]+\srole\s*=\s*(["'])dialog\1[^>]*>/gi) ?? [];
	const dialogs = [...getTags(html, 'dialog'), ...dialogRoleTags];
	const unnamedDialogs = dialogs.filter(
		(dialog) => !getAttr(dialog, 'aria-label') && !getAttr(dialog, 'aria-labelledby')
	).length;
	const unlabeledInputs = inputs.filter((input) => {
		const id = getAttr(input, 'id');
		const hasLabelFor = id && labels.some((label) => getAttr(label, 'for') === id);
		return !hasLabelFor && !getAttr(input, 'aria-label') && !getAttr(input, 'aria-labelledby');
	}).length;
	const placeholderOnlyInputs = inputs.filter((input) => {
		const id = getAttr(input, 'id');
		const hasLabelFor = id && labels.some((label) => getAttr(label, 'for') === id);
		return (
			getAttr(input, 'placeholder') &&
			!hasLabelFor &&
			!getAttr(input, 'aria-label') &&
			!getAttr(input, 'aria-labelledby')
		);
	}).length;
	const skippedHeading = hTags.some((level, index) => index > 0 && level - hTags[index - 1] > 1);

	if (!lang) {
		issues.push(
			issue(
				'accessibility.lang',
				'accessibility',
				'warning',
				'Falta atributo lang',
				'Los lectores de pantalla necesitan conocer el idioma principal.',
				'Anade lang="es" o el idioma correspondiente en la etiqueta html.'
			)
		);
	} else {
		passed.push('Idioma principal declarado.');
	}
	if (imagesWithoutAlt > 0) {
		issues.push(
			issue(
				'accessibility.image-alt',
				'accessibility',
				'warning',
				'Hay imagenes sin alt',
				'Los lectores de pantalla y buscadores pierden contexto.',
				'Anade alt descriptivo o alt vacio en imagenes decorativas.',
				`${imagesWithoutAlt} imagenes`
			)
		);
	}
	if (emptyButtons > 0) {
		issues.push(
			issue(
				'accessibility.button-name',
				'accessibility',
				'critical',
				'Hay botones sin nombre accesible',
				'Un usuario con lector de pantalla no sabra que accion ejecutan.',
				'Anade texto visible, aria-label o aria-labelledby.',
				`${emptyButtons} botones`
			)
		);
	}
	if (emptyLinks > 0) {
		issues.push(
			issue(
				'accessibility.link-name',
				'accessibility',
				'critical',
				'Hay enlaces sin nombre accesible',
				'Un lector de pantalla anunciara enlaces sin contexto.',
				'Anade texto visible, aria-label o contenido accesible.',
				`${emptyLinks} enlaces`
			)
		);
	}
	if (unlabeledInputs > 0) {
		issues.push(
			issue(
				'accessibility.input-label',
				'accessibility',
				'critical',
				'Hay campos de formulario sin label',
				'Los formularios quedan confusos para lectores de pantalla y autocompletado.',
				'Asocia cada input con label, aria-label o aria-labelledby.',
				`${unlabeledInputs} campos`
			)
		);
	}
	if (placeholderOnlyInputs > 0) {
		issues.push(
			issue(
				'accessibility.placeholder-label',
				'accessibility',
				'warning',
				'Inputs usan placeholder como etiqueta',
				'El placeholder desaparece al escribir y no sustituye una etiqueta accesible.',
				'Usa label visible o aria-label estable.',
				`${placeholderOnlyInputs} campos`
			)
		);
	}
	if (duplicateIds > 0) {
		issues.push(
			issue(
				'accessibility.duplicate-id',
				'accessibility',
				'warning',
				'IDs duplicados en HTML',
				'IDs repetidos rompen referencias ARIA, labels y navegacion.',
				'Haz que cada id sea unico.',
				`${duplicateIds} duplicados`
			)
		);
	}
	if (brokenAriaRefs > 0) {
		issues.push(
			issue(
				'accessibility.aria-reference',
				'accessibility',
				'warning',
				'Referencias ARIA rotas',
				'aria-labelledby o aria-describedby apuntan a IDs inexistentes.',
				'Corrige los IDs referenciados o elimina referencias obsoletas.',
				`${brokenAriaRefs} referencias`
			)
		);
	}
	if (focusableHidden > 0) {
		issues.push(
			issue(
				'accessibility.aria-hidden-focus',
				'accessibility',
				'critical',
				'Elemento oculto contiene foco',
				'aria-hidden con enlaces o botones dentro crea trampas para teclado y lector de pantalla.',
				'No ocultes contenido focusable con aria-hidden; retira foco o usa inert.',
				`${focusableHidden} bloques`
			)
		);
	}
	if (unnamedDialogs > 0) {
		issues.push(
			issue(
				'accessibility.dialog-name',
				'accessibility',
				'warning',
				'Dialogos sin nombre accesible',
				'Un modal/dialog sin nombre es confuso para lectores de pantalla.',
				'Anade aria-label o aria-labelledby y gestiona foco/cierre.',
				`${unnamedDialogs} dialogos`
			)
		);
	}
	if (skippedHeading) {
		issues.push(
			issue(
				'accessibility.heading-order',
				'accessibility',
				'warning',
				'Jerarquía de encabezados incorrecta',
				'Se detectaron saltos en la jerarquía de encabezados (por ejemplo, pasar de H2 a H4 sin pasar por H3). Esto dificulta la navegación semántica en lectores de pantalla.',
				'Estructura el contenido de forma progresiva y ordenada (H1 -> H2 -> H3) sin omitir niveles intermedios.'
			)
		);
	}
	if (!issues.length) {
		passed.push('Accesibilidad basica automatica sin avisos prioritarios.');
	}
	return { issues, passed };
}

function analyzePerformanceStructure(snapshot: FetchSnapshot): {
	issues: AuditIssue[];
	passed: string[];
} {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const base = new URL(snapshot.url);
	const htmlBytes = new TextEncoder().encode(snapshot.html).length;
	const scripts = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'src'));
	const stylesheets = getTags(snapshot.html, 'link').filter((link) =>
		getAttr(link, 'rel').toLowerCase().includes('stylesheet')
	);
	const images = getTags(snapshot.html, 'img');
	const fonts = getTags(snapshot.html, 'link').filter(
		(link) => /font/i.test(getAttr(link, 'as')) || /font/i.test(getAttr(link, 'href'))
	);
	const preconnects = getTags(snapshot.html, 'link').filter((link) =>
		/preconnect|dns-prefetch/i.test(getAttr(link, 'rel'))
	);
	const preloads = getTags(snapshot.html, 'link').filter((link) =>
		/preload/i.test(getAttr(link, 'rel'))
	);
	const blockingScripts = scripts.filter(
		(script) =>
			!tagHasAttr(script, 'defer') &&
			!tagHasAttr(script, 'async') &&
			getAttr(script, 'type').toLowerCase() !== 'module'
	);
	const imagesWithoutModernHints = images.filter(
		(img) => !getAttr(img, 'srcset') && !getAttr(img, 'sizes')
	).length;
	const externalHosts = new Set(
		[
			...scripts.map((tag) => getAttr(tag, 'src')),
			...stylesheets.map((tag) => getAttr(tag, 'href')),
			...images.map((tag) => getAttr(tag, 'src'))
		]
			.filter((url) => isLikelyExternalUrl(url, base))
			.map((url) => uniqueHost(url, base))
			.filter(Boolean)
	);
	const firstImage = images[0];
	const imagesWithoutLazy = images.filter(
		(img) =>
			img !== firstImage &&
			getAttr(img, 'loading').toLowerCase() !== 'lazy' &&
			!getAttr(img, 'fetchpriority')
	).length;
	const imagesWithoutSize = images.filter(
		(img) => !getAttr(img, 'width') || !getAttr(img, 'height')
	).length;
	const cacheControl = cleanHeader(snapshot.headers.get('cache-control'));
	const encoding = cleanHeader(snapshot.headers.get('content-encoding'));
	const cdnDetected = headerLooksLikeCdn(snapshot.headers);

	if (snapshot.responseTimeMs > 2500) {
		issues.push(
			issue(
				'performance.response-time',
				'performance',
				'warning',
				'Respuesta HTML lenta',
				'Una respuesta inicial lenta hace que todo lo demas empiece tarde.',
				'Revisa hosting, cache, consultas de servidor y CDN.',
				`${snapshot.responseTimeMs} ms`
			)
		);
	} else {
		passed.push(`Respuesta HTML en ${snapshot.responseTimeMs} ms.`);
	}
	if (htmlBytes > 250_000) {
		issues.push(
			issue(
				'performance.html-weight',
				'performance',
				'warning',
				'HTML muy pesado',
				'Un HTML grande retrasa el primer byte util y puede indicar render excesivo.',
				'Reduce HTML inicial, listas enormes o contenido duplicado.',
				`${Math.round(htmlBytes / 1024)} KB`
			)
		);
	} else {
		passed.push('Peso HTML razonable.');
	}
	if (scripts.length > 18) {
		issues.push(
			issue(
				'performance.script-count',
				'performance',
				'warning',
				'Demasiados scripts',
				'Muchos scripts aumentan bloqueo, errores y coste de mantenimiento.',
				'Elimina scripts no usados y agrupa/carga bajo demanda.',
				`${scripts.length} scripts`
			)
		);
	}
	if (stylesheets.length > 8) {
		issues.push(
			issue(
				'performance.css-count',
				'performance',
				'info',
				'Muchas hojas CSS',
				'Puede haber CSS heredado o plugins cargando estilos innecesarios.',
				'Revisa estilos duplicados y carga critica.',
				`${stylesheets.length} CSS`
			)
		);
	}
	if (externalHosts.size > 8) {
		issues.push(
			issue(
				'performance.third-party-hosts',
				'performance',
				'warning',
				'Muchos dominios externos',
				'Cada tercero aumenta DNS, TLS, privacidad y riesgo de fallo.',
				'Conserva solo proveedores necesarios y usa preconnect si procede.',
				`${externalHosts.size} dominios`
			)
		);
	}
	if (externalHosts.size > 2 && preconnects.length === 0) {
		issues.push(
			issue(
				'performance.preconnect',
				'performance',
				'info',
				'Sin preconnect para terceros',
				'Si hay varios dominios externos, preconnect puede reducir latencia percibida.',
				'Anade preconnect solo para origenes realmente criticos.'
			)
		);
	}
	if (!preloads.length && fonts.length) {
		issues.push(
			issue(
				'performance.preload-fonts',
				'performance',
				'info',
				'Fuentes sin preload detectado',
				'Las fuentes criticas pueden retrasar texto visible si cargan tarde.',
				'Preload solo la fuente principal necesaria above-the-fold.'
			)
		);
	}
	if (blockingScripts.length > 0) {
		issues.push(
			issue(
				'performance.blocking-scripts',
				'performance',
				'warning',
				'Scripts potencialmente bloqueantes en el head',
				'Scripts externos cargados en el head sin defer, async o type="module" bloquean el renderizado del HTML inicial.',
				'Añade el atributo defer o async a estos scripts para que no bloqueen la visualización.',
				`${blockingScripts.length} scripts`
			)
		);
	}
	if (imagesWithoutLazy > 0) {
		issues.push(
			issue(
				'performance.lazy-images',
				'performance',
				'info',
				'Imágenes secundarias sin lazy loading',
				'Las imágenes fuera de la pantalla de inicio cargan de forma innecesaria antes de tiempo, consumiendo datos y ralentizando la web.',
				'Añade el atributo loading="lazy" a todas las imágenes excepto a la primera del primer pliegue.',
				`${imagesWithoutLazy} imágenes`
			)
		);
	}
	if (imagesWithoutModernHints > 4) {
		issues.push(
			issue(
				'performance.responsive-images',
				'performance',
				'info',
				'Imagenes sin srcset/sizes',
				'Sin variantes responsive se pueden servir imagenes demasiado grandes en movil.',
				'Usa srcset/sizes o un pipeline de imagenes responsive.',
				`${imagesWithoutModernHints} imagenes`
			)
		);
	}
	if (imagesWithoutSize > 0) {
		issues.push(
			issue(
				'performance.image-dimensions',
				'performance',
				'info',
				'Imagenes sin width/height',
				'Sin dimensiones, el layout puede saltar al cargar imagenes.',
				'Declara width y height o aspect-ratio estable.',
				`${imagesWithoutSize} imagenes`
			)
		);
	}
	if (!cacheControl) {
		issues.push(
			issue(
				'performance.cache-control',
				'performance',
				'info',
				'Falta Cache-Control en HTML',
				'Sin politica de cache clara puede haber cargas innecesarias o contenido obsoleto.',
				'Define Cache-Control adecuado para HTML y assets.'
			)
		);
	}
	if (!encoding) {
		issues.push(
			issue(
				'performance.compression',
				'performance',
				'info',
				'No se detecta compresion HTTP',
				'Gzip/Brotli reducen transferencia de HTML/CSS/JS.',
				'Activa Brotli o gzip en CDN/hosting.'
			)
		);
	}
	if (!cdnDetected) {
		issues.push(
			issue(
				'performance.cdn',
				'performance',
				'info',
				'No se detecta CDN/cache perimetral',
				'Un CDN reduce latencia y absorbe picos si el proyecto lo necesita.',
				'Valora Cloudflare, Vercel Edge, Fastly, Bunny o CDN del hosting.'
			)
		);
	}
	return { issues, passed };
}

function analyzeSeoTechnical(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const title = tagText(snapshot.html, 'title');
	const description = metaContent(snapshot.html, 'name', 'description');
	const canonical = canonicalHref(snapshot.html);
	const robots = metaContent(snapshot.html, 'name', 'robots').toLowerCase();
	const h1s = getTags(snapshot.html, 'h1');
	const h2s = getTags(snapshot.html, 'h2');
	const h3s = getTags(snapshot.html, 'h3');
	const ogTitle = metaContent(snapshot.html, 'property', 'og:title');
	const ogDescription = metaContent(snapshot.html, 'property', 'og:description');
	const ogImage = metaContent(snapshot.html, 'property', 'og:image');
	const ogUrl = metaContent(snapshot.html, 'property', 'og:url');
	const twitterCard = metaContent(snapshot.html, 'name', 'twitter:card');
	const hreflangs = getTags(snapshot.html, 'link').filter(
		(link) => getAttr(link, 'rel').toLowerCase() === 'alternate' && getAttr(link, 'hreflang')
	);
	const jsonLd = getTags(snapshot.html, 'script').filter(
		(script) => getAttr(script, 'type').toLowerCase() === 'application/ld+json'
	);
	const xRobotsTag = cleanHeader(snapshot.headers.get('x-robots-tag')).toLowerCase();

	if (!title) {
		issues.push(
			issue(
				'seo.title',
				'seo',
				'critical',
				'Falta title',
				'El title es una senal basica para SEO y para la pestana del navegador.',
				'Anade un title unico y descriptivo.'
			)
		);
	} else if (title.length < 20 || title.length > 70) {
		issues.push(
			issue(
				'seo.title-length',
				'seo',
				'warning',
				'Title poco equilibrado',
				'Un title demasiado corto o largo suele rendir peor en resultados de busqueda.',
				'Ajustalo a una frase clara de unas 30-60 letras.',
				title
			)
		);
	} else {
		passed.push('Title presente y con longitud razonable.');
	}
	if (!description) {
		issues.push(
			issue(
				'seo.description',
				'seo',
				'warning',
				'Falta meta description',
				'Ayuda a controlar el resumen que puede verse en buscadores.',
				'Anade una descripcion clara de la pagina.'
			)
		);
	} else if (description.length < 70 || description.length > 180) {
		issues.push(
			issue(
				'seo.description-length',
				'seo',
				'info',
				'Meta description poco equilibrada',
				'Una descripcion demasiado corta o larga puede perder claridad en resultados.',
				'Resume la propuesta de la pagina en 120-160 caracteres.',
				description
			)
		);
	}
	if (!canonical) {
		issues.push(
			issue(
				'seo.canonical',
				'seo',
				'warning',
				'Falta canonical',
				'El canonical reduce duplicados y ayuda a consolidar senales SEO.',
				'Anade link rel="canonical" con la URL final preferida.'
			)
		);
	}
	if (robots.includes('noindex') || xRobotsTag.includes('noindex')) {
		issues.push(
			issue(
				'seo.noindex',
				'seo',
				'critical',
				'La pagina esta marcada como noindex',
				'Google puede excluir esta URL de resultados.',
				'Quita noindex si la pagina debe posicionar.',
				robots || xRobotsTag
			)
		);
	}
	if (h1s.length !== 1) {
		issues.push(
			issue(
				'seo.h1',
				'seo',
				h1s.length === 0 ? 'critical' : 'warning',
				h1s.length === 0 ? 'Falta H1' : 'Hay mas de un H1',
				'El H1 ayuda a entender el tema principal de la pagina.',
				'Usa un unico H1 descriptivo por pagina.',
				`${h1s.length} H1`
			)
		);
	}
	if (!h2s.length && !h3s.length) {
		issues.push(
			issue(
				'seo.heading-depth',
				'seo',
				'info',
				'Faltan H2/H3 descriptivos',
				'Una pagina sin subtitulos suele ser mas dificil de escanear e interpretar.',
				'Divide el contenido con H2/H3 utiles para usuarios, buscadores e IA.'
			)
		);
	}
	if (canonical && !/^https?:\/\//i.test(canonical)) {
		issues.push(
			issue(
				'seo.canonical-relative',
				'seo',
				'info',
				'Canonical no absoluto',
				'Un canonical relativo puede interpretarse peor en algunos pipelines.',
				'Usa una URL absoluta en rel=canonical.',
				canonical
			)
		);
	}
	const socialTags = {
		'og:title': ogTitle,
		'og:description': ogDescription,
		'og:image': ogImage,
		'og:url': ogUrl,
		'twitter:card': twitterCard
	};
	const missingSocial = Object.entries(socialTags)
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missingSocial.length > 0) {
		issues.push(
			issue(
				'seo.open-graph',
				'seo',
				missingSocial.length >= 3 ? 'warning' : 'info',
				'Metadatos sociales incompletos',
				`No se detectaron las etiquetas: ${missingSocial.join(', ')}. Esto debilita las previsualizaciones al compartir en redes sociales.`,
				'Añade metatags Open Graph (og:title, og:description, og:image, og:url) y Twitter Cards (twitter:card, twitter:image) para optimizar la visualización social.',
				`Faltan: ${missingSocial.join(', ')}`
			)
		);
	} else {
		passed.push('Etiquetas Open Graph y Twitter Cards presentes.');
	}
	if (!hreflangs.length) {
		issues.push(
			issue(
				'seo.hreflang',
				'seo',
				'info',
				'No se detecta hreflang',
				'Si la web tiene idiomas o mercados, hreflang evita confusiones de indexacion.',
				'Anade hreflang solo si existen versiones por idioma o pais.'
			)
		);
	}
	for (const script of jsonLd) {
		try {
			JSON.parse(scriptBody(script));
		} catch {
			issues.push(
				issue(
					'seo.json-ld-invalid',
					'seo',
					'warning',
					'JSON-LD invalido',
					'Un JSON-LD roto puede ser ignorado por buscadores.',
					'Valida el bloque JSON-LD y corrige comas, llaves o strings.'
				)
			);
			break;
		}
	}
	if (!jsonLd.length) {
		issues.push(
			issue(
				'seo.json-ld',
				'seo',
				'info',
				'No hay JSON-LD',
				'Los datos estructurados ayudan a explicar la pagina a buscadores.',
				'Anade JSON-LD cuando tenga sentido: Organization, WebSite, Service, Article, Product o FAQ.'
			)
		);
	} else {
		passed.push('JSON-LD presente.');
	}
	return { issues, passed };
}

function analyzeAiReadiness(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const text = allText(snapshot.html);
	const jsonLd = getTags(snapshot.html, 'script').filter(
		(script) => getAttr(script, 'type').toLowerCase() === 'application/ld+json'
	);
	const headings = [...snapshot.html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(
		(match) => decodeHtmlText(match[1])
	);
	const hasFaqText = /\b(faq|preguntas frecuentes|questions)\b/i.test(text);
	const hasAuthor = /\b(author|autor|byline|moises|moisés)\b/i.test(snapshot.html);
	const hasContact = /\b(contacto|contact|email|mailto:|linkedin)\b/i.test(snapshot.html);
	const hasVisibleDate =
		/\b(actualizado|ultima actualizacion|última actualización|dateModified|datePublished|published|modified)\b/i.test(
			snapshot.html
		);
	const scripts = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'src'));
	const jsShellLikely =
		text.length < 350 &&
		scripts.length > 3 &&
		/<div[^>]+id\s*=\s*(["'])(?:app|root|__next|svelte)\1/i.test(snapshot.html);
	const schemaText = jsonLd.map(scriptBody).join(' ');
	const hasEntitySchema =
		/Person|Organization|LocalBusiness|WebSite|Article|FAQPage|sameAs|mainEntity|publisher|author/i.test(
			schemaText
		);

	if (text.length < 700) {
		issues.push(
			issue(
				'ai.thin-content',
				'ai',
				'warning',
				'Poco contenido legible para IA',
				'Los asistentes y buscadores necesitan texto suficiente para entender contexto y utilidad.',
				'Anade explicaciones claras, casos, beneficios y preguntas frecuentes.',
				`${text.length} caracteres`
			)
		);
	}
	if (headings.length < 3) {
		issues.push(
			issue(
				'ai.heading-context',
				'ai',
				'info',
				'Pocos encabezados semanticos',
				'Los encabezados ayudan a fragmentar y resumir el contenido.',
				'Usa H2/H3 descriptivos orientados a intencion de busqueda.'
			)
		);
	}
	if (!jsonLd.length) {
		issues.push(
			issue(
				'ai.structured-data',
				'ai',
				'warning',
				'Sin datos estructurados para IA/buscadores',
				'JSON-LD ayuda a identificar entidad, autor, servicio o articulo.',
				'Incluye schema.org adecuado a la pagina.'
			)
		);
	}
	if (!hasFaqText) {
		issues.push(
			issue(
				'ai.faq',
				'ai',
				'info',
				'No se detecta bloque de preguntas frecuentes',
				'Las FAQ ayudan a cubrir dudas y respuestas citables por asistentes.',
				'Anade preguntas reales si encajan con la pagina.'
			)
		);
	}
	if (!hasAuthor) {
		issues.push(
			issue(
				'ai.author',
				'ai',
				'info',
				'Autor o entidad poco clara',
				'La atribucion refuerza confianza y contexto para buscadores e IA.',
				'Incluye autor, empresa o responsable visible.'
			)
		);
	}
	if (!hasContact) {
		issues.push(
			issue(
				'ai.contact-context',
				'ai',
				'info',
				'Contacto poco visible',
				'Los sistemas y usuarios necesitan entender quien esta detras y como contactar.',
				'Incluye email, formulario, LinkedIn o datos de contacto.'
			)
		);
	}
	if (
		!hasVisibleDate &&
		/article|blog|post|noticia|guia|guía/i.test(snapshot.url + snapshot.html)
	) {
		issues.push(
			issue(
				'ai.updated-date',
				'ai',
				'info',
				'No se detecta fecha de actualizacion',
				'En articulos y guias, la fecha ayuda a valorar vigencia y fiabilidad.',
				'Incluye datePublished/dateModified en JSON-LD o una fecha visible.'
			)
		);
	}
	if (jsShellLikely) {
		issues.push(
			issue(
				'ai.js-only-shell',
				'ai',
				'warning',
				'Contenido posiblemente dependiente de JS',
				'Si el HTML inicial viene casi vacio, buscadores y asistentes pueden entender peor la pagina.',
				'Sirve contenido principal renderizado en servidor o HTML inicial suficiente.'
			)
		);
	}
	if (jsonLd.length && !hasEntitySchema) {
		issues.push(
			issue(
				'ai.schema-quality',
				'ai',
				'info',
				'JSON-LD poco expresivo',
				'Que el JSON-LD sea valido no significa que explique bien entidad, autor o contenido.',
				'Incluye tipos schema.org utiles: Person, Organization, WebSite, Article, FAQPage, sameAs o mainEntity.'
			)
		);
	}
	if (!issues.length) {
		passed.push('Contenido preparado para interpretacion por buscadores e IA.');
	}
	return { issues, passed };
}

function analyzePrivacyLegal(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const base = new URL(snapshot.url);
	const html = snapshot.html;
	const text = allText(html).toLowerCase();
	const anchors = getTags(html, 'a');
	const scripts = getTags(html, 'script').filter((script) => getAttr(script, 'src'));
	const forms = getTags(html, 'form');
	const hasPrivacy =
		/privacidad|privacy|politica de privacidad|política de privacidad/i.test(text) ||
		anchors.some((a) => /privacidad|privacy/i.test(getAttr(a, 'href') + decodeHtmlText(a)));
	const hasCookies =
		/cookies|cookie policy|politica de cookies|política de cookies/i.test(text) ||
		anchors.some((a) => /cookies/i.test(getAttr(a, 'href') + decodeHtmlText(a)));
	const hasLegal =
		/aviso legal|legal notice|terminos|términos|terms/i.test(text) ||
		anchors.some((a) => /legal|terms|terminos|privacidad/i.test(getAttr(a, 'href')));
	const trackerHosts = scripts
		.map((script) => uniqueHost(getAttr(script, 'src'), base))
		.filter((host) =>
			/google-analytics|googletagmanager|facebook|hotjar|clarity|tiktok|doubleclick|hubspot|intercom|segment|matomo/i.test(
				host
			)
		);
	const inlineTracking =
		/\b(gtag\s*\(|dataLayer|fbq\s*\(|clarity\s*\(|hj\s*\(|_paq\.push|googletagmanager|google-analytics)\b/i.test(
			html
		);
	const hasCmp =
		/\b(onetrust|cookiebot|didomi|axeptio|iubenda|tarteaucitron|cookieyes|consent mode|cmp)\b/i.test(
			html
		);
	const formsWithoutLegal = forms.filter(
		(form) => !/privacidad|privacy|legal|consent|acepto|accept/i.test(form)
	).length;
	const precheckedConsent = forms.filter(
		(form) =>
			/type\s*=\s*(["'])checkbox\1[^>]*checked/i.test(form) &&
			/privacidad|privacy|legal|consent|acepto|accept/i.test(form)
	).length;
	const insecureForms = forms.filter((form) => {
		const action = getAttr(form, 'action');
		return /^http:\/\//i.test(action);
	}).length;

	if (!hasPrivacy) {
		issues.push(
			issue(
				'privacy.policy',
				'privacy',
				'warning',
				'No se detecta politica de privacidad',
				'Una web con formularios, analitica o contacto necesita explicar el tratamiento de datos.',
				'Anade una politica de privacidad visible y enlazada.'
			)
		);
	}
	if (!hasCookies) {
		issues.push(
			issue(
				'privacy.cookies',
				'privacy',
				trackerHosts.length || inlineTracking ? 'warning' : 'info',
				'No se detecta enlace a la política de cookies',
				'Un enlace visible a la política de cookies es indispensable para cumplir con la ley y garantizar la transparencia del sitio.',
				'Añade un enlace visible a tu política de cookies en el pie de página del sitio.'
			)
		);
	} else {
		passed.push('Enlace a la política de cookies detectado.');
	}

	if (trackerHosts.length || inlineTracking) {
		issues.push(
			issue(
				'privacy.analytics-detected',
				'privacy',
				'info',
				'Scripts de analítica o seguimiento detectados',
				`Se ha detectado la presencia de scripts de seguimiento: ${[...new Set(trackerHosts), inlineTracking ? 'script en línea (dataLayer/gtag/fbq)' : ''].filter(Boolean).join(', ')}.`,
				'Asegúrate de que estos scripts estén desactivados por defecto y solo se activen después de recibir el consentimiento explícito del usuario.',
				`Detectados: ${[...new Set(trackerHosts)].join(', ')}`
			)
		);

		if (!hasCmp) {
			issues.push(
				issue(
					'privacy.consent-banner',
					'privacy',
					'warning',
					'Tracking sin gestor de consentimiento (CMP) visible',
					'Se detectaron scripts de analítica o marketing, pero no firmas de gestores de consentimiento (como Cookiebot, Didomi, Axeptio, iubenda, etc.).',
					'Implementa un CMP o asegúrate de que el tracking no cargue cookies no necesarias hasta que el usuario dé su consentimiento.'
				)
			);
		}
	}
	if (!hasLegal) {
		issues.push(
			issue(
				'privacy.legal-notice',
				'privacy',
				'info',
				'No se detecta aviso legal o terminos',
				'En webs publicas suele ser una senal basica de confianza y cumplimiento.',
				'Incluye aviso legal, terminos o datos del responsable si aplica.'
			)
		);
	}
	if (formsWithoutLegal > 0) {
		issues.push(
			issue(
				'privacy.form-consent',
				'privacy',
				'warning',
				'Formularios sin referencia legal visible',
				'El usuario deberia saber que pasa con sus datos antes de enviarlos.',
				'Incluye texto legal, checkbox o enlace a privacidad junto al formulario.',
				`${formsWithoutLegal} formularios`
			)
		);
	}
	if (precheckedConsent > 0) {
		issues.push(
			issue(
				'privacy.prechecked-consent',
				'privacy',
				'warning',
				'Checkbox legal premarcado',
				'El consentimiento debe ser una accion clara del usuario cuando aplique.',
				'No marques por defecto checks de consentimiento o marketing.',
				`${precheckedConsent} formularios`
			)
		);
	}
	if (insecureForms > 0) {
		issues.push(
			issue(
				'privacy.insecure-form-action',
				'privacy',
				'critical',
				'Formulario envia a HTTP',
				'Los datos enviados podrian viajar sin cifrar.',
				'Cambia el action del formulario a HTTPS.',
				`${insecureForms} formularios`
			)
		);
	}
	if (!issues.length) {
		passed.push('Privacidad/legal basica sin avisos automaticos.');
	}
	return { issues, passed };
}

function analyzeDeliveryQuality(snapshot: FetchSnapshot): {
	issues: AuditIssue[];
	passed: string[];
} {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const html = snapshot.html;
	const base = new URL(snapshot.url);
	const anchors = getTags(html, 'a').filter((anchor) => getAttr(anchor, 'href'));
	const images = getTags(html, 'img');
	const links = getTags(html, 'link');
	const favicon = links.find((link) => /\bicon\b/i.test(getAttr(link, 'rel')));
	const viewport = metaContent(html, 'name', 'viewport');
	const brokenHrefCount = anchors.filter((anchor) => {
		const href = getAttr(anchor, 'href').trim();
		return href === '' || href === '#' || href.toLowerCase().startsWith('javascript:void');
	}).length;
	const placeholderText =
		/\b(lorem ipsum|placeholder|coming soon|prueba|test@example|example\.com)\b/i.test(
			allText(html)
		);
	const debugText = /\b(console\.log|debugger;|TODO|FIXME|localhost:|127\.0\.0\.1)\b/i.test(html);
	const suspiciousExternal = [...links, ...getTags(html, 'script'), ...images]
		.map((tag) => getAttr(tag, 'href') || getAttr(tag, 'src'))
		.filter((url) => isLikelyExternalUrl(url, base))
		.filter((url) =>
			SUSPICIOUS_HOST_PATTERNS.some((pattern) => pattern.test(uniqueHost(url, base)))
		);

	if (snapshot.status < 200 || snapshot.status >= 400) {
		issues.push(
			issue(
				'delivery.status',
				'delivery',
				'critical',
				'La URL no devuelve un estado correcto',
				'Una pagina con error HTTP no deberia publicarse como entrega final.',
				'Corrige servidor, redirecciones o ruta publicada.',
				`HTTP ${snapshot.status}`
			)
		);
	} else {
		passed.push('Estado HTTP final correcto.');
	}
	if (!viewport) {
		issues.push(
			issue(
				'delivery.viewport',
				'delivery',
				'critical',
				'Falta viewport responsive',
				'En movil la web puede verse escalada o rota.',
				'Anade meta viewport width=device-width, initial-scale=1.'
			)
		);
	}
	if (!favicon) {
		issues.push(
			issue(
				'delivery.favicon',
				'delivery',
				'info',
				'No se detecta favicon',
				'El favicon es una senal de acabado en navegador y favoritos.',
				'Incluye favicon y apple-touch-icon.'
			)
		);
	}
	if (brokenHrefCount > 0) {
		issues.push(
			issue(
				'delivery.empty-links',
				'delivery',
				'warning',
				'Hay enlaces vacios o placeholder',
				'Los enlaces con # o vacios suelen ser restos de desarrollo.',
				'Sustituye esos enlaces por destinos reales o botones si no navegan.',
				`${brokenHrefCount} enlaces`
			)
		);
	}
	if (placeholderText) {
		issues.push(
			issue(
				'delivery.placeholder-copy',
				'delivery',
				'warning',
				'Posible texto placeholder',
				'Restos de plantilla o pruebas bajan confianza y sensacion de acabado.',
				'Revisa textos de ejemplo, pruebas y contenido provisional.'
			)
		);
	}
	if (debugText) {
		issues.push(
			issue(
				'delivery.debug-leftovers',
				'delivery',
				'warning',
				'Posibles restos de desarrollo',
				'TODO, debug o localhost en HTML indican entrega sin limpiar.',
				'Elimina trazas de desarrollo antes de publicar.'
			)
		);
	}
	if (suspiciousExternal.length) {
		issues.push(
			issue(
				'quality.suspicious-domain',
				'quality',
				'warning',
				'Dominio externo sospechoso',
				'Dominios de apuestas, farmacia, cripto u otros patrones pueden indicar inyeccion o dependencia peligrosa.',
				'Revisa y elimina recursos externos no justificados.',
				suspiciousExternal[0]
			)
		);
	}
	if (!issues.length) {
		passed.push('Calidad de entrega sin avisos automaticos prioritarios.');
	}
	return { issues, passed };
}

function analyzeCommercialTrust(snapshot: FetchSnapshot): {
	issues: AuditIssue[];
	passed: string[];
} {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const html = snapshot.html;
	const text = allText(html).toLowerCase();
	const anchors = getTags(html, 'a');
	const hasContact = /contacto|contact|mailto:|tel:|whatsapp|linkedin/i.test(html + text);
	const hasCta =
		/\b(contacta|contacto|solicita|reserva|comprar|empezar|hablar|llamar|ver proyecto|ver trabajos|agenda)\b/i.test(
			text
		);
	const hasSocial = anchors.some((a) =>
		/linkedin|github|instagram|facebook|x\.com|twitter|youtube|malt|behance|dribbble/i.test(
			getAttr(a, 'href')
		)
	);
	const hasProof =
		/\b(testimonio|reseña|review|cliente|caso de exito|portfolio|proyecto|trabajos|logos|certificado)\b/i.test(
			text
		);
	const hasLocation =
		/\b(alcoy|alicante|valencia|madrid|barcelona|spain|espana|españa|remoto|hibrido|presencial)\b/i.test(
			text
		);
	const hasEmailOrPhone = /mailto:|tel:|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(html);

	if (!hasContact || !hasEmailOrPhone) {
		issues.push(
			issue(
				'trust.contact',
				'trust',
				'warning',
				'Contacto poco claro',
				'Si la persona que visita la web no encuentra una via de contacto rapida, baja la confianza.',
				'Incluye email, formulario, telefono, LinkedIn o una accion visible.'
			)
		);
	}
	if (!hasCta) {
		issues.push(
			issue(
				'trust.cta',
				'trust',
				'info',
				'No se detecta accion principal clara',
				'Una web puede estar bien tecnicamente y aun asi no guiar a la persona que la visita.',
				'Incluye una accion principal coherente con el objetivo de la pagina.'
			)
		);
	}
	if (!hasSocial) {
		issues.push(
			issue(
				'trust.social-proof-links',
				'trust',
				'info',
				'No se detectan enlaces sociales/profesionales',
				'Perfiles externos pueden reforzar identidad y confianza.',
				'Enlaza LinkedIn, GitHub, redes o plataformas relevantes.'
			)
		);
	}
	if (!hasProof) {
		issues.push(
			issue(
				'trust.proof',
				'trust',
				'info',
				'Pocas senales de prueba o trabajos',
				'Casos, testimonios, proyectos o logos ayudan a creer la propuesta.',
				'Muestra ejemplos reales, resultados o pruebas de experiencia.'
			)
		);
	}
	if (!hasLocation) {
		issues.push(
			issue(
				'trust.location',
				'trust',
				'info',
				'Ubicacion o ambito poco claro',
				'Para servicios locales o empleo, el contexto geografico/remoto ayuda a filtrar oportunidades.',
				'Indica zona, modalidad o ambito de trabajo si aplica.'
			)
		);
	}
	if (!issues.length) {
		passed.push('Claridad y confianza basicas bien cubiertas.');
	}
	return { issues, passed };
}

function analyzeHtml(snapshot: FetchSnapshot): {
	issues: AuditIssue[];
	passed: string[];
	signals: Pick<
		PublicWebAudit['signals'],
		'isWordPress' | 'externalScripts' | 'internalLinks' | 'imagesWithoutAlt'
	>;
} {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	if (!snapshot.html) {
		issues.push(
			issue(
				'quality.no-html',
				'quality',
				'critical',
				'No se pudo leer HTML',
				'Sin HTML no se puede auditar SEO, accesibilidad ni recursos visibles.',
				'Comprueba que la URL devuelve una página HTML pública.',
				`HTTP ${snapshot.status}`
			)
		);
		return {
			issues,
			passed,
			signals: { isWordPress: false, externalScripts: 0, internalLinks: 0, imagesWithoutAlt: 0 }
		};
	}

	const base = new URL(snapshot.url);
	const title = tagText(snapshot.html, 'title');
	const description = metaContent(snapshot.html, 'name', 'description');
	const canonical = canonicalHref(snapshot.html);
	const h1s = getTags(snapshot.html, 'h1');
	const ogTitle = metaContent(snapshot.html, 'property', 'og:title');
	const ogImage = metaContent(snapshot.html, 'property', 'og:image');
	const jsonLd = getTags(snapshot.html, 'script').filter(
		(script) => getAttr(script, 'type').toLowerCase() === 'application/ld+json'
	);
	const images = getTags(snapshot.html, 'img');
	const imagesWithoutAlt = images.filter((img) => !tagHasAttr(img, 'alt')).length;
	const scripts = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'src'));
	const iframes = getTags(snapshot.html, 'iframe');
	const anchors = getTags(snapshot.html, 'a').filter((anchor) => getAttr(anchor, 'href'));
	const internalLinks = anchors.filter((anchor) => {
		try {
			return new URL(getAttr(anchor, 'href'), base).origin === base.origin;
		} catch {
			return false;
		}
	}).length;
	const externalScripts = scripts.filter((script) => {
		try {
			return new URL(getAttr(script, 'src'), base).origin !== base.origin;
		} catch {
			return false;
		}
	});
	const isWordPress = detectWordPress(snapshot.html);

	if (!title) {
		issues.push(
			issue(
				'seo.title',
				'seo',
				'critical',
				'Falta title',
				'El title es una señal básica para SEO y para la pestaña del navegador.',
				'Añade un title único y descriptivo.'
			)
		);
	} else if (title.length < 20 || title.length > 70) {
		issues.push(
			issue(
				'seo.title-length',
				'seo',
				'warning',
				'Title poco equilibrado',
				'Un title demasiado corto o largo suele rendir peor en resultados de busqueda.',
				'Ajustalo a una frase clara de unas 30-60 letras.',
				title
			)
		);
	} else {
		passed.push('Title presente.');
	}

	if (!description) {
		issues.push(
			issue(
				'seo.description',
				'seo',
				'warning',
				'Falta meta description',
				'Ayuda a controlar el resumen que puede verse en buscadores.',
				'Añade una descripción clara de la página.'
			)
		);
	}

	if (!canonical) {
		issues.push(
			issue(
				'seo.canonical',
				'seo',
				'warning',
				'Falta canonical',
				'El canonical reduce duplicados y ayuda a consolidar señales SEO.',
				'Añade link rel="canonical" con la URL final preferida.'
			)
		);
	}

	if (h1s.length !== 1) {
		issues.push(
			issue(
				'seo.h1',
				'seo',
				h1s.length === 0 ? 'critical' : 'warning',
				h1s.length === 0 ? 'Falta H1' : 'Hay mas de un H1',
				'El H1 ayuda a entender el tema principal de la página.',
				'Usa un único H1 descriptivo por página.',
				`${h1s.length} H1`
			)
		);
	}

	if (!ogTitle || !ogImage) {
		issues.push(
			issue(
				'seo.open-graph',
				'seo',
				'info',
				'Open Graph incompleto',
				'Las vistas previas al compartir pueden verse pobres o incorrectas.',
				'Añade al menos og:title, og:description y og:image.'
			)
		);
	}

	if (!jsonLd.length) {
		issues.push(
			issue(
				'seo.json-ld',
				'seo',
				'info',
				'No hay JSON-LD',
				'Los datos estructurados ayudan a explicar la página a buscadores.',
				'Añade JSON-LD cuando tenga sentido: Organization, WebSite, Service, Article, Product o FAQ.'
			)
		);
	} else {
		for (const script of jsonLd) {
			try {
				JSON.parse(scriptBody(script));
			} catch {
				issues.push(
					issue(
						'seo.json-ld-invalid',
						'seo',
						'warning',
						'JSON-LD inválido',
						'Un JSON-LD roto puede ser ignorado por buscadores.',
						'Valida el bloque JSON-LD y corrige comas, llaves o strings.'
					)
				);
				break;
			}
		}
	}

	if (imagesWithoutAlt > 0) {
		issues.push(
			issue(
				'accessibility.image-alt',
				'accessibility',
				'warning',
				'Hay imágenes sin alt',
				'Los lectores de pantalla y buscadores pierden contexto.',
				'Añade alt descriptivo o alt vacío en imágenes puramente decorativas.',
				`${imagesWithoutAlt} imágenes`
			)
		);
	}

	const hiddenIframe = iframes.find((iframe) => {
		const style = getAttr(iframe, 'style').toLowerCase();
		const width = getAttr(iframe, 'width');
		const height = getAttr(iframe, 'height');
		return (
			style.includes('display:none') ||
			style.includes('visibility:hidden') ||
			width === '0' ||
			height === '0'
		);
	});
	if (hiddenIframe) {
		issues.push(
			issue(
				'quality.hidden-iframe',
				'quality',
				'warning',
				'Iframe oculto detectado',
				'Los iframes ocultos pueden ser legítimos, pero también aparecen en inyecciones o tracking agresivo.',
				'Revisa su src y elimina cualquier iframe no justificado.',
				getAttr(hiddenIframe, 'src') || 'iframe sin src'
			)
		);
	}

	for (const script of externalScripts) {
		const src = getAttr(script, 'src');
		const parsed = new URL(src, base);
		if (
			parsed.protocol !== 'https:' ||
			SUSPICIOUS_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))
		) {
			issues.push(
				issue(
					'quality.suspicious-script',
					'quality',
					'warning',
					'Script externo sospechoso',
					'Los scripts externos pueden afectar seguridad, privacidad y rendimiento.',
					'Revisa si este dominio es necesario y cargalo solo si confias en el proveedor.',
					parsed.toString()
				)
			);
		}
	}

	const mixedContentMatch = snapshot.html.match(/\s(?:src|href)=["'](http:\/\/[^"'\s<>]+)["']/i);
	if (base.protocol === 'https:' && mixedContentMatch?.[1]) {
		issues.push(
			issue(
				'security.mixed-content',
				'security',
				'warning',
				'Posible mixed content',
				'Recursos HTTP dentro de una página HTTPS pueden bloquearse o degradar seguridad.',
				'Cambia recursos http:// por https:// o alojalos localmente.',
				mixedContentMatch[1]
			)
		);
	}

	const brokenHrefCount = anchors.filter((anchor) => {
		const href = getAttr(anchor, 'href');
		return href === '' || href === '#';
	}).length;
	if (brokenHrefCount > 0) {
		issues.push(
			issue(
				'quality.empty-links',
				'quality',
				'info',
				'Hay enlaces vacios o placeholder',
				'Los enlaces con # o vacios suelen ser restos de desarrollo.',
				'Sustituye esos enlaces por destinos reales o botones si no navegan.',
				`${brokenHrefCount} enlaces`
			)
		);
	}

	return {
		issues,
		passed,
		signals: {
			isWordPress,
			externalScripts: externalScripts.length,
			internalLinks,
			imagesWithoutAlt
		}
	};
}

async function analyzeSideFiles(
	origin: string,
	isHttps: boolean
): Promise<{
	issues: AuditIssue[];
	passed: string[];
	hasRobotsTxt: boolean;
	hasSitemap: boolean;
	hasLlmsTxt: boolean;
	hasSecurityTxt: boolean;
}> {
	const [robots, sitemap, llms, llmsFull, securityTxt] = await Promise.all([
		fetchTextIfAvailable(`${origin}/robots.txt`, 8000),
		fetchTextIfAvailable(`${origin}/sitemap.xml`, 8000),
		fetchTextIfAvailable(`${origin}/llms.txt`, 8000),
		fetchTextIfAvailable(`${origin}/llms-full.txt`, 8000),
		fetchTextIfAvailable(`${origin}/.well-known/security.txt`, 8000)
	]);
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	if (!robots.ok || !/user-agent\s*:/i.test(robots.text)) {
		issues.push(
			issue(
				'seo.robots',
				'seo',
				'info',
				'robots.txt no encontrado o inválido',
				'robots.txt ayuda a orientar el rastreo de buscadores.',
				'Publica un robots.txt básico que apunte al sitemap.'
			)
		);
	} else {
		passed.push('robots.txt disponible.');
	}

	if (!sitemap.ok || !/<urlset|<sitemapindex/i.test(sitemap.text)) {
		issues.push(
			issue(
				'seo.sitemap',
				'seo',
				'warning',
				'sitemap.xml no encontrado',
				'El sitemap facilita descubrir páginas importantes.',
				'Genera y publica /sitemap.xml con las URLs indexables.'
			)
		);
	} else {
		passed.push('sitemap.xml disponible.');
	}

	if (!llms.ok || !llms.text.trim()) {
		issues.push(
			issue(
				'ai.llms-txt',
				'ai',
				'info',
				'llms.txt no encontrado',
				'Un llms.txt ayuda a ofrecer contexto resumido a asistentes y crawlers de IA.',
				'Publica /llms.txt con resumen, paginas clave y uso recomendado.'
			)
		);
	} else {
		passed.push('llms.txt disponible.');
	}

	if (!llmsFull.ok || !llmsFull.text.trim()) {
		issues.push(
			issue(
				'ai.llms-full',
				'ai',
				'info',
				'llms-full.txt no encontrado',
				'Una versión extendida de llms.txt facilita la lectura profunda de contenido por parte de IAs.',
				'Publica /llms-full.txt si quieres dar más contexto secundario a herramientas de IA.'
			)
		);
	} else {
		passed.push('llms-full.txt disponible.');
	}

	const blockedAiBots: string[] = [];
	if (robots.ok) {
		const aiBots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];
		for (const bot of aiBots) {
			const regex = new RegExp(
				`User-agent:\\s*${bot}\\b[\\s\\S]*?Disallow:\\s*/(?:\\s|\\r|\\n|$)`,
				'i'
			);
			if (regex.test(robots.text)) {
				blockedAiBots.push(bot);
			}
		}
	}

	if (blockedAiBots.length > 0) {
		issues.push(
			issue(
				'ai.blocked-bots',
				'ai',
				'info',
				'Rastreadores de IA bloqueados en robots.txt',
				`Se detectó el bloqueo de: ${blockedAiBots.join(', ')}.`,
				'Esto impide que estas herramientas utilicen el contenido para entrenarse o dar respuestas.',
				`Bloqueados: ${blockedAiBots.join(', ')}`
			)
		);
	} else {
		passed.push('Sin restricciones de rastreo para IAs populares en robots.txt.');
	}

	if (!securityTxt.ok || !/contact\s*:/i.test(securityTxt.text)) {
		issues.push(
			issue(
				'security.security-txt',
				'security',
				'info',
				'security.txt no encontrado',
				'security.txt facilita reportar vulnerabilidades de forma responsable.',
				'Publica /.well-known/security.txt con Contact y politica basica.'
			)
		);
	} else {
		passed.push('security.txt disponible.');
	}

	if (!isHttps) {
		return {
			issues,
			passed,
			hasRobotsTxt: robots.ok,
			hasSitemap: sitemap.ok,
			hasLlmsTxt: llms.ok,
			hasSecurityTxt: securityTxt.ok
		};
	}

	return {
		issues,
		passed,
		hasRobotsTxt: robots.ok,
		hasSitemap: sitemap.ok,
		hasLlmsTxt: llms.ok,
		hasSecurityTxt: securityTxt.ok
	};
}

async function analyzeSensitivePaths(
	origin: string,
	isSpa = false
): Promise<{ issues: AuditIssue[]; passed: string[] }> {
	const checks = await Promise.all(
		SENSITIVE_PATHS.map((path) =>
			fetchResourceIfAvailable(`${origin}${path}`, 3000, 'sensitive').then((result) => ({
				path,
				result
			}))
		)
	);
	// SPAs (Vercel, Netlify, GitHub Pages...) devuelven HTTP 200 con text/html para cualquier ruta.
	// Un archivo sensible real (.env, .git/config...) nunca sirve text/html → filtrar estos falsos positivos.
	const exposed = checks.filter(({ result }) => {
		if (!result.ok || result.bytes <= 20) return false;
		const isHtmlFallback = result.contentType.includes('text/html');
		if (isHtmlFallback && isSpa) return false;
		return true;
	});
	const issues: AuditIssue[] = [];
	const passed: string[] = [];

	for (const { path, result } of exposed) {
		const isHighRisk = /\.env|\.git|backup|database|\.sql|phpinfo/i.test(path);
		issues.push(
			issue(
				'security.sensitive-path',
				path.includes('/admin') || path.includes('/staging') || path.includes('/test')
					? 'delivery'
					: 'security',
				isHighRisk ? 'critical' : 'warning',
				isHighRisk ? 'Ruta sensible expuesta' : 'Ruta de trabajo accesible',
				isHighRisk
					? 'Archivos de entorno, backups o configuracion publica pueden exponer secretos o estructura interna.'
					: 'Rutas de admin, staging o test publicas pueden confundir usuarios o revelar partes no terminadas.',
				isHighRisk
					? 'Bloquea esa ruta en hosting/CDN y retira el archivo del directorio publico.'
					: 'Protege, redirige o elimina rutas que no deban estar publicas.',
				`${path} - HTTP ${result.status}`
			)
		);
	}

	if (!exposed.length) {
		passed.push('No se detectan rutas sensibles habituales expuestas.');
	}

	return { issues, passed };
}

async function analyzeHttpMethods(
	origin: string
): Promise<{ issues: AuditIssue[]; passed: string[] }> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 3000);
	try {
		const response = await fetchWithSafeRedirects(
			origin,
			{ method: 'OPTIONS', signal: controller.signal },
			1
		);
		const allow = cleanHeader(response.headers.get('allow'));
		if (/\b(TRACE|PUT|DELETE)\b/i.test(allow)) {
			return {
				issues: [
					issue(
						'security.http-methods',
						'security',
						'warning',
						'Metodos HTTP sensibles anunciados',
						'Si el servidor acepta metodos innecesarios aumenta superficie de ataque.',
						'Permite solo GET, HEAD, POST y OPTIONS cuando sean necesarios.',
						`Allow: ${allow}`
					)
				],
				passed: []
			};
		}
		return {
			issues: [],
			passed: allow ? [`Metodos HTTP anunciados sin metodos sensibles: ${allow}.`] : []
		};
	} catch {
		return { issues: [], passed: [] };
	} finally {
		clearTimeout(timer);
	}
}

async function analyzeResourcesAndLinks(
	snapshot: FetchSnapshot,
	isSpa = false,
	notFoundProbe?: { status: number; bytes: number; url: string; contentType: string }
): Promise<{
	issues: AuditIssue[];
	passed: string[];
	resourceCount: number;
	resourceErrors: number;
	brokenInternalLinks: number;
	estimatedResourceBytes: number;
	hasCustom404: boolean;
}> {
	const base = new URL(snapshot.url);
	const html = snapshot.html;
	const resourceTags = [
		...getTags(html, 'script').filter((tag) => getAttr(tag, 'src')),
		...getTags(html, 'link').filter(
			(tag) => /stylesheet|preload|icon/i.test(getAttr(tag, 'rel')) && getAttr(tag, 'href')
		),
		...getTags(html, 'img').filter((tag) => getAttr(tag, 'src'))
	];
	const ogImage =
		metaContent(html, 'property', 'og:image') || metaContent(html, 'name', 'og:image');
	const twitterImage = metaContent(html, 'name', 'twitter:image');
	const socialImageUrls = [ogImage, twitterImage].filter(Boolean);

	const resourceTargets = uniqueValues([
		...resourceTags
			.map((tag) => {
				const raw = assetUrlFromTag(tag);
				try {
					const parsed = new URL(raw, base);
					return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
				} catch {
					return '';
				}
			})
			.filter(Boolean),
		...socialImageUrls
			.map((url) => {
				try {
					const parsed = new URL(url, base);
					return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
				} catch {
					return '';
				}
			})
			.filter(Boolean)
	]).slice(0, 28);
	const resourceChecks = await Promise.all(
		resourceTargets.map((url) => {
			const tag = resourceTags.find((item) => {
				try {
					return new URL(assetUrlFromTag(item), base).toString() === url;
				} catch {
					return false;
				}
			});
			return fetchResourceIfAvailable(url, 3500, tag ? resourceKindFromTag(tag) : 'link');
		})
	);

	const internalLinkTargets = uniqueValues(
		getTags(html, 'a')
			.map((anchor) => sameOriginHttpUrl(getAttr(anchor, 'href'), base))
			.filter((url): url is string => Boolean(url))
			.filter((url) => {
				const parsed = new URL(url);
				return parsed.pathname !== base.pathname || parsed.search !== base.search;
			})
	).slice(0, 18);
	const linkChecks = await Promise.all(
		internalLinkTargets.map((url) => fetchResourceIfAvailable(url, 3500, 'link'))
	);
	const notFoundCheck =
		notFoundProbe ??
		(await fetchResourceIfAvailable(
			`${base.origin}/__mv-audit-${Date.now()}-404`,
			3500,
			'notFound'
		));

	const failedResources = resourceChecks.filter((item) => item.status >= 400 || item.status === 0);
	const brokenLinks = linkChecks.filter((item) => item.status >= 400 || item.status === 0);
	const estimatedResourceBytes = resourceChecks.reduce((sum, item) => sum + item.bytes, 0);
	const largeResource = resourceChecks.find((item) => item.bytes > 1_200_000);
	const issues: AuditIssue[] = [];
	const passed: string[] = [];

	if (failedResources.length) {
		issues.push(
			issue(
				'delivery.resource-errors',
				'delivery',
				'warning',
				'Recursos con error',
				'JS, CSS o imagenes que fallan generan una web rota o incompleta.',
				'Corrige rutas, assets eliminados, permisos o dominios externos caidos.',
				failedResources
					.slice(0, 3)
					.map((item) => `${item.status || 'timeout'} ${item.url}`)
					.join(' | ')
			)
		);
	} else if (resourceChecks.length) {
		passed.push('Recursos principales sin errores HTTP.');
	}

	if (brokenLinks.length) {
		issues.push(
			issue(
				'seo.broken-links',
				'seo',
				'warning',
				'Enlaces internos rotos',
				'Los enlaces 404 perjudican rastreo, confianza y experiencia de usuario.',
				'Actualiza o elimina enlaces internos que ya no existen.',
				brokenLinks
					.slice(0, 3)
					.map((item) => `${item.status || 'timeout'} ${item.url}`)
					.join(' | ')
			)
		);
	}

	if (estimatedResourceBytes > 3_500_000) {
		issues.push(
			issue(
				'performance.resource-weight',
				'performance',
				'warning',
				'Peso de recursos elevado',
				'Muchos assets o assets pesados empeoran carga real, sobre todo en movil.',
				'Comprime imagenes, elimina scripts y carga recursos bajo demanda.',
				formatBytes(estimatedResourceBytes)
			)
		);
	}

	if (largeResource) {
		issues.push(
			issue(
				'performance.large-resource',
				'performance',
				'info',
				'Recurso individual muy pesado',
				'Un unico asset enorme puede retrasar la pagina aunque el resto este bien.',
				'Genera versiones optimizadas, usa formatos modernos y carga diferida.',
				`${formatBytes(largeResource.bytes)} - ${largeResource.url}`
			)
		);
	}

	if (notFoundCheck.status === 200 && !isSpa) {
		issues.push(
			issue(
				'delivery.soft-404',
				'delivery',
				'warning',
				'Posible 404 blando',
				'Una ruta inexistente responde 200, lo que puede confundir buscadores y usuarios.',
				'Devuelve HTTP 404 real para paginas no encontradas.',
				notFoundCheck.url
			)
		);
	} else if (notFoundCheck.status === 404 && notFoundCheck.bytes > 500) {
		passed.push('404 personalizada detectada.');
	} else if (notFoundCheck.status === 200 && isSpa) {
		passed.push('404 personalizada detectada.');
	}

	return {
		issues,
		passed,
		resourceCount: resourceChecks.length,
		resourceErrors: failedResources.length,
		brokenInternalLinks: brokenLinks.length,
		estimatedResourceBytes,
		hasCustom404: notFoundCheck.status === 404 && notFoundCheck.bytes > 500
	};
}

async function analyzeWordPressInternal(origin: string, html: string): Promise<AuditIssue[]> {
	const [
		wpJson,
		wpUsers,
		xmlrpc,
		readme,
		license,
		wpLogin,
		wpAdmin,
		pluginsDir,
		uploadsDir,
		themesDir
	] = await Promise.all([
		fetchTextIfAvailable(`${origin}/wp-json/`, 8000),
		fetchTextIfAvailable(`${origin}/wp-json/wp/v2/users`, 8000),
		fetchTextIfAvailable(`${origin}/xmlrpc.php`, 8000),
		fetchTextIfAvailable(`${origin}/readme.html`, 8000),
		fetchTextIfAvailable(`${origin}/license.txt`, 8000),
		fetchTextIfAvailable(`${origin}/wp-login.php`, 8000),
		fetchTextIfAvailable(`${origin}/wp-admin/`, 8000),
		fetchTextIfAvailable(`${origin}/wp-content/plugins/`, 8000),
		fetchTextIfAvailable(`${origin}/wp-content/uploads/`, 8000),
		fetchTextIfAvailable(`${origin}/wp-content/themes/`, 8000)
	]);
	const plugins = detectWordPressPlugins(html);
	const themes = uniqueValues(
		[...html.matchAll(/\/wp-content\/themes\/([^/?"'#]+)/gi)].map((match) => match[1])
	).slice(0, 8);
	const version = detectWordPressVersion(html, readme.text);
	const hasDirectoryListing = [pluginsDir, uploadsDir, themesDir].some(
		(result) => result.ok && /<title>\s*Index of|Parent Directory/i.test(result.text)
	);
	const issues: AuditIssue[] = [
		issue(
			'quality.wordpress-detected',
			'cms',
			'info',
			'WordPress detectado',
			'Conviene revisar versión, plugins, caché, seguridad y actualizaciones antes de entregar.',
			'Comprueba que core, tema y plugins estén actualizados y que no haya información innecesaria expuesta.'
		)
	];
	if (wpJson.ok) {
		issues.push(
			issue(
				'security.wp-json',
				'cms',
				'info',
				'wp-json está accesible',
				'Es normal en WordPress, pero puede exponer usuarios, plugins o endpoints según configuración.',
				'Revisa que no exponga información sensible y limita endpoints si el proyecto no los necesita.'
			)
		);
	}
	if (wpUsers.ok && /"slug"|"name"|"id"/i.test(wpUsers.text)) {
		issues.push(
			issue(
				'cms.wp-users',
				'cms',
				'warning',
				'Usuarios WordPress expuestos por REST',
				'Enumerar usuarios facilita ataques de fuerza bruta o phishing.',
				'Limita el endpoint de usuarios o evita exponer slugs innecesarios.',
				'/wp-json/wp/v2/users'
			)
		);
	}
	if (version) {
		issues.push(
			issue(
				'cms.wp-version',
				'cms',
				'warning',
				'Version de WordPress visible',
				'Exponer version facilita localizar vulnerabilidades conocidas si no esta actualizado.',
				'Oculta generadores/versiones y manten core, tema y plugins al dia.',
				`WordPress ${version}`
			)
		);
	}
	if (plugins.length) {
		issues.push(
			issue(
				'cms.wp-plugins',
				'cms',
				'info',
				'Plugins WordPress detectables',
				'Las rutas publicas permiten inferir plugins y priorizar ataques sobre extensiones vulnerables.',
				'Manten plugins actualizados y elimina los que no sean imprescindibles.',
				plugins.join(', ')
			)
		);
	}
	if (themes.length) {
		issues.push(
			issue(
				'cms.wp-theme',
				'cms',
				'info',
				'Tema WordPress detectable',
				'No siempre es un problema, pero ayuda a perfilar la instalacion.',
				'Manten el tema actualizado y evita exponer archivos innecesarios.',
				themes.join(', ')
			)
		);
	}
	if (xmlrpc.ok || xmlrpc.status === 405) {
		issues.push(
			issue(
				'security.xmlrpc',
				'cms',
				'warning',
				'xmlrpc.php responde',
				'XML-RPC puede ampliar superficie de ataque si no se usa.',
				'Desactívalo o restríngelo si no es necesario para Jetpack, apps móviles u otras integraciones.'
			)
		);
	}
	if (readme.ok || license.ok) {
		issues.push(
			issue(
				'cms.public-files',
				'cms',
				'info',
				'Archivos publicos de WordPress detectados',
				'readme.html o license.txt pueden dar pistas de version o instalacion.',
				'Eliminalos o bloquealos si no aportan nada publico.',
				[readme.ok ? 'readme.html' : '', license.ok ? 'license.txt' : ''].filter(Boolean).join(', ')
			)
		);
	}
	if (wpLogin.ok) {
		issues.push(
			issue(
				'cms.wp-login',
				'cms',
				'info',
				'Login WordPress accesible',
				'Es normal, pero conviene protegerlo si la web recibe ataques o no necesita login publico.',
				'Usa limite de intentos, 2FA, captcha o proteccion por proveedor.'
			)
		);
	}
	if (wpAdmin.ok || [301, 302, 401, 403].includes(wpAdmin.status)) {
		issues.push(
			issue(
				'cms.wp-admin',
				'cms',
				'info',
				'wp-admin responde',
				'Es normal en WordPress, pero conviene proteger el acceso de administracion.',
				'Usa 2FA, limite de intentos, WAF o restricciones por proveedor si procede.',
				`HTTP ${wpAdmin.status}`
			)
		);
	}
	if (hasDirectoryListing) {
		issues.push(
			issue(
				'cms.wp-directory-listing',
				'cms',
				'warning',
				'Directorio WordPress lista archivos',
				'El listado de directorios puede exponer uploads, plugins o temas.',
				'Desactiva directory listing en servidor/hosting.',
				'/wp-content/'
			)
		);
	}
	return issues;
}

export async function analyzeCms(
	origin: string,
	detectedTechs: string[],
	html: string
): Promise<AuditIssue[]> {
	const issues: AuditIssue[] = [];

	const isWordPress = detectedTechs.includes('WordPress');
	const isShopify = detectedTechs.includes('Shopify');
	const isWebflow = detectedTechs.includes('Webflow');
	const isJoomla = /joomla/i.test(html) || detectedTechs.includes('Joomla');
	const isDrupal = /drupal/i.test(html) || detectedTechs.includes('Drupal');

	if (isWordPress) {
		const wpIssues = await analyzeWordPressInternal(origin, html);
		issues.push(...wpIssues);
	}

	if (isShopify) {
		issues.push(
			issue(
				'cms.shopify-detected',
				'cms',
				'info',
				'Plataforma Shopify detectada',
				'Shopify gestiona de forma nativa la seguridad y el rendimiento básico, pero conviene optimizar apps y scripts externos.',
				'Reduce las apps de Shopify no utilizadas para evitar ralentizar la carga del script chain.'
			)
		);
	}

	if (isWebflow) {
		issues.push(
			issue(
				'cms.webflow-detected',
				'cms',
				'info',
				'Plataforma Webflow detectada',
				'Webflow ofrece un hosting estático rápido. Recuerda limpiar estilos no utilizados y configurar correctamente el plan si deseas remover badges.',
				'Elimina las clases y estilos CSS no utilizados desde el editor de Webflow para aligerar la carga de la página.'
			)
		);
		if (/w-webflow-badge/i.test(html)) {
			issues.push(
				issue(
					'cms.webflow-badge',
					'cms',
					'info',
					'Badge de marca Webflow visible',
					'La página incluye la insignia de marca Webflow en la esquina inferior.',
					'Puedes remover la insignia desactivando el badge en la configuración del sitio dentro de Webflow (requiere plan de pago).'
				)
			);
		}
	}

	if (isJoomla) {
		const admin = await fetchTextIfAvailable(`${origin}/administrator/`, 5000);
		issues.push(
			issue(
				'cms.joomla-detected',
				'cms',
				'info',
				'CMS Joomla detectado',
				'Joomla requiere actualizaciones de core y módulos de forma manual y frecuente.',
				'Asegúrate de que la carpeta /administrator/ esté protegida a nivel de servidor o IP para evitar ataques de fuerza bruta.'
			)
		);
		if (admin.ok && /joomla-form|login-form/i.test(admin.text)) {
			issues.push(
				issue(
					'cms.joomla-admin-exposed',
					'cms',
					'warning',
					'Panel de administración de Joomla accesible',
					'La ruta /administrator/ está expuesta públicamente en la URL de acceso.',
					'Protege el acceso /administrator/ utilizando una autenticación básica HTTP adicional (.htaccess) o restringe por IP.'
				)
			);
		}
	}

	if (isDrupal) {
		const userLogin = await fetchTextIfAvailable(`${origin}/user/login`, 5000);
		issues.push(
			issue(
				'cms.drupal-detected',
				'cms',
				'info',
				'CMS Drupal detectado',
				'Drupal es una plataforma CMS compleja y robusta; vigila la aplicación de parches de seguridad (Drupal security advisories).',
				'Configura módulos de caché avanzados (como Redis o Varnish) y purga módulos no utilizados.'
			)
		);
		if (userLogin.ok && /drupal-user-login|form-id/i.test(userLogin.text)) {
			issues.push(
				issue(
					'cms.drupal-login-exposed',
					'cms',
					'info',
					'Formulario de login de Drupal accesible',
					'El formulario de inicio de sesión (/user/login) está visible públicamente.',
					'Valora mover o proteger con CAPTCHA el acceso administrativo para mitigar ataques de fuerza bruta.'
				)
			);
		}
	}

	return issues;
}

export function computeDeliveryVerdict(issues: AuditIssue[]): DeliveryVerdict {
	if (issues.some((item) => item.severity === 'critical')) return 'block';
	if (issues.some((item) => item.severity === 'warning')) return 'review';
	return 'ready';
}

export function scoreCategoryFromIssues(issues: AuditIssue[], baseScore = 100): number {
	const penalty = issues.reduce((sum, item) => {
		if (item.severity === 'critical') return sum + 24;
		if (item.severity === 'warning') return sum + 10;
		if (item.severity === 'info') return sum + 2;
		return sum;
	}, 0);
	return Math.max(0, Math.min(100, baseScore - penalty));
}

function buildCategories(
	issues: AuditIssue[],
	baseScores?: Partial<Record<AuditCategoryId, number>>
): AuditCategory[] {
	return (Object.keys(CATEGORY_LABELS) as AuditCategoryId[]).map((id) => {
		const categoryIssues = issues.filter((item) => item.category === id);
		const baseScore = baseScores?.[id] ?? 100;
		return {
			id,
			label: CATEGORY_LABELS[id],
			score: scoreCategoryFromIssues(categoryIssues, baseScore),
			issues: categoryIssues
		};
	});
}

function dedupeIssues(issues: AuditIssue[]): AuditIssue[] {
	const seen = new Set<string>();
	return issues.filter((item) => {
		const key = `${item.id}:${item.category}:${item.evidence ?? ''}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

export async function auditPublicWebsite(
	inputUrl: string,
	options: {
		timeoutMs?: number;
		baseScores?: Partial<Record<AuditCategoryId, number>>;
		extraIssues?: AuditIssue[];
	} = {}
): Promise<PublicWebAudit> {
	if (!isAllowedPublicAuditUrl(inputUrl)) {
		throw new Error('AUDIT_TARGET_NOT_ALLOWED');
	}
	const timeoutMs = options.timeoutMs ?? 18000;
	const snapshot = await fetchMainDocument(inputUrl, timeoutMs);
	const finalUrl = new URL(snapshot.url);
	if (!isAllowedPublicAuditUrl(finalUrl.toString())) {
		throw new Error('AUDIT_TARGET_NOT_ALLOWED');
	}
	const headerAudit = analyzeHeaders(snapshot, inputUrl);
	const htmlAudit = analyzeHtml(snapshot);
	const seoAudit = analyzeSeoTechnical(snapshot);
	const aiAudit = analyzeAiReadiness(snapshot);
	const accessibilityAudit = analyzeAccessibilityBasics(snapshot);
	const performanceAudit = analyzePerformanceStructure(snapshot);
	const privacyAudit = analyzePrivacyLegal(snapshot);
	const deliveryAudit = analyzeDeliveryQuality(snapshot);
	const trustAudit = analyzeCommercialTrust(snapshot);
	// Detecta SPA antes del análisis paralelo: una SPA devuelve HTTP 200 con HTML para rutas arbitrarias.
	// Esto evita falsos positivos en rutas sensibles y en el check de 404 blando.
	const spaProbeCheck = await fetchResourceIfAvailable(
		`${finalUrl.origin}/__mv-spa-probe-${Date.now()}`,
		3000,
		'notFound'
	);
	const isSpa = spaProbeCheck.ok && spaProbeCheck.contentType.includes('text/html');

	const [sideFiles, sensitiveAudit, methodAudit, resourceAudit, visualAudit] = await Promise.all([
		analyzeSideFiles(finalUrl.origin, finalUrl.protocol === 'https:'),
		analyzeSensitivePaths(finalUrl.origin, isSpa),
		analyzeHttpMethods(finalUrl.origin),
		analyzeResourcesAndLinks(snapshot, isSpa, {
			status: spaProbeCheck.status,
			bytes: spaProbeCheck.bytes,
			url: spaProbeCheck.url,
			contentType: spaProbeCheck.contentType
		}),
		auditVisualWebsite(finalUrl.toString(), { timeoutMs: Math.min(20_000, timeoutMs) }).catch(
			(error) => ({
				available: false,
				issues: [
					issue(
						'delivery.visual-audit-unavailable',
						'delivery',
						'info',
						'Auditoria visual no disponible',
						'Los checks con navegador real no se han podido ejecutar en este entorno.',
						'El informe HTML/cabeceras sigue siendo valido; activa Chromium serverless para sumar revision visual.',
						error instanceof Error ? error.message : 'Error desconocido'
					)
				],
				passed: [],
				signals: visualAuditUnavailableSignals(
					error instanceof Error ? error.message : 'Error desconocido'
				)
			})
		)
	]);
	const detectedTechnologies = detectTechnologies(snapshot);
	const cmsIssues = await analyzeCms(finalUrl.origin, detectedTechnologies, snapshot.html);
	const wordPressPlugins = detectWordPressPlugins(snapshot.html);
	const issues = dedupeIssues([
		...(options.extraIssues ?? []),
		...headerAudit.issues,
		...htmlAudit.issues,
		...seoAudit.issues,
		...aiAudit.issues,
		...accessibilityAudit.issues,
		...performanceAudit.issues,
		...privacyAudit.issues,
		...deliveryAudit.issues,
		...trustAudit.issues,
		...sideFiles.issues,
		...sensitiveAudit.issues,
		...methodAudit.issues,
		...resourceAudit.issues,
		...visualAudit.issues,
		...cmsIssues
	]);
	const categories = buildCategories(issues, options.baseScores);
	const overallScore = Math.round(
		categories.reduce((sum, category) => sum + category.score, 0) / categories.length
	);

	return {
		finalUrl: finalUrl.toString(),
		overallScore,
		verdict: computeDeliveryVerdict(issues),
		categories,
		issues,
		passedChecks: [
			...headerAudit.passed,
			...htmlAudit.passed,
			...seoAudit.passed,
			...aiAudit.passed,
			...accessibilityAudit.passed,
			...performanceAudit.passed,
			...privacyAudit.passed,
			...deliveryAudit.passed,
			...trustAudit.passed,
			...sideFiles.passed,
			...sensitiveAudit.passed,
			...methodAudit.passed,
			...resourceAudit.passed,
			...visualAudit.passed
		],
		signals: {
			isHttps: finalUrl.protocol === 'https:',
			redirectsToHttps: new URL(inputUrl).protocol === 'http:' && finalUrl.protocol === 'https:',
			hasRobotsTxt: sideFiles.hasRobotsTxt,
			hasSitemap: sideFiles.hasSitemap,
			hasLlmsTxt: sideFiles.hasLlmsTxt,
			hasSecurityTxt: sideFiles.hasSecurityTxt,
			...htmlAudit.signals,
			responseTimeMs: snapshot.responseTimeMs,
			resourceCount: resourceAudit.resourceCount,
			resourceErrors: resourceAudit.resourceErrors,
			brokenInternalLinks: resourceAudit.brokenInternalLinks,
			estimatedResourceBytes: resourceAudit.estimatedResourceBytes,
			detectedTechnologies,
			wordPressPlugins,
			hasCustom404: resourceAudit.hasCustom404,
			...visualAudit.signals
		}
	};
}

export { isAllowedPublicAuditUrl } from './ip-validator.ts';
