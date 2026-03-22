<script lang="ts">
  import { env } from '$env/dynamic/public';
  import CaseStudyPage from '$lib/components/case-study/CaseStudyPage.svelte';
  import { setSeo } from '$lib/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');

  $effect(() => {
    const study = data.study;
    const canonical = `${baseUrl}/proyectos/${study.slug}`;
    setSeo({
      title: `${study.title} | Case study`,
      description: study.seoDescription ?? study.heroDescription,
      ogTitle: study.title,
      ogDescription: study.seoDescription ?? study.heroDescription,
      canonical,
      ogUrl: canonical,
      ogImage: `${baseUrl}/og-image.png`,
      twitterCard: 'summary_large_image'
    });
  });
</script>

<svelte:head>
  <title>{data.study.title} | Case study</title>
  <meta name="description" content={data.study.seoDescription ?? data.study.heroDescription} />
  <link rel="canonical" href={`${baseUrl}/proyectos/${data.study.slug}`} />
</svelte:head>

<CaseStudyPage study={data.study} />
