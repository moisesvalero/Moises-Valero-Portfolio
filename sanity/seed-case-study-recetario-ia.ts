import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.recetario-ia',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 99,
		homeLayoutTier: 'standard',
		homeEyebrow: {
			es: 'Aplicación web · Astro + Svelte 5 + Gemini',
			en: 'Web app · Astro + Svelte 5 + Gemini'
		},
		homeProofLine: {
			es: 'De lo que tienes en la nevera a una receta lista para cocinar. Generador de recetas estructuradas con IA, modo cocina paso a paso con temporizadores y soporte offline PWA.',
			en: 'From fridge leftovers to a ready-to-cook recipe. AI-powered recipe generator with structured formatting, step-by-step cooking mode, and offline PWA support.'
		},
		homeValueTags: ['Astro', 'Svelte 5', 'Google Gemini', 'Appwrite Cloud', 'PWA Offline'],
		homeRole: {
			es: 'Desarrollador fullstack potenciado por IA',
			en: 'AI-powered fullstack developer'
		},
		homeYear: '2026',
		homeComplexity: 'Alta',
		title: 'Recetario IA',
		titleEn: 'Recetario IA',
		slug: { _type: 'slug', current: 'recetario-ia' },
		seoDescription:
			'Genera recetas personalizadas con inteligencia artificial a partir de los ingredientes de tu nevera. Modo cocina paso a paso, temporizadores interactivos y soporte offline PWA.',
		seoDescriptionEn:
			'Generate custom AI recipes based on your fridge ingredients. Step-by-step cooking mode, interactive timers, and offline PWA support.',
		heroTag: 'Proyecto personal · Aplicación inteligente',
		heroTagEn: 'Personal project · Intelligent application',
		heroDescription:
			'Una herramienta interactiva que convierte ingredientes sueltos en fichas de cocina estructuradas con temporizadores, pasos claros y soporte PWA para usarla en la cocina sin conexión.',
		heroDescriptionEn:
			'An interactive tool that turns loose ingredients into structured recipe sheets with built-in timers, clear steps, and offline PWA support for kitchen use.',
		tags: [
			'Astro',
			'Svelte 5',
			'Google Gemini API',
			'Appwrite Cloud',
			'TypeScript',
			'Tailwind CSS',
			'PWA (Service Workers)',
			'Vercel'
		],
		tagsEn: [
			'Astro',
			'Svelte 5',
			'Google Gemini API',
			'Appwrite Cloud',
			'TypeScript',
			'Tailwind CSS',
			'PWA (Service Workers)',
			'Vercel'
		],
		images: {
			cardImagePath: '/imagenes/recetario-ia-card.png',
			principal: '/imagenes/recetario-ia-principal.png',
			secondary1: '/imagenes/recetario-ia-card.png',
			secondary2: '/imagenes/recetario-ia-mobile.png'
		},
		metrics: [
			metric('Segundos', 'en generar una receta completa', 0),
			metric('100% Offline', 'gracias al soporte PWA', 1),
			metric('Gemini 2.0', 'con validación de datos Zod', 2),
			metric('Gratis', 'con descargas PDF incluidas', 3)
		],
		metricsEn: [
			metric('Seconds', 'to generate a complete recipe', 0),
			metric('100% Offline', 'via PWA service workers', 1),
			metric('Gemini 2.0', 'with Zod data validation', 2),
			metric('Free', 'including PDF downloads', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Seguro que te ha pasado: le pides a una IA tradicional que te sugiera una receta con lo que tienes en la nevera, y te devuelve un bloque gigante de texto. Leer eso mientras cocinas, con las manos ocupadas o manchadas, es un infierno. No hay tiempos claros, ni pasos estructurados, ni temporizadores.</p><p>El reto era diseñar una aplicación web pensada para la cocina real. Tenía que ser ultra-rápida, funcionar sin conexión a internet (ya que la cobertura en la cocina a veces falla) y transformar la respuesta libre de la IA en una ficha técnica con cantidades exactas, alarmas integradas y un formato limpio y cómodo.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>We've all been there: you ask a traditional AI for a recipe based on what's in your fridge, and it spits back a massive wall of text. Trying to read that while cooking, with messy or busy hands, is a nightmare. There are no clear cooking times, structured steps, or timers.</p><p>The challenge was to design a web app built for the real kitchen. It had to be ultra-fast, work offline (since kitchen Wi-Fi can be spotty), and transform raw AI output into structured recipe cards with exact ingredients, active timers, and a clean, comfortable layout.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Generación inteligente y estructurada:</strong> Conecté la aplicación con la API de Google Gemini (usando el modelo rápido <code>gemini-2.0-flash</code>) y forcé a la IA a responder en un formato JSON estricto. Gracias a la validación con Zod en el backend, la interfaz puede pintar de forma segura una ficha interactiva en lugar de texto plano.</p><p><strong>Modo cocinar interactivo y PWA:</strong> Diseñé un modo paso a paso a pantalla completa. Cada paso que requiere tiempo tiene un temporizador interactivo con alarmas. Además, convertí la app en una PWA (Progressive Web App) instalable en el móvil, que guarda en caché local las recetas favoritas para que puedas cocinar aunque te quedes sin cobertura.</p><p><strong>Stack moderno y ágil:</strong> Utilicé Astro para la base del proyecto por su velocidad, combinado con Svelte 5 (utilizando sus nuevas Runes) para gestionar el estado reactivo del temporizador y los ingredientes de forma fluida. Guardé la información en la nube con Appwrite Cloud, agilizando el desarrollo al máximo gracias al apoyo de herramientas de IA.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Smart structured generation:</strong> Connected the app to the Google Gemini API (using the speedy <code>gemini-2.0-flash</code> model) and forced the AI to respond in a strict JSON format. By validating this data with Zod, the frontend safely renders an interactive recipe sheet instead of unformatted text.</p><p><strong>Interactive cooking mode & PWA:</strong> Designed a full-screen step-by-step guide. Any step that takes time features an interactive alarm timer. I also turned the app into an installable PWA (Progressive Web App), caching favorite recipes locally so you can cook even when you have no connection.</p><p><strong>Modern, agile stack:</strong> Used Astro as the foundation for maximum speed, paired with Svelte 5 (leveraging its new Runes) to manage the interactive timers and ingredient chips. Saved user data via Appwrite Cloud, accelerating my workflow with AI assistance.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Recetario IA está publicado y listo para usar en <a href="https://recetario.moisesvalero.es" target="_blank" rel="noopener noreferrer">recetario.moisesvalero.es</a> (con el nombre de marca "Umami"). Es una de mis aplicaciones favoritas porque resuelve una molestia diaria de forma visual y divertida, con una estética de cuaderno físico que entra por los ojos.</p><p>Para mi portfolio, demuestra cómo puedo unir inteligencia artificial generativa con interfaces de usuario súper interactivas, utilizando tecnologías modernas de frontend y logrando un producto terminado, usable y optimizado para móviles.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>Recetario IA is live and cooking at <a href="https://recetario.moisesvalero.es" target="_blank" rel="noopener noreferrer">recetario.moisesvalero.es</a> (branded under the name "Umami"). It's one of my personal favorite projects because it solves a daily chore in a fun, visual way, using a beautiful notebook paper design.</p><p>For my portfolio, it showcases my ability to blend generative AI with highly interactive user interfaces, utilizing modern frontend tech to deliver a polished, mobile-friendly product.</p>`
		},
		stack: [
			'Astro',
			'Svelte 5',
			'Google Gemini API',
			'Appwrite Cloud',
			'TypeScript',
			'Tailwind CSS',
			'PWA (Service Workers)',
			'Vercel'
		],
		stackEn: [
			'Astro',
			'Svelte 5',
			'Google Gemini API',
			'Appwrite Cloud',
			'TypeScript',
			'Tailwind CSS',
			'PWA (Service Workers)',
			'Vercel'
		],
		liveUrl: 'https://recetario.moisesvalero.es',
		repoUrl: 'https://github.com/moisesvalero/recetario-ia',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study recetario-ia cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando recetario-ia en Sanity:', error);
	process.exit(1);
});
