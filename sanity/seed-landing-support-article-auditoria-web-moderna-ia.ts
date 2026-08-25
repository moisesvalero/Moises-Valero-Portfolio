/**
 * Seed para el articulo del blog: Auditoría web en 2026 y Syrax Analyzer (Versión extendida con enfoque agéntico, CLI, Master Prompt y Planes)
 */

import { getCliClient } from 'sanity/cli';

const SLUG = 'auditoria-web-moderna-ia';
const PUBLISHED_AT = '2026-08-25T16:00:00.000Z';

const TITLE = 'Auditoría web en 2026: Por qué Lighthouse ya no es suficiente';

const COVER_IMAGE_SRC = '/imagenes/auditoria-web-moderna-ia-cover.png';
const COVER_IMAGE_ALT =
	'Panel de control de auditoría técnica web 360 mostrando métricas de Core Web Vitals, SEO, seguridad, accesibilidad y agentes de IA.';

const CATEGORY_LABEL = 'Auditoría & Rendimiento';
const EXCERPT =
	'De Core Web Vitals y seguridad HTTP a optimización AEO, CLI en local y el Master Prompt para agentes de IA: cómo auditar y reparar tu web con Syrax Analyzer.';

const READING_MINUTES = 10;
const SHOW_ON_BLOG = true;
const FEATURED_ORDER: number | null = 3;

const SEO_TITLE = 'Auditoría web en 2026: Por qué Lighthouse ya no es suficiente';
const SEO_DESCRIPTION =
	'Guía técnica 2026: Core Web Vitals, seguridad HTTP, WCAG 2.2, optimización AEO/GEO, Syrax CLI y el Master Prompt para agentes de IA con Syrax Analyzer.';

