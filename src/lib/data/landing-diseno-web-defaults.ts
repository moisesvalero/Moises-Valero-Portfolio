import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';
import { landingAlcoyDefaults } from './landing-alcoy-defaults';

export const landingDisenoWebDefaults: LandingDisenoWebAlcoy = {
  ...landingAlcoyDefaults,
  seo: {
    ...landingAlcoyDefaults.seo,
    title: 'Diseno web profesional para captar clientes | Moises Valero',
    description:
      'Servicio de diseno web orientado a conversion, velocidad y SEO. Desarrollo web profesional con enfoque en negocio, rendimiento y soporte real.',
    ogTitle: 'Diseno web profesional para empresas y profesionales',
    ogDescription:
      'Landings y webs corporativas con enfoque comercial, SEO y mantenimiento continuo para crecer a nivel nacional.',
    canonicalPath: '/diseno-web'
  },
  hero: {
    ...landingAlcoyDefaults.hero,
    badge: 'Diseno web profesional en toda Espana',
    title: 'Diseno web profesional'
  },
  services: {
    ...landingAlcoyDefaults.services,
    heading: 'Servicios de diseno web'
  },
  benefits: {
    ...landingAlcoyDefaults.benefits,
    heading: 'Diseno webs que impulsan negocios'
  },
  finalCta: {
    ...landingAlcoyDefaults.finalCta,
    heading: 'Hablamos de tu proyecto web'
  }
};
