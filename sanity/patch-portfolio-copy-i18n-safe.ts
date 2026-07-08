/**
 * Patch seguro del singleton `portfolioSite`.
 *
 * Actualiza copy ES/EN y estructura de navegación sin reemplazar el documento completo,
 * para preservar imágenes, PDF y metadatos internos ya subidos en Studio.
 *
 * Ejecutar:
 *   npx sanity exec sanity/patch-portfolio-copy-i18n-safe.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { sitePortfolioDefaults } from '../src/lib/data/site-portfolio-defaults';
import { portfolioEnglishDemo } from '../src/lib/data/site-portfolio-locale-en';

const DOC_ID = 'portfolioSite';
const site = sitePortfolioDefaults;
const en = portfolioEnglishDemo;

const keyOf = (prefix: string, index: number) => `${prefix}-${index + 1}`;
const ls = (es = '', english = '') => ({ es, en: english });
const lt = (es = '', english = '') => ({ _type: 'localeText', es, en: english });

const navItems = [
	{ _key: 'nav-home', href: '/#top', label: ls('Inicio', 'Home') },
	{ _key: 'nav-projects', href: '/#proyectos', label: ls('Proyectos', 'Projects') },
	{ _key: 'nav-ai-assistant', href: '/ia-moises', label: ls('Asistente IA', 'AI Assistant') },
	{
		_key: 'nav-web-analyzer',
		href: '/tools/analizador-web',
		label: ls('Analizador web', 'Web Analyzer')
	},
	{ _key: 'nav-contact', href: '/#contacto', label: ls('Contacto', 'Contact') },
	{ _key: 'nav-guides', href: '/blog', label: ls('Guías', 'Guides') }
];

const featuredProjects = site.projects.projects.map((project, index) => ({
	_key: keyOf('featured-project', index),
	sortOrder: index,
	imageSrc: project.imageSrc,
	imageAlt: project.imageAlt,
	title: ls(project.title, en.projects.projects[index]?.title),
	description: lt(project.description, en.projects.projects[index]?.description),
	tags: project.tags,
	linkLabel: ls(project.linkLabel, en.projects.projects[index]?.linkLabel),
	destinationUrl: project.href
}));

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	await client
		.patch(DOC_ID)
		.set({
			'header.logoText': ls(site.header.logoText, en.header.logoText),
			'header.logoHref': site.header.logoHref,
			'header.navItems': navItems,

			seo: {
				...site.seo,
				description: site.seo.description.replace('soporte técnico', 'IA aplicada'),
				ogDescription: site.seo.ogDescription.replace('soporte técnico', 'IA aplicada')
			},

			'hero.cvHref': site.hero.cvHref,
			'hero.label': ls('PORTFOLIO – MOISÉS VALERO', 'PORTFOLIO — MOISÉS VALERO'),
			'hero.title': ls(site.hero.title, en.hero.title),
			'hero.subtitle': ls(
				'SvelteKit · Next.js · Astro · TypeScript · IA aplicada',
				'SvelteKit · Next.js · Astro · TypeScript · applied AI'
			),
			'hero.bio': lt(site.hero.bio, en.hero.bio),
			'hero.ctaPrimaryLabel': ls(site.hero.ctaPrimaryLabel, en.hero.ctaPrimaryLabel),
			'hero.careerCtaLabel': ls(site.hero.careerCtaLabel, en.hero.careerCtaLabel),

			'about.imageAlt': ls('Moisés Valero - Desarrollador web', en.about.imageAlt),
			'about.meta': ls(site.about.meta, en.about.meta),
			'about.title': ls(site.about.title, en.about.title),
			'about.aboutHtml': lt(site.about.aboutHtml, en.about.aboutHtml),

			'services.meta': ls(site.services.meta, en.services.meta),
			'techStack.meta': ls(site.techStack.meta, en.techStack.meta),
			'techStack.title': ls(site.techStack.title, en.techStack.title),

			'projects.meta': ls(site.projects.meta, en.projects.meta),
			'projects.title': ls(site.projects.title, en.projects.title),
			'projects.intro': lt(
				site.projects.intro,
				'A short selection of projects that show technical judgement, product thinking, performance and real integrations.'
			),
			'projects.maxHomeProjects': site.projects.maxHomeProjects,
			'projects.archiveLinkLabel': ls(site.projects.archiveLinkLabel, 'View all projects'),
			'projects.archiveHref': site.projects.archiveHref,
			'projects.projects': featuredProjects,

			'contact.heading': ls(site.contact.heading, en.contact.heading),
			'contact.subtitle': ls(site.contact.subtitle, en.contact.subtitle),
			'contact.formModalHeading': ls(site.contact.formModalHeading, en.contact.formModalHeading),
			'contact.formModalText': ls(site.contact.formModalText, en.contact.formModalText),
			'contact.formModalSubmitLabel': ls(
				site.contact.formModalSubmitLabel,
				en.contact.formModalSubmitLabel
			),
			'contact.formModalPrivacyLabel': ls(
				site.contact.formModalPrivacyLabel,
				en.contact.formModalPrivacyLabel
			),
			'contact.formModalSuccessMessage': ls(
				site.contact.formModalSuccessMessage,
				en.contact.formModalSuccessMessage
			),

			'footer.copyrightTemplate': lt(site.footer.copyrightTemplate, en.footer.copyrightTemplate),
			'footer.githubHref': site.footer.githubHref,
			'footer.linkedinHref': site.footer.linkedinHref,
			'footer.maltHref': site.footer.maltHref,
			'footer.emailHref': site.footer.emailHref
		})
		.commit();

	console.log('OK: portfolioSite actualizado con copy ES/EN sin reemplazar assets.');
}

main().catch((error) => {
	console.error('Error actualizando portfolioSite:', error);
	process.exit(1);
});
