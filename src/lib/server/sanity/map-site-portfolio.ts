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

function mergeHeader(raw: unknown, d: SitePortfolioContent['header']): SitePortfolioContent['header'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  const nav = Array.isArray(o.navItems)
    ? (o.navItems as unknown[])
        .map((x) => {
          const r = asRecord(x);
          if (!r) {
            return null;
          }
          const label = asStringOpt(r.label);
          const href = asStringOpt(r.href);
          if (!label || !href) {
            return null;
          }
          return { label, href };
        })
        .filter(Boolean)
    : [];
  return {
    logoText: asString(o.logoText, d.logoText),
    logoHref: asString(o.logoHref, d.logoHref),
    navItems: nav.length ? (nav as SitePortfolioContent['header']['navItems']) : d.navItems,
    ctaLabel: asString(o.ctaLabel, d.ctaLabel),
    ctaHref: asString(o.ctaHref, d.ctaHref)
  };
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
  const ogImageRaw = asStringOpt(o.ogImage) ?? d.ogImage;
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

function mergeHero(raw: unknown, d: SitePortfolioContent['hero']): SitePortfolioContent['hero'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  return {
    cvHref: asString(o.cvHref, d.cvHref),
    label: asString(o.label, d.label),
    title: asString(o.title, d.title),
    subtitle: asString(o.subtitle, d.subtitle),
    bio: asString(o.bio, d.bio)
  };
}

function mergeAbout(
  raw: unknown,
  d: SitePortfolioContent['about'],
  ctx: { projectId: string; dataset: string }
): SitePortfolioContent['about'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  const fromImage = imageUrl(ctx.projectId, ctx.dataset, o.image, 800);
  return {
    imageSrc: fromImage || asString(o.imageSrc, d.imageSrc),
    imageAlt: asString(o.imageAlt, d.imageAlt),
    meta: asString(o.meta, d.meta),
    title: asString(o.title, d.title),
    aboutHtml: asString(o.aboutHtml, d.aboutHtml)
  };
}

function mergeServices(raw: unknown, d: SitePortfolioContent['services']): SitePortfolioContent['services'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  const itemsRaw = Array.isArray(o.items) ? (o.items as unknown[]) : [];
  const items = itemsRaw
    .map((x) => {
      const r = asRecord(x);
      if (!r) {
        return null;
      }
      const title = asStringOpt(r.title);
      if (!title) {
        return null;
      }
      return {
        icon: asString(r.icon, '•'),
        title,
        description: asString(r.description, '')
      };
    })
    .filter(Boolean) as SitePortfolioContent['services']['items'];
  return {
    meta: asString(o.meta, d.meta),
    title: asString(o.title, d.title),
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
  const src = fromImg || asString(o.src, fallback.src);
  return {
    src,
    alt: asString(o.alt, fallback.alt),
    title: asStringOpt(o.title) ?? fallback.title
  };
}

function mergeTechStack(
  raw: unknown,
  d: SitePortfolioContent['techStack'],
  ctx: { projectId: string; dataset: string }
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
      const title = asStringOpt(r.title);
      if (!title) {
        return null;
      }
      const iconsRaw = Array.isArray(r.icons) ? (r.icons as unknown[]) : [];
      const defaultIcons = d.categories[ci]?.icons ?? d.categories[0]?.icons ?? [];
      const icons = iconsRaw.map((ic, ii) =>
        mapStackIcon(ic, ctx, defaultIcons[ii] ?? { src: '', alt: 'icon', title: 'icon' })
      );
      return {
        title,
        icons: icons.length ? icons : defaultIcons
      };
    })
    .filter(Boolean) as SitePortfolioContent['techStack']['categories'];
  return {
    meta: asString(o.meta, d.meta),
    title: asString(o.title, d.title),
    categories: categories.length ? categories : d.categories
  };
}

