import type { SitePortfolioContent } from '$lib/types/site-portfolio';

const aboutHtml = `<p>Soy <strong>Moisés Valero</strong>. Tras años en el sector industrial, regresé al desarrollo tecnológico con una visión clara: construir páginas web, aplicaciones y soluciones digitales eficientes, resolutivas y orientadas al usuario.</p>
<p>Me especializo en metodologías de <strong>AI-Driven Development</strong> y <strong>Spec-Driven Development (SDD)</strong> para diseñar arquitecturas de software y conectar soluciones con total autonomía. Mi stack principal está enfocado en <strong>SvelteKit</strong>, <strong>Supabase</strong>, <strong>Tailwind CSS</strong> y APIs de IA (<strong>Gemini</strong>, <strong>OpenAI</strong>, <strong>Anthropic</strong>, <strong>Fal.ai</strong>), además de la gestión y mantenimiento de <strong>WordPress</strong>.</p>
<p>Estoy en <strong>Alcoy (Alicante)</strong> y busco incorporarme a equipos de desarrollo (remoto, híbrido o presencial). Si buscas madurez, capacidad de resolución y dominio de las herramientas del futuro, hablemos.</p>`;

/** Valores actuales del portfolio; Sanity los sustituye al publicar `sitePortfolio`. */
export const sitePortfolioDefaults: SitePortfolioContent = {
	header: {
		logoText: 'Moisés Valero',
		logoHref: '/',
		navItems: [
			{ label: 'Inicio', href: '/' },
			{ label: 'Proyectos', href: '/proyectos' },
			{ label: 'Analizador web', href: '/tools/analizador-web' },
			{ label: 'Asistente IA', href: '/ia-moises' },
			{ label: 'Guías', href: '/blog' },
			{ label: 'Contacto', href: '/#contacto' }
		]
	},
	seo: {
		title: 'Moisés Valero – Desarrollador Web | SvelteKit, WordPress, Performance',
		description:
			'Portfolio profesional de Moisés Valero, desarrollador web orientado a SvelteKit, WordPress, rendimiento, SEO técnico e integraciones.',
		ogTitle: 'Moisés Valero – Desarrollador Web',
		ogDescription:
			'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico.',
		ogImage: '/og-image-2026.png',
		twitterCard: 'summary_large_image'
	},
	hero: {
		cvHref: '/api/cv',
		projectsHref: '#proyectos',
		label: 'PORTFOLIO – MOISÉS VALERO',
		title: 'Desarrollador Web',
		subtitle: 'SvelteKit | React/Next.js | APIs | IA aplicada | WordPress',
		bio: 'Desarrollo webs y web apps con SvelteKit, APIs, IA aplicada y WordPress. Busco incorporarme a un equipo y aportar rendimiento, integraciones y criterio técnico.',
		ctaPrimaryLabel: 'Ver proyectos',
		cvCtaLabel: 'Ver CV'
	},
	about: {
		imageSrc: '/imagenes/Moises-Valero-Sanchez.png',
		imageAlt: 'Moisés Valero - Desarrollador WordPress',
		meta: 'UN POCO DE MI HISTORIA',
		title: 'Sobre mí',
		aboutHtml
	},
	services: {
		meta: 'COMPETENCIAS',
		title: 'Lo que puedo aportar dentro de un equipo',
		items: [
			{
				icon: 'web_asset',
				title: 'Frontend y producto',
				description:
					'Desarrollo interfaces con SvelteKit, TypeScript, HTML y CSS moderno, cuidando estados, accesibilidad, responsive, rendimiento percibido y claridad para el usuario final.'
			},
			{
				icon: 'article',
				title: 'CMS, SEO técnico y performance',
				description:
					'Trabajo con WordPress, Sanity y SvelteKit para crear sitios mantenibles. Me fijo en Core Web Vitals, estructura semántica, metadatos, sitemap, JSON-LD y arquitectura de contenido.'
			},
			{
				icon: 'desktop_windows',
				title: 'Integraciones y soporte técnico',
				description:
					'Aporto base de sistemas, soporte IT, APIs, automatizaciones, formularios, despliegues y diagnóstico de incidencias. Me gusta entender el problema completo, no solo tocar la capa visual.'
			}
		]
	},
	techStack: {
		meta: 'TECNOLOGÍAS Y HERRAMIENTAS',
		title: 'Mi Stack Tecnológico',
		categories: [
			{
				title: 'Lenguajes y Core',
				icons: [
					{ alt: 'TypeScript', title: 'TypeScript' },
					{
						alt: 'JavaScript',
						title: 'JavaScript (ES6+)'
					},
					{ src: 'https://svgl.app/library/rust.svg', alt: 'Rust', title: 'Rust' },
					{ alt: 'HTML5', title: 'HTML5' },
					{ alt: 'CSS3', title: 'CSS3' }
				]
			},
			{
				title: 'Frameworks y Librerías',
				icons: [
					{
						alt: 'SvelteKit',
						title: 'SvelteKit / Svelte 5'
					},
					{ alt: 'Next.js', title: 'Next.js' },
					{ alt: 'React', title: 'React' },
					{
						alt: 'Tailwind CSS',
						title: 'Tailwind CSS'
					},
					{ alt: 'Vite', title: 'Vite' },
					{ src: 'https://svgl.app/library/tauri.svg', alt: 'Tauri', title: 'Tauri' },
					{ alt: 'PWA', title: 'Progressive Web Apps' }
				]
			},
			{
				title: 'Backend e Infraestructura',
				icons: [
					{
						alt: 'Supabase',
						title: 'Supabase (PostgreSQL)'
					},
					{ alt: 'Vercel', title: 'Vercel' },
					{ alt: 'Cloudflare', title: 'Cloudflare' },
					{ alt: 'GitHub', title: 'GitHub' }
				]
			},
			{
				title: 'Integraciones y APIs',
				icons: [
					{ alt: 'Stripe', title: 'Stripe API' },
					{ src: '/imagenes/claude-ai-icon.svg', alt: 'Claude', title: 'Claude API' },
					{ alt: 'OpenAI', title: 'OpenAI API' },
					{ alt: 'Gemini', title: 'Gemini API' }
				]
			},
			{
				title: 'CMS y Low-Code',
				icons: [
					{ alt: 'WordPress', title: 'WordPress' },
					{ src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
					{ src: '/imagenes/elementor.svg', alt: 'Elementor', title: 'Elementor' },
					{ alt: 'Sanity', title: 'Sanity.io' }
				]
			},
			{
				title: 'Entorno de Desarrollo e IA',
				icons: [
					{ src: '/imagenes/cursor.svg', alt: 'Cursor', title: 'Cursor' },
					{ src: '/imagenes/codex-color.svg', alt: 'OpenAI Codex', title: 'OpenAI Codex' },
					{ src: '/imagenes/opencode.svg', alt: 'OpenCode', title: 'OpenCode' },
					{ src: '/imagenes/antigravity.svg', alt: 'Antigravity', title: 'Google Antigravity' }
				]
			}
		]
	},
	quality: {
		meta: 'FORMA DE TRABAJAR',
		title: 'Criterios que cuido en cada proyecto',
		items: [
			{
				icon: '🚀',
				title: 'Rendimiento',
				description:
					'Priorizo la velocidad de carga real. Menos plugins y más funciones nativas para conseguir sitios ágiles que mejoren el SEO y la retención de usuarios.'
			},
			{
				icon: '🛡️',
				title: 'Seguridad & Hardening',
				description:
					'Implementación de protocolos de seguridad avanzada y buenas prácticas para proteger la integridad de tu negocio online frente a vulnerabilidades.'
			},
			{
				icon: '📱',
				title: 'Diseño Responsivo',
				description:
					'Desarrollo con enfoque Mobile-first, asegurando que tu web se vea perfecta en cualquier dispositivo, algo vital para el posicionamiento actual.'
			},
			{
				icon: '🤖',
				title: 'Optimización con IA',
				description:
					'Uso avanzado de IA para agilizar el desarrollo, depurar código y asegurar entregas en tiempos competitivos sin sacrificar la robustez técnica.'
			},
			{
				icon: '⚙️',
				title: 'Gestión de Contenido Estructurado (CMS)',
				description:
					'Implementación de Sanity (Headless CMS) para que gestiones tu contenido de forma segura, rápida y escalable, separando los datos del diseño.'
			}
		]
	},
	projects: {
		meta: 'PORTFOLIO SELECCIONADO',
		title: 'Proyectos Destacados',
		intro:
			'Una seleccion breve de proyectos que resumen mi forma de trabajar: criterio tecnico, producto, rendimiento e integraciones reales.',
		maxHomeProjects: 4,
		archiveLinkLabel: 'Ver todos los proyectos',
		archiveHref: '/proyectos',
		projects: [
			{
				imageSrc: '/imagenes/captura-novakit_ember.avif',
				imageAlt: 'NovaKit: UI Toolkit',
				href: '/proyectos/novakit',
				external: false,
				linkLabel: 'Ver Proyecto',
				title: 'NovaKit landing con SvelteKit',
				description:
					'Landing de UI toolkit con SvelteKit: animaciones CSS, mockups interactivos, Spline 3D e i18n. Demo en novakit.moisesvalero.es.',
				tags: ['SvelteKit', 'UI/UX', 'CSS Animations', 'i18n']
			},
			{
				imageSrc: '/imagenes/galeria-nova-.jpeg',
				imageAlt: 'Galería Nova: E-commerce de Arte IA',
				href: '/proyectos/galeria-nova',
				external: false,
				linkLabel: 'Ver Proyecto',
				title: 'Galería Nova | E-commerce de Arte',
				description:
					'E-commerce operativo de arte digital con WordPress y Kadence. Integración de WooCommerce y activos mediante Prompt Engineering para cliente real.',
				tags: ['Kadence', 'WooCommerce', 'Prompt Engineering', 'Performance']
			},
			{
				imageSrc: '/imagenes/Captura-de-pantalla_27-2-2026_114525_moisesvalero.es_.jpeg',
				imageAlt: 'Asador de Carne Premium',
				href: '/proyectos/ember-iron',
				external: false,
				linkLabel: 'Ver Proyecto',
				title: 'Ember & Iron | Asador de Carne Premium',
				description:
					'Web de alto impacto visual enfocada en la conversión. Implementación de vídeo de fondo con optimización de performance en Kadence WP.',
				tags: ['Kadence', 'Performance', 'UI/UX', 'Video Optimization']
			},
			{
				imageSrc: '/imagenes/vshield-1.jpeg',
				imageAlt: 'V-Shield Cybersecurity',
				href: '/proyectos/vshield',
				external: false,
				linkLabel: 'Ver Proyecto',
				title: 'V-Shield | Cybersecurity',
				description:
					'Landing page de alta fidelidad. Implementación de terminal interactiva funcional y optimización de lógica de negocio mediante scripts personalizados.',
				tags: ['Elementor', 'WordPress', 'Custom Scripts', 'Prompt Engineering']
			},
			{
				imageSrc: '/imagenes/chatbot.jpeg',
				imageAlt: 'Chatbot IA con Llama 3.3',
				href: '/proyectos/chatbot',
				external: false,
				linkLabel: 'Ver Proyecto',
				title: 'Chatbot IA | Asistente de Portfolio',
				description:
					'Asistente conversacional con Llama 3.3 vía Groq API, entrenado con mi perfil profesional. Automatización Make.com + Telegram para notificaciones en tiempo real.',
				tags: ['Typebot', 'Groq API', 'Make.com', 'Llama 3.3']
			}
		]
	},
	contact: {
		heading: 'Listo para aportar en un equipo técnico',
		subtitle: '',
		formModalHeading: 'Hablemos de una oportunidad',
		formModalText: 'Déjame tus datos y te responderé con disponibilidad, CV y próximos pasos.',
		formModalSubmitLabel: 'Enviar mensaje',
		formModalPrivacyLabel: 'He leído y acepto la política de privacidad.',
		formModalSuccessMessage: 'Mensaje enviado. Te responderé en breve.'
	},
	footer: {
		copyrightTemplate:
			'Moisés Valero © {{year}} | Desarrollador web orientado a producto, rendimiento e integraciones | SvelteKit, React/Next.js, WordPress, Sanity CMS y SEO técnico.',
		githubHref: 'https://github.com/moisesvalero',
		linkedinHref: 'https://www.linkedin.com/in/moisesvalero',
		maltHref: '',
		emailHref: 'mailto:info@moisesvalero.es'
	}
};
