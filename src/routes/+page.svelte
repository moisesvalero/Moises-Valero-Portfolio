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

  /** Reveal por sección: el contenido siempre es visible (opacity 1); solo animamos transform. */
  function homeReveal(node: HTMLElement) {
    if (typeof window === 'undefined') return;

    const show = () => node.classList.add('is-in');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show();
      return;
    }

    const isInViewport = () => {
      const rect = node.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
    };

    if (isInViewport()) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show();
          observer.disconnect();
          break;
        }
      },
      { threshold: 0, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(node);
    return { destroy: () => observer.disconnect() };
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

<div class="home-section home-section--hero">
  <PortfolioHeroStripe {...site.hero} />
</div>
<div class="home-section" use:homeReveal>
  <PortfolioAbout {...site.about} />
</div>
<div class="home-section" use:homeReveal>
  <PortfolioServices {...site.services} />
</div>
<div class="home-section" use:homeReveal>
  <PortfolioProjects {...site.projects} />
</div>
<div class="home-section" use:homeReveal>
  <PortfolioTechStack {...site.techStack} />
</div>
<div class="home-section" use:homeReveal>
  <PortfolioContactCta {...site.contact} />
</div>

<style>
  .home-section:not(.home-section--hero) {
    opacity: 1;
    transform: translateY(28px);
    transition: transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .home-section.is-in,
  .home-section--hero {
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .home-section {
      transform: none;
      transition: none;
    }
  }
</style>
