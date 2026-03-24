import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';

export const landingAlcoyDefaults: LandingDisenoWebAlcoy = {
  sectionOrder: ['hero', 'problemSolution', 'services', 'benefits', 'cases', 'faq', 'finalCta'],
  seo: {
    title: 'Diseno web en Alcoy para captar clientes | Moises Valero',
    description:
      'Servicio de diseno web en Alcoy orientado a conversion y SEO local. Desarrollo web en Alcoy y Alicante con enfoque en rendimiento, negocio y soporte real.',
    ogTitle: 'Diseno web en Alcoy para empresas y profesionales',
    ogDescription:
      'Landing pages y webs corporativas con enfoque comercial, SEO local y mantenimiento continuo para Alcoy y Alicante.',
    ogImage: '/og-image.png',
    canonicalPath: '/diseno-web-alcoy',
    twitterCard: 'summary_large_image'
  },
  hero: {
    badge: 'Diseno web en Alcoy y Alicante',
    title: 'Diseno web en Alcoy que convierte visitas en oportunidades reales',
    subtitle:
      'Creo webs rapidas y orientadas a negocio con SvelteKit y WordPress para pymes y profesionales que quieren mas contactos, mejor presencia y libertad para crecer en Alcoy, Alicante o remoto.',
    visualTitle: 'Web comercial + tecnologia seria',
    visualDescription:
      'Diseño, desarrollo web en Alcoy, SEO local y stack WordPress/SvelteKit para resultados medibles.',
    visualImageSrc: '/imagenes/captura-portfolio_ember-scaled.avif',
    visualImageAlt: 'Muestra visual de proyecto web profesional',
    cta: {
      label: 'Presupuesto rápido',
      href: '/api/contact/whatsapp',
      secondaryLabel: 'Ver proyectos',
      secondaryHref: '/#proyectos'
    }
  },
  problemSolution: {
    heading: 'Si tu web no genera contactos, no esta trabajando para tu negocio',
    intro:
      'Muchas empresas tienen web, pero no una herramienta comercial. Sin estrategia ni estructura, el sitio no posiciona ni transmite confianza.',
    problems: [
      'Web lenta o desactualizada que da mala imagen.',
      'Contenido poco claro, sin propuesta de valor y sin CTA visible.',
      'No aparece para busquedas como diseno web Alcoy o servicios en Alicante.',
      'Dependencia tecnica para cambios simples de contenido.'
    ],
    solutionTitle: 'La solucion: desarrollo web en Alcoy con enfoque en resultados',
    solutionText:
      'Diseno una landing o web corporativa pensada para captar leads: estructura SEO local, mensajes claros, CTA estrategicos y base tecnica solida para crecer.'
  },
  services: {
    heading: 'Servicios principales',
    items: [
      {
        title: 'Landing SEO local',
        description:
          'Pagina orientada a conversion para posicionar tu servicio en Alcoy y Alicante con una propuesta clara y medible.'
      },
      {
        title: 'Web corporativa profesional (SvelteKit o WordPress)',
        description:
          'Sitio completo para presentar tu empresa, servicios, casos y contacto con arquitectura preparada para escalar, ya sea en stack moderno o en WordPress.'
      },
      {
        title: 'Mantenimiento y mejoras continuas',
        description:
          'Soporte tecnico, optimizacion de velocidad y evolucion del contenido sin romper la web ni depender de soluciones improvisadas.'
      }
    ]
  },
  benefits: {
    heading: 'Beneficios que se notan en negocio',
    items: [
      {
        title: 'Mas conversion',
        description: 'CTAs visibles y mensajes comerciales para convertir trafico en conversaciones reales.'
      },
      {
        title: 'Mejor posicionamiento local',
        description:
          'Base SEO on-page y contenidos orientados a terminos como diseno web en Alcoy y desarrollo web en Alcoy.'
      },
      {
        title: 'Web rapida y mantenible',
        description:
          'Codigo limpio y estructura escalable para que tu web no se quede obsoleta en unos meses.'
      },
      {
        title: 'Trabajo cercano y flexible',
        description:
          'Colaboracion para empresas de Alcoy y Alicante, con opcion presencial o remoto segun el proyecto.'
      }
    ]
  },
  cases: {
    heading: 'Casos y proyectos relacionados',
    items: [
      {
        title: 'Landing de servicios B2B',
        summary: 'Rediseño completo de mensaje, estructura y CTA para un servicio tecnico.',
        outcome: 'Mejor tasa de contacto y mas consultas cualificadas.',
        href: 'https://v-shield.moisesvalero.es',
        linkLabel: 'Ver caso'
      },
      {
        title: 'Web comercial para marca local',
        summary: 'Trabajo de UX y contenido para mostrar oferta de forma mas clara.',
        outcome: 'Aumento del tiempo en pagina y mejor percepcion de marca.',
        href: 'https://ember.moisesvalero.es',
        linkLabel: 'Ver proyecto'
      }
    ]
  },
  faq: {
    heading: 'Preguntas frecuentes',
    items: [
      {
        question: 'Cuanto tarda un proyecto de diseno web en Alcoy?',
        answer:
          'Depende del alcance, pero una landing optimizada suele estar entre 2 y 4 semanas, incluyendo contenido, SEO base y ajustes finales.'
      },
      {
        question: 'Trabajas solo en Alcoy?',
        answer:
          'Trabajo con empresas de Alcoy y Alicante de forma cercana, y tambien colaboro en remoto con clientes de otras zonas.'
      },
      {
        question: 'Puedo editar los textos despues?',
        answer:
          'Si. La landing queda conectada a Sanity para editar textos, bloques, FAQs y CTAs sin tocar codigo.'
      },
      {
        question: 'Incluyes mantenimiento?',
        answer:
          'Si, puedo incluir soporte y evolucion continua para mantener la web actualizada, segura y alineada con tus objetivos.'
      }
    ]
  },
  finalCta: {
    heading: 'Hablemos de tu web y de como convertirla en un canal de captacion',
    text: 'Si buscas diseno web en Alcoy con enfoque real en resultados, te preparo una propuesta clara y adaptada a tu negocio.',
    cta: {
      label: 'Solicitar presupuesto',
      href: '/api/contact/whatsapp',
      secondaryLabel: 'Escribirme por email',
      secondaryHref: 'mailto:info@moisesvalero.es'
    }
  },
  contactModal: {
    triggerLabel: 'Prefiero formulario',
    heading: 'Cuéntame tu proyecto',
    text: 'Déjame tus datos y te responderé por email lo antes posible.',
    submitLabel: 'Enviar solicitud',
    successMessage: 'Mensaje enviado. Te responderé en breve.',
    privacyLabel: 'He leído y acepto la política de privacidad.'
  },
  localBusiness: {
    businessName: 'Moises Valero - Desarrollo Web',
    serviceType: 'Diseno y desarrollo web',
    areaServed: ['Alcoy', 'Alicante'],
    addressLocality: 'Alcoy',
    addressRegion: 'Alicante',
    addressCountry: 'ES',
    email: 'info@moisesvalero.es'
  }
};
