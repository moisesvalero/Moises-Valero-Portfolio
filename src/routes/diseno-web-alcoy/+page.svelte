<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { seo, setSeo } from '$lib/seo';
  import type { LandingSectionKey } from '$lib/types/landing-alcoy';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const landing = $derived(data.landing);

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const canonicalUrl = $derived(
    landing.seo.canonicalPath.startsWith('http')
      ? landing.seo.canonicalPath
      : `${baseUrl}${landing.seo.canonicalPath.startsWith('/') ? '' : '/'}${landing.seo.canonicalPath}`
  );

  const orderedSections = $derived(
    Array.from(new Set(landing.sectionOrder)).filter((section): section is LandingSectionKey =>
      ['hero', 'problemSolution', 'services', 'benefits', 'cases', 'faq', 'finalCta'].includes(section)
    )
  );

  const localBusinessJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: landing.localBusiness.businessName,
      serviceType: landing.localBusiness.serviceType,
      areaServed: landing.localBusiness.areaServed.map((name) => ({ '@type': 'City', name })),
      address: {
        '@type': 'PostalAddress',
        addressLocality: landing.localBusiness.addressLocality,
        addressRegion: landing.localBusiness.addressRegion,
        addressCountry: landing.localBusiness.addressCountry
      },
      telephone: landing.localBusiness.telephone,
      email: landing.localBusiness.email,
      priceRange: landing.localBusiness.priceRange,
      url: canonicalUrl
    })
  );

  const webPageJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: landing.seo.title,
      description: landing.seo.description,
      inLanguage: 'es',
      url: canonicalUrl,
      about: ['diseno web en Alcoy', 'desarrollo web en Alcoy', 'Alcoy y Alicante']
    })
  );

  const faqJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: landing.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  );

  $effect(() => {
    setSeo({
      title: landing.seo.title,
      description: landing.seo.description,
      ogTitle: landing.seo.ogTitle,
      ogDescription: landing.seo.ogDescription,
      canonical: canonicalUrl,
      ogUrl: canonicalUrl,
      ogImage: landing.seo.ogImage,
      twitterCard: landing.seo.twitterCard
    });
  });
</script>

