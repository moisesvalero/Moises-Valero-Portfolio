/**
 * Documento singleton recomendado: `_id == "portfolioSite"` y `_type == "sitePortfolio"`.
 * Servicios y proyectos pueden traer `{ es, en }`. El idioma por defecto es **es** (SEO); EN solo con cookie del header.
 * Tras cada load (`depends` + `LOCALE_LOAD_DEPENDENCY`) se mapea y, si aplica, la capa EN en `map-site-portfolio` sin sustituir `seo`.
 */
export const sitePortfolioQuery = `*[_type == "sitePortfolio" && _id == "portfolioSite"][0]{
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
    "projects": coalesce(projects[] | order(sortOrder asc), [])
  },
  contact,
  footer
}`;
