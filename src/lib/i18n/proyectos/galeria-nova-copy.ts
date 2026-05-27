import type { SiteLocale } from '$lib/i18n/site-locale';

export type GaleriaNovaPageCopy = {
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
	hiceP2: string;
	hiceP3: string;
	imgCartAlt: string;
	imgProductAlt: string;
	resultadoTitle: string;
	resultadoP: string;
	ctaTitle: string;
	ctaLead: string;
	ctaBtn: string;
	ctaBack: string;
};

const es: GaleriaNovaPageCopy = {
	headTitle: 'Galería Nova — Caso de Estudio | Moisés Valero',
	headDescription:
		'E-commerce de arte digital con IA, WordPress, Kadence, WooCommerce y rendimiento optimizado (WebP, Cloudflare).',
	heroTag: 'Proyecto de Portfolio · E-commerce',
	heroTitle: 'Galería Nova',
	heroSub:
		'E-commerce de arte digital generado con IA, optimizado para impresión en alta resolución.',
	imgMainAlt: 'Galería Nova — vista principal',
	stat1Num: '90+',
	stat1Label: 'PageSpeed móvil',
	stat2Num: 'WebP',
	stat2Label: 'Formato imágenes',
	stat3Num: '4-5',
	stat3Label: 'Días de desarrollo',
	stat4Num: 'SVG',
	stat4Label: 'Logo escalable',
	retoTitle: 'Una tienda para arte que nace digital',
	retoP:
		'Diseñar y desarrollar una tienda online para la venta de arte digital generado con IA, con imágenes preparadas para impresión en alta resolución y una experiencia de compra rápida y segura.',
	hiceTitle: 'Desarrollo completo con foco en rendimiento',
	hiceP1:
		'Desarrollé el proyecto completo con WordPress + Kadence, implementando personalizaciones visuales extensas mediante HTML y CSS escrito con apoyo de Cursor Agent, Gemini y Claude. Generé todos los activos visuales con Leonardo.ai en alta resolución optimizada para impresión física, y creé el logotipo en formato SVG para máxima escalabilidad.',
	hiceP2:
		'Configuré WooCommerce con pasarela PayPal, gestioné el SEO on-page con Yoast, y apliqué una capa de seguridad ocultando el acceso al panel con WPS Hide Login.',
	hiceP3:
		'Para rendimiento: imágenes convertidas a WebP con EWWW, optimización de assets con Autoptimize y CDN global mediante Cloudflare.',
	imgCartAlt: 'Carrito de compra',
	imgProductAlt: 'Página de producto',
	resultadoTitle: 'Tienda funcional con rendimiento optimizado',
	resultadoP:
		'Puntuación PageSpeed superior a 90 en móvil. Tienda completamente funcional con catálogo de obras, carrito de compra y pasarela de pago operativos. CDN global activo mediante Cloudflare para carga rápida desde cualquier ubicación.',
	ctaTitle: '¿Quieres ver el proyecto en vivo?',
	ctaLead: 'Visita la tienda completa o contáctame para hablar sobre tu proyecto.',
	ctaBtn: 'Ver proyecto en vivo',
	ctaBack: '← Volver'
};

const en: GaleriaNovaPageCopy = {
	headTitle: 'Galería Nova — Case study | Moisés Valero',
	headDescription:
		'AI-generated digital art e-commerce with WordPress, Kadence, WooCommerce, and tuned performance (WebP, Cloudflare).',
	heroTag: 'Portfolio project · E-commerce',
	heroTitle: 'Galería Nova',
	heroSub: 'Digital art store powered by AI-generated work, tuned for high-resolution print.',
	imgMainAlt: 'Galería Nova — main view',
	stat1Num: '90+',
	stat1Label: 'Mobile PageSpeed',
	stat2Num: 'WebP',
	stat2Label: 'Image format',
	stat3Num: '4–5',
	stat3Label: 'Build days',
	stat4Num: 'SVG',
	stat4Label: 'Scalable logo',
	retoTitle: 'A store for art born digital',
	retoP:
		'Design and build an online shop for AI-generated digital art, with print-ready high-resolution assets and a fast, secure checkout.',
	hiceTitle: 'End-to-end build with performance in mind',
	hiceP1:
		'I delivered the full build on WordPress + Kadence with deep visual customisation via HTML/CSS supported by Cursor Agent, Gemini, and Claude. Visual assets came from Leonardo.ai at print-friendly resolution, with an SVG logo for crisp scaling.',
	hiceP2:
		'WooCommerce with PayPal, on-page SEO with Yoast, and WPS Hide Login to harden wp-admin exposure.',
	hiceP3: 'Performance: WebP via EWWW, Autoptimize for assets, and global CDN on Cloudflare.',
	imgCartAlt: 'Shopping cart',
	imgProductAlt: 'Product page',
	resultadoTitle: 'Live store with strong performance',
	resultadoP:
		'90+ mobile PageSpeed. Fully working catalogue, cart, and payment flow. Cloudflare CDN for fast loads worldwide.',
	ctaTitle: 'Want to see it live?',
	ctaLead: 'Browse the full store or reach out about your project.',
	ctaBtn: 'View live project',
	ctaBack: '← Back'
};

export function getGaleriaNovaPageCopy(locale: SiteLocale): GaleriaNovaPageCopy {
	return locale === 'en' ? en : es;
}
