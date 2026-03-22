import type { SitePortfolioContent } from '$lib/types/site-portfolio';

const aboutHtml = `<p>
  Soy <strong>Moisés Valero</strong>. Tras una sólida trayectoria profesional en sectores de alta
  exigencia, he regresado al desarrollo tecnológico con una visión clara: crear soluciones web que no
  solo funcionen, sino que rindan al máximo. Cuento con un
  <strong>Certificado de Profesionalidad de Nivel 3</strong> y una formación actualizada en el stack
  más moderno.
</p>
<p>
  Me especializo en <strong>WordPress</strong>, <strong>SvelteKit</strong> y <strong>Soporte IT</strong>,
  enfocándome en el rendimiento (performance), la seguridad y el mantenimiento eficiente. Utilizo la
  <strong>IA generativa</strong> como una herramienta estratégica para acelerar el desarrollo y
  garantizar resultados sólidos en menos tiempo.
</p>
<p>
  Mi objetivo es aportar mi experiencia y capacidad de resolución a una empresa donde pueda crecer, o
  colaborar en proyectos freelance que necesiten un soporte técnico de confianza en la zona de
  <strong>Alcoy</strong> y <strong>Alicante</strong>. Si buscas compromiso, madurez y dominio técnico,
  hablemos.
</p>`;

