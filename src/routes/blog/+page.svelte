<script lang="ts">
  import { resolve } from '$app/paths';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const articles = $derived(data.articles ?? []);
  const featuredArticles = $derived(
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
  const featuredSlugs = $derived(new Set(featuredArticles.map((article) => article.slug)));
  const latestArticles = $derived(
    articles.filter((article) => !featuredSlugs.has(article.slug)).length
      ? articles.filter((article) => !featuredSlugs.has(article.slug))
      : articles.slice(featuredArticles.length)
  );
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
  <title>Blog tecnico | Moises Valero</title>
  <meta
    name="description"
    content="Articulos tecnicos de Moises Valero sobre desarrollo web, rendimiento, seguridad, SEO tecnico y arquitectura de contenido."
  />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Blog tecnico | Moises Valero" />
  <meta
    property="og:description"
    content="Guias y notas practicas sobre desarrollo web, rendimiento, seguridad y SEO tecnico."
  />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${baseUrl}/og-image.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={listJsonLd} />
</svelte:head>

<main class="blog-index">
  <section class="blog-hero">
    <div class="blog-shell">
      <a class="back-home" href={resolve('/#top')}>Portfolio</a>
      <div class="hero-layout">
        <div>
          <p class="eyebrow">Blog</p>
          <h1>Guías de desarrollo web</h1>
          <p class="lead">
            Recursos prácticos sobre desarrollo web, rendimiento, seguridad, SEO técnico e IA aplicada a proyectos reales.
          </p>
        </div>
        <aside class="blog-brief" aria-label="Guía de lectura del blog">
          <span>Guía de lectura</span>
          <strong>Qué leer primero</strong>
          <p>
            Empieza por una guía recomendada o baja al archivo si buscas un tema concreto.
          </p>
          <div class="brief-tags" aria-label="Temas principales">
            <span>Rendimiento</span>
            <span>SEO técnico + IA</span>
            <span>Seguridad</span>
          </div>
        </aside>
      </div>
    </div>
  </section>

  {#if featuredArticles.length}
    <section class="featured-section" aria-labelledby="featured-title">
      <div class="blog-shell">
        <div class="section-head">
          <div>
            <p class="eyebrow">Selección editorial</p>
            <h2 id="featured-title">Guías recomendadas</h2>
          </div>
          <span>Empieza por aquí</span>
        </div>

        <div class="featured-layout">
          <a class="featured-main" href={resolve(`/blog/${featuredArticles[0].slug}`)}>
            <div class="featured-media">
              <img
                src={featuredArticles[0].coverImageSrc}
                alt={featuredArticles[0].coverImageAlt}
                loading="eager"
                decoding="async"
              />
            </div>
            <div class="featured-copy">
              <span class="topline">
                {featuredArticles[0].categoryLabel} · {formatArticleDate(featuredArticles[0].publishedAt)} · {featuredArticles[0].readingMinutes} min
              </span>
              <h3>{featuredArticles[0].title}</h3>
              <p>{featuredArticles[0].excerpt}</p>
              <span class="read-more">
                Leer guía
                <span class="read-more-arrow" aria-hidden="true"></span>
              </span>
            </div>
          </a>

          {#if featuredArticles.length > 1}
            <div class="featured-side">
              {#each featuredArticles.slice(1) as article (article.slug)}
                <a class="featured-side-item" href={resolve(`/blog/${article.slug}`)}>
                  <img src={article.coverImageSrc} alt={article.coverImageAlt} loading="lazy" decoding="async" />
                  <div>
                    <span class="topline">
                      {article.categoryLabel} · {article.readingMinutes} min
                    </span>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <section class="article-list" aria-labelledby="blog-list-title">
    <div class="blog-shell">
      <div class="section-head section-head--compact">
        <div>
          <p class="eyebrow">Archivo</p>
          <h2 id="blog-list-title">Últimos artículos</h2>
        </div>
        <span>{latestArticles.length} artículo{latestArticles.length === 1 ? '' : 's'}</span>
      </div>

      <div class="grid">
        {#each latestArticles as article, idx (article.slug)}
          <a class="article-card" href={resolve(`/blog/${article.slug}`)}>
            <div class="media">
              <img
                src={article.coverImageSrc}
                alt={article.coverImageAlt}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
            <div class="card-body">
              <span class="topline">
                {article.categoryLabel} · {formatArticleDate(article.publishedAt)} · {article.readingMinutes} min
              </span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <span class="read-more">
                Leer articulo
                <span class="read-more-arrow" aria-hidden="true"></span>
              </span>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </section>
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
    padding: clamp(7rem, 12vw, 9.5rem) 0 clamp(2.8rem, 6vw, 4.5rem);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background:
      linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px) 0 0 / 76px 76px,
      radial-gradient(circle at 18% 18%, rgba(0, 113, 227, 0.13), transparent 34%),
      radial-gradient(circle at 82% 12%, rgba(20, 184, 166, 0.1), transparent 32%),
      linear-gradient(180deg, var(--bg-main) 0%, var(--bg-surface) 100%);
  }

  .hero-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
    gap: clamp(2rem, 7vw, 5rem);
    align-items: end;
  }

  .back-home {
    display: inline-flex;
    margin-bottom: 1.4rem;
    color: #0071e3;
    font-weight: 700;
    text-decoration: none;
  }

  .eyebrow,
  .topline {
    margin: 0 0 0.75rem;
    color: #0071e3;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 11.5ch;
    margin: 0;
    font-size: clamp(2.45rem, 6.4vw, 5.35rem);
    line-height: 0.98;
    letter-spacing: 0;
  }

  .lead {
    max-width: 68ch;
    margin: 1.1rem 0 0;
    color: var(--text-secondary);
    font-size: clamp(1rem, 2vw, 1.16rem);
    line-height: 1.7;
  }

  .blog-brief {
    border-left: 1px solid rgba(15, 23, 42, 0.1);
    padding-left: clamp(1rem, 3vw, 1.35rem);
  }

  .blog-brief > span {
    display: block;
    color: #0071e3;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .blog-brief strong {
    display: block;
    margin-top: 0.4rem;
    color: var(--text-main);
    font-size: clamp(1.2rem, 1.8vw, 1.48rem);
    line-height: 1.16;
  }

  .blog-brief p {
    max-width: 34ch;
    margin: 0.75rem 0 0;
    color: var(--text-secondary);
    line-height: 1.58;
  }

  .brief-tags {
    margin: 1rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .brief-tags span {
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 999px;
    padding: 0.38rem 0.62rem;
    color: #334155;
    background: rgba(255, 255, 255, 0.66);
    font-size: 0.78rem;
    font-weight: 750;
  }

  .featured-section {
    padding: clamp(2rem, 5vw, 4rem) 0 0;
  }

  .article-list {
    padding: clamp(2.2rem, 5vw, 4rem) 0 5rem;
  }

  .section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.15rem;
  }

  .section-head h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
  }

  .section-head > span {
    color: var(--text-secondary);
    font-weight: 700;
  }

  .section-head--compact {
    padding-top: 1.3rem;
    border-top: 1px solid rgba(15, 23, 42, 0.1);
  }

  .featured-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.24fr) minmax(300px, 0.76fr);
    gap: 1rem;
  }

  .featured-main,
  .featured-side-item {
    min-width: 0;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    color: inherit;
    text-decoration: none;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
    transition:
      transform 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease,
      background-color 0.25s ease;
  }

  .featured-main:hover,
  .featured-side-item:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 113, 227, 0.26);
    box-shadow: 0 24px 58px rgba(15, 23, 42, 0.1);
  }

  .featured-main {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(280px, 1fr);
    overflow: hidden;
  }

  .featured-media {
    min-height: 100%;
    overflow: hidden;
    background: #e9edf5;
  }

  .featured-media img,
  .featured-side-item img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  .featured-main:hover .featured-media img,
  .featured-side-item:hover img {
    transform: scale(1.03);
  }

  .featured-copy {
    display: flex;
    flex-direction: column;
    padding: clamp(1.2rem, 3vw, 1.65rem);
  }

  .featured-copy h3 {
    margin: 0 0 0.85rem;
    font-size: clamp(1.55rem, 3vw, 2.2rem);
    line-height: 1.05;
  }

  .featured-copy p,
  .featured-side-item p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.62;
  }

  .featured-side {
    display: grid;
    gap: 1rem;
  }

  .featured-side-item {
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    gap: 1rem;
    padding: 0.75rem;
  }

  .featured-side-item img {
    aspect-ratio: 1 / 1;
    border-radius: 6px;
    background: #e9edf5;
  }

  .featured-side-item h3 {
    margin: 0 0 0.45rem;
    font-size: 1.08rem;
    line-height: 1.18;
  }

  .featured-side-item p {
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 0.92rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .article-card {
    display: flex;
    min-width: 0;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.88);
    color: inherit;
    text-decoration: none;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
  }

  .article-card:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 113, 227, 0.24);
    box-shadow: 0 24px 54px rgba(15, 23, 42, 0.1);
  }

  .media {
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #e9edf5;
  }

  .media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  .article-card:hover .media img {
    transform: scale(1.03);
  }

  .card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 1.2rem;
  }

  .card-body h3 {
    margin: 0 0 0.75rem;
    font-size: clamp(1.15rem, 2vw, 1.45rem);
    line-height: 1.18;
  }

  .card-body p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.65;
  }

  .read-more {
    margin-top: auto;
    padding-top: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: #0071e3;
    font-weight: 800;
  }

  .read-more-arrow {
    width: 1rem;
    height: 1rem;
    display: inline-block;
    position: relative;
    transition: transform 0.24s ease;
  }

  .read-more-arrow::before {
    content: "";
    position: absolute;
    top: 50%;
    right: 0.1rem;
    width: 0.55rem;
    height: 0.55rem;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    transform: translateY(-50%) rotate(45deg);
  }

  .read-more-arrow::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0.1rem;
    width: 0.92rem;
    height: 2px;
    background: currentColor;
    transform: translateY(-50%);
  }

  .article-card:hover .read-more-arrow {
    transform: translateX(3px);
  }

  :global(html.dark) .blog-hero {
    border-bottom-color: rgba(255, 255, 255, 0.12);
    background:
      radial-gradient(circle at 20% 12%, rgba(0, 113, 227, 0.16), transparent 34%),
      radial-gradient(circle at 82% 10%, rgba(20, 184, 166, 0.1), transparent 32%),
      linear-gradient(180deg, #0a0a0a 0%, #0b0b0b 100%);
  }

  :global(html.dark) .blog-brief {
    border-left-color: rgba(255, 255, 255, 0.16);
  }

  :global(html.dark) .brief-tags span {
    border-color: rgba(255, 255, 255, 0.12);
    color: #d4d4d8;
    background: rgba(255, 255, 255, 0.06);
  }

  :global(html.dark) .section-head--compact {
    border-top-color: rgba(255, 255, 255, 0.12);
  }

  :global(html.dark) .article-card,
  :global(html.dark) .featured-main,
  :global(html.dark) .featured-side-item {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.86);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .article-card:hover,
  :global(html.dark) .featured-main:hover,
  :global(html.dark) .featured-side-item:hover {
    border-color: rgba(255, 255, 255, 0.28);
    background: rgba(24, 24, 27, 0.96);
    box-shadow:
      0 26px 68px rgba(0, 0, 0, 0.42),
      0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  }

  :global(html.dark) .media,
  :global(html.dark) .featured-media,
  :global(html.dark) .featured-side-item img {
    background: #111111;
  }

  @media (max-width: 980px) {
    .hero-layout,
    .featured-layout,
    .featured-main {
      grid-template-columns: 1fr;
    }

    .blog-brief {
      border-left: 0;
      border-top: 1px solid rgba(15, 23, 42, 0.1);
      padding: 1.1rem 0 0;
    }

    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .blog-shell {
      width: min(100% - 1.25rem, 1120px);
    }

    .blog-hero {
      padding-top: 6.5rem;
    }

    .section-head {
      align-items: start;
      flex-direction: column;
    }

    .featured-side-item {
      grid-template-columns: 98px minmax(0, 1fr);
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
