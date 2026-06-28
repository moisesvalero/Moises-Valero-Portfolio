import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.quiz-camisetas',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeLayoutTier: 'standard',
		title: 'Retro Shirt Quiz',
		titleEn: 'Retro Shirt Quiz',
		slug: { _type: 'slug', current: 'quiz-camisetas' },
		seoDescription:
			'Retro Shirt Quiz: un juego tipo quiz con 175 camisetas de selecciones nacionales de los Mundiales (1930-2022). Pon a prueba tu pasión futbolera adivinando selección y año.',
		seoDescriptionEn:
			'Retro Shirt Quiz: a quiz game featuring 175 national team shirts from World Cups (1930-2022). Test your football passion by guessing the team and year.',
		heroTag: 'Proyecto personal · Juego web',
		heroTagEn: 'Personal project · Web game',
		heroDescription:
			'Juego tipo quiz con 175 camisetas históricas de selecciones nacionales, desde Uruguay 1930 hasta Catar 2022. Tres modos de dificultad, diseño brutalista daylight, PWA instalable y lógica de distractores inteligentes.',
		heroDescriptionEn:
			'A quiz game featuring 175 historic national team shirts, from Uruguay 1930 to Qatar 2022. Three difficulty modes, brutalist daylight design, installable PWA, and intelligent distractor logic.',
		tags: [
			'Astro 7',
			'JavaScript',
			'Tailwind CSS v4',
			'PWA',
			'Service Workers',
			'Football Kit Archive API'
		],
		tagsEn: [
			'Astro 7',
			'JavaScript',
			'Tailwind CSS v4',
			'PWA',
			'Service Workers',
			'Football Kit Archive API'
		],
		images: {
			principal: '/imagenes/quiz-camisetas-hero.png',
			secondary1: '/imagenes/quiz-camisetas-og.png',
			secondary2: '/imagenes/quiz-camisetas-hero.png'
		},
		metrics: [
			metric('175', 'camisetas mundialistas', 0),
			metric('3', 'eras / modos de juego', 1),
			metric('0', 'registro necesario', 2),
			metric('PWA', 'instalable offline', 3)
		],
		metricsEn: [
			metric('175', 'World Cup shirts', 0),
			metric('3', 'eras / game modes', 1),
			metric('0', 'registration needed', 2),
			metric('PWA', 'installable offline', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Quería construir un juego que combinara dos pasiones: el fútbol y el diseño frontend. La idea era simple pero exigente: un quiz donde no bastara con adivinar la selección — había que acertar también el año exacto de la camiseta. Y todo con 175 equipaciones que abarcan casi un siglo de historia mundialista.</p><p>El reto técnico era conseguir que el juego se sintiera rápido, adictivo y visualmente impactante. Sin backend, sin registro, sin friction. Solo abrir y jugar. Además, al ser un proyecto sin API keys ni servidor, todo el contenido (preguntas, opciones, pistas) tenía que vivir en el frontend.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>I wanted to build a game that combined two passions: football and frontend design. The idea was simple but demanding: a quiz where guessing the team was not enough — you also had to get the exact year of the shirt. All with 175 kits spanning nearly a century of World Cup history.</p><p>The technical challenge was making the game feel fast, addictive, and visually striking. No backend, no registration, no friction. Just open and play. Plus, being a project with no API keys or server, all the content (questions, options, hints) had to live in the frontend.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Arquitectura completa del juego:</strong> 175 camisetas organizadas en tres eras (Moderna 2000+, Clásica 1970-1999, Histórica pre-1970), cada una con su nivel de dificultad. Lógica de distractores inteligentes: en niveles altos, las opciones incorrectas son mundialmente cercanas para evitar descartes fáciles.</p><p><strong>Diseño brutalista daylight:</strong> inspirado en la estética <em>Stitch (Daylight/Unity Pulse)</em>, con colores vibrantes, sombras gruesas sin desenfoque y micro-animaciones dinámicas que dan personalidad a cada interacción.</p><p><strong>PWA completa:</strong> soporte offline con Service Workers nativos, instalable en móvil y escritorio. Ideal para jugar en cualquier lado sin consumir datos.</p><p><strong>Sistema de partidas completo:</strong> vidas, rachas, pistas visuales (colores de la camiseta), puntuación y resumen final. Todo sincronizado con la experiencia de juego inmediata.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Complete game architecture:</strong> 175 shirts organized in three eras (Modern 2000+, Classic 1970-1999, Historic pre-1970), each with its difficulty level. Intelligent distractor logic: at higher levels, wrong options are close in World Cup years to prevent easy discards.</p><p><strong>Brutalist daylight design:</strong> inspired by <em>Stitch (Daylight/Unity Pulse)</em> aesthetics, with vibrant colors, hard shadows with no blur, and dynamic micro-animations that give personality to every interaction.</p><p><strong>Full PWA:</strong> offline support with native Service Workers, installable on mobile and desktop. Perfect for playing anywhere without using data.</p><p><strong>Complete game system:</strong> lives, streaks, visual hints (shirt colors), scoring, and final summary. Everything synced with an immediate gameplay experience.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Retro Shirt Quiz es un juego divertido, pulido y completamente funcional que cualquiera puede abrir y jugar en segundos. Sin cuentas, sin publicidad, sin complejidad innecesaria — solo fútbol, diseño y código limpio.</p><p>Es el tipo de proyecto que mejor refleja mi enfoque: <strong>idea clara, ejecución rápida, atención al detalle visual</strong> y cero dependencias externas. Un producto que habla por sí solo cuando lo pruebas.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>Retro Shirt Quiz is a fun, polished, and fully functional game that anyone can open and play in seconds. No accounts, no ads, no unnecessary complexity — just football, design, and clean code.</p><p>It is the kind of project that best reflects my approach: <strong>clear idea, fast execution, attention to visual detail</strong>, and zero external dependencies. A product that speaks for itself when you try it.</p>`
		},
		stack: [
			'Astro 7',
			'JavaScript',
			'Tailwind CSS v4',
			'PWA',
			'Service Workers',
			'Football Kit Archive',
			'Vercel'
		],
		stackEn: [
			'Astro 7',
			'JavaScript',
			'Tailwind CSS v4',
			'PWA',
			'Service Workers',
			'Football Kit Archive',
			'Vercel'
		],
		liveUrl: 'https://quiz-camisetas.moisesvalero.es',
		repoUrl: 'https://github.com/moisesvalero/quiz-camisetas',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study quiz-camisetas cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando quiz-camisetas en Sanity:', error);
	process.exit(1);
});
