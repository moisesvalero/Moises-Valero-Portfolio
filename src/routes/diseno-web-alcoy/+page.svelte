<script lang="ts">
  import '$lib/styles/alcoy-landing-fonts.css';
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

  const contactModal = $derived(landing.contactModal);
  const sectionData = $derived({
    eyebrow: 'Por qué elegirme',
    title: landing.benefits.heading,
    features: landing.benefits.items,
    buttonLabel: landing.benefits.buttonLabel || 'Contactar ahora',
    buttonUrl: landing.benefits.buttonUrl || landing.finalCta.cta.href
  });
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
  let activeServiceIndex = $state<number | null>(null);
  let activeMaintenanceIndex = $state<number | null>(null);
  let faqOpenIndex = $state<number | null>(null);
  let isMobileNavOpen = $state(false);
  let heroSectionEl: HTMLElement | null = null;
  let heroCursorFxEnabled = false;
  let heroPointerInside = false;
  let heroMobileParallaxEnabled = false;
  let heroParallaxRaf = 0;
  let isHeaderScrolled = $state(false);

  type TailwindRuntime = {
    refresh?: () => void;
  };

  const TAILWIND_CDN_SRC = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
  const TAILWIND_CONFIG_SRC = '/js/landing-tailwind-config.js';

  const serviceOffers = $derived(landing.services.items);
  const maintenanceOptions = $derived(landing.maintenance.items);
  const footerServices = $derived(landing.services.items.filter((item) => item.title?.trim().length));
  const maintenanceFooterLabel = $derived(landing.maintenance.footerLabel || 'Mantenimiento');

  function openContactModal() {
    isMobileNavOpen = false;
    isContactModalOpen = true;
    contactStatus = 'idle';
    contactError = '';
  }

  function closeContactModal() {
    isContactModalOpen = false;
  }

  function openServiceModal(index: number) {
    activeServiceIndex = index;
  }

  function closeServiceModal() {
    activeServiceIndex = null;
  }

  function openMaintenanceModal(index: number) {
    activeMaintenanceIndex = index;
  }

  function closeMaintenanceModal() {
    activeMaintenanceIndex = null;
  }

  function toggleFaq(index: number) {
    faqOpenIndex = faqOpenIndex === index ? null : index;
  }

  function toggleMobileNav() {
    isMobileNavOpen = !isMobileNavOpen;
  }

  function closeMobileNav() {
    isMobileNavOpen = false;
  }

  function handleHeroPointerMove(event: PointerEvent) {
    if (!heroSectionEl || !heroCursorFxEnabled) return;
    const rect = heroSectionEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!isInside) {
      if (heroPointerInside) {
        heroPointerInside = false;
        resetHeroPointerFx();
      }
      return;
    }
    heroPointerInside = true;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    heroSectionEl.style.setProperty('--hero-cx', `${Math.min(100, Math.max(0, x))}%`);
    heroSectionEl.style.setProperty('--hero-cy', `${Math.min(100, Math.max(0, y))}%`);
  }

  function resetHeroPointerFx() {
    if (!heroSectionEl) return;
    heroSectionEl.style.setProperty('--hero-cx', '74%');
    heroSectionEl.style.setProperty('--hero-cy', '42%');
  }

  function syncHeaderScrollState() {
    isHeaderScrolled = window.scrollY > 12;
  }

  function resetHeroMobileParallaxFx() {
    if (!heroSectionEl) return;
    heroSectionEl.style.setProperty('--hero-mobile-shift-y', '0px');
    heroSectionEl.style.setProperty('--hero-aurora-y', '0px');
  }

  function applyHeroMobileParallax(scrollY: number) {
    if (!heroSectionEl || !heroMobileParallaxEnabled) return;
    const clampedY = Math.min(240, Math.max(0, scrollY));
    const mockupShift = -(clampedY * 0.06);
    const auroraShift = -(clampedY * 0.04);
    heroSectionEl.style.setProperty('--hero-mobile-shift-y', `${mockupShift.toFixed(2)}px`);
    heroSectionEl.style.setProperty('--hero-aurora-y', `${auroraShift.toFixed(2)}px`);
  }

  function ensureExternalScript(src: string, id: string) {
    return new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (existing) {
        // Si ya existe en el head (SSR/cliente), continuamos y delegamos en los reintentos de refresh.
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureLandingTailwindReady() {
    try {
      await ensureExternalScript(TAILWIND_CDN_SRC, 'alcoy-tailwind-cdn');
      await ensureExternalScript(TAILWIND_CONFIG_SRC, 'alcoy-tailwind-config');
    } catch {
      // Si falla la carga externa, mantenemos los estilos fallback inline del layout.
    }

    await new Promise<void>((resolve) => {
      let attempts = 0;
      const retryRefresh = () => {
        const tw = (window as Window & { tailwind?: TailwindRuntime }).tailwind;
        if (tw?.refresh) {
          tw.refresh();
          window.setTimeout(() => tw.refresh?.(), 30);
          resolve();
          return;
        }
        attempts += 1;
        if (attempts < 80) {
          window.setTimeout(retryRefresh, 80);
          return;
        }
        resolve();
      };
      retryRefresh();
    });
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
    heroCursorFxEnabled =
      !prefersReducedMotion &&
      window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
    heroMobileParallaxEnabled =
      !prefersReducedMotion &&
      window.matchMedia('(max-width: 640px)').matches &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches;
    resetHeroPointerFx();
    resetHeroMobileParallaxFx();
    syncHeaderScrollState();
    const onMobileScroll = () => {
      if (!heroMobileParallaxEnabled) return;
      if (heroParallaxRaf) return;
      heroParallaxRaf = window.requestAnimationFrame(() => {
        heroParallaxRaf = 0;
        applyHeroMobileParallax(window.scrollY);
      });
    };
    const onHeaderScroll = () => {
      syncHeaderScrollState();
    };
    window.addEventListener('scroll', onMobileScroll, { passive: true });
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onMobileScroll();
    if (window.matchMedia('(min-width: 1024px)').matches && landing.faq.items.length > 0) {
      faqOpenIndex = 0;
    }
    // En SPA la carga del runtime/config de Tailwind puede llegar tarde.
    // Blindamos scripts + refresh para evitar render blanco sin fondo.
    void ensureLandingTailwindReady();
    return () => {
      window.removeEventListener('scroll', onMobileScroll);
      window.removeEventListener('scroll', onHeaderScroll);
      if (heroParallaxRaf) {
        window.cancelAnimationFrame(heroParallaxRaf);
      }
    };
  });

  $effect(() => {
    if (typeof document === 'undefined') return;
    const hasOpenModal =
      isContactModalOpen || activeServiceIndex !== null || activeMaintenanceIndex !== null;
    document.body.style.overflow = hasOpenModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  });

  function revealOnScroll(node: HTMLElement) {
    if (prefersReducedMotion) {
      node.classList.add('reveal-visible');
      return;
    }
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const touchLikeDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (mobile || touchLikeDevice) {
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
        ? { threshold: 0.16, rootMargin: '0px 0px -6% 0px' }
        : { threshold: 0.04, rootMargin: '0px 0px -2% 0px' }
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
  <script id="alcoy-tailwind-cdn" src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script id="alcoy-tailwind-config" src="/js/landing-tailwind-config.js"></script>
  <JsonLdScript json={localBusinessJsonLd} />
  <JsonLdScript json={webPageJsonLd} />
  <JsonLdScript json={faqJsonLd} />
  <JsonLdScript json={breadcrumbJsonLd} />
</svelte:head>

<svelte:window onpointermove={handleHeroPointerMove} />

<div
  id="top"
  class="scroll-smooth stitch-landing font-body text-on-surface bg-surface min-h-screen"
  style="background:#f7f9fb;color:#191c1e;"
>
  <nav
    class={`alcoy-dynamic-header fixed top-0 w-full z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[460ms] ${
      isHeaderScrolled
        ? 'is-scrolled bg-white/70 backdrop-blur-md border-b border-white/55 shadow-[0_10px_28px_rgba(15,23,42,0.08)]'
        : 'is-top bg-transparent border-b border-transparent shadow-none'
    }`}
  >
    <div class="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
      <HeaderBrand
        href="#top"
        ariaLabel="Moisés Valero — Desarrollador web"
      />
      <div class="hidden md:flex space-x-8">
        <a
          class={`alcoy-nav-link header-link-premium font-medium transition-colors duration-200 no-underline ${
            isHeaderScrolled ? 'is-scrolled text-slate-700 hover:text-[#006c49]' : 'is-top text-white/90 hover:text-white'
          }`}
          href="#services">Servicios</a>
        <a
          class={`alcoy-nav-link header-link-premium font-medium transition-colors duration-200 no-underline ${
            isHeaderScrolled ? 'is-scrolled text-slate-700 hover:text-[#006c49]' : 'is-top text-white/90 hover:text-white'
          }`}
          href="#benefits">Beneficios</a>
        <a
          class={`alcoy-nav-link header-link-premium font-medium transition-colors duration-200 no-underline ${
            isHeaderScrolled ? 'is-scrolled text-slate-700 hover:text-[#006c49]' : 'is-top text-white/90 hover:text-white'
          }`}
          href="#faq">FAQ</a>
        <a
          class={`alcoy-nav-link header-link-premium font-medium transition-colors duration-200 no-underline ${
            isHeaderScrolled ? 'is-scrolled text-slate-700 hover:text-[#006c49]' : 'is-top text-white/90 hover:text-white'
          }`}
          href="#contact">Contacto</a>
      </div>
      <div class="flex items-center gap-3">
        <a
          href="#contact"
          class={`hidden md:inline-flex cta-hover cta-hover-header alcoy-contact-cta px-5 py-2 rounded-md font-semibold transition-all active:scale-95 no-underline items-center justify-center ${
            isHeaderScrolled
              ? 'bg-secondary text-on-secondary hover:shadow-[0_0_15px_rgba(0,108,73,0.3)]'
              : 'bg-white/10 text-white border border-white/35 hover:bg-white/16 hover:shadow-[0_8px_22px_rgba(9,13,34,0.3)]'
          }`}
        >
          Contactar
        </a>
        <button
          type="button"
          class={`hamburger-toggle md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
            isMobileNavOpen ? 'is-open' : ''
          } ${
            isHeaderScrolled
              ? 'border border-slate-200 text-slate-700 bg-white/80'
              : 'border border-white/30 text-white bg-white/10'
          }`}
          onclick={toggleMobileNav}
          aria-expanded={isMobileNavOpen}
          aria-label={isMobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span class="hamburger-icon" aria-hidden="true">
            <span class="hamburger-line line-top"></span>
            <span class="hamburger-line line-mid"></span>
            <span class="hamburger-line line-bot"></span>
          </span>
        </button>
      </div>
    </div>
    {#if isMobileNavOpen}
      <div
        class={`mobile-nav-panel md:hidden border-t backdrop-blur-md ${
          isHeaderScrolled
            ? 'border-slate-200 bg-white/95 shadow-sm'
            : 'border-white/20 bg-white/8 shadow-[0_14px_28px_rgba(8,12,34,0.28)]'
        }`}
      >
        <div class="px-6 py-4 flex flex-col gap-3">
          <a
            class={`font-medium no-underline py-1 ${
              isHeaderScrolled ? 'text-slate-700' : 'text-white/90 hover:text-white'
            }`}
            href="#services"
            onclick={closeMobileNav}>Servicios</a>
          <a
            class={`font-medium no-underline py-1 ${
              isHeaderScrolled ? 'text-slate-700' : 'text-white/90 hover:text-white'
            }`}
            href="#benefits"
            onclick={closeMobileNav}>Beneficios</a>
          <a
            class={`font-medium no-underline py-1 ${
              isHeaderScrolled ? 'text-slate-700' : 'text-white/90 hover:text-white'
            }`}
            href="#faq"
            onclick={closeMobileNav}>FAQ</a>
          <a
            class={`font-medium no-underline py-1 ${
              isHeaderScrolled ? 'text-slate-700' : 'text-white/90 hover:text-white'
            }`}
            href="#contact"
            onclick={closeMobileNav}>Contacto</a>
          <a
            class={`mt-2 inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold no-underline ${
              isHeaderScrolled
                ? 'bg-secondary text-on-secondary'
                : 'bg-white/14 text-white border border-white/30 hover:bg-white/20'
            }`}
            href="#contact"
            onclick={closeMobileNav}
          >
            Contactar
          </a>
        </div>
      </div>
    {/if}
  </nav>

  <main class="pt-0">
    <section
      class="hero-b section-glow relative min-h-0 pt-24 pb-10 md:py-0 md:min-h-[820px] lg:min-h-[860px] flex items-start md:items-center overflow-x-clip overflow-y-visible bg-primary px-6"
      style="background: radial-gradient(circle at 74% 40%, #3a4aa0 0%, #2a377f 34%, #1a2258 66%, #0f1538 100%);"
      bind:this={heroSectionEl}
    >
      <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div
          class="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-container blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-container blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"
        ></div>
      </div>
      <div class="hero-tech-pattern" aria-hidden="true"></div>
      <div class="hero-depth-grid" aria-hidden="true"></div>
      <div class="hero-depth-aurora" aria-hidden="true"></div>
      <div class="hero-cursor-light" aria-hidden="true"></div>
      <div class="hero-depth-vignette" aria-hidden="true"></div>
      <div
        class="max-w-7xl mx-auto w-full grid grid-cols-1 gap-12 md:gap-14 items-center relative z-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-20 xl:gap-24"
      >
        <div class="space-y-8 max-w-xl lg:max-w-2xl">
          <h1
            class="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight"
          >
            {landing.hero.title}
          </h1>
          <div class="hero-title-accent" aria-hidden="true"></div>
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
        <div class="hero-visual-col relative min-w-0 w-full overflow-visible md:pl-4 lg:pl-8">
          <div
            class="relative mx-auto w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,420px)] md:max-w-[900px] md:ml-auto md:mr-0 flex flex-col items-center [&_.mac-mockup-root]:w-full [&_.mac-mockup-root]:max-w-none"
          >
            <div class="hero-mockup-wrap w-full flex justify-center md:pt-10 lg:pt-16 xl:pt-20">
              <HeroMacMockup />
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
          {#each serviceOffers as service, idx (service.title + idx)}
            <div
              class="card-b bg-surface-container-lowest p-8 rounded-xl group hover:translate-y-[-4px] transition-transform duration-300 h-full flex flex-col"
            >
              <div
                class="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6"
              >
                <span class="material-symbols-outlined text-on-secondary-container">{serviceIcons[idx] || 'code'}</span>
              </div>
              <h3 class="font-headline text-2xl font-bold text-primary mb-4">{service.title}</h3>
              {#if service.subtitle}
                <p class="text-sm font-semibold text-on-surface-variant -mt-2 mb-4">{service.subtitle}</p>
              {/if}
              <p class="text-on-surface-variant leading-relaxed mb-4">{service.summary}</p>
              {#if service.offerBadge}
                <span class="inline-flex items-center self-start mb-4 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold">
                  {service.offerBadge}
                </span>
              {/if}
              <div class="mt-auto">
              <p class="text-primary font-extrabold text-xl mb-1">
                {service.hideFromLabel ? service.priceFrom : `Desde ${service.priceFrom}`}
              </p>
                {#if service.delivery}
                  <p class="text-sm text-on-surface-variant mb-6">Entrega estimada: {service.delivery}</p>
                {:else}
                  <p class="text-sm text-on-surface-variant mb-6">Entrega estimada según alcance</p>
                {/if}
              </div>
              <button
                type="button"
                class="text-secondary font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all bg-transparent border-0 p-0 cursor-pointer"
                onclick={() => openServiceModal(idx)}
              >
                Ver detalles <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          {/each}
        </div>
        {#if landing.services.pricingFootnote}
          <p class="mt-6 text-sm text-on-surface-variant text-right">{landing.services.pricingFootnote}</p>
        {/if}
        <div id="maintenance" class="mt-12 card-b bg-surface-container p-8 md:p-10 rounded-xl scroll-mt-28 md:scroll-mt-32">
          <h3 class="font-headline text-2xl md:text-3xl font-extrabold text-primary mb-3">
            {landing.maintenance.heading}
          </h3>
          <p class="text-on-surface-variant mb-8">
            {landing.maintenance.lead}
          </p>
          <div class="grid md:grid-cols-2 gap-6 items-stretch">
            {#each maintenanceOptions as option, idx (option.title)}
              <article class="bg-surface-container-lowest border border-slate-200 rounded-lg p-6 h-full flex flex-col">
                <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container mb-3">
                  <span class="material-symbols-outlined text-on-secondary-container" style="font-size:20px;">{option.icon}</span>
                </div>
                <h4 class="font-bold text-primary mb-2">{option.title}</h4>
                <p class="font-extrabold text-secondary text-lg mb-3">{option.price}</p>
                <p class="text-on-surface-variant leading-relaxed mb-4">{option.detail}</p>
                <button
                  type="button"
                  class="mt-auto text-secondary font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all bg-transparent border-0 p-0 cursor-pointer"
                  onclick={() => openMaintenanceModal(idx)}
                >
                  Ver detalles <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </article>
            {/each}
          </div>
          {#if landing.maintenance.pricingFootnote}
            <p class="mt-6 text-sm text-on-surface-variant text-right">{landing.maintenance.pricingFootnote}</p>
          {/if}
        </div>
      </div>
    </section>

    <section class="reveal-b py-24 bg-surface-container-low px-6 overflow-hidden" id="benefits" use:revealOnScroll>
      <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div class="order-2 md:order-1 relative flex items-center">
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
        <div class="order-1 md:order-2 flex flex-col gap-10 md:gap-12">
          <div>
            <span class="text-secondary font-bold tracking-widest uppercase text-sm block mb-4"
              >{sectionData.eyebrow}</span>
            <h2
              class="font-headline text-4xl md:text-5xl font-extrabold text-primary leading-tight md:max-w-[16ch]"
            >
              {sectionData.title}
            </h2>
          </div>
          <div class="space-y-8">
            {#each sectionData.features as benefit (benefit.title)}
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
            <a
              href={sectionData.buttonUrl}
              class="cta-hover cta-hover-primary inline-flex items-center justify-center bg-secondary text-on-secondary px-8 py-4 rounded-md font-bold text-base hover:shadow-[0_0_20px_rgba(0,108,73,0.4)] transition-all active:scale-95 mt-8 no-underline"
            >
              {sectionData.buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="reveal-b faq-premium py-24 bg-surface px-6" id="faq" use:revealOnScroll>
      <div class="faq-shell max-w-6xl mx-auto">
        <div class="text-center mb-16 relative z-10">
          <span class="faq-kicker">Preguntas frecuentes</span>
          <h2 class="font-headline text-3xl md:text-4xl font-extrabold text-primary mb-4 mt-3">
            {landing.faq.heading}
          </h2>
          <p class="text-on-surface-variant">Respuestas claras para tomar decisiones con confianza.</p>
        </div>
        <div class="grid lg:grid-cols-2 gap-5 lg:gap-6 items-start relative z-10">
          {#each landing.faq.items as item, idx (item.question)}
            <article class={`faq-item ${faqOpenIndex === idx ? 'is-open' : ''}`}>
              <button
                type="button"
                class="faq-question"
                onclick={() => toggleFaq(idx)}
                aria-expanded={faqOpenIndex === idx}
                aria-label={`Mostrar respuesta: ${item.question}`}
                aria-controls={`faq-panel-${idx}`}
              >
                <h3 class="faq-title">
                  {item.question}
                </h3>
                <span class={`faq-plus ${faqOpenIndex === idx ? 'is-open' : ''}`} aria-hidden="true">+</span>
              </button>

              <div id={`faq-panel-${idx}`} class={`faq-answer-wrap ${faqOpenIndex === idx ? 'is-open' : ''}`}>
                <div class="faq-answer-inner">
                  <p class="faq-answer-text">{item.answer}</p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section class="reveal-b py-24 px-6 relative overflow-hidden" id="contact" use:revealOnScroll>
      <div
        class="final-cta-shell max-w-7xl mx-auto rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
      >
        <div class="final-cta-bg final-cta-bg--pattern" aria-hidden="true"></div>
        <div class="final-cta-bg final-cta-bg--grid" aria-hidden="true"></div>
        <div class="final-cta-bg final-cta-bg--spotlight" aria-hidden="true"></div>
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
              class="btn-shine final-cta-main-btn bg-secondary text-on-secondary px-10 py-5 rounded-md font-bold text-xl hover:shadow-[0_0_25px_rgba(0,108,73,0.5)] transition-all active:scale-95 no-underline inline-flex items-center justify-center"
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
                Email
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
            Diseño y desarrollo web para negocios de Alcoy, Alicante y alrededores.
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
            {#each footerServices as footerService, idx (footerService.title + idx)}
              <li>
                <a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#services">
                  {footerService.title}
                </a>
              </li>
            {/each}
            <li>
              <a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href="#maintenance">
                {maintenanceFooterLabel}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-bold tracking-wide uppercase text-slate-900 mb-4">Contacto</h3>
          <ul class="space-y-3">
            <li>
              <a class="text-slate-600 hover:text-[#002045] transition-colors no-underline" href={site.footer.emailHref}>
                Email
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
            <li>
              <a
                class="text-slate-600 hover:text-[#002045] transition-colors no-underline"
                href="https://moisesvalero.es"
                target="_blank"
                rel="noopener noreferrer"
              >
                Portfolio
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-500">
        <p>
          © {year}
          <a
            href={`${baseUrl}/`}
            class="text-slate-500 hover:text-[#002045] transition-colors no-underline">{site.header.logoText}</a>.
          Todos los derechos reservados.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <a class="hover:text-[#002045] transition-colors no-underline" href="/privacidad">Privacidad</a>
          <a class="hover:text-[#002045] transition-colors no-underline" href="/cookies">Cookies</a>
        </div>
      </div>
    </div>
  </footer>

  {#if isContactModalOpen}
    <div class="fixed inset-0 z-[90] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeContactModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar modal"
      ></button>
      <div
        class="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
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

        <form class="px-6 md:px-8 py-6 space-y-4 overflow-y-auto" onsubmit={submitContactModalForm}>
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

  {#if activeServiceIndex !== null}
    <div class="fixed inset-0 z-[95] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeServiceModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar detalles del servicio"
      ></button>
      <div
        class="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
      >
        <div class="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-100">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-headline text-2xl md:text-3xl font-extrabold text-primary">
                {serviceOffers[activeServiceIndex].title}
              </h3>
              <p class="text-slate-700 mt-2 font-semibold">
                Precio desde: {serviceOffers[activeServiceIndex].priceFrom}
              </p>
              {#if serviceOffers[activeServiceIndex].delivery}
                <p class="text-slate-600 mt-1">
                  Tiempo de entrega: {serviceOffers[activeServiceIndex].delivery}
                </p>
              {/if}
            </div>
            <button
              type="button"
              onclick={closeServiceModal}
              class="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-9 h-9 inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div class="px-6 md:px-8 py-6 overflow-y-auto">
          <ul class="space-y-3">
            {#each serviceOffers[activeServiceIndex].details as detail (detail)}
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-secondary mt-0.5" style="font-size:18px;">check_circle</span>
                <span class="text-slate-700 leading-relaxed">{detail}</span>
              </li>
            {/each}
          </ul>

          {#if serviceOffers[activeServiceIndex].note}
            <p class="mt-5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              Nota: {serviceOffers[activeServiceIndex].note}
            </p>
          {/if}

          <div class="pt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end sticky bottom-0 bg-white border-t border-slate-100 -mx-6 md:-mx-8 px-6 md:px-8 pb-1">
            <button
              type="button"
              onclick={closeServiceModal}
              class="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
            <a
              href={serviceOffers[activeServiceIndex].modalActionHref || landing.finalCta.cta.href}
              class="px-6 py-3 rounded-lg bg-white text-[#111] border border-[#1f1f1f] font-bold hover:bg-slate-50 no-underline inline-flex items-center justify-center"
            >
              {serviceOffers[activeServiceIndex].modalActionLabel || landing.finalCta.cta.label}
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if activeMaintenanceIndex !== null}
    <div class="fixed inset-0 z-[96] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeMaintenanceModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar detalles de mantenimiento"
      ></button>
      <div
        class="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
      >
        <div class="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-100">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-headline text-2xl md:text-3xl font-extrabold text-primary">
                {maintenanceOptions[activeMaintenanceIndex].modalTitle}
              </h3>
              <p class="text-slate-700 mt-2 font-semibold">
                Precio: {maintenanceOptions[activeMaintenanceIndex].price}
              </p>
            </div>
            <button
              type="button"
              onclick={closeMaintenanceModal}
              class="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-9 h-9 inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div class="px-6 md:px-8 py-6 overflow-y-auto">
          <ul class="space-y-3">
            {#each maintenanceOptions[activeMaintenanceIndex].checklist as detail (detail)}
              <li class="flex items-start gap-3">
                <span class="material-symbols-outlined text-secondary mt-0.5" style="font-size:18px;">check_circle</span>
                <span class="text-slate-700 leading-relaxed">{detail}</span>
              </li>
            {/each}
          </ul>
          <p class="mt-5 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            Nota: {maintenanceOptions[activeMaintenanceIndex].note}
          </p>

          <div class="pt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end sticky bottom-0 bg-white border-t border-slate-100 -mx-6 md:-mx-8 px-6 md:px-8 pb-1">
            <button
              type="button"
              onclick={closeMaintenanceModal}
              class="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
            <a
              href={maintenanceOptions[activeMaintenanceIndex].actionHref || '/api/contact/whatsapp'}
              class="px-6 py-3 rounded-lg bg-white text-[#111] border border-[#1f1f1f] font-bold hover:bg-slate-50 no-underline inline-flex items-center justify-center"
            >
              {maintenanceOptions[activeMaintenanceIndex].actionLabel}
            </a>
          </div>
        </div>
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

  @keyframes bHeroSweep {
    0% {
      transform: translateX(-24%) translateY(0) scale(1);
      opacity: 0.18;
    }
    50% {
      transform: translateX(14%) translateY(-4px) scale(1.03);
      opacity: 0.28;
    }
    100% {
      transform: translateX(-24%) translateY(0) scale(1);
      opacity: 0.18;
    }
  }

  @keyframes bHeroMockupFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-7px);
    }
  }

  @keyframes bAuroraDrift {
    0%,
    100% {
      transform: translate3d(0, var(--hero-aurora-y), 0) scale(1);
      opacity: 0.28;
    }
    50% {
      transform: translate3d(1.5%, calc(-1.8% + var(--hero-aurora-y)), 0) scale(1.03);
      opacity: 0.42;
    }
  }

  @keyframes bMobileNavIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bHeroAccentPulse {
    0%,
    100% {
      transform: scaleX(1);
      filter: saturate(1) brightness(1);
      opacity: 0.9;
    }
    50% {
      transform: scaleX(1.14);
      filter: saturate(1.38) brightness(1.1);
      opacity: 1;
    }
  }

  .hero-b {
    --hero-cx: 74%;
    --hero-cy: 42%;
    --hero-mobile-shift-y: 0px;
    --hero-aurora-y: 0px;
    animation: bHeroIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .hero-tech-pattern {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.45;
    background-image:
      radial-gradient(circle at 1px 1px, rgba(175, 191, 255, 0.32) 1.2px, transparent 1.3px),
      linear-gradient(
        115deg,
        rgba(164, 189, 255, 0.06) 0%,
        transparent 38%,
        rgba(164, 189, 255, 0.08) 60%,
        transparent 100%
      );
    background-size:
      24px 24px,
      100% 100%;
  }

  .hero-depth-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
      linear-gradient(rgba(192, 210, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(192, 210, 255, 0.08) 1px, transparent 1px);
    background-size: 38px 38px;
    transform: perspective(950px) rotateX(62deg) translateY(52%);
    transform-origin: center bottom;
    opacity: 0.23;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.92) 12%, transparent 74%);
    -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.92) 12%, transparent 74%);
  }

  .hero-depth-aurora {
    position: absolute;
    inset: -8% -6%;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(circle at 74% 42%, rgba(115, 173, 255, 0.38), transparent 46%),
      radial-gradient(circle at 66% 58%, rgba(76, 221, 172, 0.2), transparent 42%);
    filter: blur(34px);
    animation: bAuroraDrift 11s ease-in-out infinite;
  }

  .hero-visual-col {
    transform: translateY(var(--hero-mobile-shift-y));
    transition: transform 120ms linear;
    will-change: transform;
  }

  .hero-cursor-light {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      circle 380px at var(--hero-cx) var(--hero-cy),
      rgba(173, 208, 255, 0.2) 0%,
      rgba(139, 196, 255, 0.12) 22%,
      transparent 58%
    );
    transition: background-position 80ms linear;
  }

  .hero-depth-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(circle at 74% 42%, transparent 34%, rgba(7, 11, 30, 0.26) 100%),
      radial-gradient(circle at center, transparent 66%, rgba(8, 12, 34, 0.2) 100%);
  }

  .hero-b::before {
    content: '';
    position: absolute;
    width: min(52vw, 580px);
    height: min(20vw, 220px);
    right: -8%;
    top: 10%;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(134, 188, 255, 0) 0%,
      rgba(134, 188, 255, 0.28) 48%,
      rgba(134, 188, 255, 0) 100%
    );
    filter: blur(18px);
    pointer-events: none;
    z-index: 0;
    animation: bHeroSweep 9s ease-in-out infinite;
  }

  .hero-mockup-wrap {
    animation: bHeroMockupFloat 7.4s ease-in-out infinite;
    will-change: transform;
    filter: drop-shadow(0 24px 44px rgba(8, 12, 34, 0.34)) drop-shadow(0 10px 24px rgba(12, 20, 54, 0.26));
  }

  .mobile-nav-panel {
    animation: bMobileNavIn 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .hamburger-toggle {
    overflow: hidden;
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 220ms ease,
      border-color 220ms ease,
      color 220ms ease;
  }

  .hamburger-toggle:active {
    transform: scale(0.96);
  }

  .hamburger-icon {
    width: 18px;
    height: 14px;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger-line {
    position: absolute;
    left: 0;
    width: 18px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transform-origin: center;
    transition:
      transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease,
      width 260ms ease;
  }

  .line-top {
    top: 0;
  }

  .line-mid {
    top: 6px;
  }

  .line-bot {
    top: 12px;
  }

  .hamburger-toggle.is-open .line-top {
    top: 6px;
    transform: rotate(45deg);
  }

  .hamburger-toggle.is-open .line-mid {
    opacity: 0;
    width: 0;
  }

  .hamburger-toggle.is-open .line-bot {
    top: 6px;
    transform: rotate(-45deg);
  }

  .hamburger-toggle.is-open {
    transform: scale(1.04);
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

  .final-cta-shell {
    background: radial-gradient(circle at 50% 42%, #3a4aa0 0%, #2a377f 36%, #1a2258 68%, #0f1538 100%);
    border: 1px solid rgba(184, 199, 255, 0.14);
    box-shadow:
      0 22px 56px rgba(11, 17, 44, 0.34),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }

  .final-cta-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .final-cta-bg--pattern {
    opacity: 0.3;
    background-image:
      radial-gradient(circle at 1px 1px, rgba(175, 191, 255, 0.28) 1.15px, transparent 1.3px),
      linear-gradient(
        115deg,
        rgba(164, 189, 255, 0.07) 0%,
        transparent 38%,
        rgba(164, 189, 255, 0.08) 60%,
        transparent 100%
      );
    background-size:
      24px 24px,
      100% 100%;
  }

  .final-cta-bg--grid {
    opacity: 0.16;
    background-image:
      linear-gradient(rgba(192, 210, 255, 0.11) 1px, transparent 1px),
      linear-gradient(90deg, rgba(192, 210, 255, 0.11) 1px, transparent 1px);
    background-size: 34px 34px;
    transform: perspective(980px) rotateX(62deg) translateY(58%);
    transform-origin: center bottom;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.92) 14%, transparent 76%);
    -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.92) 14%, transparent 76%);
  }

  .final-cta-bg--spotlight {
    background:
      radial-gradient(
        circle 430px at 50% 67%,
        rgba(0, 110, 72, 0.35) 0%,
        rgba(18, 176, 118, 0.21) 32%,
        transparent 68%
      ),
      radial-gradient(
        circle 650px at 50% 60%,
        rgba(116, 174, 255, 0.18) 0%,
        transparent 70%
      );
    filter: blur(2px);
  }

  .final-cta-main-btn {
    box-shadow:
      0 12px 28px rgba(0, 108, 73, 0.33),
      0 0 0 1px rgba(255, 255, 255, 0.16) inset;
  }


  .reveal-b {
    opacity: 0;
    transform: translateY(28px) scale(0.985);
    transition:
      opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  :global(.reveal-b.reveal-visible) {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .faq-premium {
    position: relative;
  }

  .faq-shell {
    position: relative;
  }

  .faq-shell::before {
    content: '';
    position: absolute;
    inset: 2% 6% auto;
    height: 160px;
    border-radius: 999px;
    background: radial-gradient(circle at center, rgba(56, 189, 248, 0.1), transparent 70%);
    filter: blur(18px);
    pointer-events: none;
    z-index: 0;
  }

  .faq-kicker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(15, 23, 42, 0.1);
    background: rgba(255, 255, 255, 0.82);
    color: #475569;
    padding: 0.4rem 0.8rem;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .faq-item {
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 14px;
    overflow: hidden;
    transition:
      border-color 280ms ease,
      box-shadow 320ms ease,
      background-color 280ms ease,
      transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .faq-item:hover {
    border-color: #cbd5e1;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
    transform: translateY(-2px);
  }

  .faq-item.is-open {
    border-color: #10b981;
    background: #ffffff;
    box-shadow:
      0 14px 34px rgba(15, 23, 42, 0.09),
      0 0 0 1px rgba(16, 185, 129, 0.2);
    transform: translateY(-2px);
  }

  .faq-question {
    width: 100%;
    text-align: left;
    padding: 1.25rem 1.3rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .faq-title {
    margin: 0;
    font-family: var(--font-headline, var(--font-sans));
    font-size: 1.08rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.35;
    padding-right: 0.4rem;
  }

  .faq-plus {
    margin-top: -0.05rem;
    font-size: 1.75rem;
    line-height: 1;
    font-weight: 300;
    color: #64748b;
    transition:
      transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
      color 300ms ease;
    user-select: none;
  }

  .faq-plus.is-open {
    transform: rotate(45deg);
    color: #059669;
  }

  .faq-answer-wrap {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition:
      max-height 420ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 280ms ease;
  }

  .faq-answer-wrap.is-open {
    max-height: 540px;
    opacity: 1;
  }

  .faq-answer-inner {
    padding: 0 1.3rem 1.3rem;
  }

  .faq-answer-text {
    margin: 0;
    color: #475569;
    line-height: 1.85;
    font-size: 0.99rem;
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

  :global(.alcoy-dynamic-header.is-top .header-brand-mv path) {
    fill: #ffffff;
  }

  :global(.alcoy-dynamic-header.is-top .header-brand-tag) {
    color: rgba(255, 255, 255, 0.88);
  }

  :global(.alcoy-dynamic-header.is-top .header-brand) {
    filter:
      drop-shadow(0 1px 1px rgba(8, 12, 34, 0.12))
      drop-shadow(0 4px 12px rgba(8, 12, 34, 0.28));
  }

  .alcoy-dynamic-header {
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  .header-link-premium {
    position: relative;
    padding-bottom: 0.2rem;
  }

  .header-link-premium::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -0.24rem;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(0, 110, 72, 0.95) 0%, rgba(0, 110, 72, 0.48) 55%, rgba(0, 110, 72, 0) 100%);
    transform: scaleX(0.08);
    transform-origin: left center;
    opacity: 0;
    transition:
      transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease;
  }

  .header-link-premium:hover::after,
  .header-link-premium:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  :global(.alcoy-dynamic-header.is-top .header-link-premium::after) {
    opacity: 0.88;
    background: linear-gradient(90deg, rgba(0, 110, 72, 0.95) 0%, rgba(0, 110, 72, 0.38) 50%, rgba(0, 110, 72, 0) 100%);
  }

  .alcoy-contact-cta {
    box-shadow: 0 0 0 1px rgba(0, 110, 72, 0.18) inset;
  }

  .alcoy-contact-cta:hover {
    box-shadow:
      0 0 0 1px rgba(0, 110, 72, 0.38) inset,
      0 10px 22px rgba(0, 110, 72, 0.24);
  }

  .hero-title-accent {
    width: clamp(92px, 24vw, 172px);
    height: 4px;
    border-radius: 999px;
    margin-top: -0.3rem;
    background: linear-gradient(90deg, rgba(0, 110, 72, 1) 0%, rgba(21, 180, 121, 0.85) 44%, rgba(21, 180, 121, 0) 100%);
    transform-origin: left center;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.12) inset,
      0 10px 24px rgba(0, 110, 72, 0.4);
    animation: bHeroAccentPulse 4.2s ease-in-out infinite;
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
      opacity: 1;
      transform: none;
      transition: none;
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

    .hero-depth-grid {
      opacity: 0.16;
      transform: perspective(900px) rotateX(66deg) translateY(56%);
    }

    .hero-depth-aurora {
      opacity: 0.82;
      filter: blur(28px);
    }

    .hero-visual-col {
      transition: transform 160ms linear;
    }

    .hero-cursor-light {
      display: none;
    }
  }

  @media (hover: none), (pointer: coarse) {
    .reveal-b {
      opacity: 1;
      transform: none;
      transition: none;
    }

    .hero-cursor-light {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-b,
    .hero-b::before,
    .hero-mockup-wrap,
    .hero-visual-col,
    .mobile-nav-panel,
    .hero-depth-aurora,
    .hero-cursor-light,
    .section-glow::after,
    .hero-title-accent,
    .reveal-b,
    .card-b,
    .btn-shine::after,
    .faq-item,
    .faq-plus,
    .faq-answer-wrap {
      animation: none !important;
      transition: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>
