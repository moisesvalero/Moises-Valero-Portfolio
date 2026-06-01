/** Contenido editable del portfolio (home + cabecera + pie). Origen: Sanity `sitePortfolio` o `site-portfolio-defaults.ts`. */

export type SiteNavItem = {
	label: string;
	href: string;
};

export type SiteHeader = {
	logoText: string;
	logoHref: string;
	navItems: SiteNavItem[];
};

export type SiteSeo = {
	title: string;
	description: string;
	ogTitle: string;
	ogDescription: string;
	/** URL absoluta o relativa a la raíz (p. ej. /og-image-2026.png) */
	ogImage: string;
	twitterCard: 'summary' | 'summary_large_image';
};

export type SiteHero = {
	cvHref: string;
	projectsHref?: string;
	label: string;
	title: string;
	subtitle: string;
	bio: string;
	/** CTA principal del hero (i18n). */
	ctaPrimaryLabel?: string;
	/** CTA secundario del hero para abrir/descargar el CV. */
	cvCtaLabel?: string;
};

export type SiteAbout = {
	imageSrc: string;
	imageAlt: string;
	meta: string;
	title: string;
	/** HTML seguro (mismo criterio que case studies); solo contenido tuyo desde Sanity. */
	aboutHtml: string;
};

export type SiteServiceItem = {
	icon: string;
	title: string;
	description: string;
};

export type SiteServices = {
	meta: string;
	title: string;
	items: SiteServiceItem[];
};

export type SiteStackIcon = {
	src?: string;
	alt: string;
	title?: string;
};

export type SiteStackCategory = {
	title: string;
	icons: SiteStackIcon[];
};

export type SiteTechStack = {
	meta: string;
	title: string;
	categories: SiteStackCategory[];
};

export type SiteQualityItem = {
	icon: string;
	title: string;
	description: string;
};

export type SiteQuality = {
	meta: string;
	title: string;
	items: SiteQualityItem[];
};

/** Tarjeta en la cuadrícula de proyectos (destino interno o URL absoluta). */
export type SiteProjectCard = {
	imageSrc: string;
	imageAlt: string;
	href: string;
	/** true si `href` es http(s) y debe abrir en nueva pestaña */
	external: boolean;
	linkLabel: string;
	title: string;
	description: string;
	tags: string[];
	/** Peso editorial en portada. Se puede controlar desde Sanity. */
	homeLayoutTier?: 'hero' | 'spotlight' | 'standard';
	homeEyebrow?: string;
	homeProofLine?: string;
	homeValueTags?: string[];
	homeRole?: string;
	homeYear?: string;
	homeComplexity?: string;
};

export type SiteProjectsSection = {
	meta: string;
	title: string;
	intro?: string;
	maxHomeProjects?: number;
	archiveLinkLabel?: string;
	archiveHref?: string;
	projects: SiteProjectCard[];
};

export type SiteContact = {
	heading: string;
	subtitle: string;
	formModalHeading: string;
	formModalText: string;
	formModalSubmitLabel: string;
	formModalPrivacyLabel: string;
	formModalSuccessMessage: string;
};

export type SiteFooter = {
	/** Usa `{{year}}` para el año actual en el pie. */
	copyrightTemplate: string;
	githubHref: string;
	linkedinHref: string;
	maltHref: string;
	emailHref: string;
};

export type SitePortfolioContent = {
	header: SiteHeader;
	seo: SiteSeo;
	hero: SiteHero;
	about: SiteAbout;
	services: SiteServices;
	techStack: SiteTechStack;
	quality: SiteQuality;
	projects: SiteProjectsSection;
	contact: SiteContact;
	footer: SiteFooter;
};
