import type { StructureResolver } from 'sanity/structure';

/**
 * Estructura estilo "CPT + ACF":
 * - Sitio (singleton) con id fijo `portfolioSite`
 * - Proyectos (case studies) como lista normal
 */
export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Contenido del sitio')
    .items([
      S.listItem()
        .title('🏠 Web principal')
        .id('sitePortfolioSingleton')
        .child(
          S.document()
            .schemaType('sitePortfolio')
            .documentId('portfolioSite')
            .title('🏠 Web principal')
        ),
      S.listItem()
        .title('📍 Landing - Diseño web en Alcoy')
        .id('landingDisenoWebAlcoySingleton')
        .child(
          S.document()
            .schemaType('landingDisenoWebAlcoy')
            .documentId('landingDisenoWebAlcoy')
            .title('📍 Landing - Diseño web en Alcoy')
        ),
      S.listItem()
        .title('📝 Articulos SEO local (Alcoy)')
        .id('landingSupportArticleList')
        .child(S.documentTypeList('landingSupportArticle').title('📝 Articulos SEO local (Alcoy)')),
      S.divider(),
      S.documentTypeListItem('caseStudy').title('🧱 Proyectos')
    ]);

