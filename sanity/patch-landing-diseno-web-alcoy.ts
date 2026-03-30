/**
 * Sincroniza el documento singleton `landingDisenoWebAlcoy` con los textos actuales del repo.
 * Ejecutar desde la raíz:
 *   npx sanity exec sanity/patch-landing-diseno-web-alcoy.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { landingAlcoyDefaults } from '../src/lib/data/landing-alcoy-defaults';

type LocaleString = { es: string; en?: string };
type LocaleText = { es: string; en?: string };

const asLocaleString = (value?: string): LocaleString => ({ es: value || '' });
const asLocaleText = (value?: string): LocaleText => ({ es: value || '' });
const keyOf = (prefix: string, index: number) => `${prefix}-${index + 1}`;

function landingHeroForSanity() {
  const { marquee, ...heroCore } = landingAlcoyDefaults.hero;
  return {
    ...heroCore,
    heroMarquee: {
      kicker: marquee.kicker,
      items: []
    }
  };
}

function mapLandingDocument() {
  const landing = landingAlcoyDefaults;

  return {
    _id: 'landingDisenoWebAlcoy',
    _type: 'landingDisenoWebAlcoy',
    internalTitle: 'Landing Diseño web en Alcoy',
    sectionOrder: landing.sectionOrder,
    seo: {
      title: landing.seo.title,
      description: landing.seo.description,
      ogTitle: landing.seo.ogTitle,
      ogDescription: landing.seo.ogDescription,
      ogImagePath: landing.seo.ogImage,
      canonicalPath: landing.seo.canonicalPath,
      twitterCard: landing.seo.twitterCard
    },
    hero: landingHeroForSanity(),
    services: {
      heading: landing.services.heading,
      pricingFootnote: landing.services.pricingFootnote,
      items: landing.services.items.map((item, index) => ({
        _key: keyOf('landing-service', index),
        title: item.title,
        offerBadge: item.offerBadge,
        subtitle: item.subtitle,
        summary: item.summary,
        priceFrom: item.priceFrom,
        hideFromLabel: item.hideFromLabel === true,
        delivery: item.delivery,
        details: item.details,
        note: item.note,
        modalActionLabel: item.modalActionLabel,
        modalActionHref: item.modalActionHref
      }))
    },
    maintenance: {
      heading: landing.maintenance.heading,
      footerLabel: landing.maintenance.footerLabel,
      lead: landing.maintenance.lead,
      pricingFootnote: landing.maintenance.pricingFootnote,
      items: landing.maintenance.items.map((item, index) => ({
        _key: keyOf('landing-maintenance', index),
        title: item.title,
        price: item.price,
        icon: item.icon,
        detail: item.detail,
        modalTitle: item.modalTitle,
        checklist: item.checklist,
        note: item.note,
        actionLabel: item.actionLabel,
        actionHref: item.actionHref
      }))
    },
    benefits: {
      heading: landing.benefits.heading,
      buttonLabel: landing.benefits.buttonLabel,
      buttonUrl: landing.benefits.buttonUrl,
      items: landing.benefits.items.map((item, index) => ({
        _key: keyOf('landing-benefit', index),
        ...item
      }))
    },
    faq: {
      heading: landing.faq.heading,
      items: landing.faq.items.map((item, index) => ({
        _key: keyOf('landing-faq', index),
        ...item
      }))
    },
    finalCta: landing.finalCta,
    analyzerModal: {
      triggerLabel: landing.analyzerModal.triggerLabel,
      heading: landing.analyzerModal.heading,
      text: landing.analyzerModal.text,
      urlLabel: landing.analyzerModal.urlLabel,
      urlPlaceholder: landing.analyzerModal.urlPlaceholder,
      urlHelp: landing.analyzerModal.urlHelp,
      submitLabel: landing.analyzerModal.submitLabel,
      loadingTitle: landing.analyzerModal.loadingTitle,
      loadingText: landing.analyzerModal.loadingText,
      loadingSteps: landing.analyzerModal.loadingSteps,
      scoreLabel: landing.analyzerModal.scoreLabel,
      whatsappCtaLabel: landing.analyzerModal.whatsappCtaLabel,
      emailCaptureTitle: landing.analyzerModal.emailCaptureTitle,
      emailCaptureText: landing.analyzerModal.emailCaptureText,
      emailCapturePlaceholder: landing.analyzerModal.emailCapturePlaceholder,
      emailCaptureButton: landing.analyzerModal.emailCaptureButton,
      emailCaptureSuccess: landing.analyzerModal.emailCaptureSuccess
    },
    contactModal: landing.contactModal,
    localBusiness: landing.localBusiness
  };
}

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });
  const landingDoc = mapLandingDocument();

  await client.createOrReplace(landingDoc);

  console.log('OK: landingDisenoWebAlcoy sincronizado con el texto actual del repo.');
}

main().catch((error) => {
  console.error('Error sincronizando landingDisenoWebAlcoy:', error);
  process.exit(1);
});
