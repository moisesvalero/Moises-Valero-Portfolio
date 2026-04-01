<script lang="ts">
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const landingBasePath = $derived(
    (() => {
      const rawBasePath = (data as PageData & { basePath?: string }).basePath;
      return rawBasePath && rawBasePath.startsWith('/') ? rawBasePath : '/diseno-web-alcoy';
    })()
  );
  const canonical = $derived(`${baseUrl}${landingBasePath}/articulos`);
  const articles = $derived(data.articles ?? []);
  const pageJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Articulos de apoyo SEO local en Alcoy',
      description:
        'Articulos practicos para mejorar velocidad, seguridad y SEO local de webs en Alcoy.',
      url: canonical,
      inLanguage: 'es'
    })
  );
  const listJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: article.title,
        url: `${baseUrl}${landingBasePath}/${article.slug}`
      }))
    })
  );

  function formatArticleDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
</script>

<svelte:head>
  <title>Articulos de apoyo SEO local en Alcoy | Moisés Valero</title>
  <meta
    name="description"
    content="Articulos de apoyo sobre mantenimiento web, seguridad y SEO local para negocios de Alcoy."
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Articulos SEO local en Alcoy | Moisés Valero" />
  <meta
    property="og:description"
    content="Guías prácticas para mejorar velocidad, seguridad y posicionamiento local en Alcoy."
  />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${baseUrl}/og-image.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={pageJsonLd} />
  <JsonLdScript json={listJsonLd} />
</svelte:head>

