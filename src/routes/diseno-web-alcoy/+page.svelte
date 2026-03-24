<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';
  import HeaderBrand from '$lib/components/HeaderBrand.svelte';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import HeroMacMockup from '$lib/components/landing/HeroMacMockup.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import { seo, setSeo } from '$lib/seo';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const landing = $derived(data.landing);
  const site = $derived(data.site);

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const canonicalUrl = $derived(
    landing.seo.canonicalPath.startsWith('http')
      ? landing.seo.canonicalPath
      : `${baseUrl}${landing.seo.canonicalPath.startsWith('/') ? '' : '/'}${landing.seo.canonicalPath}`
  );

  const emailDisplay = $derived(site.footer.emailHref.replace(/^mailto:/i, ''));
  const contactModal = $derived(landing.contactModal);
  const year = new Date().getFullYear();
  let isContactModalOpen = $state(false);
  let prefersReducedMotion = false;
  let contactForm = $state({
    name: '',
    email: '',
    phone: '',
    message: '',
    privacyAccepted: false
  });
  let contactStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
  let contactError = $state('');

  function openContactModal() {
    isContactModalOpen = true;
    contactStatus = 'idle';
    contactError = '';
  }

  function closeContactModal() {
    isContactModalOpen = false;
  }

  async function submitContactModalForm(event: SubmitEvent) {
    event.preventDefault();
    if (contactStatus === 'sending') return;
    contactStatus = 'sending';
    contactError = '';

    const response = await fetch('/api/contact/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm)
    });

    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) {
      contactStatus = 'error';
      contactError = data?.error || 'No se pudo enviar el formulario.';
      return;
    }

    contactStatus = 'success';
    contactForm = {
      name: '',
      email: '',
      phone: '',
      message: '',
      privacyAccepted: false
    };
  }

  onMount(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  function revealOnScroll(node: HTMLElement) {
    if (prefersReducedMotion) {
      node.classList.add('reveal-visible');
      return;
    }
    const desktop = window.matchMedia('(min-width: 1025px)').matches;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('reveal-visible');
            observer.unobserve(node);
          }
        }
      },
      desktop
        ? { threshold: 0.38, rootMargin: '0px 0px -18% 0px' }
        : { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  const faqJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: landing.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  );

  const localBusinessJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: landing.localBusiness.businessName,
      serviceType: landing.localBusiness.serviceType,
      areaServed: landing.localBusiness.areaServed.map((name) => ({ '@type': 'City', name })),
      address: {
        '@type': 'PostalAddress',
        addressLocality: landing.localBusiness.addressLocality,
        addressRegion: landing.localBusiness.addressRegion,
        addressCountry: landing.localBusiness.addressCountry
      },
      telephone: landing.localBusiness.telephone,
      email: landing.localBusiness.email,
      url: canonicalUrl
    })
  );

  const webPageJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: landing.seo.title,
      description: landing.seo.description,
      inLanguage: 'es',
      url: canonicalUrl
    })
  );

  const breadcrumbJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: `${baseUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Diseño web en Alcoy',
          item: canonicalUrl
        }
      ]
    })
  );

  const serviceIcons = ['ads_click', 'business', 'code'];

  $effect(() => {
    setSeo({
      title: landing.seo.title,
      description: landing.seo.description,
      ogTitle: landing.seo.ogTitle,
      ogDescription: landing.seo.ogDescription,
      canonical: canonicalUrl,
      ogUrl: canonicalUrl,
      ogImage: landing.seo.ogImage,
      twitterCard: landing.seo.twitterCard
    });
  });
</script>

<svelte:head>
  <title>{$seo.title}</title>
  <meta name="description" content={$seo.description} />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href={$seo.canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={$seo.ogTitle} />
  <meta property="og:description" content={$seo.ogDescription} />
  <meta property="og:url" content={$seo.ogUrl} />
  <meta property="og:image" content={$seo.ogImage} />
  <meta property="og:locale" content="es_ES" />
  <meta name="twitter:card" content={$seo.twitterCard} />
  <meta name="twitter:title" content={$seo.ogTitle} />
  <meta name="twitter:description" content={$seo.ogDescription} />
  <meta name="twitter:image" content={$seo.ogImage} />
  <link
    href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
    rel="stylesheet"
  />
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script src="/js/landing-tailwind-config.js"></script>
  <JsonLdScript json={localBusinessJsonLd} />
  <JsonLdScript json={webPageJsonLd} />
  <JsonLdScript json={faqJsonLd} />
  <JsonLdScript json={breadcrumbJsonLd} />
</svelte:head>

<div id="top" class="scroll-smooth stitch-landing font-body text-on-surface bg-surface min-h-screen">
  <nav class="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm">
    <div class="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
      <HeaderBrand
        href="#top"
        ariaLabel="Moisés Valero — Desarrollador web"
      />
      <div class="hidden md:flex space-x-8">
        <a
          class="text-slate-600 font-medium hover:text-[#006c49] transition-colors duration-200 no-underline"
          href="#services">Servicios</a>
        <a
          class="text-slate-600 font-medium hover:text-[#006c49] transition-colors duration-200 no-underline"
          href="#benefits">Beneficios</a>
        <a
          class="text-slate-600 font-medium hover:text-[#006c49] transition-colors duration-200 no-underline"
          href="#faq">FAQ</a>
        <a
          class="text-slate-600 font-medium hover:text-[#006c49] transition-colors duration-200 no-underline"
          href="#contact">Contacto</a>
      </div>
      <a
        href="#contact"
        class="cta-hover cta-hover-header bg-secondary text-on-secondary px-5 py-2 rounded-md font-semibold hover:shadow-[0_0_15px_rgba(0,108,73,0.3)] transition-all active:scale-95 no-underline inline-flex items-center justify-center"
      >
        Contactar
      </a>
    </div>
  </nav>

  <main class="pt-6 md:pt-8">
    <section
      class="hero-b section-glow relative min-h-0 py-10 md:py-0 md:min-h-[820px] lg:min-h-[860px] flex items-start md:items-center overflow-x-clip overflow-y-visible bg-primary px-6"
    >
      <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div
          class="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-container blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-container blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"
        ></div>
      </div>
      <div
        class="max-w-7xl mx-auto w-full grid grid-cols-1 gap-12 md:gap-14 items-center relative z-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-20 xl:gap-24"
      >
        <div class="space-y-8 max-w-xl lg:max-w-2xl">
          <h1
            class="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight"
          >
            {landing.hero.title}
          </h1>
          <p class="text-on-primary-container text-lg md:text-xl max-w-lg leading-relaxed">
            {landing.hero.subtitle}
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href={landing.hero.cta.href}
              class="cta-hover cta-hover-primary bg-secondary text-on-secondary px-8 py-4 rounded-md font-bold text-lg hover:shadow-[0_0_20px_rgba(0,108,73,0.4)] transition-all active:scale-95 text-center no-underline inline-flex items-center justify-center"
            >
              {landing.hero.cta.label}
            </a>
            <a
              class="cta-hover cta-hover-ghost inline-flex items-center text-white font-semibold py-4 px-8 border-b-2 border-secondary-container/30 hover:border-secondary transition-all no-underline"
              href={landing.hero.cta.secondaryHref || '#services'}
            >
              {landing.hero.cta.secondaryLabel || 'Ver servicios'}
            </a>
          </div>
        </div>
        <div class="relative min-w-0 w-full overflow-visible md:pl-4 lg:pl-8">
          <div
            class="relative mx-auto w-full max-w-[min(100%,440px)] md:max-w-[900px] md:ml-auto md:mr-0 flex flex-col items-center [&_.mac-mockup-root]:w-full [&_.mac-mockup-root]:max-w-none"
          >
            <div class="w-full flex justify-center lg:justify-end">
              <HeroMacMockup />
            </div>
            <div
              class="relative mt-5 mx-auto w-full max-w-[280px] z-20 glass-card p-5 lg:p-6 rounded-xl shadow-xl border border-white/20 md:absolute md:mt-0 md:mx-0 md:w-auto md:max-w-[280px] md:bottom-0 md:-left-20 lg:-left-28 md:translate-y-[60%] lg:translate-y-[64%]"
            >
              <div class="flex items-center gap-4 mb-2">
                <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1"
                  >trending_up</span>
                <span class="text-xs font-bold uppercase tracking-wider text-primary">SEO local Alcoy</span>
              </div>
              <p class="text-2xl font-black text-primary">+ visibilidad</p>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Estructura y contenido pensados para buscadores y clientes en la zona.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="reveal-b py-24 bg-surface px-6" id="services" use:revealOnScroll>
      <div class="max-w-7xl mx-auto">
        <div class="mb-16">
          <span class="text-secondary font-bold tracking-widest uppercase text-sm block mb-4"
            >Servicios</span>
          <h2 class="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-6">
            {landing.services.heading}
          </h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          {#each landing.services.items as service, idx (service.title + idx)}
            <div
              class="card-b bg-surface-container-lowest p-8 rounded-xl group hover:translate-y-[-4px] transition-transform duration-300 h-full flex flex-col"
            >
              <div
                class="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6"
              >
                <span class="material-symbols-outlined text-on-secondary-container">{serviceIcons[idx] || 'code'}</span>
              </div>
              <h3 class="font-headline text-2xl font-bold text-primary mb-4">{service.title}</h3>
              <p class="text-on-surface-variant leading-relaxed mb-6">{service.description}</p>
              <a
                class="mt-auto text-secondary font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all no-underline"
                href={landing.finalCta.cta.href}
              >
                Quiero esta opción <span class="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="reveal-b py-24 bg-surface-container-low px-6 overflow-hidden" id="benefits" use:revealOnScroll>
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div class="order-2 md:order-1 relative">
          <div
            class="relative z-10 rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
          >
            <img
              alt="Diseño web en Alcoy — referencia visual del servicio"
              class="w-full h-[500px] object-cover"
              src="/imagenes/DISEÑO-WEB-ALCOY.webp"
            />
          </div>
          <div class="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        <div class="order-1 md:order-2 space-y-10">
          <div>
            <span class="text-secondary font-bold tracking-widest uppercase text-sm block mb-4"
              >Por qué elegirme</span>
            <h2
              class="font-headline text-4xl md:text-5xl font-extrabold text-primary leading-tight"
            >
              {landing.benefits.heading}
            </h2>
          </div>
          <div class="space-y-8">
            {#each landing.benefits.items as benefit (benefit.title)}
              <div class="flex gap-6">
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center"
                >
                  <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1"
                    >check</span>
                </div>
                <div>
                  <h4 class="font-headline text-xl font-bold text-primary mb-2">{benefit.title}</h4>
                  <p class="text-on-surface-variant leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <section class="reveal-b py-24 bg-surface px-6" id="faq" use:revealOnScroll>
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="font-headline text-3xl md:text-4xl font-extrabold text-primary mb-4">
            {landing.faq.heading}
          </h2>
          <p class="text-on-surface-variant">Respuestas rápidas antes de pedir presupuesto.</p>
        </div>
        <div class="space-y-6">
          {#each landing.faq.items as item (item.question)}
            <div class="card-b bg-surface-container p-6 rounded-lg">
              <h4 class="font-headline font-bold text-primary text-lg mb-3">{item.question}</h4>
              <p class="text-on-surface-variant leading-relaxed">{item.answer}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="reveal-b py-24 px-6 relative overflow-hidden" id="contact" use:revealOnScroll>
      <div
        class="max-w-7xl mx-auto bg-primary-container rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
      >
        <div class="absolute inset-0 opacity-10">
          <div class="absolute -top-10 -right-10 w-96 h-96 border-4 border-secondary rounded-full"></div>
          <div
            class="absolute -bottom-20 -left-20 w-[500px] h-[500px] border-2 border-secondary-container rounded-full"
          ></div>
        </div>
        <div class="relative z-10 space-y-8">
          <h2 class="font-headline text-4xl md:text-6xl font-extrabold text-white">
            {landing.finalCta.heading}
          </h2>
          <p class="text-on-primary-container text-lg max-w-2xl mx-auto leading-relaxed">
            {landing.finalCta.text}
          </p>
          <div class="pt-6 flex flex-col items-center gap-6">
            <a
              href={landing.finalCta.cta.href}
              class="btn-shine bg-secondary text-on-secondary px-10 py-5 rounded-md font-bold text-xl hover:shadow-[0_0_25px_rgba(0,108,73,0.5)] transition-all active:scale-95 no-underline inline-flex items-center justify-center"
            >
              {landing.finalCta.cta.label}
            </a>
            <div
              class="flex flex-col md:flex-row items-center gap-8 text-on-primary-container font-medium mt-4"
            >
              <a
                class="flex items-center gap-2 hover:text-white transition-colors no-underline"
                href={site.footer.emailHref}
              >
                <span class="material-symbols-outlined text-secondary">mail</span>
                {emailDisplay}
              </a>
              <a
                class="flex items-center gap-2 hover:text-white transition-colors no-underline"
                href="/api/contact/whatsapp"
              >
                <span class="material-symbols-outlined text-secondary">phone_iphone</span>
                WhatsApp
              </a>
              <button
                type="button"
                onclick={openContactModal}
                class="flex items-center gap-2 hover:text-white transition-colors bg-transparent border-0 p-0 text-on-primary-container font-medium cursor-pointer"
              >
                <span class="material-symbols-outlined text-secondary">edit_square</span>
                {contactModal.triggerLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-[#f7f9fb] py-14 px-6 w-full border-t border-slate-200/80">
    <div class="max-w-7xl mx-auto">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <a href="/" class="inline-block text-xl font-black tracking-tight text-[#002045] no-underline hover:opacity-90">
            {site.header.logoText}
          </a>
          <p class="text-slate-600 leading-relaxed max-w-xs">
            Diseño y desarrollo web rápido para negocios de Alcoy, Alicante y alrededores.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-bold tracking-wide uppercase text-slate-900 mb-4">Navegación</h3>
          <ul class="space-y-3">
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#services">Servicios</a></li>
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#benefits">Beneficios</a></li>
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#faq">FAQ</a></li>
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#contact">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-bold tracking-wide uppercase text-slate-900 mb-4">Servicios</h3>
          <ul class="space-y-3">
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#services">{landing.services.items[0]?.title || 'Servicio 1'}</a></li>
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#services">{landing.services.items[1]?.title || 'Servicio 2'}</a></li>
            <li><a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="/#proyectos">Proyectos</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-bold tracking-wide uppercase text-slate-900 mb-4">Contacto</h3>
          <ul class="space-y-3">
            <li>
              <a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href={site.footer.emailHref}>
                {emailDisplay}
              </a>
            </li>
            <li>
              <a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="/api/contact/whatsapp">
                WhatsApp
              </a>
            </li>
            <li>
              <button
                type="button"
                onclick={openContactModal}
                class="text-slate-600 hover:text-[#002045] transition-colors bg-transparent p-0 border-0 cursor-pointer"
              >
                {contactModal.triggerLabel}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-500">
        <p>
          © {year} {site.header.logoText}. Todos los derechos reservados.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <a class="hover:text-[#002045] transition-colors no-underline" href="/privacidad">Privacidad</a>
          <a class="hover:text-[#002045] transition-colors no-underline" href="/cookies">Cookies</a>
        </div>
      </div>
    </div>
  </footer>

  {#if isContactModalOpen}
    <div class="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6">
      <button
        type="button"
        onclick={closeContactModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar modal"
      ></button>
      <div
        class="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div class="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-100">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-headline text-2xl md:text-3xl font-extrabold text-primary">{contactModal.heading}</h3>
              <p class="text-slate-600 mt-2">{contactModal.text}</p>
            </div>
            <button
              type="button"
              onclick={closeContactModal}
              class="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-9 h-9 inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form class="px-6 md:px-8 py-6 space-y-4" onsubmit={submitContactModalForm}>
          <div class="grid md:grid-cols-2 gap-4">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Nombre *</span>
              <input
                class="mt-1 w-full rounded-lg border-slate-300 focus:border-[#006c49] focus:ring-[#006c49]"
                required
                bind:value={contactForm.name}
                maxlength="100"
              />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Email *</span>
              <input
                type="email"
                class="mt-1 w-full rounded-lg border-slate-300 focus:border-[#006c49] focus:ring-[#006c49]"
                required
                bind:value={contactForm.email}
                maxlength="120"
              />
            </label>
          </div>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Teléfono (opcional)</span>
            <input
              class="mt-1 w-full rounded-lg border-slate-300 focus:border-[#006c49] focus:ring-[#006c49]"
              bind:value={contactForm.phone}
              maxlength="40"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Cuéntame qué necesitas *</span>
            <textarea
              class="mt-1 w-full rounded-lg border-slate-300 focus:border-[#006c49] focus:ring-[#006c49] min-h-[130px]"
              required
              bind:value={contactForm.message}
              maxlength="2000"
            ></textarea>
          </label>

          <label class="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              class="mt-0.5 rounded border-slate-300 text-[#006c49] focus:ring-[#006c49]"
              required
              bind:checked={contactForm.privacyAccepted}
            />
            <span
              >{contactModal.privacyLabel}
              <a class="text-[#006c49] font-semibold hover:underline no-underline" href="/privacidad"
                >Ver política</a
              ></span
            >
          </label>

          {#if contactStatus === 'error' && contactError}
            <p class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{contactError}</p>
          {/if}
          {#if contactStatus === 'success'}
            <p class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {contactModal.successMessage}
            </p>
          {/if}

          <div class="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onclick={closeContactModal}
              class="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={contactStatus === 'sending'}
              class="px-6 py-3 rounded-lg bg-white text-[#111] border border-[#1f1f1f] font-bold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {contactStatus === 'sending' ? 'Enviando...' : contactModal.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes bHeroIn {
    from {
      opacity: 0;
      transform: translateY(34px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes bGlowPulse {
    0%,
    100% {
      opacity: 0.38;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.11);
    }
  }

  @keyframes bShineMove {
    0% {
      transform: translateX(-120%) skewX(-18deg);
    }
    100% {
      transform: translateX(220%) skewX(-18deg);
    }
  }

  .hero-b {
    animation: bHeroIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .section-glow::after {
    content: '';
    position: absolute;
    width: min(60vw, 640px);
    height: min(60vw, 640px);
    right: -16%;
    top: -20%;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(89, 139, 255, 0.2) 0%, rgba(0, 108, 73, 0.08) 42%, transparent 70%);
    filter: blur(20px);
    pointer-events: none;
    animation: bGlowPulse 6.2s ease-in-out infinite;
    z-index: 0;
  }

  .reveal-b {
    opacity: 0;
    transform: translateY(56px) scale(0.95);
    transition:
      opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 1200ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  :global(.reveal-b.reveal-visible) {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .card-b {
    position: relative;
    transition:
      transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 420ms ease,
      border-color 420ms ease;
    border: 1px solid rgba(0, 32, 69, 0.06);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
  }

  .card-b:hover {
    transform: translateY(-14px) scale(1.015);
    box-shadow:
      0 30px 42px rgba(0, 32, 69, 0.2),
      0 0 0 1px rgba(0, 108, 73, 0.34);
    border-color: rgba(0, 108, 73, 0.36);
  }

  .btn-shine {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .btn-shine::after {
    content: '';
    position: absolute;
    inset: -40% auto -40% -30%;
    width: 28%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    pointer-events: none;
    animation: bShineMove 2.3s ease-in-out infinite;
    z-index: 1;
  }

  .cta-hover {
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 260ms ease,
      filter 260ms ease;
    isolation: isolate;
  }

  .cta-hover::after {
    content: '';
    position: absolute;
    top: -40%;
    left: -34%;
    width: 28%;
    height: 180%;
    background: linear-gradient(100deg, transparent 5%, rgba(255, 255, 255, 0.55) 48%, transparent 92%);
    transform: translateX(-180%) skewX(-16deg);
    opacity: 0;
    pointer-events: none;
  }

  .cta-hover:hover {
    transform: translateY(-2px) scale(1.015);
    filter: saturate(1.08);
  }

  .cta-hover:hover::after {
    opacity: 1;
    animation: bShineMove 0.95s ease-out;
  }

  .cta-hover-primary:hover {
    box-shadow:
      0 10px 24px rgba(0, 108, 73, 0.38),
      0 0 0 1px rgba(255, 255, 255, 0.22) inset;
  }

  .cta-hover-ghost:hover {
    text-shadow: 0 0 16px rgba(255, 255, 255, 0.26);
    border-color: rgba(182, 245, 224, 0.7);
  }

  .cta-hover-header:hover {
    box-shadow:
      0 8px 20px rgba(0, 108, 73, 0.36),
      0 0 0 1px rgba(255, 255, 255, 0.18) inset;
  }

  :global(.stitch-landing .material-symbols-outlined) {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
    display: inline-block;
    vertical-align: middle;
  }
  :global(.stitch-landing .glass-card) {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  @media (max-width: 1024px) {
    .section-glow::after {
      width: 66vw;
      height: 66vw;
      right: -22%;
      top: -16%;
    }
    .card-b:hover {
      transform: translateY(-7px) scale(1.01);
    }
  }

  @media (max-width: 768px) {
    .reveal-b {
      transform: translateY(24px);
      transition:
        opacity 680ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 680ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .section-glow::after {
      width: 84vw;
      height: 84vw;
      right: -40%;
      top: -14%;
      opacity: 0.55;
    }
    .card-b,
    .card-b:hover {
      transform: none;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
    }

    .cta-hover:hover {
      transform: none;
      filter: none;
    }

    .cta-hover::after,
    .cta-hover:hover::after {
      opacity: 0;
      animation: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-b,
    .section-glow::after,
    .reveal-b,
    .card-b,
    .btn-shine::after {
      animation: none !important;
      transition: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>
