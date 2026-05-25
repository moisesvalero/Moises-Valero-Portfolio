<script lang="ts">
  import { resolve } from '$app/paths';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const articles = $derived(data.articles ?? []);
  const categories = $derived(['Todos', ...new Set(articles.map((article) => article.categoryLabel).filter(Boolean))]);
  let activeCategory = $state('Todos');
  const visibleArticles = $derived(
    activeCategory === 'Todos' ? articles : articles.filter((article) => article.categoryLabel === activeCategory)
  );
  const recommendedArticles = $derived(
    [...articles]
      .filter((article) => article.showOnBlog === true)
      .sort((a, b) => {
        const aOrder = a.featuredOrder;
        const bOrder = b.featuredOrder;
        if (typeof aOrder === 'number' && typeof bOrder === 'number' && aOrder !== bOrder) return aOrder - bOrder;
        if (typeof aOrder === 'number' && typeof bOrder !== 'number') return -1;
        if (typeof aOrder !== 'number' && typeof bOrder === 'number') return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, 3)
  );
  const editorialArticles = $derived(recommendedArticles.length ? recommendedArticles : articles.slice(0, 3));
  const canonical = `${baseUrl}/blog`;
  const listJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${baseUrl}/blog/${article.slug}`
      }))
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
  <title>Blog técnico | Moisés Valero</title>
  <meta
    name="description"
    content="Artículos técnicos de Moisés Valero sobre desarrollo web, rendimiento, seguridad, SEO técnico y arquitectura de contenido."
  />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Blog técnico | Moisés Valero" />
  <meta
    property="og:description"
    content="Guías y notas prácticas sobre desarrollo web, rendimiento, seguridad y SEO técnico."
  />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${baseUrl}/og-image.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={listJsonLd} />
</svelte:head>

<main class="blog-index">
  <section class="blog-hero" aria-labelledby="blog-title">
    <div class="blog-ambient" aria-hidden="true"></div>
    <div class="blog-shell blog-hero-shell">
      <p class="hero-eyebrow">Blog técnico</p>
      <h1 id="blog-title">Guías de desarrollo web</h1>
      <p class="hero-lead">
        Recursos prácticos sobre desarrollo web, rendimiento, seguridad, SEO técnico e IA aplicada a proyectos reales.
      </p>
    </div>
  </section>

  <section class="blog-feed" aria-labelledby="feed-title">
    <div class="blog-shell">
      <div class="filter-row" aria-label="Filtrar artículos por categoría">
        {#each categories as category (category)}
          <button
            type="button"
            class:active={activeCategory === category}
            aria-pressed={activeCategory === category}
            onclick={() => {
              activeCategory = category;
            }}
          >
            {category}
          </button>
        {/each}
      </div>

      <div class="feed-head">
        <div>
          <p class="section-kicker">Archivo</p>
          <h2 id="feed-title">Últimos artículos</h2>
        </div>
        <span>{visibleArticles.length} lectura{visibleArticles.length === 1 ? '' : 's'}</span>
      </div>

      <div class="article-grid">
        {#each visibleArticles as article, index (article.slug)}
          <a class="article-card" href={resolve(`/blog/${article.slug}`)}>
            <div class="article-media">
              <img
                src={article.coverImageSrc}
                alt={article.coverImageAlt}
                loading={index < 3 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
            <div class="article-copy">
              <span class="article-meta">
                {String(index + 1).padStart(2, '0')} · {article.categoryLabel}
              </span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <span class="read-more">
                Leer mas
                <span aria-hidden="true">-></span>
              </span>
            </div>
            <footer>
              <span>{formatArticleDate(article.publishedAt)}</span>
              <span>{article.readingMinutes} min</span>
            </footer>
          </a>
        {/each}
      </div>
    </div>
  </section>

  {#if editorialArticles.length}
    <section class="editorial-strip" aria-labelledby="editorial-title">
      <div class="blog-shell">
        <div class="feed-head">
          <div>
            <p class="section-kicker">Seleccion editorial</p>
            <h2 id="editorial-title">Guías recomendadas</h2>
          </div>
        </div>

        <div class="editorial-grid">
          {#each editorialArticles as article (article.slug)}
            <a href={resolve(`/blog/${article.slug}`)}>
              <img src={article.coverImageSrc} alt={article.coverImageAlt} loading="lazy" decoding="async" />
              <span>{article.categoryLabel}</span>
              <strong>{article.title}</strong>
            </a>
          {/each}
        </div>
      </div>
    </section>
  {/if}
</main>

<style>
  :global(body) {
    background: var(--bg-surface);
  }

  .blog-index {
    min-height: 100vh;
    color: var(--text-main);
    font-family: var(--font-sans);
  }

  .blog-shell {
    width: min(1120px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .blog-hero {
    position: relative;
    min-height: min(620px, 74svh);
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: clamp(7rem, 12vw, 9.5rem) 0 clamp(5.2rem, 10vw, 7.4rem);
    background:
      radial-gradient(circle at 12% 14%, rgba(0, 113, 227, 0.24), transparent 34rem),
      radial-gradient(circle at 84% 12%, rgba(139, 92, 246, 0.2), transparent 31rem),
      radial-gradient(circle at 50% 84%, rgba(236, 72, 153, 0.11), transparent 32rem),
      linear-gradient(180deg, #f8fbff 0%, var(--bg-surface) 100%);
  }

  .blog-hero::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: clamp(150px, 22vh, 260px);
    background: linear-gradient(180deg, rgba(248, 250, 252, 0), var(--bg-surface));
    pointer-events: none;
  }

  .blog-ambient {
    position: absolute;
    inset: -45%;
    background:
      radial-gradient(circle at 18% 22%, rgba(14, 165, 233, 0.23), transparent 30%),
      radial-gradient(circle at 82% 18%, rgba(168, 85, 247, 0.19), transparent 30%),
      radial-gradient(circle at 56% 72%, rgba(251, 191, 36, 0.1), transparent 34%);
    filter: blur(54px);
    opacity: 0.92;
    animation: ambientDrift 24s ease-in-out infinite;
  }

  .blog-hero-shell {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .hero-eyebrow,
  .section-kicker,
  .article-meta {
    color: #0071e3;
    font-size: 0.72rem;
    font-weight: 850;
    letter-spacing: 0.14em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .hero-eyebrow {
    margin: 0 0 0.9rem;
    color: #64748b;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  h1 {
    max-width: 10ch;
    margin: 0 auto;
    color: #0f172a;
    font-size: clamp(3rem, 7vw, 6.8rem);
    font-weight: 850;
    letter-spacing: -0.058em;
    line-height: 0.88;
    text-wrap: balance;
  }

  .hero-lead {
    max-width: 620px;
    margin: 1.15rem auto 0;
    color: #111827;
    font-size: clamp(1rem, 2vw, 1.2rem);
    font-weight: 560;
    line-height: 1.55;
    text-wrap: pretty;
  }

  .blog-feed {
    padding: clamp(1rem, 2vw, 2rem) 0 clamp(3.5rem, 8vw, 6rem);
  }

  .filter-row {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.65rem;
    margin: -3.1rem auto 2rem;
  }

  .filter-row button {
    min-height: 36px;
    padding: 0 1rem;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: #111827;
    cursor: pointer;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 720;
    transition:
      transform 240ms cubic-bezier(0.16, 1, 0.3, 1),
      background-color 240ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 240ms cubic-bezier(0.16, 1, 0.3, 1),
      color 240ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .filter-row button:hover,
  .filter-row button:focus-visible,
  .filter-row button.active {
    transform: translateY(-1px);
    border-color: rgba(0, 113, 227, 0.22);
    background: #0071e3;
    color: #ffffff;
    box-shadow: 0 14px 32px rgba(0, 113, 227, 0.22);
    outline: none;
  }

  .feed-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .feed-head h2 {
    margin-top: 0.45rem;
    color: #101114;
    font-size: clamp(2rem, 4.8vw, 4.2rem);
    font-weight: 850;
    letter-spacing: -0.052em;
    line-height: 0.96;
  }

  .feed-head > span {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 760;
    text-decoration: none;
  }

  .article-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .article-card {
    display: flex;
    min-width: 0;
    min-height: 100%;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86)),
      #ffffff;
    color: inherit;
    text-decoration: none;
    box-shadow:
      0 20px 50px rgba(15, 23, 42, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.82) inset;
    isolation: isolate;
    transition:
      transform 420ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 420ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .article-card:hover,
  .article-card:focus-visible {
    transform: translateY(-7px);
    border-color: rgba(0, 113, 227, 0.34);
    box-shadow: 0 30px 78px rgba(15, 23, 42, 0.15);
    outline: none;
  }

  .article-media {
    aspect-ratio: 16 / 10;
    overflow: hidden;
    margin: 0.55rem 0.55rem 0;
    border-radius: 6px;
    background: #e9edf5;
  }

  .article-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.01);
    transition: transform 640ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .article-card:hover .article-media img,
  .article-card:focus-visible .article-media img {
    transform: scale(1.06);
  }

  .article-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 1rem 1rem 0.85rem;
  }

  .article-copy h3 {
    margin-top: 0.52rem;
    color: #101114;
    font-size: clamp(1.08rem, 2vw, 1.42rem);
    font-weight: 850;
    letter-spacing: -0.035em;
    line-height: 1.08;
  }

  .article-copy p {
    display: -webkit-box;
    margin-top: 0.62rem;
    overflow: hidden;
    color: #4a4f5c;
    font-size: 0.93rem;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .read-more {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: auto;
    padding-top: 1rem;
    color: #0066e5;
    font-size: 0.88rem;
    font-weight: 850;
  }

  .read-more span {
    transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .article-card:hover .read-more span,
  .article-card:focus-visible .read-more span {
    transform: translateX(4px);
  }

  .article-card footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.78rem 1rem;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    color: #64748b;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 650;
  }

  .editorial-strip {
    padding: 0 0 clamp(4rem, 8vw, 6.5rem);
  }

  .editorial-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .editorial-grid a {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    gap: 0.35rem 0.9rem;
    align-items: center;
    min-width: 0;
    padding: 0.72rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.76);
    color: inherit;
    text-decoration: none;
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
    transition:
      transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 260ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .editorial-grid a:hover,
  .editorial-grid a:focus-visible {
    transform: translateY(-3px);
    border-color: rgba(0, 113, 227, 0.28);
    outline: none;
  }

  .editorial-grid img {
    grid-row: 1 / 3;
    width: 108px;
    aspect-ratio: 1 / 0.78;
    object-fit: cover;
    border-radius: 6px;
    background: #e9edf5;
  }

  .editorial-grid span {
    color: #0071e3;
    font-size: 0.68rem;
    font-weight: 850;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .editorial-grid strong {
    color: #101114;
    font-size: 1rem;
    font-weight: 820;
    letter-spacing: -0.025em;
    line-height: 1.15;
  }

  @keyframes ambientDrift {
    0%,
    100% {
      transform: translate3d(-2%, -1%, 0) rotate(0deg) scale(1);
    }

    50% {
      transform: translate3d(2%, 1%, 0) rotate(8deg) scale(1.06);
    }
  }

  :global(html.dark) .blog-hero {
    background:
      radial-gradient(circle at 16% 18%, rgba(0, 113, 227, 0.18), transparent 32rem),
      radial-gradient(circle at 82% 14%, rgba(139, 156, 255, 0.14), transparent 28rem),
      linear-gradient(180deg, #0a0a0a 0%, #0b0b0b 100%);
  }

  :global(html.dark) h1,
  :global(html.dark) .feed-head h2,
  :global(html.dark) .article-copy h3,
  :global(html.dark) .editorial-grid strong {
    color: #f8fafc;
  }

  :global(html.dark) .hero-eyebrow,
  :global(html.dark) .hero-lead,
  :global(html.dark) .article-copy p,
  :global(html.dark) .feed-head > span {
    color: #d4d4d8;
  }

  :global(html.dark) .filter-row button {
    color: #f4f4f5;
  }

  :global(html.dark) .article-card,
  :global(html.dark) .editorial-grid a {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.86);
    box-shadow: 0 20px 54px rgba(0, 0, 0, 0.26);
  }

  @media (max-width: 980px) {
    .article-grid,
    .editorial-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 680px) {
    .blog-shell {
      width: min(100% - 1.25rem, 1120px);
    }

    .blog-hero {
      min-height: 560px;
      padding-top: 6.5rem;
    }

    h1 {
      font-size: clamp(3rem, 16vw, 4.6rem);
    }

    .filter-row {
      justify-content: flex-start;
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 0.35rem;
    }

    .filter-row button {
      flex: 0 0 auto;
    }

    .feed-head {
      align-items: start;
      flex-direction: column;
    }

    .article-grid,
    .editorial-grid {
      grid-template-columns: 1fr;
    }

    .editorial-grid a {
      grid-template-columns: 96px minmax(0, 1fr);
    }

    .editorial-grid img {
      width: 96px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .blog-ambient,
    .article-card,
    .article-media img,
    .read-more span,
    .editorial-grid a,
    .filter-row button {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
