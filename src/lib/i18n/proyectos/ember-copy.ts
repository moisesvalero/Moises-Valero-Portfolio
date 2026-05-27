import type { SiteLocale } from '$lib/i18n/site-locale';

export type EmberPageCopy = {
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
	hiceHighlightHtml: string;
	workflowSteps: string[];
	hiceP1: string;
	hiceP2: string;
	imgMenuAlt: string;
	imgWineAlt: string;
	resultadoTitle: string;
	resultadoP: string;
	ctaTitle: string;
	ctaLead: string;
	ctaBtn: string;
	ctaBack: string;
};

const es: EmberPageCopy = {
	headTitle: 'Ember & Iron — Caso de Estudio | Moisés Valero',
	headDescription:
		'Web corporativa para asador premium: vídeo de fondo optimizado, flujo Figma → WordPress, Kadence, AVIF y PageSpeed 80+ en móvil.',
	heroTag: 'Proyecto de Portfolio · Web Corporativa',
	heroTitle: 'Ember & Iron',
	heroSub:
		'Web de alto impacto visual para restaurante asador premium, con vídeo de fondo optimizado y flujo profesional Figma → desarrollo.',
	imgMainAlt: 'Ember & Iron — vista principal',
	stat1Num: '80+',
	stat1Label: 'PageSpeed móvil',
	stat2Num: 'AVIF',
	stat2Label: 'Formato imágenes',
	stat3Num: 'Figma',
	stat3Label: 'Diseño previo',
	stat4Num: '0',
	stat4Label: 'Plugins de formulario',
	retoTitle: 'Impacto visual sin sacrificar rendimiento',
	retoP:
		'Desarrollar una web de alto impacto visual para un asador de carne premium ficticio, priorizando la experiencia inmersiva y la conversión, sin sacrificar el rendimiento pese al uso intensivo de vídeo e imágenes.',
	hiceTitle: 'Primer proyecto con flujo profesional Figma → WordPress',
	hiceHighlightHtml:
		'<p><strong>Flujo de trabajo aplicado:</strong> Primer proyecto donde diseñé la maqueta completa en Figma antes de abrir WordPress — aplicando un proceso profesional real de diseño previo al desarrollo.</p>',
	workflowSteps: ['🎨 Figma', '⚙️ WordPress + Kadence', '🎬 Optimización medios', '🚀 Producción'],
	hiceP1:
		'Desarrollé la web con WordPress + Kadence con tema hijo, construyendo la mayor parte con widgets HTML personalizados generados y depurados con Cursor Agent e IA.',
	hiceP2:
		'Optimización de medios fuera de WordPress: vídeos procesados con Handbrake e imágenes convertidas a AVIF con XnConvert. Animaciones CSS con Blocks Animation. Formulario sin plugins integrado con Formspree. Copias de seguridad con WP Vivid Backup.',
	imgMenuAlt: 'Carta del restaurante',
	imgWineAlt: 'Sección vinos',
	resultadoTitle: 'Experiencia premium con medios optimizados',
	resultadoP:
		'Web con vídeo de fondo optimizado manteniendo más de 80 puntos en PageSpeed móvil — un resultado sólido considerando el uso intensivo de vídeo e imágenes de alta calidad. Flujo completo Figma → desarrollo aplicado por primera vez.',
	ctaTitle: '¿Quieres ver el proyecto en vivo?',
	ctaLead: 'Visita la web completa o contáctame para hablar sobre tu proyecto.',
	ctaBtn: 'Ver proyecto en vivo',
	ctaBack: '← Volver'
};

const en: EmberPageCopy = {
	headTitle: 'Ember & Iron — Case study | Moisés Valero',
	headDescription:
		'Premium steakhouse site: optimised background video, Figma → WordPress workflow, Kadence, AVIF, and 80+ mobile PageSpeed.',
	heroTag: 'Portfolio project · Corporate site',
	heroTitle: 'Ember & Iron',
	heroSub:
		'High-impact site for a premium steakhouse brand with optimised background video and a professional Figma → build workflow.',
	imgMainAlt: 'Ember & Iron — main view',
	stat1Num: '80+',
	stat1Label: 'Mobile PageSpeed',
	stat2Num: 'AVIF',
	stat2Label: 'Image format',
	stat3Num: 'Figma',
	stat3Label: 'Upfront design',
	stat4Num: '0',
	stat4Label: 'Form plugins',
	retoTitle: 'Visual impact without sacrificing performance',
	retoP:
		'Deliver a visually rich site for a fictional premium steakhouse focused on immersion and conversion, while keeping performance strong despite heavy video and imagery.',
	hiceTitle: 'First project with a full Figma → WordPress workflow',
	hiceHighlightHtml:
		'<p><strong>Workflow:</strong> The first project where I designed the full layout in Figma before touching WordPress — a real design-first handoff to development.</p>',
	workflowSteps: ['🎨 Figma', '⚙️ WordPress + Kadence', '🎬 Media optimisation', '🚀 Production'],
	hiceP1:
		'Built with WordPress + Kadence and a child theme, mostly custom HTML widgets refined with Cursor Agent and AI.',
	hiceP2:
		'Media tuned outside WordPress: video with Handbrake, images to AVIF with XnConvert. CSS motion with Blocks Animation. Plugin-free form with Formspree. Backups with WP Vivid Backup.',
	imgMenuAlt: 'Restaurant menu section',
	imgWineAlt: 'Wine section',
	resultadoTitle: 'Premium feel with optimised media',
	resultadoP:
		'Background video with 80+ mobile PageSpeed — a solid result given rich media. Full Figma → development workflow applied for the first time.',
	ctaTitle: 'Want to see it live?',
	ctaLead: 'Open the full site or contact me about your project.',
	ctaBtn: 'View live project',
	ctaBack: '← Back'
};

export function getEmberPageCopy(locale: SiteLocale): EmberPageCopy {
	return locale === 'en' ? en : es;
}
