/**
 * Seed para el Case Study: Android Home Server
 * Repositorio: https://github.com/moisesvalero/android-home-server
 */

import { getCliClient } from 'sanity/cli';
import { createClient } from '@sanity/client';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

function getClient() {
	const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN;
	if (token) {
		return createClient({
			projectId: process.env.SANITY_PROJECT_ID || '5zhz6irf',
			dataset: process.env.SANITY_DATASET || 'production',
			token,
			useCdn: false,
			apiVersion: '2025-01-01'
		});
	}
	return getCliClient({ apiVersion: '2025-01-01' });
}

async function main() {
	const client = getClient();

	const doc = {
		_id: 'caseStudy.android-home-server',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 16,
		homeLayoutTier: 'standard',
		homeEyebrow: {
			es: 'Infraestructura · Self-Hosting & IA',
			en: 'Infrastructure · Self-Hosting & AI'
		},
		homeProofLine: {
			es: 'Convierte cualquier smartphone viejo en un servidor doméstico 24/7 con IA autónoma, streaming a tu Smart TV y 0€ de coste mensual.',
			en: 'Turn any spare Android phone into a 24/7 home server with autonomous AI, Smart TV media streaming, and 0€ monthly cost.'
		},
		homeValueTags: ['Linux / Termux', 'Self-Hosting', 'IA autónoma', 'DLNA Streaming', 'Python'],
		homeRole: {
			es: 'Arquitectura de sistemas, bash automation, microservicios y streaming',
			en: 'Systems architecture, bash automation, microservices, and media streaming'
		},
		homeYear: '2026',
		homeComplexity: 'Alta',
		title: 'Android Home Server',
		titleEn: 'Android Home Server',
		slug: { _type: 'slug', current: 'android-home-server' },
		seoDescription:
			'Android Home Server: infraestructura 24/7 en cualquier móvil Android con Termux, Hermes Agent (DeepSeek, OpenAI), servidor multimedia DLNA para Smart TV y crons de automatización sin coste.',
		seoDescriptionEn:
			'Android Home Server: 24/7 home server stack running on any spare Android phone via Termux, Hermes Agent (DeepSeek, OpenAI), DLNA media streaming for Smart TVs, and automated crons with 0€ monthly cost.',
		heroTag: 'Proyecto personal · Infraestructura & Self-Hosting',
		heroTagEn: 'Personal project · Infrastructure & Self-Hosting',
		heroDescription:
			'Infraestructura 24/7 de bajo consumo montada sobre un smartphone Android en desuso. Combina un agente de inteligencia artificial autónomo (Hermes Agent), automatización programada por crons, servidor multimedia DLNA para Smart TV y una suite de seguridad física para la batería.',
		heroDescriptionEn:
			'An ultra-low-power 24/7 home server infrastructure deployed on a repurposed Android smartphone. Integrates an autonomous AI agent (Hermes Agent), scheduled cron automation, DLNA media streaming for Smart TVs, and hardware-level battery safety.',
		tags: [
			'Android',
			'Termux',
			'Python',
			'Node.js',
			'PM2',
			'DLNA',
			'MiniDLNA',
			'Hermes Agent',
			'Telegram API',
			'DeepSeek',
			'Bash'
		],
		tagsEn: [
			'Android',
			'Termux',
			'Python',
			'Node.js',
			'PM2',
			'DLNA',
			'MiniDLNA',
			'Hermes Agent',
			'Telegram API',
			'DeepSeek',
			'Bash'
		],
		images: {
			cardImagePath: '/imagenes/android-home-server-card.png',
			principal: '/imagenes/android-home-server-principal.png',
			secondary1: '/imagenes/android-home-server-secundaria1.png',
			secondary2: '/imagenes/android-home-server-secundaria2.png'
		},
		metrics: [
			metric('6-8 GB', 'RAM física LPDDR4X disponible', 0),
			metric('1-3 W', 'consumo eléctrico ultra-bajo', 1),
			metric('0 €', 'coste mensual (sustituye VPS)', 2),
			metric('24/7', 'uptime con SAI/UPS integrado', 3)
		],
		metricsEn: [
			metric('6-8 GB', 'physical LPDDR4X RAM available', 0),
			metric('1-3 W', 'ultra-low power consumption', 1),
			metric('0 €', 'monthly cost (replaces cloud VPS)', 2),
			metric('24/7', 'uptime with built-in battery UPS', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Las instancias VPS en la nube y las capas gratuitas (como Google Cloud e2-micro) ofrecen apenas 1 GB de RAM, sufren estrangulamiento de CPU y conllevan riesgos de sobrecostes por transferencia. Por otro lado, comprar una Raspberry Pi 4 con accesorios supera los 100 € y carece de respaldo eléctrico ante cortes de luz.</p><p>El desafío consistía en rescatar un smartphone en desuso con hardware potente (Snapdragon ARM64, 6 GB de RAM y almacenamiento flash UFS) y convertirlo en un servidor doméstico desatendido 24/7, garantizando que la batería de litio no sufriera degradación ni hinchazón por estar conectada de forma continua.</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>Cloud VPS instances and free tiers (like Google Cloud e2-micro) offer only 1 GB of RAM, suffer from CPU throttling, and carry unexpected billing risks for outbound bandwidth. Conversely, purchasing a Raspberry Pi 4 with power supplies and storage costs over $100 and lacks power protection against blackouts.</p><p>The challenge was to repurpose an idle smartphone with capable hardware (Snapdragon ARM64, 6 GB RAM, and fast UFS flash storage) into an unattended 24/7 home server, while guaranteeing that the lithium-ion battery would not suffer from thermal degradation or swelling from continuous charging.</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Entorno base en Termux sin root:</strong> Despliegue de Node.js, Python 3 y compiladores nativos en espacio de usuario. Configuración de PM2 para gestión de procesos 24/7 con persistencia ante reinicios mediante Termux:Boot y hardening estricto de SSH en puerto 8022 restringido a la red local.</p><p><strong>Agente de IA y Crons (Hermes):</strong> Integración de Hermes Agent conectado a Telegram por polling saliente (sin abrir puertos en el router) con soporte multi-LLM (DeepSeek, OpenAI, Groq). Creación de crons independientes para búsqueda de empleo deduplicada con memoria (<code>seen_jobs.json</code>), radar de chollos tecnológicos y megafonía física TTS por los altavoces del móvil.</p><p><strong>Servidor multimedia y Botón Mágico:</strong> Configuración de MiniDLNA (streaming a Smart TV a 0% CPU y ~17 MB RAM) y dashboard web en puerto 8090 con telemetría en tiempo real y subidas Drag & Drop. Creación de un micro-asistente en ordenador de trabajo para transcodificar vídeos antiguos incompatibles por hardware en 1 clic antes de enviarlos al móvil.</p><p><strong>Estrategia del 50% para la batería:</strong> Ciclo de carga intermitente mediante enchufe temporizador mecánico (30 min dos veces al día) para mantener el litio a ~3.8V, respaldado por un script watchdog en Python que vigila temperatura (≥45°C) y nivel de batería (<25%).</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Rootless Termux base environment:</strong> Deployed Node.js, Python 3, and native compilers in user space. Configured PM2 for 24/7 process supervision with persistent reboot recovery via Termux:Boot, along with strict SSH hardening on port 8022 restricted to the local network.</p><p><strong>AI Agent and Scheduled Crons (Hermes):</strong> Integrated Hermes Agent connected to Telegram via outbound long-polling (no open router ports required) with multi-LLM support (DeepSeek, OpenAI, Groq). Built standalone crons for deduplicated job searching with persistent URL memory (<code>seen_jobs.json</code>), tech deals monitoring, and physical TTS intercom via the phone speakers.</p><p><strong>Media Server & The Magic Button:</strong> Deployed MiniDLNA (streaming to Smart TVs at 0% CPU and ~17 MB RAM) and a web dashboard on port 8090 with live telemetry and Drag & Drop chunked uploads. Built a companion Mac/PC helper to convert legacy incompatible video formats via hardware ffmpeg in 1 click before pushing to the phone.</p><p><strong>The 50% Battery Health Strategy:</strong> Intermittent charging cycle using a mechanical plug timer (30 mins twice daily) to keep lithium at its optimal ~3.8V resting voltage, backed by a Python watchdog alerting on low battery (<25%) and thermal spikes (≥45°C).</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Un servidor doméstico robusto, inaudible y de consumo despreciable (1-3W) que sustituye por completo una VPS de pago. La batería del propio teléfono actúa como un SAI natural, manteniendo el sistema activo durante cortes de luz sin perder datos.</p><p>El proyecto ha sido modularizado y publicado en código abierto bajo licencia MIT en GitHub (<a href="https://github.com/moisesvalero/android-home-server" target="_blank" rel="noopener noreferrer">android-home-server</a>) para que cualquier desarrollador pueda replicarlo en cualquier smartphone Android.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A robust, silent, and ultra-low-power (1-3W) home server stack that completely replaces paid cloud VPS instances. The phone's internal battery acts as a built-in UPS, maintaining uptime during power outages with zero data corruption.</p><p>The project was modularized and open-sourced under the MIT license on GitHub (<a href="https://github.com/moisesvalero/android-home-server" target="_blank" rel="noopener noreferrer">android-home-server</a>) so any developer can replicate the setup on any spare Android phone.</p>`
		},
		stack: [
			'Android',
			'Termux',
			'Python',
			'Node.js',
			'PM2',
			'MiniDLNA',
			'Hermes Agent',
			'Telegram Bot API',
			'DeepSeek',
			'OpenAI',
			'Bash'
		],
		stackEn: [
			'Android',
			'Termux',
			'Python',
			'Node.js',
			'PM2',
			'MiniDLNA',
			'Hermes Agent',
			'Telegram Bot API',
			'DeepSeek',
			'OpenAI',
			'Bash'
		],
		liveUrl: 'https://moisesvalero.es/blog/servidor-domestico-movil-viejo',
		repoUrl: 'https://github.com/moisesvalero/android-home-server',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	console.log('Cargando case study "Android Home Server" en Sanity...');
	await client.createOrReplace(doc);
	console.log('✅ Case study android-home-server cargado con éxito en Sanity.');
}

main().catch((error) => {
	console.error('❌ Error cargando android-home-server en Sanity:', error);
	process.exit(1);
});
