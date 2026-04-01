<script lang="ts">
  import '$lib/styles/alcoy-landing-fonts.css';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const article = $derived(data.article);
  const relatedArticles = $derived(
    (data.relatedArticles ?? [])
      .filter((item) => item.slug !== article.slug)
      .slice(0, 3)
  );
  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const landingBasePath = $derived(
    (() => {
      const rawBasePath = (data as PageData & { basePath?: string }).basePath;
      return rawBasePath && rawBasePath.startsWith('/') ? rawBasePath : '/diseno-web-alcoy';
    })()
  );
  const canonical = $derived(`${baseUrl}${landingBasePath}/${article.slug}`);
  const seoTitle = $derived(article.seoTitle?.trim() || article.title);
  const seoDescription = $derived(article.seoDescription?.trim() || article.excerpt);
  const ogImage = $derived(
    article.coverImageSrc.startsWith('http') ? article.coverImageSrc : `${baseUrl}${article.coverImageSrc}`
  );
  const publicationDate = $derived(
    new Date(article.publishedAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  );
  const articleJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: seoDescription,
      datePublished: article.publishedAt,
      author: {
        '@type': 'Person',
        name: 'Moises Valero'
      },
      publisher: {
        '@type': 'Person',
        name: 'Moises Valero'
      },
      image: [ogImage],
      mainEntityOfPage: canonical
    })
  );
  const breadcrumbJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Diseno web', item: `${baseUrl}${landingBasePath}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
      ]
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
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Moises Valero" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={ogImage} />
  <JsonLdScript json={articleJsonLd} />
  <JsonLdScript json={breadcrumbJsonLd} />
</svelte:head>