<main class="articles-index">
  <section class="hero">
    <div class="hero-inner">
      <p class="eyebrow">Articulos SEO local</p>
      <h1>Ideas practicas para posicionar mejor en Alcoy</h1>
      <p class="lead">
        Una colección de guías cortas sobre mantenimiento, seguridad, velocidad y SEO local para que Google
        entienda mejor tu sitio y tus clientes encuentren respuestas utiles.
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href={landingBasePath}>Ver la web</a>
        <a class="btn btn-secondary" href="#listado">Ver articulos</a>
      </div>
    </div>
  </section>

  <section class="list-section" id="listado">
    <div class="list-shell">
      <div class="list-meta">
        <span>{articles.length} articulo{articles.length === 1 ? '' : 's'} publicado{articles.length === 1 ? '' : 's'}</span>
      </div>
      <div class="grid">
        {#each articles as article, idx (article.slug)}
          <a class="card group" href={`${landingBasePath}/${article.slug}`}>
            <div class="card-media">
              <img
                src={article.coverImageSrc}
                alt={article.coverImageAlt}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span class="pill">{article.categoryLabel}</span>
            </div>
            <div class="card-body">
              <div class="card-topline">
                <span>{formatArticleDate(article.publishedAt)}</span>
                <span>·</span>
                <span>{article.readingMinutes} min</span>
              </div>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <span class="more">
                Leer articulo
                <span
                  class="material-symbols-outlined text-base transition-transform duration-300 ease-out group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </span>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <footer class="simple-footer" aria-label="Pie de página">
    <div class="simple-footer-inner">
      <div class="simple-footer-author">
        <span>© 2026</span>
        <span>·</span>
        <span>Desarrollado por</span>
        <a
          class="simple-footer-name"
          href="https://moisesvalero.es"
          target="_blank"
          rel="noopener noreferrer"
        >
          Moisés Valero
        </a>
      </div>
      <nav class="simple-footer-legal" aria-label="Enlaces legales">
        <a href="/privacidad">Privacidad</a>
        <span aria-hidden="true">·</span>
        <a href="/cookies">Cookies</a>
      </nav>
    </div>
  </footer>
</main>

<style>
  :global(body) {
    background: #f8fafc;
  }

  .articles-index {
    color: #0f172a;
    font-family: var(--font-sans);
  }

  .hero {
    padding: clamp(6rem, 8vw, 8rem) 1.2rem 3rem;
    background: radial-gradient(circle at 18% 18%, rgba(15, 76, 129, 0.12), transparent 34%),
      radial-gradient(circle at 82% 12%, rgba(0, 108, 73, 0.16), transparent 38%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid #e2e8f0;
  }

  .hero-inner,
  .list-shell {
    max-width: 1180px;
    margin: 0 auto;
  }

  .eyebrow {
    color: #006c49;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.13em;
    font-size: 0.76rem;
    margin-bottom: 0.8rem;
  }

  h1 {
    font-size: clamp(2.1rem, 5vw, 3.6rem);
    line-height: 1.05;
    max-width: 16ch;
    margin: 0;
  }

  .lead {
    margin-top: 1rem;
    max-width: 72ch;
    color: #334155;
    line-height: 1.7;
    font-size: clamp(1rem, 2vw, 1.12rem);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.4rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.7rem 1.05rem;
    border-radius: 0.8rem;
    text-decoration: none;
    font-weight: 700;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
  }

  .btn-primary {
    background: #006c49;
    color: #fff;
    box-shadow: 0 10px 24px rgba(0, 108, 73, 0.22);
  }

  .btn-primary:hover {
    background: #0a8459;
  }

  .btn-secondary {
    background: #fff;
    color: #0f172a;
    border: 1px solid #cbd5e1;
  }

  .btn-secondary:hover {
    border-color: rgba(0, 108, 73, 0.35);
    color: #006c49;
  }

  .list-section {
    padding: 2rem 1.2rem 4rem;
  }

  .simple-footer {
    padding: 0 1.2rem 2.4rem;
  }

  .simple-footer-inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 1rem 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    align-items: center;
    justify-content: center;
    border-top: 1px solid rgba(0, 108, 73, 0.14);
    color: #64748b;
    font-size: 0.88rem;
  }

  .simple-footer-author,
  .simple-footer-legal {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .simple-footer-inner a {
    color: #006c49;
    font-weight: 700;
    text-decoration: none;
  }

  .simple-footer-author .simple-footer-name {
    color: #0f172a !important;
    font-weight: 500 !important;
    transition: color 0.2s ease;
  }

  .simple-footer-author .simple-footer-name:hover {
    color: #006c49 !important;
    text-decoration: underline;
  }

  .simple-footer-legal {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
  }

  .simple-footer-inner a:hover {
    text-decoration: underline;
  }

  .list-meta {
    margin-bottom: 1.25rem;
    color: #006c49;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    align-items: stretch;
  }

  .card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
    border-radius: 1.2rem;
    overflow: hidden;
    background: #fff;
    border: 1px solid rgba(0, 108, 73, 0.14);
    text-decoration: none;
    color: inherit;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
    transition: transform 0.28s ease, box-shadow 0.28s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 48px rgba(15, 23, 42, 0.1);
  }

  .card-media {
    position: relative;
    aspect-ratio: 16 / 10;
    flex: 0 0 auto;
  }

  .card-media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .pill {
    position: absolute;
    left: 1rem;
    top: 1rem;
    background: rgba(255, 255, 255, 0.92);
    color: #006c49;
    border-radius: 999px;
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  }

  .card-body {
    padding: 1.35rem 1.4rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .card-topline {
    display: inline-flex;
    gap: 0.45rem;
    color: #006c49;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    font-weight: 700;
    margin-bottom: 0.8rem;
  }

  .card-body h2 {
    font-size: clamp(1.25rem, 2.4vw, 1.65rem);
    line-height: 1.2;
    margin: 0 0 0.75rem;
    min-height: calc(1.2em * 2.6);
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-body p {
    margin: 0;
    color: #475569;
    line-height: 1.7;
    flex: 1;
    min-height: calc(1.7em * 3.15);
  }

  .more {
    margin-top: 1.1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: #006c49;
    font-weight: 700;
  }

  @media (min-width: 900px) and (max-width: 1199px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .hero {
      padding-top: max(6rem, calc(env(safe-area-inset-top, 0px) + 5rem));
    }

    .hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .hero-actions .btn {
      width: 100%;
    }

    .card {
      flex-direction: column;
    }

    .card-media {
      aspect-ratio: 16 / 9;
    }

    .card-body {
      padding: 1.1rem 1rem 1rem;
    }

    .card-body h2 {
      min-height: auto;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }

    .card-body p {
      min-height: auto;
    }

    .simple-footer-inner {
      text-align: center;
      padding-inline: 0.2rem;
    }
  }

  @media (max-width: 540px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