const BODY_HTML = `
<p>Durante años, conseguir un <strong>"100 en verde" en Google Lighthouse</strong> fue el estándar dorado del desarrollo frontend. Abrir las Chrome DevTools, lanzar un análisis aislado en local y celebrar puntuaciones perfectas era una práctica habitual. Sin embargo, el ecosistema web actual ha evolucionado hacia una complejidad que deja obsoletos los escaneos estáticos tradicionales.</p>

<p>En 2026, una página web puede lucir una puntuación impecable en Lighthouse y, al mismo tiempo, presentar graves brechas en sus cabeceras HTTP, ser invisible para los nuevos motores de búsqueda basados en IA (AEO/GEO), violar el RGPD inyectando rastreadores antes del consentimiento o arrojar decenas de excepciones silenciosas de JavaScript en la consola del usuario. Las auditorías superficiales ya no sirven: <strong>el desarrollo profesional exige una auditoría técnica integral de 360 grados</strong>.</p>

<h2>Las limitaciones críticas de las auditorías convencionales</h2>

<p>Las suites de análisis tradicionales presentan tres problemas estructurales al enfrentarse a aplicaciones modernas (SSR, hidratación en cliente o arquitecturas agénticas):</p>

<ul>
	<li><strong>Ceguera de runtime:</strong> Un escáner estático se limita a descargar el HTML inicial con un simple <code>fetch</code>. Si un error en la hidratación de SvelteKit, React o Vue rompe la interactividad posterior, la herramienta es incapaz de detectarlo.</li>
	<li><strong>Omisión de seguridad defensiva:</strong> Rara vez verifican si el servidor envía cabeceras robustas como <code>Content-Security-Policy (CSP)</code>, <code>HSTS Preload</code> o directivas contra ataques de MIME-sniffing y Clickjacking.</li>
	<li><strong>El abismo de la remediación:</strong> Te indican que tu Interaction to Next Paint (INP) o contraste WCAG falla, pero dejan al desarrollador con la tarea de investigar y redactar la solución desde cero.</li>
</ul>

<blockquote>"Un informe que solo enumera fallos sin ofrecer la solución accionable se queda a mitad de camino. En la era de la inteligencia artificial, el diagnóstico debe conectarse directamente con la reparación en tu editor."</blockquote>

<h2>Las 5 capas indispensables de una auditoría moderna</h2>

<p>Cualquier auditoría rigurosa hoy en día debe evaluar de manera simultánea cinco dimensiones técnicas clave:</p>

<h3>1. Rendimiento Real y Core Web Vitals (LCP, INP, CLS)</h3>
<p>La velocidad ya no es solo cuánto tarda en cargar el primer byte (TTFB). La métrica <strong>Interaction to Next Paint (INP)</strong> evalúa la respuesta táctil y de teclado real, castigando los bloqueos del hilo principal provocados por bundles sobredimensionados o tareas largas de JavaScript.</p>

<h3>2. Seguridad HTTP y Cabeceras Defensivas</h3>
<p>Blindar las comunicaciones exige verificar la presencia de:</p>
<ul>
	<li><code>Strict-Transport-Security (HSTS)</code> con <code>includeSubDomains</code> y precarga activada.</li>
	<li><code>Content-Security-Policy (CSP)</code> estricto para neutralizar ataques XSS e inyecciones maliciosas.</li>
	<li><code>X-Frame-Options: DENY / SAMEORIGIN</code> y <code>X-Content-Type-Options: nosniff</code>.</li>
	<li><code>Referrer-Policy</code> y <code>Permissions-Policy</code> (restringiendo acceso a cámara, micrófono y geolocalización).</li>
</ul>

<h3>3. Accesibilidad Universal (WCAG 2.2)</h3>
<p>Computar el contraste de color real sobre elementos renderizados en el DOM final, validar etiquetas <code>aria-*</code>, estructura de encabezados, targets táctiles mínimos de 48x48px y garantizar la navegación fluida por teclado.</p>

<h3>4. AEO y GEO: Optimización para Motores y Agentes de IA</h3>
<p>El SEO ya no se limita a Google. Con la consolidación de ChatGPT Search, Perplexity, Claude, Gemini y Google AI Overviews, la preparación <strong>AEO (Answer Engine Optimization)</strong> y <strong>GEO (Generative Engine Optimization)</strong> es prioritaria. Esto requiere microdatos semánticos <strong>JSON-LD estructurados</strong> impecables y la adopción del estándar <code>llms.txt</code> para alimentar a los rastreadores de IA con contexto limpio y fidedigno.</p>

<h3>5. Privacidad y Cumplimiento RGPD</h3>
<p>Monitorear si el sitio web establece cookies de rastreo o descarga scripts de terceros antes de que el usuario pulse el botón de aceptación en el banner de consentimiento.</p>

<h2>El salto a la auditoría activa: El ecosistema Syrax Analyzer</h2>

<p>Frente a las limitaciones del software tradicional, herramientas de nueva generación han rediseñado por completo el ciclo de vida de la auditoría técnica. El referente más representativo de este nuevo paradigma es <a href="https://syrax-analyzer.moisesvalero.es" target="_blank" rel="noopener noreferrer"><strong>Syrax Analyzer</strong></a>, una plataforma SaaS especializada que combina un motor de escaneo de <strong>más de 120 vectores técnicos</strong> con un flujo de trabajo 100% agéntico.</p>

<p>A diferencia de los analizadores pasivos, Syrax Analyzer está concebido para integrarse en el día a día de desarrolladores que utilizan asistentes y agentes de inteligencia artificial (Cursor, Antigravity, Claude Code, Codex u OpenCode).</p>

<h2>Flujo Agéntico: Del informe al código con el Master Prompt</h2>

<p>La gran innovación de Syrax Analyzer radica en su capacidad de traducción técnica. Cada vez que detecta un error o área de mejora, no se limita a mostrar una gráfica roja: <strong>genera un prompt quirúrgico de reparación</strong>.</p>

<p>Para auditorías completas, la plataforma introduce el <strong>Master Prompt</strong>:</p>

<ol>
	<li><strong>Diagnóstico unificado:</strong> El Master Prompt condensa todas las incidencias detectadas (seguridad, accesibilidad, Core Web Vitals, JSON-LD) con el contexto exacto de tu arquitectura.</li>
	<li><strong>Conexión con agentes de código:</strong> Puedes copiar el Master Prompt directamente en tu editor (Cursor, Antigravity, Claude Code o Copilot) junto con tu <strong>API Key</strong> de Syrax Analyzer.</li>
	<li><strong>Resolución automatizada:</strong> El agente de IA consulta los detalles del diagnóstico a través de la API, localiza los archivos en tu repositorio y aplica las correcciones de código necesarias sin que tengas que intervenir manualmente en cada detalle.</li>
	<li><strong>Seguridad absoluta:</strong> Syrax Analyzer nunca accede a tu código fuente ni almacena archivos de tu servidor; el análisis se realiza externamente o sobre el HTML renderizado localmente, dejando la edición en manos de tu propio agente en tu entorno de desarrollo.</li>
</ol>

<pre><code>// Ejemplo de flujo agéntico con Master Prompt:
// 1. Ejecutas la auditoría con Syrax Analyzer
// 2. Copias el Master Prompt generado a Cursor o Antigravity
// 3. Tu agente lee las directivas y parcha hooks.server.ts, layout.svelte y json-ld automáticamente
</code></pre>

<h2>Syrax CLI: Auditoría local y CI/CD sin configuración</h2>

<p>Para aquellos equipos que necesitan evaluar su código antes de desplegar a producción o durante el desarrollo local, la plataforma ofrece <strong>Syrax CLI</strong> mediante el comando <code>npx syrax-audit</code>:</p>

<ul>
	<li><strong>Cero instalación global:</strong> Se ejecuta al vuelo con <code>npx syrax-audit</code> en la raíz de cualquier repositorio.</li>
	<li><strong>Auto-detección de servidores locales:</strong> Identifica automáticamente puertos de desarrollo activos en Node.js (SvelteKit, Next.js, Astro), Python (Django, FastAPI), PHP (Laravel, WordPress), Rust o Go.</li>
	<li><strong>Integración en pipelines:</strong> Permite configurar Git hooks locales con Husky o bloquear deploys en <strong>GitHub Actions</strong> si la puntuación de seguridad o rendimiento cae por debajo del umbral establecido.</li>
</ul>

<h2>Plan Básico vs. Plan Premium</h2>

<p>Syrax Analyzer ofrece dos modalidades adaptadas a distintas necesidades de desarrollo:</p>

<div class="table-container">
<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
	<thead>
		<tr style="border-bottom: 2px solid currentColor; text-align: left;">
			<th style="padding: 0.75rem;">Característica</th>
			<th style="padding: 0.75rem;">Plan Básico (0€)</th>
			<th style="padding: 0.75rem;">Plan Premium (15€/mes)</th>
		</tr>
	</thead>
	<tbody>
		<tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
			<td style="padding: 0.75rem;"><strong>Análisis web</strong></td>
			<td style="padding: 0.75rem;">2 escaneos diarios</td>
			<td style="padding: 0.75rem;"><strong>Ilimitados</strong></td>
		</tr>
		<tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
			<td style="padding: 0.75rem;"><strong>Ejecuciones CLI (npx)</strong></td>
			<td style="padding: 0.75rem;">2 diarias en local</td>
			<td style="padding: 0.75rem;"><strong>Ilimitadas</strong></td>
		</tr>
		<tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
			<td style="padding: 0.75rem;"><strong>Auditoría visual con navegador real</strong></td>
			<td style="padding: 0.75rem;">No (solo estático)</td>
			<td style="padding: 0.75rem;"><strong>Sí (Playwright / Headless en la nube)</strong></td>
		</tr>
		<tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
			<td style="padding: 0.75rem;"><strong>Captura de errores de consola JS</strong></td>
			<td style="padding: 0.75rem;">No</td>
			<td style="padding: 0.75rem;"><strong>Sí (runtime exceptions en vivo)</strong></td>
		</tr>
		<tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
			<td style="padding: 0.75rem;"><strong>Prompts de reparación y Master Prompt</strong></td>
			<td style="padding: 0.75rem;">No</td>
			<td style="padding: 0.75rem;"><strong>Sí (listos para Cursor/Claude/Antigravity)</strong></td>
		</tr>
		<tr style="border-bottom: 1px solid rgba(128,128,128,0.2);">
			<td style="padding: 0.75rem;"><strong>API Key dedicada para agentes y CI/CD</strong></td>
			<td style="padding: 0.75rem;">No</td>
			<td style="padding: 0.75rem;"><strong>Sí</strong></td>
		</tr>
		<tr>
			<td style="padding: 0.75rem;"><strong>Historial y exportación PDF</strong></td>
			<td style="padding: 0.75rem;">No</td>
			<td style="padding: 0.75rem;"><strong>Sí (informes completos descargables)</strong></td>
		</tr>
	</tbody>
</table>
</div>

<h2>Checklist: Cómo auditar y optimizar tu sitio hoy mismo</h2>

<p>Si quieres asegurarte de que tu sitio web cumple los estándares más exigentes de la web moderna, sigue este protocolo:</p>

<ol>
	<li><strong>Lanza una auditoría inicial en <a href="https://syrax-analyzer.moisesvalero.es" target="_blank" rel="noopener noreferrer">Syrax Analyzer</a>:</strong> Revisa tu puntuación global de integridad en las 10 categorías técnicas.</li>
	<li><strong>Inspecciona las excepciones de runtime:</strong> Comprueba si el navegador headless ha capturado errores de JavaScript o problemas de contraste no evidentes a simple vista.</li>
	<li><strong>Copia el Master Prompt en tu agente de IA:</strong> Pega las instrucciones generadas en Cursor o Antigravity para que resuelva los problemas de cabeceras, microdatos JSON-LD y optimización de assets.</li>
	<li><strong>Incorpora el CLI a tu flujo de pre-commit:</strong> Añade <code>npx syrax-audit</code> a tus hooks de Git para evitar que código no optimizado llegue a producción.</li>
</ol>

<h2>Conclusión</h2>

<p>En un entorno digital dominado por la velocidad de carga, la seguridad defensiva y el auge del tráfico procedente de motores conversacionales de IA, las auditorías convencionales basadas únicamente en métricas de laboratorio resultan insuficientes. La combinación de análisis dinámico con navegadores reales en la nube, herramientas CLI en local y remediación automatizada mediante el <strong>Master Prompt</strong> convierte a plataformas como <a href="https://syrax-analyzer.moisesvalero.es" target="_blank" rel="noopener noreferrer"><strong>Syrax Analyzer</strong></a> en un aliado esencial para cualquier equipo de desarrollo que busque excelencia técnica sin perder horas en tareas manuales.</p>
`.trim();

