import type { SitePortfolioContent } from '$lib/types/site-portfolio';

const aboutHtml = `<p>
  Soy <strong>Moisés Valero</strong>. Tras años en el sector industrial, regresé al desarrollo tecnológico
  con una visión clara: construir páginas web, aplicaciones y soluciones digitales eficientes,
  resolutivas y orientadas al usuario. Cuento con un
  <strong>Certificado de Profesionalidad de Nivel 3</strong> y un enfoque basado en la práctica real.
</p>
<p>
  Me especializo en metodologías de <strong>AI-Driven Development</strong> y
  <strong>Spec-Driven Development (SDD)</strong> para diseñar arquitecturas de software y conectar
  soluciones con total autonomía. Mi stack principal está enfocado en <strong>SvelteKit</strong>,
  <strong>Supabase</strong>, <strong>Tailwind CSS</strong> y APIs de IA
  (<strong>Gemini</strong>, <strong>OpenAI</strong>, <strong>Anthropic</strong>, <strong>Fal.ai</strong>),
  además de la gestión y mantenimiento de <strong>WordPress</strong>.
</p>
<p>
  Estoy en <strong>Alcoy (Alicante)</strong> y busco incorporarme a equipos de desarrollo
  (remoto, híbrido o presencial). Si buscas madurez, capacidad de resolución y dominio de las
  herramientas del futuro, hablemos.
</p>`;

