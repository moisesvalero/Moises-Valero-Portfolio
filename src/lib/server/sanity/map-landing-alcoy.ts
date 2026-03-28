import type {
  LandingBenefitItem,
  LandingDisenoWebAlcoy,
  LandingFaqItem,
  LandingMaintenanceItem,
  LandingSectionKey,
  LandingServiceItem
} from '$lib/types/landing-alcoy';
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

/** Copia antigua en Sanity/CMS; unificar etiqueta del modal en CTA final y footer. */
function mapContactModalTriggerLabel(raw: unknown, fallback: string): string {
  const s = asString(raw, fallback);
  const n = s.toLowerCase().replace(/\s+/g, ' ').trim();
  if (n === 'prefiero formulario') return 'Formulario';
  return s;
}

function asStringArray(v: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(v)) {
    return fallback;
  }
  const out = v.filter((i): i is string => typeof i === 'string' && i.trim().length > 0).map((i) => i.trim());
  return out.length ? out : fallback;
}

function absolutize(pathOrUrl: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = baseUrl.replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

const sectionSet = new Set<LandingSectionKey>([
  'hero',
  'services',
  'benefits',
  'faq',
  'finalCta'
]);

function mapSectionOrder(raw: unknown, fallback: LandingSectionKey[]): LandingSectionKey[] {
  if (!Array.isArray(raw)) {
    return fallback;
  }
  const clean = raw.filter((item): item is LandingSectionKey => typeof item === 'string' && sectionSet.has(item as LandingSectionKey));
  return clean.length ? clean : fallback;
}

function mapServiceItems(raw: unknown, fallback: LandingServiceItem[]): LandingServiceItem[] {
  if (!Array.isArray(raw)) {
    return fallback;
  }
  const mapped = raw
    .map((item, index) => {
      const o = asRecord(item);
      if (!o) {
        return null;
      }
      const title = asStringOpt(o.title) ?? fallback[index]?.title ?? '';
      if (!title) {
        return null;
      }
      return {
        title,
        offerBadge: asStringOpt(o.offerBadge) ?? fallback[index]?.offerBadge,
        subtitle: asStringOpt(o.subtitle) ?? fallback[index]?.subtitle,
        summary: asString(o.summary, asString(o.description, fallback[index]?.summary ?? '')),
        priceFrom: asString(o.priceFrom, fallback[index]?.priceFrom ?? ''),
        hideFromLabel:
          typeof o.hideFromLabel === 'boolean'
            ? o.hideFromLabel
            : (fallback[index]?.hideFromLabel ?? false),
        delivery: asStringOpt(o.delivery) ?? fallback[index]?.delivery,
        details: asStringArray(o.details, fallback[index]?.details ?? []),
        note: asStringOpt(o.note) ?? fallback[index]?.note,
        modalActionLabel: asStringOpt(o.modalActionLabel) ?? fallback[index]?.modalActionLabel,
        modalActionHref: asStringOpt(o.modalActionHref) ?? fallback[index]?.modalActionHref
      };
    })
    .filter(Boolean) as LandingServiceItem[];
  return mapped.length ? mapped : fallback;
}

function mapMaintenanceItems(raw: unknown, fallback: LandingMaintenanceItem[]): LandingMaintenanceItem[] {
  if (!Array.isArray(raw)) {
    return fallback;
  }
  const mapped = raw
    .map((item, index) => {
      const o = asRecord(item);
      if (!o) {
        return null;
      }
      const title = asStringOpt(o.title) ?? fallback[index]?.title ?? '';
      if (!title) {
        return null;
      }
      return {
        title,
        price: asString(o.price, fallback[index]?.price ?? ''),
        icon: asString(o.icon, fallback[index]?.icon ?? 'build'),
        detail: asString(o.detail, fallback[index]?.detail ?? ''),
        modalTitle: asString(o.modalTitle, fallback[index]?.modalTitle ?? title),
        checklist: asStringArray(o.checklist, fallback[index]?.checklist ?? []),
        note: asStringOpt(o.note) ?? fallback[index]?.note,
        actionLabel: asString(o.actionLabel, fallback[index]?.actionLabel ?? 'Contactar'),
        actionHref: asStringOpt(o.actionHref) ?? fallback[index]?.actionHref
      };
    })
    .filter(Boolean) as LandingMaintenanceItem[];
  return mapped.length ? mapped : fallback;
}

function mapBenefitItems(raw: unknown, fallback: LandingBenefitItem[]): LandingBenefitItem[] {
  if (!Array.isArray(raw)) {
    return fallback;
  }
  const mapped = raw
    .map((item, index) => {
      const o = asRecord(item);
      if (!o) {
        return null;
      }
      const title = asStringOpt(o.title) ?? fallback[index]?.title ?? '';
      if (!title) {
        return null;
      }
      return {
        title,
        description: asString(o.description, fallback[index]?.description ?? '')
      };
    })
    .filter(Boolean) as LandingBenefitItem[];
  return mapped.length ? mapped : fallback;
}

function mapFaqItems(raw: unknown, fallback: LandingFaqItem[]): LandingFaqItem[] {
  if (!Array.isArray(raw)) {
    return fallback;
  }
  const mapped = raw
    .map((item, index) => {
      const o = asRecord(item);
      if (!o) {
        return null;
      }
      const question = asStringOpt(o.question) ?? fallback[index]?.question ?? '';
      if (!question) {
        return null;
      }
      return {
        question,
        answer: asString(o.answer, fallback[index]?.answer ?? '')
      };
    })
    .filter(Boolean) as LandingFaqItem[];
  return mapped.length ? mapped : fallback;
}

export function mapLandingDisenoWebAlcoy(
  raw: Record<string, unknown> | null | undefined,
  defaults: LandingDisenoWebAlcoy,
  ctx: { projectId: string; dataset: string; baseUrl: string }
): LandingDisenoWebAlcoy {
  if (!raw) {
    return {
      ...defaults,
      seo: {
        ...defaults.seo,
        ogImage: absolutize(defaults.seo.ogImage, ctx.baseUrl)
      }
    };
  }

  const seo = asRecord(raw.seo);
  const hero = asRecord(raw.hero);
  const services = asRecord(raw.services);
  const benefits = asRecord(raw.benefits);
  const maintenance = asRecord(raw.maintenance);
  const faq = asRecord(raw.faq);
  const finalCta = asRecord(raw.finalCta);
  const contactModal = asRecord(raw.contactModal);
  const localBusiness = asRecord(raw.localBusiness);

  const seoImageFromAsset = seo ? imageUrl(ctx.projectId, ctx.dataset, seo.ogImage, 1600) : undefined;
  const seoImageFallback = seo ? asStringOpt(seo.ogImagePath) : undefined;
  const seoImage = seoImageFromAsset || seoImageFallback || defaults.seo.ogImage;

  const heroCta = asRecord(hero?.cta);
  const heroVisualImage = hero ? imageUrl(ctx.projectId, ctx.dataset, hero.visualImage, 1400) : undefined;
  const finalCtaNode = asRecord(finalCta?.cta);

  return {
    sectionOrder: mapSectionOrder(raw.sectionOrder, defaults.sectionOrder),
    seo: {
      title: asString(seo?.title, defaults.seo.title),
      description: asString(seo?.description, defaults.seo.description),
      ogTitle: asString(seo?.ogTitle, defaults.seo.ogTitle),
      ogDescription: asString(seo?.ogDescription, defaults.seo.ogDescription),
      ogImage: absolutize(seoImage, ctx.baseUrl),
      canonicalPath: asString(seo?.canonicalPath, defaults.seo.canonicalPath),
      twitterCard: seo?.twitterCard === 'summary' ? 'summary' : 'summary_large_image'
    },
    hero: {
      badge: asString(hero?.badge, defaults.hero.badge),
      title: asString(hero?.title, defaults.hero.title),
      subtitle: asString(hero?.subtitle, defaults.hero.subtitle),
      visualTitle: asStringOpt(hero?.visualTitle) ?? defaults.hero.visualTitle,
      visualDescription: asStringOpt(hero?.visualDescription) ?? defaults.hero.visualDescription,
      visualImageSrc:
        heroVisualImage || asStringOpt(hero?.visualImageSrc) || defaults.hero.visualImageSrc,
      visualImageAlt: asStringOpt(hero?.visualImageAlt) ?? defaults.hero.visualImageAlt,
      splineUrl: asStringOpt(hero?.splineUrl) ?? defaults.hero.splineUrl,
      cta: {
        label: asString(heroCta?.label, defaults.hero.cta.label),
        href: asString(heroCta?.href, defaults.hero.cta.href),
        secondaryLabel: asStringOpt(heroCta?.secondaryLabel) ?? defaults.hero.cta.secondaryLabel,
        secondaryHref: asStringOpt(heroCta?.secondaryHref) ?? defaults.hero.cta.secondaryHref
      }
    },
    services: {
      heading: asString(services?.heading, defaults.services.heading),
      items: mapServiceItems(services?.items, defaults.services.items),
      pricingFootnote: asStringOpt(services?.pricingFootnote) ?? defaults.services.pricingFootnote
    },
    maintenance: {
      heading: asString(maintenance?.heading, defaults.maintenance.heading),
      footerLabel: asStringOpt(maintenance?.footerLabel) ?? defaults.maintenance.footerLabel,
      lead: asString(maintenance?.lead, defaults.maintenance.lead),
      items: mapMaintenanceItems(maintenance?.items, defaults.maintenance.items),
      pricingFootnote:
        asStringOpt(maintenance?.pricingFootnote) ?? defaults.maintenance.pricingFootnote
    },
    benefits: {
      heading: asString(benefits?.heading, defaults.benefits.heading),
      buttonLabel: asStringOpt(benefits?.buttonLabel) ?? defaults.benefits.buttonLabel,
      buttonUrl: asStringOpt(benefits?.buttonUrl) ?? defaults.benefits.buttonUrl,
      items: mapBenefitItems(benefits?.items, defaults.benefits.items)
    },
    faq: {
      heading: asString(faq?.heading, defaults.faq.heading),
      items: mapFaqItems(faq?.items, defaults.faq.items)
    },
    finalCta: {
      heading: asString(finalCta?.heading, defaults.finalCta.heading),
      text: asString(finalCta?.text, defaults.finalCta.text),
      cta: {
        label: asString(finalCtaNode?.label, defaults.finalCta.cta.label),
        href: asString(finalCtaNode?.href, defaults.finalCta.cta.href),
        secondaryLabel: asStringOpt(finalCtaNode?.secondaryLabel) ?? defaults.finalCta.cta.secondaryLabel,
        secondaryHref: asStringOpt(finalCtaNode?.secondaryHref) ?? defaults.finalCta.cta.secondaryHref
      }
    },
    contactModal: {
      triggerLabel: mapContactModalTriggerLabel(
        contactModal?.triggerLabel,
        defaults.contactModal.triggerLabel
      ),
      heading: asString(contactModal?.heading, defaults.contactModal.heading),
      text: asString(contactModal?.text, defaults.contactModal.text),
      submitLabel: asString(contactModal?.submitLabel, defaults.contactModal.submitLabel),
      successMessage: asString(contactModal?.successMessage, defaults.contactModal.successMessage),
      privacyLabel: asString(contactModal?.privacyLabel, defaults.contactModal.privacyLabel)
    },
    localBusiness: {
      businessName: asString(localBusiness?.businessName, defaults.localBusiness.businessName),
      serviceType: asString(localBusiness?.serviceType, defaults.localBusiness.serviceType),
      areaServed: asStringArray(localBusiness?.areaServed, defaults.localBusiness.areaServed),
      addressLocality: asString(localBusiness?.addressLocality, defaults.localBusiness.addressLocality),
      addressRegion: asString(localBusiness?.addressRegion, defaults.localBusiness.addressRegion),
      addressCountry: asString(localBusiness?.addressCountry, defaults.localBusiness.addressCountry),
      telephone: asStringOpt(localBusiness?.telephone) ?? defaults.localBusiness.telephone,
      email: asStringOpt(localBusiness?.email) ?? defaults.localBusiness.email,
      priceRange: asStringOpt(localBusiness?.priceRange) ?? defaults.localBusiness.priceRange
    }
  };
}
