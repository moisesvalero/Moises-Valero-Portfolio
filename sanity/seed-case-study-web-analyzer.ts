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
		title: 'Syrax Analyzer',
		titleEn: 'Syrax Analyzer',
		slug: { _type: 'slug', current: 'web-analyzer' },
		seoDescription:
			'Syrax Analyzer: plataforma SaaS de auditoría web técnica con SvelteKit, Supabase y Stripe. Core Web Vitals, cabeceras de seguridad, accesibilidad WCAG, SEO técnico, AEO/GEO y prompts de reparación con IA.',
		seoDescriptionEn:
			'Syrax Analyzer: SaaS technical web audit platform built with SvelteKit, Supabase, and Stripe. Audits Core Web Vitals, security headers, WCAG accessibility, technical SEO, AEO/GEO, and provides AI repair prompts.',
		heroTag: 'Proyecto personal · Plataforma SaaS comercial',
		heroTagEn: 'Personal project · Commercial SaaS platform',
		heroDescription:
			'Plataforma SaaS de auditoría técnica integral para páginas web. Analiza más de 120 factores en 10 categorías críticas (SEO/AEO, accesibilidad WCAG, privacidad RGPD, seguridad HTTP y velocidad) con informes visuales y prompts de corrección listos para usar en tus agentes de IA.',
		heroDescriptionEn:
			'A comprehensive technical web audit SaaS platform. Scans 120+ checks across 10 critical categories (SEO/AEO, WCAG accessibility, GDPR privacy, HTTP security, and speed) with visual reports and copy-ready fix prompts for your AI agents.',
		tags: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Tailwind CSS v4',
			'Supabase',
			'Stripe',
			'Upstash Redis',
			'Playwright'
		],
		tagsEn: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Tailwind CSS v4',
			'Supabase',
			'Stripe',
			'Upstash Redis',
			'Playwright'
		],
		images: {
			principal: '/imagenes/web-analyzer-home.png',
			secondary1: '/imagenes/web-analyzer-mobile.png',
			secondary2: '/imagenes/web-analyzer-report.png'
		},
		metrics: [
			metric('120+', 'comprobaciones tecnicas', 0),
			metric('10', 'categorias de auditoria', 1),
			metric('Suscripcion', 'Stripe Billing y Portal', 2),
			metric('IA', 'prompts de reparacion por hallazgo', 3)
		],
		metricsEn: [
			metric('120+', 'technical checks', 0),
			metric('10', 'audit categories', 1),
			metric('Billing', 'Stripe subscription & portal', 2),
			metric('AI', 'repair prompts per finding', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Convertir mi analizador web en un <strong>SaaS comercial completo</strong> capaz de gestionar suscripciones reales y auditorías visuales profundas mediante un navegador real, sin disparar los costes de servidor.</p><p>Hacía falta integrar autenticación robusta, cobros de suscripción recurrentes y pasarela de facturación automática con Stripe, además de resolver la infraestructura necesaria para ejecutar Playwright/Chromium en la nube con aislamiento de procesos y protección estricta contra ataques de inyección y SSRF.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>Transforming my web analyzer into a <strong>fully-fledged commercial SaaS</strong> capable of handling real subscriptions and deep visual audits through a headless browser, all while keeping server costs low.</p><p>The challenge was to integrate robust authentication, recurring subscription billing, and automated invoicing via Stripe, while establishing the backend infrastructure to safely run Playwright/Chromium in the cloud with process isolation and strict security guards against SSRF and injection attacks.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Arquitectura SaaS:</strong> Integré SvelteKit con Supabase (Auth, RLS, triggers Postgres) para la gestión segura de cuentas, y Stripe Checkout + Customer Portal para cobros recurrentes de 5€/mes y descargas de facturas automáticas.</p><p><strong>Motor de auditoría avanzado:</strong> Motor con jobs asíncronos y rate limiting en Upstash Redis. El plan Premium utiliza <strong>browserless.io</strong> para renderizar en un navegador real, capturando contraste de colores WCAG, errores de consola en runtime y cookies pre-consentimiento.</p><p><strong>UX y Corrección IA:</strong> Panel web completo en Tailwind CSS v4 con pestañas de historial de análisis, y prompts detallados y accionables por cada fallo, optimizados para copiar y pegar directamente en Cursor u otros agentes de IA.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>SaaS Architecture:</strong> Integrated SvelteKit with Supabase (Auth, RLS, Postgres triggers) for secure user profiles, and Stripe Checkout + Customer Portal for €5/month recurring subscriptions and self-serve invoice downloads.</p><p><strong>Advanced Audit Engine:</strong> Async background jobs powered by Playwright, with Upstash Redis handling distributed rate limiting. Premium tier uses <strong>browserless.io</strong> to render in a headless browser, checking WCAG color contrast, JS console errors, and pre-consent cookies.</p><p><strong>UX & AI Remediations:</strong> Implemented a technical dashboard styled with Tailwind CSS v4 featuring past audit logs, and copy-pasteable prompts optimized for Cursor or other AI coding agents to fix each specific issue.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Un <strong>producto SaaS real</strong> con pasarela de pago activa que automatiza auditorías técnicas completas. Ahorra horas de trabajo manual al dar un informe estructurado que los desarrolladores pueden solucionar al instante con ayuda de IA.</p><p>Proyecto personal que demuestra el desarrollo de productos SaaS de extremo a extremo: integración de pasarelas de pago (Stripe), almacenamiento y seguridad (Supabase, Redis), automatización de navegadores en la nube (browserless.io) y diseño de prompts optimizados para flujos modernos de desarrollo asistido por IA.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A <strong>live SaaS product</strong> with an active payment gateway that automates complete technical site audits. It saves hours of manual work by providing a structured report developers can solve immediately using AI.</p><p>It serves as a showcase of end-to-end SaaS engineering: payment system integrations (Stripe), data persistence & security (Supabase, Redis), cloud browser automation (browserless.io), and prompt engineering for modern AI-assisted workflows.</p>`
		},
		stack: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Tailwind CSS v4',
			'Supabase',
			'Stripe',
			'Upstash Redis',
			'Playwright',
			'Resend',
			'Zod'
		],
		stackEn: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Tailwind CSS v4',
			'Supabase',
			'Stripe',
			'Upstash Redis',
			'Playwright',
			'Resend',
			'Zod'
		],
		liveUrl: 'https://syrax-analyzer.moisesvalero.es',
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