/** Valores actuales del portfolio; Sanity los sustituye al publicar `sitePortfolio`. */
export const sitePortfolioDefaults: SitePortfolioContent = {
  header: {
    logoText: 'Moisés Valero',
    logoHref: '/',
    navItems: [
      { label: 'Inicio', href: '/#top' },
      { label: 'Competencias', href: '/#servicios' },
      { label: 'Proyectos', href: '/proyectos' },
      { label: 'Analizador', href: '/tools/analizador-web' },
      { label: 'Guías', href: '/blog' },
      { label: 'Trayectoria', href: '#', openCareerModal: true }
    ],
    ctaLabel: 'Contacto',
    ctaHref: '/#contacto'
  },
  seo: {
    title: 'Moisés Valero – Desarrollador Web | SvelteKit, WordPress, Performance',
    description:
      'Portfolio profesional de Moisés Valero, desarrollador web orientado a SvelteKit, WordPress, rendimiento, SEO técnico e integraciones.',
    ogTitle: 'Moisés Valero – Desarrollador Web',
    ogDescription:
      'Desarrollo web con foco en rendimiento, WordPress, SvelteKit y soporte técnico.',
    ogImage: '/og-image.png',
    twitterCard: 'summary_large_image'
  },
  hero: {
    cvHref: '/api/cv',
    label: 'PORTFOLIO – MOISÉS VALERO · Alcoy / Alicante',
    title: 'Desarrollador Web',
    subtitle: 'SvelteKit | WordPress | Sistemas & SEO',
    bio: 'Desarrollo sitios web y web apps rápidas, robustas y mantenibles, con foco en rendimiento, IA e integraciones reales. Busco incorporarme a un equipo donde aportar criterio técnico, aprendizaje rápido y valor desde el primer día.',
    ctaPrimaryLabel: 'Ver CV',
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
          { devicon: 'typescript/typescript-original.svg', alt: 'TypeScript', title: 'TypeScript' },
          { devicon: 'javascript/javascript-original.svg', alt: 'JavaScript', title: 'JavaScript (ES6+)' },
          { devicon: 'html5/html5-original.svg', alt: 'HTML5', title: 'HTML5' },
          { devicon: 'css3/css3-original.svg', alt: 'CSS3', title: 'CSS3' }
        ]
      },
      {
        title: 'Frameworks y Librerías',
        icons: [
          { devicon: 'svelte/svelte-original.svg', alt: 'SvelteKit', title: 'SvelteKit / Svelte 5' },
          { devicon: 'tailwindcss/tailwindcss-original.svg', alt: 'Tailwind CSS', title: 'Tailwind CSS' },
          { devicon: 'vitejs/vitejs-original.svg', alt: 'Vite', title: 'Vite' },
          { iconify: 'logos:pwa', alt: 'PWA', title: 'Progressive Web Apps' }
        ]
      },
      {
        title: 'Backend e Infraestructura',
        icons: [
          { devicon: 'supabase/supabase-original.svg', alt: 'Supabase', title: 'Supabase (PostgreSQL)' },
          { devicon: 'vercel/vercel-original.svg', alt: 'Vercel', title: 'Vercel' },
          { devicon: 'cloudflare/cloudflare-original.svg', alt: 'Cloudflare', title: 'Cloudflare' },
          { devicon: 'github/github-original.svg', alt: 'GitHub', title: 'GitHub' }
        ]
      },
      {
        title: 'Integraciones y APIs',
        icons: [
          { iconify: 'logos:stripe', alt: 'Stripe', title: 'Stripe API' },
          { src: '/imagenes/claude-ai-icon.svg', alt: 'Claude', title: 'Claude API' },
          { iconify: 'logos:openai-icon', alt: 'OpenAI', title: 'OpenAI API' },
          { iconify: 'logos:google-gemini', alt: 'Gemini', title: 'Gemini API' }
        ]
      },
      {
        title: 'CMS y Low-Code',
        icons: [
          { devicon: 'wordpress/wordpress-plain.svg', alt: 'WordPress', title: 'WordPress' },
          { src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
          { src: '/imagenes/elementor.svg', alt: 'Elementor', title: 'Elementor' },
          { devicon: 'sanity/sanity-original.svg', alt: 'Sanity', title: 'Sanity.io' }
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
    ]
  },
  contact: {
    heading: '¿Hablamos?',
    subtitle: '',
    typebotSrc: 'https://typebot.io/asistente-mois-s-valero-sud5oya',
    whatsappLead: '',
    whatsappButtonLabel: 'WhatsApp',
    formLead: '',
    formButtonLabel: 'Contacto',
    formModalHeading: 'Cuéntame tu proyecto',
    formModalText: 'Déjame tus datos y te responderé lo antes posible.',
    formModalSubmitLabel: 'Enviar solicitud',
    formModalPrivacyLabel: 'He leído y acepto la política de privacidad.',
    formModalSuccessMessage: 'Mensaje enviado. Te responderé en breve.',
    iframeTitle: 'Asistente de chat — Moisés Valero'
  },
  footer: {
    copyrightTemplate:
      'Moisés Valero © {{year}} | Desarrollador web orientado a producto, rendimiento e integraciones | SvelteKit, WordPress, Sanity CMS y SEO técnico.',
    githubHref: 'https://github.com/moisesvalero',
    linkedinHref: 'https://www.linkedin.com/in/moisesvalero',
    maltHref: '',
    emailHref: 'mailto:info@moisesvalero.es'
  },
  careerModal: {
    pdfHref: '/imagenes/MOISES-VALERO-CV.pdf',
    closeAria: 'Cerrar',
    title: 'Trayectoria profesional de Moisés Valero',
    profileTitle: 'Perfil',
    profileHtml: `<p class="career-p">
            Cuento con el <strong>Certificado de Profesionalidad de Nivel 3 en Desarrollo Web</strong>
            (equivalente a formación de <strong>Grado Superior</strong>), que avala competencias
            actualizadas en desarrollo y entornos web profesionales.
          </p>`,
    expTitle: 'Experiencia',
    timeline: [
      {
        range: '2019 – 2022',
        role: 'Autónomo',
        descHtml:
          'Digitalización de negocios, gestión de proyectos técnicos y mantenimiento de sistemas.'
      },
      {
        range: '2012 – 2014',
        role: 'MutuaSAD',
        descHtml:
          'Administración WordPress, comercio electrónico (WooCommerce / PrestaShop) y soporte microinformático y de redes.'
      },
      {
        range: '2001 – 2026',
        role: 'Trayectoria adicional',
        descHtml: `Más de dos décadas aportando <strong>madurez profesional</strong> y
                <strong>capacidad de liderazgo</strong> como oficial especialista en entornos
                industriales y en <strong>carpintería técnica</strong>, con fuerte orientación a la
                calidad, la coordinación y la resolución de problemas complejos.`,
        span: true
      }
    ],
    stackTitle: 'Stack técnico',
    pdfHide: 'Ocultar CV en PDF',
    pdfShow: 'Ver CV original en PDF',
    pdfIframeTitle: 'CV de Moisés Valero (PDF)',
    pdfHintBefore: 'Si no se muestra el documento, ',
    pdfHintLink: 'ábrelo en una pestaña nueva'
  }
};
