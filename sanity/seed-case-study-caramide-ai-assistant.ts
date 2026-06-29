import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.caramide-ai-assistant',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 5,
		homeLayoutTier: 'standard',
		homeEyebrow: {
			es: 'Landing Page · Asistente IA Dermocosmético',
			en: 'Landing Page · AI Dermocosmetic Assistant'
		},
		homeProofLine: {
			es: 'Un consultor de skincare clínico integrado en el Hero con latencia ultra-baja y diagnóstico interactivo.',
			en: 'A clinical skincare consultant integrated in the Hero with ultra-low latency and interactive diagnosis.'
		},
		homeValueTags: ['Astro v7', 'Tailwind CSS v4', 'OpenRouter', 'Gemini', 'Clinical Minimalist'],
		homeRole: {
			es: 'Diseño UX/UI, Integración de IA, Frontend y Testing E2E',
			en: 'UX/UI Design, AI Integration, Frontend, and E2E Testing'
		},
		homeYear: '2026',
		homeComplexity: 'Media',
		title: 'Caramide AI Skincare Assistant',
		titleEn: 'Caramide AI Skincare Assistant',
		slug: { _type: 'slug', current: 'caramide-ai-assistant' },
		seoDescription:
			'Caramide AI Skincare Assistant: Asistente conversacional de diagnóstico dermatológico clínico y recomendación de rutinas de skincare mediante IA (Astro, Tailwind v4).',
		seoDescriptionEn:
			'Caramide AI Skincare Assistant: Conversational assistant for clinical dermatological diagnosis and skincare routine recommendations via AI (Astro, Tailwind v4).',
		heroTag: 'Proyecto personal · Asistente IA',
		heroTagEn: 'Personal project · AI Assistant',
		heroDescription:
			'Demo interactiva y premium para prescribir rutinas científicas personalizadas de cuidado de la piel en tiempo real, integrando OpenRouter y Gemini con comparadores a Amazon y Google.',
		heroDescriptionEn:
			'Premium interactive demo prescribing personalized, real-time skincare routines, integrating OpenRouter and Gemini with comparison links to Amazon and Google.',
		tags: ['Astro', 'Tailwind CSS', 'TypeScript', 'OpenRouter', 'Gemini', 'Playwright', 'Vercel'],
		tagsEn: ['Astro', 'Tailwind CSS', 'TypeScript', 'OpenRouter', 'Gemini', 'Playwright', 'Vercel'],
		images: {
			cardImagePath: '/imagenes/caramide-card.png',
			principal: '/imagenes/caramide-principal.png',
			secondary1: '/imagenes/caramide-mobile.png',
			secondary2: '/imagenes/caramide-screen.png'
		},
		metrics: [
			metric('Astro v7', 'Arquitectura orientada a rendimiento', 0),
			metric('< 65ms', 'Latencia de respuesta con typewriter', 1),
			metric('2 LLMs', 'Redundancia (OpenRouter + Gemini)', 2),
			metric('100% Mock', 'Tests responsive Playwright mockeados', 3)
		],
		metricsEn: [
			metric('Astro v7', 'High-performance, content-driven architecture', 0),
			metric('< 65ms', 'Response latency with typewriter', 1),
			metric('2 LLMs', 'Redundant architecture (OpenRouter + Gemini)', 2),
			metric('100% Mock', 'Mocked Playwright responsive tests', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Encontrar productos para el cuidado de la piel científicamente respaldados puede ser abrumador debido al marketing invasivo y a la falta de asesoramiento rápido. Los usuarios suelen navegar entre cientos de reseñas o pagar consultas costosas solo para saber qué tipo de rutina básica les conviene.</p><p>El reto técnico consistía en desarrollar un consultor virtual interactivo integrado directamente en el Hero de la landing page. Este debía procesar los inputs del usuario, determinar de manera clínica su tipo de piel y necesidades, y recetar una rutina con marcas conocidas sin atarse a un catálogo exclusivo (enlaces directos a Amazon España y Google Shopping).</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>Finding scientifically-backed skincare products can be daunting due to aggressive marketing and lack of fast guidance. Users often navigate through hundreds of reviews or pay for expensive consultations just to figure out a basic routine.</p><p>The technical challenge was to build an interactive virtual consultant integrated directly within the Hero section. It needed to process user inputs, clinically analyze skin types and concerns, and prescribe a routine featuring well-known brands while remaining retailer-agnostic (direct links to Amazon Spain and Google Shopping).</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Diseño Clinical Minimalist:</strong> Diseñé una interfaz pixel-perfect de estética científica, limpia y de alto contraste (Flat Stack, bordes de 1px, tipografías Manrope y IBM Plex Sans, y uso quirúrgico del rojo clínico <code>#bc0100</code>).</p><p><strong>Integración y redundancia de IA:</strong> Implementé la lógica en el servidor para ocultar las API keys de forma segura en Vercel Serverless. Utilicé OpenRouter como proveedor primario de LLM y configuré un fallback automático a Google Gemini 2.5 Flash en caso de fallos de red o de cuota.</p><p><strong>Efecto e interacción interactiva:</strong> Programé un efecto de escritura a 65ms para dar una sensación fluida en tiempo real y añadí luces dinámicas de fondo simulando la refracción de laboratorio.</p><p><strong>Tests robustos:</strong> Desarrollé una suite de pruebas E2E con Playwright mockeando las llamadas de IA para asegurar robustez sin costes de ejecución.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Clinical Minimalist Design:</strong> Designed a pixel-perfect, clean, high-contrast scientific UI (Flat Stack layout, 1px borders, Manrope and IBM Plex Sans typography, and precise usage of clinical red <code>#bc0100</code>).</p><p><strong>AI Integration & Redundancy:</strong> Engineered server-side logic to securely hide API keys on Vercel Serverless. Configured OpenRouter as the primary LLM provider with an automatic failover to Google Gemini 2.5 Flash for high availability.</p><p><strong>Interactive Experience:</strong> Programmed a smooth 65ms typewriter effect to simulate a real-time conversational agent, coupled with dynamic laboratory-style background glow effects.</p><p><strong>Robust Testing:</strong> Developed a Playwright E2E testing suite, mocking AI API responses to enable fast, zero-cost verification across multiple viewport sizes.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Una demo interactiva premium que ilustra cómo la IA conversacional puede integrarse de forma fluida en sectores como la cosmética de lujo y la farmacia clínica. El sitio se despliega de forma instantánea gracias a las optimizaciones de Astro v7 y Tailwind CSS v4.</p><p>Como proyecto personal, demuestra la capacidad de diseñar herramientas de inteligencia artificial orientadas a la conversión y a la experiencia del usuario (UX) con un alto nivel de detalle técnico, manteniendo un código limpio y testing automatizado robusto.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A premium interactive tech demo showing how conversational AI can be seamlessly adopted by luxury cosmetics and clinical pharmacy brands. The site loads near-instantly, leveraging the native optimizations of Astro v7 and Tailwind CSS v4.</p><p>As a personal project, it highlights the capability to design conversion-focused, highly detailed AI-driven user experiences (UX) while maintaining clean code architectures and solid automated testing pipelines.</p>`
		},
		stack: [
			'Astro v7',
			'Tailwind CSS v4',
			'TypeScript',
			'OpenRouter API',
			'Google Gemini API',
			'Playwright',
			'Vercel Serverless'
		],
		stackEn: [
			'Astro v7',
			'Tailwind CSS v4',
			'TypeScript',
			'OpenRouter API',
			'Google Gemini API',
			'Playwright',
			'Vercel Serverless'
		],
		liveUrl: 'https://caramide-ai-assistant.vercel.app',
		repoUrl: 'https://github.com/moisesvalero/caramide-ai-assistant',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study caramide-ai-assistant cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando caramide-ai-assistant en Sanity:', error);
	process.exit(1);
});
