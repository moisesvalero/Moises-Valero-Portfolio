import type { SiteLocale } from '$lib/i18n/site-locale';

export type SitePageGroup = 'landing' | 'portfolio' | 'project' | 'support' | 'legal';

export type SitePage = {
  /** Ruta canónica (sin barra final salvo `/`). */
  path: string;
  /** Clave i18n del título (puede no existir si se prefiere literal). */
  titleKey?: string;
  /** Título literal (ES) si no hay clave i18n; usado en llms.txt y sitemap fallback. */
  titleEs?: string;
  /** Título literal (EN) — sólo si la página soporta EN como canónica. */
  titleEn?: string;
  /** Descripción literal (ES). */
  descEs?: string;
  /** Descripción literal (EN). */
  descEn?: string;
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: number;
  group: SitePageGroup;
  /** Locales en los que esta URL es canónica/indexable. */
  locales?: SiteLocale[];
  /** Si false: no se incluye en sitemap.xml ni llms.txt. */
  indexable?: boolean;
  /** Si false: no se genera twin Markdown AEO (`/ruta.md`). Default true en páginas públicas. */
  aeoTwin?: boolean;
};

/**
 * Registro central de páginas indexables. Las URLs con `locales` se emiten con
 * `<xhtml:link hreflang>` apuntando a sí mismas (el cambio de idioma se hace
 * por cookie, no por URL). Las páginas sólo en español se omiten en hreflang.
 *
 * Para añadir una página nueva al GEO: añade una entrada aquí.
 */
export const sitePages: SitePage[] = [
  {
    path: '/',
    titleEs: 'Moisés Valero — Desarrollador Web',
    titleEn: 'Moisés Valero — Web Developer',
    descEs:
      'Portfolio profesional de Moisés Valero. Desarrollo web con SvelteKit y WordPress, SEO técnico, rendimiento e integraciones.',
    descEn:
      'Moisés Valero portfolio. Web development with SvelteKit and WordPress, technical SEO, performance and IT support.',
    changefreq: 'weekly',
    priority: 1.0,
    group: 'portfolio',
    locales: ['es', 'en']
  },
  {
    path: '/blog',
    titleEs: 'Blog técnico de desarrollo web',
    descEs:
      'Artículos de Moisés Valero sobre desarrollo web, rendimiento, seguridad, SEO técnico y arquitectura de contenido.',
    changefreq: 'weekly',
    priority: 0.82,
    group: 'support',
    locales: ['es']
  },
  {
    path: '/tools/analizador-web',
    titleEs: 'Analizador web técnico',
    descEs:
      'Herramienta propia para auditar rendimiento web con PageSpeed, métricas Core Web Vitals y señales técnicas.',
    changefreq: 'monthly',
    priority: 0.78,
    group: 'portfolio',
    locales: ['es']
  },
  {
    path: '/diseno-web',
    titleEs: 'Diseño web profesional para captar clientes',
    descEs:
      'Servicio de diseño web orientado a conversión, velocidad y SEO. Landings y webs corporativas para crecer a nivel nacional.',
    changefreq: 'weekly',
    priority: 0.45,
    group: 'landing',
    locales: ['es']
  },
  {
    path: '/diseno-web-alcoy',
    titleEs: 'Diseño web en Alcoy para captar clientes',
    descEs:
      'Diseño web en Alcoy y Alicante orientado a conversión y SEO local. Webs rápidas, mantenibles y con soporte real.',
    changefreq: 'weekly',
    priority: 0.45,
    group: 'landing',
    locales: ['es']
  },
  {
    path: '/diseno-web-alcoy/articulos',
    titleEs: 'Artículos de apoyo SEO local en Alcoy',
    descEs:
      'Guías prácticas para mejorar velocidad, seguridad y posicionamiento local de webs en Alcoy.',
    changefreq: 'weekly',
    priority: 0.2,
    group: 'support',
    locales: ['es'],
    indexable: false
  },
  {
    path: '/proyectos/vshield',
    titleEs: 'V-Shield — Caso de estudio',
    titleEn: 'V-Shield — Case study',
    descEs: 'Landing de ciberseguridad con terminal interactiva y formulario sin plugins.',
    descEn: 'Cybersecurity landing with interactive terminal and plugin-free contact form.',
    changefreq: 'monthly',
    priority: 0.7,
    group: 'project',
    locales: ['es', 'en']
  },
  {
    path: '/proyectos/ember-iron',
    titleEs: 'Ember & Iron — Caso de estudio',
    titleEn: 'Ember & Iron — Case study',
    descEs: 'Web para herrería artesanal con foco en performance y catálogo visual.',
    descEn: 'Website for an artisan blacksmith focused on performance and visual catalog.',
    changefreq: 'monthly',
    priority: 0.7,
    group: 'project',
    locales: ['es', 'en']
  },
  {
    path: '/proyectos/galeria-nova',
    titleEs: 'Galería Nova — Caso de estudio',
    titleEn: 'Galería Nova — Case study',
    descEs: 'Galería artística con scroll experiencial y galería accesible.',
    descEn: 'Art gallery with experiential scroll and accessible gallery.',
    changefreq: 'monthly',
    priority: 0.7,
    group: 'project',
    locales: ['es', 'en']
  },
  {
    path: '/proyectos/chatbot',
    titleEs: 'Chatbot inteligente — Caso de estudio',
    titleEn: 'Smart chatbot — Case study',
    descEs: 'Asistente conversacional integrado con flujos de captación.',
    descEn: 'Conversational assistant integrated with lead funnels.',
    changefreq: 'monthly',
    priority: 0.7,
    group: 'project',
    locales: ['es', 'en']
  },
  {
    path: '/privacidad',
    titleEs: 'Política de privacidad',
    titleEn: 'Privacy policy',
    descEs: 'Política de privacidad y tratamiento de datos según RGPD.',
    descEn: 'Privacy policy and GDPR-compliant data treatment.',
    changefreq: 'yearly',
    priority: 0.3,
    group: 'legal',
    locales: ['es', 'en']
  },
  {
    path: '/cookies',
    titleEs: 'Política de cookies',
    titleEn: 'Cookies policy',
    descEs: 'Información sobre el uso de cookies y consentimiento.',
    descEn: 'Information about cookies usage and consent.',
    changefreq: 'yearly',
    priority: 0.3,
    group: 'legal',
    locales: ['es', 'en']
  }
];

/** Páginas indexables (sirven para sitemap, llms.txt, listados). */
export function publicPages(): SitePage[] {
  return sitePages.filter((p) => p.indexable !== false);
}

/** Páginas con twin Markdown AEO habilitado. */
export function pagesWithTwins(): SitePage[] {
  return publicPages().filter((p) => p.aeoTwin !== false);
}

export { markdownTwinPath } from '$lib/aeo/paths';

/** Páginas filtradas por grupo. */
export function pagesByGroup(group: SitePageGroup): SitePage[] {
  return publicPages().filter((p) => p.group === group);
}
