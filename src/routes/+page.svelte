<script lang="ts">
  import { env } from '$env/dynamic/public';
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

  $effect(() => {
    const s = site;
    setSeo({
      title: s.seo.title,
      description: s.seo.description,
      ogTitle: s.seo.ogTitle,
      ogDescription: s.seo.ogDescription,
      canonical: `${baseUrl}/`,
      ogUrl: `${baseUrl}/`,
      ogImage: s.seo.ogImage,
      twitterCard: s.seo.twitterCard
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

  <meta name="twitter:card" content={$seo.twitterCard} />
  <meta name="twitter:title" content={$seo.ogTitle} />
  <meta name="twitter:description" content={$seo.ogDescription} />
  <meta name="twitter:image" content={$seo.ogImage} />
</svelte:head>

<PortfolioHeroStripe {...site.hero} />
<PortfolioAbout {...site.about} />
<PortfolioServices {...site.services} />
<PortfolioTechStack {...site.techStack} />
<PortfolioQuality {...site.quality} />
<PortfolioProjects meta={site.projects.meta} title={site.projects.title} projects={site.projects.projects} />
<PortfolioContactCta {...site.contact} />
