import type { LandingSupportArticle } from '$lib/types/landing-support-article';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { imageUrl } from './sanity/image-builder';
import { landingSupportArticleBySlugQuery } from './sanity/groq-landing-support-article';

type LandingSupportArticleRow = Partial<LandingSupportArticle> & {
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  bodyHtml?: string | null;
  image?: unknown;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 5): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function mapRow(
  row: LandingSupportArticleRow,
  ctx?: { projectId: string; dataset: string }
): LandingSupportArticle | undefined {
  const slug = asString(row.slug);
  const title = asString(row.title);
  const excerpt = asString(row.excerpt);
  const bodyHtml = asString(row.bodyHtml);
  if (!slug || !title || !excerpt || !bodyHtml) {
    return undefined;
  }
  const imageFromAsset =
    ctx && ctx.projectId && ctx.dataset ? imageUrl(ctx.projectId, ctx.dataset, row.image, 1400) : undefined;

  return {
    slug,
    title,
    categoryLabel: asString(row.categoryLabel, 'Guia local'),
    excerpt,
    publishedAt: asString(row.publishedAt, new Date().toISOString()),
    readingMinutes: asNumber(row.readingMinutes, 5),
    coverImageSrc: imageFromAsset || asString(row.coverImageSrc, '/og-image-2026.png'),
    coverImageAlt: asString(row.coverImageAlt, title),
    bodyHtml,
    seoTitle: asString(row.seoTitle, title),
    seoDescription: asString(row.seoDescription, excerpt)
  };
}

export async function fetchLandingSupportArticle(slug: string): Promise<LandingSupportArticle | undefined> {
  const safeSlug = slug.trim().toLowerCase();
  if (!safeSlug) {
    return undefined;
  }

  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client) {
    return undefined;
  }

  try {
    const row = await client.fetch<LandingSupportArticleRow | null>(landingSupportArticleBySlugQuery, {
      slug: safeSlug
    });
    if (!row) {
      return undefined;
    }

    return mapRow(row, cfg ?? undefined);
  } catch (error) {
    console.warn(`[blog-article] Sanity unavailable for slug "${safeSlug}".`, error);
    return undefined;
  }
}
