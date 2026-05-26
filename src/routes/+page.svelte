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
  import { reveal } from '$lib';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const site = $derived(data.site);
  const absoluteOgImage = $derived(
    site.seo.ogImage.startsWith('http') ? site.seo.ogImage : `${baseUrl}${site.seo.ogImage}`
  );
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
      ]
    })
  );

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

<PortfolioHeroStripe {...site.hero} />
<div class="home-about-reveal" use:reveal={{ stage: 'title' }}>
  <PortfolioAbout {...site.about} />
</div>
<div use:reveal={{ stage: 'content', delay: 110 }}>
  <PortfolioServices {...site.services} />
</div>
<PortfolioProjects {...site.projects} />
<div use:reveal={{ stage: 'content', delay: 140 }}>
  <PortfolioTechStack {...site.techStack} />
</div>
<div use:reveal={{ stage: 'content', delay: 110 }}>
  <PortfolioContactCta {...site.contact} />
</div>
