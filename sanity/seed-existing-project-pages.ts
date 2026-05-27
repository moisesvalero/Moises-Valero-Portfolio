import { getCliClient } from 'sanity/cli';
import { getChatbotPageCopy } from '../src/lib/i18n/proyectos/chatbot-copy';
import { getEmberPageCopy } from '../src/lib/i18n/proyectos/ember-copy';
import { getGaleriaNovaPageCopy } from '../src/lib/i18n/proyectos/galeria-nova-copy';
import { getVshieldPageCopy } from '../src/lib/i18n/proyectos/vshield-copy';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const v = getVshieldPageCopy('es');
	const e = getEmberPageCopy('es');
	const g = getGaleriaNovaPageCopy('es');
	const c = getChatbotPageCopy('es');

	const docs = [
		{
			_id: 'caseStudy.vshield',
			_type: 'caseStudy',
			estadoInterno: 'listo',
			showOnHome: true,
			homeSortOrder: 30,
			title: v.heroTitle,
			slug: { _type: 'slug', current: 'vshield' },
			seoDescription: v.headDescription,
			heroTag: v.heroTag,
			heroDescription: v.heroSub,
			tags: ['WordPress', 'Elementor', 'JavaScript', 'Formspree', 'Yoast SEO'],
			images: {
				principal: '/imagenes/captura-vshieldfinal_ember-scaled.avif',
				secondary1: '/imagenes/terminalfinal.jpeg',
				secondary2: '/imagenes/formulario-vshield.jpeg'
			},
			metrics: [
				metric(v.stat1Num, v.stat1Label, 0),
				metric(v.stat2Num, v.stat2Label, 1),
				metric(v.stat3Num, v.stat3Label, 2),
				metric(v.stat4Num, v.stat4Label, 3)
			],
			reto: { title: v.retoTitle, bodyHtml: `<p>${v.retoP}</p>` },
			hice: {
				title: v.hiceTitle,
				bodyHtml: `<p>${v.hiceP1}</p>${v.hiceHighlightHtml}<p>${v.hiceP2}</p>`
			},
			resultado: { title: v.resultadoTitle, bodyHtml: `<p>${v.resultadoP}</p>` },
			stack: [
				'WordPress',
				'Astra',
				'Elementor',
				'JavaScript',
				'Formspree',
				'SVG Icons',
				'Autoptimize',
				'Yoast SEO'
			],
			liveUrl: 'https://moisesvalero.es/v-shield/',
			checklistPublicacion: {
				tituloYSlug: true,
				contenidoPrincipal: true,
				imagenesCargadas: true,
				seoCompletado: true
			}
		},
		{
			_id: 'caseStudy.ember-iron',
			_type: 'caseStudy',
			estadoInterno: 'listo',
			showOnHome: true,
			homeSortOrder: 20,
			title: e.heroTitle,
			slug: { _type: 'slug', current: 'ember-iron' },
			seoDescription: e.headDescription,
			heroTag: e.heroTag,
			heroDescription: e.heroSub,
			tags: ['WordPress', 'Kadence', 'Figma', 'AVIF', 'Performance'],
			images: {
				principal: '/imagenes/captura-final-ember_ember-scaled.avif',
				secondary1: '/imagenes/captura-carta.jpeg',
				secondary2: '/imagenes/ember-captura-vino.jpeg'
			},
			metrics: [
				metric(e.stat1Num, e.stat1Label, 0),
				metric(e.stat2Num, e.stat2Label, 1),
				metric(e.stat3Num, e.stat3Label, 2),
				metric(e.stat4Num, e.stat4Label, 3)
			],
			reto: { title: e.retoTitle, bodyHtml: `<p>${e.retoP}</p>` },
			hice: {
				title: e.hiceTitle,
				bodyHtml: `${e.hiceHighlightHtml}<p>${e.hiceP1}</p><p>${e.hiceP2}</p>`
			},
			resultado: { title: e.resultadoTitle, bodyHtml: `<p>${e.resultadoP}</p>` },
			stack: ['WordPress', 'Kadence', 'Child Theme', 'Figma', 'Handbrake', 'XnConvert', 'AVIF'],
			liveUrl: 'https://moisesvalero.es/ember',
			checklistPublicacion: {
				tituloYSlug: true,
				contenidoPrincipal: true,
				imagenesCargadas: true,
				seoCompletado: true
			}
		},
		{
			_id: 'caseStudy.galeria-nova',
			_type: 'caseStudy',
			estadoInterno: 'listo',
			showOnHome: true,
			homeSortOrder: 10,
			title: g.heroTitle,
			slug: { _type: 'slug', current: 'galeria-nova' },
			seoDescription: g.headDescription,
			heroTag: g.heroTag,
			heroDescription: g.heroSub,
			tags: ['WordPress', 'Kadence', 'WooCommerce', 'Cloudflare', 'WebP'],
			images: {
				principal: '/imagenes/novafinal_ember-scaled.avif',
				secondary1: '/imagenes/captura-carrito-nova.jpeg',
				secondary2: '/imagenes/captura-producto-nova.jpeg'
			},
			metrics: [
				metric(g.stat1Num, g.stat1Label, 0),
				metric(g.stat2Num, g.stat2Label, 1),
				metric(g.stat3Num, g.stat3Label, 2),
				metric(g.stat4Num, g.stat4Label, 3)
			],
			reto: { title: g.retoTitle, bodyHtml: `<p>${g.retoP}</p>` },
			hice: {
				title: g.hiceTitle,
				bodyHtml: `<p>${g.hiceP1}</p><p>${g.hiceP2}</p><p>${g.hiceP3}</p>`
			},
			resultado: { title: g.resultadoTitle, bodyHtml: `<p>${g.resultadoP}</p>` },
			stack: [
				'WordPress',
				'Kadence',
				'WooCommerce',
				'PayPal',
				'Cloudflare',
				'Autoptimize',
				'EWWW Image',
				'Yoast SEO'
			],
			liveUrl: 'https://galerianova.es',
			checklistPublicacion: {
				tituloYSlug: true,
				contenidoPrincipal: true,
				imagenesCargadas: true,
				seoCompletado: true
			}
		},
		{
			_id: 'caseStudy.chatbot',
			_type: 'caseStudy',
			estadoInterno: 'listo',
			showOnHome: true,
			homeSortOrder: 40,
			title: 'Chatbot IA Portfolio',
			slug: { _type: 'slug', current: 'chatbot' },
			seoDescription: c.headDescription,
			heroTag: c.heroTag,
			heroDescription: c.heroSub,
			tags: ['Typebot', 'Groq API', 'Llama 3.3', 'Make.com', 'Telegram'],
			images: {
				principal: '/imagenes/captura-portfolio_ember-scaled.avif',
				secondary1: '/imagenes/captura-portfolio_ember-scaled.avif',
				secondary2: '/imagenes/captura-portfolio_ember-scaled.avif'
			},
			metrics: [
				metric(c.stat1Num, c.stat1Label, 0),
				metric(c.stat2Num, c.stat2Label, 1),
				metric(c.stat3Num, c.stat3Label, 2),
				metric('📱', c.stat4Label, 3)
			],
			reto: { title: c.retoTitle, bodyHtml: `<p>${c.retoP}</p>` },
			hice: { title: c.hiceTitle, bodyHtml: `<p>${c.hiceP1}</p>${c.hiceHighlightHtml}` },
			resultado: { title: c.ctaTitle, bodyHtml: `<p>${c.ctaLead}</p>` },
			stack: ['Typebot', 'Groq API', 'Llama 3.3', 'Make.com', 'Webhook', 'Telegram Bot'],
			liveUrl: 'https://moisesvalero.es/#contacto',
			checklistPublicacion: {
				tituloYSlug: true,
				contenidoPrincipal: true,
				imagenesCargadas: true,
				seoCompletado: true
			}
		}
	];

	for (const doc of docs) {
		await client.createOrReplace(doc);
	}

	console.log(`Proyectos cargados/actualizados en Sanity: ${docs.length}`);
}

main().catch((error) => {
	console.error('Error cargando proyectos existentes en Sanity:', error);
	process.exit(1);
});
