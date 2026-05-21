<script lang="ts">
  import '$lib/styles/alcoy-landing-fonts.css';
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';
  import HeaderBrand from '$lib/components/HeaderBrand.svelte';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import HeroMacMockup from '$lib/components/landing/HeroMacMockup.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const landing = $derived(data.landing);
  const site = $derived(data.site);

  /** Dos series para bucle continuo sin salto (datos desde Sanity o defaults). */
  const heroMarqueeLoop = $derived([
    ...landing.hero.marquee.items,
    ...landing.hero.marquee.items
  ]);

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const canonicalUrl = $derived(
    landing.seo.canonicalPath.startsWith('http')
      ? landing.seo.canonicalPath
      : `${baseUrl}${landing.seo.canonicalPath.startsWith('/') ? '' : '/'}${landing.seo.canonicalPath}`
  );
  /** OG: URL absoluta en SSR (el store + $effect no se ejecutaba en servidor). */
  const absoluteOgImage = $derived(
    landing.seo.ogImage.startsWith('http')
      ? landing.seo.ogImage
      : `${baseUrl}${landing.seo.ogImage.startsWith('/') ? '' : '/'}${landing.seo.ogImage}`
  );
  const landingBasePath = $derived(
    (() => {
      const rawPath = landing.seo.canonicalPath.startsWith('http')
        ? new URL(landing.seo.canonicalPath).pathname
        : landing.seo.canonicalPath;
      const normalized = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      return normalized !== '/' ? normalized.replace(/\/$/, '') : normalized;
    })()
  );
  const articlesIndexPath = '/blog';
  const articlesCanonicalBasePath = '/blog';
  const footerIntro = $derived(
    landingBasePath === '/diseno-web'
      ? 'Diseño y desarrollo web para negocios en toda España.'
      : 'Diseño y desarrollo web para negocios de Alcoy, Alicante y alrededores.'
  );

  const contactModal = $derived(landing.contactModal);
  const analyzerModal = $derived(landing.analyzerModal);
  const heroSecondaryCtaLabel = $derived(
    landing.hero.cta.secondaryLabel?.trim() || analyzerModal.triggerLabel
  );
  const supportArticles = $derived([] as Array<{
    slug: string;
    title: string;
    coverImageSrc: string;
    coverImageAlt: string;
    categoryLabel: string;
    publishedAt: string;
    readingMinutes: number;
    excerpt: string;
  }>);
  const analyzerLoadingSteps = $derived([
    analyzerModal.loadingSteps[0] || 'Midiendo tiempos de carga y respuesta',
    analyzerModal.loadingSteps[1] || 'Revisando estabilidad visual y recursos pesados',
    analyzerModal.loadingSteps[2] || 'Preparando recomendaciones claras para mejorar resultados'
  ]);
  const analyzerLoadingMessages = [
    { after: 0, text: 'Conectando con Google PageSpeed. La prueba puede tardar unos segundos.' },
    { after: 8, text: 'Google esta cargando tu pagina como un usuario movil real.' },
    { after: 18, text: 'Seguimos midiendo recursos, tiempos de carga e imagenes pesadas.' },
    { after: 32, text: 'La API esta tardando mas de lo normal, pero el analisis sigue activo.' },
    { after: 50, text: 'No cierres la ventana. Si PageSpeed agota el tiempo te avisare aqui.' }
  ];
  const sectionData = $derived({
    eyebrow: 'Por qué elegirme',
    title: landing.benefits.heading,
    features: landing.benefits.items,
    buttonLabel: landing.benefits.buttonLabel || 'Contactar ahora',
    buttonUrl: landing.benefits.buttonUrl || landing.finalCta.cta.href
  });
  const year = new Date().getFullYear();
  let isContactModalOpen = $state(false);
  let isAnalyzerModalOpen = $state(false);
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
  let analyzerUrl = $state('');
  let analyzerStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let analyzerError = $state('');
  let analyzerLeadEmail = $state('');
  let analyzerLeadStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
  let analyzerLeadError = $state('');
  let analyzerLeadHoneypot = $state('');
  let analyzerElapsedSeconds = $state(0);
  type AnalyzerResult = {
    requestedUrl: string;
    strategy: string;
    performanceScore: number;
    severity: 'slow' | 'needs_improvement' | 'fast';
    cached?: boolean;
    metrics: {
      fcp: string;
      lcp: string;
      imageWeight: string;
      pageWeight: string;
    };
    highlights: string[];
  };
  let analyzerResult = $state<AnalyzerResult | null>(null);
  const analyzerLoadingMessage = $derived(
    analyzerLoadingMessages.findLast((message) => analyzerElapsedSeconds >= message.after)?.text ??
      analyzerLoadingMessages[0].text
  );
  const analyzerProgress = $derived(Math.min(94, Math.round(14 + analyzerElapsedSeconds * 1.6)));
  const analyzerProgressStyle = $derived(`--analyzer-progress:${analyzerProgress}%`);

  type TailwindRuntime = {
    refresh?: () => void;
  };

  const TAILWIND_CDN_SRC = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
  const TAILWIND_CONFIG_SRC = '/js/landing-tailwind-config.js';

  const serviceOffers = $derived(landing.services.items);
  const maintenanceOptions = $derived(landing.maintenance.items);
  const footerServices = $derived(landing.services.items.filter((item) => item.title?.trim().length));
  const maintenanceFooterLabel = $derived(landing.maintenance.footerLabel || 'Mantenimiento');

  function formatArticleDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function openContactModal() {
    isMobileNavOpen = false;
    isContactModalOpen = true;
    contactStatus = 'idle';
    contactError = '';
  }

  function closeContactModal() {
    isContactModalOpen = false;
  }

  function openAnalyzerModal() {
    isMobileNavOpen = false;
    isAnalyzerModalOpen = true;
    analyzerStatus = 'idle';
    analyzerError = '';
    analyzerResult = null;
    analyzerLeadEmail = '';
    analyzerLeadHoneypot = '';
    analyzerLeadStatus = 'idle';
    analyzerLeadError = '';
  }

  function closeAnalyzerModal() {
    isAnalyzerModalOpen = false;
  }

  function openProposalByEmail() {
    const scoreInfo = analyzerResult ? `Score movil detectado: ${analyzerResult.performanceScore}/100.` : '';
    const urlInfo = analyzerResult?.requestedUrl ? `URL analizada: ${analyzerResult.requestedUrl}.` : '';
    contactForm.message = `Quiero una propuesta por email para mejorar mi web. ${urlInfo} ${scoreInfo}`.trim();
    closeAnalyzerModal();
    openContactModal();
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

  function isWhatsappHref(href: string | undefined | null): boolean {
    return typeof href === 'string' && href.includes('/api/contact/whatsapp');
  }

  function parsePageWeightMb(label: string): number | null {
    const clean = label.trim().toLowerCase().replace(',', '.');
    const match = clean.match(/([\d.]+)\s*(b|kb|mb)/);
    if (!match) return null;
    const value = Number(match[1]);
    if (!Number.isFinite(value)) return null;
    const unit = match[2];
    if (unit === 'mb') return value;
    if (unit === 'kb') return value / 1024;
    if (unit === 'b') return value / (1024 * 1024);
    return null;
  }

  function parseSeconds(label: string): number | null {
    const clean = label.trim().toLowerCase().replace(',', '.');
    const match = clean.match(/([\d.]+)\s*s/);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  function loadTimeBadge(label: string): { text: string; className: string } {
    const seconds = parseSeconds(label);
    if (seconds === null) return { text: 'Sin datos', className: 'bg-slate-100 text-slate-700' };
    if (seconds <= 1.8) return { text: 'Rapida', className: 'bg-emerald-100 text-emerald-700' };
    if (seconds <= 3.5) return { text: 'Mejorable', className: 'bg-amber-100 text-amber-800' };
    return { text: 'Lenta', className: 'bg-red-100 text-red-700' };
  }

  function pageWeightBadge(label: string): { text: string; className: string } {
    const mb = parsePageWeightMb(label);
    if (mb === null) return { text: 'Sin datos', className: 'bg-slate-100 text-slate-700' };
    if (mb < 1) return { text: 'Ligera', className: 'bg-emerald-100 text-emerald-700' };
    if (mb <= 2) return { text: 'Aceptable', className: 'bg-amber-100 text-amber-800' };
    return { text: 'Pesada', className: 'bg-red-100 text-red-700' };
  }

  function imageWeightBadge(label: string): { text: string; className: string } {
    const mb = parsePageWeightMb(label);
    if (mb === null) return { text: 'Sin datos', className: 'bg-slate-100 text-slate-700' };
    if (mb < 0.5) return { text: 'Optimas', className: 'bg-emerald-100 text-emerald-700' };
    if (mb <= 1.5) return { text: 'Aceptables', className: 'bg-amber-100 text-amber-800' };
    return { text: 'Pesadas', className: 'bg-red-100 text-red-700' };
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

  function ensureExternalScript(src: string, id: string, isReady: () => boolean) {
    return new Promise<void>((resolve, reject) => {
      if (isReady()) {
        const already = document.getElementById(id) as HTMLScriptElement | null;
        if (already) {
          already.dataset.loaded = 'true';
        }
        resolve();
        return;
      }

      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }

        let settled = false;
        const cleanup = () => {
          existing.removeEventListener('load', onLoad);
          existing.removeEventListener('error', onError);
        };
        const onLoad = () => {
          if (settled) return;
          settled = true;
          existing.dataset.loaded = 'true';
          cleanup();
          resolve();
        };
        const onError = () => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error(`No se pudo cargar ${src}`));
        };

        existing.addEventListener('load', onLoad, { once: true });
        existing.addEventListener('error', onError, { once: true });

        const start = performance.now();
        const poll = () => {
          if (settled) return;
          if (isReady()) {
            settled = true;
            existing.dataset.loaded = 'true';
            cleanup();
            resolve();
            return;
          }
          if (performance.now() - start > 8000) {
            settled = true;
            cleanup();
            reject(new Error(`Timeout cargando ${src}`));
            return;
          }
          window.setTimeout(poll, 80);
        };
        poll();
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
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
      await ensureExternalScript(
        TAILWIND_CONFIG_SRC,
        'alcoy-tailwind-config',
        () => Boolean((window as Window & { tailwind?: { config?: unknown } }).tailwind?.config)
      );
      await ensureExternalScript(
        TAILWIND_CDN_SRC,
        'alcoy-tailwind-cdn',
        () => typeof (window as Window & { tailwind?: TailwindRuntime }).tailwind?.refresh === 'function'
      );
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

  async function analyzeUrl() {
    if (analyzerStatus === 'loading') return;
    analyzerStatus = 'loading';
    analyzerError = '';
    analyzerResult = null;
    analyzerLeadStatus = 'idle';
    analyzerLeadError = '';

    const response = await fetch('/api/pagespeed/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: analyzerUrl, strategy: 'mobile' })
    });

    const data = (await response.json().catch(() => null)) as
      | ({
          ok?: boolean;
          error?: string;
          status?: 'queued' | 'running' | 'completed' | 'error';
          jobId?: string;
          pollAfterMs?: number;
          result?: Partial<AnalyzerResult>;
        } & Partial<AnalyzerResult>)
      | null;

    let resolvedResult: Partial<AnalyzerResult> | null = null;
    let resolvedError = '';
    let transientFailure = response.status >= 500 || response.status === 0;

    if (response.ok && data?.ok && data.status === 'queued' && data.jobId) {
      const resolved = await pollAnalyzeJob(data.jobId, data.pollAfterMs ?? 1000);
      if (!resolved.ok) {
        resolvedError = resolved.error;
      } else {
        resolvedResult = resolved.result;
      }
    } else if (response.ok && data?.ok && data.status === 'completed' && data.result) {
      resolvedResult = data.result;
    } else if (response.ok && data?.ok) {
      resolvedResult = data;
    } else {
      resolvedError = data?.error || 'No se pudo analizar la URL.';
    }

    // Fallback automatico solo para fallos transitorios del proveedor.
    if (!resolvedResult) {
      if (!transientFailure) {
        analyzerStatus = 'error';
        analyzerError = resolvedError || 'No se pudo analizar la URL.';
        return;
      }
      const desktopResponse = await fetch('/api/pagespeed/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzerUrl, strategy: 'desktop' })
      });
      const desktopData = (await desktopResponse.json().catch(() => null)) as
        | ({
            ok?: boolean;
            error?: string;
            status?: 'queued' | 'running' | 'completed' | 'error';
            jobId?: string;
            pollAfterMs?: number;
            result?: Partial<AnalyzerResult>;
          } & Partial<AnalyzerResult>)
        | null;

      if (desktopResponse.ok && desktopData?.ok && desktopData.status === 'queued' && desktopData.jobId) {
        const resolvedDesktop = await pollAnalyzeJob(desktopData.jobId, desktopData.pollAfterMs ?? 1000);
        if (resolvedDesktop.ok) {
          resolvedResult = resolvedDesktop.result;
        } else {
          resolvedError = resolvedDesktop.error;
        }
      } else if (desktopResponse.ok && desktopData?.ok && desktopData.status === 'completed' && desktopData.result) {
        resolvedResult = desktopData.result;
      } else if (desktopResponse.ok && desktopData?.ok) {
        resolvedResult = desktopData;
      } else {
        resolvedError = desktopData?.error || resolvedError || 'No se pudo analizar la URL.';
      }
    }

    if (!resolvedResult) {
      analyzerStatus = 'error';
      analyzerError = resolvedError || 'No se pudo analizar la URL.';
      return;
    }

    analyzerStatus = 'success';
    analyzerResult = {
      requestedUrl: resolvedResult.requestedUrl || '',
      strategy: resolvedResult.strategy || 'mobile',
      performanceScore: typeof resolvedResult.performanceScore === 'number' ? resolvedResult.performanceScore : 0,
      severity: (resolvedResult.severity as AnalyzerResult['severity']) || 'needs_improvement',
      cached: resolvedResult.cached === true,
      metrics: {
        fcp: resolvedResult.metrics?.fcp || 'N/D',
        lcp: resolvedResult.metrics?.lcp || 'N/D',
        imageWeight: resolvedResult.metrics?.imageWeight || 'N/D',
        pageWeight: resolvedResult.metrics?.pageWeight || 'N/D'
      },
      highlights: Array.isArray(resolvedResult.highlights) ? resolvedResult.highlights : []
    };
  }

  async function pollAnalyzeJob(
    jobId: string,
    pollEveryMs: number
  ): Promise<{ ok: true; result: Partial<AnalyzerResult> } | { ok: false; error: string }> {
    const startedAt = Date.now();
    const timeoutMs = 120000;
    let intervalMs = Math.max(700, Math.min(3000, pollEveryMs || 1000));

    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const pollResponse = await fetch(`/api/pagespeed/analyze/${encodeURIComponent(jobId)}`);
      const pollData = (await pollResponse.json().catch(() => null)) as
        | {
            ok?: boolean;
            status?: 'queued' | 'running' | 'completed' | 'error';
            error?: string;
            pollAfterMs?: number;
            result?: Partial<AnalyzerResult>;
          }
        | null;

      if (!pollResponse.ok || !pollData?.ok) {
        return { ok: false, error: pollData?.error || 'No se pudo completar el analisis.' };
      }
      if (pollData.status === 'completed' && pollData.result) {
        return { ok: true, result: pollData.result };
      }
      if (pollData.status === 'error') {
        return { ok: false, error: pollData.error || 'No se pudo completar el analisis.' };
      }
      intervalMs = Math.max(700, Math.min(3000, pollData.pollAfterMs ?? intervalMs));
    }

    return { ok: false, error: 'El analisis sigue procesandose. Prueba de nuevo en unos segundos.' };
  }

  async function submitAnalyzerLeadForm(event: SubmitEvent) {
    event.preventDefault();
    if (!analyzerResult || analyzerLeadStatus === 'sending') return;
    analyzerLeadStatus = 'sending';
    analyzerLeadError = '';

    const response = await fetch('/api/pagespeed/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: analyzerLeadEmail,
        url: analyzerResult.requestedUrl,
        score: analyzerResult.performanceScore,
        severity: analyzerResult.severity,
        metrics: analyzerResult.metrics,
        highlights: analyzerResult.highlights,
        website: analyzerLeadHoneypot
      })
    });

    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) {
      analyzerLeadStatus = 'error';
      analyzerLeadError = data?.error || 'No se pudo guardar tu email.';
      return;
    }

    analyzerLeadStatus = 'success';
    analyzerLeadEmail = '';
    analyzerLeadHoneypot = '';
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
      isContactModalOpen || isAnalyzerModalOpen || activeServiceIndex !== null || activeMaintenanceIndex !== null;
    document.body.style.overflow = hasOpenModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  });

  $effect(() => {
    if (analyzerStatus !== 'loading') {
      analyzerElapsedSeconds = 0;
      return;
    }

    const startedAt = Date.now();
    analyzerElapsedSeconds = 0;
    const timer = window.setInterval(() => {
      analyzerElapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    }, 1000);

    return () => window.clearInterval(timer);
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

  const organizationJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: landing.localBusiness.businessName,
      url: `${baseUrl}/`,
      foundingDate: '2020-01-01',
      knowsAbout: [
        'Diseno web',
        'Desarrollo web',
        'SEO tecnico',
        'Rendimiento web',
        'SvelteKit',
        'WordPress'
      ]
    })
  );

  const serviceCatalogJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${canonicalUrl}#service-catalog`,
      name: landing.localBusiness.serviceType,
      provider: {
        '@id': `${baseUrl}/#organization`
      },
      areaServed: landing.localBusiness.areaServed.map((name) => ({ '@type': 'City', name })),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `Servicios de ${landing.localBusiness.businessName}`,
        itemListElement: serviceOffers.map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            description: service.summary
          },
          priceSpecification: service.priceFrom
            ? {
                '@type': 'PriceSpecification',
                priceCurrency: 'EUR',
                description: service.priceFrom
              }
            : undefined
        }))
      }
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
          name: landingBasePath === '/diseno-web' ? 'Diseño web' : 'Diseño web en Alcoy',
          item: canonicalUrl
        }
      ]
    })
  );

  /** SoftwareApplication: presenta el analizador PageSpeed embebido como herramienta gratuita. */
  const analyzerSoftwareJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Analizador de webs gratis — Moisés Valero',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${canonicalUrl}#analyzer`,
      description:
        'Herramienta gratuita que mide rendimiento y Core Web Vitals de una URL pública mediante Google PageSpeed Insights y entrega recomendaciones concretas.',
      provider: { '@id': `${baseUrl}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }
    })
  );

  const serviceIcons = ['ads_click', 'business', 'code'];
</script>

<svelte:head>
  <title>{landing.seo.title}</title>
  <meta name="description" content={landing.seo.description} />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={landing.seo.ogTitle} />
  <meta property="og:description" content={landing.seo.ogDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={absoluteOgImage} />
  <meta property="og:locale" content="es_ES" />
  <meta name="twitter:card" content={landing.seo.twitterCard} />
  <meta name="twitter:title" content={landing.seo.ogTitle} />
  <meta name="twitter:description" content={landing.seo.ogDescription} />
  <meta name="twitter:image" content={absoluteOgImage} />
  <script id="alcoy-tailwind-config" src="/js/landing-tailwind-config.js"></script>
  <script id="alcoy-tailwind-cdn" src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <JsonLdScript json={localBusinessJsonLd} />
  <JsonLdScript json={organizationJsonLd} />
  <JsonLdScript json={serviceCatalogJsonLd} />
  <JsonLdScript json={webPageJsonLd} />
  <JsonLdScript json={faqJsonLd} />
  <JsonLdScript json={breadcrumbJsonLd} />
  <JsonLdScript json={analyzerSoftwareJsonLd} />
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
      class="hero-b section-glow relative w-full min-w-0 min-h-0 pt-24 pb-6 md:pt-28 md:pb-6 lg:pt-32 md:min-h-[100svh] lg:min-h-[100svh] max-lg:landscape:min-h-0 max-lg:landscape:pt-[5.25rem] max-lg:landscape:pb-4 max-lg:landscape:md:pt-24 flex flex-col overflow-x-clip overflow-y-visible bg-primary px-6"
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
        class="hero-b-main flex flex-1 flex-col justify-center w-full max-w-7xl mx-auto min-h-0 min-w-0 relative z-10 max-lg:landscape:md:min-h-0 max-lg:landscape:md:justify-start max-lg:landscape:md:py-2"
      >
        <div
          class="w-full min-w-0 grid grid-cols-1 gap-14 max-md:gap-16 md:gap-14 items-center md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-20 xl:gap-24 max-lg:landscape:gap-6 max-lg:landscape:md:gap-8 max-lg:landscape:md:items-start"
        >
        <div class="space-y-8 min-w-0 max-w-xl lg:max-w-2xl">
          <h1
            class="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight"
          >
            {landing.hero.title}
          </h1>
          <div class="hero-title-accent" aria-hidden="true"></div>
          <p
            class="hero-lead-on-blue text-lg md:text-xl max-w-lg leading-relaxed font-medium"
          >
            {landing.hero.subtitle}
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href={landing.hero.cta.href}
              target={isWhatsappHref(landing.hero.cta.href) ? '_blank' : undefined}
              rel={isWhatsappHref(landing.hero.cta.href) ? 'noopener noreferrer' : undefined}
              class="cta-hover cta-hover-primary bg-secondary text-on-secondary px-8 py-4 rounded-md font-bold text-lg hover:shadow-[0_0_20px_rgba(0,108,73,0.4)] transition-all active:scale-95 text-center no-underline inline-flex items-center justify-center sm:whitespace-nowrap"
            >
              {landing.hero.cta.label}
            </a>
            <button
              type="button"
              class="cta-hover cta-hover-ghost hero-ghost-cta inline-flex items-center text-white font-semibold py-4 px-8 border-b-2 border-secondary-container/30 hover:border-secondary transition-all bg-transparent cursor-pointer sm:whitespace-nowrap"
              onclick={openAnalyzerModal}
            >
              {heroSecondaryCtaLabel}
            </button>
          </div>
        </div>
        <div
          class="hero-visual-col relative z-[1] min-w-0 w-full overflow-visible max-md:mb-10 max-md:pb-3 md:pl-4 lg:pl-8"
        >
          <div
            class="relative mx-auto w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,420px)] md:max-w-[900px] md:ml-auto md:mr-0 flex flex-col items-center [&_.mac-mockup-root]:w-full [&_.mac-mockup-root]:max-w-none"
          >
            <div
              class="hero-mockup-wrap w-full min-w-0 flex justify-center md:pt-6 lg:pt-10 xl:pt-12 max-lg:landscape:md:pt-4 max-lg:landscape:lg:pt-8"
            >
              <HeroMacMockup />
            </div>
          </div>
        </div>
        </div>
      </div>

      <div
        class="hero-marquee-outer w-full max-w-7xl mx-auto min-w-0 shrink-0 mt-8 max-md:mt-10 md:mt-4 pt-3 md:pt-4 border-t border-white/[0.08] relative z-20 max-lg:landscape:mt-2 max-lg:landscape:pt-2 max-lg:landscape:md:mt-3"
      >
        <p class="hero-marquee-kicker">{landing.hero.marquee.kicker}</p>
        <div
          class="hero-marquee"
          role="region"
          aria-label="Capturas de proyectos, carrusel horizontal. Pausa al pasar el cursor o al enfocar un enlace."
        >
          <div class="hero-marquee-viewport">
            <div class="hero-marquee-track">
              {#each heroMarqueeLoop as item, i (item.title + '-' + i)}
                <a
                  class="hero-marquee-card"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir en nueva pestaña: {item.title}"
                >
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                  <span class="hero-marquee-title">{item.title}</span>
                </a>
              {/each}
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
              <article
                class="card-b bg-surface-container-lowest p-8 rounded-xl group hover:translate-y-[-4px] transition-transform duration-300 h-full flex flex-col"
              >
                <div
                  class="w-12 h-12 bg-secondary-container flex items-center justify-center rounded-full mb-6"
                >
                  <span class="material-symbols-outlined text-on-secondary-container">{option.icon}</span>
                </div>
                <h4 class="font-headline text-2xl font-bold text-primary mb-4">{option.title}</h4>
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
              target={isWhatsappHref(sectionData.buttonUrl) ? '_blank' : undefined}
              rel={isWhatsappHref(sectionData.buttonUrl) ? 'noopener noreferrer' : undefined}
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
          <p class="final-cta-lead-on-blue text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {landing.finalCta.text}
          </p>
          <div class="pt-6 flex flex-col items-center gap-6">
            <a
              href={landing.finalCta.cta.href}
              target={isWhatsappHref(landing.finalCta.cta.href) ? '_blank' : undefined}
              rel={isWhatsappHref(landing.finalCta.cta.href) ? 'noopener noreferrer' : undefined}
              class="btn-shine final-cta-main-btn bg-secondary text-on-secondary px-10 py-5 rounded-md font-bold text-xl hover:shadow-[0_0_25px_rgba(0,108,73,0.5)] transition-all active:scale-95 no-underline inline-flex items-center justify-center text-center whitespace-normal sm:whitespace-nowrap max-w-full"
            >
              {landing.finalCta.cta.label}
            </a>
            <div class="final-cta-alt-links flex flex-col md:flex-row items-center gap-6 md:gap-10 mt-2">
              <a
                class="final-cta-alt-link flex items-center gap-2.5 no-underline"
                href={site.footer.emailHref}
              >
                <span class="material-symbols-outlined final-cta-alt-icon" aria-hidden="true">mail</span>
                <span>Email</span>
              </a>
              <a
                class="final-cta-alt-link flex items-center gap-2.5 no-underline"
                href="/api/contact/whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="material-symbols-outlined final-cta-alt-icon" aria-hidden="true">phone_iphone</span>
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onclick={openContactModal}
                class="final-cta-alt-link final-cta-alt-link--btn flex items-center gap-2.5 cursor-pointer"
              >
                <span class="material-symbols-outlined final-cta-alt-icon" aria-hidden="true">edit_square</span>
                <span>{contactModal.triggerLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {#if supportArticles.length}
      <section class="reveal-b py-24 px-6 bg-surface-container-low" id="articulos" use:revealOnScroll>
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
            <div class="max-w-2xl">
              <span class="text-secondary font-bold tracking-widest uppercase text-sm block mb-4">
                Articulos de apoyo
              </span>
              <h2 class="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-4">
                Ideas practicas para mejorar tu web
              </h2>
              <p class="text-on-surface-variant leading-relaxed">
                Guías claras y prácticas para mejorar la velocidad, la seguridad y el mantenimiento de tu web.
              </p>
            </div>
            <a
              href={articlesIndexPath}
              class="cta-hover cta-hover-ghost inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-primary no-underline hover:border-secondary transition-colors"
            >
              Ver todos los articulos
            </a>
          </div>

          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {#each supportArticles as article, idx (article.slug)}
              <a
                href={`${articlesCanonicalBasePath}/${article.slug}`}
                class="article-card group no-underline overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"
                aria-label={`Leer articulo: ${article.title}`}
              >
                <div class="article-card-media relative">
                  <img
                    src={article.coverImageSrc}
                    alt={article.coverImageAlt}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    class="h-52 w-full object-cover"
                  />
                  <div class="article-card-gradient absolute inset-0"></div>
                  <div class="article-card-pill absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                    {article.categoryLabel}
                  </div>
                </div>

                <div class="article-card-body p-5">
                  <div class="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    <span>{formatArticleDate(article.publishedAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingMinutes} min</span>
                  </div>
                  <h3 class="article-card-title font-headline text-2xl font-extrabold text-primary leading-tight mb-3 group-hover:text-secondary transition-colors">
                    {article.title}
                  </h3>
                  <p class="article-card-excerpt text-on-surface-variant leading-relaxed text-sm mb-5">
                    {article.excerpt}
                  </p>
                  <span class="article-card-link inline-flex items-center gap-2 font-bold text-secondary">
                    Ver articulo
                    <span
                      class="material-symbols-outlined text-base transition-transform duration-300 ease-out group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </span>
                </div>
              </a>
            {/each}
          </div>
        </div>
      </section>
    {/if}
  </main>

  <footer class="bg-[#f7f9fb] py-14 px-6 w-full border-t border-slate-200/80">
    <div class="max-w-7xl mx-auto">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-4">
          <a href="/" class="inline-block text-xl font-black tracking-tight text-[#002045] no-underline hover:opacity-90">
            {site.header.logoText}
          </a>
          <p class="text-slate-600 leading-relaxed max-w-xs">
            {footerIntro}
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
              <a
                class="text-slate-600 hover:text-[#002045] transition-colors no-underline"
                href="/api/contact/whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
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

  {#if isAnalyzerModalOpen}
    <div class="premium-modal-overlay fixed inset-0 z-[89] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeAnalyzerModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar analizador"
      ></button>
      <div
        class="premium-modal-card relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
      >
        <div class="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-100">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-headline text-2xl md:text-3xl font-extrabold text-primary">{analyzerModal.heading}</h3>
              <p class="text-slate-600 mt-2">
                {analyzerModal.text}
              </p>
            </div>
            <button
              type="button"
              onclick={closeAnalyzerModal}
              class="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-9 h-9 inline-flex items-center justify-center"
              aria-label="Cerrar"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div class="px-6 md:px-8 py-6 space-y-4 overflow-y-auto">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">{analyzerModal.urlLabel}</span>
            <input
              type="text"
              inputmode="url"
              autocomplete="url"
              required
              placeholder={analyzerModal.urlPlaceholder}
              class="mt-1 w-full rounded-lg border-slate-300 focus:border-[#006c49] focus:ring-[#006c49]"
              bind:value={analyzerUrl}
              aria-describedby="analyzer-url-help"
              disabled={analyzerStatus === 'loading'}
              onkeydown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void analyzeUrl();
                }
              }}
            />
            <span id="analyzer-url-help" class="mt-1 block text-xs text-slate-500">
              {analyzerModal.urlHelp}
            </span>
          </label>

          <div class="pt-1 flex gap-3">
            <button
              type="button"
              onclick={analyzeUrl}
              disabled={analyzerStatus === 'loading'}
              class="px-6 py-3 rounded-lg bg-white text-[#111] border border-[#1f1f1f] font-bold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {analyzerStatus === 'loading' ? 'Analizando...' : analyzerModal.submitLabel}
            </button>
            {#if analyzerStatus === 'error'}
              <button
                type="button"
                onclick={analyzeUrl}
                class="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
              >
                Reintentar analisis
              </button>
            {/if}
          </div>

          {#if analyzerStatus === 'error' && analyzerError}
            <p class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{analyzerError}</p>
          {/if}

          {#if analyzerStatus === 'loading'}
            <div class="analyzer-loading-shell rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5" aria-live="polite">
              <div class="flex items-start gap-3">
                <span class="analyzer-loading-spinner mt-0.5" aria-hidden="true"></span>
                <div class="space-y-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800">{analyzerModal.loadingTitle.replace(/movil/gi, '').replace(/\s{2,}/g, ' ').trim()}</p>
                  <p class="text-xs text-slate-600">
                    {analyzerLoadingMessage}
                  </p>
                </div>
                <span class="analyzer-loading-time">{analyzerElapsedSeconds}s</span>
              </div>
              <div class="analyzer-loading-progress mt-4" style={analyzerProgressStyle} aria-hidden="true">
                <span></span>
              </div>
              <ul class="mt-4 space-y-2 text-xs text-slate-600">
                <li class:analyzer-step-active={analyzerElapsedSeconds >= 0} class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-slate-500" style="font-size:16px;">bolt</span>
                  {analyzerLoadingSteps[0]}
                </li>
                <li class:analyzer-step-active={analyzerElapsedSeconds >= 10} class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-slate-500" style="font-size:16px;">developer_mode</span>
                  {analyzerLoadingSteps[1]}
                </li>
                <li class:analyzer-step-active={analyzerElapsedSeconds >= 22} class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-slate-500" style="font-size:16px;">tips_and_updates</span>
                  {analyzerLoadingSteps[2]}
                </li>
              </ul>
              <p class="analyzer-loading-note">PageSpeed puede tardar mas en horas punta. La prueba sigue activa mientras este contador avance.</p>
            </div>
          {/if}

          {#if analyzerResult}
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-4">
              <div class="flex flex-wrap items-center gap-3 justify-between">
                <p class="text-sm text-slate-600 break-all">URL: {analyzerResult.requestedUrl}</p>
                <span
                  class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    analyzerResult.severity === 'slow'
                      ? 'bg-red-100 text-red-700'
                      : analyzerResult.severity === 'needs_improvement'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {analyzerModal.scoreLabel}: {analyzerResult.performanceScore}/100
                </span>
              </div>
              {#if analyzerResult.cached}
                <p class="text-xs text-slate-500">Resultado desde cache para ahorrar cuota de la API.</p>
              {/if}

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p class="text-slate-500">Tiempo hasta ver la pagina</p>
                  <div class="flex flex-wrap items-center gap-2 mt-0.5">
                    <p class="font-bold text-primary">{analyzerResult.metrics.fcp}</p>
                    <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${loadTimeBadge(analyzerResult.metrics.fcp).className}`}>
                      {loadTimeBadge(analyzerResult.metrics.fcp).text}
                    </span>
                  </div>
                </div>
                <div class="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p class="text-slate-500">Tiempo de carga principal</p>
                  <div class="flex flex-wrap items-center gap-2 mt-0.5">
                    <p class="font-bold text-primary">{analyzerResult.metrics.lcp}</p>
                    <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${loadTimeBadge(analyzerResult.metrics.lcp).className}`}>
                      {loadTimeBadge(analyzerResult.metrics.lcp).text}
                    </span>
                  </div>
                </div>
                <div class="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p class="text-slate-500">Peso total de imagenes</p>
                  <div class="flex flex-wrap items-center gap-2 mt-0.5">
                    <p class="font-bold text-primary">{analyzerResult.metrics.imageWeight}</p>
                    <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${imageWeightBadge(analyzerResult.metrics.imageWeight).className}`}>
                      {imageWeightBadge(analyzerResult.metrics.imageWeight).text}
                    </span>
                  </div>
                </div>
                <div class="rounded-lg bg-white border border-slate-200 px-3 py-2">
                  <p class="text-slate-500">Peso total de la pagina</p>
                  <div class="flex flex-wrap items-center gap-2 mt-0.5">
                    <p class="font-bold text-primary">{analyzerResult.metrics.pageWeight}</p>
                    <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pageWeightBadge(analyzerResult.metrics.pageWeight).className}`}>
                      {pageWeightBadge(analyzerResult.metrics.pageWeight).text}
                    </span>
                  </div>
                </div>
              </div>

              {#if analyzerResult.highlights.length > 0}
                <ul class="space-y-2">
                  {#each analyzerResult.highlights as tip (tip)}
                    <li class="text-sm text-slate-700 flex items-start gap-2">
                      <span class="material-symbols-outlined text-secondary" style="font-size:18px;">check_circle</span>
                      <span>{tip}</span>
                    </li>
                  {/each}
                </ul>
              {/if}

              <div class="pt-1">
                <div class="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/gracias?canal=whatsapp&origen=analizador"
                    class="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-secondary text-on-secondary font-semibold no-underline"
                  >
                    WhatsApp ahora
                  </a>
                  <button
                    type="button"
                    onclick={openProposalByEmail}
                    class="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-slate-300 text-slate-800 font-semibold hover:bg-slate-100"
                  >
                    Quiero propuesta por email
                  </button>
                </div>
              </div>

              <div id="analyzer-email-capture" class="pt-2 border-t border-slate-200">
                <p class="text-sm text-slate-700 font-semibold">{analyzerModal.emailCaptureTitle}</p>
                <p class="text-xs text-slate-500 mt-1">
                  {analyzerModal.emailCaptureText}
                </p>
                <form class="mt-3 flex flex-col sm:flex-row gap-2" onsubmit={submitAnalyzerLeadForm}>
                  <input
                    tabindex="-1"
                    autocomplete="off"
                    aria-hidden="true"
                    class="sr-only absolute -left-[10000px] opacity-0 pointer-events-none"
                    bind:value={analyzerLeadHoneypot}
                  />
                  <input
                    type="email"
                    placeholder={analyzerModal.emailCapturePlaceholder}
                    class="w-full rounded-lg border-slate-300 focus:border-[#006c49] focus:ring-[#006c49]"
                    bind:value={analyzerLeadEmail}
                  />
                  <button
                    type="submit"
                    disabled={analyzerLeadStatus === 'sending'}
                    class="px-4 py-2 rounded-lg border border-slate-300 font-semibold hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {analyzerLeadStatus === 'sending' ? 'Enviando...' : analyzerModal.emailCaptureButton}
                  </button>
                </form>
                {#if analyzerLeadStatus === 'error' && analyzerLeadError}
                  <p class="text-xs text-red-600 mt-2">{analyzerLeadError}</p>
                {/if}
                {#if analyzerLeadStatus === 'success'}
                  <p class="text-xs text-emerald-700 mt-2">{analyzerModal.emailCaptureSuccess}</p>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if isContactModalOpen}
    <div class="premium-modal-overlay fixed inset-0 z-[90] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeContactModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar modal"
      ></button>
      <div
        class="premium-modal-card relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
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
    <div class="premium-modal-overlay fixed inset-0 z-[95] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeServiceModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar detalles del servicio"
      ></button>
      <div
        class="premium-modal-card relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
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
              target={
                isWhatsappHref(serviceOffers[activeServiceIndex].modalActionHref || landing.finalCta.cta.href)
                  ? '_blank'
                  : undefined
              }
              rel={
                isWhatsappHref(serviceOffers[activeServiceIndex].modalActionHref || landing.finalCta.cta.href)
                  ? 'noopener noreferrer'
                  : undefined
              }
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
    <div class="premium-modal-overlay fixed inset-0 z-[96] flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <button
        type="button"
        onclick={closeMaintenanceModal}
        class="absolute inset-0 bg-[#001a39]/70 backdrop-blur-sm"
        aria-label="Cerrar detalles de mantenimiento"
      ></button>
      <div
        class="premium-modal-card relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-3 md:my-0"
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
              target={
                isWhatsappHref(maintenanceOptions[activeMaintenanceIndex].actionHref || '/api/contact/whatsapp')
                  ? '_blank'
                  : undefined
              }
              rel={
                isWhatsappHref(maintenanceOptions[activeMaintenanceIndex].actionHref || '/api/contact/whatsapp')
                  ? 'noopener noreferrer'
                  : undefined
              }
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

  @media (max-width: 767px) {
    .hero-mockup-wrap {
      animation-name: bHeroMockupFloatMobile;
      filter: drop-shadow(0 14px 26px rgba(8, 12, 34, 0.28)) drop-shadow(0 6px 14px rgba(12, 20, 54, 0.2));
    }

    .hero-marquee-viewport {
      margin-top: 0;
      padding-top: 28px;
    }
  }

  @keyframes bHeroMockupFloatMobile {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .hero-marquee-outer {
    padding-left: 0;
    padding-right: 0;
  }

  .hero-marquee-kicker {
    margin: 0 0 0.5rem;
    text-align: center;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
  }

  .hero-marquee {
    position: relative;
    width: 100%;
  }

  .hero-marquee-viewport {
    overflow: hidden;
    /* Equilibrio: aire bajo el kicker + espacio interno para hover sin recortar */
    padding: 36px 0 28px;
    margin: -18px 0 -28px;
    mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  }

  .hero-marquee-track {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: max-content;
    animation: hero-marquee-scroll 52s linear infinite;
    will-change: transform;
  }

  @media (min-width: 400px) {
    .hero-marquee-track {
      gap: 0.7rem;
    }
  }

  .hero-marquee:hover .hero-marquee-track,
  .hero-marquee:focus-within .hero-marquee-track {
    animation-play-state: paused;
  }

  @keyframes hero-marquee-scroll {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(-50%, 0, 0);
    }
  }

  .hero-marquee-card {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 156px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(6, 10, 28, 0.45);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.38);
    outline: none;
    transform-origin: center bottom;
    transition:
      transform 0.48s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.48s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.4s ease;
  }

  @media (min-width: 640px) {
    .hero-marquee-card {
      width: 176px;
    }
  }

  @media (min-width: 1024px) {
    .hero-marquee-card {
      width: 198px;
    }
  }

  .hero-marquee-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    object-position: top center;
    filter: grayscale(1) contrast(1.06) brightness(0.9);
    opacity: 0.5;
    transition:
      filter 0.5s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.45s ease;
  }

  .hero-marquee-title {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.55rem 0.6rem 0.52rem;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.02em;
    color: #ffffff;
    background: linear-gradient(to top, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.08));
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.28s ease,
      transform 0.28s ease;
    pointer-events: none;
  }

  .hero-marquee:hover .hero-marquee-card:not(:hover):not(:focus-within) img {
    opacity: 0.58;
  }

  .hero-marquee-card:hover,
  .hero-marquee-card:focus-visible {
    z-index: 8;
    /* Lift suave + poco scale; la imagen gana contraste/color, no zoom extra */
    transform: translateY(-6px) scale(1.04);
    border-color: rgba(255, 255, 255, 0.34);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.18),
      0 16px 32px rgba(0, 0, 0, 0.42),
      0 6px 14px rgba(0, 0, 0, 0.22);
  }

  .hero-marquee-card:focus-visible {
    outline: 2px solid rgba(108, 248, 187, 0.55);
    outline-offset: 3px;
  }

  .hero-marquee-card:hover img,
  .hero-marquee-card:focus-visible img {
    filter: grayscale(0) contrast(1.14) saturate(1.22) brightness(1.04);
    opacity: 1;
    transform: none;
  }

  .hero-marquee-card:hover .hero-marquee-title,
  .hero-marquee-card:focus-visible .hero-marquee-title {
    opacity: 1;
    transform: translateY(0);
  }

  @media (hover: hover) and (pointer: fine) {
    .hero-marquee-card:hover,
    .hero-marquee-card:focus-visible {
      transform: translateY(-8px) scale(1.045);
    }

    .hero-marquee-card:hover img,
    .hero-marquee-card:focus-visible img {
      filter: grayscale(0) contrast(1.16) saturate(1.26) brightness(1.05);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-marquee-track {
      animation: none;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
      max-width: 56rem;
      margin-left: auto;
      margin-right: auto;
      row-gap: 0.65rem;
    }

    .hero-marquee-viewport {
      overflow: visible;
      padding: 0;
      margin: 0;
      mask-image: none;
      -webkit-mask-image: none;
    }

    .hero-marquee-card img {
      filter: grayscale(0.35) contrast(1.02);
      opacity: 0.88;
    }

    .hero-marquee-card:hover,
    .hero-marquee-card:focus-visible {
      transform: none;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .hero-marquee-card:hover img,
    .hero-marquee-card:focus-visible img {
      filter: grayscale(0.22) contrast(1.06) brightness(1.04);
      opacity: 1;
      transform: none;
    }
  }

  .analyzer-loading-shell {
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }

  .analyzer-loading-time {
    margin-left: auto;
    flex: 0 0 auto;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    padding: 0.18rem 0.5rem;
    color: #0f766e;
    background: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .analyzer-loading-spinner {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 2px solid #cbd5e1;
    border-top-color: #0f766e;
    animation: analyzerSpin 0.85s linear infinite;
    flex-shrink: 0;
  }

  .analyzer-loading-progress {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
    position: relative;
  }

  .analyzer-loading-progress span {
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--analyzer-progress);
    min-width: 16%;
    border-radius: 999px;
    background: linear-gradient(90deg, #0f766e 0%, #14b8a6 100%);
    transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .analyzer-loading-progress span::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.58), transparent);
    animation: analyzerProgressSweep 1.35s ease-in-out infinite;
  }

  .analyzer-step-active {
    color: #0f172a;
    font-weight: 700;
  }

  .analyzer-step-active .material-symbols-outlined {
    color: #0f766e !important;
  }

  .analyzer-loading-note {
    margin: 0.85rem 0 0;
    color: #64748b;
    font-size: 0.72rem;
    line-height: 1.45;
  }

  @keyframes analyzerSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes analyzerProgressSweep {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  .premium-modal-overlay {
    background:
      radial-gradient(circle at 20% 10%, rgba(20, 184, 166, 0.1) 0%, transparent 44%),
      radial-gradient(circle at 80% 90%, rgba(56, 189, 248, 0.12) 0%, transparent 48%);
    animation: modalBackdropIn 260ms ease-out both;
  }

  .premium-modal-card {
    backdrop-filter: blur(2px);
    box-shadow:
      0 28px 60px rgba(15, 23, 42, 0.26),
      0 0 0 1px rgba(255, 255, 255, 0.64) inset;
    animation: modalCardIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes modalBackdropIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modalCardIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
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

  /** Legibilidad sobre azul: más claro que `on-primary-container` (#86a0cd). */
  .hero-lead-on-blue {
    color: #d8e6fc !important;
    text-shadow: 0 1px 2px rgba(8, 12, 34, 0.28);
  }

  .final-cta-lead-on-blue {
    color: #d8e6fc !important;
    text-shadow: 0 1px 2px rgba(8, 12, 34, 0.38);
  }

  .final-cta-alt-links {
    font-size: 1.0625rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .final-cta-alt-link {
    color: #eef4ff !important;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
    min-height: 44px;
    padding: 0.35rem 0.65rem;
    border-radius: 0.5rem;
  }

  .final-cta-alt-link:hover {
    color: #ffffff !important;
  }

  .final-cta-alt-link--btn {
    background: transparent;
    border: 0;
    font: inherit;
    text-align: inherit;
  }

  .final-cta-alt-icon {
    font-size: 22px !important;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    color: #8ef5c8 !important;
  }

  .final-cta-alt-link:hover .final-cta-alt-icon {
    color: #c6ffe6 !important;
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

  /* Fallback defensivo si falla carga de Tailwind CDN/config:
     preserva acentos verdes y contraste de CTAs/badges. */
  :global(.stitch-landing .bg-secondary) { background-color: #006c49 !important; }
  :global(.stitch-landing .text-secondary) { color: #006c49 !important; }
  :global(.stitch-landing .border-secondary) { border-color: #006c49 !important; }
  :global(.stitch-landing .text-on-secondary) { color: #ffffff !important; }
  :global(.stitch-landing .bg-secondary-container) { background-color: #6cf8bb !important; }
  :global(.stitch-landing .text-on-secondary-container) { color: #00714d !important; }
  :global(.stitch-landing .hover\:text-secondary:hover) { color: #006c49 !important; }
  :global(.stitch-landing .hover\:border-secondary:hover) { border-color: #006c49 !important; }

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
    height: 8px;
    border-radius: 999px;
    margin-top: -0.3rem;
    background: linear-gradient(90deg, rgba(0, 110, 72, 1) 0%, rgba(21, 180, 121, 0.85) 44%, rgba(21, 180, 121, 0) 100%);
    transform-origin: left center;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.12) inset,
      0 10px 24px rgba(0, 110, 72, 0.4);
    animation: bHeroAccentPulse 4.2s ease-in-out infinite;
  }

  .hero-ghost-cta {
    position: relative;
    border-bottom-width: 0;
  }

  .hero-ghost-cta::before {
    content: '';
    position: absolute;
    left: 0.8rem;
    right: 0.8rem;
    bottom: -3px;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(0, 110, 72, 1) 0%, rgba(21, 180, 121, 0.85) 44%, rgba(21, 180, 121, 0) 100%);
    transform-origin: left center;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.16) inset,
      0 0 4px rgba(21, 180, 121, 0.16),
      0 6px 12px rgba(0, 110, 72, 0.22);
    animation: bHeroAccentPulse 4.2s ease-in-out infinite;
    pointer-events: none;
  }

  .article-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
  }

  .article-card-media {
    flex: 0 0 auto;
  }

  .article-card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .article-card-title {
    min-height: calc(1.1em * 3.15);
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-card-excerpt {
    flex: 1;
    min-height: calc(1.55em * 3);
  }

  .article-card-link {
    margin-top: auto;
  }

  @media (min-width: 768px) {
    .article-card {
      min-height: 100%;
    }
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

    .article-card-media {
      min-height: 180px;
    }

    .article-card-body {
      padding: 1rem;
    }

    .article-card-title {
      min-height: auto;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }

    .article-card-excerpt {
      min-height: auto;
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
