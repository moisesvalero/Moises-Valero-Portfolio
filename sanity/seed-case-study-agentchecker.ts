import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.agentchecker',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: true,
		homeSortOrder: 2,
		homeLayoutTier: 'spotlight',
		homeEyebrow: {
			es: 'CLI open source · Alineación de agentes IA',
			en: 'Open-source CLI · AI agent alignment'
		},
		homeProofLine: {
			es: 'Un comando para detectar contradicciones entre Cursor, Claude Code, Copilot y AGENTS.md — y corregirlas antes de que cuesten tokens.',
			en: 'One command to detect contradictions across Cursor, Claude Code, Copilot, and AGENTS.md — and fix them before they waste tokens.'
		},
		homeValueTags: [
			'Developer tools',
			'CLI',
			'Agentes IA',
			'DX',
			'CI/CD'
		],
		homeRole: {
			es: 'Producto, CLI TypeScript, landing Svelte y CI',
			en: 'Product, TypeScript CLI, Svelte landing, and CI'
		},
		homeYear: '2026',
		homeComplexity: 'Alta',
		title: 'agentchecker',
		titleEn: 'agentchecker',
		slug: { _type: 'slug', current: 'agentchecker' },
		seoDescription:
			'agentchecker: CLI que escanea reglas de Cursor, Claude Code, Copilot y AGENTS.md, detecta contradicciones de stack (pnpm vs npm, oxlint vs eslint) y las corrige. npx agentchecker, Husky y GitHub Actions.',
		seoDescriptionEn:
			'agentchecker: CLI that scans Cursor, Claude Code, Copilot, and AGENTS.md rules, detects stack contradictions (pnpm vs npm, oxlint vs eslint), and fixes them. npx agentchecker, Husky, and GitHub Actions.',
		heroTag: 'Proyecto personal · Herramienta CLI',
		heroTagEn: 'Personal project · CLI tool',
		heroDescription:
			'Herramienta zero-dependency que unifica las instrucciones de todos tus agentes de IA: escanea archivos locales y configs globales, señala el rule drift y propone fixes interactivos o en modo CI con --check-only.',
		heroDescriptionEn:
			'A zero-dependency tool that unifies instructions across all your AI agents: scans local files and global configs, flags rule drift, and offers interactive fixes or CI mode with --check-only.',
		tags: [
			'TypeScript',
			'CLI',
			'Node.js',
			'Svelte',
			'Cursor',
			'Claude Code',
			'GitHub Actions'
		],
		tagsEn: [
			'TypeScript',
			'CLI',
			'Node.js',
			'Svelte',
			'Cursor',
			'Claude Code',
			'GitHub Actions'
		],
		images: {
			cardImagePath: '/imagenes/agentchecker-card.png',
			principal: '/imagenes/agentchecker-screen.png',
			secondary1: '/imagenes/agentchecker-demo.gif',
			secondary2: '/imagenes/agentchecker-og.png'
		},
		metrics: [
			metric('9+', 'agentes y editores soportados', 0),
			metric('4', 'categorías de stack analizadas', 1),
			metric('0', 'instalación global (npx)', 2),
			metric('CI', 'modo --check-only listo', 3)
		],
		metricsEn: [
			metric('9+', 'supported agents and editors', 0),
			metric('4', 'stack categories analyzed', 1),
			metric('0', 'global install needed (npx)', 2),
			metric('CI', '--check-only mode ready', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Cuando usas varios agentes de IA a la vez, cada uno lee reglas distintas: Cursor mira <code>.cursor/rules</code>, Claude Code <code>CLAUDE.md</code>, Copilot <code>copilot-instructions.md</code> y el equipo humano <code>AGENTS.md</code>. Con el tiempo aparece el <strong>rule drift</strong>: un agente impone pnpm y oxlint, otro npm y eslint.</p><p>El resultado son commits incoherentes, builds rotos y tokens quemados corrigiendo lo que la IA contradijo. Necesitaba una forma rápida de auditar y alinear todo desde la terminal.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>When you use multiple AI agents at once, each reads different rules: Cursor checks <code>.cursor/rules</code>, Claude Code reads <code>CLAUDE.md</code>, Copilot uses <code>copilot-instructions.md</code>, and humans rely on <code>AGENTS.md</code>. Over time <strong>rule drift</strong> appears: one agent enforces pnpm and oxlint, another npm and eslint.</p><p>The outcome is inconsistent commits, broken builds, and wasted tokens fixing what the AI contradicted. I needed a fast way to audit and align everything from the terminal.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>CLI de diagnóstico:</strong> monorepo con paquete CLI que escanea archivos del proyecto y configs globales (solo lectura en home), extrae decisiones de package manager, linter, formatter y tests, y muestra un informe claro en terminal.</p><p><strong>Corrección guiada:</strong> modo interactivo, <code>--dry-run</code>, <code>-y</code> para aplicar fixes y generación automática de <code>AGENTS.md</code> si el proyecto no tiene reglas locales. Integración con Husky pre-commit y job de GitHub Actions en el propio repo.</p><p><strong>Producto publicado:</strong> landing en Svelte, demo en asciinema/GIF, documentación bilingüe ES/EN y ejecución instantánea con <code>npx agentchecker</code> sin instalar nada globalmente.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Diagnostic CLI:</strong> monorepo with a CLI package that scans project files and global configs (read-only in home), extracts package manager, linter, formatter, and test decisions, and prints a clear terminal report.</p><p><strong>Guided fixes:</strong> interactive mode, <code>--dry-run</code>, <code>-y</code> to apply fixes, and automatic <code>AGENTS.md</code> generation when the project has no local rules. Husky pre-commit and GitHub Actions job integration in the repo itself.</p><p><strong>Shipped product:</strong> Svelte landing, asciinema/GIF demo, bilingual ES/EN docs, and instant runs via <code>npx agentchecker</code> with no global install.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Una herramienta que uso en mis propios repos antes de commitear con agentes. No sustituye el criterio humano, pero evita que Cursor y Claude discutan en silencio sobre si el proyecto usa pnpm o biome.</p><p>Como proyecto personal demuestra que entiendo el ecosistema <strong>agentic AI + DX</strong>: no solo prompts, sino infraestructura para que varios asistentes trabajen con las mismas reglas. Ideal para equipos que mezclan Cursor, Copilot y Claude Code.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A tool I use in my own repos before committing with agents. It does not replace human judgment, but it stops Cursor and Claude from silently disagreeing about whether the project uses pnpm or biome.</p><p>As a personal project it shows I understand the <strong>agentic AI + DX</strong> ecosystem: not just prompts, but infrastructure so multiple assistants share the same rules. A strong fit for teams mixing Cursor, Copilot, and Claude Code.</p>`
		},
		stack: [
			'TypeScript',
			'Node.js',
			'pnpm workspaces',
			'Svelte',
			'Vitest',
			'oxlint',
			'Husky',
			'GitHub Actions',
			'asciinema',
			'Vercel'
		],
		stackEn: [
			'TypeScript',
			'Node.js',
			'pnpm workspaces',
			'Svelte',
			'Vitest',
			'oxlint',
			'Husky',
			'GitHub Actions',
			'asciinema',
			'Vercel'
		],
		liveUrl: 'https://agentcheck-rho.vercel.app',
		repoUrl: 'https://github.com/moisesvalero/agentchecker',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study agentchecker cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando agentchecker en Sanity:', error);
	process.exit(1);
});
