import { getCliClient } from 'sanity/cli';

function metric(value: string, label: string, idx: number) {
	return { _key: `metric-${idx + 1}`, value, label };
}

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: 'caseStudy.supportai-usb',
		_type: 'caseStudy',
		estadoInterno: 'listo',
		showOnHome: false,
		homeSortOrder: 99,
		homeLayoutTier: 'standard',
		homeEyebrow: {
			es: 'Diagnóstico portátil Windows · Asistente IA',
			en: 'Portable Windows Diagnostics · AI Assistant'
		},
		homeProofLine: {
			es: 'Asistente de diagnóstico y reparación automatizada para Windows en pendrives IT con .NET 10, WPF e IA local/nube.',
			en: 'Automated diagnostic and repair assistant for Windows on IT flash drives built with .NET 10, WPF, and local/cloud AI.'
		},
		homeValueTags: ['.NET 10', 'C#', 'WPF', 'Windows', 'IA', 'PowerShell', 'CLI'],
		homeRole: {
			es: 'Arquitectura .NET, interfaz WPF, motor de IA y herramientas de reparación',
			en: '.NET Architecture, WPF UI, AI engine, and repair tools'
		},
		homeYear: '2026',
		homeComplexity: 'Alta',
		title: 'SupportAI USB',
		titleEn: 'SupportAI USB',
		slug: { _type: 'slug', current: 'supportai-usb' },
		seoDescription:
			'SupportAI USB: asistente portátil de diagnóstico y reparación de Windows impulsado por IA local/nube. Construido en .NET 10, WPF y CLI con filtro de privacidad.',
		seoDescriptionEn:
			'SupportAI USB: portable Windows diagnostic and repair assistant powered by local/cloud AI. Built with .NET 10, WPF, and CLI featuring privacy redaction.',
		heroTag: 'Proyecto personal · Software de Diagnóstico e IA',
		heroTagEn: 'Personal project · Diagnostic & AI Software',
		heroDescription:
			'Herramienta de diagnóstico portátil y reparación de sistemas Windows lista para llevar en un pendrive IT. Combina telemetría ultrarrápida, asistente de IA con filtro de privacidad y 9 reparaciones del sistema ejecutables con un clic.',
		heroDescriptionEn:
			'Portable diagnostic and repair tool for Windows systems designed for IT flash drives. Combines ultra-fast telemetry, AI assistant with privacy filter, and 9 one-click system repair actions.',
		tags: [
			'.NET 10',
			'C# 12',
			'WPF',
			'CLI',
			'Gemini API',
			'OpenRouter',
			'PowerShell',
			'Windows API'
		],
		tagsEn: [
			'.NET 10',
			'C# 12',
			'WPF',
			'CLI',
			'Gemini API',
			'OpenRouter',
			'PowerShell',
			'Windows API'
		],
		images: {
			cardImagePath: '/imagenes/supportai-usb-card.png',
			principal: '/imagenes/supportai-usb-principal.png',
			secondary1: '/imagenes/supportai-usb-secundaria-1.png',
			secondary2: '/imagenes/supportai-usb-secundaria-2.png'
		},
		metrics: [
			metric('9', 'herramientas de reparación automatizada', 0),
			metric('100%', 'privacidad (redacción automática de PII)', 1),
			metric('2', 'interfaces (WPF Dashboard y CLI headless)', 2),
			metric('0', 'instalación requerida (ejecutable portable)', 3)
		],
		metricsEn: [
			metric('9', 'automated repair tools built-in', 0),
			metric('100%', 'privacy compliance (auto PII redaction)', 1),
			metric('2', 'user interfaces (WPF Dashboard & headless CLI)', 2),
			metric('0', 'installation needed (fully portable app)', 3)
		],
		reto: {
			title: 'El reto',
			bodyHtml: `<p>Los técnicos e ingenieros de soporte informático a menudo se enfrentan a equipos con fallos de red, corrupción de archivos del sistema o lentitud severa. Analizar manualmente los registros de eventos de Windows, verificar el estado de los discos y ejecutar comandos como <code>sfc /scannow</code> o <code>dism</code> requiere tiempo y comandos repetitivos.</p><p>Además, al consultar soluciones con inteligencia artificial en la nube, existe el riesgo de exponer información confidencial del cliente o de la empresa (direcciones IP, nombres de usuario, números de serie o dominios).</p>`
		},
		retoEn: {
			title: 'The challenge',
			bodyHtml: `<p>IT support engineers frequently handle PCs with network failures, system file corruption, or severe performance drops. Manually checking Windows event logs, verifying disk telemetry, and executing commands like <code>sfc /scannow</code> or <code>dism</code> is repetitive and time-consuming.</p><p>Furthermore, using cloud-based AI assistants to analyze diagnostic logs poses a privacy risk of leaking sensitive customer data (IP addresses, usernames, serial numbers, or local domains).</p>`
		},
		hice: {
			title: 'Lo que hice',
			bodyHtml: `<p><strong>Arquitectura portátil en .NET 10:</strong> Desarrollé una aplicación autónoma ejecutable directamente desde una unidad USB sin requerir instalación previa ni dependencias externas en la máquina cliente.</p><p><strong>Motor de Telemetría e IA con filtro de privacidad:</strong> Implementé un recolector ultrarrápido de métricas de CPU, RAM, GPU, estado SMART de discos y registros de eventos. Creé el componente <code>PrivacyFilter</code> que redacta automáticamente datos sensibles (IPs, usuarios, dominios, números de serie) antes de enviar la información al asistente conversacional de IA (vía OpenRouter, Gemini o motor local GGUF).</p><p><strong>Catálogo de reparaciones y doble interfaz:</strong> Diseñé un catálogo de 9 herramientas de reparación automatizadas con elevación UAC (limpieza de temporales, flush DNS, reinicio de Explorer, restablecimiento de Winsock y Spooler, SFC, DISM). Ofrecí dos modos de uso: interfaz gráfica moderna en WPF y una CLI headless para scripts automatizados de mantenimiento IT.</p>`
		},
		hiceEn: {
			title: 'What I built',
			bodyHtml: `<p><strong>Portable .NET 10 Architecture:</strong> Developed a standalone application executable directly from a USB drive without requiring prior installation or external dependencies on the target PC.</p><p><strong>Telemetry & AI Engine with Privacy Filter:</strong> Built a high-speed telemetry collector for CPU, RAM, GPU, SMART disk health, and event logs. Created the <code>PrivacyFilter</code> component to automatically redact sensitive information (IPs, usernames, domains, serials) prior to sending data to the AI assistant (via OpenRouter, Gemini, or local GGUF models).</p><p><strong>Repair Catalog & Dual Interface:</strong> Engineered 9 automated system repair tools with UAC elevation (Temp cleanup, DNS flush, Explorer restart, Winsock & Spooler reset, SFC, DISM). Provided two interfaces: a modern WPF desktop dashboard and a headless CLI for IT automation scripts.</p>`
		},
		resultado: {
			title: 'Resultado',
			bodyHtml: `<p>Una herramienta de soporte informático profesional que acelera el diagnóstico de ordenadores con Windows y automatiza las reparaciones más comunes en un solo clic.</p><p>Demuestra capacidad de ingeniería de software en <strong>.NET 10 y C# 12</strong>, integración de IA segura respetando la privacidad, diseño de interfaces de escritorio con WPF y desarrollo de herramientas de sistema orientadas al sector IT.</p>`
		},
		resultadoEn: {
			title: 'Outcome',
			bodyHtml: `<p>A professional IT support tool that speeds up Windows PC diagnosis and automates the most common system repairs in a single click.</p><p>Demonstrates software engineering skills in <strong>.NET 10 and C# 12</strong>, privacy-compliant AI integration, desktop UI design with WPF, and system tools development for IT operations.</p>`
		},
		stack: [
			'.NET 10',
			'C# 12',
			'WPF (Windows Presentation Foundation)',
			'PowerShell',
			'Windows API',
			'OpenRouter API',
			'Google Gemini API',
			'PDF Generation'
		],
		stackEn: [
			'.NET 10',
			'C# 12',
			'WPF (Windows Presentation Foundation)',
			'PowerShell',
			'Windows API',
			'OpenRouter API',
			'Google Gemini API',
			'PDF Generation'
		],
		liveUrl: 'https://github.com/moisesvalero/SupportAI-USB',
		repoUrl: 'https://github.com/moisesvalero/SupportAI-USB',
		checklistPublicacion: {
			tituloYSlug: true,
			contenidoPrincipal: true,
			imagenesCargadas: true,
			seoCompletado: true
		}
	};

	await client.createOrReplace(doc);
	console.log('Case study supportai-usb cargado en Sanity con capturas reales.');
}

main().catch((error) => {
	console.error('Error cargando supportai-usb en Sanity:', error);
	process.exit(1);
});
