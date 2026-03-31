/**
 * Documento singleton recomendado: `_id == "portfolioSite"` y `_type == "sitePortfolio"`.
 * Si no existe ese ID, se usa el documento `sitePortfolio` mas reciente para facilitar la puesta en marcha.
 * Servicios y proyectos pueden traer `{ es, en }`. El idioma por defecto es **es** (SEO); EN solo con cookie del header.
 * Tras cada load (`depends` + `LOCALE_LOAD_DEPENDENCY`) se mapea y, si aplica, la capa EN en `map-site-portfolio` sin sustituir `seo`.
 */
export const sitePortfolioQuery = `coalesce(
  *[_type == "sitePortfolio" && _id == "portfolioSite"][0],
  *[_type == "sitePortfolio"] | order(_updatedAt desc)[0]
){
  header,
  seo,
  hero,
  about,
  services,
  techStack,
  quality,
  projects{
    meta,
    title,
    "projects": select(
      count(*[
        _type == "caseStudy" &&
        defined(slug.current) &&
        coalesce(showOnHome, true) == true
      ]) > 0 => *[
        _type == "caseStudy" &&
        defined(slug.current) &&
        coalesce(showOnHome, true) == true
      ] | order(coalesce(homeSortOrder, 999) asc, _updatedAt desc){
        "thumbnail": images.principalImage,
        "imageSrc": coalesce(
          images.principal,
          "/imagenes/captura-novakit_ember.avif"
        ),
        "imageAlt": coalesce(title, "Proyecto"),
        "destinationUrl": "/proyectos/" + slug.current,
        "title": { "es": coalesce(title, "Proyecto"), "en": coalesce(title, "Project") },
        "description": {
          "es": coalesce(heroDescription, seoDescription, ""),
          "en": coalesce(heroDescription, seoDescription, "")
        },
        "tags": coalesce(tags, []),
        "linkLabel": { "es": "Ver proyecto", "en": "View project" }
      },
      count(coalesce(projects, [])) > 0 => coalesce(projects[] | order(sortOrder asc), []),
      []
    )
  },
  contact,
  footer,
  careerModal
}`;
