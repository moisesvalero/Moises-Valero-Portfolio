import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { JSDOM } from 'jsdom';

export type AuditSeverity = 'critical' | 'warning' | 'info' | 'pass';
export type AuditCategoryId = 'performance' | 'security' | 'seo' | 'accessibility' | 'quality';
export type DeliveryVerdict = 'block' | 'review' | 'ready';

export type AuditIssue = {
	id: string;
	category: AuditCategoryId;
	severity: AuditSeverity;
	title: string;
	why: string;
	fix: string;
	evidence?: string;
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
		isWordPress: boolean;
		externalScripts: number;
		internalLinks: number;
		imagesWithoutAlt: number;
	};
};

type FetchSnapshot = {
	url: string;
	status: number;
	headers: Headers;
	html: string;
};

const CATEGORY_LABELS: Record<AuditCategoryId, string> = {
	performance: 'Rendimiento',
	security: 'Seguridad',
	seo: 'SEO tecnico',
	accessibility: 'Accesibilidad',
	quality: 'Calidad visible'
};

const BLOCKED_PORTS = new Set([
	'20',
	'21',
	'22',
	'23',
	'25',
	'53',
	'110',
	'143',
	'3306',
	'5432',
	'6379',
	'8000',
	'8080',
	'9200',
	'27017'
]);

const SUSPICIOUS_HOST_PATTERNS = [
	/\bcasino\b/i,
	/\bbet\b/i,
	/\bloan\b/i,
	/\bpharma\b/i,
	/\bviagra\b/i,
	/\bcrypto\b/i,
	/\btelegram\b/i
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
	return { id, category, severity, title, why, fix, evidence };
}

function cleanHeader(value: string | null): string {
	return value?.trim() ?? '';
}

