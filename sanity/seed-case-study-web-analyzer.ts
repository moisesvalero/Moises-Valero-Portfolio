import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.web-analyzer',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 15,
		title: 'Web Analyzer',
		titleEn: 'Web Analyzer',
		slug: { _type: 'slug', current: 'web-analyzer' },
		seoDescription:
			'Web Analyzer: auditoría web con SvelteKit y Playwright — SEO, seguridad HTTP, WCAG, cookies, CMS y prompts de reparación con IA. Anti-SSRF, rate limiting y despliegue en Vercel.',
		seoDescriptionEn:
			'Web Analyzer: SvelteKit + Playwright web audit tool for SEO, HTTP security, WCAG, cookies, CMS fingerprinting, and AI repair prompts. Anti-SSRF, rate limiting, and Vercel deployment.',
		heroTag: 'Proyecto personal · Herramienta SaaS-lite',
		heroTagEn: 'Personal project · SaaS-lite tool',
		heroDescription:
			'Consola de auditoría web con estética de laboratorio técnico: más de 30 comprobaciones en 10 bloques (SEO/AEO, cabeceras, accesibilidad, cookies, CMS, consola JS y viewports) con informe accionable y prompts listos para copiar a tu agente de IA.',
		heroDescriptionEn:
			'A technical lab-style web audit console: 30+ checks across 10 sections (SEO/AEO, headers, accessibility, cookies, CMS, JS console, and viewports) with actionable reports and copy-ready prompts for your AI agent.',
		tags: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Playwright',
			'SEO',
			'WCAG',
			'Vercel'
		],
		tagsEn: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Playwright',
			'SEO',
			'WCAG',
			'Vercel'
		],
		images: {
			principal: '/imagenes/web-analyzer-home.png',
			secondary1: '/imagenes/web-analyzer-mobile.png',
			secondary2: '/imagenes/web-analyzer-report.png'
		},
		metrics: [
			metric('30+', 'comprobaciones tecnicas', 0),
			metric('10', 'bloques de auditoria', 1),
			metric('3', 'capas anti-abuso (SSRF/OOM/rate)', 2),
			metric('IA', 'prompts de reparacion por hallazgo', 3)
		],
		metricsEn: [
			metric('30+', 'technical checks', 0),
			metric('10', 'audit sections', 1),
			metric('3', 'abuse-protection layers (SSRF/OOM/rate)', 2),
			metric('AI', 'repair prompts per finding', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Quería una herramienta propia para auditar sitios reales — la mía y la de clientes potenciales — sin depender solo de Lighthouse en DevTools. Hacía falta cubrir <strong>SEO técnico, AEO, seguridad visible, WCAG, cookies pre-consentimiento y fingerprinting de CMS</strong> en un solo flujo, con resultados que un humano o una IA pudieran actuar al día siguiente.</p><p>Además, al exponerlo en Internet como API pública, el motor debía resistir SSRF, descargas gigantes y abuso por IP sin montar infraestructura pesada.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>I wanted my own tool to audit real websites — mine and prospective clients' — without relying only on Lighthouse in DevTools. It had to cover <strong>technical SEO, AEO, visible security, WCAG, pre-consent cookies, and CMS fingerprinting</strong> in one flow, with results a human or AI could act on the next day.</p><p>Because it would be exposed on the public internet as an API, the engine also had to resist SSRF, oversized downloads, and IP abuse without heavy infrastructure.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Motor de auditoría:</strong> arquitectura SvelteKit con jobs asíncronos (202 + polling), auditor de entrega HTTP y auditor visual con Chromium/Playwright: consola JS, viewports móvil/tablet/desktop, cookies y accesibilidad.</p><p><strong>Seguridad operativa:</strong> validación anti-SSRF (loopback, RFC1918, IPs codificadas), límites de bytes en respuestas (4 MB HTML / 2 MB recursos) y rate limiting por IP (10 análisis/hora) con persistencia en fichero temporal.</p><p><strong>Producto publicado:</strong> UI estilo consola técnica en <a href="https://web-analyzer-three.vercel.app" rel="noopener noreferrer">web-analyzer-three.vercel.app</a>, modo reparación con prompts por hallazgo, envío de informes por email vía Resend y una variante integrada en el portfolio.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Audit engine:</strong> SvelteKit architecture with async jobs (202 + polling), HTTP delivery auditor, and visual auditor with Chromium/Playwright: JS console, mobile/tablet/desktop viewports, cookies, and accessibility.</p><p><strong>Operational security:</strong> anti-SSRF validation (loopback, RFC1918, encoded IPs), byte limits on responses (4 MB HTML / 2 MB resources), and per-IP rate limiting (10 analyses/hour) with file-based persistence.</p><p><strong>Shipped product:</strong> technical console UI at <a href="https://web-analyzer-three.vercel.app" rel="noopener noreferrer">web-analyzer-three.vercel.app</a>, repair mode with per-finding prompts, email reports via Resend, plus an integrated variant on the portfolio.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Una herramienta que despliego como <strong>producto standalone</strong> y reutilizo como auditor antes de entregar proyectos web. No sustituye un pentest, pero condensa en minutos señales que suelen tardar horas en revisar a mano.</p><p>Proyecto personal que demuestra backend serverless serio en SvelteKit, pensamiento de seguridad y UX orientada a desarrolladores y equipos que ya trabajan con agentes de IA para corregir hallazgos.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A tool I ship as a <strong>standalone product</strong> and reuse as a real auditor before delivering web projects. It does not replace a pentest, but it compresses into minutes signals that often take hours to review manually.</p><p>A personal project that shows serious SvelteKit serverless backend work, security thinking, and UX aimed at developers and teams already using AI agents to fix findings.</p>`
		},
		stack: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Playwright',
			'Chromium',
			'Vitest',
			'Resend',
			'Vercel Serverless',
			'oxlint',
			'Zod'
		],
		stackEn: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Playwright',
			'Chromium',
			'Vitest',
			'Resend',
			'Vercel Serverless',
			'oxlint',
			'Zod'
		],
		liveUrl: 'https://web-analyzer-three.vercel.app',
		repoUrl: 'https://github.com/moisesvalero/web-analyzer',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study web-analyzer cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando web-analyzer en Sanity:', error);
	process.exit(1);
});