<article class="support-article">
  <header class="hero">
    <div class="hero-inner">
      <p class="eyebrow">{article.categoryLabel} · Alcoy / SEO local</p>
      <h1>{article.title}</h1>
      <p class="lead">{article.excerpt}</p>
      <div class="meta">
        <span>{publicationDate}</span>
        <span>·</span>
        <span>{article.readingMinutes} min</span>
      </div>
      <a class="back-link" href={`${landingBasePath}/articulos`}>← Volver a articulos</a>
    </div>
  </header>

  <section class="content-wrap">
    <img class="cover" src={article.coverImageSrc} alt={article.coverImageAlt} loading="eager" />
    <div class="content prose">{@html article.bodyHtml}</div>
  </section>

  <section class="cta-box">
    <h2>{article.ctaTitle}</h2>
    <p>{article.ctaText}</p>
    <div class="cta-actions">
      <a href={article.ctaPrimaryHref} class="btn btn-primary">
        {article.ctaPrimaryLabel}
      </a>
      <a href={article.ctaSecondaryHref} class="btn btn-secondary">
        {article.ctaSecondaryLabel}
      </a>
    </div>
  </section>

  {#if relatedArticles.length}
    <section class="related-section">
      <div class="related-shell">
        <div class="related-head">
          <p class="eyebrow eyebrow--green">Siguiente lectura</p>
          <h2>Articulos relacionados para seguir mejorando el SEO local</h2>
          <p>
            Estos contenidos te ayudan a ordenar mejor la web y a crear caminos claros para que Google entienda
            de qué va cada página.
          </p>
        </div>

        <div class="related-grid">
          {#each relatedArticles as related, idx (related.slug)}
            <a class="related-card group" href={`${landingBasePath}/${related.slug}`}>
              <span class="related-topline">
                <span>{related.categoryLabel}</span>
                <span>·</span>
                <span>{formatArticleDate(related.publishedAt)}</span>
              </span>
              <h3>{related.title}</h3>
              <p>{related.excerpt}</p>
              <span class="related-link">
                Leer ahora
                <span
                  class="material-symbols-outlined text-base transition-transform duration-300 ease-out group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </span>
            </a>
          {/each}
        </div>
      </div>
    </section>
  {/if}

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
</article>

<style>
  :global(body) {
    background: #f8fafc;
  }

  .support-article {
    color: #0f172a;
    font-family: var(--font-sans);
  }

  .hero {
    position: relative;
    overflow: hidden;
    padding: clamp(5.8rem, 8vw, 7rem) 1.2rem 2.2rem;
    background: radial-gradient(circle at 18% 18%, rgba(15, 76, 129, 0.18), transparent 34%),
      radial-gradient(circle at 82% 12%, rgba(0, 108, 73, 0.18), transparent 38%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid #e2e8f0;
  }

  .hero-inner {
    max-width: 860px;
    margin: 0 auto;
  }

  .eyebrow {
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #006c49;
    font-weight: 700;
    font-size: 0.76rem;
    margin-bottom: 0.8rem;
  }

  .eyebrow--green {
    color: #006c49;
  }

  h1 {
    font-size: clamp(1.9rem, 4.5vw, 3rem);
    line-height: 1.1;
    margin-bottom: 0.9rem;
    color: #0f172a;
  }

  .lead {
    color: #334155;
    font-size: clamp(1.02rem, 2.2vw, 1.16rem);
    line-height: 1.62;
    max-width: 72ch;
  }

  .meta {
    margin-top: 1rem;
    display: inline-flex;
    gap: 0.45rem;
    color: #006c49;
    font-weight: 500;
    font-size: 0.92rem;
    background: rgba(0, 108, 73, 0.08);
    border: 1px solid rgba(0, 108, 73, 0.12);
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
  }

  .back-link {
    margin-top: 1.25rem;
    margin-left: 0.35rem;
    display: inline-flex;
    color: #006c49;
    text-decoration: none;
    border-bottom: 1px solid rgba(0, 108, 73, 0.28);
    font-weight: 600;
  }

  .content-wrap {
    max-width: 860px;
    margin: 2rem auto 0;
    padding: 0 1.2rem;
  }

  .cover {
    width: 100%;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 20px 50px rgba(2, 6, 23, 0.08);
    object-fit: cover;
    max-height: 430px;
    margin-bottom: 1.8rem;
    background: #fff;
  }

  .content {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    border-radius: 1rem;
    padding: clamp(1.1rem, 2.1vw, 2rem);
    box-shadow: 0 14px 38px rgba(15, 23, 42, 0.06);
  }

  .prose :global(h2) {
    color: #0f172a;
    font-size: clamp(1.2rem, 2.4vw, 1.5rem);
    margin: 1.2rem 0 0.7rem;
    line-height: 1.35;
  }

  .prose :global(p) {
    color: #334155;
    line-height: 1.72;
    margin: 0.75rem 0;
  }

  .prose :global(ul) {
    margin: 0.65rem 0 1rem;
    padding-left: 1.15rem;
    color: #334155;
    line-height: 1.65;
  }

  .prose :global(li) {
    margin: 0.3rem 0;
  }

  .cta-box {
    max-width: 860px;
    margin: 1.6rem auto 3rem;
    padding: 1.3rem 1.2rem 0;
  }

  .cta-box h2 {
    font-size: clamp(1.2rem, 2.6vw, 1.55rem);
    color: #0f172a;
    margin-bottom: 0.6rem;
  }

  .cta-box p {
    color: #475569;
    line-height: 1.62;
  }

  .cta-actions {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.62rem 1rem;
    border-radius: 0.75rem;
    text-decoration: none;
    font-weight: 600;
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
    background: #ffffff;
    color: #0f172a;
    border: 1px solid #cbd5e1;
  }

  .related-section {
    max-width: 860px;
    margin: 0 auto 3rem;
    padding: 0 1.2rem;
  }

  .related-shell {
    margin-top: 0.4rem;
    border-radius: 1.2rem;
    border: 1px solid rgba(0, 108, 73, 0.14);
    background:
      radial-gradient(circle at top right, rgba(0, 108, 73, 0.08), transparent 32%),
      #ffffff;
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
    padding: 1.25rem;
  }

  .related-head h2 {
    font-size: clamp(1.25rem, 2.4vw, 1.6rem);
    line-height: 1.2;
    margin: 0.2rem 0 0.55rem;
    color: #0f172a;
  }

  .related-head p {
    color: #475569;
    line-height: 1.65;
    max-width: 65ch;
  }

  .related-grid {
    margin-top: 1.1rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .related-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    border-radius: 1rem;
    border: 1px solid rgba(0, 108, 73, 0.14);
    background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    padding: 1rem;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }

  .related-card:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 108, 73, 0.3);
    box-shadow: 0 18px 32px rgba(15, 23, 42, 0.08);
  }

  .related-topline {
    display: inline-flex;
    gap: 0.35rem;
    font-size: 0.72rem;
    color: #006c49;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .related-card h3 {
    margin: 0.65rem 0 0.55rem;
    font-size: 1.08rem;
    line-height: 1.25;
    color: #0f172a;
    min-height: calc(1.25em * 2.4);
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .related-card p {
    color: #475569;
    line-height: 1.6;
    margin: 0;
    font-size: 0.95rem;
    flex: 1;
    min-height: calc(1.6em * 3);
  }

  .related-link {
    margin-top: auto;
    display: inline-flex;
    color: #006c49;
    font-weight: 700;
  }

  .simple-footer {
    max-width: 860px;
    margin: 0 auto 3rem;
    padding: 0 1.2rem;
  }

  .simple-footer-inner {
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

  @media (max-width: 768px) {
    .hero {
      padding-top: max(5.8rem, calc(env(safe-area-inset-top, 0px) + 4.8rem));
    }

    .hero-inner {
      max-width: 100%;
    }

    .meta {
      width: 100%;
      justify-content: center;
    }

    .lead {
      max-width: 100%;
    }

    .back-link {
      margin-left: 0.2rem;
    }

    .cta-actions {
      flex-direction: column;
    }

    .cta-actions .btn {
      width: 100%;
    }

    .related-shell {
      padding: 1rem;
    }

    .related-head p {
      max-width: 100%;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }

    .related-card {
      padding: 0.95rem;
    }

    .related-card h3 {
      min-height: auto;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }

    .related-card p {
      min-height: auto;
    }

    .simple-footer {
      margin-bottom: 2.2rem;
    }

    .simple-footer-inner {
      text-align: center;
      padding-inline: 0.2rem;
    }
  }
</style>
