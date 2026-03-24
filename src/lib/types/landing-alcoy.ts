export type LandingSectionKey = 'hero' | 'services' | 'benefits' | 'cases' | 'faq' | 'finalCta';

export type LandingCta = {
  label: string;
  href: string;
  secondaryLabel?: string;
  secondaryHref?: string;
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
};

export type LandingServiceItem = {
  title: string;
  description: string;
};

export type LandingBenefitItem = {
  title: string;
  description: string;
};

export type LandingCaseItem = {
  title: string;
  summary: string;
  outcome: string;
  href?: string;
  linkLabel?: string;
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
  };
  benefits: {
    heading: string;
    items: LandingBenefitItem[];
  };
  cases: {
    heading: string;
    items: LandingCaseItem[];
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
