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
    categoryLabel: asString(row.categoryLabel, 'Guia tecnica'),
    excerpt,
    publishedAt: asString(row.publishedAt, new Date().toISOString()),
    readingMinutes: asNumber(row.readingMinutes, 5),
    coverImageSrc: imageFromAsset || asString(row.coverImageSrc, '/og-image.png'),
    coverImageAlt: asString(row.coverImageAlt, title),
    bodyHtml: asString(row.bodyHtml, ''),
    seoTitle: asString(row.seoTitle, title),
    seoDescription: asString(row.seoDescription, excerpt),
    showOnBlog: asBoolean(row.showOnBlog, false),
    featuredOrder: asOptionalNumber(row.featuredOrder)
  };
}

export async function fetchLandingSupportArticles(limit?: number): Promise<LandingSupportArticle[]> {
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client) {
    return [];
  }

  try {
    const rows = await client.fetch<LandingSupportArticleListRow[] | null>(landingSupportArticlesQuery);
    const mapped = (rows ?? [])
      .map((row: LandingSupportArticleListRow) => mapRow(row, cfg ?? undefined))
      .filter(Boolean) as LandingSupportArticle[];
    const sorted = mapped.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  } catch (error) {
    console.warn('[blog-articles] Sanity unavailable.', error);
    return [];
  }
}
