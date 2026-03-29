export type LandingSectionKey = 'hero' | 'services' | 'benefits' | 'faq' | 'finalCta';

export type LandingCta = {
  label: string;
  href: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

/** Ítem de la marquesina de proyectos bajo el hero (CMS o fallback local). */
export type LandingHeroMarqueeItem = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
};

export type LandingHeroMarquee = {
  kicker: string;
  items: LandingHeroMarqueeItem[];
};

export type LandingSeo = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalPath: string;
  twitterCard: 'summary' | 'summary_large_image';
};

export type LandingHero = {
  badge: string;
  title: string;
  subtitle: string;
  visualTitle?: string;
  visualDescription?: string;
  visualImageSrc?: string;
  visualImageAlt?: string;
  splineUrl?: string;
  cta: LandingCta;
  /** Carrusel de capturas; siempre presente tras el load (defaults locales si Sanity vacío). */
  marquee: LandingHeroMarquee;
};

export type LandingServiceItem = {
  title: string;
  offerBadge?: string;
  subtitle?: string;
  summary: string;
  priceFrom: string;
  hideFromLabel?: boolean;
  delivery?: string;
  details: string[];
  note?: string;
  modalActionLabel?: string;
  modalActionHref?: string;
};

export type LandingMaintenanceItem = {
  title: string;
  price: string;
  icon: string;
  detail: string;
  modalTitle: string;
  checklist: string[];
  note?: string;
  actionLabel: string;
  actionHref?: string;
};

export type LandingBenefitItem = {
  title: string;
  description: string;
};

export type LandingFaqItem = {
  question: string;
  answer: string;
};

export type LandingLocalBusiness = {
  businessName: string;
  serviceType: string;
  areaServed: string[];
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
  telephone?: string;
  email?: string;
  priceRange?: string;
};

export type LandingContactModal = {
  triggerLabel: string;
  heading: string;
  text: string;
  submitLabel: string;
  successMessage: string;
  privacyLabel: string;
};

export type LandingDisenoWebAlcoy = {
  sectionOrder: LandingSectionKey[];
  seo: LandingSeo;
  hero: LandingHero;
  services: {
    heading: string;
    items: LandingServiceItem[];
    pricingFootnote?: string;
  };
  maintenance: {
    heading: string;
    footerLabel?: string;
    lead: string;
    items: LandingMaintenanceItem[];
    pricingFootnote?: string;
  };
  benefits: {
    heading: string;
    buttonLabel?: string;
    buttonUrl?: string;
    items: LandingBenefitItem[];
  };
  faq: {
    heading: string;
    items: LandingFaqItem[];
  };
  finalCta: {
    heading: string;
    text: string;
    cta: LandingCta;
  };
  contactModal: LandingContactModal;
  localBusiness: LandingLocalBusiness;
};
