/**
 * Sincroniza el documento singleton `portfolioSite` con los textos actuales del repo.
 * Ejecutar desde la raíz:
 *   npx sanity exec sanity/patch-portfolio-site.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { sitePortfolioDefaults } from '../src/lib/data/site-portfolio-defaults';
import { portfolioEnglishDemo } from '../src/lib/data/site-portfolio-locale-en';

type LocaleString = { es: string; en?: string };
type LocaleText = { es: string; en?: string };

const asLocaleString = (es: string, en?: string): LocaleString => ({ es, en: en ?? '' });
const asLocaleText = (es: string, en?: string): LocaleText => ({ es, en: en ?? '' });
const keyOf = (prefix: string, index: number) => `${prefix}-${index + 1}`;

function mapPortfolioDocument() {
  const site = sitePortfolioDefaults;
  const en = portfolioEnglishDemo;

  return {
    _id: 'portfolioSite',
    _type: 'sitePortfolio',
    title: 'Web principal',
    header: {
      logoText: asLocaleString(site.header.logoText, en.header.logoText),
      logoHref: site.header.logoHref,
      navItems: site.header.navItems.map((item, index) => ({
        _key: keyOf('nav', index),
        label: asLocaleString(item.label, en.header.navItems[index]?.label),
        href: item.href,
        ...(item.openCareerModal ? { openCareerModal: true } : {})
      })),
      ctaLabel: asLocaleString(site.header.ctaLabel, en.header.ctaLabel),
      ctaHref: site.header.ctaHref
    },
    seo: site.seo,
    hero: {
      cvHref: site.hero.cvHref,
      label: asLocaleString(site.hero.label, en.hero.label),
      title: asLocaleString(site.hero.title, en.hero.title),
      subtitle: asLocaleString(site.hero.subtitle, en.hero.subtitle),
      bio: asLocaleText(site.hero.bio, en.hero.bio),
      ctaPrimaryLabel: asLocaleString(site.hero.ctaPrimaryLabel ?? '', en.hero.ctaPrimaryLabel),
      careerCtaLabel: asLocaleString(site.hero.careerCtaLabel ?? '', en.hero.careerCtaLabel)
    },
    about: {
      imageSrc: site.about.imageSrc,
      imageAlt: asLocaleString(site.about.imageAlt, en.about.imageAlt),
      meta: asLocaleString(site.about.meta, en.about.meta),
      title: asLocaleString(site.about.title, en.about.title),
      aboutHtml: asLocaleText(site.about.aboutHtml, en.about.aboutHtml)
    },
    services: {
      meta: asLocaleString(site.services.meta, en.services.meta),
      title: asLocaleString(site.services.title, en.services.title),
      items: site.services.items.map((item, index) => ({
        _key: keyOf('service', index),
        icon: item.icon,
        title: asLocaleString(item.title, en.services.items[index]?.title),
        description: asLocaleText(item.description, en.services.items[index]?.description)
      }))
    },
    techStack: {
      meta: asLocaleString(site.techStack.meta, en.techStack.meta),
      title: asLocaleString(site.techStack.title, en.techStack.title),
      categories: site.techStack.categories.map((category, catIndex) => ({
        _key: keyOf('stack-category', catIndex),
        title: asLocaleString(category.title, en.techStack.categories[catIndex]?.title),
        icons: category.icons.map((icon, iconIndex) => ({
          _key: keyOf(`stack-icon-${catIndex + 1}`, iconIndex),
          ...icon
        }))
      }))
    },
    quality: {
      meta: asLocaleString(site.quality.meta, en.quality.meta),
      title: asLocaleString(site.quality.title, en.quality.title),
      items: site.quality.items.map((item, index) => ({
        _key: keyOf('quality', index),
        icon: item.icon,
        title: asLocaleString(item.title, en.quality.items[index]?.title),
        description: asLocaleText(item.description, en.quality.items[index]?.description)
      }))
    },
    projects: {
      meta: asLocaleString(site.projects.meta, en.projects.meta),
      title: asLocaleString(site.projects.title, en.projects.title),
      intro: asLocaleText(site.projects.intro ?? '', en.projects.intro),
      maxHomeProjects: site.projects.maxHomeProjects,
      archiveLinkLabel: asLocaleString(
        site.projects.archiveLinkLabel ?? '',
        en.projects.archiveLinkLabel
      ),
      archiveHref: site.projects.archiveHref,
      projects: site.projects.projects.map((project, index) => ({
        _key: keyOf('featured-project', index),
        sortOrder: index,
        imageSrc: project.imageSrc,
        imageAlt: project.imageAlt,
        title: asLocaleString(project.title, en.projects.projects[index]?.title),
        description: asLocaleText(project.description, en.projects.projects[index]?.description),
        tags: project.tags,
        linkLabel: asLocaleString(project.linkLabel, en.projects.projects[index]?.linkLabel),
        destinationUrl: project.href
      }))
    },
    contact: {
      heading: asLocaleString(site.contact.heading, en.contact.heading),
      subtitle: asLocaleString(site.contact.subtitle, en.contact.subtitle),
      typebotSrc: site.contact.typebotSrc,
      whatsappLead: asLocaleString(site.contact.whatsappLead, en.contact.whatsappLead),
      whatsappButtonLabel: asLocaleString(
        site.contact.whatsappButtonLabel,
        en.contact.whatsappButtonLabel
      ),
      formLead: asLocaleString(site.contact.formLead, en.contact.formLead),
      formButtonLabel: asLocaleString(site.contact.formButtonLabel, en.contact.formButtonLabel),
      formModalHeading: asLocaleString(site.contact.formModalHeading, en.contact.formModalHeading),
      formModalText: asLocaleString(site.contact.formModalText, en.contact.formModalText),
      formModalSubmitLabel: asLocaleString(
        site.contact.formModalSubmitLabel,
        en.contact.formModalSubmitLabel
      ),
      formModalPrivacyLabel: asLocaleString(
        site.contact.formModalPrivacyLabel,
        en.contact.formModalPrivacyLabel
      ),
      formModalSuccessMessage: asLocaleString(
        site.contact.formModalSuccessMessage,
        en.contact.formModalSuccessMessage
      ),
      iframeTitle: asLocaleString(site.contact.iframeTitle, en.contact.iframeTitle)
    },
    footer: {
      copyrightTemplate: asLocaleText(
        site.footer.copyrightTemplate,
        en.footer.copyrightTemplate
      ),
      githubHref: site.footer.githubHref,
      linkedinHref: site.footer.linkedinHref,
      maltHref: en.footer.maltHref || site.footer.maltHref,
      emailHref: site.footer.emailHref
    },
    careerModal: {
      pdfHref: site.careerModal.pdfHref,
      closeAria: asLocaleString(site.careerModal.closeAria, en.careerModal.closeAria),
      title: asLocaleString(site.careerModal.title, en.careerModal.title),
      profileTitle: asLocaleString(site.careerModal.profileTitle, en.careerModal.profileTitle),
      profileHtml: asLocaleText(site.careerModal.profileHtml, en.careerModal.profileHtml),
      expTitle: asLocaleString(site.careerModal.expTitle, en.careerModal.expTitle),
      timeline: site.careerModal.timeline.map((item, index) => ({
        _key: keyOf('career-timeline', index),
        range: item.range,
        role: asLocaleString(item.role, en.careerModal.timeline[index]?.role),
        descHtml: asLocaleText(item.descHtml, en.careerModal.timeline[index]?.descHtml),
        span: item.span === true
      })),
      stackTitle: asLocaleString(site.careerModal.stackTitle, en.careerModal.stackTitle),
      pdfHide: asLocaleString(site.careerModal.pdfHide, en.careerModal.pdfHide),
      pdfShow: asLocaleString(site.careerModal.pdfShow, en.careerModal.pdfShow),
      pdfIframeTitle: asLocaleString(site.careerModal.pdfIframeTitle, en.careerModal.pdfIframeTitle),
      pdfHintBefore: asLocaleString(site.careerModal.pdfHintBefore, en.careerModal.pdfHintBefore),
      pdfHintLink: asLocaleString(site.careerModal.pdfHintLink, en.careerModal.pdfHintLink)
    }
  };
}

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });
  const portfolioDoc = mapPortfolioDocument();

  await client.createOrReplace(portfolioDoc);

  console.log('OK: portfolioSite sincronizado con textos ES/EN del repo.');
}

main().catch((error) => {
  console.error('Error sincronizando portfolioSite:', error);
  process.exit(1);
});