function mergeQuality(raw: unknown, d: SitePortfolioContent['quality']): SitePortfolioContent['quality'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  const itemsRaw = Array.isArray(o.items) ? (o.items as unknown[]) : [];
  const items = itemsRaw
    .map((x) => {
      const r = asRecord(x);
      if (!r) {
        return null;
      }
      const title = asStringOpt(r.title);
      if (!title) {
        return null;
      }
      return {
        icon: asString(r.icon, '•'),
        title,
        description: asString(r.description, '')
      };
    })
    .filter(Boolean) as SitePortfolioContent['quality']['items'];
  return {
    meta: asString(o.meta, d.meta),
    title: asString(o.title, d.title),
    items: items.length ? items : d.items
  };
}

function mapProject(raw: unknown, ctx: { projectId: string; dataset: string }): SiteProjectCard | null {
  const o = asRecord(raw);
  if (!o) {
    return null;
  }
  const title = asStringOpt(o.title);
  if (!title) {
    return null;
  }
  const href = asString(o.destinationUrl, '/');
  const external = /^https?:\/\//i.test(href);
  const imageSrc =
    imageUrl(ctx.projectId, ctx.dataset, o.thumbnail, 900) ||
    asString(o.imageSrc, '') ||
    'https://placehold.co/800x450/f1f5f9/64748b?text=Proyecto';
  const tags = Array.isArray(o.tags) ? (o.tags as unknown[]).filter((t): t is string => typeof t === 'string') : [];
  return {
    imageSrc,
    imageAlt: asString(o.imageAlt, title),
    href,
    external,
    linkLabel: asString(o.linkLabel, 'Ver'),
    title,
    description: asString(o.description, ''),
    tags
  };
}

function mergeProjects(
  raw: unknown,
  d: SitePortfolioContent['projects'],
  ctx: { projectId: string; dataset: string }
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
  return {
    meta: asString(o.meta, d.meta),
    title: asString(o.title, d.title),
    projects: mapped.length ? mapped : d.projects
  };
}

function mergeContact(raw: unknown, d: SitePortfolioContent['contact']): SitePortfolioContent['contact'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  return {
    heading: asString(o.heading, d.heading),
    subtitle: asString(o.subtitle, d.subtitle),
    typebotSrc: asString(o.typebotSrc, d.typebotSrc),
    linkedinHref: asString(o.linkedinHref, d.linkedinHref),
    linkedinLead: asString(o.linkedinLead, d.linkedinLead),
    linkedinButtonLabel: asString(o.linkedinButtonLabel, d.linkedinButtonLabel),
    iframeTitle: asString(o.iframeTitle, d.iframeTitle)
  };
}

function mergeFooter(raw: unknown, d: SitePortfolioContent['footer']): SitePortfolioContent['footer'] {
  const o = asRecord(raw);
  if (!o) {
    return d;
  }
  return {
    copyrightTemplate: asString(o.copyrightTemplate, d.copyrightTemplate),
    githubHref: asString(o.githubHref, d.githubHref),
    linkedinHref: asString(o.linkedinHref, d.linkedinHref),
    emailHref: asString(o.emailHref, d.emailHref)
  };
}

/**
 * Combina documento Sanity con valores por defecto. `baseUrl` sirve para resolver `ogImage` relativos.
 */
export function mapSanitySitePortfolio(
  raw: Record<string, unknown> | null | undefined,
  defaults: SitePortfolioContent,
  ctx: { projectId: string; dataset: string; baseUrl: string }
): SitePortfolioContent {
  if (!raw) {
    return {
      ...defaults,
      seo: { ...defaults.seo, ogImage: absolutizeOgImage(defaults.seo.ogImage, ctx.baseUrl) }
    };
  }
  return {
    header: mergeHeader(raw.header, defaults.header),
    seo: mergeSeo(raw.seo, defaults.seo, ctx.baseUrl),
    hero: mergeHero(raw.hero, defaults.hero),
    about: mergeAbout(raw.about, defaults.about, ctx),
    services: mergeServices(raw.services, defaults.services),
    techStack: mergeTechStack(raw.techStack, defaults.techStack, ctx),
    quality: mergeQuality(raw.quality, defaults.quality),
    projects: mergeProjects(raw.projects, defaults.projects, ctx),
    contact: mergeContact(raw.contact, defaults.contact),
    footer: mergeFooter(raw.footer, defaults.footer)
  };
}
