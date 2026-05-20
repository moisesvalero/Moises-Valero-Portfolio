<script lang="ts">
  import { resolve } from '$app/paths';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const articles = $derived(data.articles ?? []);
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
      <p class="eyebrow">Blog</p>
      <h1>Guias y notas tecnicas</h1>
      <p class="lead">
        Apuntes sobre desarrollo web, rendimiento, seguridad, SEO tecnico y arquitectura de contenido.
      </p>
      <div class="blog-actions">
        <a class="btn-apple-blue" href={resolve('/#proyectos')}>Ver proyectos</a>
        <a class="btn-ghost-slim" href={resolve('/#contacto')}>Contacto</a>
      </div>
    </div>
  </section>

  <section class="article-list" aria-labelledby="blog-list-title">
    <div class="blog-shell">
      <div class="list-head">
        <h2 id="blog-list-title">Articulos publicados</h2>
        <span>{articles.length} articulo{articles.length === 1 ? '' : 's'}</span>
      </div>

      <div class="grid">
        {#each articles as article, idx (article.slug)}
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
    padding: clamp(7rem, 12vw, 10rem) 0 3rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background:
      radial-gradient(circle at 18% 18%, rgba(0, 113, 227, 0.14), transparent 34%),
      radial-gradient(circle at 82% 12%, rgba(124, 92, 191, 0.1), transparent 32%),
      linear-gradient(180deg, var(--bg-main) 0%, var(--bg-surface) 100%);
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
    max-width: 14ch;
    margin: 0;
    font-size: clamp(2.4rem, 7vw, 5.8rem);
    line-height: 0.95;
    letter-spacing: 0;
  }

  .lead {
    max-width: 68ch;
    margin: 1.1rem 0 0;
    color: var(--text-secondary);
    font-size: clamp(1rem, 2vw, 1.16rem);
    line-height: 1.7;
  }

  .blog-actions {
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

  .article-list {
    padding: clamp(2rem, 5vw, 4rem) 0 5rem;
  }

  .list-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }

  .list-head h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
  }

  .list-head span {
    color: var(--text-secondary);
    font-weight: 700;
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
      radial-gradient(circle at 82% 10%, rgba(167, 243, 255, 0.08), transparent 32%),
      linear-gradient(180deg, #0a0a0a 0%, #0b0b0b 100%);
  }

  :global(html.dark) .article-card {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.86);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .article-card:hover {
    border-color: rgba(255, 255, 255, 0.28);
    background: rgba(24, 24, 27, 0.96);
    box-shadow:
      0 26px 68px rgba(0, 0, 0, 0.42),
      0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  }

  :global(html.dark) .media {
    background: #111111;
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

  @media (max-width: 980px) {
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

    .blog-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .list-head {
      align-items: start;
      flex-direction: column;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
