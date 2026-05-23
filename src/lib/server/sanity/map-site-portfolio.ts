import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SitePortfolioContent, SiteProjectCard, SiteStackIcon } from '$lib/types/site-portfolio';
import { imageUrl } from './image-builder';

function asRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
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

/** Campos `{ es, en }` en Sanity o string legacy → texto según `locale` con fallback al otro idioma y luego `fallback`. */
function pickLocalized(raw: unknown, locale: SiteLocale, fallback: string): string {
  if (typeof raw === 'string') {
    const s = raw.trim();
    return s || fallback;
  }
  const o = asRecord(raw);
  if (!o) {
    return fallback;
  }
  const primary = locale === 'en' ? asStringOpt(o.en) : asStringOpt(o.es);
  const secondary = locale === 'en' ? asStringOpt(o.es) : asStringOpt(o.en);
  const out = (primary?.trim() || secondary?.trim() || '').trim();
  return out || fallback;
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
          const label = pickLocalized(r.label, locale, d.navItems[i]?.label ?? '');
          const openCareerModal = r.openCareerModal === true;
          const href = asStringOpt(r.href) ?? (openCareerModal ? '#' : undefined);
          if (!label || href === undefined) {
            return null;
          }
          return openCareerModal
            ? { label, href, openCareerModal: true as const }
            : { label, href };
        })
        .filter(Boolean)
    : [];
  const ctaLabel = pickLocalized(o.ctaLabel, locale, d.ctaLabel);
  const ctaHref = asString(o.ctaHref, d.ctaHref);
  const baseNav = (nav.length ? nav : d.navItems) as SitePortfolioContent['header']['navItems'];
  const ctaDest = normalizeHashHref(ctaHref);
  const navItems = baseNav.filter(
    (item) =>
      !(
        item.label === ctaLabel &&
        !item.openCareerModal &&
        normalizeHashHref(item.href) === ctaDest
      )
  );
  return {
    logoText: pickLocalized(o.logoText, locale, d.logoText),
    logoHref: asString(o.logoHref, d.logoHref),
    navItems,
    ctaLabel,
    ctaHref
  };
}

