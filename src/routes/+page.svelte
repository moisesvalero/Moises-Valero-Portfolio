<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';
  import PortfolioHeroStripe from '$lib/components/portfolio/PortfolioHeroStripe.svelte';
  import PortfolioAbout from '$lib/components/portfolio/PortfolioAbout.svelte';
  import PortfolioServices from '$lib/components/portfolio/PortfolioServices.svelte';
  import PortfolioTechStack from '$lib/components/portfolio/PortfolioTechStack.svelte';
  import PortfolioQuality from '$lib/components/portfolio/PortfolioQuality.svelte';
  import PortfolioProjects from '$lib/components/portfolio/PortfolioProjects.svelte';
  import PortfolioContactCta from '$lib/components/portfolio/PortfolioContactCta.svelte';
  import { seo, setSeo } from '$lib/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const site = $derived(data.site);
  const absoluteOgImage = $derived(
    site.seo.ogImage.startsWith('http') ? site.seo.ogImage : `${baseUrl}${site.seo.ogImage}`
  );
  const personJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Moisés Valero',
      url: `${baseUrl}/`,
      jobTitle: 'Desarrollador Web',
      sameAs: [site.footer.githubHref, site.footer.linkedinHref],
      knowsAbout: ['SvelteKit', 'WordPress', 'SEO Técnico', 'Sanity CMS']
    })
  );
  const websiteJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.header.logoText,
      url: `${baseUrl}/`,
      inLanguage: data.locale
    })
  );

  $effect(() => {
    const s = site;
    setSeo({
      title: s.seo.title,
      description: s.seo.description,
      ogTitle: s.seo.ogTitle,
      ogDescription: s.seo.ogDescription,
      canonical: `${baseUrl}/`,
      ogUrl: `${baseUrl}/`,
      ogImage: absoluteOgImage,
      twitterCard: s.seo.twitterCard
    });
  });

  let prefersReducedMotion = false;
  onMount(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  function revealOnScroll(node: HTMLElement) {
    if (prefersReducedMotion) {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            observer.unobserve(node);
          }
        }
      },
      { threshold: 0.34, rootMargin: '0px 0px -14% 0px' }
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  function revealOnScrollProjects(node: HTMLElement) {
    if (prefersReducedMotion) {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            observer.unobserve(node);
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
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
  <meta property="og:site_name" content={site.header.logoText} />
  <meta property="og:locale" content={data.locale === 'en' ? 'en_US' : 'es_ES'} />

  <meta name="twitter:card" content={$seo.twitterCard} />
  <meta name="twitter:title" content={$seo.ogTitle} />
  <meta name="twitter:description" content={$seo.ogDescription} />
  <meta name="twitter:image" content={$seo.ogImage} />
  <script type="application/ld+json">{websiteJsonLd}</script>
  <script type="application/ld+json">{personJsonLd}</script>
</svelte:head>

<div class="reveal-block hero-block is-visible">
  <PortfolioHeroStripe {...site.hero} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioAbout {...site.about} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioServices {...site.services} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioTechStack {...site.techStack} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioQuality {...site.quality} />
</div>
<div class="reveal-block" use:revealOnScrollProjects>
  <PortfolioProjects meta={site.projects.meta} title={site.projects.title} projects={site.projects.projects} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioContactCta {...site.contact} />
</div>

<style>
  .reveal-block {
    opacity: 0;
    transform: translate3d(0, 36px, 0);
    clip-path: inset(0 0 18% 0);
    transition:
      opacity 860ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 760ms cubic-bezier(0.22, 1, 0.36, 1),
      clip-path 820ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
  }

  .reveal-block.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    clip-path: inset(0 0 0 0);
  }

  .hero-block {
    opacity: 1;
    transform: none;
    filter: none;
  }

  .reveal-block.is-visible :global(.servicios-flex .card-servicio),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item) {
    animation: cardIn 740ms cubic-bezier(0.16, 0.84, 0.32, 1) both;
  }

  .reveal-block.is-visible :global(.servicios-flex .card-servicio:nth-child(2)),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(2)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(2)) {
    animation-delay: 120ms;
  }

  .reveal-block.is-visible :global(.servicios-flex .card-servicio:nth-child(3)),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(3)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(3)) {
    animation-delay: 240ms;
  }

  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(4)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(4)) {
    animation-delay: 320ms;
  }

  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(5)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(5)) {
    animation-delay: 400ms;
  }

  @keyframes cardIn {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-block,
    .hero-block {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
    .reveal-block :global(.card-servicio),
    .reveal-block :global(.proyecto-card),
    .reveal-block :global(.garantia-item) {
      animation: none !important;
    }
  }
</style>
