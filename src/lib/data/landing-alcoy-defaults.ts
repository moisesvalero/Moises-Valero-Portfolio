import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';

export const landingAlcoyDefaults: LandingDisenoWebAlcoy = {
  sectionOrder: ['hero', 'services', 'benefits', 'cases', 'faq', 'finalCta'],
  seo: {
    title: 'Diseño web en Alcoy para captar clientes | Moisés Valero',
    description:
      'Servicio de diseño web en Alcoy orientado a conversión y SEO local. Desarrollo web en Alcoy y Alicante con enfoque en rendimiento, negocio y soporte real.',
    ogTitle: 'Diseño web en Alcoy para empresas y profesionales',
    ogDescription:
      'Landing pages y webs corporativas con enfoque comercial, SEO local y mantenimiento continuo para Alcoy y Alicante.',
    ogImage: '/og-image.png',
    canonicalPath: '/diseno-web-alcoy',
    twitterCard: 'summary_large_image'
  },
  hero: {
    badge: 'Diseño web en Alcoy y Alicante',
    title: 'Diseño web en Alcoy',
    subtitle:
      'Creo páginas que dan vida a tus ideas y proyectos. Una presencia profesional diseñada para que tu trabajo destaque desde el primer día.',
    visualTitle: 'Web comercial + tecnología seria',
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
    pricingFootnote: 'Precios base (IVA no incluido)',
    items: [
      {
        title: 'Web One-Page',
        offerBadge: 'Oferta de lanzamiento',
        subtitle: 'Presencia Rápida y Efectiva',
        summary:
          'La opción más rápida y efectiva para digitalizar tu negocio en Alcoy. Ideal para captar clientes por WhatsApp y Google de forma profesional.',
        priceFrom: '290 €',
        hideFromLabel: true,
        delivery: '72 horas',
        details: [
          'Estructura de alto impacto: Diseño en una sola página (Inicio, Servicios, Sobre mí y Contacto) optimizado para convertir visitas en clientes.',
          'Tecnología SvelteKit: Velocidad de carga extrema (mejor posicionamiento en Google y mejor experiencia de usuario).',
          'SEO Local Alcoy: Configuración estratégica para que tu negocio aparezca en las búsquedas de la zona.',
          'Conexión Directa: Botón de WhatsApp integrado para recibir consultas inmediatas en tu teléfono.',
          'Diseño Adaptativo: Visualización perfecta y fluida en móvil, tablet y ordenador.',
          'Seguridad Blindada: Al evitar arquitecturas lentas y pesadas, tu web es nativamente más segura y estable.'
        ],
        note:
          'Nota: Este plan no incluye panel de gestión. Los cambios se realizan bajo demanda (ver mantenimiento). Dominio y alojamiento no incluidos: puedes contratarlos tú o usar nuestro Pack Cloud para una gestión integral.',
        modalActionLabel: '¡Empezar mi proyecto ahora!',
        modalActionHref: '/api/contact/whatsapp'
      },
      {
        title: 'Web Profesional',
        subtitle: 'Panel Autogestionable',
        summary: 'La opción estrella para empresas que quieren crecer y gestionar su propio contenido.',
        priceFrom: '650 €',
        delivery: '2-3 semanas',
        details: [
          'Estructura Multipágina: Hasta 6 secciones independientes (Home, Servicios, Blog, Portfolio, Equipo y Contacto) para una imagen corporativa sólida.',
          'Panel de Control (Sanity o WordPress): Libertad total para editar textos, subir imágenes o publicar artículos sin depender de nadie.',
          'Optimización de Textos: Revisión estratégica de tus contenidos para que tu mensaje sea profesional y venda más.',
          'Rendimiento Premium: Optimización avanzada de imágenes y código para una carga instantánea.',
          'Formación 1:1 Incluida: Sesión guiada o video-tutorial personalizado para que aprendas a gestionar tu web en 10 minutos.',
          'Cumplimiento Legal Base: Configuración de RGPD (cookies y avisos legales estándar) para cumplir con la normativa.'
        ],
        note:
          'Incluye la configuración completa del panel de gestión y la formación necesaria para que seas 100% autónomo. Dominio y alojamiento gestionables vía Pack Cloud.',
        modalActionLabel: '¡Quiero mi Web Profesional!',
        modalActionHref: '/api/contact/whatsapp'
      },
      {
        title: 'Proyectos a Medida',
        subtitle: 'E-commerce y Desarrollo Avanzado',
        summary:
          'Para negocios que necesitan vender online, gestionar usuarios o implementar funciones específicas que van más allá de una web convencional.',
        priceFrom: '1.100 €',
        delivery: 'Según alcance del proyecto',
        details: [
          'Tienda Online Completa: Configuración profesional de pasarelas de pago (Stripe, Tarjeta, PayPal) y flujos de venta optimizados.',
          'Gestión de Stock y Pedidos: Panel intuitivo para controlar tus productos, ventas y envíos de forma centralizada.',
          'Desarrollos Especiales: Sistemas de reservas, áreas privadas para clientes, buscadores avanzados o integraciones externas.',
          'Migraciones Técnicas: Traslado de webs antiguas a tecnologías modernas sin perder posicionamiento en Google.',
          'Consultoría y Estrategia: Soporte técnico prioritario para definir la mejor arquitectura para tu empresa.',
          'Escalabilidad Total: Proyectos preparados para crecer en tráfico y funcionalidades sin quedarse obsoletos.'
        ],
        modalActionLabel: '¡Consultar mi proyecto a medida!',
        modalActionHref: '/api/contact/whatsapp'
      }
    ]
  },
  maintenance: {
    heading: 'Mantenimiento y soporte post-venta',
    lead: 'Opciones para mantener tu web al día con tranquilidad y sin sorpresas.',
    pricingFootnote: 'Precios base (IVA no incluido)',
    items: [
      {
        title: 'Pago por intervención (bajo demanda)',
        price: '50 €/hora',
        icon: 'construction',
        detail:
          'Fracciones mínimas de 30 min. Incluye cambios de texto, nuevas imágenes, actualizaciones puntuales o consultas técnicas.',
        modalTitle: 'Detalles del Soporte Puntual',
        checklist: [
          'Flexibilidad Total: Paga solo cuando necesites un cambio o reparación.',
          'Fracciones de 30 min: Solo pagas por el tiempo real de trabajo.',
          'Actualización de Contenidos: Edición de textos, fotos o nuevos apartados.',
          'Consultoría Técnica: Ayuda directa con correos o dudas digitales.',
          'Sin Compromiso: Sin cuotas mensuales ni permanencia.'
        ],
        note: 'No incluye renovación de dominio ni servidor.',
        actionLabel: 'Contratar Soporte',
        actionHref: '/api/contact/whatsapp'
      },
      {
        title: 'Mantenimiento y Cloud',
        price: '120 €/año',
        icon: 'cloud_done',
        detail:
          'La solución integral para tu tranquilidad. Incluye dominio, hosting de alta velocidad, certificado SSL y soporte prioritario vía WhatsApp.',
        modalTitle: 'Detalles del Pack Cloud Integral',
        checklist: [
          'Gestión de Dominio: Incluye renovación anual de tu .es o .com.',
          'Infraestructura Premium: Alojamiento rápido y estable (Vercel).',
          'Certificado SSL: Web siempre segura con el candado HTTPS.',
          'Copias de Seguridad: Tus datos siempre protegidos y recuperables.',
          'Soporte por WhatsApp: Comunicación directa y prioritaria para dudas.',
          'Monitorización 24/7: Revisión constante de que todo funcione.'
        ],
        note: 'La opción más cómoda para olvidarte de gestiones técnicas.',
        actionLabel: 'Activar Pack Cloud',
        actionHref: '/api/contact/whatsapp'
      }
    ]
  },
  benefits: {
    heading: 'Diseño webs que impulsan negocios en Alcoy',
    buttonLabel: 'Solicitar mi presupuesto gratuito',
    buttonUrl: '/api/contact/whatsapp',
    items: [
      {
        title: 'Captación de clientes reales',
        description:
          'Optimizo tu web para que tus visitas se conviertan en mensajes de WhatsApp y llamadas directas.'
      },
      {
        title: 'Confianza para tu marca',
        description:
          'Proyecto una imagen profesional y moderna que transmite la seguridad que tus clientes necesitan para elegirte.'
      },
      {
        title: 'Estrategia y SEO Local',
        description:
          'Desarrollo webs ultrarrápidas y optimizadas para que Google te sitúe en las primeras posiciones de Alcoy.'
      }
    ]
  },
  cases: {
    heading: 'Casos y proyectos relacionados',
    items: [
      {
        title: 'Landing de servicios B2B',
        summary: 'Rediseño completo de mensaje, estructura y CTA para un servicio técnico.',
        outcome: 'Mejor tasa de contacto y más consultas cualificadas.',
        href: 'https://v-shield.moisesvalero.es',
        linkLabel: 'Ver caso'
      },
      {
        title: 'Web comercial para marca local',
        summary: 'Trabajo de UX y contenido para mostrar oferta de forma más clara.',
        outcome: 'Aumento del tiempo en página y mejor percepción de marca.',
        href: 'https://ember.moisesvalero.es',
        linkLabel: 'Ver proyecto'
      }
    ]
  },
  faq: {
    heading: 'Preguntas frecuentes',
    items: [
      {
        question: '¿La web será 100% de mi propiedad?',
        answer:
          'Absolutamente sí. Al finalizar el proyecto y completar el pago, la web es tuya. Te entrego todas las claves de acceso y la propiedad de los archivos. No "secuestro" clientes; mi objetivo es que te quedes conmigo por la calidad de mi servicio, no por obligación técnica.'
      },
      {
        question: '¿En cuánto tiempo estará lista mi web?',
        answer:
          'Depende del plan elegido. Una One-Page suele estar lista en 72 horas una vez recibido el material. Para una Web Profesional, el plazo medio es de 2 a 3 semanas. Cumplo los plazos a rajatabla porque entiendo que cada día que tu web no está online, es una oportunidad de venta perdida.'
      },
      {
        question: '¿Tendré que pagar cuotas mensuales obligatorias?',
        answer:
          'No. No hay "letras pequeñas" ni cuotas ocultas. Una vez pagada la web, es tuya. Lo único que necesita cualquier web para funcionar es un dominio y un servidor (que se renuevan anualmente). Puedes gestionarlo tú o dejarlo en mis manos con el Pack Cloud (180 €/año) para olvidarte de líos técnicos.'
      },
      {
        question: '¿Mi web se verá bien en móviles y tablets?',
        answer:
          'Por supuesto. Hoy en día, más del 80% de tus clientes te buscarán desde el móvil. Todas mis webs son nativamente responsivas, lo que significa que el diseño se adapta con fluidez y velocidad a cualquier pantalla, garantizando una experiencia de usuario perfecta.'
      },
      {
        question: '¿Qué pasa si necesito hacer cambios en el futuro?',
        answer:
          'Tienes dos opciones. Si eliges la Web Profesional, tendrás un panel de gestión (Sanity/WordPress) para que tú mismo cambies textos y fotos sin coste. Si prefieres que lo haga yo, tienes mi Soporte Puntual por horas. Nunca te quedarás solo con un problema técnico.'
      },
      {
        question: '¿Cómo me ayuda la web a salir en Google?',
        answer:
          'Aplico SEO técnico desde la primera línea de código. Esto incluye optimización de velocidad (vital para Google), estructura de encabezados correcta y configuración para el buscador. Si tu negocio está en Alcoy, trabajaremos el SEO Local para que los clientes de la zona te encuentren antes que a tu competencia.'
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
    businessName: 'Moisés Valero - Desarrollo Web',
    serviceType: 'Diseño y desarrollo web',
    areaServed: ['Alcoy', 'Alicante'],
    addressLocality: 'Alcoy',
    addressRegion: 'Alicante',
    addressCountry: 'ES',
    email: 'info@moisesvalero.es'
  }
};
