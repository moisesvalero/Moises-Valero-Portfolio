import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.novatab',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 10,
		homeLayoutTier: 'standard',
		homeEyebrow: {
			es: 'Startpage & Nueva Pestaña · SvelteKit 5 + TypeScript',
			en: 'Startpage & New Tab · SvelteKit 5 + TypeScript'
		},
		homeProofLine: {
			es: 'Startpage minimalista y ultraligera para navegadores con estética Glassmorphism, buscador con autocompletado en tiempo real, fondos HD de Unsplash, clima en vivo y widgets de productividad.',
			en: 'Minimalist and ultra-fast startpage for web browsers with Glassmorphism design, real-time Google search autocomplete, HD Unsplash wallpapers, live weather, and productivity widgets.'
		},
		homeValueTags: [
			'SvelteKit 5',
			'Svelte 5 Runes',
			'Glassmorphism',
			'Open-Meteo',
			'Unsplash API',
			'Open source'
		],
		homeRole: {
			es: 'Diseño UI, Arquitectura Frontend, Svelte 5 y Despliegue',
			en: 'UI Design, Frontend Architecture, Svelte 5 & Deployment'
		},
		homeYear: '2026',
		homeComplexity: 'Media',
		title: 'NovaTab',
		titleEn: 'NovaTab',
		slug: { _type: 'slug', current: 'novatab' },
		seoDescription:
			'NovaTab: aplicación de nueva pestaña (Startpage) minimalista y personalizable construida con SvelteKit 5, Glassmorphism, buscador inteligente, fondos dinámicos HD, clima en vivo y widgets de productividad.',
		seoDescriptionEn:
			'NovaTab: a minimalist, customizable new tab startpage built with SvelteKit 5, Glassmorphism aesthetics, intelligent search, dynamic HD wallpapers, live weather, and productivity widgets.',
		heroTag: 'Proyecto personal · Startpage & Nueva Pestaña',
		heroTagEn: 'Personal project · Startpage & New Tab',
		heroDescription:
			'Startpage minimalista de alto rendimiento construida con SvelteKit 5 y Svelte 5 Runes. Diseñada para transformar la nueva pestaña del navegador en un espacio de trabajo productivo y visualmente limpio: buscador integrado estilo Google con sugerencias en vivo, reloj y saludo adaptativo, fondos en alta resolución con desenfoque personalizable, accesos directos con favicons automáticos y panel de ajustes en local.',
		heroDescriptionEn:
			'A high-performance, minimalist startpage built with SvelteKit 5 and Svelte 5 Runes. Designed to transform browser new tabs into a clean, productive workspace: Google-style integrated search with live suggestions, adaptive clock and greetings, high-res wallpapers with customizable blur, bookmark shortcuts with automated favicons, and local settings drawer.',
		tags: [
			'SvelteKit 5',
			'Svelte 5',
			'TypeScript',
			'Tailwind CSS',
			'Glassmorphism',
			'Open-Meteo API',
			'Unsplash API',
			'Vercel'
		],
		tagsEn: [
			'SvelteKit 5',
			'Svelte 5',
			'TypeScript',
			'Tailwind CSS',
			'Glassmorphism',
			'Open-Meteo API',
			'Unsplash API',
			'Vercel'
		],
		images: {
			cardImagePath: '/imagenes/novatab-card.png',
			principal: '/imagenes/novatab-principal.png',
			secondary1: '/imagenes/novatab-secondary1.png',
			secondary2: '/imagenes/novatab-mobile.png'
		},
		metrics: [
			metric('<50ms', 'tiempo de carga inicial', 0),
			metric('100%', 'privacidad y almacenamiento local', 1),
			metric('0', 'API keys requeridas para el usuario', 2),
			metric('6+', 'widgets y paneles integrados', 3)
		],
		metricsEn: [
			metric('<50ms', 'initial load time', 0),
			metric('100%', 'local storage privacy', 1),
			metric('0', 'API keys required for users', 2),
			metric('6+', 'integrated widgets & tools', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml:
				'<p>Las páginas de inicio por defecto de los navegadores comerciales suelen estar sobrecargadas de publicidad, noticias irrelevantes y telemetría intrusiva, mientras que muchas extensiones de inicio consumen excesivos recursos en segundo plano o dependen de cuentas y servidores externos.</p><p>El objetivo era crear una <strong>Startpage minimalista, hiperrápida y estética</strong> inspirada en proyectos de referencia como Bonjourr, pero con una arquitectura moderna basada en <strong>SvelteKit 5 y Svelte 5 Runes</strong>, 100% orientada a la privacidad (cero rastreo, almacenamiento en LocalStorage del cliente) y con una experiencia visual Glassmorphism fluida en cualquier dispositivo o resolución.</p>'
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml:
				'<p>Default browser startpages are often cluttered with ads, clickbait news, and intrusive tracking, while many new tab extensions consume excessive background resources or require cloud logins.</p><p>The goal was to build a <strong>minimalist, ultra-fast, and aesthetic startpage</strong> inspired by benchmark projects like Bonjourr, but architected with modern <strong>SvelteKit 5 and Svelte 5 Runes</strong>, completely privacy-first (zero tracking, client-side LocalStorage), and delivering a fluid Glassmorphism visual experience across all screen sizes.</p>'
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml:
				'<p><strong>Arquitectura reactiva con Svelte 5:</strong> Desarrollé todos los componentes modulares (buscador Google con autocompletado en tiempo real y atajo <code>Ctrl+K</code> / <code>/</code>, reloj digital/analógico configurable, saludo adaptativo según franja horaria, widgets de Pomodoro, bloc de notas y citas célebres) utilizando las nuevas <em>Runes</em> de Svelte 5 (<code>$state</code>, <code>$derived</code>, <code>$effect</code>).</p><p><strong>Diseño Glassmorphism y multimedia:</strong> Implementé un motor de fondos dinámicos conectado a Unsplash con control interactivo de nivel de desenfoque (<em>blur</em>), superposición de opacidad (<em>overlay</em>), créditos de autor y cambio aleatorio en un clic. Gestión de accesos directos con recuperación automática de favicons en alta resolución.</p><p><strong>Privacidad y ajustes avanzados:</strong> Creé un panel deslizable (<em>Settings Drawer</em>) para personalizar visibilidad de cada bloque, activar geolocalización o ciudad manual mediante la API abierta de Open-Meteo (sin necesidad de API keys) y funciones de exportación/importación de configuración en JSON.</p>'
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml:
				'<p><strong>Reactive Architecture with Svelte 5:</strong> Built modular components (Google search with real-time suggestions and keyboard shortcut <code>Ctrl+K</code> / <code>/</code>, configurable digital/analog clock, adaptive time-of-day greeting, Pomodoro timer, scratchpad, and daily quotes) leveraging modern Svelte 5 Runes (<code>$state</code>, <code>$derived</code>, <code>$effect</code>).</p><p><strong>Glassmorphism UI & Dynamic Wallpapers:</strong> Implemented a wallpaper engine integrated with Unsplash featuring live blur control, opacity overlay sliders, photographer attribution, and 1-click random refresh. Created a visual bookmark dock with automated high-res favicon fetching.</p><p><strong>Privacy & Advanced Preferences:</strong> Designed a slide-over settings drawer allowing users to toggle widgets, configure geo-coordinates or manual city weather via Open-Meteo (no API keys required), and export/import configuration files via JSON.</p>'
		},
		resultado: {
			title: 'Resultado',
			bodyHtml:
				'<p>NovaTab ofrece una experiencia de navegación diaria limpia, instantánea y libre de distracciones. Se encuentra desplegada en producción en <a href="https://start.moisesvalero.es" rel="noopener noreferrer">start.moisesvalero.es</a> (con espejo en Vercel) y con código completamente abierto en GitHub bajo licencia MIT.</p><p>El proyecto demuestra solidez en la adopción de las últimas características de Svelte 5, diseño frontend cuidado con microinteracciones y capacidad para concebir utilidades web orientadas a la experiencia de usuario y la privacidad.</p>'
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml:
				'<p>NovaTab delivers a distraction-free, instantaneous, and elegant daily browsing routine. It is deployed in production at <a href="https://start.moisesvalero.es" rel="noopener noreferrer">start.moisesvalero.es</a> (with a mirror on Vercel) and fully open-sourced on GitHub under the MIT license.</p><p>The project highlights expertise in Svelte 5 state management, polished UI craft with micro-interactions, and the ability to build functional, privacy-conscious web products.</p>'
		},
		stack: [
			'SvelteKit 5',
			'Svelte 5 Runes',
			'TypeScript',
			'Tailwind CSS',
			'Lucide Svelte',
			'Open-Meteo API',
			'Unsplash API',
			'LocalStorage API',
			'Vercel'
		],
		stackEn: [
			'SvelteKit 5',
			'Svelte 5 Runes',
			'TypeScript',
			'Tailwind CSS',
			'Lucide Svelte',
			'Open-Meteo API',
			'Unsplash API',
			'LocalStorage API',
			'Vercel'
		],
		liveUrl: 'https://start.moisesvalero.es',
		repoUrl: 'https://github.com/moisesvalero/novatab',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study novatab cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando novatab en Sanity:', error);
	process.exit(1);
});
