import type { CaseStudy } from '$lib/types/case-study';

/**
 * Datos estáticos del CPT WordPress `proyectos` (plantilla case study) + ACF.
 *
 * Cómo pasar el proyecto ACF a esta web:
 * 1. En WP, copia el HTML/texto de cada grupo ACF (reto, hice, resultado) tal como lo devuelve el editor.
 * 2. Rellena un objeto `CaseStudy` por slug (ver `$lib/types/case-study.ts`).
 * 3. Mapeo típico ACF → TS: título del post → title; slug → slug; campos hero → heroTag, heroDescription;
 *    galería o URLs → images.principal / secondary1 / secondary2; repeater de stats → metrics[4];
 *    lista de tech → stack; URL demo → liveUrl; excerpt o Yoast → seoDescription.
 * 4. El grid del portfolio ya usa `caseStudySlug: 'novakit'` (u otro) para enlazar a `/proyectos/[slug]`.
 *
 * CMS Sanity (opcional): si defines `SANITY_PROJECT_ID` y `SANITY_DATASET` en `.env`, la ruta
 * `/proyectos/[slug]` intentará leer primero el documento `_type == "caseStudy"`; si no existe,
 * se usa este archivo como respaldo. Esquema GROQ: `$lib/server/sanity/groq.ts`.
 */
const studies: Record<string, CaseStudy> = {
  novakit: {
    slug: 'novakit',
    title: 'NovaKit landing con SvelteKit',
    seoDescription:
      'Case study: landing de UI toolkit con SvelteKit, animaciones CSS puras, mockups interactivos, Spline 3D e i18n. Proyecto en https://novakit.moisesvalero.es',
    heroTag: 'UI toolkit · SvelteKit',
    heroDescription:
      'Mi primer proyecto fuera de WordPress: una landing de producto con SvelteKit, animaciones CSS, mockups interactivos y multi-idioma nativo.',
    tags: ['SvelteKit', 'UI/UX', 'CSS Animations', 'i18n'],
    images: {
      principal: '/imagenes/captura-novakit_ember.avif',
      secondary1: '/imagenes/captura2novakit_ember.webp',
      secondary2: '/imagenes/novakit3_ember.webp'
    },
    metrics: [
      { value: '247', label: 'Componentes UI' },
      { value: '100%', label: 'CSS puro' },
      { value: '2', label: 'Idiomas' },
      { value: 'Mobile', label: 'First' }
    ],
    reto: {
      title: 'Demostrar dominio real de SvelteKit sin un cliente detrás.',
      bodyHtml:
        '<p>Necesitaba una pieza de portfolio que fuera más que una web estática: algo que mostrara arquitectura de componentes, estado, rendimiento y criterio de producto. Sin brief de cliente, el reto era imponerme un estándar alto y que la landing hablara por sí sola ante reclutadores o equipos técnicos.</p>'
    },
    hice: {
      title: 'Una landing page de UI toolkit completa con mockups interactivos y sistema de diseño propio.',
      bodyHtml:
        '<p>Desarrollé la landing con SvelteKit y TypeScript, con secciones animadas en CSS, mockups tipo ventana de navegador y bloques reutilizables. Integré escena 3D con Spline, sistema i18n para español e inglés, y tests con Vitest donde aportaba valor al flujo. Todo pensado mobile-first y con foco en Core Web Vitals.</p>'
    },
    resultado: {
      title: 'Del diseño a la implementación técnica: el salto al stack moderno.',
      bodyHtml:
        '<p>El resultado es un sitio desplegable, mantenible y alineado con cómo trabajo hoy: stack moderno, menos dependencias innecesarias y una base clara para iterar. Sirve como demo viva del tipo de interfaces y disciplina que puedo aportar en producto o en equipo de desarrollo.</p>'
    },
    stack: ['SvelteKit', 'TypeScript', 'CSS animations', 'Spline 3D', 'i18n', 'Vitest'],
    liveUrl: 'https://novakit.moisesvalero.es',
    repoUrl: ''
  }
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return studies[slug];
}

export function getAllCaseStudySlugs(): string[] {
  return Object.keys(studies);
}

export function getAllCaseStudies(): CaseStudy[] {
  return Object.values(studies);
}
