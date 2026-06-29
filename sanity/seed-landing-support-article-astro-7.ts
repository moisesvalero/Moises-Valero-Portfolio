/**
 * Artículo del blog (landingSupportArticle) para el lanzamiento de Astro 7.0
 */

import { getCliClient } from 'sanity/cli';

const SLUG = 'astro-7';
const PUBLISHED_AT = '2026-06-29T12:28:00.000Z';

const TITLE = 'Astro 7.0: La Era de Rolldown y Builds Ultrarrápidos';

const COVER_IMAGE_SRC = '/imagenes/astro-7-cover.png';
const COVER_IMAGE_ALT =
	'Logotipo de Astro 7.0 con un número 7 en color degradado azul y morado sobre fondo oscuro.';

const CATEGORY_LABEL = 'Novedades';
const EXCERPT =
	'Analizamos a fondo Astro 7.0, el gran salto que introduce Vite 8 y Rolldown para acelerar compilaciones hasta un 60%, su nuevo markdown nativo Rust Sätteri, y el primer soporte de primera clase para agentes de desarrollo IA.';

const READING_MINUTES = 5;
const SHOW_ON_BLOG = true;
const FEATURED_ORDER: number | null = null;

const SEO_TITLE = 'Astro 7.0: Novedades, Rolldown y Soporte IA de Primera Clase';
const SEO_DESCRIPTION =
	'Analizamos a fondo Astro 7.0, el gran salto con Vite 8 y Rolldown para acelerar builds un 60%, su nuevo Markdown Rust Sätteri y soporte nativo para agentes de IA.';

const BODY_HTML = `
<p>La comunidad de desarrollo frontend ha estado esperando con ansias las promesas de la compilación en Rust integrada en nuestros flujos de trabajo cotidianos. Con el lanzamiento de <strong>Astro 7.0</strong>, esa promesa se materializa en una actualización foundational que no solo acelera radicalmente los builds mediante Vite 8 y Rolldown, sino que además define las bases de cómo los frameworks interactuarán con los agentes de IA en el futuro cercano.</p>

<h2>Vite 8 y Rolldown: Builds un 60% más rápidos</h2>
<p>La gran estrella de este lanzamiento es la adopción por defecto de <strong>Vite 8</strong>. Pero lo realmente revolucionario no es el salto de versión de Vite en sí, sino lo que lleva debajo del capó: <strong>Rolldown</strong>.</p>
<p>Rolldown es un empaquetador (bundler) escrito en Rust desarrollado por el core team de Vite, diseñado para reemplazar gradualmente tanto a <code>esbuild</code> como a <code>Rollup</code>. En Astro 7.0, Rolldown asume las tareas más pesadas del build de producción. Las consecuencias son contundentes:</p>
<ul>
  <li><strong>Velocidad pura:</strong> Pruebas aisladas muestran rendimiento de compilación de 10x a 30x más rápido frente a empaquetadores JS tradicionales.</li>
  <li><strong>Impacto en proyectos reales:</strong> Dependiendo del tamaño del sitio y el volumen de dependencias, los tiempos globales de compilación (build times) han registrado mejoras de entre el <strong>15% y el 61%</strong>.</li>
  <li><strong>Compatibilidad total:</strong> No requiere cambios de configuración en la gran mayoría de proyectos. El comportamiento de los plugins existentes y los alias se preserva transparentemente.</li>
</ul>

<h2>Sätteri: Adiós Remark/Rehype en el Core</h2>
<p>Tradicionalmente, Astro confiaba en el ecosistema <code>unified</code> (Remark y Rehype) para parsear y renderizar archivos Markdown y MDX. Aunque robusto y extremadamente flexible, el pipeline de JavaScript representaba un cuello de botella sustancial cuando se trataba de sitios con miles de páginas de contenido estático.</p>
<p>Astro 7.0 presenta <strong>Sätteri</strong>, un procesador nativo de Markdown y MDX escrito íntegramente en Rust. Sätteri elimina la sobrecarga de traducción entre JS y el árbol sintáctico abstracto, logrando parseos casi instantáneos. No obstante, si tu sitio hace un uso intensivo de plugins externos de Remark o Rehype específicos, deberás instalar el paquete oficial de compatibilidad <code>@astrojs/markdown-remark</code> para mantener tus configuraciones personalizadas.</p>

<h2>Advanced Routing y Route Caching estables</h2>
<p>Dos funcionalidades que llevaban meses en fase experimental por fin alcanzan la madurez en esta versión:</p>
<ul>
  <li><strong>Advanced Routing:</strong> El enrutamiento dinámico avanzado ya es estable por defecto. Ahora, el punto de entrada principal para lógica personalizada se centraliza en <code>src/fetch.ts</code>, ofreciendo un control absoluto sobre el procesamiento de peticiones en entornos SSR.</li>
  <li><strong>Route Caching:</strong> Permite almacenar en caché las rutas procesadas mediante una API agnóstica a la plataforma de despliegue. Ya sea que uses Vercel, Netlify o Cloudflare, la caché de rutas se sincronizará con las capacidades de red de distribución de contenidos (CDN) del proveedor seleccionado de manera nativa.</li>
</ul>

<h2>El primer framework pensado para Agentes de IA</h2>
<p>Una adición inesperada pero sumamente inteligente en Astro 7.0 es el soporte nativo para agentes de desarrollo e IA de código. El equipo de Astro ha reconocido que cada vez más código es escrito y modificado por modelos e interfaces autónomas.</p>
<p>Para facilitar este flujo de trabajo híbrido, Astro 7.0 introduce:</p>
<ol>
  <li><strong>Background Dev Server:</strong> Al ejecutar <code>astro dev --background</code>, el servidor se inicia y se gestiona eficientemente en segundo plano, ideal para entornos de desarrollo web embebidos o terminales de agentes.</li>
  <li><strong>Logging Estructurado JSON:</strong> Permite que los logs del compilador y del dev server se vuelquen en formato estructurado JSON. Esto simplifica que las herramientas y los agentes analicen errores de sintaxis y warnings de forma máquina-legible y los solucionen en tiempo real sin adivinar.</li>
</ol>

<h2>Deprecaciones y cómo actualizar</h2>
<p>Como en todo cambio de versión mayor, Astro 7.0 limpia código obsoleto. El cambio principal es la eliminación completa de los comandos CLI heredados de <code>astro db</code> (tales como <code>astro login</code> o <code>astro link</code>) en favor de un cliente SDK dedicado, simplificando la interfaz del framework.</p>
<p>Para migrar tu proyecto a la versión 7, puedes ejecutar la herramienta de actualización automatizada oficial:</p>
<pre><code>npx @astrojs/upgrade</code></pre>
<p>La herramienta escaneará tus dependencias, actualizará los paquetes core y te alertará si algún plugin no oficial necesita atención manual.</p>
`.trim();

async function main() {
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
	console.log(`Articulo ${SLUG} cargado en Sanity.`);
}

main().catch((error) => {
	console.error(`Error cargando ${SLUG} en Sanity:`, error);
	process.exit(1);
});
