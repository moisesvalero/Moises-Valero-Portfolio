import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.django-url-shortener',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 99,
		homeLayoutTier: 'standard',
		homeEyebrow: {
			es: 'Servicio web · Django + HTMX + Tailwind',
			en: 'Web service · Django + HTMX + Tailwind'
		},
		homeProofLine: {
			es: 'Un acortador de enlaces moderno y súper rápido. Creado para ser ultra-eficiente en Vercel, usando caché en memoria para redirigir al instante y proteger el servicio de abusos.',
			en: 'A modern and super-fast link shortener. Built to be ultra-efficient on Vercel, using memory caching for instant redirects and built-in abuse protection.'
		},
		homeValueTags: [
			'Django 5.2',
			'HTMX 2',
			'Caché en memoria',
			'Protección de abusos',
			'Desarrollo ágil'
		],
		homeRole: {
			es: 'Desarrollador fullstack potenciado por IA',
			en: 'AI-powered fullstack developer'
		},
		homeYear: '2026',
		homeComplexity: 'Media',
		title: 'django-url-shortener',
		titleEn: 'django-url-shortener',
		slug: { _type: 'slug', current: 'django-url-shortener' },
		seoDescription:
			'Acortador de URLs moderno y súper rápido creado con Django 5.2, HTMX y Tailwind CSS. Redirecciones instantáneas con caché y protección contra abusos.',
		seoDescriptionEn:
			'Modern and super-fast URL shortener built with Django 5.2, HTMX, and Tailwind CSS. Instant redirects using caching and built-in abuse protection.',
		heroTag: 'Proyecto personal · Herramienta web',
		heroTagEn: 'Personal project · Web tool',
		heroDescription:
			'Un acortador de URLs ágil y optimizado para funcionar sin servidores en Vercel. Redirige a los usuarios en milisegundos gracias a su sistema de caché, validando cada enlace y protegiendo el sitio contra peticiones masivas.',
		heroDescriptionEn:
			'A snappy and optimized URL shortener built for serverless deployment on Vercel. Redirects users in milliseconds using a smart cache, validating every link and keeping the site safe from burst requests.',
		tags: [
			'Django 5.2',
			'Python 3.11',
			'HTMX 2.0.4',
			'Tailwind CSS 3',
			'PostgreSQL (Neon)',
			'SQLite',
			'Redis / Django Cache',
			'Husky',
			'Lint-staged',
			'Prettier'
		],
		tagsEn: [
			'Django 5.2',
			'Python 3.11',
			'HTMX 2.0.4',
			'Tailwind CSS 3',
			'PostgreSQL (Neon)',
			'SQLite',
			'Redis / Django Cache',
			'Husky',
			'Lint-staged',
			'Prettier'
		],
		images: {
			cardImagePath: '/imagenes/django-url-shortener-card.png',
			principal: '/imagenes/django-url-shortener-principal.png',
			secondary1: '/imagenes/django-url-shortener-card.png',
			secondary2: '/imagenes/django-url-shortener-mobile.png'
		},
		metrics: [
			metric('<50ms', 'de latencia al redirigir', 0),
			metric('0', 'consultas a base de datos por click', 1),
			metric('10 req/min', 'límite inteligente de peticiones', 2),
			metric('100%', 'validación de enlaces seguros', 3)
		],
		metricsEn: [
			metric('<50ms', 'redirect latency', 0),
			metric('0', 'database queries per click', 1),
			metric('10 req/min', 'smart request limit', 2),
			metric('100%', 'secure link validation', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Muchos acortadores de URLs tradicionales van muy lentos porque tienen que preguntar a la base de datos en cada click. Esto no sólo tarda más, sino que puede saturar el servidor si de repente entra mucha gente. Mi meta era crear un acortador súper rápido que enviara a los usuarios a su destino en menos de 50 milisegundos.</p><p>Además, tenía que asegurar que el sistema fuera seguro: evitar que bots maliciosos abusaran del servicio haciendo miles de peticiones seguidas, y asegurarme de que el acortador supiera de qué país o dirección IP real venía el usuario, algo que suele complicarse al publicar en plataformas en la nube.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>Many traditional URL shorteners are slow because they have to query the database on every single click. This is not only sluggish, but it can also crash the server if a sudden wave of visitors arrives. My goal was to create a super-fast shortener that redirects users to their destination in under 50 milliseconds.</p><p>On top of that, I needed to make the system secure: preventing malicious bots from spamming the service with thousands of requests, and ensuring the app correctly identified the user's real IP address, which is often tricky to get right in cloud deployments.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Redirecciones al instante con caché:</strong> Diseñé el sistema para que no tuviera que leer de la base de datos cada vez que alguien hace click en un enlace. Al acortar una URL, el enlace y su destino se guardan temporalmente en la memoria rápida (caché). Cuando alguien pincha en el enlace corto, se le redirige al momento. El contador de visitas se actualiza de forma silenciosa en segundo plano, logrando un rendimiento espectacular.</p><p><strong>Protección inteligente contra abuso:</strong> Implementé un sistema que limita las peticiones por usuario. Si alguien intenta acortar demasiadas URLs en poco tiempo, el sistema lo frena temporalmente sin afectar a los demás. También añadí una validación muy fuerte para asegurarme de que sólo se puedan acortar enlaces reales y seguros.</p><p><strong>Calidad y automatización en el desarrollo:</strong> Como desarrollador full-stack potenciado por IA (AI-powered), valoro mucho la agilidad. Automaticé la revisión del código y del diseño visual antes de cada subida a producción, asegurando que el código de Django, los componentes dinámicos de HTMX y los estilos de Tailwind estuvieran perfectos y limpios.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Instant redirects using cache:</strong> I designed the system so it doesn't need to read from the database every time someone clicks a link. When a URL is shortened, the link and its destination are saved in fast memory (cache). As soon as a user clicks, they are redirected instantly. The view counter updates quietly in the background, resulting in amazing speed.</p><p><strong>Smart abuse protection:</strong> I added a request limit per user. If someone tries to shorten too many links in a short window, the system temporarily blocks them without slowing down others. I also set up strict validation to guarantee only valid and safe links are allowed.</p><p><strong>Quality & development automation:</strong> As an AI-powered fullstack developer, agility is key. I automated all code styling and checks before deploying, making sure the Django backend, dynamic HTMX components, and Tailwind styles remain clean and fast.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>El acortador está en producción y funcionando de maravilla en <a href="https://acortador.moisesvalero.es" target="_blank" rel="noopener noreferrer">acortador.moisesvalero.es</a>. Redirige a los usuarios sin demoras y consume el mínimo de recursos. Es un ejemplo perfecto de cómo resolver un problema común (los clicks en enlaces) de forma elegante y optimizada.</p><p>Este proyecto demuestra mi enfoque práctico: combinar el poder de Django y Python para el backend con interfaces ligeras e interactivas creadas con HTMX y Tailwind CSS, apoyándome en herramientas de IA para construir de forma ágil y robusta.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>The shortener is live and running beautifully at <a href="https://acortador.moisesvalero.es" target="_blank" rel="noopener noreferrer">acortador.moisesvalero.es</a>. It redirects users with zero lag while keeping server costs to a minimum. It's a great example of taking a common task and solving it in a clean, elegant, and highly optimized way.</p><p>This project showcases my practical approach: blending the stability of Django and Python for backends with fast, interactive frontends using HTMX and Tailwind CSS, leveraging AI tools to build and iterate quickly.</p>`
		},
		stack: [
			'Django 5.2',
			'Python 3.11',
			'HTMX 2.0.4',
			'Tailwind CSS 3',
			'PostgreSQL (Neon)',
			'SQLite',
			'Redis / Django Cache',
			'Husky',
			'Lint-staged',
			'Prettier'
		],
		stackEn: [
			'Django 5.2',
			'Python 3.11',
			'HTMX 2.0.4',
			'Tailwind CSS 3',
			'PostgreSQL (Neon)',
			'SQLite',
			'Redis / Django Cache',
			'Husky',
			'Lint-staged',
			'Prettier'
		],
		liveUrl: 'https://acortador.moisesvalero.es',
		repoUrl: 'https://github.com/moisesvalero/django-url-shortener',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study django-url-shortener cargado en Sanity.');
}

main().catch((error) => {
	console.error('Error cargando django-url-shortener en Sanity:', error);
	process.exit(1);
});
