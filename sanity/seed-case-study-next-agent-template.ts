import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.next-agent-template',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: true,
		homeSortOrder: 5,
		homeLayoutTier: 'spotlight',
		homeEyebrow: {
			es: 'Plantilla open source · Next.js + agentes IA',
			en: 'Open-source template · Next.js + AI agents'
		},
		homeProofLine: {
			es: 'Starter listo para producción con verificación automática, SEO/AEO y flujo pensado para Cursor, Claude Code o Windsurf.',
			en: 'Production-ready starter with automated verification, SEO/AEO setup, and a workflow built for Cursor, Claude Code, or Windsurf.'
		},
		homeValueTags: [
			'Open source',
			'DX',
			'Agentes IA',
			'Next.js 16',
			'TypeScript estricto'
		],
		homeRole: {
			es: 'Diseño de arquitectura, tooling y documentación para agentes',
			en: 'Architecture, tooling, and agent-first documentation'
		},
		homeYear: '2026',
		homeComplexity: 'Alta',
		title: 'Next Agent Template',
		titleEn: 'Next Agent Template',
		slug: { _type: 'slug', current: 'next-agent-template' },
		seoDescription:
			'Plantilla Next.js 16 para construir webs con agentes de IA: TypeScript estricto, verify pipeline, SEO/AEO, Supabase y Sanity opcionales. Demo en Vercel y código en GitHub.',
		seoDescriptionEn:
			'Next.js 16 starter for AI-agent-driven web projects: strict TypeScript, verify pipeline, SEO/AEO, optional Supabase and Sanity. Live demo on Vercel and source on GitHub.',
		heroTag: 'Proyecto personal · Plantilla open source',
		heroTagEn: 'Personal project · Open-source template',
		heroDescription:
			'Starter de Next.js pensado para que un agente de IA pueda clonar, entender y extender un proyecto sin romper convenciones: App Router, Tailwind 4, oxlint, knip, Vitest, hooks de pre-commit y guía AGENTS.md lista para el día a día.',
		heroDescriptionEn:
			'A Next.js starter designed so an AI agent can clone, understand, and extend a project without breaking conventions: App Router, Tailwind 4, oxlint, knip, Vitest, pre-commit hooks, and an AGENTS.md guide ready for daily use.',
		tags: [
			'Next.js 16',
			'React 19',
			'TypeScript',
			'Tailwind CSS 4',
			'Agentes IA',
			'Vitest',
			'SEO/AEO'
		],
		tagsEn: [
			'Next.js 16',
			'React 19',
			'TypeScript',
			'Tailwind CSS 4',
			'AI agents',
			'Vitest',
			'SEO/AEO'
		],
		images: {
			principal: '/imagenes/next-agent-template-home.png',
			secondary1: '/imagenes/next-agent-template-stack.png',
			secondary2: '/imagenes/next-agent-template-seo.png'
		},
		metrics: [
			metric('12+', 'checks en el pipeline verify', 0),
			metric('20+', 'stacks detectables con AutoSkills', 1),
			metric('1', 'comando para validar antes de entregar', 2),
			metric('⭐', 'listado en awesome-nextjs', 3)
		],
		metricsEn: [
			metric('12+', 'checks in the verify pipeline', 0),
			metric('20+', 'stacks detectable with AutoSkills', 1),
			metric('1', 'command to validate before shipping', 2),
			metric('⭐', 'listed in awesome-nextjs', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Quería una base reusable para arrancar proyectos web con agentes de IA sin repetir cada vez la misma configuración: lint, tests, tipos, SEO, variables de entorno y reglas de trabajo claras para Cursor o Claude Code.</p><p>El objetivo no era solo “tener Next.js”, sino <strong>reducir fricción entre idea y entrega</strong> cuando el que escribe código no eres solo tú, sino también un agente que necesita contexto, límites y un verify final antes de dar por buena una tarea.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>I wanted a reusable base to start web projects with AI agents without rebuilding the same setup every time: linting, tests, types, SEO, environment validation, and clear working rules for Cursor or Claude Code.</p><p>The goal was not just “having Next.js”, but <strong>reducing friction between idea and delivery</strong> when the code is written both by you and by an agent that needs context, guardrails, and a final verify step before a task is considered done.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Arquitectura agent-first:</strong> documenté el flujo en <code>AGENTS.md</code>, añadí scripts como <code>pnpm run verify</code> y <code>pnpm run agent:skills</code>, y dejé integraciones opcionales de Supabase y Sanity preparadas sin bloquear el arranque.</p><p><strong>Calidad automatizada:</strong> oxlint, knip, TypeScript estricto, Vitest, Husky + lint-staged y auditoría de dependencias en un solo comando de verificación.</p><p><strong>Visibilidad y descubrimiento:</strong> publiqué demo en Vercel, dejé capturas en el repo y la plantilla acabó entrando en la lista curada <em>awesome-nextjs</em> de Rajdeep Singh — una señal de que el enfoque encaja con lo que la comunidad Next.js busca.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Agent-first architecture:</strong> I documented the workflow in <code>AGENTS.md</code>, added scripts such as <code>pnpm run verify</code> and <code>pnpm run agent:skills</code>, and prepared optional Supabase and Sanity integrations without blocking the first boot.</p><p><strong>Automated quality:</strong> oxlint, knip, strict TypeScript, Vitest, Husky + lint-staged, and dependency auditing in a single verification command.</p><p><strong>Visibility and discovery:</strong> I shipped a Vercel demo, included screenshots in the repo, and the template was added to Rajdeep Singh's curated <em>awesome-nextjs</em> list — a signal that the approach matches what the Next.js community is looking for.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Una plantilla que puedo clonar en minutos, pasar a un agente con reglas claras y tener confianza de que el código saldrá consistente. Es un proyecto personal para darme a conocer: demuestra que sé montar <strong>DX seria</strong>, pensar en SEO/AEO desde el día uno y trabajar con el stack moderno de React y Next.js.</p><p>Si buscas alguien que entienda tanto el producto como el tooling que hace viable construir rápido con IA, este repo es una buena muestra de cómo trabajo.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A template I can clone in minutes, hand to an agent with clear rules, and trust that the output will stay consistent. It is a personal project to get noticed: it shows I can ship <strong>serious DX</strong>, think about SEO/AEO from day one, and work comfortably with the modern React and Next.js stack.</p><p>If you are looking for someone who understands both product and the tooling that makes building fast with AI viable, this repo is a solid sample of how I work.</p>`
		},
		stack: [
			'Next.js 16',
			'React 19',
			'TypeScript',
			'Tailwind CSS 4',
			'oxlint',
			'knip',
			'Vitest',
			'Zod',
			'Husky',
			'Supabase (opcional)',
			'Sanity (opcional)',
			'Vercel'
		],
		stackEn: [
			'Next.js 16',
			'React 19',
			'TypeScript',
			'Tailwind CSS 4',
			'oxlint',
			'knip',
			'Vitest',
			'Zod',
			'Husky',
			'Supabase (optional)',
			'Sanity (optional)',
			'Vercel'
		],
		liveUrl: 'https://next-agent-template.vercel.app',
		repoUrl: 'https://github.com/moisesvalero/next-agent-template',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study next-agent-template cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando next-agent-template en Sanity:', error);
	process.exit(1);
});