async function main() {
	if (TITLE.includes('[PLANTILLA]') || SLUG.startsWith('plantilla-')) {
		throw new Error(
			`Este archivo es la plantilla. Copialo como seed-landing-support-article-<slug>.ts y rellena los campos EDITAR antes de ejecutarlo.`
		);
	}

	const client = getCliClient({ apiVersion: '2025-01-01' });

	const doc = {
		_id: `landingSupportArticle.${SLUG}`,
		_type: 'landingSupportArticle',
		title: TITLE,
		slug: { _type: 'slug', current: SLUG },
		categoryLabel: CATEGORY_LABEL,
		excerpt: EXCERPT,
		publishedAt: PUBLISHED_AT,
		readingMinutes: READING_MINUTES,
		showOnBlog: SHOW_ON_BLOG,
		...(FEATURED_ORDER !== null ? { featuredOrder: FEATURED_ORDER } : {}),
		coverImageSrc: COVER_IMAGE_SRC,
		coverImageAlt: COVER_IMAGE_ALT,
		bodyHtml: BODY_HTML,
		seoTitle: SEO_TITLE,
		seoDescription: SEO_DESCRIPTION
	};

	await client.createOrReplace(doc);
	console.log(
		`Articulo ${SLUG} actualizado con exito en Sanity (version completa agéntica y CLI).`
	);
}

main().catch((error) => {
	console.error(`Error cargando ${SLUG} en Sanity:`, error);
	process.exit(1);
});
