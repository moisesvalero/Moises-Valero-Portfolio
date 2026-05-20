<script lang="ts">
  import { resolve } from '$app/paths';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const article = $derived(data.article);
  const relatedArticles = $derived(
    (data.relatedArticles ?? []).filter((item) => item.slug !== article.slug).slice(0, 3)
  );
  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const canonical = $derived(`${baseUrl}/blog/${article.slug}`);
  const seoTitle = $derived(article.seoTitle?.trim() || article.title);
  const seoDescription = $derived(article.seoDescription?.trim() || article.excerpt);
  const ogImage = $derived(
    article.coverImageSrc.startsWith('http') ? article.coverImageSrc : `${baseUrl}${article.coverImageSrc}`
  );
  const articleJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: seoDescription,
      datePublished: article.publishedAt,
      author: { '@type': 'Person', name: 'Moises Valero' },
      publisher: { '@type': 'Person', name: 'Moises Valero' },
      image: [ogImage],
      mainEntityOfPage: canonical
    })
  );

  function formatArticleDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
</script>

<svelte:head>
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Moises Valero" />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={articleJsonLd} />
</svelte:head>

<article class="blog-article">
  <header class="article-hero">
    <div class="article-shell">
      <a class="back-link" href={resolve('/blog')}>Blog</a>
      <p class="eyebrow">{article.categoryLabel} · {formatArticleDate(article.publishedAt)} · {article.readingMinutes} min</p>
      <h1>{article.title}</h1>
      <p class="lead">{article.excerpt}</p>
      <div class="article-actions">
        <a class="btn-apple-blue" href={resolve('/#proyectos')}>Ver portfolio</a>
        <a class="btn-ghost-slim" href={resolve('/blog')}>Todos los articulos</a>
      </div>
    </div>
  </header>

  <div class="article-shell article-body-shell">
    <img class="cover" src={article.coverImageSrc} alt={article.coverImageAlt} loading="eager" />
    <div class="content prose">{@html article.bodyHtml}</div>
  </div>

  {#if relatedArticles.length}
    <section class="related" aria-labelledby="related-title">
      <div class="article-shell">
        <div class="related-head">
          <p class="eyebrow">Mas lecturas</p>
          <h2 id="related-title">Articulos relacionados</h2>
        </div>
        <div class="related-grid">
          {#each relatedArticles as related (related.slug)}
            <a href={resolve(`/blog/${related.slug}`)}>
              <span>{related.categoryLabel}</span>
              <h3>{related.title}</h3>
              <p>{related.excerpt}</p>
            </a>
          {/each}
        </div>
      </div>
    </section>
  {/if}
</article>

<style>
  :global(body) {
    background: var(--bg-surface);
  }

  .blog-article {
    min-height: 100vh;
    color: var(--text-main);
    font-family: var(--font-sans);
  }

  .article-shell {
    width: min(860px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .article-hero {
    padding: clamp(7rem, 12vw, 9rem) 0 2.8rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background:
      radial-gradient(circle at 18% 18%, rgba(0, 113, 227, 0.14), transparent 34%),
      radial-gradient(circle at 82% 12%, rgba(124, 92, 191, 0.1), transparent 32%),
      linear-gradient(180deg, var(--bg-main) 0%, var(--bg-surface) 100%);
  }

  .back-link {
    display: inline-flex;
    margin-bottom: 1.35rem;
    color: #0071e3;
    font-weight: 800;
    text-decoration: none;
  }

  .eyebrow {
    margin: 0 0 0.85rem;
    color: #0071e3;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 6vw, 4.4rem);
    line-height: 1;
    letter-spacing: 0;
  }

  .lead {
    max-width: 68ch;
    margin: 1rem 0 0;
    color: var(--text-secondary);
    font-size: clamp(1rem, 2vw, 1.14rem);
    line-height: 1.7;
  }

  .article-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.6rem;
  }

  .btn-apple-blue,
  .btn-ghost-slim {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    border-radius: 8px;
    padding: 0.82rem 1.35rem;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    transition:
      transform 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      background 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      border-color 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      color 0.32s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-apple-blue {
    border: 1px solid #0066e5;
    background: #0066e5;
    color: #ffffff;
    box-shadow: 0 12px 28px rgba(0, 102, 229, 0.22);
  }

  .btn-apple-blue:hover,
  .btn-apple-blue:focus-visible {
    transform: translateY(-3px);
    border-color: #0052b8;
    background: #0052b8;
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(0, 102, 229, 0.32);
  }

  .btn-ghost-slim {
    border: 1.5px solid #e2e8f0;
    background: transparent;
    color: #0f172a;
  }

  .btn-ghost-slim:hover,
  .btn-ghost-slim:focus-visible {
    transform: translateY(-3px);
    border-color: #cbd5e1;
    background: rgba(15, 23, 42, 0.04);
    color: #0f172a;
  }

  .article-body-shell {
    padding: 2rem 0 3.5rem;
  }

  .cover {
    display: block;
    width: 100%;
    max-height: 430px;
    object-fit: cover;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: #e9edf5;
    box-shadow: 0 22px 52px rgba(15, 23, 42, 0.08);
  }

  .content {
    margin-top: 1.5rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    padding: clamp(1.15rem, 3vw, 2rem);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
  }

  .prose :global(h2),
  .prose :global(h3) {
    color: var(--text-main);
    line-height: 1.22;
  }

  .prose :global(h2) {
    margin: 1.4rem 0 0.75rem;
    font-size: clamp(1.35rem, 3vw, 1.8rem);
  }

  .prose :global(h3) {
    margin: 1.2rem 0 0.6rem;
    font-size: clamp(1.15rem, 2.4vw, 1.4rem);
  }

  .prose :global(p),
  .prose :global(li) {
    color: var(--text-secondary);
    line-height: 1.75;
  }

  .prose :global(a) {
    color: #0071e3;
    font-weight: 700;
  }

  .prose :global(img) {
    max-width: 100%;
    border-radius: 8px;
  }

  .related {
    padding: 0 0 4rem;
  }

  .related-head {
    margin-bottom: 1rem;
  }

  .related-head h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .related-grid a {
    min-width: 0;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.86);
    padding: 1rem;
    color: inherit;
    text-decoration: none;
    transition: transform 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
  }

  .related-grid a:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 113, 227, 0.24);
  }

  .related-grid span {
    color: #0071e3;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .related-grid h3 {
    margin: 0.6rem 0;
    font-size: 1.05rem;
    line-height: 1.25;
  }

  .related-grid p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  :global(html.dark) .article-hero {
    border-bottom-color: rgba(255, 255, 255, 0.12);
    background:
      radial-gradient(circle at 20% 12%, rgba(0, 113, 227, 0.16), transparent 34%),
      radial-gradient(circle at 82% 10%, rgba(167, 243, 255, 0.08), transparent 32%),
      linear-gradient(180deg, #0a0a0a 0%, #0b0b0b 100%);
  }

  :global(html.dark) .cover,
  :global(html.dark) .content,
  :global(html.dark) .related-grid a {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.86);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .related-grid a:hover {
    border-color: rgba(255, 255, 255, 0.28);
    background: rgba(24, 24, 27, 0.96);
  }

  :global(html.dark) .btn-apple-blue {
    border-color: rgba(255, 255, 255, 0.78);
    background: linear-gradient(135deg, #ffffff 0%, #f5f7ff 52%, #e7fbff 100%);
    color: #0a0a0a;
    box-shadow:
      0 16px 38px rgba(0, 0, 0, 0.34),
      0 0 24px rgba(167, 243, 255, 0.14),
      0 0 0 1px rgba(0, 0, 0, 0.06) inset;
  }

  :global(html.dark) .btn-apple-blue:hover,
  :global(html.dark) .btn-apple-blue:focus-visible {
    border-color: rgba(255, 255, 255, 0.9);
    background: linear-gradient(135deg, #ffffff 0%, #f7f8ff 48%, #ecfbff 100%);
    color: #000000;
  }

  :global(html.dark) .btn-ghost-slim {
    border-color: rgba(167, 243, 255, 0.24);
    background: rgba(10, 10, 10, 0.68);
    color: #f4f4f5;
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.28),
      0 0 22px rgba(139, 156, 255, 0.09),
      0 1px 0 rgba(255, 255, 255, 0.08) inset;
  }

  :global(html.dark) .btn-ghost-slim:hover,
  :global(html.dark) .btn-ghost-slim:focus-visible {
    border-color: #ffffff;
    background: #fafafa;
    color: #0a0a0a;
  }

  @media (max-width: 760px) {
    .article-shell {
      width: min(100% - 1.25rem, 860px);
    }

    .article-hero {
      padding-top: 6.5rem;
    }

    .article-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
