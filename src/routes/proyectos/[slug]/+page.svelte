<script lang="ts">
  import { env } from '$env/dynamic/public';
  import CaseStudyPage from '$lib/components/case-study/CaseStudyPage.svelte';
  import { setSeo } from '$lib/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');

  /** Meta siempre en español (`studySeo`) para SEO principal. */
  $effect(() => {
    const s = data.studySeo;
    const canonical = `${baseUrl}/proyectos/${s.slug}`;
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
  <link rel="canonical" href={`${baseUrl}/proyectos/${data.studySeo.slug}`} />
</svelte:head>

<CaseStudyPage study={data.study} locale={data.locale} />
