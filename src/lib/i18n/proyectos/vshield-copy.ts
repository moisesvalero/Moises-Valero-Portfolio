import type { SiteLocale } from '$lib/i18n/site-locale';

export type VshieldPageCopy = {
  headTitle: string;
  headDescription: string;
  heroTag: string;
  heroTitle: string;
  heroSub: string;
  imgMainAlt: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
  stat4Num: string;
  stat4Label: string;
  retoTitle: string;
  retoP: string;
  hiceTitle: string;
  hiceP1: string;
  hiceHighlightHtml: string;
  hiceP2: string;
  imgTerminalAlt: string;
  imgFormAlt: string;
  resultadoTitle: string;
  resultadoP: string;
  ctaTitle: string;
  ctaLead: string;
  ctaBtn: string;
  ctaBack: string;
};

const es: VshieldPageCopy = {
  headTitle: 'V-Shield — Caso de Estudio | Moisés Valero',
  headDescription:
    'Landing de ciberseguridad con terminal interactiva en JavaScript, WordPress, Elementor y alto PageSpeed en móvil.',
  heroTag: 'Proyecto de Portfolio · Landing Page',
  heroTitle: 'V-Shield',
  heroSub:
    'Landing page de alto impacto para empresa de ciberseguridad, con terminal interactiva funcional desarrollada en JavaScript.',
  imgMainAlt: 'Captura principal de V-Shield',
  stat1Num: '~100',
  stat1Label: 'PageSpeed móvil',
  stat2Num: 'JS',
  stat2Label: 'Terminal funcional',
  stat3Num: '0',
  stat3Label: 'Plugins de formulario',
  stat4Num: 'SVG',
  stat4Label: 'Todos los iconos',
  retoTitle: 'Credibilidad técnica desde el primer segundo',
  retoP:
    'Crear una landing page de alto impacto para una empresa de ciberseguridad ficticia, transmitiendo credibilidad técnica y profesionalidad mediante una experiencia visual inmersiva y elementos interactivos reales.',
  hiceTitle: 'WordPress + Elementor llevado al límite',
  hiceP1:
    'Desarrollé la web con WordPress + Astra + Elementor, construyendo prácticamente toda la página con widgets HTML personalizados y código CSS/JS generado y depurado con apoyo de IA.',
  hiceHighlightHtml:
    '<p><strong>Elemento destacado:</strong> Terminal interactiva completamente funcional desarrollada en JavaScript puro, que simula comandos reales y refuerza la identidad técnica de la marca.</p>',
  hiceP2:
    'El formulario de contacto está desarrollado íntegramente con código propio sin plugins, integrado con Formspree.io. Todos los iconos en SVG para máximo rendimiento. SEO on-page con Yoast, optimización con Autoptimize y seguridad con WPS Hide Login.',
  imgTerminalAlt: 'Terminal interactiva',
  imgFormAlt: 'Formulario de contacto',
  resultadoTitle: 'El mejor rendimiento del portfolio',
  resultadoP:
    'Puntuación PageSpeed cercana a 100 en móvil — el mejor resultado de todos los proyectos. Landing funcional con terminal operativa, formulario sin plugins y carga ultrarrápida.',
  ctaTitle: '¿Quieres ver el proyecto en vivo?',
  ctaLead: 'Visita la landing completa o contáctame para hablar sobre tu proyecto.',
  ctaBtn: 'Ver proyecto en vivo',
  ctaBack: '← Volver'
};

const en: VshieldPageCopy = {
  headTitle: 'V-Shield — Case study | Moisés Valero',
  headDescription:
    'Cybersecurity landing with an interactive JavaScript terminal, WordPress, Elementor, and strong mobile PageSpeed.',
  heroTag: 'Portfolio project · Landing page',
  heroTitle: 'V-Shield',
  heroSub:
    'High-impact landing for a cybersecurity brand with a fully functional interactive terminal built in JavaScript.',
  imgMainAlt: 'V-Shield main screenshot',
  stat1Num: '~100',
  stat1Label: 'Mobile PageSpeed',
  stat2Num: 'JS',
  stat2Label: 'Working terminal',
  stat3Num: '0',
  stat3Label: 'Form plugins',
  stat4Num: 'SVG',
  stat4Label: 'All icons',
  retoTitle: 'Technical credibility from second one',
  retoP:
    'Build a high-impact landing for a fictional cybersecurity company, conveying technical trust through immersive visuals and real interactive elements.',
  hiceTitle: 'WordPress + Elementor pushed hard',
  hiceP1:
    'I built the site on WordPress + Astra + Elementor, using custom HTML widgets and CSS/JS refined with AI assistance for most of the page.',
  hiceHighlightHtml:
    '<p><strong>Highlight:</strong> A fully interactive terminal in vanilla JavaScript that simulates real commands and reinforces the brand’s technical identity.</p>',
  hiceP2:
    'The contact form is custom code without plugins, wired to Formspree.io. Icons are SVG for performance. On-page SEO with Yoast, Autoptimize for assets, and WPS Hide Login for hardening.',
  imgTerminalAlt: 'Interactive terminal',
  imgFormAlt: 'Contact form',
  resultadoTitle: 'Best performance in the portfolio',
  resultadoP:
    'Near-100 mobile PageSpeed — the strongest score across projects. A working terminal, plugin-free form, and very fast load.',
  ctaTitle: 'Want to see it live?',
  ctaLead: 'Open the full landing or get in touch to talk about your project.',
  ctaBtn: 'View live project',
  ctaBack: '← Back'
};

export function getVshieldPageCopy(locale: SiteLocale): VshieldPageCopy {
  return locale === 'en' ? en : es;
}
