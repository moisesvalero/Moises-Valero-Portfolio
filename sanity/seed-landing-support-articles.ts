/**
 * Carga en Sanity los articulos de apoyo para /diseno-web-alcoy/[slug].
 * Ejecutar desde la raiz:
 *   npx sanity exec sanity/seed-landing-support-articles.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';
import { landingSupportArticleFallbacks } from '../src/lib/data/landing-support-articles';

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });

  for (const article of landingSupportArticleFallbacks) {
    await client.createOrReplace({
      _id: `landingSupportArticle.${article.slug}`,
      _type: 'landingSupportArticle',
      title: article.title,
      slug: { _type: 'slug', current: article.slug },
      categoryLabel: article.categoryLabel,
      excerpt: article.excerpt,
      publishedAt: article.publishedAt,
      readingMinutes: article.readingMinutes,
      coverImageSrc: article.coverImageSrc,
      coverImageAlt: article.coverImageAlt,
      bodyHtml: article.bodyHtml,
      ctaTitle: article.ctaTitle,
      ctaText: article.ctaText,
      ctaPrimaryLabel: article.ctaPrimaryLabel,
      ctaPrimaryHref: article.ctaPrimaryHref,
      ctaSecondaryLabel: article.ctaSecondaryLabel,
      ctaSecondaryHref: article.ctaSecondaryHref,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription
    });
  }

  console.log(`OK: ${landingSupportArticleFallbacks.length} articulo(s) de apoyo cargado(s) en Sanity.`);
}

main().catch((error) => {
  console.error('Error cargando articulos de apoyo:', error);
  process.exit(1);
});
