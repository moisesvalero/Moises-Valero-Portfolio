/**
 * Convierte textos planos → { es, en } SIN tocar el español guardado en producción.
 * El inglés inicial sale del documento actual o queda vacío (edítalo en Studio).
 *
 *   npm run sanity:migrate-home-locale
 */
import { getCliClient } from 'sanity/cli';
import { portfolioEnglishDemo } from '../src/lib/data/site-portfolio-locale-en';

type Ls = { es: string; en: string };
type Lt = { es: string; en: string };

const DOC_ID = 'portfolioSite';
const en = portfolioEnglishDemo;

function asRecord(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;
}

function toLs(value: unknown, enHint = ''): Ls {
  if (typeof value === 'string') {
    return { es: value, en: enHint };
  }
  const o = asRecord(value);
  if (o) {
    return {
      es: typeof o.es === 'string' ? o.es : '',
      en: typeof o.en === 'string' ? o.en : enHint
    };
  }
  return { es: '', en: enHint };
}

function toLt(value: unknown, enHint = ''): Lt {
  return toLs(value, enHint);
}

function navEn(href: string, openCareerModal: boolean): string {
  const item = en.header.navItems.find(
    (n) => (openCareerModal && n.openCareerModal) || n.href === href
  );
  return item?.label ?? '';
}

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });
  const doc = await client.fetch<Record<string, unknown> | null>(`*[_id == $id][0]`, { id: DOC_ID });
  if (!doc) {
    console.error(`No existe ${DOC_ID}`);
    process.exit(1);
  }

  const header = asRecord(doc.header);
  const hero = asRecord(doc.hero);
  const about = asRecord(doc.about);
  const services = asRecord(doc.services);
  const techStack = asRecord(doc.techStack);
  const quality = asRecord(doc.quality);
  const contact = asRecord(doc.contact);
  const footer = asRecord(doc.footer);

  const navItems = Array.isArray(header?.navItems) ? (header.navItems as unknown[]) : [];
  const serviceItems = Array.isArray(services?.items) ? (services.items as unknown[]) : [];
  const qualityItems = Array.isArray(quality?.items) ? (quality.items as unknown[]) : [];

  const patched = {
    ...doc,
    header: {
      ...header,
      logoText: toLs(header?.logoText, en.header.logoText),
      navItems: navItems.map((item) => {
        const row = asRecord(item) ?? {};
        const href = typeof row.href === 'string' ? row.href : '#';
        const open = row.openCareerModal === true;
        return {
          ...row,
          label: toLs(row.label, navEn(href, open))
        };
      }),
      ctaLabel: toLs(header?.ctaLabel, en.header.ctaLabel)
    },
    hero: {
      ...hero,
      cvHref: '/api/cv',
      label: toLs(hero?.label, en.hero.label),
      title: toLs(hero?.title, en.hero.title),
      subtitle: toLs(hero?.subtitle, en.hero.subtitle),
      bio: toLt(hero?.bio, en.hero.bio),
      ctaPrimaryLabel: toLs(hero?.ctaPrimaryLabel ?? 'Ver CV', en.hero.ctaPrimaryLabel),
      careerCtaLabel: toLs(hero?.careerCtaLabel ?? 'Ver Trayectoria', en.hero.careerCtaLabel)
    },
    about: {
      ...about,
      imageAlt: toLs(about?.imageAlt, en.about.imageAlt),
      meta: toLs(about?.meta, en.about.meta),
      title: toLs(about?.title, en.about.title),
      aboutHtml: toLt(about?.aboutHtml, en.about.aboutHtml)
    },
    services: {
      ...services,
      meta: toLs(services?.meta, en.services.meta),
      title: toLs(services?.title, en.services.title),
      items: serviceItems.map((item, i) => {
        const row = asRecord(item) ?? {};
        return {
          ...row,
          title: toLs(row.title, en.services.items[i]?.title ?? ''),
          description: toLt(row.description, en.services.items[i]?.description ?? '')
        };
      })
    },
    techStack: {
      ...techStack,
      meta: toLs(techStack?.meta, en.techStack.meta),
      title: toLs(techStack?.title, en.techStack.title)
    },
    quality: {
      ...quality,
      meta: toLs(quality?.meta, en.quality.meta),
      title: toLs(quality?.title, en.quality.title),
      items: qualityItems.map((item, i) => {
        const row = asRecord(item) ?? {};
        return {
          ...row,
          title: toLs(row.title, en.quality.items[i]?.title ?? ''),
          description: toLt(row.description, en.quality.items[i]?.description ?? '')
        };
      })
    },
    contact: {
      ...contact,
      heading: toLs(contact?.heading, en.contact.heading),
      subtitle: toLs(contact?.subtitle, en.contact.subtitle),
      whatsappLead: toLs(contact?.whatsappLead, en.contact.whatsappLead),
      whatsappButtonLabel: toLs(contact?.whatsappButtonLabel, en.contact.whatsappButtonLabel),
      formLead: toLs(contact?.formLead, en.contact.formLead),
      formButtonLabel: toLs(contact?.formButtonLabel, en.contact.formButtonLabel),
      formModalHeading: toLs(contact?.formModalHeading, en.contact.formModalHeading),
      formModalText: toLs(contact?.formModalText, en.contact.formModalText),
      formModalSubmitLabel: toLs(contact?.formModalSubmitLabel, en.contact.formModalSubmitLabel),
      formModalPrivacyLabel: toLs(contact?.formModalPrivacyLabel, en.contact.formModalPrivacyLabel),
      formModalSuccessMessage: toLs(
        contact?.formModalSuccessMessage,
        en.contact.formModalSuccessMessage
      ),
      iframeTitle: toLs(contact?.iframeTitle, en.contact.iframeTitle)
    },
    footer: {
      ...footer,
      copyrightTemplate: toLt(footer?.copyrightTemplate, en.footer.copyrightTemplate)
    }
  };

  await client.createOrReplace({ ...patched, _id: DOC_ID, _type: 'sitePortfolio' });
  console.log('OK: textos ES conservados, campos EN listos en Studio, cvHref=/api/cv');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
