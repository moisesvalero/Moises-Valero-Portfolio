import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

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
	};
};

type FetchSnapshot = {
	url: string;
	status: number;
	headers: Headers;
	html: string;
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
	trust: 'Confianza comercial',
	delivery: 'Entrega'
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
	const matches = html.match(new RegExp(`<${tagName}\\b[^>]*(?:>[\\s\\S]*?<\\/${tagName}>|\\/?>)`, 'gi'));
	return matches ?? [];
}

function getAttr(tag: string, name: string): string {
	const escaped = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	const match = tag.match(new RegExp(`\\s${escaped}\\s*=\\s*(["'])(.*?)\\1`, 'i')) ?? tag.match(new RegExp(`\\s${escaped}\\s*=\\s*([^\\s>]+)`, 'i'));
	return (match?.[2] ?? match?.[1] ?? '').trim();
}

function tagHasAttr(tag: string, name: string): boolean {
	return new RegExp(`\\s${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:\\s*=|\\s|>|/)`, 'i').test(tag);
}

function tagText(html: string, tagName: string): string {
	const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
	return match?.[1] ? decodeHtmlText(match[1]) : '';
}

function allText(html: string): string {
	return decodeHtmlText(
		html
			.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
			.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
			.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
	);
}

function metaContent(html: string, key: 'name' | 'property', value: string): string {
	const tag = getTags(html, 'meta').find((item) => getAttr(item, key).toLowerCase() === value.toLowerCase());
	return tag ? getAttr(tag, 'content') : '';
}

function canonicalHref(html: string): string {
	const tag = getTags(html, 'link').find((item) => /\bcanonical\b/i.test(getAttr(item, 'rel')));
	return tag ? getAttr(tag, 'href') : '';
}

function scriptBody(scriptTag: string): string {
	return scriptTag.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
}

function isLikelyExternalUrl(value: string, base: URL): boolean {
	if (!value || value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('mailto:') || value.startsWith('tel:')) {
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
	return anchors.some((tag) => /\/wp-(?:admin|login\.php|json)(?:\/|\?|$)/i.test(getAttr(tag, 'href')));
}

function analyzeAccessibilityBasics(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const html = snapshot.html;
	const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
	const lang = getAttr(htmlTag, 'lang');
	const images = getTags(html, 'img');
	const buttons = getTags(html, 'button');
	const inputs = getTags(html, 'input').filter((input) => !['hidden', 'submit', 'button', 'reset'].includes(getAttr(input, 'type').toLowerCase()));
	const labels = getTags(html, 'label');
	const hTags = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]));
	const imagesWithoutAlt = images.filter((img) => !tagHasAttr(img, 'alt')).length;
	const emptyButtons = buttons.filter((button) => !decodeHtmlText(button).trim() && !getAttr(button, 'aria-label') && !getAttr(button, 'title')).length;
	const unlabeledInputs = inputs.filter((input) => {
		const id = getAttr(input, 'id');
		const hasLabelFor = id && labels.some((label) => getAttr(label, 'for') === id);
		return !hasLabelFor && !getAttr(input, 'aria-label') && !getAttr(input, 'aria-labelledby');
	}).length;
	const skippedHeading = hTags.some((level, index) => index > 0 && level - hTags[index - 1] > 1);

	if (!lang) {
		issues.push(issue('accessibility.lang', 'accessibility', 'warning', 'Falta atributo lang', 'Los lectores de pantalla necesitan conocer el idioma principal.', 'Anade lang="es" o el idioma correspondiente en la etiqueta html.'));
	} else {
		passed.push('Idioma principal declarado.');
	}
	if (imagesWithoutAlt > 0) {
		issues.push(issue('accessibility.image-alt', 'accessibility', 'warning', 'Hay imagenes sin alt', 'Los lectores de pantalla y buscadores pierden contexto.', 'Anade alt descriptivo o alt vacio en imagenes decorativas.', `${imagesWithoutAlt} imagenes`));
	}
	if (emptyButtons > 0) {
		issues.push(issue('accessibility.button-name', 'accessibility', 'critical', 'Hay botones sin nombre accesible', 'Un usuario con lector de pantalla no sabra que accion ejecutan.', 'Anade texto visible, aria-label o aria-labelledby.', `${emptyButtons} botones`));
	}
	if (unlabeledInputs > 0) {
		issues.push(issue('accessibility.input-label', 'accessibility', 'critical', 'Hay campos de formulario sin label', 'Los formularios quedan confusos para lectores de pantalla y autocompletado.', 'Asocia cada input con label, aria-label o aria-labelledby.', `${unlabeledInputs} campos`));
	}
	if (skippedHeading) {
		issues.push(issue('accessibility.heading-order', 'accessibility', 'info', 'Jerarquia de headings salta niveles', 'Saltos como H2 a H4 dificultan navegar por estructura.', 'Ordena headings de forma progresiva.'));
	}
	if (!issues.length) {
		passed.push('Accesibilidad basica automatica sin avisos prioritarios.');
	}
	return { issues, passed };
}

