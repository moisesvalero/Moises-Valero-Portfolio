import type { SiteLocale } from '$lib/i18n/site-locale';

/** Etiquetas compartidas en páginas de proyecto (case study + estáticas). */
export function getProyectoPageLabels(locale: SiteLocale) {
  if (locale === 'en') {
    return {
      elReto: 'The challenge',
      loQueHice: 'What I did',
      resultado: 'Outcome',
      stackTech: 'Tech stack',
      verProyectoVivo: 'View live project',
      volver: '← Back',
      volverPortfolio: '← Back to portfolio',
      caseStudySuffix: 'Case study'
    };
  }
  return {
    elReto: 'El reto',
    loQueHice: 'Lo que hice',
    resultado: 'Resultado',
    stackTech: 'Stack tecnológico',
    verProyectoVivo: 'Ver proyecto en vivo',
    volver: '← Volver',
    volverPortfolio: '← Volver al portfolio',
    caseStudySuffix: 'Caso de Estudio'
  };
}
