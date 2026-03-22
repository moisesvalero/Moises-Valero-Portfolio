import type { SitePortfolioContent } from '$lib/types/site-portfolio';

const aboutHtml = `<p>
  Soy <strong>Moisés Valero</strong>, desarrollador web especializado en
  <strong>WordPress, SvelteKit y soporte técnico</strong>. Tras una etapa profesional en otros
  sectores, he regresado al ámbito tecnológico con formación actualizada y un enfoque centrado en
  <strong>rendimiento, seguridad y mantenimiento eficiente</strong>.
</p>
<p>
  He incorporado SvelteKit a mi stack para desarrollar aplicaciones modernas, rápidas y con
  arquitecturas flexibles. Trabajo con estructuras claras, soluciones ligeras y procesos bien
  organizados. Utilizo <strong>IA como apoyo</strong> para acelerar tareas y mejorar la calidad del
  desarrollo.
</p>
<p>
  Busco incorporarme a una <strong>empresa</strong> donde pueda aportar desde el primer día,
  seguir aprendiendo y crecer profesionalmente. Mientras tanto, también estoy disponible para
  <strong>proyectos freelance</strong> de desarrollo, optimización o mantenimiento web.
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
      { label: 'Contacto', href: '/#contacto' }
    ],
    ctaLabel: 'LinkedIn',
    ctaHref: 'https://www.linkedin.com/in/moisesvalero/'
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
    bio: 'Desarrollo soluciones robustas enfocadas en Web Performance. Me encargo de la infraestructura técnica y el soporte para que tú solo te preocupes de tu negocio. Uso IA para optimizar tiempos, ya sea colaborando con empresas de la zona (Alcoy/Alicante) o integrándome en plantilla.'
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
          'Tiendas online con WordPress y WooCommerce, optimizadas para velocidad, seguridad y gestión sencilla. Integración de pagos y automatizaciones.'
      },
      {
        icon: '🌐',
        title: 'Desarrollo Web',
        description:
          'Desarrollo webs rápidas, optimizadas y con estructuras ligeras. Combino IA con tecnologías como SvelteKit, WordPress, Kadence y Elementor para crear sitios eficientes y fáciles de mantener.'
      },
      {
        icon: '⚙️',
        title: 'Soporte Técnico IT',
        description:
          'Resolución de incidencias, redes, hardware y hosting. Experiencia en soporte a usuarios y mantenimiento preventivo de sistemas.'
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
          'Priorizo la velocidad de carga. Menos plugins, más funciones nativas y optimización de activos para conseguir sitios ágiles.'
      },
      {
        icon: '🛡️',
        title: 'Seguridad',
        description:
          'Implementación de protocolos esenciales de endurecimiento (Hardening) y buenas prácticas para proteger la integridad del sitio.'
      },
      {
        icon: '📱',
        title: 'Adaptabilidad',
        description:
          'Desarrollo pensando primero en móviles (Mobile-first), asegurando una experiencia fluida en cualquier dispositivo o resolución.'
      },
      {
        icon: '🤖',
        title: 'Eficiencia IA',
        description:
          'Uso avanzado de herramientas de IA para agilizar el desarrollo, depurar código y asegurar entregas en tiempos competitivos.'
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
    linkedinHref: 'https://www.linkedin.com/in/moisesvalero/',
    linkedinLead: 'Estoy a un mensaje de distancia en LinkedIn.',
    linkedinButtonLabel: 'Contactar en LinkedIn',
    iframeTitle: 'Asistente de chat — Moisés Valero'
  },
  footer: {
    copyrightTemplate: 'Moisés Valero © {{year}} | Web Developer',
    githubHref: 'https://github.com/moisesvalero',
    linkedinHref: 'https://www.linkedin.com/in/moisesvalero',
    emailHref: 'mailto:ludicrous_fastball804@simplelogin.com'
  }
};
