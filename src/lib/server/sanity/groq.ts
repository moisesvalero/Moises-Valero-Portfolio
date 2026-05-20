/**
 * Consulta un documento `caseStudy` por slug.
 * Espejo del tipo `CaseStudy` ($lib/types/case-study.ts), pensado para replicar el CPT+ACF en Sanity.
 *
 * Esquema recomendado en Sanity Studio (nombres de campo alineados con el tipo TS):
 * - _type: "caseStudy"
 * - slug: slug (único)
 * - title: string
 * - seoDescription: string (opcional)
 * - heroTag: string
 * - heroDescription: string
 * - tags: array of string
 * - images: object { principal, secondary1, secondary2 } — usa tipo `url` o string con la URL final (CDN o WP)
 * - metrics: array of { value, label } (idealmente 4 ítems)
 * - reto, hice, resultado: object { title: string, bodyHtml: string }
 * - stack: array of string
 * - liveUrl: string
 * - repoUrl: string (opcional)
 */
export const caseStudyBySlugQuery = `*[_type == "caseStudy" && slug.current == $slug][0]{
  "slug": slug.current,
  title,
  titleEn,
  seoDescription,
  seoDescriptionEn,
  heroTag,
  heroTagEn,
  heroDescription,
  heroDescriptionEn,
  tags,
  tagsEn,
  images,
  metrics,
  metricsEn,
  reto,
  retoEn,
  hice,
  hiceEn,
  resultado,
  resultadoEn,
  stack,
  stackEn,
  liveUrl,
  repoUrl
}`;
