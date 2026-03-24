<script lang="ts">
  import { env } from '$env/dynamic/public';
  import CaseStudyPage from '$lib/components/case-study/CaseStudyPage.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const canonical = $derived(`${baseUrl}/proyectos/${data.studySeo.slug}`);
  const ogImageDefault = `${baseUrl}/og-image.png`;
  const ogDescription = $derived(data.studySeo.seoDescription ?? data.studySeo.heroDescription);
  const ogTitle = $derived(`${data.studySeo.title} | Caso de Estudio`);
  const projectJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: data.studySeo.title,
      description: ogDescription,
      url: canonical,
      inLanguage: data.locale,
      author: {
        '@type': 'Person',
        name: 'Moisés Valero'
      },
      image: ogImageDefault
    })
  );
</script>

<svelte:head>
  <title>{data.studySeo.title} | Caso de Estudio | Moisés Valero</title>
  <meta name="description" content={ogDescription} />
  <link rel="canonical" href={canonical} />
  <link rel="alternate" hreflang="es" href={canonical} />
  <link rel="alternate" hreflang="x-default" href={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImageDefault} />
  <meta property="og:site_name" content="Moisés Valero" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitle} />
  <meta name="twitter:description" content={ogDescription} />
  <meta name="twitter:image" content={ogImageDefault} />
  <script type="application/ld+json">{projectJsonLd}</script>
</svelte:head>

<CaseStudyPage study={data.study} locale={data.locale} />