function analyzePerformanceStructure(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const base = new URL(snapshot.url);
	const htmlBytes = new TextEncoder().encode(snapshot.html).length;
	const scripts = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'src'));
	const stylesheets = getTags(snapshot.html, 'link').filter((link) => getAttr(link, 'rel').toLowerCase().includes('stylesheet'));
	const images = getTags(snapshot.html, 'img');
	const fonts = getTags(snapshot.html, 'link').filter((link) => /font/i.test(getAttr(link, 'as')) || /font/i.test(getAttr(link, 'href')));
	const externalHosts = new Set(
		[...scripts.map((tag) => getAttr(tag, 'src')), ...stylesheets.map((tag) => getAttr(tag, 'href')), ...images.map((tag) => getAttr(tag, 'src'))]
			.filter((url) => isLikelyExternalUrl(url, base))
			.map((url) => uniqueHost(url, base))
			.filter(Boolean)
	);
	const imagesWithoutLazy = images.filter((img) => getAttr(img, 'loading').toLowerCase() !== 'lazy' && !getAttr(img, 'fetchpriority')).length;
	const imagesWithoutSize = images.filter((img) => !getAttr(img, 'width') || !getAttr(img, 'height')).length;
	const cacheControl = cleanHeader(snapshot.headers.get('cache-control'));
	const encoding = cleanHeader(snapshot.headers.get('content-encoding'));

	if (htmlBytes > 250_000) {
		issues.push(issue('performance.html-weight', 'performance', 'warning', 'HTML muy pesado', 'Un HTML grande retrasa el primer byte util y puede indicar render excesivo.', 'Reduce HTML inicial, listas enormes o contenido duplicado.', `${Math.round(htmlBytes / 1024)} KB`));
	} else {
		passed.push('Peso HTML razonable.');
	}
	if (scripts.length > 18) {
		issues.push(issue('performance.script-count', 'performance', 'warning', 'Demasiados scripts', 'Muchos scripts aumentan bloqueo, errores y coste de mantenimiento.', 'Elimina scripts no usados y agrupa/carga bajo demanda.', `${scripts.length} scripts`));
	}
	if (stylesheets.length > 8) {
		issues.push(issue('performance.css-count', 'performance', 'info', 'Muchas hojas CSS', 'Puede haber CSS heredado o plugins cargando estilos innecesarios.', 'Revisa estilos duplicados y carga critica.', `${stylesheets.length} CSS`));
	}
	if (externalHosts.size > 8) {
		issues.push(issue('performance.third-party-hosts', 'performance', 'warning', 'Muchos dominios externos', 'Cada tercero aumenta DNS, TLS, privacidad y riesgo de fallo.', 'Conserva solo proveedores necesarios y usa preconnect si procede.', `${externalHosts.size} dominios`));
	}
	if (imagesWithoutLazy > 6) {
		issues.push(issue('performance.lazy-images', 'performance', 'info', 'Muchas imagenes sin lazy loading', 'Las imagenes fuera de viewport pueden cargar antes de tiempo.', 'Usa loading="lazy" salvo imagenes criticas del hero.', `${imagesWithoutLazy} imagenes`));
	}
	if (imagesWithoutSize > 0) {
		issues.push(issue('performance.image-dimensions', 'performance', 'info', 'Imagenes sin width/height', 'Sin dimensiones, el layout puede saltar al cargar imagenes.', 'Declara width y height o aspect-ratio estable.', `${imagesWithoutSize} imagenes`));
	}
	if (!cacheControl) {
		issues.push(issue('performance.cache-control', 'performance', 'info', 'Falta Cache-Control en HTML', 'Sin politica de cache clara puede haber cargas innecesarias o contenido obsoleto.', 'Define Cache-Control adecuado para HTML y assets.'));
	}
	if (!encoding) {
		issues.push(issue('performance.compression', 'performance', 'info', 'No se detecta compresion HTTP', 'Gzip/Brotli reducen transferencia de HTML/CSS/JS.', 'Activa Brotli o gzip en CDN/hosting.'));
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
	const ogTitle = metaContent(snapshot.html, 'property', 'og:title');
	const ogDescription = metaContent(snapshot.html, 'property', 'og:description');
	const ogImage = metaContent(snapshot.html, 'property', 'og:image');
	const twitterCard = metaContent(snapshot.html, 'name', 'twitter:card');
	const jsonLd = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'type').toLowerCase() === 'application/ld+json');

	if (!title) {
		issues.push(issue('seo.title', 'seo', 'critical', 'Falta title', 'El title es una senal basica para SEO y para la pestana del navegador.', 'Anade un title unico y descriptivo.'));
	} else if (title.length < 20 || title.length > 70) {
		issues.push(issue('seo.title-length', 'seo', 'warning', 'Title poco equilibrado', 'Un title demasiado corto o largo suele rendir peor en resultados de busqueda.', 'Ajustalo a una frase clara de unas 30-60 letras.', title));
	} else {
		passed.push('Title presente y con longitud razonable.');
	}
	if (!description) {
		issues.push(issue('seo.description', 'seo', 'warning', 'Falta meta description', 'Ayuda a controlar el resumen que puede verse en buscadores.', 'Anade una descripcion clara de la pagina.'));
	} else if (description.length < 70 || description.length > 180) {
		issues.push(issue('seo.description-length', 'seo', 'info', 'Meta description poco equilibrada', 'Una descripcion demasiado corta o larga puede perder claridad en resultados.', 'Resume la propuesta de la pagina en 120-160 caracteres.', description));
	}
	if (!canonical) {
		issues.push(issue('seo.canonical', 'seo', 'warning', 'Falta canonical', 'El canonical reduce duplicados y ayuda a consolidar senales SEO.', 'Anade link rel="canonical" con la URL final preferida.'));
	}
	if (robots.includes('noindex')) {
		issues.push(issue('seo.noindex', 'seo', 'critical', 'La pagina esta marcada como noindex', 'Google puede excluir esta URL de resultados.', 'Quita noindex si la pagina debe posicionar.', robots));
	}
	if (h1s.length !== 1) {
		issues.push(issue('seo.h1', 'seo', h1s.length === 0 ? 'critical' : 'warning', h1s.length === 0 ? 'Falta H1' : 'Hay mas de un H1', 'El H1 ayuda a entender el tema principal de la pagina.', 'Usa un unico H1 descriptivo por pagina.', `${h1s.length} H1`));
	}
	if (!ogTitle || !ogDescription || !ogImage || !twitterCard) {
		issues.push(issue('seo.open-graph', 'seo', 'info', 'Metadatos sociales incompletos', 'Las vistas previas al compartir pueden verse pobres o incorrectas.', 'Anade og:title, og:description, og:image y twitter:card.'));
	}
	for (const script of jsonLd) {
		try {
			JSON.parse(scriptBody(script));
		} catch {
			issues.push(issue('seo.json-ld-invalid', 'seo', 'warning', 'JSON-LD invalido', 'Un JSON-LD roto puede ser ignorado por buscadores.', 'Valida el bloque JSON-LD y corrige comas, llaves o strings.'));
			break;
		}
	}
	if (!jsonLd.length) {
		issues.push(issue('seo.json-ld', 'seo', 'info', 'No hay JSON-LD', 'Los datos estructurados ayudan a explicar la pagina a buscadores.', 'Anade JSON-LD cuando tenga sentido: Organization, WebSite, Service, Article, Product o FAQ.'));
	} else {
		passed.push('JSON-LD presente.');
	}
	return { issues, passed };
}