/** Antes se usaba el retrato de “Sobre mí” como OG; WhatsApp/Facebook lo mostraban mal. Si Sanity aún tiene esa ruta, usamos la imagen OG dedicada. */
function resolveOgImagePath(fromCms: string | undefined, fallback: string): string {
  const raw = (fromCms ?? '').trim();
  if (!raw) {
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
  return {
    cvHref: asString(o.cvHref, d.cvHref),
    label: pickLocalized(o.label, locale, d.label),
    title: pickLocalized(o.title, locale, d.title),
    subtitle: pickLocalized(o.subtitle, locale, d.subtitle),
    bio: pickLocalized(o.bio, locale, d.bio),
    ctaPrimaryLabel: pickLocalized(o.ctaPrimaryLabel, locale, d.ctaPrimaryLabel ?? ''),
    careerCtaLabel: pickLocalized(o.careerCtaLabel, locale, d.careerCtaLabel ?? '')
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
  const fromImage = imageUrl(ctx.projectId, ctx.dataset, o.image, 520);
  return {
    imageSrc: fromImage || asString(o.imageSrc, d.imageSrc),
    imageAlt: pickLocalized(o.imageAlt, ctx.locale, d.imageAlt),
    meta: pickLocalized(o.meta, ctx.locale, d.meta),
    title: pickLocalized(o.title, ctx.locale, d.title),
    aboutHtml: pickLocalized(o.aboutHtml, ctx.locale, d.aboutHtml)
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
  const itemsRaw = Array.isArray(o.items) ? (o.items as unknown[]) : [];
  const items = itemsRaw
    .map((x, i) => {
      const r = asRecord(x);
      if (!r) {
        return null;
      }
      const title = pickLocalized(r.title, locale, d.items[i]?.title ?? '');
      if (!title) {
        return null;
      }
      return {
        icon: asString(r.icon, '•'),
        title,
        description: pickLocalized(r.description, locale, d.items[i]?.description ?? '')
      };
    })
    .filter(Boolean) as SitePortfolioContent['services']['items'];
  return {
    meta: pickLocalized(o.meta, locale, d.meta),
    title: pickLocalized(o.title, locale, d.title),
    items: items.length ? items : d.items
  };
}

function mapStackIcon(
  raw: unknown,
  ctx: { projectId: string; dataset: string },
  fallback: SiteStackIcon
): SiteStackIcon {
  const o = asRecord(raw);
  if (!o) {
    return fallback;
  }
  const fromImg = imageUrl(ctx.projectId, ctx.dataset, o.iconImage, 80);
  const srcFallback = fallback.src ?? '';
  const src = fromImg || asString(o.src, srcFallback);
  const devicon = asStringOpt(o.devicon) ?? fallback.devicon;
  const iconify = asStringOpt(o.iconify) ?? fallback.iconify;
  return {
    src: src || undefined,
    devicon,
    iconify,
    alt: asString(o.alt, fallback.alt),
    title: asStringOpt(o.title) ?? fallback.title
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
  const catsRaw = Array.isArray(o.categories) ? (o.categories as unknown[]) : [];
  const categories = catsRaw
    .map((c, ci) => {
      const r = asRecord(c);
      if (!r) {
        return null;
      }
      const title = pickLocalized(r.title, ctx.locale, d.categories[ci]?.title ?? '');
      if (!title) {
        return null;
      }
      const iconsRaw = Array.isArray(r.icons) ? (r.icons as unknown[]) : [];
      const defaultIcons = d.categories[ci]?.icons ?? d.categories[0]?.icons ?? [];
      const icons = iconsRaw.map((ic, ii) =>
        mapStackIcon(ic, ctx, defaultIcons[ii] ?? { iconify: 'logos:code-icon', alt: 'icon', title: 'icon' })
      );
      return {
        title,
        icons: icons.length ? icons : defaultIcons
      };
    })
    .filter(Boolean) as SitePortfolioContent['techStack']['categories'];
  return {
    meta: pickLocalized(o.meta, ctx.locale, d.meta),
    title: pickLocalized(o.title, ctx.locale, d.title),
    categories: categories.length ? categories : d.categories
  };
}

function mergeQuality(
  raw: unknown,
  d: SitePortfolioContent['quality'],
  locale: SiteLocale
): SitePortfolioContent['quality'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  const itemsRaw = Array.isArray(o.items) ? (o.items as unknown[]) : [];
  const items = itemsRaw
    .map((x, i) => {
      const r = asRecord(x);
      if (!r) {
        return null;
      }
      const title = pickLocalized(r.title, locale, d.items[i]?.title ?? '');
      if (!title) {
        return null;
      }
      return {
        icon: asString(r.icon, '•'),
        title,
        description: pickLocalized(r.description, locale, d.items[i]?.description ?? '')
      };
    })
    .filter(Boolean) as SitePortfolioContent['quality']['items'];
  return {
    meta: pickLocalized(o.meta, locale, d.meta),
    title: pickLocalized(o.title, locale, d.title),
    items: items.length ? items : d.items
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
    imageUrl(ctx.projectId, ctx.dataset, o.thumbnail, 640) ||
    asString(o.imageSrc, '') ||
    'https://placehold.co/800x450/f1f5f9/64748b?text=Proyecto';
  const tags = Array.isArray(o.tags) ? (o.tags as unknown[]).filter((t): t is string => typeof t === 'string') : [];
  const homeValueTags = Array.isArray(o.homeValueTags)
    ? (o.homeValueTags as unknown[]).filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
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
    maxHomeProjects: maxHomeProjects && maxHomeProjects > 0 ? Math.floor(maxHomeProjects) : d.maxHomeProjects,
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
  const whatsappLeadRaw =
    (o.whatsappLead as string | undefined) ?? (o.linkedinLead as string | undefined);
  const whatsappButtonRaw =
    (o.whatsappButtonLabel as string | undefined) ??
    (o.linkedinButtonLabel as string | undefined);
  return {
    heading: pickLocalized(o.heading, locale, d.heading),
    subtitle: pickLocalized(o.subtitle, locale, d.subtitle),
    typebotSrc: asString(o.typebotSrc, d.typebotSrc),
    whatsappLead: pickLocalized(whatsappLeadRaw, locale, d.whatsappLead),
    whatsappButtonLabel: pickLocalized(whatsappButtonRaw, locale, d.whatsappButtonLabel),
    formLead: pickLocalized(o.formLead, locale, d.formLead),
    formButtonLabel: pickLocalized(o.formButtonLabel, locale, d.formButtonLabel),
    formModalHeading: pickLocalized(o.formModalHeading, locale, d.formModalHeading),
    formModalText: pickLocalized(o.formModalText, locale, d.formModalText),
    formModalSubmitLabel: pickLocalized(o.formModalSubmitLabel, locale, d.formModalSubmitLabel),
    formModalPrivacyLabel: pickLocalized(o.formModalPrivacyLabel, locale, d.formModalPrivacyLabel),
    formModalSuccessMessage: pickLocalized(
      o.formModalSuccessMessage,
      locale,
      d.formModalSuccessMessage
    ),
    iframeTitle: pickLocalized(o.iframeTitle, locale, d.iframeTitle)
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
    copyrightTemplate: pickLocalized(o.copyrightTemplate, locale, d.copyrightTemplate),
    githubHref: asString(o.githubHref, d.githubHref),
    linkedinHref: asString(o.linkedinHref, d.linkedinHref),
    maltHref: asString(o.maltHref, d.maltHref),
    emailHref: asString(o.emailHref, d.emailHref)
  };
}

function mergeCareerModal(
  raw: unknown,
  d: SitePortfolioContent['careerModal'],
  locale: SiteLocale
): SitePortfolioContent['careerModal'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  const timelineRaw = Array.isArray(o.timeline) ? (o.timeline as unknown[]) : [];
  const pdfAssetUrl = asStringOpt(o.pdfAssetUrl);
  const timeline = timelineRaw
    .map((x, i) => {
      const r = asRecord(x);
      if (!r) {
        return null;
      }
      const fallback = d.timeline[i] ?? d.timeline[0];
      const range = asStringOpt(r.range) ?? fallback?.range ?? '';
      const role = pickLocalized(r.role, locale, fallback?.role ?? '');
      const descHtml = pickLocalized(r.descHtml, locale, fallback?.descHtml ?? '');
      if (!range || !role || !descHtml) {
        return null;
      }
      return {
        range,
        role,
        descHtml,
        span: r.span === true
      };
    })
    .filter(Boolean) as SitePortfolioContent['careerModal']['timeline'];

  return {
    pdfHref: pdfAssetUrl ?? asString(o.pdfHref, d.pdfHref),
    closeAria: pickLocalized(o.closeAria, locale, d.closeAria),
    title: pickLocalized(o.title, locale, d.title),
    profileTitle: pickLocalized(o.profileTitle, locale, d.profileTitle),
    profileHtml: pickLocalized(o.profileHtml, locale, d.profileHtml),
    expTitle: pickLocalized(o.expTitle, locale, d.expTitle),
    timeline: timeline.length ? timeline : d.timeline,
    stackTitle: pickLocalized(o.stackTitle, locale, d.stackTitle),
    pdfHide: pickLocalized(o.pdfHide, locale, d.pdfHide),
    pdfShow: pickLocalized(o.pdfShow, locale, d.pdfShow),
    pdfIframeTitle: pickLocalized(o.pdfIframeTitle, locale, d.pdfIframeTitle),
    pdfHintBefore: pickLocalized(o.pdfHintBefore, locale, d.pdfHintBefore),
    pdfHintLink: pickLocalized(o.pdfHintLink, locale, d.pdfHintLink)
  };
}

/**
 * Combina documento Sanity con valores por defecto. `baseUrl` sirve para resolver `ogImage` relativos.
 * Con `locale === 'en'` los fallbacks vienen de `buildPortfolioLocaleDefaults('en')`; **seo** sigue en español.
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
    quality: mergeQuality(raw.quality, defaults.quality, ctx.locale),
    projects: mergeProjects(raw.projects, defaults.projects, ctx),
    contact: mergeContact(raw.contact, defaults.contact, ctx.locale),
    footer: mergeFooter(raw.footer, defaults.footer, ctx.locale),
    careerModal: mergeCareerModal(raw.careerModal, defaults.careerModal, ctx.locale)
  };
}
