/** Documento singleton recomendado: `_id == "portfolioSite"` y `_type == "sitePortfolio"`. */
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
