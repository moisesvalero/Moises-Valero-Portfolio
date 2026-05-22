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

  function revealWithFrameGap(node: HTMLElement) {
    let rafA = 0;
    let rafB = 0;
    rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        node.classList.add('is-visible');
      });
    });
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }

  function revealOnScroll(node: HTMLElement, projects = false) {
    const motionMq = revealMotionQuery();
    if (motionMq?.matches) {
      node.classList.add('is-visible');
      return;
    }

    let cancelRaf: (() => void) | undefined;
    const show = () => {
      if (node.classList.contains('is-visible')) return;
      cancelRaf?.();
      cancelRaf = revealWithFrameGap(node);
      observer.disconnect();
      clearTimeout(failsafe);
    };

    const mobile = isRevealMobileViewport();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show();
          break;
        }
      },
      mobile
        ? {
            threshold: projects ? 0.06 : 0.06,
            rootMargin: projects ? '0px 0px 12% 0px' : '0px 0px 14% 0px'
          }
        : {
            threshold: projects ? 0.2 : 0.34,
            rootMargin: projects ? '0px 0px -6% 0px' : '0px 0px -14% 0px'
          }
    );

    observer.observe(node);
    const failsafe = window.setTimeout(() => {
      if (!node.classList.contains('is-visible')) show();
    }, 2800);

    return {
      destroy() {
        cancelRaf?.();
        observer.disconnect();
        clearTimeout(failsafe);
      }
    };
  }

  function revealOnScrollProjects(node: HTMLElement) {
    return revealOnScroll(node, true);
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
    .reveal-block {
      transform: translate3d(0, 22px, 0);
      clip-path: none;
      transition:
        opacity 480ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 440ms cubic-bezier(0.22, 1, 0.36, 1);
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
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-block,
    .hero-block {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
      clip-path: none !important;
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
