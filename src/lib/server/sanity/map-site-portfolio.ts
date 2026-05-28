import { portfolioEnglishDemo } from '$lib/data/site-portfolio-locale-en';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SitePortfolioContent, SiteProjectCard } from '$lib/types/site-portfolio';
import { imageUrl } from './image-builder';

const enUi = portfolioEnglishDemo;

function asRecord(v: unknown): Record<string, unknown> | undefined {
	return v && typeof v === 'object' && !Array.isArray(v)
		? (v as Record<string, unknown>)
		: undefined;
}

function asString(v: unknown, fallback: string): string {
	return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function asStringOpt(v: unknown): string | undefined {
	return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function asNumberOpt(v: unknown): number | undefined {
	return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function asHomeLayoutTier(v: unknown): SiteProjectCard['homeLayoutTier'] {
	return v === 'hero' || v === 'spotlight' || v === 'standard' ? v : undefined;
}

/** Campos `{ es, en }` en Sanity o string legacy → texto según `locale`. */
function pickLocalized(
	raw: unknown,
	locale: SiteLocale,
	fallback: string,
	enFallback?: string
): string {
	if (typeof raw === 'string') {
		const s = raw.trim();
		if (locale === 'en' && enFallback?.trim()) {
			return enFallback.trim();
		}
		return s || fallback;
	}
	const o = asRecord(raw);
	if (!o) {
		return locale === 'en' && enFallback?.trim() ? enFallback.trim() : fallback;
	}
	const primary = locale === 'en' ? asStringOpt(o.en) : asStringOpt(o.es);
	const secondary = locale === 'en' ? asStringOpt(o.es) : asStringOpt(o.en);
	const out = (primary?.trim() || secondary?.trim() || '').trim();
	if (out) {
		return out;
	}
	if (locale === 'en' && enFallback?.trim()) {
		return enFallback.trim();
	}
	return fallback;
}

/** Botón «Ver CV»: en Studio a veces queda `/#contacto` por error; el enlace correcto es `/api/cv`. */
function resolveHeroCvHref(cvHref: string, cvCtaLabel: string, defaultCvHref: string): string {
	const href = (cvHref || defaultCvHref).trim();
	const label = cvCtaLabel.trim();
	const looksLikeCv = /\bcv\b/i.test(label);
	const pointsToContact = href === '/#contacto' || href === '#contacto';
	if (looksLikeCv && pointsToContact) {
		return '/api/cv';
	}
	return href || defaultCvHref;
}

function replaceCmsText(value: string, replacements: Record<string, string>): string {
	const normalized = value.trim().toLowerCase();
	return replacements[normalized] ?? value;
}

function normalizeHeroProjectCtaLabel(value: string, locale: SiteLocale): string {
	if (locale === 'en') {
		return replaceCmsText(value, {
			'view cv': 'View projects',
			'view career': 'View projects'
		});
	}
	return replaceCmsText(value, {
		'¿hablamos?': 'Ver proyectos',
		hablemos: 'Ver proyectos',
		'ver cv': 'Ver proyectos',
		'ver trayectoria': 'Ver proyectos'
	});
}

function normalizeHeroBio(value: string, locale: SiteLocale): string {
	if (locale === 'en') return value;
	return replaceCmsText(value, {
		'construyo productos web modernos con arquitectura sólida y alto rendimiento':
			'Desarrollo webs y web apps con SvelteKit, APIs, IA aplicada y WordPress. Busco incorporarme a un equipo y aportar rendimiento, integraciones y criterio técnico.',
		'desarrollo sitios web y web apps rápidas, robustas y mantenibles, con foco en rendimiento, ia e integraciones reales. busco incorporarme a un equipo donde aportar criterio técnico, aprendizaje rápido y valor desde el primer día.':
			'Desarrollo webs y web apps con SvelteKit, APIs, IA aplicada y WordPress. Busco incorporarme a un equipo y aportar rendimiento, integraciones y criterio técnico.',
		'diseño y desarrollo interfaces web con criterio de producto: sveltekit, wordpress, rendimiento e integraciones reales para estudios y equipos digitales.':
			'Desarrollo webs y web apps con SvelteKit, APIs, IA aplicada y WordPress. Busco incorporarme a un equipo y aportar rendimiento, integraciones y criterio técnico.',
		'diseño y desarrollo interfaces web con criterio de producto: sveltekit, wordpress, ia aplicada, rendimiento e integraciones reales para estudios y equipos digitales.':
			'Desarrollo webs y web apps con SvelteKit, APIs, IA aplicada y WordPress. Busco incorporarme a un equipo y aportar rendimiento, integraciones y criterio técnico.',
		'desarrollador web con sveltekit, wordpress e ia aplicada. busco incorporarme a un equipo y aportar frontend, rendimiento e integraciones reales.':
			'Desarrollo webs y web apps con SvelteKit, APIs, IA aplicada y WordPress. Busco incorporarme a un equipo y aportar rendimiento, integraciones y criterio técnico.'
	});
}

function normalizeContactHeading(value: string, locale: SiteLocale): string {
	if (locale === 'en') return value;
	return replaceCmsText(value, {
		'¿hablamos?': 'Listo para aportar en un equipo técnico',
		hablemos: 'Listo para aportar en un equipo técnico'
	});
}

function normalizeContactModalTitle(value: string, locale: SiteLocale): string {
	if (locale === 'en') return value;
	return replaceCmsText(value, {
		'cuéntame tu proyecto': 'Hablemos de una oportunidad',
		'cuentame tu proyecto': 'Hablemos de una oportunidad'
	});
}

function normalizeContactSubmitLabel(value: string, locale: SiteLocale): string {
	if (locale === 'en') return value;
	return replaceCmsText(value, {
		'enviar solicitud': 'Enviar mensaje'
	});
}

function normalizeContactModalText(value: string, locale: SiteLocale): string {
	if (locale === 'en') return value;
	return replaceCmsText(value, {
		'déjame tus datos y te responderé lo antes posible.':
			'Déjame tus datos y te responderé con disponibilidad, CV y próximos pasos.',
		'dejame tus datos y te respondere lo antes posible.':
			'Déjame tus datos y te responderé con disponibilidad, CV y próximos pasos.'
	});
}

function normalizeFooterCopyright(value: string): string {
	return value
		.replace(
			'SvelteKit, WordPress, Sanity CMS y SEO técnico',
			'SvelteKit, React/Next.js, WordPress, Sanity CMS y SEO técnico'
		)
		.replace(
			'SvelteKit, WordPress, Sanity CMS and technical SEO',
			'SvelteKit, React/Next.js, WordPress, Sanity CMS and technical SEO'
		);
}

function normalizeAboutHtml(value: string, locale: SiteLocale): string {
	if (locale === 'en') return value;
	const staleAiDisclaimer = new RegExp(
		[
			'Trabajo con especificaciones claras',
			'revisi[oó]n humana y apoyo de IA cuando acelera sin bajar el nivel\\.'
		].join(',\\s*')
	);
	return value
		.replace(
			staleAiDisclaimer,
			'Me especializo en metodologías de <strong>AI-Driven Development</strong> y <strong>Spec-Driven Development (SDD)</strong> para diseñar arquitecturas de software y conectar soluciones con total autonomía. Mi stack principal está enfocado en <strong>SvelteKit</strong>, <strong>Supabase</strong>, <strong>Tailwind CSS</strong> y APIs de IA (<strong>Gemini</strong>, <strong>OpenAI</strong>, <strong>Anthropic</strong>, <strong>Fal.ai</strong>), además de la gestión y mantenimiento de <strong>WordPress</strong>.'
		)
		.replace('herramientas actuales, podemos encajar.', 'herramientas del futuro, hablemos.');
}

function pickNavLabel(raw: unknown, locale: SiteLocale, href: string, esFallback: string): string {
	const enItem = enUi.header.navItems.find(
		(item) => normalizeHashHref(item.href) === normalizeHashHref(href)
	);
	return pickLocalized(raw, locale, esFallback, enItem?.label);
}

/** Unifica `/#ancla` y `#ancla` para comparar destinos del menú con el CTA. */
function normalizeHashHref(href: string): string {
	const t = href.trim();
	if (t.startsWith('/#')) {
		return t.slice(1);
	}
	return t;
}

function mergeHeader(
	raw: unknown,
	d: SitePortfolioContent['header'],
	locale: SiteLocale
): SitePortfolioContent['header'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	const nav = Array.isArray(o.navItems)
		? (o.navItems as unknown[])
				.map((x, i) => {
					const r = asRecord(x);
					if (!r) {
						return null;
					}
					const href = asStringOpt(r.href);
					const label = pickNavLabel(r.label, locale, href ?? '', d.navItems[i]?.label ?? '');
					if (!label || href === undefined) {
						return null;
					}
					return { label, href };
				})
				.filter(Boolean)
		: [];
	const baseNav = (nav.length ? nav : d.navItems) as SitePortfolioContent['header']['navItems'];
	return {
		logoText: pickLocalized(o.logoText, locale, d.logoText, enUi.header.logoText),
		logoHref: asString(o.logoHref, d.logoHref),
		navItems: baseNav
	};
}

/** Antes se usaba el retrato de “Sobre mí” como OG; WhatsApp/Facebook lo mostraban mal. Si Sanity aún tiene esa ruta, usamos la imagen OG dedicada. */
function resolveOgImagePath(fromCms: string | undefined, fallback: string): string {
	const raw = (fromCms ?? '').trim();
	if (!raw) {
		return fallback;
	}
	if (raw === '/og-image.png') {
		return fallback;
	}
	if (raw.includes('Moises-Valero-Sanchez.png')) {
		return fallback;
	}
	return raw;
}

function mergeSeo(
	raw: unknown,
	d: SitePortfolioContent['seo'],
	baseUrl: string
): SitePortfolioContent['seo'] {
	const o = asRecord(raw);
	if (!o) {
		return {
			...d,
			ogImage: absolutizeOgImage(d.ogImage, baseUrl)
		};
	}
	const ogImageRaw = resolveOgImagePath(asStringOpt(o.ogImage), d.ogImage);
	return {
		title: asString(o.title, d.title),
		description: asString(o.description, d.description),
		ogTitle: asString(o.ogTitle, d.ogTitle),
		ogDescription: asString(o.ogDescription, d.ogDescription),
		ogImage: absolutizeOgImage(ogImageRaw, baseUrl),
		twitterCard: o.twitterCard === 'summary' ? 'summary' : 'summary_large_image'
	};
}

function absolutizeOgImage(pathOrUrl: string, baseUrl: string): string {
	if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
		return pathOrUrl;
	}
	const base = baseUrl.replace(/\/$/, '');
	const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
	return `${base}${path}`;
}

function mergeHero(
	raw: unknown,
	d: SitePortfolioContent['hero'],
	locale: SiteLocale
): SitePortfolioContent['hero'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	const ctaPrimaryLabel = normalizeHeroProjectCtaLabel(
		pickLocalized(
			o.ctaPrimaryLabel,
			locale,
			d.ctaPrimaryLabel ?? 'Ver proyectos',
			enUi.hero.ctaPrimaryLabel
		),
		locale
	);
	const cvCtaLabel = pickLocalized(
		o.cvCtaLabel,
		locale,
		d.cvCtaLabel ?? 'Ver CV',
		enUi.hero.cvCtaLabel
	);
	return {
		cvHref: resolveHeroCvHref(asString(o.cvHref, d.cvHref), cvCtaLabel, d.cvHref),
		projectsHref: asString(o.projectsHref, d.projectsHref ?? '#proyectos'),
		label: pickLocalized(o.label, locale, d.label, enUi.hero.label),
		title: pickLocalized(o.title, locale, d.title, enUi.hero.title),
		subtitle: pickLocalized(o.subtitle, locale, d.subtitle, enUi.hero.subtitle),
		bio: normalizeHeroBio(pickLocalized(o.bio, locale, d.bio, enUi.hero.bio), locale),
		ctaPrimaryLabel,
		cvCtaLabel
	};
}

function mergeAbout(
	raw: unknown,
	d: SitePortfolioContent['about'],
	ctx: { projectId: string; dataset: string; locale: SiteLocale }
): SitePortfolioContent['about'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	const fromImage = imageUrl(ctx.projectId, ctx.dataset, o.image, 900);
	return {
		imageSrc: fromImage || asString(o.imageSrc, d.imageSrc),
		imageAlt: pickLocalized(o.imageAlt, ctx.locale, d.imageAlt, enUi.about.imageAlt),
		meta: pickLocalized(o.meta, ctx.locale, d.meta, enUi.about.meta),
		title: pickLocalized(o.title, ctx.locale, d.title, enUi.about.title),
		aboutHtml: normalizeAboutHtml(
			pickLocalized(o.aboutHtml, ctx.locale, d.aboutHtml, enUi.about.aboutHtml),
			ctx.locale
		)
	};
}

function mergeServices(
	raw: unknown,
	d: SitePortfolioContent['services'],
	locale: SiteLocale
): SitePortfolioContent['services'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	return {
		meta: pickLocalized(o.meta, locale, d.meta, enUi.services.meta),
		title: d.title,
		items: d.items
	};
}

function mergeTechStack(
	raw: unknown,
	d: SitePortfolioContent['techStack'],
	ctx: { projectId: string; dataset: string; locale: SiteLocale }
): SitePortfolioContent['techStack'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	/** Iconos y categorías del repo (devicons locales). Solo meta/título editables en Sanity. */
	return {
		meta: pickLocalized(o.meta, ctx.locale, d.meta, enUi.techStack.meta),
		title: pickLocalized(o.title, ctx.locale, d.title, enUi.techStack.title),
		categories: d.categories
	};
}

export function mapProject(
	raw: unknown,
	ctx: { projectId: string; dataset: string; locale: SiteLocale }
): SiteProjectCard | null {
	const o = asRecord(raw);
	if (!o) {
		return null;
	}
	const title = pickLocalized(o.title, ctx.locale, '');
	if (!title) {
		return null;
	}
	const sourceHref = asString(o.destinationUrl, '/');
	const normalizedHref = sourceHref
		.replace(/^https?:\/\/ember\.moisesvalero\.es\/?$/i, '/proyectos/ember-iron')
		.replace(/^https?:\/\/v-shield\.moisesvalero\.es\/?$/i, '/proyectos/vshield')
		.replace(/^https?:\/\/moisesvalero\.es\/ember\/?$/i, '/proyectos/ember-iron')
		.replace(/^https?:\/\/moisesvalero\.es\/v-shield\/?$/i, '/proyectos/vshield');
	const href = normalizedHref;
	const external = /^https?:\/\//i.test(href);
	const imageSrc =
		imageUrl(ctx.projectId, ctx.dataset, o.thumbnail, 1200) ||
		asString(o.imageSrc, '') ||
		'https://placehold.co/800x450/f1f5f9/64748b?text=Proyecto';
	const tags = Array.isArray(o.tags)
		? (o.tags as unknown[]).filter((t): t is string => typeof t === 'string')
		: [];
	const homeValueTags = Array.isArray(o.homeValueTags)
		? (o.homeValueTags as unknown[]).filter(
				(t): t is string => typeof t === 'string' && t.trim().length > 0
			)
		: [];
	const defaultLink = ctx.locale === 'en' ? 'View project' : 'Ver proyecto';
	return {
		imageSrc,
		imageAlt: asString(o.imageAlt, title),
		href,
		external,
		linkLabel: pickLocalized(o.linkLabel, ctx.locale, defaultLink),
		title,
		description: pickLocalized(o.description, ctx.locale, ''),
		tags,
		homeLayoutTier: asHomeLayoutTier(o.homeLayoutTier),
		homeEyebrow: pickLocalized(o.homeEyebrow, ctx.locale, ''),
		homeProofLine: pickLocalized(o.homeProofLine, ctx.locale, ''),
		homeValueTags,
		homeRole: pickLocalized(o.homeRole, ctx.locale, ''),
		homeYear: asStringOpt(o.homeYear),
		homeComplexity: asStringOpt(o.homeComplexity)
	};
}

function projectDedupeKey(project: SiteProjectCard): string {
	const raw = project.href.trim();
	if (!raw) return '';
	const normalized = raw.replace(/\/+$/, '') || '/';
	return normalized.toLowerCase();
}

function mergeProjects(
	raw: unknown,
	d: SitePortfolioContent['projects'],
	ctx: { projectId: string; dataset: string; locale: SiteLocale }
): SitePortfolioContent['projects'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	const listRaw = Array.isArray(o.projects)
		? (o.projects as unknown[])
		: Array.isArray(o.items)
			? (o.items as unknown[])
			: [];
	const mapped = listRaw
		.map((x) => mapProject(x, ctx))
		.filter((x): x is SiteProjectCard => Boolean(x));
	const deduped: SiteProjectCard[] = [];
	const seenKeys = new Set<string>();
	for (const project of mapped) {
		const key = projectDedupeKey(project);
		if (key && seenKeys.has(key)) continue;
		if (key) seenKeys.add(key);
		deduped.push(project);
	}
	const maxHomeProjects = asNumberOpt(o.maxHomeProjects);
	return {
		meta: pickLocalized(o.meta, ctx.locale, d.meta),
		title: pickLocalized(o.title, ctx.locale, d.title),
		intro: pickLocalized(o.intro, ctx.locale, d.intro ?? ''),
		maxHomeProjects:
			maxHomeProjects && maxHomeProjects > 0 ? Math.floor(maxHomeProjects) : d.maxHomeProjects,
		archiveLinkLabel: pickLocalized(o.archiveLinkLabel, ctx.locale, d.archiveLinkLabel ?? ''),
		archiveHref: asStringOpt(o.archiveHref) ?? d.archiveHref,
		projects: deduped.length ? deduped : d.projects
	};
}

function mergeContact(
	raw: unknown,
	d: SitePortfolioContent['contact'],
	locale: SiteLocale
): SitePortfolioContent['contact'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	const c = enUi.contact;
	return {
		heading: normalizeContactHeading(
			pickLocalized(o.heading, locale, d.heading, c.heading),
			locale
		),
		subtitle: pickLocalized(o.subtitle, locale, d.subtitle, c.subtitle),
		formModalHeading: normalizeContactModalTitle(
			pickLocalized(o.formModalHeading, locale, d.formModalHeading, c.formModalHeading),
			locale
		),
		formModalText: normalizeContactModalText(
			pickLocalized(o.formModalText, locale, d.formModalText, c.formModalText),
			locale
		),
		formModalSubmitLabel: normalizeContactSubmitLabel(
			pickLocalized(o.formModalSubmitLabel, locale, d.formModalSubmitLabel, c.formModalSubmitLabel),
			locale
		),
		formModalPrivacyLabel: pickLocalized(
			o.formModalPrivacyLabel,
			locale,
			d.formModalPrivacyLabel,
			c.formModalPrivacyLabel
		),
		formModalSuccessMessage: pickLocalized(
			o.formModalSuccessMessage,
			locale,
			d.formModalSuccessMessage,
			c.formModalSuccessMessage
		)
	};
}

function mergeFooter(
	raw: unknown,
	d: SitePortfolioContent['footer'],
	locale: SiteLocale
): SitePortfolioContent['footer'] {
	const o = asRecord(raw);
	if (!o) {
		return d;
	}
	return {
		copyrightTemplate: normalizeFooterCopyright(
			pickLocalized(o.copyrightTemplate, locale, d.copyrightTemplate, enUi.footer.copyrightTemplate)
		),
		githubHref: asString(o.githubHref, d.githubHref),
		linkedinHref: asString(o.linkedinHref, d.linkedinHref),
		maltHref: asString(o.maltHref, d.maltHref),
		emailHref: asString(o.emailHref, d.emailHref)
	};
}

/**
 * Combina documento Sanity con valores por defecto solo para huecos vacíos.
 * `baseUrl` sirve para resolver `ogImage` relativos. Sin capa que sustituya CMS por texto del repo.
 */
export function mapSanitySitePortfolio(
	raw: Record<string, unknown> | null | undefined,
	defaults: SitePortfolioContent,
	ctx: { projectId: string; dataset: string; baseUrl: string; locale: SiteLocale }
): SitePortfolioContent {
	if (!raw) {
		const base: SitePortfolioContent = {
			...defaults,
			seo: { ...defaults.seo, ogImage: absolutizeOgImage(defaults.seo.ogImage, ctx.baseUrl) }
		};
		return base;
	}
	return {
		header: mergeHeader(raw.header, defaults.header, ctx.locale),
		seo: mergeSeo(raw.seo, defaults.seo, ctx.baseUrl),
		hero: mergeHero(raw.hero, defaults.hero, ctx.locale),
		about: mergeAbout(raw.about, defaults.about, ctx),
		services: mergeServices(raw.services, defaults.services, ctx.locale),
		techStack: mergeTechStack(raw.techStack, defaults.techStack, ctx),
		quality: defaults.quality,
		projects: mergeProjects(raw.projects, defaults.projects, ctx),
		contact: mergeContact(raw.contact, defaults.contact, ctx.locale),
		footer: mergeFooter(raw.footer, defaults.footer, ctx.locale)
	};
}