<svelte:head>
  <title>{$seo.title}</title>
  <meta name="description" content={$seo.description} />
  <link rel="canonical" href={$seo.canonical} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={$seo.ogTitle} />
  <meta property="og:description" content={$seo.ogDescription} />
  <meta property="og:url" content={$seo.ogUrl} />
  <meta property="og:image" content={$seo.ogImage} />
  <meta property="og:locale" content="es_ES" />

  <meta name="twitter:card" content={$seo.twitterCard} />
  <meta name="twitter:title" content={$seo.ogTitle} />
  <meta name="twitter:description" content={$seo.ogDescription} />
  <meta name="twitter:image" content={$seo.ogImage} />

  <script type="application/ld+json">{localBusinessJsonLd}</script>
  <script type="application/ld+json">{webPageJsonLd}</script>
  {#if landing.faq.items.length}
    <script type="application/ld+json">{faqJsonLd}</script>
  {/if}
</svelte:head>

<main class="landing-alcoy">
  {#each orderedSections as section (section)}
    {#if section === 'hero'}
      <section class="hero section-shell">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="badge">{landing.hero.badge}</div>
            <h1>{landing.hero.title}</h1>
            <p class="lead">{landing.hero.subtitle}</p>
            <div class="cta-row">
              <a class="btn-primary" href={landing.hero.cta.href}>{landing.hero.cta.label}</a>
              {#if landing.hero.cta.secondaryLabel && landing.hero.cta.secondaryHref}
                <a class="btn-secondary" href={landing.hero.cta.secondaryHref}>{landing.hero.cta.secondaryLabel}</a>
              {/if}
            </div>
          </div>
          <aside class="hero-visual" aria-label="Visual de servicios de diseno y desarrollo web">
            {#if landing.hero.splineUrl}
              <iframe
                src={landing.hero.splineUrl}
                title={landing.hero.visualTitle || 'Visual interactivo de proyecto web'}
                loading="lazy"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            {:else if landing.hero.visualImageSrc}
              <img src={landing.hero.visualImageSrc} alt={landing.hero.visualImageAlt || 'Vista de proyecto web'} />
            {/if}
            {#if landing.hero.visualTitle || landing.hero.visualDescription}
              <div class="hero-visual-copy">
                {#if landing.hero.visualTitle}
                  <strong>{landing.hero.visualTitle}</strong>
                {/if}
                {#if landing.hero.visualDescription}
                  <p>{landing.hero.visualDescription}</p>
                {/if}
              </div>
            {/if}
          </aside>
        </div>
      </section>
    {/if}

    {#if section === 'problemSolution'}
      <section class="section-shell">
        <h2>{landing.problemSolution.heading}</h2>
        <p class="muted">{landing.problemSolution.intro}</p>
        <div class="grid two">
          <article class="card">
            <h3>Problemas habituales</h3>
            <ul>
              {#each landing.problemSolution.problems as problem (problem)}
                <li>{problem}</li>
              {/each}
            </ul>
          </article>
          <article class="card">
            <h3>{landing.problemSolution.solutionTitle}</h3>
            <p>{landing.problemSolution.solutionText}</p>
          </article>
        </div>
      </section>
    {/if}

    {#if section === 'services'}
      <section class="section-shell">
        <h2>{landing.services.heading}</h2>
        <div class="grid three">
          {#each landing.services.items as item (item.title)}
            <article class="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          {/each}
        </div>
      </section>
    {/if}

    {#if section === 'benefits'}
      <section class="section-shell">
        <h2>{landing.benefits.heading}</h2>
        <div class="grid two">
          {#each landing.benefits.items as item (item.title)}
            <article class="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          {/each}
        </div>
      </section>
    {/if}

    {#if section === 'cases'}
      <section class="section-shell">
        <h2>{landing.cases.heading}</h2>
        <div class="grid two">
          {#each landing.cases.items as item (item.title)}
            <article class="card">
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <p class="muted"><strong>Resultado:</strong> {item.outcome}</p>
              {#if item.href}
                <a class="inline-link" href={item.href}>{item.linkLabel || 'Ver caso'}</a>
              {/if}
            </article>
          {/each}
        </div>
      </section>
    {/if}

    {#if section === 'faq'}
      <section class="section-shell">
        <h2>{landing.faq.heading}</h2>
        <div class="faq-list">
          {#each landing.faq.items as item (item.question)}
            <details class="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          {/each}
        </div>
      </section>
    {/if}

    {#if section === 'finalCta'}
      <section class="section-shell final-cta">
        <h2>{landing.finalCta.heading}</h2>
        <p class="lead">{landing.finalCta.text}</p>
        <div class="cta-row">
          <a class="btn-primary" href={landing.finalCta.cta.href}>{landing.finalCta.cta.label}</a>
          {#if landing.finalCta.cta.secondaryLabel && landing.finalCta.cta.secondaryHref}
            <a class="btn-secondary" href={landing.finalCta.cta.secondaryHref}>
              {landing.finalCta.cta.secondaryLabel}
            </a>
          {/if}
        </div>
      </section>
    {/if}
  {/each}
</main>

<style>
  .landing-alcoy {
    width: min(1100px, 92%);
    margin: 9rem auto 4rem;
    display: grid;
    gap: 2.5rem;
    color: #0f172a;
  }
  .section-shell {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 16px 44px rgba(15, 23, 42, 0.08);
  }
  .hero {
    text-align: left;
    padding: 0;
    overflow: hidden;
    background:
      radial-gradient(1200px 420px at 15% -10%, rgba(37, 99, 235, 0.18), transparent 58%),
      radial-gradient(900px 360px at 95% 95%, rgba(124, 58, 237, 0.2), transparent 62%),
      linear-gradient(130deg, #ffffff 0%, #f8fbff 42%, #f5f3ff 100%);
    border: 1px solid rgba(148, 163, 184, 0.35);
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 1.35rem;
    align-items: center;
    min-height: 470px;
    padding: 2rem;
  }
  .hero-copy {
    position: relative;
    z-index: 1;
  }
  .badge {
    display: inline-flex;
    margin-bottom: 1rem;
    border-radius: 999px;
    border: 1px solid rgba(37, 99, 235, 0.25);
    background: rgba(37, 99, 235, 0.08);
    color: #1d4ed8;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.35rem 0.8rem;
  }
  h1 {
    font-size: clamp(1.9rem, 3.2vw, 3rem);
    line-height: 1.12;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }
  h2 {
    font-size: clamp(1.35rem, 2.2vw, 2rem);
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin-bottom: 0.75rem;
  }
  h3 {
    font-size: 1.08rem;
    margin-bottom: 0.5rem;
  }
  p {
    color: #1e293b;
  }
  .lead {
    color: #334155;
    font-size: 1.05rem;
    max-width: 58ch;
    margin: 0;
  }
  .hero-visual {
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(6px);
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.14);
    overflow: hidden;
    min-height: 380px;
    display: grid;
    grid-template-rows: 1fr auto;
  }
  .hero-visual iframe,
  .hero-visual img {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border: 0;
    object-fit: cover;
    display: block;
  }
  .hero-visual-copy {
    border-top: 1px solid rgba(148, 163, 184, 0.3);
    padding: 0.85rem 1rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, #f8fafc 100%);
  }
  .hero-visual-copy strong {
    color: #0f172a;
    font-size: 0.98rem;
  }
  .hero-visual-copy p {
    color: #475569;
    font-size: 0.9rem;
    margin-top: 0.28rem;
  }
  .muted {
    color: #475569;
  }
  .grid {
    display: grid;
    gap: 1rem;
    margin-top: 1.1rem;
  }
  .grid.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1rem;
    background: #fff;
  }
  ul {
    padding-left: 1.1rem;
    display: grid;
    gap: 0.4rem;
  }
  .cta-row {
    margin-top: 1.25rem;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .btn-primary,
  .btn-secondary {
    text-decoration: none;
    border-radius: 999px;
    padding: 0.68rem 1.1rem;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .btn-primary {
    background: #2563eb;
    color: #fff;
    border: 1px solid #2563eb;
  }
  .btn-secondary {
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #0f172a;
  }
  .inline-link {
    display: inline-flex;
    margin-top: 0.6rem;
    color: #1d4ed8;
    text-decoration: none;
    font-weight: 600;
  }
  .faq-list {
    margin-top: 1rem;
    display: grid;
    gap: 0.75rem;
  }
  .faq-item {
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #fff;
    padding: 0.9rem 1rem;
  }
  .faq-item summary {
    cursor: pointer;
    font-weight: 600;
    color: #0f172a;
  }
  .faq-item p {
    margin-top: 0.65rem;
    color: #334155;
  }
  .final-cta {
    text-align: center;
  }
  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      padding: 1.3rem;
      min-height: auto;
    }
    .hero {
      text-align: center;
    }
    .lead {
      margin: 0 auto;
    }
    .grid.two,
    .grid.three {
      grid-template-columns: 1fr;
    }
  }
</style>
