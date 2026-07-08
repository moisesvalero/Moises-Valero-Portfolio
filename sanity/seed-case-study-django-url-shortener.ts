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
			es: 'Acortador de enlaces ultrarrápido con redirecciones optimizadas en caché, rate limiting atómico y detección de IP real detrás de proxies.',
			en: 'Ultra-fast URL shortener with cache-optimized redirects, atomic rate limiting, and real IP detection behind proxies.'
		},
		homeValueTags: ['Django 5.2', 'HTMX 2', 'Caché en memoria', 'Rate limiting', 'Open source'],
		homeRole: {
			es: 'Desarrollador fullstack y optimización de arquitectura',
			en: 'Fullstack developer and architecture optimization'
		},
		homeYear: '2026',
		homeComplexity: 'Media',
		title: 'django-url-shortener',
		titleEn: 'django-url-shortener',
		slug: { _type: 'slug', current: 'django-url-shortener' },
		seoDescription:
			'Acortador de URLs moderno y ultra-optimizado construido con Django 5.2, HTMX y Tailwind CSS. Implementa redirecciones ultrarrápidas con caché y rate limiting atómico.',
		seoDescriptionEn:
			'Modern and ultra-optimized URL shortener built with Django 5.2, HTMX, and Tailwind CSS. Implements lightning-fast redirects with caching and atomic rate limiting.',
		heroTag: 'Proyecto personal · Herramienta web',
		heroTagEn: 'Personal project · Web tool',
		heroDescription:
			'Un acortador de URLs moderno y altamente optimizado diseñado para despliegues serverless rápidos en Vercel, con redirecciones instantáneas mediante caché, protección contra abusos y arquitectura desacoplada de la base de datos para lecturas.',
		heroDescriptionEn:
			'A modern and highly-optimized URL shortener designed for fast serverless deployments on Vercel, featuring instant redirects via caching, abuse protection, and database-decoupled reads.',
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
			metric('<50ms', 'de latencia de redirección', 0),
			metric('0', 'lecturas SQL en redirecciones', 1),
			metric('10 req/min', 'límite de tasa por IP atómico', 2),
			metric('100%', 'validación robusta de URLs', 3)
		],
		metricsEn: [
			metric('<50ms', 'redirect latency', 0),
			metric('0', 'SQL reads on redirection', 1),
			metric('10 req/min', 'atomic rate limit per IP', 2),
			metric('100%', 'robust URL validation', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>La mayoría de acortadores de URLs de ejemplo hacen consultas de base de datos en cada redirección, lo que genera cuellos de botella de I/O y latencia innecesaria en picos de tráfico. Mi objetivo era construir un servicio sumamente rápido, capaz de ejecutarse en entornos serverless con latencia mínima, garantizando redirecciones por debajo de los 50ms sin sobrecargar la base de datos SQL relacional.</p><p>Además, requería resolver retos prácticos de seguridad: implementar un limitador de tasa (rate limiting) verdaderamente atómico que no sufriera de reinicios de TTL bajo ataques de ráfagas, y una detección precisa de IPs detrás de proxies inversos en Vercel para evitar bloqueos erróneos a usuarios legítimos.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>Most basic URL shorteners query the database on every single redirection, creating I/O bottlenecks and unnecessary latency during traffic spikes. My goal was to build an ultra-fast service capable of running in serverless environments with minimal latency, ensuring redirects under 50ms without overloading the relational SQL database.</p><p>Additionally, I needed to solve practical security challenges: implementing a truly atomic rate limiter that would not suffer from TTL resets under burst attacks, and accurate IP detection behind reverse proxies on Vercel to avoid locking out legitimate users.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Optimización de caché en redirecciones:</strong> Diseñé una arquitectura de lectura desacoplada de la base de datos. Al acortar una URL, se guarda en caché una tupla <code>(link_id, original_url)</code>. Cuando el usuario accede al código corto, el middleware intercepta la caché, obtiene la URL original y realiza una redirección 302 instantánea. El incremento del contador de clics se procesa de forma asíncrona mediante tareas atómicas en segundo plano, resultando en cero consultas SQL síncronas de lectura.</p><p><strong>Seguridad y rate limiting robusto:</strong> Corregí un fallo común de TTL utilizando operaciones atómicas (<code>cache.add</code> y Django <code>incr</code>) en la ventana de tiempo. Esto garantiza que cada petición sucesiva sume al contador de ráfagas pero no amplíe el TTL del bloqueo de forma abusiva. Asimismo, implementé <code>URLValidator</code> nativo para descartar inputs maliciosos y configuré validadores de seguridad en el panel de administración.</p><p><strong>Infraestructura y calidad:</strong> Configuré la detección de IPs reales usando <code>HTTP_X_FORWARDED_FOR</code> para servidores detrás de proxies. Implementé un flujo de desarrollo moderno con <code>Husky</code>, <code>Lint-staged</code> y <code>Prettier</code> para validar automáticamente el formato del código HTML/CSS/Python antes de subirlo a producción.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Cache-optimized redirects:</strong> Designed an architecture that decouples reads from the database. When shortening a URL, a tuple of <code>(link_id, original_url)</code> is stored in cache. Upon redirection request, the middleware intercepts the cache, fetches the original URL, and performs an instant 302 redirect. Click counts are incremented asynchronously via atomic background updates, resulting in zero synchronous SQL read queries.</p><p><strong>Robust security & rate limiting:</strong> Fixed a common TTL bug by using atomic operations (<code>cache.add</code> and Django <code>incr</code>) for rate-limiting. This ensures that successive requests count towards the burst limit without resetting the block TTL. Implemented Django’s native <code>URLValidator</code> to reject malformed/insecure URLs and enforced security validators in the admin panel.</p><p><strong>Infrastructure & quality:</strong> Adjusted IP detection to parse <code>HTTP_X_FORWARDED_FOR</code> for servers behind reverse proxies. Configured a modern Git workflow using <code>Husky</code>, <code>Lint-staged</code>, and <code>Prettier</code> to auto-format and validate HTML/CSS/Python code prior to deployment.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>El acortador es un servicio robusto y en producción en <a href="https://acortador.moisesvalero.es" target="_blank" rel="noopener noreferrer">acortador.moisesvalero.es</a> que redirecciona con una latencia mínima, optimizando al extremo el uso de recursos del servidor. Es un ejemplo práctico de cómo tomar un problema común y refinarlo mediante técnicas de caché y rate limiting de nivel empresarial.</p><p>El proyecto sirve como demostración de mis habilidades backend con Django/Python integrando patrones modernos de diseño de API, caching avanzado y frontends ligeros y dinámicos utilizando HTMX y Tailwind CSS.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>The shortener is a production-grade service active at <a href="https://acortador.moisesvalero.es" target="_blank" rel="noopener noreferrer">acortador.moisesvalero.es</a>, redirecting users with minimal latency and optimized server resources. It is a practical example of taking a common utility and refining it using enterprise-grade caching and rate limiting patterns.</p><p>The project showcases my Django/Python backend capabilities, integrating advanced caching, API design patterns, and a lightweight, dynamic frontend powered by HTMX and Tailwind CSS.</p>`
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
