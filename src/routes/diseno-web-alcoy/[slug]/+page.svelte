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
  /** Si el artículo se sirve también bajo /diseno-web/..., la URL canónica es la de Alcoy. */
  const seoCanonicalBase = $derived(
    (() => {
      const raw = (data as PageData & { seoCanonicalBasePath?: string }).seoCanonicalBasePath;
      return typeof raw === 'string' && raw.startsWith('/') ? raw : landingBasePath;
    })()
  );
  const canonical = $derived(`${baseUrl}${seoCanonicalBase}/${article.slug}`);
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
        { '@type': 'ListItem', position: 2, name: 'Diseno web', item: `${baseUrl}${seoCanonicalBase}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonical }
      ]
    })
  );
  let articleContent: HTMLElement | undefined = $state();
  let lightboxCloseButton: HTMLButtonElement | undefined = $state();
  let lightboxImage: { src: string; alt: string } | null = $state(null);

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

  function shouldForceDocumentNavigation(href: string): boolean {
    return /^\/diseno-web(?:\/|$)/i.test(href.trim()) || /^\/diseno-web-alcoy(?:\/|$)/i.test(href.trim());
  }

  function openImageLightbox(image: HTMLImageElement): void {
    const src = image.currentSrc || image.src;
    if (!src) {
      return;
    }
    lightboxImage = {
      src,
      alt: image.alt || article.title
    };
  }

  function closeLightbox(): void {
    lightboxImage = null;
  }

  function handleWindowKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && lightboxImage) {
      closeLightbox();
    }
  }

  $effect(() => {
    article.bodyHtml;
    if (!articleContent) {
      return;
    }

    const controller = new AbortController();
    articleContent.querySelectorAll('img').forEach((image) => {
      image.setAttribute('role', 'button');
      image.setAttribute('tabindex', '0');
      image.setAttribute('aria-label', `Ampliar imagen: ${image.getAttribute('alt') || article.title}`);
      image.addEventListener('click', () => openImageLightbox(image), { signal: controller.signal });
      image.addEventListener(
        'keydown',
        (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openImageLightbox(image);
          }
        },
        { signal: controller.signal }
      );
    });

    return () => controller.abort();
  });

  $effect(() => {
    if (!lightboxImage || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => lightboxCloseButton?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });
</script>

<svelte:window onkeydown={handleWindowKeydown} />

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
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={ogImage} />
  <JsonLdScript json={articleJsonLd} />
  <JsonLdScript json={breadcrumbJsonLd} />
</svelte:head>

<article class="support-article">
  <header class="hero">
    <div class="hero-inner">
      <p class="eyebrow">{article.categoryLabel} · Lectura recomendada</p>
      <h1>{article.title}</h1>
      <p class="lead">{article.excerpt}</p>
      <div class="meta">
        <span>{publicationDate}</span>
        <span>·</span>
        <span>{article.readingMinutes} min</span>
      </div>
      <a class="back-link" href={`${seoCanonicalBase}/articulos`}>← Volver a articulos</a>
    </div>
  </header>

  <section class="content-wrap">
    <button
      type="button"
      class="cover-trigger"
      aria-label={`Ampliar imagen: ${article.coverImageAlt || article.title}`}
      onclick={(event) => {
        event.stopPropagation();
        const image = event.currentTarget.querySelector('img');
        if (image instanceof HTMLImageElement) {
          openImageLightbox(image);
        }
      }}
    >
      <img class="cover" src={article.coverImageSrc} alt={article.coverImageAlt} loading="eager" />
    </button>
    <div class="content prose" bind:this={articleContent}>{@html article.bodyHtml}</div>
  </section>

  <section class="cta-box">
    <h2>{article.ctaTitle}</h2>
    <p>{article.ctaText}</p>
    <div class="cta-actions">
      <a href={article.ctaPrimaryHref} class="btn btn-primary">
        {article.ctaPrimaryLabel}
      </a>
      <a
        href={article.ctaSecondaryHref}
        class="btn btn-secondary"
        data-sveltekit-reload={shouldForceDocumentNavigation(article.ctaSecondaryHref) ? 'true' : undefined}
      >
        {article.ctaSecondaryLabel}
      </a>
    </div>
  </section>

  {#if relatedArticles.length}
    <section class="related-section">
      <div class="related-shell">
        <div class="related-head">
          <p class="eyebrow eyebrow--green">Siguiente lectura</p>
          <h2>Articulos relacionados para seguir mejorando</h2>
          <p>
            Estos contenidos te ayudan a ordenar mejor la web y a crear caminos claros para que Google entienda
            de qué va cada página.
          </p>
        </div>

        <div class="related-grid">
          {#each relatedArticles as related, idx (related.slug)}
            <a class="related-card group" href={`${seoCanonicalBase}/${related.slug}`}>
              <div class="related-card-media">
                <img
                  src={related.coverImageSrc}
                  alt={related.coverImageAlt}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
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

{#if lightboxImage}
  <div
    class="image-lightbox"
    role="dialog"
    aria-modal="true"
    aria-label="Imagen ampliada"
    tabindex="-1"
  >
    <button
      type="button"
      class="image-lightbox-backdrop"
      aria-label="Cerrar imagen ampliada"
      onclick={closeLightbox}
    ></button>
    <div class="image-lightbox-panel">
      <button
        bind:this={lightboxCloseButton}
        type="button"
        class="image-lightbox-close"
        aria-label="Cerrar imagen ampliada"
        onclick={closeLightbox}
      >
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
      <img src={lightboxImage.src} alt={lightboxImage.alt} />
      {#if lightboxImage.alt}
        <p>{lightboxImage.alt}</p>
      {/if}
    </div>
  </div>
{/if}

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

  .cover-trigger {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;
    text-align: inherit;
  }

  .cover-trigger:focus-visible {
    outline: 3px solid rgba(0, 108, 73, 0.38);
    outline-offset: 4px;
    border-radius: 1rem;
  }

  .cover {
    display: block;
    width: 100%;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 20px 50px rgba(2, 6, 23, 0.08);
    object-fit: cover;
    max-height: 430px;
    margin-bottom: 1.8rem;
    background: #fff;
  }

  .cover,
  .prose :global(img) {
    transition: filter 0.25s ease, box-shadow 0.25s ease;
  }

  .cover-trigger:hover .cover,
  .cover-trigger:focus-visible .cover,
  .prose :global(img:hover),
  .prose :global(img:focus-visible) {
    filter: saturate(1.04) contrast(1.02);
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

  .prose :global(img) {
    cursor: zoom-in;
  }

  .prose :global(img:focus-visible) {
    outline: 3px solid rgba(0, 108, 73, 0.38);
    outline-offset: 4px;
    border-radius: 0.75rem;
  }

  .image-lightbox {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: grid;
    place-items: center;
    padding: clamp(1rem, 3vw, 2rem);
    isolation: isolate;
    animation: lightboxFade 0.18s ease-out;
  }

  .image-lightbox-backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    border: 0;
    background:
      radial-gradient(circle at 50% 0%, rgba(0, 108, 73, 0.22), transparent 38%),
      rgba(2, 6, 23, 0.78);
    backdrop-filter: blur(16px);
    cursor: zoom-out;
  }

  .image-lightbox-panel {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.8rem;
    width: min(1120px, 100%);
    max-height: min(86vh, 860px);
    padding: clamp(0.55rem, 1.5vw, 0.85rem);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 28px 80px rgba(2, 6, 23, 0.36);
    animation: lightboxRise 0.22s ease-out;
  }

  .image-lightbox-panel img {
    display: block;
    width: 100%;
    max-height: calc(86vh - 5.8rem);
    object-fit: contain;
    border-radius: 0.95rem;
    background: #ffffff;
  }

  .image-lightbox-panel p {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: 0.92rem;
    line-height: 1.45;
    text-align: center;
  }

  .image-lightbox-close {
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    z-index: 2;
    display: inline-flex;
    width: 2.75rem;
    height: 2.75rem;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.72);
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(2, 6, 23, 0.28);
    transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  }

  .image-lightbox-close:hover,
  .image-lightbox-close:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.85);
    background: rgba(15, 23, 42, 0.92);
  }

  .image-lightbox-close:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.45);
    outline-offset: 3px;
  }

  .image-lightbox-close :global(.material-symbols-outlined) {
    font-size: 1.35rem;
    line-height: 1;
  }

  @keyframes lightboxFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes lightboxRise {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
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

  .related-card-media {
    width: 100%;
    aspect-ratio: 16 / 8.5;
    border-radius: 0.72rem;
    overflow: hidden;
    border: 1px solid rgba(0, 108, 73, 0.14);
    background: #eef2f7;
    margin-bottom: 0.75rem;
  }

  .related-card-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .related-card:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 108, 73, 0.3);
    box-shadow: 0 18px 32px rgba(15, 23, 42, 0.08);
  }

  .related-card:hover .related-card-media img {
    transform: scale(1.03);
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

    .image-lightbox {
      padding: 0.75rem;
    }

    .image-lightbox-panel {
      border-radius: 1rem;
    }

    .image-lightbox-panel img {
      max-height: calc(88vh - 5.4rem);
      border-radius: 0.75rem;
    }

    .image-lightbox-close {
      top: 0.6rem;
      right: 0.6rem;
      width: 2.55rem;
      height: 2.55rem;
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
