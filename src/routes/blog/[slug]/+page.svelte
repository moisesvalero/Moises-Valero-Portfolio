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
  const shareText = $derived(article.title);
  const twitterShareHref = $derived(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(shareText)}`
  );
  const linkedinShareHref = $derived(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`
  );
  const articleJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: seoDescription,
      datePublished: article.publishedAt,
      author: { '@type': 'Person', name: 'Moisés Valero' },
      publisher: { '@type': 'Person', name: 'Moisés Valero' },
      image: [ogImage],
      mainEntityOfPage: canonical
    })
  );
  let lightboxImage = $state<{ src: string; alt: string } | null>(null);
  let copied = $state(false);

  function formatArticleDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  function openLightbox(src: string, alt: string) {
    lightboxImage = { src, alt };
  }

  function closeLightbox() {
    lightboxImage = null;
  }

  async function copyArticleLink() {
    try {
      await navigator.clipboard.writeText(canonical);
      copied = true;
      window.setTimeout(() => {
        copied = false;
      }, 1600);
    } catch {
      copied = false;
    }
  }

  function openShare(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleImageClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const image = target.closest('img');
    if (!(image instanceof HTMLImageElement)) return;
    openLightbox(image.currentSrc || image.src, image.alt || article.title);
  }

  function handleLightboxKeydown(event: KeyboardEvent) {
    if (!lightboxImage) return;
    if (event.key === 'Escape') closeLightbox();
  }

  function articleImageLightbox(node: HTMLElement) {
    node.addEventListener('click', handleImageClick);
    return {
      destroy() {
        node.removeEventListener('click', handleImageClick);
      }
    };
  }

  $effect(() => {
    if (!lightboxImage) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  });
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
  <meta property="og:site_name" content="Moisés Valero" />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={articleJsonLd} />
</svelte:head>

<svelte:window onkeydown={handleLightboxKeydown} />

