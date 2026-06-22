import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.sideglass-dashboard',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: true,
		homeSortOrder: 1,
		homeLayoutTier: 'hero',
		homeEyebrow: {
			es: 'App de escritorio · Tauri + Next.js',
			en: 'Desktop app · Tauri + Next.js'
		},
		homeProofLine: {
			es: 'Dashboard premium para el segundo monitor en Windows: clima, calendario, hardware en vivo, YouTube embebido y dock de IAs — con instalador firmado y auto-actualización.',
			en: 'Premium second-monitor dashboard for Windows: weather, calendar, live hardware stats, embedded YouTube, and an AI dock — with a signed installer and auto-updates.'
		},
		homeValueTags: [
			'Producto real',
			'Tauri v2',
			'Rust nativo',
			'WinGet',
			'Open source'
		],
		homeRole: {
			es: 'Producto, UI, Rust/Tauri, releases y landing',
			en: 'Product, UI, Rust/Tauri, releases, and marketing site'
		},
		homeYear: '2026',
		homeComplexity: 'Muy alta',
		title: 'Sideglass',
		titleEn: 'Sideglass',
		slug: { _type: 'slug', current: 'sideglass-dashboard' },
		seoDescription:
			'Sideglass: app de escritorio para Windows (Tauri + Next.js) que convierte tu segundo monitor en un panel con clima, calendario, hardware, notas, YouTube y dock de IAs. Proyecto personal con releases y WinGet.',
		seoDescriptionEn:
			'Sideglass: Windows desktop app (Tauri + Next.js) that turns your second monitor into a panel with weather, calendar, hardware, notes, YouTube, and an AI dock. Personal project with releases and WinGet distribution.',
		heroTag: 'Proyecto personal · App de escritorio',
		heroTagEn: 'Personal project · Desktop app',
		heroDescription:
			'Aplicación source-available para Windows que unifica widgets redimensionables, telemetría de sistema en Rust, ventana frameless con bandeja del sistema, actualizaciones automáticas y una landing bilingüe — todo construido con Tauri v2 y Next.js 16.',
		heroDescriptionEn:
			'A source-available Windows app that combines resizable widgets, Rust system telemetry, a frameless window with system tray, automatic updates, and a bilingual landing site — all built with Tauri v2 and Next.js 16.',
		tags: [
			'Tauri v2',
			'Next.js 16',
			'React 19',
			'Rust',
			'TypeScript',
			'Windows',
			'WinGet'
		],
		tagsEn: [
			'Tauri v2',
			'Next.js 16',
			'React 19',
			'Rust',
			'TypeScript',
			'Windows',
			'WinGet'
		],
		images: {
			cardImagePath: '/imagenes/sideglass-landscape-dark.png',
			principal: '/imagenes/sideglass-portrait-dark.png',
			secondary1: '/imagenes/sideglass-landscape-dark.png',
			secondary2: '/imagenes/sideglass-portrait-light.png'
		},
		metrics: [
			metric('10+', 'widgets personalizables', 0),
			metric('5', 'IAs en el dock integrado', 1),
			metric('0', 'API keys para el clima', 2),
			metric('7★', 'en GitHub (y subiendo)', 3)
		],
		metricsEn: [
			metric('10+', 'customizable widgets', 0),
			metric('5', 'AIs in the built-in dock', 1),
			metric('0', 'API keys for weather', 2),
			metric('7★', 'on GitHub (and growing)', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Quería un panel fijo en el monitor vertical del PC — útil de verdad, no un wallpaper con reloj. Algo que concentrara clima, agenda, estado del hardware, notas rápidas, YouTube y accesos a ChatGPT, Gemini o Claude sin abrir diez pestañas.</p><p>El reto técnico iba más allá de una web: hacía falta <strong>app nativa en Windows</strong> (ventana sin marco, bandeja, atajo global, arranque con el sistema), telemetría fiable de CPU/GPU/RAM y un instalador con actualizaciones automáticas que cualquiera pudiera descargar.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>I wanted a fixed panel on my PC's vertical monitor — actually useful, not a clock wallpaper. Something that pulled together weather, calendar, hardware status, quick notes, YouTube, and shortcuts to ChatGPT, Gemini, or Claude without opening ten browser tabs.</p><p>The technical challenge went beyond a website: I needed a <strong>native Windows app</strong> (frameless window, tray, global hotkey, start with Windows), reliable CPU/GPU/RAM telemetry, and an installer with auto-updates that anyone could download.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Producto completo:</strong> UI en Next.js 16 con widgets redimensionables (drag &amp; drop), tema claro/oscuro, tipografía Satoshi y modo personalización. Backend nativo en Rust con sysinfo, sensores de temperatura y soporte NVML.</p><p><strong>Experiencia de escritorio:</strong> empaquetado con Tauri v2 (WebView2), barra de título estilo Windows, bandeja del sistema, hotkey global, autostart y comprobación de actualizaciones desde Ajustes. Pipeline de releases en GitHub Actions con instalador firmado.</p><p><strong>Distribución y marca:</strong> landing bilingüe en <a href="https://sideglass.moisesvalero.es" rel="noopener noreferrer">sideglass.moisesvalero.es</a>, changelog ES/EN, scripts de capturas y manifiestos WinGet. Proyecto personal para demostrar que puedo llevar una idea de cero a producto instalable.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Full product:</strong> Next.js 16 UI with resizable widgets (drag &amp; drop), light/dark themes, Satoshi typography, and a customization mode. Native Rust backend with sysinfo, temperature sensors, and NVML support.</p><p><strong>Desktop experience:</strong> packaged with Tauri v2 (WebView2), Windows-style title bar, system tray, global hotkey, autostart, and update checks from Settings. GitHub Actions release pipeline with a signed installer.</p><p><strong>Distribution and brand:</strong> bilingual landing at <a href="https://sideglass.moisesvalero.es" rel="noopener noreferrer">sideglass.moisesvalero.es</a>, ES/EN changelog, screenshot scripts, and WinGet manifests. A personal project to prove I can take an idea from zero to an installable product.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Sideglass es hoy mi proyecto personal más ambicioso: app real que uso en mi propio setup, con descargas, estrellas en GitHub y documentación de publicación. No es un mockup — es software que instalas, actualizas y personalizas.</p><p>Para quien evalúe mi perfil, resume bien mi perfil: <strong>frontend moderno + Rust/Tauri + pensamiento de producto</strong>, incluso sin cliente de pago detrás. Es la prueba de que puedo construir cosas que la gente descarga y usa.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>Sideglass is currently my most ambitious personal project: a real app I use in my own setup, with downloads, GitHub stars, and release documentation. It is not a mockup — it is software you install, update, and customize.</p><p>For anyone reviewing my profile, it captures my strengths: <strong>modern frontend + Rust/Tauri + product thinking</strong>, even without a paying client behind it. It is proof I can build things people download and use.</p>`
		},
		stack: [
			'Next.js 16',
			'React 19',
			'TypeScript',
			'Tailwind CSS 4',
			'Tauri v2',
			'Rust',
			'sysinfo / NVML',
			'Open-Meteo',
			'iCal / Google Calendar',
			'GitHub Actions',
			'WinGet',
			'Playwright'
		],
		stackEn: [
			'Next.js 16',
			'React 19',
			'TypeScript',
			'Tailwind CSS 4',
			'Tauri v2',
			'Rust',
			'sysinfo / NVML',
			'Open-Meteo',
			'iCal / Google Calendar',
			'GitHub Actions',
			'WinGet',
			'Playwright'
		],
		liveUrl: 'https://sideglass.moisesvalero.es',
		repoUrl: 'https://github.com/moisesvalero/sideglass-dashboard',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study sideglass-dashboard cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando sideglass-dashboard en Sanity:', error);
	process.exit(1);
});
