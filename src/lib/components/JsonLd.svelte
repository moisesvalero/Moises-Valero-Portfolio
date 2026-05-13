<script lang="ts">
  import { page } from '$app/state';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html';
  import { SITE_BASE_URL, type SeoFaqItem, type SeoHowToStep, type SeoSchemaType } from '$lib/seo';

  type Props = {
    type?: SeoSchemaType;
    faq?: SeoFaqItem[];
    howto?: SeoHowToStep[];
    softwareName?: string;
    softwareCategory?: string;
    /** Si false, no emite Organization (úsalo cuando la página ya inyecta su propio Organization). */
    emitOrganization?: boolean;
    /** Si false, no emite WebSite + SearchAction. */
    emitWebsite?: boolean;
    /** Si false, no emite BreadcrumbList. */
    emitBreadcrumb?: boolean;
  };

  let {
    type = 'WebPage',
    faq = [],
    howto = [],
    softwareName,
    softwareCategory,
    emitOrganization = true,
    emitWebsite = true,
    emitBreadcrumb = true
  }: Props = $props();

  const pathname = $derived(page.url?.pathname ?? '/');

  const organizationJson = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_BASE_URL}/#organization`,
      name: 'Moisés Valero',
      url: `${SITE_BASE_URL}/`,
      logo: `${SITE_BASE_URL}/apple-touch-icon.png`,
      sameAs: [
        'https://github.com/Moises2104',
        'https://www.linkedin.com/in/moises-valero-sanchez'
      ]
    })
  );

  const websiteJson = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_BASE_URL}/#website`,
      url: `${SITE_BASE_URL}/`,
      name: 'Moisés Valero',
      publisher: { '@id': `${SITE_BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_BASE_URL}/diseno-web-alcoy/articulos?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })
  );

  const breadcrumbJson = $derived(
    (() => {
      const segments = pathname.split('/').filter(Boolean);
      const items: Array<Record<string, unknown>> = [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_BASE_URL}/` }
      ];
      let acc = '';
      segments.forEach((seg, idx) => {
        acc += `/${seg}`;
        const name = decodeURIComponent(seg)
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        items.push({
          '@type': 'ListItem',
          position: idx + 2,
          name,
          item: `${SITE_BASE_URL}${acc}`
        });
      });
      return stringifyJsonLdForHtml({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items
      });
    })()
  );

  const pageJson = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': type,
      url: `${SITE_BASE_URL}${pathname}`,
      inLanguage: page.data?.locale ?? 'es'
    })
  );

  const faqJson = $derived(
    faq.length > 0
      ? stringifyJsonLdForHtml({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((q) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: { '@type': 'Answer', text: q.answer }
          }))
        })
      : ''
  );

  const howtoJson = $derived(
    howto.length > 0
      ? stringifyJsonLdForHtml({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'Pasos',
          step: howto.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
            ...(s.url ? { url: s.url } : {})
          }))
        })
      : ''
  );

  const softwareJson = $derived(
    softwareName
      ? stringifyJsonLdForHtml({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: softwareName,
          applicationCategory: softwareCategory ?? 'BusinessApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }
        })
      : ''
  );
</script>

<svelte:head>
  {#if emitOrganization}
    <svelte:element this={'script'} type="application/ld+json">{organizationJson}</svelte:element>
  {/if}
  {#if emitWebsite}
    <svelte:element this={'script'} type="application/ld+json">{websiteJson}</svelte:element>
  {/if}
  {#if emitBreadcrumb}
    <svelte:element this={'script'} type="application/ld+json">{breadcrumbJson}</svelte:element>
  {/if}
  <svelte:element this={'script'} type="application/ld+json">{pageJson}</svelte:element>
  {#if faqJson}
    <svelte:element this={'script'} type="application/ld+json">{faqJson}</svelte:element>
  {/if}
  {#if howtoJson}
    <svelte:element this={'script'} type="application/ld+json">{howtoJson}</svelte:element>
  {/if}
  {#if softwareJson}
    <svelte:element this={'script'} type="application/ld+json">{softwareJson}</svelte:element>
  {/if}
</svelte:head>
