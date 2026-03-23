<script lang="ts">
  import { env } from '$env/dynamic/public';
  import CaseStudyPage from '$lib/components/case-study/CaseStudyPage.svelte';
  import { setSeo } from '$lib/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const canonical = $derived(`${baseUrl}/proyectos/${data.studySeo.slug}`);
  const projectJsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: data.studySeo.title,
      description: data.studySeo.seoDescription ?? data.studySeo.heroDescription,
      url: canonical,
      inLanguage: data.locale,
      author: {
        '@type': 'Person',
        name: 'Moisés Valero'
      },
      image: `${baseUrl}/og-image.png`
    })
  );

  /** Meta siempre en español (`studySeo`) para SEO principal. */
  $effect(() => {
    const s = data.studySeo;
    setSeo({
      title: `${s.title} | Caso de Estudio | Moisés Valero`,
      description: s.seoDescription ?? s.heroDescription,
      ogTitle: `${s.title} | Caso de Estudio`,
      ogDescription: s.seoDescription ?? s.heroDescription,
      canonical,
      ogUrl: canonical,
      ogImage: `${baseUrl}/og-image.png`,
      twitterCard: 'summary_large_image'
    });
  });
</script>

<svelte:head>
  <title>{data.studySeo.title} | Caso de Estudio | Moisés Valero</title>
  <meta
    name="description"
    content={data.studySeo.seoDescription ?? data.studySeo.heroDescription}
  />
  <link rel="canonical" href={canonical} />
  <link rel="alternate" hreflang="es" href={canonical} />
  <link rel="alternate" hreflang="x-default" href={canonical} />
  <script type="application/ld+json">{projectJsonLd}</script>
</svelte:head>

<CaseStudyPage study={data.study} locale={data.locale} />