function isPrivateIp(ip: string): boolean {
	if (ip === '::1') return true;
	if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')) return true;
	if (ip.startsWith('::ffff:')) return isPrivateIp(ip.slice(7));
	const parts = ip.split('.').map((part) => Number(part));
	if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return false;
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

function hostnameLooksLocal(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return (
		host === 'localhost' ||
		host.endsWith('.localhost') ||
		host.endsWith('.local') ||
		host.endsWith('.internal') ||
		host.endsWith('.lan')
	);
}

export function isAllowedPublicAuditUrl(input: string): boolean {
	try {
		const parsed = new URL(input);
		if (!['http:', 'https:'].includes(parsed.protocol)) return false;
		if (parsed.username || parsed.password) return false;
		if (parsed.port && BLOCKED_PORTS.has(parsed.port)) return false;
		const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
		if (hostnameLooksLocal(hostname)) return false;
		if (isIP(hostname) && isPrivateIp(hostname)) return false;
		return true;
	} catch {
		return false;
	}
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

async function fetchWithSafeRedirects(inputUrl: string, init: RequestInit = {}, maxRedirects = 4): Promise<Response> {
	let current = new URL(inputUrl);
	for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
		await assertPublicNetworkTarget(current);
		const response = await fetch(current, {
			...init,
			redirect: 'manual',
			headers: {
				'user-agent': 'MoisesValeroDeliveryAuditor/1.0 (+https://moisesvalero.es/tools/analizador-web)',
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

async function fetchTextIfAvailable(url: string, timeoutMs: number): Promise<{ ok: boolean; status: number; text: string }> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetchWithSafeRedirects(url, { method: 'GET', signal: controller.signal }, 2);
		const text = await response.text().catch(() => '');
		return { ok: response.ok, status: response.status, text };
	} catch {
		return { ok: false, status: 0, text: '' };
	} finally {
		clearTimeout(timer);
	}
}

async function fetchMainDocument(url: string, timeoutMs: number): Promise<FetchSnapshot> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetchWithSafeRedirects(url, { method: 'GET', signal: controller.signal });
		const contentType = response.headers.get('content-type') ?? '';
		const html = contentType.includes('text/html') ? await response.text() : '';
		return { url: response.url || url, status: response.status, headers: response.headers, html };
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

function analyzeHeaders(snapshot: FetchSnapshot, requestedUrl: string): { issues: AuditIssue[]; passed: string[] } {
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

	if (finalUrl.protocol !== 'https:') {
		issues.push(
			issue(
				'security.https',
				'security',
				'critical',
				'La URL final no usa HTTPS',
				'Los formularios, cookies y datos del usuario quedan expuestos o generan avisos de navegador.',
				'Activa SSL y fuerza redireccion permanente de HTTP a HTTPS.',
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
				'Un visitante puede entrar por una version no segura.',
				'Configura una redireccion 301 desde HTTP a HTTPS en hosting, CDN o servidor.'
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
				'Anade Strict-Transport-Security con max-age alto cuando HTTPS este bien configurado.'
			)
		);
	} else {
		passed.push('HSTS esta presente.');
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
		passed.push('CSP esta presente.');
	}

	if (!frameOptions && !hasSecureDirective(csp, 'frame-ancestors')) {
		issues.push(
			issue(
				'security.clickjacking',
				'security',
				'warning',
				'Falta proteccion contra clickjacking',
				'Sin X-Frame-Options o frame-ancestors, otras webs podrian embeber la pagina.',
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
				'Anade X-Content-Type-Options: nosniff.'
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

	return { issues, passed };
}

function textOf(document: Document, selector: string, attr?: string): string {
	const element = document.querySelector(selector);
	if (!element) return '';
	if (attr) return element.getAttribute(attr)?.trim() ?? '';
	return element.textContent?.trim() ?? '';
}

function analyzeHtml(snapshot: FetchSnapshot): {
	issues: AuditIssue[];
	passed: string[];
	signals: Pick<PublicWebAudit['signals'], 'isWordPress' | 'externalScripts' | 'internalLinks' | 'imagesWithoutAlt'>;
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
				'Comprueba que la URL devuelve una pagina HTML publica.',
				`HTTP ${snapshot.status}`
			)
		);
		return {
			issues,
			passed,
			signals: { isWordPress: false, externalScripts: 0, internalLinks: 0, imagesWithoutAlt: 0 }
		};
	}

	const dom = new JSDOM(snapshot.html, { url: snapshot.url });
	const document = dom.window.document;
	const base = new URL(snapshot.url);
	const title = textOf(document, 'title');
	const description = textOf(document, 'meta[name="description" i]', 'content');
	const canonical = textOf(document, 'link[rel="canonical" i]', 'href');
	const h1s = [...document.querySelectorAll('h1')];
	const ogTitle = textOf(document, 'meta[property="og:title" i]', 'content');
	const ogImage = textOf(document, 'meta[property="og:image" i]', 'content');
	const jsonLd = [...document.querySelectorAll('script[type="application/ld+json" i]')];
	const images = [...document.querySelectorAll('img')];
	const imagesWithoutAlt = images.filter((img) => !img.hasAttribute('alt')).length;
	const scripts = [...document.querySelectorAll('script[src]')];
	const iframes = [...document.querySelectorAll('iframe')];
	const anchors = [...document.querySelectorAll('a[href]')];
	const internalLinks = anchors.filter((anchor) => {
		try {
			return new URL(anchor.getAttribute('href') ?? '', base).origin === base.origin;
		} catch {
			return false;
		}
	}).length;
	const externalScripts = scripts.filter((script) => {
		try {
			return new URL(script.getAttribute('src') ?? '', base).origin !== base.origin;
		} catch {
			return false;
		}
	});
	const isWordPress =
		/wp-content|wp-includes|wp-json|wordpress/i.test(snapshot.html) ||
		/wordpress/i.test(textOf(document, 'meta[name="generator" i]', 'content'));

	if (!title) {
		issues.push(
			issue('seo.title', 'seo', 'critical', 'Falta title', 'El title es una senal basica para SEO y para la pestana del navegador.', 'Anade un title unico y descriptivo.')
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
			issue('seo.description', 'seo', 'warning', 'Falta meta description', 'Ayuda a controlar el resumen que puede verse en buscadores.', 'Anade una descripcion clara de la pagina.')
		);
	}

	if (!canonical) {
		issues.push(
			issue('seo.canonical', 'seo', 'warning', 'Falta canonical', 'El canonical reduce duplicados y ayuda a consolidar senales SEO.', 'Anade link rel="canonical" con la URL final preferida.')
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

	if (!ogTitle || !ogImage) {
		issues.push(
			issue(
				'seo.open-graph',
				'seo',
				'info',
				'Open Graph incompleto',
				'Las vistas previas al compartir pueden verse pobres o incorrectas.',
				'Anade al menos og:title, og:description y og:image.'
			)
		);
	}

	if (!jsonLd.length) {
		issues.push(
			issue('seo.json-ld', 'seo', 'info', 'No hay JSON-LD', 'Los datos estructurados ayudan a explicar la pagina a buscadores.', 'Anade JSON-LD cuando tenga sentido: Organization, WebSite, Service, Article, Product o FAQ.')
		);
	} else {
		for (const script of jsonLd) {
			try {
				JSON.parse(script.textContent ?? '{}');
			} catch {
				issues.push(
					issue('seo.json-ld-invalid', 'seo', 'warning', 'JSON-LD invalido', 'Un JSON-LD roto puede ser ignorado por buscadores.', 'Valida el bloque JSON-LD y corrige comas, llaves o strings.')
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
				'Hay imagenes sin alt',
				'Los lectores de pantalla y buscadores pierden contexto.',
				'Anade alt descriptivo o alt vacio en imagenes puramente decorativas.',
				`${imagesWithoutAlt} imagenes`
			)
		);
	}

	const hiddenIframe = iframes.find((iframe) => {
		const style = iframe.getAttribute('style')?.toLowerCase() ?? '';
		const width = iframe.getAttribute('width') ?? '';
		const height = iframe.getAttribute('height') ?? '';
		return style.includes('display:none') || style.includes('visibility:hidden') || width === '0' || height === '0';
	});
	if (hiddenIframe) {
		issues.push(
			issue(
				'quality.hidden-iframe',
				'quality',
				'warning',
				'Iframe oculto detectado',
				'Los iframes ocultos pueden ser legitimos, pero tambien aparecen en inyecciones o tracking agresivo.',
				'Revisa su src y elimina cualquier iframe no justificado.',
				hiddenIframe.getAttribute('src') ?? 'iframe sin src'
			)
		);
	}

	for (const script of externalScripts) {
		const src = script.getAttribute('src') ?? '';
		const parsed = new URL(src, base);
		if (parsed.protocol !== 'https:' || SUSPICIOUS_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) {
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

	if (base.protocol === 'https:' && /\s(?:src|href)=["']http:\/\//i.test(snapshot.html)) {
		issues.push(
			issue(
				'security.mixed-content',
				'security',
				'warning',
				'Posible mixed content',
				'Recursos HTTP dentro de una pagina HTTPS pueden bloquearse o degradar seguridad.',
				'Cambia recursos http:// por https:// o alojalos localmente.'
			)
		);
	}

	const brokenHrefCount = anchors.filter((anchor) => {
		const href = anchor.getAttribute('href')?.trim() ?? '';
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

async function analyzeSideFiles(origin: string, isHttps: boolean): Promise<{
	issues: AuditIssue[];
	passed: string[];
	hasRobotsTxt: boolean;
	hasSitemap: boolean;
}> {
	const [robots, sitemap] = await Promise.all([
		fetchTextIfAvailable(`${origin}/robots.txt`, 8000),
		fetchTextIfAvailable(`${origin}/sitemap.xml`, 8000)
	]);
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	if (!robots.ok || !/user-agent\s*:/i.test(robots.text)) {
		issues.push(
			issue('seo.robots', 'seo', 'info', 'robots.txt no encontrado o invalido', 'robots.txt ayuda a orientar el rastreo de buscadores.', 'Publica un robots.txt basico que apunte al sitemap.')
		);
	} else {
		passed.push('robots.txt disponible.');
	}

	if (!sitemap.ok || !/<urlset|<sitemapindex/i.test(sitemap.text)) {
		issues.push(
			issue('seo.sitemap', 'seo', 'warning', 'sitemap.xml no encontrado', 'El sitemap facilita descubrir paginas importantes.', 'Genera y publica /sitemap.xml con las URLs indexables.')
		);
	} else {
		passed.push('sitemap.xml disponible.');
	}

	if (!isHttps) {
		return { issues, passed, hasRobotsTxt: robots.ok, hasSitemap: sitemap.ok };
	}

	return { issues, passed, hasRobotsTxt: robots.ok, hasSitemap: sitemap.ok };
}

async function analyzeWordPress(origin: string, isWordPress: boolean): Promise<AuditIssue[]> {
	if (!isWordPress) return [];
	const [wpJson, xmlrpc] = await Promise.all([
		fetchTextIfAvailable(`${origin}/wp-json/`, 8000),
		fetchTextIfAvailable(`${origin}/xmlrpc.php`, 8000)
	]);
	const issues: AuditIssue[] = [
		issue(
			'quality.wordpress-detected',
			'quality',
			'info',
			'WordPress detectado',
			'Conviene revisar version, plugins, cache, seguridad y actualizaciones antes de entregar.',
			'Comprueba que core, tema y plugins esten actualizados y que no haya informacion innecesaria expuesta.'
		)
	];
	if (wpJson.ok) {
		issues.push(
			issue(
				'security.wp-json',
				'security',
				'info',
				'wp-json esta accesible',
				'Es normal en WordPress, pero puede exponer usuarios, plugins o endpoints segun configuracion.',
				'Revisa que no exponga informacion sensible y limita endpoints si el proyecto no los necesita.'
			)
		);
	}
	if (xmlrpc.ok || xmlrpc.status === 405) {
		issues.push(
			issue(
				'security.xmlrpc',
				'security',
				'warning',
				'xmlrpc.php responde',
				'XML-RPC puede ampliar superficie de ataque si no se usa.',
				'Desactivalo o restringelo si no es necesario para Jetpack, apps moviles u otras integraciones.'
			)
		);
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

function buildCategories(issues: AuditIssue[], lighthouseScores?: Partial<Record<AuditCategoryId, number>>): AuditCategory[] {
	return (Object.keys(CATEGORY_LABELS) as AuditCategoryId[]).map((id) => {
		const categoryIssues = issues.filter((item) => item.category === id);
		const baseScore = lighthouseScores?.[id] ?? 100;
		return {
			id,
			label: CATEGORY_LABELS[id],
			score: scoreCategoryFromIssues(categoryIssues, baseScore),
			issues: categoryIssues
		};
	});
}

export async function auditPublicWebsite(
	inputUrl: string,
	options: {
		timeoutMs?: number;
		lighthouseScores?: Partial<Record<AuditCategoryId, number>>;
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
	const sideFiles = await analyzeSideFiles(finalUrl.origin, finalUrl.protocol === 'https:');
	const wordpressIssues = await analyzeWordPress(finalUrl.origin, htmlAudit.signals.isWordPress);
	const issues = [
		...(options.extraIssues ?? []),
		...headerAudit.issues,
		...htmlAudit.issues,
		...sideFiles.issues,
		...wordpressIssues
	];
	const categories = buildCategories(issues, options.lighthouseScores);
	const overallScore = Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);

	return {
		finalUrl: finalUrl.toString(),
		overallScore,
		verdict: computeDeliveryVerdict(issues),
		categories,
		issues,
		passedChecks: [...headerAudit.passed, ...htmlAudit.passed, ...sideFiles.passed],
		signals: {
			isHttps: finalUrl.protocol === 'https:',
			redirectsToHttps: new URL(inputUrl).protocol === 'http:' && finalUrl.protocol === 'https:',
			hasRobotsTxt: sideFiles.hasRobotsTxt,
			hasSitemap: sideFiles.hasSitemap,
			...htmlAudit.signals
		}
	};
}
