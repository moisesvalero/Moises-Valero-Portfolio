/**
 * PLANTILLA — Artículo del blog (landingSupportArticle)
 *
 * Como crear un articulo nuevo:
 *   1. Copia este archivo como `sanity/seed-landing-support-article-<slug>.ts`.
 *   2. Cambia el SLUG abajo por el slug real (kebab-case, sin tildes).
 *   3. Rellena los campos marcados con `// EDITAR`.
 *   4. Verifica que la portada esta en `static/imagenes/<slug>-cover.png`
 *      y que `coverImageSrc` apunta a esa ruta.
 *   5. Ejecuta:
 *        pnpm exec sanity exec sanity/seed-landing-support-article-<slug>.ts --with-user-token
 *   6. Commit + push de la imagen y del script.
 *   7. Verifica en /blog/<slug> tras el deploy.
 *
 * NO ejecutes este archivo tal cual: el titulo lleva la marca [PLANTILLA]
 * y el script abortara si la detecta.
 */

import { getCliClient } from 'sanity/cli';

const SLUG = 'plantilla-primer-articulo';
const PUBLISHED_AT = '2026-06-29T10:00:00.000Z';

const TITLE = '[PLANTILLA] Cambia este titulo y quita la marca [PLANTILLA]';

const COVER_IMAGE_SRC = '/imagenes/plantilla-primer-articulo-cover.png';
const COVER_IMAGE_ALT = 'Texto alternativo descriptivo de la portada del articulo.';

const CATEGORY_LABEL = 'Guia tecnica';
const EXCERPT =
	'Resumen de 1-2 frases (80-220 caracteres) que aparece en la cabecera, en la ficha del blog y en la meta description si no defines seoDescription.';

const READING_MINUTES = 5;
const SHOW_ON_BLOG = false;
const FEATURED_ORDER: number | null = null;

const SEO_TITLE = 'Titulo SEO opcional (max 70 chars). Si lo dejas vacio se usa el titulo.';
const SEO_DESCRIPTION =
	'Descripcion SEO opcional (max 170 chars). Si la dejas vacia se usa el excerpt.';

const BODY_HTML = `
<p>Parrafo de apertura que enganche y deje claro de que va el articulo. Mejor una frase corta que tres lineas de مقدمه.</p>
<h2>Primera idea</h2>
<p>Desarrollo de la primera idea. Puedes usar <strong>negritas</strong>, <em>cursiva</em> y enlaces a referencias externas.</p>
<ul>
	<li>Punto 1 con detalle concreto.</li>
	<li>Punto 2 con detalle concreto.</li>
	<li>Punto 3 con detalle concreto.</li>
</ul>
<h2>Segunda idea</h2>
<p>Otro parrafo. Si necesitas un ejemplo de codigo, usa <code>bloques pre</code> con lenguaje si quieres resaltado (sin Prism en el front, el estilo es monospace plano).</p>
<pre><code>// ejemplo
const ok = true;
</code></pre>
<blockquote>Frase destacada o conclusion fuerte en una sola linea.</blockquote>
<h2>Cierre</h2>
<p>Resumen breve y, si tiene sentido, llamada a la accion o siguiente paso.</p>
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
	console.log(`Articulo ${SLUG} cargado en Sanity.`);
}

main().catch((error) => {
	console.error(`Error cargando ${SLUG} en Sanity:`, error);
	process.exit(1);
});
