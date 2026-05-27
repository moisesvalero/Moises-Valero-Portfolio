/**
 * Sincroniza el documento singleton `portfolioSite` con los textos actuales del repo.
 * Ejecutar desde la raíz:
 *   npx sanity exec sanity/patch-portfolio-site.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { sitePortfolioDefaults } from '../src/lib/data/site-portfolio-defaults';
import { portfolioEnglishDemo } from '../src/lib/data/site-portfolio-locale-en';

type LocaleString = { es: string; en?: string };
type LocaleText = { es: string; en?: string };

const asLocaleString = (value?: string, en?: string): LocaleString => ({
	es: value || '',
	en: en || ''
});
const asLocaleText = (value?: string, en?: string): LocaleText => ({
	es: value || '',
	en: en || ''
});
const keyOf = (prefix: string, index: number) => `${prefix}-${index + 1}`;

function mapPortfolioDocument() {
	const site = sitePortfolioDefaults;
	const en = portfolioEnglishDemo;

	return {
		_id: 'portfolioSite',
		_type: 'sitePortfolio',
		title: 'Web principal',
		header: {
			logoText: asLocaleString(site.header.logoText, en.header.logoText),
			logoHref: site.header.logoHref,
			navItems: site.header.navItems.map((item, index) => ({
				_key: keyOf('nav', index),
				href: item.href,
				openCareerModal: item.openCareerModal === true,
				label: asLocaleString(item.label, en.header.navItems[index]?.label)
			}))
		},
		seo: site.seo,
		hero: {
			cvHref: site.hero.cvHref,
			label: asLocaleString(site.hero.label, en.hero.label),
			title: asLocaleString(site.hero.title, en.hero.title),
			subtitle: asLocaleString(site.hero.subtitle, en.hero.subtitle),
			bio: asLocaleText(site.hero.bio, en.hero.bio),
			ctaPrimaryLabel: asLocaleString(site.hero.ctaPrimaryLabel, en.hero.ctaPrimaryLabel),
			careerCtaLabel: asLocaleString(site.hero.careerCtaLabel, en.hero.careerCtaLabel)
		},
		about: {
			...site.about,
			imageAlt: asLocaleString(site.about.imageAlt, en.about.imageAlt),
			meta: asLocaleString(site.about.meta, en.about.meta),
			title: asLocaleString(site.about.title, en.about.title),
			aboutHtml: asLocaleText(site.about.aboutHtml, en.about.aboutHtml)
		},
		services: {
			meta: asLocaleString(site.services.meta, en.services.meta)
		},
		techStack: {
			meta: asLocaleString(site.techStack.meta, en.techStack.meta),
			title: asLocaleString(site.techStack.title, en.techStack.title)
		},
		projects: {
			meta: asLocaleString(site.projects.meta, en.projects.meta),
			title: asLocaleString(site.projects.title, en.projects.title),
			intro: asLocaleText(site.projects.intro, en.projects.intro),
			maxHomeProjects: site.projects.maxHomeProjects,
			archiveLinkLabel: asLocaleString(
				site.projects.archiveLinkLabel,
				en.projects.archiveLinkLabel
			),
			archiveHref: site.projects.archiveHref,
			projects: site.projects.projects.map((project, index) => ({
				_key: keyOf('featured-project', index),
				sortOrder: index,
				imageSrc: project.imageSrc,
				imageAlt: project.imageAlt,
				title: asLocaleString(project.title, en.projects.projects[index]?.title),
				description: asLocaleText(project.description, en.projects.projects[index]?.description),
				tags: project.tags,
				linkLabel: asLocaleString(project.linkLabel, en.projects.projects[index]?.linkLabel),
				destinationUrl: project.href
			}))
		},
		contact: {
			heading: asLocaleString(site.contact.heading, en.contact.heading),
			subtitle: asLocaleString(site.contact.subtitle, en.contact.subtitle),
			formModalHeading: asLocaleString(site.contact.formModalHeading, en.contact.formModalHeading),
			formModalText: asLocaleString(site.contact.formModalText, en.contact.formModalText),
			formModalSubmitLabel: asLocaleString(
				site.contact.formModalSubmitLabel,
				en.contact.formModalSubmitLabel
			),
			formModalPrivacyLabel: asLocaleString(
				site.contact.formModalPrivacyLabel,
				en.contact.formModalPrivacyLabel
			),
			formModalSuccessMessage: asLocaleString(
				site.contact.formModalSuccessMessage,
				en.contact.formModalSuccessMessage
			)
		},
		footer: {
			copyrightTemplate: asLocaleText(site.footer.copyrightTemplate, en.footer.copyrightTemplate),
			githubHref: site.footer.githubHref,
			linkedinHref: site.footer.linkedinHref,
			maltHref: site.footer.maltHref,
			emailHref: site.footer.emailHref
		},
		careerModal: {
			pdfHref: site.careerModal.pdfHref,
			closeAria: asLocaleString(site.careerModal.closeAria, en.careerModal.closeAria),
			title: asLocaleString(site.careerModal.title, en.careerModal.title),
			profileTitle: asLocaleString(site.careerModal.profileTitle, en.careerModal.profileTitle),
			profileHtml: asLocaleText(site.careerModal.profileHtml, en.careerModal.profileHtml),
			expTitle: asLocaleString(site.careerModal.expTitle, en.careerModal.expTitle),
			timeline: site.careerModal.timeline.map((item, index) => ({
				_key: keyOf('career-timeline', index),
				range: item.range,
				role: asLocaleString(item.role, en.careerModal.timeline[index]?.role),
				descHtml: asLocaleText(item.descHtml, en.careerModal.timeline[index]?.descHtml),
				span: item.span === true
			})),
			stackTitle: asLocaleString(site.careerModal.stackTitle, en.careerModal.stackTitle),
			pdfHide: asLocaleString(site.careerModal.pdfHide, en.careerModal.pdfHide),
			pdfShow: asLocaleString(site.careerModal.pdfShow, en.careerModal.pdfShow),
			pdfIframeTitle: asLocaleString(
				site.careerModal.pdfIframeTitle,
				en.careerModal.pdfIframeTitle
			),
			pdfHintBefore: asLocaleString(site.careerModal.pdfHintBefore, en.careerModal.pdfHintBefore),
			pdfHintLink: asLocaleString(site.careerModal.pdfHintLink, en.careerModal.pdfHintLink)
		}
	};
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const portfolioDoc = mapPortfolioDocument();

	await client.createOrReplace(portfolioDoc);

	console.log('OK: portfolioSite sincronizado con el texto actual del repo.');
}

main().catch((error) => {
	console.error('Error sincronizando portfolioSite:', error);
	process.exit(1);
});