function analyzeAiReadiness(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const text = allText(snapshot.html);
	const jsonLd = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'type').toLowerCase() === 'application/ld+json');
	const headings = [...snapshot.html.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((match) => decodeHtmlText(match[1]));
	const hasFaqText = /\b(faq|preguntas frecuentes|questions)\b/i.test(text);
	const hasAuthor = /\b(author|autor|byline|moises|moisés)\b/i.test(snapshot.html);
	const hasContact = /\b(contacto|contact|email|mailto:|linkedin)\b/i.test(snapshot.html);

	if (text.length < 700) {
		issues.push(issue('ai.thin-content', 'ai', 'warning', 'Poco contenido legible para IA', 'Los asistentes y buscadores necesitan texto suficiente para entender contexto y utilidad.', 'Anade explicaciones claras, casos, beneficios y preguntas frecuentes.', `${text.length} caracteres`));
	}
	if (headings.length < 3) {
		issues.push(issue('ai.heading-context', 'ai', 'info', 'Pocos encabezados semanticos', 'Los encabezados ayudan a fragmentar y resumir el contenido.', 'Usa H2/H3 descriptivos orientados a intencion de busqueda.'));
	}
	if (!jsonLd.length) {
		issues.push(issue('ai.structured-data', 'ai', 'warning', 'Sin datos estructurados para IA/buscadores', 'JSON-LD ayuda a identificar entidad, autor, servicio o articulo.', 'Incluye schema.org adecuado a la pagina.'));
	}
	if (!hasFaqText) {
		issues.push(issue('ai.faq', 'ai', 'info', 'No se detecta bloque de preguntas frecuentes', 'Las FAQ ayudan a cubrir dudas y respuestas citables por asistentes.', 'Anade preguntas reales si encajan con la pagina.'));
	}
	if (!hasAuthor) {
		issues.push(issue('ai.author', 'ai', 'info', 'Autor o entidad poco clara', 'La atribucion refuerza confianza y contexto para buscadores e IA.', 'Incluye autor, empresa o responsable visible.'));
	}
	if (!hasContact) {
		issues.push(issue('ai.contact-context', 'ai', 'info', 'Contacto poco visible', 'Los sistemas y usuarios necesitan entender quien esta detras y como contactar.', 'Incluye email, formulario, LinkedIn o datos de contacto.'));
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
	const hasPrivacy = /privacidad|privacy|politica de privacidad|política de privacidad/i.test(text) || anchors.some((a) => /privacidad|privacy/i.test(getAttr(a, 'href') + decodeHtmlText(a)));
	const hasCookies = /cookies|cookie policy|politica de cookies|política de cookies/i.test(text) || anchors.some((a) => /cookies/i.test(getAttr(a, 'href') + decodeHtmlText(a)));
	const hasLegal = /aviso legal|legal notice|terminos|términos|terms/i.test(text) || anchors.some((a) => /legal|terms|terminos|privacidad/i.test(getAttr(a, 'href')));
	const trackerHosts = scripts
		.map((script) => uniqueHost(getAttr(script, 'src'), base))
		.filter((host) => /google-analytics|googletagmanager|facebook|hotjar|clarity|tiktok|doubleclick|hubspot|intercom|segment|matomo/i.test(host));
	const formsWithoutLegal = forms.filter((form) => !/privacidad|privacy|legal|consent|acepto|accept/i.test(form)).length;
	const insecureForms = forms.filter((form) => {
		const action = getAttr(form, 'action');
		return /^http:\/\//i.test(action);
	}).length;

	if (!hasPrivacy) {
		issues.push(issue('privacy.policy', 'privacy', 'warning', 'No se detecta politica de privacidad', 'Una web con formularios, analitica o contacto necesita explicar el tratamiento de datos.', 'Anade una politica de privacidad visible y enlazada.'));
	}
	if (trackerHosts.length && !hasCookies) {
		issues.push(issue('privacy.cookies', 'privacy', 'warning', 'Hay tracking pero no se detecta politica de cookies', 'Scripts de medicion o marketing pueden requerir informacion y consentimiento.', 'Anade politica/gestion de cookies ajustada al uso real.', [...new Set(trackerHosts)].join(', ')));
	}
	if (!hasLegal) {
		issues.push(issue('privacy.legal-notice', 'privacy', 'info', 'No se detecta aviso legal o terminos', 'En webs comerciales suele ser una senal basica de confianza y cumplimiento.', 'Incluye aviso legal, terminos o datos del responsable si aplica.'));
	}
	if (formsWithoutLegal > 0) {
		issues.push(issue('privacy.form-consent', 'privacy', 'warning', 'Formularios sin referencia legal visible', 'El usuario deberia saber que pasa con sus datos antes de enviarlos.', 'Incluye texto legal, checkbox o enlace a privacidad junto al formulario.', `${formsWithoutLegal} formularios`));
	}
	if (insecureForms > 0) {
		issues.push(issue('privacy.insecure-form-action', 'privacy', 'critical', 'Formulario envia a HTTP', 'Los datos enviados podrian viajar sin cifrar.', 'Cambia el action del formulario a HTTPS.', `${insecureForms} formularios`));
	}
	if (!issues.length) {
		passed.push('Privacidad/legal basica sin avisos automaticos.');
	}
	return { issues, passed };
}

function analyzeDeliveryQuality(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
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
	const placeholderText = /\b(lorem ipsum|placeholder|coming soon|prueba|test@example|example\.com)\b/i.test(allText(html));
	const debugText = /\b(console\.log|debugger;|TODO|FIXME|localhost:|127\.0\.0\.1)\b/i.test(html);
	const suspiciousExternal = [...links, ...getTags(html, 'script'), ...images]
		.map((tag) => getAttr(tag, 'href') || getAttr(tag, 'src'))
		.filter((url) => isLikelyExternalUrl(url, base))
		.filter((url) => SUSPICIOUS_HOST_PATTERNS.some((pattern) => pattern.test(uniqueHost(url, base))));

	if (snapshot.status < 200 || snapshot.status >= 400) {
		issues.push(issue('delivery.status', 'delivery', 'critical', 'La URL no devuelve un estado correcto', 'Una pagina con error HTTP no deberia publicarse como entrega final.', 'Corrige servidor, redirecciones o ruta publicada.', `HTTP ${snapshot.status}`));
	} else {
		passed.push('Estado HTTP final correcto.');
	}
	if (!viewport) {
		issues.push(issue('delivery.viewport', 'delivery', 'critical', 'Falta viewport responsive', 'En movil la web puede verse escalada o rota.', 'Anade meta viewport width=device-width, initial-scale=1.'));
	}
	if (!favicon) {
		issues.push(issue('delivery.favicon', 'delivery', 'info', 'No se detecta favicon', 'El favicon es una senal de acabado en navegador y favoritos.', 'Incluye favicon y apple-touch-icon.'));
	}
	if (brokenHrefCount > 0) {
		issues.push(issue('delivery.empty-links', 'delivery', 'warning', 'Hay enlaces vacios o placeholder', 'Los enlaces con # o vacios suelen ser restos de desarrollo.', 'Sustituye esos enlaces por destinos reales o botones si no navegan.', `${brokenHrefCount} enlaces`));
	}
	if (placeholderText) {
		issues.push(issue('delivery.placeholder-copy', 'delivery', 'warning', 'Posible texto placeholder', 'Restos de plantilla o pruebas bajan confianza y sensacion de acabado.', 'Revisa textos de ejemplo, pruebas y contenido provisional.'));
	}
	if (debugText) {
		issues.push(issue('delivery.debug-leftovers', 'delivery', 'warning', 'Posibles restos de desarrollo', 'TODO, debug o localhost en HTML indican entrega sin limpiar.', 'Elimina trazas de desarrollo antes de publicar.'));
	}
	if (suspiciousExternal.length) {
		issues.push(issue('quality.suspicious-domain', 'quality', 'warning', 'Dominio externo sospechoso', 'Dominios de apuestas, farmacia, cripto u otros patrones pueden indicar inyeccion o dependencia peligrosa.', 'Revisa y elimina recursos externos no justificados.', suspiciousExternal[0]));
	}
	if (!issues.length) {
		passed.push('Calidad de entrega sin avisos automaticos prioritarios.');
	}
	return { issues, passed };
}

function analyzeCommercialTrust(snapshot: FetchSnapshot): { issues: AuditIssue[]; passed: string[] } {
	const issues: AuditIssue[] = [];
	const passed: string[] = [];
	const html = snapshot.html;
	const text = allText(html).toLowerCase();
	const anchors = getTags(html, 'a');
	const hasContact = /contacto|contact|mailto:|tel:|whatsapp|linkedin/i.test(html + text);
	const hasCta = /\b(contacta|contacto|solicita|reserva|comprar|empezar|hablar|llamar|ver proyecto|ver trabajos|agenda)\b/i.test(text);
	const hasSocial = anchors.some((a) => /linkedin|github|instagram|facebook|x\.com|twitter|youtube|malt|behance|dribbble/i.test(getAttr(a, 'href')));
	const hasProof = /\b(testimonio|reseña|review|cliente|caso de exito|portfolio|proyecto|trabajos|logos|certificado)\b/i.test(text);
	const hasLocation = /\b(alcoy|alicante|valencia|madrid|barcelona|spain|espana|españa|remoto|hibrido|presencial)\b/i.test(text);
	const hasEmailOrPhone = /mailto:|tel:|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(html);

	if (!hasContact || !hasEmailOrPhone) {
		issues.push(issue('trust.contact', 'trust', 'warning', 'Contacto poco claro', 'Si el usuario no encuentra contacto rapido, baja la conversion y la confianza.', 'Incluye email, formulario, telefono, LinkedIn o CTA visible.'));
	}
	if (!hasCta) {
		issues.push(issue('trust.cta', 'trust', 'info', 'No se detecta llamada a la accion clara', 'Una web puede estar bien tecnicamente y aun asi no guiar al usuario.', 'Incluye una accion principal coherente con el objetivo de la pagina.'));
	}
	if (!hasSocial) {
		issues.push(issue('trust.social-proof-links', 'trust', 'info', 'No se detectan enlaces sociales/profesionales', 'Perfiles externos pueden reforzar identidad y confianza.', 'Enlaza LinkedIn, GitHub, redes o plataformas relevantes.'));
	}
	if (!hasProof) {
		issues.push(issue('trust.proof', 'trust', 'info', 'Pocas senales de prueba o trabajos', 'Casos, testimonios, proyectos o logos ayudan a creer la propuesta.', 'Muestra ejemplos reales, resultados o pruebas de experiencia.'));
	}
	if (!hasLocation) {
		issues.push(issue('trust.location', 'trust', 'info', 'Ubicacion o ambito poco claro', 'Para servicios locales o empleo, el contexto geografico/remoto ayuda a filtrar oportunidades.', 'Indica zona, modalidad o ambito de trabajo si aplica.'));
	}
	if (!issues.length) {
		passed.push('Confianza comercial basica bien cubierta.');
	}
	return { issues, passed };
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
	const jsonLd = getTags(snapshot.html, 'script').filter((script) => getAttr(script, 'type').toLowerCase() === 'application/ld+json');
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
			issue('seo.title', 'seo', 'critical', 'Falta title', 'El title es una señal básica para SEO y para la pestaña del navegador.', 'Añade un title único y descriptivo.')
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
			issue('seo.description', 'seo', 'warning', 'Falta meta description', 'Ayuda a controlar el resumen que puede verse en buscadores.', 'Añade una descripción clara de la página.')
		);
	}

	if (!canonical) {
		issues.push(
			issue('seo.canonical', 'seo', 'warning', 'Falta canonical', 'El canonical reduce duplicados y ayuda a consolidar señales SEO.', 'Añade link rel="canonical" con la URL final preferida.')
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
			issue('seo.json-ld', 'seo', 'info', 'No hay JSON-LD', 'Los datos estructurados ayudan a explicar la página a buscadores.', 'Añade JSON-LD cuando tenga sentido: Organization, WebSite, Service, Article, Product o FAQ.')
		);
	} else {
		for (const script of jsonLd) {
			try {
				JSON.parse(scriptBody(script));
			} catch {
				issues.push(
					issue('seo.json-ld-invalid', 'seo', 'warning', 'JSON-LD inválido', 'Un JSON-LD roto puede ser ignorado por buscadores.', 'Valida el bloque JSON-LD y corrige comas, llaves o strings.')
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
		return style.includes('display:none') || style.includes('visibility:hidden') || width === '0' || height === '0';
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
				'Recursos HTTP dentro de una página HTTPS pueden bloquearse o degradar seguridad.',
				'Cambia recursos http:// por https:// o alojalos localmente.'
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

async function analyzeSideFiles(origin: string, isHttps: boolean): Promise<{
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
			issue('seo.robots', 'seo', 'info', 'robots.txt no encontrado o inválido', 'robots.txt ayuda a orientar el rastreo de buscadores.', 'Publica un robots.txt básico que apunte al sitemap.')
		);
	} else {
		passed.push('robots.txt disponible.');
	}

	if (!sitemap.ok || !/<urlset|<sitemapindex/i.test(sitemap.text)) {
		issues.push(
			issue('seo.sitemap', 'seo', 'warning', 'sitemap.xml no encontrado', 'El sitemap facilita descubrir páginas importantes.', 'Genera y publica /sitemap.xml con las URLs indexables.')
		);
	} else {
		passed.push('sitemap.xml disponible.');
	}

	if (!llms.ok || !llms.text.trim()) {
		issues.push(
			issue('ai.llms-txt', 'ai', 'info', 'llms.txt no encontrado', 'Un llms.txt ayuda a ofrecer contexto resumido a asistentes y crawlers de IA.', 'Publica /llms.txt con resumen, paginas clave y uso recomendado.')
		);
	} else {
		passed.push('llms.txt disponible.');
	}

	if (!llmsFull.ok || !llmsFull.text.trim()) {
		issues.push(
			issue('ai.llms-full', 'ai', 'info', 'llms-full.txt no encontrado', 'Una version extendida puede facilitar lectura profunda de contenido importante.', 'Publica /llms-full.txt si quieres dar mas contexto a herramientas IA.')
		);
	}

	if (!securityTxt.ok || !/contact\s*:/i.test(securityTxt.text)) {
		issues.push(
			issue('security.security-txt', 'security', 'info', 'security.txt no encontrado', 'security.txt facilita reportar vulnerabilidades de forma responsable.', 'Publica /.well-known/security.txt con Contact y politica basica.')
		);
	} else {
		passed.push('security.txt disponible.');
	}

	if (!isHttps) {
		return { issues, passed, hasRobotsTxt: robots.ok, hasSitemap: sitemap.ok, hasLlmsTxt: llms.ok, hasSecurityTxt: securityTxt.ok };
	}

	return { issues, passed, hasRobotsTxt: robots.ok, hasSitemap: sitemap.ok, hasLlmsTxt: llms.ok, hasSecurityTxt: securityTxt.ok };
}

async function analyzeWordPress(origin: string, isWordPress: boolean): Promise<AuditIssue[]> {
	if (!isWordPress) return [];
	const [wpJson, wpUsers, xmlrpc, readme, license, wpLogin] = await Promise.all([
		fetchTextIfAvailable(`${origin}/wp-json/`, 8000),
		fetchTextIfAvailable(`${origin}/wp-json/wp/v2/users`, 8000),
		fetchTextIfAvailable(`${origin}/xmlrpc.php`, 8000),
		fetchTextIfAvailable(`${origin}/readme.html`, 8000),
		fetchTextIfAvailable(`${origin}/license.txt`, 8000),
		fetchTextIfAvailable(`${origin}/wp-login.php`, 8000)
	]);
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

function buildCategories(issues: AuditIssue[], baseScores?: Partial<Record<AuditCategoryId, number>>): AuditCategory[] {
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
	const sideFiles = await analyzeSideFiles(finalUrl.origin, finalUrl.protocol === 'https:');
	const wordpressIssues = await analyzeWordPress(finalUrl.origin, htmlAudit.signals.isWordPress);
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
		...wordpressIssues
	]);
	const categories = buildCategories(issues, options.baseScores);
	const overallScore = Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);

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
			...sideFiles.passed
		],
		signals: {
			isHttps: finalUrl.protocol === 'https:',
			redirectsToHttps: new URL(inputUrl).protocol === 'http:' && finalUrl.protocol === 'https:',
			hasRobotsTxt: sideFiles.hasRobotsTxt,
			hasSitemap: sideFiles.hasSitemap,
			hasLlmsTxt: sideFiles.hasLlmsTxt,
			hasSecurityTxt: sideFiles.hasSecurityTxt,
			...htmlAudit.signals
		}
	};
}
