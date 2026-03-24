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
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const site = $derived(data.site);
  const absoluteOgImage = $derived(
    site.seo.ogImage.startsWith('http') ? site.seo.ogImage : `${baseUrl}${site.seo.ogImage}`
  );
  const personJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Moisés Valero',
      url: `${baseUrl}/`,
      jobTitle: 'Desarrollador Web',
      sameAs: [site.footer.githubHref, site.footer.linkedinHref, site.footer.maltHref].filter(
        (u): u is string => typeof u === 'string' && u.length > 0
      ),
      knowsAbout: ['SvelteKit', 'WordPress', 'SEO Técnico', 'Sanity CMS']
    })
  );
  const websiteJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.header.logoText,
      url: `${baseUrl}/`,
      inLanguage: data.locale
    })
  );

  let prefersReducedMotion = false;
  onMount(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  function isRevealMobileViewport() {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  }

  function revealOnScroll(node: HTMLElement) {
    if (prefersReducedMotion) {
      node.classList.add('is-visible');
      return;
    }
    const mobile = isRevealMobileViewport();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            observer.unobserve(node);
          }
        }
      },
      mobile
        ? { threshold: 0.06, rootMargin: '0px 0px 14% 0px' }
        : { threshold: 0.34, rootMargin: '0px 0px -14% 0px' }
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
    const mobile = isRevealMobileViewport();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            observer.unobserve(node);
          }
        }
      },
      mobile
        ? { threshold: 0.06, rootMargin: '0px 0px 12% 0px' }
        : { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
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
  <title>{site.seo.title}</title>
  <meta name="description" content={site.seo.description} />

  <link rel="canonical" href={`${baseUrl}/`} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={site.seo.ogTitle} />
  <meta property="og:description" content={site.seo.ogDescription} />
  <meta property="og:url" content={`${baseUrl}/`} />
  <meta property="og:image" content={absoluteOgImage} />
  <meta property="og:site_name" content={site.header.logoText} />
  <meta property="og:locale" content={data.locale === 'en' ? 'en_US' : 'es_ES'} />

  <meta name="twitter:card" content={site.seo.twitterCard} />
  <meta name="twitter:title" content={site.seo.ogTitle} />
  <meta name="twitter:description" content={site.seo.ogDescription} />
  <meta name="twitter:image" content={absoluteOgImage} />
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

  @keyframes cardInMobile {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .reveal-block {
      transform: translate3d(0, 22px, 0);
      transition:
        opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
        clip-path 400ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .reveal-block.is-visible :global(.servicios-flex .card-servicio),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item) {
      animation: cardInMobile 420ms cubic-bezier(0.16, 0.84, 0.32, 1) both;
    }

    .reveal-block.is-visible :global(.servicios-flex .card-servicio:nth-child(2)),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(2)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(2)) {
      animation-delay: 45ms;
    }

    .reveal-block.is-visible :global(.servicios-flex .card-servicio:nth-child(3)),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(3)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(3)) {
      animation-delay: 85ms;
    }

    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(4)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(4)) {
      animation-delay: 120ms;
    }

    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(5)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(5)) {
      animation-delay: 155ms;
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
