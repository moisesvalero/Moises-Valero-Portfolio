import { getCliClient } from 'sanity/cli';
import { getAllCaseStudies } from '../src/lib/data/case-studies';
import { landingAlcoyDefaults } from '../src/lib/data/landing-alcoy-defaults';
import { sitePortfolioDefaults } from '../src/lib/data/site-portfolio-defaults';

type LocaleString = { es: string; en?: string };
type LocaleText = { es: string; en?: string };

const asLocaleString = (value?: string): LocaleString => ({ es: value || '' });
const asLocaleText = (value?: string): LocaleText => ({ es: value || '' });
const keyOf = (prefix: string, index: number) => `${prefix}-${index + 1}`;

function mapSitePortfolioDocument() {
  const site = sitePortfolioDefaults;
  return {
    _id: 'portfolioSite',
    _type: 'sitePortfolio',
    title: 'Web principal',
    header: {
      ...site.header,
      navItems: site.header.navItems.map((item, index) => ({
        _key: keyOf('nav', index),
        ...item
      }))
    },
    seo: site.seo,
    hero: {
      cvHref: site.hero.cvHref,
      label: site.hero.label,
      title: site.hero.title,
      subtitle: site.hero.subtitle,
      bio: site.hero.bio
    },
    about: site.about,
    services: {
      meta: asLocaleString(site.services.meta),
      title: asLocaleString(site.services.title),
      items: site.services.items.map((item, index) => ({
        _key: keyOf('service', index),
        icon: item.icon,
        title: asLocaleString(item.title),
        description: asLocaleText(item.description)
      }))
    },
    techStack: {
      ...site.techStack,
      categories: site.techStack.categories.map((category, catIndex) => ({
        _key: keyOf('stack-category', catIndex),
        title: category.title,
        icons: category.icons.map((icon, iconIndex) => ({
          _key: keyOf(`stack-icon-${catIndex + 1}`, iconIndex),
          ...icon
        }))
      }))
    },
    quality: {
      ...site.quality,
      items: site.quality.items.map((item, index) => ({
        _key: keyOf('quality', index),
        ...item
      }))
    },
    projects: {
      meta: asLocaleString(site.projects.meta),
      title: asLocaleString(site.projects.title),
      projects: site.projects.projects.map((project, index) => ({
        _key: keyOf('featured-project', index),
        sortOrder: index,
        imageSrc: project.imageSrc,
        imageAlt: project.imageAlt,
        title: asLocaleString(project.title),
        description: asLocaleText(project.description),
        tags: project.tags,
        linkLabel: asLocaleString(project.linkLabel),
        destinationUrl: project.href
      }))
    },
    contact: site.contact,
    footer: site.footer,
    careerModal: {
      pdfHref: site.careerModal.pdfHref,
      closeAria: asLocaleString(site.careerModal.closeAria),
      title: asLocaleString(site.careerModal.title),
      profileTitle: asLocaleString(site.careerModal.profileTitle),
      profileHtml: asLocaleText(site.careerModal.profileHtml),
      expTitle: asLocaleString(site.careerModal.expTitle),
      timeline: site.careerModal.timeline.map((item, index) => ({
        _key: keyOf('career-timeline', index),
        range: item.range,
        role: asLocaleString(item.role),
        descHtml: asLocaleText(item.descHtml),
        span: item.span === true
      })),
      stackTitle: asLocaleString(site.careerModal.stackTitle),
      pdfHide: asLocaleString(site.careerModal.pdfHide),
      pdfShow: asLocaleString(site.careerModal.pdfShow),
      pdfIframeTitle: asLocaleString(site.careerModal.pdfIframeTitle),
      pdfHintBefore: asLocaleString(site.careerModal.pdfHintBefore),
      pdfHintLink: asLocaleString(site.careerModal.pdfHintLink)
    }
  };
}

function mapCaseStudyDocuments() {
  return getAllCaseStudies().map((study) => ({
    _id: `caseStudy.${study.slug}`,
    _type: 'caseStudy',
    estadoInterno: 'listo',
    showOnHome: true,
    homeSortOrder: 0,
    title: study.title,
    slug: { _type: 'slug', current: study.slug },
    seoDescription: study.seoDescription,
    heroTag: study.heroTag,
    heroDescription: study.heroDescription,
    tags: study.tags,
    images: study.images,
    metrics: study.metrics.map((metric, index) => ({
      _key: keyOf('metric', index),
      ...metric
    })),
    reto: study.reto,
    hice: study.hice,
    resultado: study.resultado,
    stack: study.stack,
    liveUrl: study.liveUrl,
    checklistPublicacion: {
      tituloYSlug: true,
      contenidoPrincipal: true,
      imagenesCargadas: true,
      seoCompletado: true
    }
  }));
}

/** Hero para Sanity: sin `marquee` local (rutas estáticas); el carrusel se rellena en Studio con imágenes CDN. */
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

function mapLandingDisenoWebAlcoyDocument() {
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
    contactModal: landing.contactModal,
    localBusiness: landing.localBusiness
  };
}

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });
  const siteDoc = mapSitePortfolioDocument();
  const landingDoc = mapLandingDisenoWebAlcoyDocument();
  const caseStudies = mapCaseStudyDocuments();

  await client.createOrReplace(siteDoc);
  await client.createOrReplace(landingDoc);
  for (const study of caseStudies) {
    await client.createOrReplace(study);
  }

  console.log(
    `Seed completado: 2 documentos globales y ${caseStudies.length} proyecto(s) cargados en Sanity.`
  );
}

main().catch((error) => {
  console.error('Error cargando seed inicial en Sanity:', error);
  process.exit(1);
});

