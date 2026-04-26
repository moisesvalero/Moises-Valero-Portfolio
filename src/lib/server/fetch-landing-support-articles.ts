import { landingSupportArticleFallbacks } from '$lib/data/landing-support-articles';
import type { LandingSupportArticle } from '$lib/types/landing-support-article';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { imageUrl } from './sanity/image-builder';
import { landingSupportArticlesQuery } from './sanity/groq-landing-support-articles';

type LandingSupportArticleListRow = Partial<LandingSupportArticle> & {
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  image?: unknown;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 5): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function asBoolean(value: unknown, fallback = true): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function mapRow(
  row: LandingSupportArticleListRow,
  ctx?: { projectId: string; dataset: string }
): LandingSupportArticle | undefined {
  const slug = asString(row.slug);
  const title = asString(row.title);
  const excerpt = asString(row.excerpt, 'Contenido en actualizacion');
  if (!slug || !title) {
    return undefined;
  }
  const imageFromAsset =
    ctx && ctx.projectId && ctx.dataset ? imageUrl(ctx.projectId, ctx.dataset, row.image, 1200) : undefined;

  return {
    slug,
    title,
    categoryLabel: asString(row.categoryLabel, 'Guia local'),
    excerpt,
    publishedAt: asString(row.publishedAt, new Date().toISOString()),
    readingMinutes: asNumber(row.readingMinutes, 5),
    coverImageSrc: imageFromAsset || asString(row.coverImageSrc, '/og-image.png'),
    coverImageAlt: asString(row.coverImageAlt, title),
    bodyHtml: asString(row.bodyHtml, ''),
    ctaTitle: asString(row.ctaTitle, 'Quieres mejorar tu web en Alcoy?'),
    ctaText: asString(
      row.ctaText,
      'Te ayudo a mejorar velocidad, seguridad y conversion en tu web local.'
    ),
    ctaPrimaryLabel: asString(row.ctaPrimaryLabel, 'Pedir una revision'),
    ctaPrimaryHref: asString(row.ctaPrimaryHref, '/api/contact/whatsapp'),
    ctaSecondaryLabel: asString(row.ctaSecondaryLabel, 'Volver a la web'),
    ctaSecondaryHref: asString(row.ctaSecondaryHref, '/diseno-web-alcoy'),
    seoTitle: asString(row.seoTitle, title),
    seoDescription: asString(row.seoDescription, excerpt),
    showOnNationalLanding: asBoolean(row.showOnNationalLanding, true),
    showOnAlcoyLanding: asBoolean(row.showOnAlcoyLanding, true),
    featuredOrder: asOptionalNumber(row.featuredOrder)
  };
}

function sortFeaturedArticles(a: LandingSupportArticle, b: LandingSupportArticle): number {
  const aOrder = a.featuredOrder;
  const bOrder = b.featuredOrder;
  if (typeof aOrder === 'number' && typeof bOrder === 'number' && aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  if (typeof aOrder === 'number' && typeof bOrder !== 'number') {
    return -1;
  }
  if (typeof aOrder !== 'number' && typeof bOrder === 'number') {
    return 1;
  }
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export async function fetchLandingSupportArticles(limit?: number): Promise<LandingSupportArticle[]> {
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client) {
    const fallback = landingSupportArticleFallbacks;
    return typeof limit === 'number' ? fallback.slice(0, limit) : fallback;
  }

  try {
    const rows = await client.fetch<LandingSupportArticleListRow[] | null>(landingSupportArticlesQuery);
    const mapped = (rows ?? [])
      .map((row) => mapRow(row, cfg ?? undefined))
      .filter(Boolean) as LandingSupportArticle[];
    const fallback = landingSupportArticleFallbacks;

    // Normal path: Sanity trae una lista suficiente y consistente.
    if (mapped.length >= 3) {
      return typeof limit === 'number' ? mapped.slice(0, limit) : mapped;
    }

    // Fallback controlado: si Sanity responde con pocos artículos por desajuste de entorno/cache,
    // completamos con locales para evitar que la web quede "vacía" en producción.
    const mergedBySlug = new Map<string, LandingSupportArticle>();
    for (const article of mapped) {
      mergedBySlug.set(article.slug, article);
    }
    for (const article of fallback) {
      if (!mergedBySlug.has(article.slug)) {
        mergedBySlug.set(article.slug, article);
      }
    }

    const merged = [...mergedBySlug.values()].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return typeof limit === 'number' ? merged.slice(0, limit) : merged;
  } catch (error) {
    console.warn('[landing-support-articles] Sanity unavailable, using local defaults.', error);
    const fallback = landingSupportArticleFallbacks;
    return typeof limit === 'number' ? fallback.slice(0, limit) : fallback;
  }
}

export async function fetchFeaturedLandingSupportArticles(
  placement: 'national' | 'alcoy',
  limit = 4
): Promise<LandingSupportArticle[]> {
  const articles = await fetchLandingSupportArticles();
  const predicate =
    placement === 'national'
      ? (article: LandingSupportArticle) => article.showOnNationalLanding !== false
      : (article: LandingSupportArticle) => article.showOnAlcoyLanding !== false;

  return articles.filter(predicate).sort(sortFeaturedArticles).slice(0, limit);
}