<article class="blog-article">
  <header class="article-hero">
    <div class="article-ambient" aria-hidden="true"></div>
    <div class="article-shell article-hero-shell">
      <a class="back-link" href={resolve('/blog')}>Blog</a>
      <p class="eyebrow">{article.categoryLabel}</p>
      <h1>{article.title}</h1>
      <p class="article-meta">Por Moisés Valero · {formatArticleDate(article.publishedAt)} · {article.readingMinutes} min de lectura</p>
      <p class="lead">{article.excerpt}</p>
    </div>
  </header>

  <div class="article-shell article-body-shell">
    <button
      class="image-open cover-open"
      type="button"
      aria-label="Abrir imagen destacada"
      onclick={() => openLightbox(article.coverImageSrc, article.coverImageAlt)}
    >
      <img class="cover" src={article.coverImageSrc} alt={article.coverImageAlt} loading="eager" />
    </button>

    <div class="article-layout">
      <aside class="article-aside" aria-label="Datos del articulo">
        <span>Categoría</span>
        <strong>{article.categoryLabel}</strong>
        <span>Lectura</span>
        <strong>{article.readingMinutes} min</strong>
      </aside>

      <div class="content prose" use:articleImageLightbox>{@html article.bodyHtml}</div>
    </div>
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
              <img src={related.coverImageSrc} alt={related.coverImageAlt} loading="lazy" decoding="async" />
              <span>{related.categoryLabel}</span>
              <h3>{related.title}</h3>
              <p>{related.excerpt}</p>
            </a>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <section class="share-section" aria-label="Compartir articulo">
    <div class="article-shell share-layout">
      <div class="share-card">
        <strong>Comparte este articulo:</strong>
        <div class="share-actions">
          <button type="button" aria-label="Compartir en X" title="Compartir en X" onclick={() => openShare(twitterShareHref)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.23 2.25h6.83l4.72 6.24 5.46-6.24Zm-1.16 17.52h1.83L7.06 4.13H5.09l11.99 15.64Z" />
            </svg>
          </button>
          <button type="button" aria-label="Compartir en LinkedIn" title="Compartir en LinkedIn" onclick={() => openShare(linkedinShareHref)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S.02 4.88.02 3.5 1.14 1 2.5 1s2.48 1.12 2.48 2.5ZM.37 8.02h4.26V23H.37V8.02Zm7.37 0h4.08v2.05h.06c.57-1.08 1.96-2.22 4.03-2.22 4.31 0 5.11 2.84 5.11 6.53V23h-4.25v-7.64c0-1.82-.03-4.17-2.54-4.17-2.55 0-2.94 1.99-2.94 4.04V23H7.74V8.02Z" />
            </svg>
          </button>
          <button type="button" aria-label={copied ? 'Enlace copiado' : 'Copiar enlace'} title={copied ? 'Enlace copiado' : 'Copiar enlace'} onclick={copyArticleLink}>
            {#if copied}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9.55 17.62-5.08-5.08 1.41-1.42 3.67 3.67 8.57-8.57 1.41 1.42-9.98 9.98Z" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 7a5 5 0 0 1 5-5h3a5 5 0 0 1 0 10h-2v-2h2a3 3 0 1 0 0-6h-3a3 3 0 0 0-3 3H9Zm-2 5h10v-2H7v2Zm-5 5a5 5 0 0 1 5-5h2v2H7a3 3 0 1 0 0 6h3a3 3 0 0 0 3-3h2a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5Z" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
      <a class="back-portfolio" href={resolve('/')}>Volver al Portfolio</a>
    </div>
  </section>
</article>

{#if lightboxImage}
  <div class="image-lightbox" role="presentation" onmousedown={closeLightbox}>
    <div
      class="image-lightbox-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada de imagen"
      tabindex="-1"
      onmousedown={(event) => event.stopPropagation()}
    >
      <button class="image-lightbox-close" type="button" aria-label="Cerrar imagen" onclick={closeLightbox}>
        <span aria-hidden="true">x</span>
      </button>
      <img src={lightboxImage.src} alt={lightboxImage.alt} />
    </div>
  </div>
{/if}

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
    width: min(920px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .article-hero {
    position: relative;
    overflow: hidden;
    padding: clamp(6.5rem, 10vw, 8rem) 0 clamp(3.8rem, 6vw, 5.2rem);
    background:
      radial-gradient(circle at 13% 13%, rgba(244, 114, 182, 0.18), transparent 28rem),
      radial-gradient(circle at 84% 12%, rgba(14, 165, 233, 0.2), transparent 30rem),
      linear-gradient(180deg, #fbfdff 0%, var(--bg-surface) 100%);
  }

  .article-hero::after {
    content: "";
    position: absolute;
    inset: auto 0 0;
    height: 180px;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0), var(--bg-surface));
    pointer-events: none;
  }

  .article-ambient {
    position: absolute;
    inset: -40%;
    background:
      radial-gradient(circle at 22% 24%, rgba(244, 114, 182, 0.18), transparent 30%),
      radial-gradient(circle at 78% 20%, rgba(14, 165, 233, 0.2), transparent 30%),
      radial-gradient(circle at 52% 86%, rgba(251, 191, 36, 0.08), transparent 34%);
    filter: blur(54px);
    animation: ambientDrift 24s ease-in-out infinite;
  }

  .article-hero-shell {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .back-link {
    display: inline-flex;
    margin-bottom: 1.2rem;
    color: #0071e3;
    font-size: 0.9rem;
    font-weight: 850;
    text-decoration: none;
  }

  .eyebrow {
    margin: 0 0 0.85rem;
    color: #0071e3;
    font-size: 0.74rem;
    font-weight: 850;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  h1 {
    max-width: 14ch;
    margin: 0 auto;
    color: #0f172a;
    font-size: clamp(2.35rem, 5.2vw, 4.25rem);
    font-weight: 900;
    letter-spacing: -0.052em;
    line-height: 0.96;
    text-wrap: balance;
  }

  .article-meta {
    margin-top: 1rem;
    color: #475569;
    font-size: 0.9rem;
    font-weight: 620;
  }

  .lead {
    max-width: 720px;
    margin: 1.05rem auto 0;
    color: #1f2937;
    font-size: clamp(1rem, 1.8vw, 1.18rem);
    font-weight: 560;
    line-height: 1.62;
    text-wrap: pretty;
  }

  .article-body-shell {
    position: relative;
    z-index: 2;
    padding: 0 0 clamp(3rem, 6vw, 4.5rem);
  }

  .image-open {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;
    font: inherit;
  }

  .cover-open {
    margin-top: clamp(-3rem, -4vw, -2rem);
  }

  .cover {
    display: block;
    width: 100%;
    max-height: 440px;
    object-fit: cover;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: #e9edf5;
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.16);
  }

  .article-layout {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: clamp(1.3rem, 4vw, 2.4rem);
    align-items: start;
    margin-top: clamp(1.4rem, 3vw, 2rem);
  }

  .article-aside {
    position: sticky;
    top: 6.5rem;
    display: grid;
    gap: 0.35rem;
    padding-top: 0.3rem;
  }

  .article-aside span {
    margin-top: 0.75rem;
    color: #0071e3;
    font-size: 0.68rem;
    font-weight: 850;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .article-aside strong {
    color: #111827;
    font-size: 0.92rem;
    line-height: 1.25;
  }

  .content {
    min-width: 0;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.88);
    padding: clamp(1.2rem, 3vw, 2rem);
    box-shadow: 0 20px 56px rgba(15, 23, 42, 0.07);
  }

  .prose :global(h2),
  .prose :global(h3) {
    color: #101114;
    letter-spacing: -0.035em;
    line-height: 1.08;
    text-wrap: balance;
  }

  .prose :global(h2) {
    margin: 1.8rem 0 0.8rem;
    font-size: clamp(1.55rem, 3vw, 2.25rem);
  }

  .prose :global(h2:first-child) {
    margin-top: 0;
  }

  .prose :global(h3) {
    margin: 1.3rem 0 0.62rem;
    font-size: clamp(1.22rem, 2.2vw, 1.55rem);
  }

  .prose :global(p),
  .prose :global(li) {
    color: #303541;
    font-size: clamp(1rem, 1.2vw, 1.06rem);
    line-height: 1.78;
  }

  .prose :global(p + p),
  .prose :global(ul + p),
  .prose :global(p + ul) {
    margin-top: 0.9rem;
  }

  .prose :global(ul),
  .prose :global(ol) {
    margin: 1rem 0 0;
    padding-left: 1.25rem;
  }

  .prose :global(li + li) {
    margin-top: 0.45rem;
  }

  .prose :global(strong) {
    color: #111827;
  }

  .prose :global(a) {
    color: #0071e3;
    font-weight: 780;
  }

  .prose :global(blockquote) {
    margin: 1.7rem 0;
    padding: 0.2rem 0 0.2rem 1rem;
    border-left: 4px solid #0071e3;
    color: #155ea8;
    font-size: clamp(1.3rem, 3vw, 2rem);
    font-weight: 850;
    letter-spacing: -0.04em;
    line-height: 1.08;
  }

  .prose :global(pre) {
    margin: 1.4rem 0;
    overflow: auto;
    border-radius: 8px;
    background: #1f2430;
    color: #e5e7eb;
    padding: 1.1rem;
    box-shadow: 0 18px 46px rgba(15, 23, 42, 0.22);
  }

  .prose :global(code) {
    font-family: var(--font-mono);
  }

  .prose :global(img) {
    max-width: 100%;
    border-radius: 8px;
    cursor: zoom-in;
    box-shadow: 0 16px 42px rgba(15, 23, 42, 0.1);
  }

  .related-head h2 {
    color: #101114;
    font-size: clamp(1.8rem, 4vw, 3.6rem);
    font-weight: 900;
    letter-spacing: -0.052em;
    line-height: 0.98;
  }

  .related {
    padding: clamp(2.4rem, 6vw, 4.5rem) 0 5rem;
  }

  .related-head {
    margin-bottom: 1.05rem;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .related-grid a {
    display: flex;
    min-width: 0;
    flex-direction: column;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.86);
    padding: 0.65rem;
    color: inherit;
    text-decoration: none;
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
    transition:
      transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 260ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .related-grid a:hover,
  .related-grid a:focus-visible {
    transform: translateY(-4px);
    border-color: rgba(0, 113, 227, 0.3);
    outline: none;
  }

  .related-grid img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 6px;
    background: #e9edf5;
  }

  .related-grid span {
    margin: 0.85rem 0 0.45rem;
    color: #0071e3;
    font-size: 0.68rem;
    font-weight: 850;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .related-grid h3 {
    color: #101114;
    font-size: 1.05rem;
    font-weight: 850;
    letter-spacing: -0.03em;
    line-height: 1.12;
  }

  .related-grid p {
    display: -webkit-box;
    margin-top: 0.55rem;
    overflow: hidden;
    color: #4a4f5c;
    font-size: 0.88rem;
    line-height: 1.52;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .share-section {
    padding: 0 0 clamp(3.5rem, 7vw, 5.5rem);
  }

  .share-layout {
    display: grid;
    gap: 1rem;
    justify-items: center;
  }

  .share-card {
    display: flex;
    width: min(100%, 680px);
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.07);
  }

  .share-card strong {
    color: #101114;
    font-size: 0.95rem;
    font-weight: 900;
  }

  .share-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.45rem;
  }

  .share-actions button,
  .back-portfolio {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    min-height: 38px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 8px;
    padding: 0 0.78rem;
    background: rgba(255, 255, 255, 0.72);
    color: #101114;
    cursor: pointer;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 850;
    text-decoration: none;
    transition:
      transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 220ms cubic-bezier(0.16, 1, 0.3, 1),
      color 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .share-actions svg {
    width: 1.05rem;
    height: 1.05rem;
    fill: currentColor;
  }

  .share-actions button:hover,
  .back-portfolio:hover,
  .share-actions button:focus-visible,
  .back-portfolio:focus-visible {
    transform: translateY(-2px);
    border-color: rgba(0, 113, 227, 0.34);
    color: #0066e5;
    outline: none;
  }

  .image-lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: clamp(1rem, 3vw, 2rem);
    background: rgba(6, 8, 14, 0.78);
    backdrop-filter: blur(18px) saturate(120%);
  }

  .image-lightbox-panel {
    position: relative;
    width: min(1120px, 100%);
    max-height: min(86vh, 900px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    background: rgba(8, 10, 16, 0.92);
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
  }

  .image-lightbox-panel img {
    display: block;
    width: 100%;
    max-height: min(86vh, 900px);
    object-fit: contain;
    background: #05070d;
  }

  .image-lightbox-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 1;
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    background: rgba(8, 10, 16, 0.72);
    color: #fff;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
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

  :global(html.dark) .article-hero {
    background:
      radial-gradient(circle at 16% 12%, rgba(244, 114, 182, 0.11), transparent 26rem),
      radial-gradient(circle at 82% 10%, rgba(0, 113, 227, 0.15), transparent 30rem),
      linear-gradient(180deg, #0a0a0a 0%, #0b0b0b 100%);
  }

  :global(html.dark) h1,
  :global(html.dark) .related-head h2,
  :global(html.dark) .prose :global(h2),
  :global(html.dark) .prose :global(h3),
  :global(html.dark) .article-aside strong,
  :global(html.dark) .related-grid h3,
  :global(html.dark) .share-card strong {
    color: #f8fafc;
  }

  :global(html.dark) .lead,
  :global(html.dark) .article-meta,
  :global(html.dark) .prose :global(p),
  :global(html.dark) .prose :global(li),
  :global(html.dark) .related-grid p {
    color: #d4d4d8;
  }

  :global(html.dark) .cover,
  :global(html.dark) .content,
  :global(html.dark) .related-grid a,
  :global(html.dark) .share-card,
  :global(html.dark) .share-actions button,
  :global(html.dark) .back-portfolio {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.86);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .share-actions button,
  :global(html.dark) .back-portfolio {
    color: #f4f4f5;
  }

  @media (max-width: 820px) {
    .article-layout {
      grid-template-columns: 1fr;
    }

    .article-aside {
      position: static;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 0.9rem;
      align-items: center;
      padding: 0.75rem 0 0;
    }

    .article-aside span,
    .article-aside strong {
      margin: 0;
    }

    .related-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .article-shell {
      width: min(100% - 1.25rem, 920px);
    }

    .article-hero {
      padding-top: 6.5rem;
    }

    h1 {
      font-size: clamp(2.55rem, 12vw, 4rem);
    }

    .share-card {
      align-items: flex-start;
      flex-direction: column;
    }

    .share-actions {
      justify-content: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .article-ambient,
    .related-grid a,
    .share-actions button,
    .back-portfolio {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