/** Valores actuales del portfolio; Sanity los sustituye al publicar `sitePortfolio`. */
export const sitePortfolioDefaults: SitePortfolioContent = {
  header: {
    logoText: 'Moisés Valero',
    logoHref: '/',
    navItems: [
      { label: 'Inicio', href: '/#top' },
      { label: 'Sobre mí', href: '/#sobre' },
      { label: 'Servicios', href: '/#servicios' },
      { label: 'Stack', href: '/#stack' },
      { label: 'Proyectos', href: '/#proyectos' },
      { label: 'Trayectoria', href: '#', openCareerModal: true }
    ],
    ctaLabel: 'Contacto',
    ctaHref: '/#contacto'
  },
  seo: {
    title: 'Moisés Valero – Desarrollador Web | SvelteKit, WordPress, Soporte IT',
    description:
      'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico. Disponible para empresa o proyectos freelance.',
    ogTitle: 'Moisés Valero – Desarrollador Web',
    ogDescription:
      'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico.',
    ogImage: '/og-image.png',
    twitterCard: 'summary_large_image'
  },
  hero: {
    cvHref: '/#contacto',
    label: 'PORTFOLIO – MOISÉS VALERO · Alcoy / Alicante',
    title: 'Desarrollador Web',
    subtitle: 'SvelteKit | WordPress | Soporte IT',
    bio: 'Desarrollo soluciones robustas enfocadas en Web Performance. Me encargo de la infraestructura técnica y el soporte para que tú solo te preocupes de tu negocio. Uso IA para optimizar tiempos, ya sea colaborando con empresas de la zona (Alcoy/Alicante) o integrándome en plantilla.',
    ctaPrimaryLabel: '¿Hablamos?',
    careerCtaLabel: 'Ver Trayectoria'
  },
  about: {
    imageSrc: '/imagenes/Moises-Valero-Sanchez.png',
    imageAlt: 'Moisés Valero - Desarrollador WordPress',
    meta: 'UN POCO DE MI HISTORIA',
    title: 'Sobre mí',
    aboutHtml
  },
  services: {
    meta: 'MIS ESPECIALIDADES',
    title: 'Soluciones Web de Alto Rendimiento',
    items: [
      {
        icon: '🛒',
        title: 'E-commerce',
        description:
          'Tiendas online con WordPress y WooCommerce diseñadas para convertir visitas en clientes. Priorizo la velocidad de carga, la seguridad en las transacciones y una gestión de inventario que te ahorre tiempo.'
      },
      {
        icon: '🌐',
        title: 'Desarrollo Web',
        description:
          'Creo sitios web optimizados con arquitecturas ligeras para un SEO imbatible. Combino el poder de SvelteKit para aplicaciones a medida con la flexibilidad de WordPress, utilizando IA para entregar resultados en tiempo récord.'
      },
      {
        icon: '⚙️',
        title: 'Soporte Técnico IT',
        description:
          'Me encargo de que tu infraestructura nunca falle: redes, hardware, hosting y configuración de correos. Aporto soluciones rápidas a incidencias y mantenimiento preventivo para que tu empresa no se detenga.'
      }
    ]
  },
  techStack: {
    meta: 'TECNOLOGÍAS Y HERRAMIENTAS',
    title: 'Mi Stack Tecnológico',
    categories: [
      {
        title: 'Maquetación y Estructura',
        icons: [
          {
            src: '/imagenes/svelte.svg',
            alt: 'SvelteKit',
            title: 'SvelteKit'
          },
          { src: '/imagenes/html5.svg', alt: 'HTML5', title: 'HTML5' },
          { src: '/imagenes/css.svg', alt: 'CSS3', title: 'CSS3' },
          {
            src: '/imagenes/tailwindcss.svg',
            alt: 'Tailwind CSS',
            title: 'Tailwind CSS'
          }
        ]
      },
      {
        title: 'Ecosistema WordPress',
        icons: [
          {
            src: '/imagenes/wordpress.svg',
            alt: 'WordPress',
            title: 'WordPress'
          },
          {
            src: '/imagenes/elementor.svg',
            alt: 'Elementor',
            title: 'Elementor'
          },
          { src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
          { src: '/imagenes/localwp.svg', alt: 'Local WP', title: 'Local WP' }
        ]
      },
      {
        title: 'Flujo de Trabajo e IA',
        icons: [
          {
            src: '/imagenes/cursor_light.svg',
            alt: 'Cursor AI',
            title: 'Cursor AI'
          },
          {
            src: '/imagenes/claude-ai-icon.svg',
            alt: 'Claude AI',
            title: 'Claude AI'
          },
          {
            src: '/imagenes/cloudflare.svg',
            alt: 'Cloudflare',
            title: 'Cloudflare'
          },
          { src: '/imagenes/github.svg', alt: 'GitHub', title: 'GitHub' }
        ]
      }
    ]
  },
  quality: {
    meta: 'MI ESTÁNDAR DE TRABAJO',
    title: 'Compromiso con la Calidad',
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
      }
    ]
  },
  projects: {
    meta: 'PORTFOLIO SELECCIONADO',
    title: 'Proyectos Destacados',
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
        imageSrc:
          '/imagenes/Captura-de-pantalla_27-2-2026_114525_moisesvalero.es_.jpeg',
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
      },
      {
        imageSrc:
          '/imagenes/Captura-de-pantalla_19-2-2026_122315_www.amazon.es_.jpeg',
        imageAlt: 'Crónicas Visigodas',
        href: 'https://www.amazon.es/Cr%C3%B3nicas-Visigodas-Leyendas-Reino-Perdido/dp/B0D47ZQDKH',
        external: true,
        linkLabel: 'Ver en Amazon',
        title: 'Crónicas Visigodas | Libro Amazon KDP',
        description:
          'Publicación en Amazon KDP. Uso de Prompt Engineering para estructurar datos históricos, generar imágenes y optimizar el flujo editorial para distribución global.',
        tags: ['Amazon KDP', 'Prompt Engineering', 'Generative AI', 'Copywriting']
      }
    ]
  },
  contact: {
    heading: '¿Hablamos?',
    subtitle: '',
    typebotSrc: 'https://typebot.io/asistente-mois-s-valero-sud5oya',
    whatsappLead: '¿Prefieres WhatsApp? Escríbeme sin salir de un clic.',
    whatsappButtonLabel: 'Escribir por WhatsApp',
    iframeTitle: 'Asistente de chat — Moisés Valero'
  },
  footer: {
    copyrightTemplate: 'Moisés Valero © {{year}} | Web Developer',
    githubHref: 'https://github.com/moisesvalero',
    linkedinHref: 'https://www.linkedin.com/in/moisesvalero',
    emailHref: 'mailto:ludicrous_fastball804@simplelogin.com'
  }
};
