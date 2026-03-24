import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';

export const landingAlcoyDefaults: LandingDisenoWebAlcoy = {
  sectionOrder: ['hero', 'services', 'benefits', 'cases', 'faq', 'finalCta'],
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
    title: 'Diseño web en Alcoy',
    subtitle:
      'Diseño webs rápidas, claras y orientadas a resultados para negocios de Alcoy y Alicante. WordPress o SvelteKit según tu proyecto, presencial o remoto.',
    visualTitle: 'Web comercial + tecnologia seria',
    visualDescription:
      'Diseño, desarrollo web en Alcoy, SEO local y stack WordPress/SvelteKit para resultados medibles.',
    visualImageSrc: '/imagenes/captura-portfolio_ember-scaled.avif',
    visualImageAlt: 'Muestra visual de proyecto web profesional',
    cta: {
      label: 'Presupuesto rápido',
      href: '/api/contact/whatsapp',
      secondaryLabel: 'Ver servicios',
      secondaryHref: '#services'
    }
  },
  services: {
    heading: 'Servicios de diseño web en Alcoy',
    items: [
      {
        title: 'Web profesional',
        description:
          'Diseño de landings y webs corporativas enfocadas a captar contactos, explicar servicios y transmitir confianza.'
      },
      {
        title: 'Tienda online WooCommerce',
        description:
          'Tiendas listas para vender con Stripe, envíos, impuestos y panel autogestionable.'
      },
      {
        title: 'WordPress, SvelteKit y más',
        description:
          'Elijo la tecnología según tu proyecto: WordPress para autogestión o SvelteKit para máximo rendimiento.'
      }
    ]
  },
  benefits: {
    heading: 'Webs rápidas que ayudan a vender más',
    items: [
      {
        title: 'Más contactos reales',
        description: 'Estructura y llamadas a la acción para generar más mensajes y llamadas.'
      },
      {
        title: 'Más confianza en tu marca',
        description: 'Diseño profesional y claro para que tu negocio se vea serio y fiable.'
      },
      {
        title: 'SEO técnico desde el inicio',
        description: 'Velocidad y buena estructura técnica desde el primer día.'
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
        question: '¿En cuánto tiempo estará lista mi web?',
        answer:
          'En la mayoría de casos, entre 2 y 4 semanas. El plazo exacto depende del alcance, las funcionalidades y la entrega de contenidos.'
      },
      {
        question: '¿Trabajas con WordPress o desarrollo a medida?',
        answer:
          'Sí. WordPress cuando priorizas facilidad de gestión, y SvelteKit/headless cuando buscas máximo rendimiento, SEO técnico y una experiencia premium.'
      },
      {
        question: '¿La web viene optimizada para SEO local en Alcoy?',
        answer:
          'Sí. Se trabaja estructura, headings, copy local y rendimiento para posicionar en Alcoy y Alicante sin sobreoptimizar.'
      }
    ]
  },
  finalCta: {
    heading: '¿Hablamos de tu proyecto web en Alcoy?',
    text: 'Te paso una propuesta clara, sin tecnicismos ni letra pequeña.',
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
