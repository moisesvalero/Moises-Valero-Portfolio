import { getCliClient } from 'sanity/cli';
import { getAllCaseStudies } from '../src/lib/data/case-studies';
import { sitePortfolioDefaults } from '../src/lib/data/site-portfolio-defaults';

type LocaleString = { es: string; en?: string };
type LocaleText = { es: string; en?: string };

const asLocaleString = (value?: string): LocaleString => ({ es: value || '' });
const asLocaleText = (value?: string): LocaleText => ({ es: value || '' });
const keyOf = (prefix: string, index: number) => `${prefix}-${index + 1}`;

function mapSitePortfolioDocument() {
	const site = sitePortfolioDefaults;
	return {
		_id: 'portfolioSite',
		_type: 'sitePortfolio',
		title: 'Web principal',
		header: {
			logoText: site.header.logoText,
			logoHref: site.header.logoHref,
			navItems: site.header.navItems.map((item, index) => ({
				_key: keyOf('nav', index),
				...item
			}))
		},
		seo: site.seo,
		hero: {
			cvHref: site.hero.cvHref,
			label: site.hero.label,
			title: site.hero.title,
			subtitle: site.hero.subtitle,
			bio: site.hero.bio
		},
		about: site.about,
		services: {
			meta: asLocaleString(site.services.meta)
		},
		techStack: {
			meta: asLocaleString(site.techStack.meta),
			title: asLocaleString(site.techStack.title)
		},
		projects: {
			meta: asLocaleString(site.projects.meta),
			title: asLocaleString(site.projects.title),
			projects: site.projects.projects.map((project, index) => ({
				_key: keyOf('featured-project', index),
				sortOrder: index,
				imageSrc: project.imageSrc,
				imageAlt: project.imageAlt,
				title: asLocaleString(project.title),
				description: asLocaleText(project.description),
				tags: project.tags,
				linkLabel: asLocaleString(project.linkLabel),
				destinationUrl: project.href
			}))
		},
		contact: site.contact,
		footer: site.footer,
		careerModal: {
			pdfHref: site.careerModal.pdfHref,
			closeAria: asLocaleString(site.careerModal.closeAria),
			title: asLocaleString(site.careerModal.title),
			profileTitle: asLocaleString(site.careerModal.profileTitle),
			profileHtml: asLocaleText(site.careerModal.profileHtml),
			expTitle: asLocaleString(site.careerModal.expTitle),
			timeline: site.careerModal.timeline.map((item, index) => ({
				_key: keyOf('career-timeline', index),
				range: item.range,
				role: asLocaleString(item.role),
				descHtml: asLocaleText(item.descHtml),
				span: item.span === true
			})),
			stackTitle: asLocaleString(site.careerModal.stackTitle),
			pdfHide: asLocaleString(site.careerModal.pdfHide),
			pdfShow: asLocaleString(site.careerModal.pdfShow),
			pdfIframeTitle: asLocaleString(site.careerModal.pdfIframeTitle),
			pdfHintBefore: asLocaleString(site.careerModal.pdfHintBefore),
			pdfHintLink: asLocaleString(site.careerModal.pdfHintLink)
		}
	};
}

function mapCaseStudyDocuments() {
	return getAllCaseStudies().map((study) => ({
		_id: `caseStudy.${study.slug}`,
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: true,
		homeSortOrder: 0,
		title: study.title,
		slug: { _type: 'slug', current: study.slug },
		seoDescription: study.seoDescription,
		heroTag: study.heroTag,
		heroDescription: study.heroDescription,
		tags: study.tags,
		images: study.images,
		metrics: study.metrics.map((metric, index) => ({
			_key: keyOf('metric', index),
			...metric
		})),
		reto: study.reto,
		hice: study.hice,
		resultado: study.resultado,
		stack: study.stack,
		liveUrl: study.liveUrl,
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	}));
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const siteDoc = mapSitePortfolioDocument();

	const caseStudies = mapCaseStudyDocuments();

	await client.createOrReplace(siteDoc);

	for (const study of caseStudies) {
		await client.createOrReplace(study);
	}

	console.log(
		`Seed completado: sitio principal y ${caseStudies.length} proyecto(s) cargados en Sanity.`
	);
}

main().catch((error) => {
	console.error('Error cargando seed inicial en Sanity:', error);
	process.exit(1);
});
