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
  header{
    logoText,
    logoHref,
    navItems
  },
  seo,
  hero,
  about,
  services{
    meta
  },
  techStack{
    meta,
    title
  },
  projects{
    meta,
    title,
    intro,
    maxHomeProjects,
    archiveLinkLabel,
    archiveHref,
    "projects": (
      *[
        _type == "caseStudy" &&
        defined(slug.current) &&
        coalesce(showOnHome, true) == true
      ] | order(coalesce(homeSortOrder, 999) asc, _updatedAt desc){
        "thumbnail": coalesce(images.cardImage, images.principalImage),
        "imageSrc": coalesce(
          images.principal,
          "/imagenes/captura-novakit_ember.avif"
        ),
        "imageAlt": coalesce(title, "Proyecto"),
        "destinationUrl": "/proyectos/" + slug.current,
        "title": {
          "es": coalesce(title, "Proyecto"),
          "en": coalesce(titleEn, "")
        },
        "description": {
          "es": coalesce(heroDescription, seoDescription, ""),
          "en": coalesce(heroDescriptionEn, seoDescriptionEn, "")
        },
        "homeLayoutTier": coalesce(
          homeLayoutTier,
          select(
            slug.current == "rebranding-galeria-nova" => "hero",
            homeSortOrder <= 20 => "spotlight",
            "standard"
          )
        ),
        homeEyebrow,
        homeProofLine,
        "homeValueTags": coalesce(homeValueTags, []),
        homeRole,
        homeYear,
        homeComplexity,
        "tags": select(
          count(coalesce(tagsEn, [])) > 0 => coalesce(tagsEn, []),
          coalesce(tags, [])
        ),
        "linkLabel": { "es": "Ver proyecto", "en": "View project" }
      } + coalesce(projects[] | order(sortOrder asc), [])
    )
  },
  contact{
    heading,
    subtitle,
    formModalHeading,
    formModalText,
    formModalSubmitLabel,
    formModalPrivacyLabel,
    formModalSuccessMessage
  },
  footer
}`;
