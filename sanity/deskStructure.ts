import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import type { StructureResolver } from 'sanity/structure';

/**
 * Estructura estilo "CPT + ACF":
 * - Sitio (singleton) con id fijo `portfolioSite`
 * - Guías (landing support articles) como lista editorial
 * - Proyectos (case studies) con drag and drop
 */
export const deskStructure: StructureResolver = (S, context) =>
	S.list()
		.title('Contenido del sitio')
		.items([
			S.listItem()
				.title('Web principal')
				.id('sitePortfolioSingleton')
				.child(
					S.document()
						.schemaType('sitePortfolio')
						.documentId('portfolioSite')
						.title('Web principal')
				),
			S.listItem()
				.title('Leads analizador web')
				.id('analyzerLeadList')
				.child(
					S.documentTypeList('analyzerLead')
						.title('Leads analizador web')
						.defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
				),
			S.divider(),
			S.documentTypeListItem('landingSupportArticle').title('Guías / Artículos'),
			orderableDocumentListDeskItem({
				type: 'caseStudy',
				title: 'Proyectos',
				id: 'orderable-case-studies',
				S,
				context
			})
		]);
