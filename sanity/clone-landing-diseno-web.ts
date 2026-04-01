/**
 * Clona el contenido actual de `landingDisenoWebAlcoy` al documento
 * `landingDisenoWeb` para editarlo como landing nacional en Sanity.
 *
 * Ejecutar desde la raiz:
 *   npx sanity exec sanity/clone-landing-diseno-web.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { landingDisenoWebDefaults } from '../src/lib/data/landing-diseno-web-defaults';

type GenericDoc = Record<string, unknown>;

function cleanSystemFields<T extends GenericDoc>(doc: T): T {
  const clone = { ...doc };
  delete clone._rev;
  delete clone._createdAt;
  delete clone._updatedAt;
  return clone as T;
}

function buildFromDefaults(): GenericDoc {
  const { marquee, ...heroCore } = landingDisenoWebDefaults.hero;
  return {
    _id: 'landingDisenoWeb',
    _type: 'landingDisenoWebAlcoy',
    internalTitle: 'Landing Diseno web (nacional)',
    sectionOrder: landingDisenoWebDefaults.sectionOrder,
    seo: {
      title: landingDisenoWebDefaults.seo.title,
      description: landingDisenoWebDefaults.seo.description,
      ogTitle: landingDisenoWebDefaults.seo.ogTitle,
      ogDescription: landingDisenoWebDefaults.seo.ogDescription,
      ogImagePath: landingDisenoWebDefaults.seo.ogImage,
      canonicalPath: '/diseno-web',
      twitterCard: landingDisenoWebDefaults.seo.twitterCard
    },
    hero: {
      ...heroCore,
      heroMarquee: {
        kicker: marquee.kicker,
        items: []
      }
    },
    services: landingDisenoWebDefaults.services,
    maintenance: landingDisenoWebDefaults.maintenance,
    benefits: landingDisenoWebDefaults.benefits,
    faq: landingDisenoWebDefaults.faq,
    finalCta: landingDisenoWebDefaults.finalCta,
    analyzerModal: landingDisenoWebDefaults.analyzerModal,
    contactModal: landingDisenoWebDefaults.contactModal,
    localBusiness: landingDisenoWebDefaults.localBusiness
  };
}

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });
  const source = await client.fetch<GenericDoc | null>(
    `*[_type == "landingDisenoWebAlcoy" && _id == "landingDisenoWebAlcoy"][0]`
  );

  const destination = source
    ? {
        ...cleanSystemFields(source),
        _id: 'landingDisenoWeb',
        _type: 'landingDisenoWebAlcoy',
        internalTitle: 'Landing Diseno web (nacional)',
        seo: {
          ...(typeof source.seo === 'object' && source.seo ? (source.seo as GenericDoc) : {}),
          canonicalPath: '/diseno-web'
        }
      }
    : buildFromDefaults();

  await client.createOrReplace(destination);

  console.log(
    source
      ? 'OK: landingDisenoWeb creada a partir de landingDisenoWebAlcoy.'
      : 'OK: no existia landingDisenoWebAlcoy; se creo landingDisenoWeb con defaults nacionales.'
  );
}

main().catch((error) => {
  console.error('Error clonando landingDisenoWeb:', error);
  process.exit(1);
});
