<script lang="ts">
  import { env } from '$env/dynamic/public';
  import PortfolioHeroStripe from '$lib/components/portfolio/PortfolioHeroStripe.svelte';
  import PortfolioAbout from '$lib/components/portfolio/PortfolioAbout.svelte';
  import PortfolioServices from '$lib/components/portfolio/PortfolioServices.svelte';
  import PortfolioTechStack from '$lib/components/portfolio/PortfolioTechStack.svelte';
  import PortfolioProjects from '$lib/components/portfolio/PortfolioProjects.svelte';
  import PortfolioContactCta from '$lib/components/portfolio/PortfolioContactCta.svelte';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const site = $derived(data.site);
  const absoluteOgImage = $derived(
    site.seo.ogImage.startsWith('http') ? site.seo.ogImage : `${baseUrl}${site.seo.ogImage}`
  );
  const offerCatalog = $derived({
    '@type': 'OfferCatalog',
    name: `Servicios de ${site.header.logoText || 'Moises Valero'}`,
    itemListElement: site.services.items.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: {
          '@id': `${baseUrl}/#organization`
        },
        areaServed: [
          { '@type': 'Country', name: 'Espana' },
          { '@type': 'City', name: 'Alcoy' },
          { '@type': 'AdministrativeArea', name: 'Alicante' }
        ]
      }
    }))
  });
  const personJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${baseUrl}/#person`,
      name: 'Moisés Valero',
      url: `${baseUrl}/`,
      jobTitle: 'Desarrollador Web',
      sameAs: [site.footer.githubHref, site.footer.linkedinHref, site.footer.maltHref].filter(
        (u): u is string => typeof u === 'string' && u.length > 0
      ),
      worksFor: {
        '@id': `${baseUrl}/#organization`
      },
      knowsAbout: [
        'SvelteKit',
        'WordPress',
        'SEO Tecnico',
        'Sanity CMS',
        'Rendimiento web',
        'Core Web Vitals',
        'Diseno web',
        'WooCommerce'
      ]
    })
  );
  const websiteJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: site.header.logoText,
      url: `${baseUrl}/`,
      inLanguage: data.locale,
      publisher: {
        '@id': `${baseUrl}/#organization`
      }
    })
  );
  const organizationJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: site.header.logoText || 'Moises Valero',
      url: `${baseUrl}/`,
      foundingDate: '2020-01-01',
      founder: {
        '@id': `${baseUrl}/#person`
      },
      sameAs: [site.footer.githubHref, site.footer.linkedinHref, site.footer.maltHref].filter(
        (u): u is string => typeof u === 'string' && u.length > 0
      ),
      areaServed: [
        { '@type': 'Country', name: 'Espana' },
        { '@type': 'City', name: 'Alcoy' },
        { '@type': 'AdministrativeArea', name: 'Alicante' }
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        url: `${baseUrl}/#contacto`,
        availableLanguage: ['es']
      },
      knowsAbout: [
        'Diseno web',
        'Desarrollo web',
        'SvelteKit',
        'WordPress',
        'SEO tecnico',
        'Rendimiento web',
        'Core Web Vitals',
        'WooCommerce',
        'Sanity CMS'
      ],
      hasOfferCatalog: offerCatalog
    })
  );

  function revealMotionQuery() {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
  }

  function isRevealMobileViewport() {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  }

  function revealOnScroll(node: HTMLElement) {
    const motionMq = revealMotionQuery();
    if (motionMq?.matches) {
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
    const motionMq = revealMotionQuery();
    if (motionMq?.matches) {
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
  <JsonLdScript json={organizationJsonLd} />
  <JsonLdScript json={websiteJsonLd} />
  <JsonLdScript json={personJsonLd} />
</svelte:head>

<div class="site-scroll-progress" aria-hidden="true"></div>

<div class="reveal-block hero-block is-visible">
  <PortfolioHeroStripe {...site.hero} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioAbout {...site.about} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioServices {...site.services} />
</div>
<div class="reveal-block" use:revealOnScrollProjects>
  <PortfolioProjects {...site.projects} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioTechStack {...site.techStack} />
</div>
<div class="reveal-block" use:revealOnScroll>
  <PortfolioContactCta {...site.contact} />
</div>

<style>
  .reveal-block {
    position: relative;
    opacity: 0;
    transform: translate3d(0, 48px, 0) scale(0.985);
    clip-path: inset(0 0 14% 0);
    transition:
      opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 940ms cubic-bezier(0.16, 1, 0.3, 1),
      clip-path 940ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .reveal-block.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    clip-path: inset(0 0 0 0);
  }

  .hero-block {
    opacity: 1;
    transform: none;
    filter: none;
  }

  .site-scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 140;
    width: 100%;
    height: 2px;
    pointer-events: none;
    transform: scaleX(0);
    transform-origin: left;
    background: linear-gradient(90deg, #0071e3, #7c5cbf 58%, #f59e0b);
    animation: scrollProgress linear both;
    animation-timeline: scroll(root block);
  }

  .reveal-block.is-visible :global(.servicios-intro),
  .reveal-block.is-visible :global(.stack-header),
  .reveal-block.is-visible :global(.garantias-header),
  .reveal-block.is-visible :global(.proyectos-header) {
    animation: sectionTitleIn 760ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .reveal-block.is-visible :global(.role-strip .role-card),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card),
  .reveal-block.is-visible :global(.project-card),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item),
  .reveal-block.is-visible :global(.stack-grid .stack-cat) {
    animation: cardIn 780ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .reveal-block.is-visible :global(.role-strip .role-card:nth-child(2)),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(2)),
  .reveal-block.is-visible :global(.project-card:nth-child(2)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(2)),
  .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(2)) {
    animation-delay: 120ms;
  }

  .reveal-block.is-visible :global(.role-strip .role-card:nth-child(3)),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(3)),
  .reveal-block.is-visible :global(.project-card:nth-child(3)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(3)),
  .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(3)) {
    animation-delay: 240ms;
  }

  .reveal-block.is-visible :global(.role-strip .role-card:nth-child(4)),
  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(4)),
  .reveal-block.is-visible :global(.project-card:nth-child(4)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(4)),
  .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(4)) {
    animation-delay: 320ms;
  }

  .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(5)),
  .reveal-block.is-visible :global(.project-card:nth-child(5)),
  .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(5)),
  .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(5)) {
    animation-delay: 400ms;
  }

  .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(6)) {
    animation-delay: 480ms;
  }

  :global(.role-card),
  :global(.proyecto-card),
  :global(.project-card),
  :global(.garantia-item),
  :global(.stack-cat) {
    position: relative;
    overflow: hidden;
    transition:
      transform 420ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 420ms cubic-bezier(0.16, 1, 0.3, 1),
      background-color 420ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.proyecto-card::after),
  :global(.project-card::after),
  :global(.garantia-item::after),
  :global(.stack-cat::after) {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.82), transparent 28%),
      linear-gradient(180deg, transparent, rgba(0, 113, 227, 0.05));
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 420ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.role-card:hover),
  :global(.proyecto-card:hover),
  :global(.project-card:hover),
  :global(.garantia-item:hover),
  :global(.stack-cat:hover) {
    box-shadow:
      0 22px 48px rgba(15, 23, 42, 0.1),
      0 0 0 1px rgba(0, 113, 227, 0.14) inset;
  }

  :global(.proyecto-card:hover::after),
  :global(.project-card:hover::after),
  :global(.garantia-item:hover::after),
  :global(.stack-cat:hover::after) {
    opacity: 1;
    transform: translateY(0);
  }

  :global(.service-cta-link),
  :global(.btn-visitar) {
    position: relative;
  }

  :global(.service-cta-link::after),
  :global(.btn-visitar::after) {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.service-cta-link:hover::after),
  :global(.btn-visitar:hover::after) {
    transform: scaleX(1);
    transform-origin: left;
  }

  @keyframes scrollProgress {
    to {
      transform: scaleX(1);
    }
  }

  @keyframes sectionTitleIn {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardIn {
    from {
      opacity: 0;
      transform: translateY(32px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
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
    .site-scroll-progress {
      display: none;
    }

    .reveal-block {
      transform: translate3d(0, 22px, 0);
      clip-path: none;
      transition:
        opacity 480ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 440ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    :global(.role-card),
    :global(.proyecto-card),
    :global(.project-card),
    :global(.garantia-item),
    :global(.stack-cat) {
      transform-style: flat;
    }

    .reveal-block.is-visible :global(.servicios-intro),
    .reveal-block.is-visible :global(.stack-header),
    .reveal-block.is-visible :global(.garantias-header),
    .reveal-block.is-visible :global(.proyectos-header) {
      animation: sectionTitleIn 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .reveal-block.is-visible :global(.role-strip .role-card),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card),
    .reveal-block.is-visible :global(.project-card),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item),
    .reveal-block.is-visible :global(.stack-grid .stack-cat) {
      animation: cardInMobile 420ms cubic-bezier(0.16, 0.84, 0.32, 1) both;
    }

    .reveal-block.is-visible :global(.role-strip .role-card:nth-child(2)),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(2)),
    .reveal-block.is-visible :global(.project-card:nth-child(2)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(2)),
    .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(2)) {
      animation-delay: 45ms;
    }

    .reveal-block.is-visible :global(.role-strip .role-card:nth-child(3)),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(3)),
    .reveal-block.is-visible :global(.project-card:nth-child(3)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(3)),
    .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(3)) {
      animation-delay: 85ms;
    }

    .reveal-block.is-visible :global(.role-strip .role-card:nth-child(4)),
    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(4)),
    .reveal-block.is-visible :global(.project-card:nth-child(4)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(4)),
    .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(4)) {
      animation-delay: 120ms;
    }

    .reveal-block.is-visible :global(.proyectos-grid .proyecto-card:nth-child(5)),
    .reveal-block.is-visible :global(.project-card:nth-child(5)),
    .reveal-block.is-visible :global(.garantias-grid .garantia-item:nth-child(5)),
    .reveal-block.is-visible :global(.stack-grid .stack-cat:nth-child(5)) {
      animation-delay: 155ms;
    }

    .site-scroll-progress {
      height: 1px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-scroll-progress {
      display: none;
    }
    .reveal-block,
    .hero-block {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
    .reveal-block :global(.role-card),
    .reveal-block :global(.proyecto-card),
    .reveal-block :global(.project-card),
    .reveal-block :global(.garantia-item),
    .reveal-block :global(.stack-cat) {
      animation: none !important;
    }
  }
</style>
