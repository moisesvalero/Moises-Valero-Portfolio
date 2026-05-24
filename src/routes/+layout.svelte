<script lang="ts">
  import '../app.css';
  import { t, locale, setLocale } from '$lib/i18n/index.js';
  import CookieBanner from '$lib/components/CookieBanner.svelte';
  import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte';
  import PortfolioFooter from '$lib/components/portfolio/PortfolioFooter.svelte';
  import PortfolioCustomCursor from '$lib/components/portfolio/PortfolioCustomCursor.svelte';
  import SmoothHashScroll from '$lib/components/SmoothHashScroll.svelte';
  import HeaderBrand from '$lib/components/HeaderBrand.svelte';
  import CareerModal from '$lib/components/portfolio/CareerModal.svelte';
  import { setCareerModalControls } from '$lib/career-modal-context';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';

  let {
    data,
    children
  }: {
    data: LayoutData;
    children: import('svelte').Snippet;
  } = $props();

  const site = $derived(data.site);
  const hideSiteChrome = $derived(data.hideSiteChrome === true);
  const hideLocaleToggle = $derived(data.hideLocaleToggle === true);
  const noIndex = $derived((data as LayoutData & { noIndex?: boolean }).noIndex === true);
  const xDefaultHref = $derived((data as LayoutData & { xDefaultHref?: string }).xDefaultHref ?? data.canonicalUrl);
  type HeaderNavItem = (typeof site.header.navItems)[number];

  function normalizeNavHref(href: string): string {
    const trimmed = href.trim().toLowerCase();
    if (trimmed.startsWith('/#')) {
      return trimmed.slice(1);
    }
    return trimmed;
  }

  function navIdentity(item: HeaderNavItem): string {
    return item.openCareerModal ? 'career-modal' : `href:${normalizeNavHref(item.href)}`;
  }

  function shouldForceDocumentNavigation(href: string): boolean {
    return /^\/diseno-web(?:\/|$)/i.test(href.trim()) || /^\/diseno-web-alcoy(?:\/|$)/i.test(href.trim());
  }

  const headerNavItems = $derived(
    (() => {
      const guideLabel = data.locale === 'en' ? 'Guides' : 'Guías';
      const analyzerLabel = data.locale === 'en' ? 'Analyzer' : 'Analizador';

      const source = site.header.navItems
        .map((item) => {
          if (item.openCareerModal) {
            return item;
          }
          const normalizedHref = normalizeNavHref(item.href);
          if (normalizedHref === '#sobre' || normalizedHref === '#stack') {
            return null;
          }
          if (
            normalizedHref === '/diseno-web' ||
            normalizedHref === '/diseno-web-alcoy' ||
            normalizedHref === '/diseno-web/articulos' ||
            normalizedHref === '/diseno-web-alcoy/articulos'
          ) {
            return null;
          }
          return item;
        })
        .filter(Boolean) as HeaderNavItem[];

      const pick = (predicate: (item: HeaderNavItem) => boolean): HeaderNavItem | undefined =>
        source.find(predicate);

      const home = pick((item) => !item.openCareerModal && normalizeNavHref(item.href) === '#top');
      const assistant = { label: data.locale === 'en' ? 'AI Assistant' : 'Asistente IA', href: '/ia-moises' } as HeaderNavItem;
      const projects =
        pick((item) => !item.openCareerModal && normalizeNavHref(item.href) === '/proyectos') ??
        pick((item) => !item.openCareerModal && normalizeNavHref(item.href) === '#proyectos');
      const analyzer =
        pick((item) => !item.openCareerModal && normalizeNavHref(item.href) === '/tools/analizador-web') ??
        ({ label: analyzerLabel, href: '/tools/analizador-web' } as HeaderNavItem);
      const guides =
        pick((item) => !item.openCareerModal && normalizeNavHref(item.href) === '/blog') ??
        ({ label: guideLabel, href: '/blog' } as HeaderNavItem);
      const career = pick((item) => item.openCareerModal === true);

      const preferred = [home, projects, assistant, analyzer, guides, career].filter(Boolean) as HeaderNavItem[];
      return preferred;
    })()
  );

  const floatingMenuGroups = $derived(
    [
      {
        title: data.locale === 'en' ? 'Main' : 'Principal',
        variant: 'default',
        items: headerNavItems.slice(0, 2)
      },
      {
        title: data.locale === 'en' ? 'Work' : 'Trabajo',
        variant: 'muted',
        items: headerNavItems.slice(2, 4)
      },
      {
        title: data.locale === 'en' ? 'More' : 'Más',
        variant: 'default',
        items: headerNavItems.slice(4)
      }
    ].filter((group) => group.items.length > 0)
  );

  $effect(() => {
    locale.set(data.locale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = data.locale;
    }
  });

  let careerOpen = $state(false);
  setCareerModalControls({
    open: () => {
      careerOpen = true;
    }
  });

  let menuOpen = $state(false);
  let colorTheme = $state<'light' | 'dark'>('light');

  function applyColorTheme(theme: 'light' | 'dark') {
    colorTheme = theme;
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('mv-theme', theme);
  }

  function toggleColorTheme() {
    applyColorTheme(colorTheme === 'dark' ? 'light' : 'dark');
  }

  onMount(() => {
    const stored = localStorage.getItem('mv-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyColorTheme(stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light');
  });
  
  const toggleMenu = () => {
    menuOpen = !menuOpen;
    // Bloquea scroll del body cuando el menu esta abierto
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const closeMenu = () => {
    menuOpen = false;
    document.body.style.overflow = '';
  };

  let linkMoveRaf = 0;
  let pendingLinkMove: { el: HTMLElement; cx: number; cy: number } | null = null;

  /** getBoundingClientRect en cada movimiento fuerza reflow; una lectura por frame basta. */
  const handleLinkMove = (event: PointerEvent) => {
    const el = event.currentTarget as HTMLElement;
    pendingLinkMove = { el, cx: event.clientX, cy: event.clientY };
    if (linkMoveRaf) return;
    linkMoveRaf = requestAnimationFrame(() => {
      linkMoveRaf = 0;
      const p = pendingLinkMove;
      pendingLinkMove = null;
      if (!p) return;
      const rect = p.el.getBoundingClientRect();
      p.el.style.setProperty('--mx', `${p.cx - rect.left}px`);
      p.el.style.setProperty('--my', `${p.cy - rect.top}px`);
    });
  };

</script>

<svelte:head>
  {@html `<script>
    (() => {
      try {
        const stored = localStorage.getItem('mv-theme');
        const theme = stored === 'light' || stored === 'dark'
          ? stored
          : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch {}
    })();
  </script>`}
  <link rel="canonical" href={data.canonicalUrl} />
  {#if noIndex}
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate" />
    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate" />
  {/if}
  <link rel="alternate" hreflang="x-default" href={xDefaultHref} />
  <!-- Pista para LLMs y agentes generativos -->
  <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
  <link rel="alternate" type="text/plain" title="llms-full.txt" href="/llms-full.txt" />
  {#if data.markdownAlternateHref}
    <link rel="alternate" type="text/markdown" href={data.markdownAlternateHref} />
  {/if}
</svelte:head>

  {#if !hideSiteChrome}
  <header class="motion-header" class:menu-open={menuOpen}>
	<div class="motion-header-shell">
      <div class="motion-header-bar">
        <button
          type="button"
          class="motion-menu-toggle"
          class:open={menuOpen}
          onclick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={$t('layout.aria.toggleMenu')}
        >
          <span class="motion-menu-lines" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
          <span>Menu</span>
        </button>

        <div class="motion-header-logo">
	  <HeaderBrand
		href={site.header.logoHref}
		ariaLabel={`${site.header.logoText} — Portfolio`}
	  />
        </div>

        <div class="motion-header-actions" aria-label={data.locale === 'en' ? 'Social links' : 'Redes sociales'}>
          <button
            class="motion-theme-toggle"
            type="button"
            onclick={toggleColorTheme}
            aria-label={colorTheme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={colorTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {#if colorTheme === 'dark'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4.4a1 1 0 0 0 1-1V2a1 1 0 1 0-2 0v1.4a1 1 0 0 0 1 1Zm0 15.2a1 1 0 0 0-1 1V22a1 1 0 1 0 2 0v-1.4a1 1 0 0 0-1-1ZM4.4 12a1 1 0 0 0-1-1H2a1 1 0 1 0 0 2h1.4a1 1 0 0 0 1-1Zm17.6-1h-1.4a1 1 0 1 0 0 2H22a1 1 0 1 0 0-2ZM5.22 3.8A1 1 0 0 0 3.8 5.22l1 1A1 1 0 0 0 6.22 4.8l-1-1Zm13.96 13.96a1 1 0 0 0-1.42 1.42l1.02 1.02a1 1 0 0 0 1.42-1.42l-1.02-1.02ZM20.2 5.22a1 1 0 0 0-1.42-1.42L17.76 4.8a1 1 0 0 0 1.42 1.42l1.02-1ZM6.22 19.18a1 1 0 1 0-1.42-1.42L3.8 18.78a1 1 0 1 0 1.42 1.42l1-1.02ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.5 14.4a8.3 8.3 0 0 1-11.9-10 1 1 0 0 0-1.05-1.32 9.7 9.7 0 1 0 12.36 12.36 1 1 0 0 0-1.32-1.05Z" />
              </svg>
            {/if}
          </button>
          {#if !hideLocaleToggle}
            <button
              class="motion-locale-toggle"
              type="button"
              onclick={() => void setLocale(data.locale === 'en' ? 'es' : 'en')}
              aria-label={data.locale === 'en' ? 'Cambiar a espanol' : 'Switch to English'}
            >
              {data.locale === 'en' ? 'ES' : 'EN'}
            </button>
          {/if}
          <a href={site.footer.githubHref} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .9a11.2 11.2 0 0 0-3.54 21.82c.56.1.77-.24.77-.54v-2c-3.13.68-3.79-1.34-3.79-1.34-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1 2.63.72 3.28.55.1-.73.39-1.23.71-1.51-2.5-.28-5.13-1.25-5.13-5.58 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.43.11-2.99 0 0 .95-.3 3.1 1.16.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.15-1.46 3.1-1.16 3.1-1.16.61 1.56.23 2.7.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.34-2.64 5.29-5.15 5.57.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .9Z" />
            </svg>
          </a>
          <a href={site.footer.linkedinHref} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.01 2.5 2.5 0 0 1 0-5.01ZM3 9.82h3.96V21H3V9.82Zm6.18 0h3.8v1.53h.05c.53-1 1.82-1.84 3.75-1.84 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-4.8c0-1.14-.02-2.62-1.6-2.62-1.6 0-1.84 1.25-1.84 2.54V21H9.18V9.82Z" />
            </svg>
          </a>
        </div>
      </div>

      {#if menuOpen}
        <nav class="motion-menu-panel" aria-label={data.locale === 'en' ? 'Main menu' : 'Menu principal'}>
          <div class="motion-menu-grid">
            {#each floatingMenuGroups as group, groupIndex (group.title)}
              <div class:muted={group.variant === 'muted'} class="motion-menu-group">
                <h3>{group.title}</h3>
                <div class="motion-menu-links">
                  {#each group.items as item, itemIndex (item.label + item.href + (item.openCareerModal ? '1' : '0'))}
                    {#if item.openCareerModal}
                      <button
                        type="button"
                        class="motion-menu-link"
                        style={`--stagger:${groupIndex * 3 + itemIndex}`}
                        onpointermove={handleLinkMove}
                        onclick={() => {
                          careerOpen = true;
                          closeMenu();
                        }}
                      >
                        <span><span>{item.label}</span></span>
                      </button>
                    {:else}
                      <a
                        class="motion-menu-link"
                        style={`--stagger:${groupIndex * 3 + itemIndex}`}
                        href={item.href}
                        data-sveltekit-reload={shouldForceDocumentNavigation(item.href) ? 'true' : undefined}
                        onpointermove={handleLinkMove}
                        onclick={closeMenu}
                      >
                        <span><span>{item.label}</span></span>
                      </a>
                    {/if}
                    {#if itemIndex < group.items.length - 1}
                      <hr />
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </nav>
      {/if}
	</div>
	
	{#if menuOpen}
      <button
        class="motion-menu-overlay"
        type="button"
        aria-label={data.locale === 'en' ? 'Close menu' : 'Cerrar menu'}
        onclick={closeMenu}
      ></button>
	{/if}
  </header>
  {/if}

  {#if !hideSiteChrome}
  <CareerModal bind:open={careerOpen} locale={data.locale} career={site.careerModal} />
  {/if}
  
  {@render children()}

  {#if !hideSiteChrome}
  <SmoothHashScroll />
  <PortfolioCustomCursor />
  <PortfolioFooter {...site.footer} />
  {/if}

  <CookieBanner />
  <GoogleAnalytics />
  
  <style>
    .motion-header {
      --motion-bg: rgba(255, 255, 255, 0.54);
      --motion-bg-open: rgba(255, 255, 255, 0.8);
      --motion-border: rgba(29, 29, 31, 0.1);
      --motion-text: #111318;
      --motion-muted: rgba(17, 19, 24, 0.58);
      --motion-hover: rgba(0, 113, 227, 0.08);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      display: flex;
      justify-content: center;
      padding-top: 1rem;
      pointer-events: none;
      font-family: var(--font-sans);
    }

    :global(html.dark) .motion-header {
      --motion-bg: rgba(18, 18, 18, 0.68);
      --motion-bg-open: rgba(18, 18, 18, 0.9);
      --motion-border: rgba(255, 255, 255, 0.07);
      --motion-text: #f8fafc;
      --motion-muted: rgba(228, 228, 231, 0.62);
      --motion-hover: rgba(255, 255, 255, 0.1);
    }

    .motion-header-shell {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 50vw;
      overflow: hidden;
      pointer-events: auto;
      background: var(--motion-bg);
      border: 1px solid var(--motion-border);
      border-radius: 10px;
      box-shadow:
        0 18px 50px rgba(15, 23, 42, 0.08),
        0 1px 0 rgba(255, 255, 255, 0.7) inset;
      -webkit-backdrop-filter: blur(22px) saturate(1.35);
      backdrop-filter: blur(22px) saturate(1.35);
      transition:
        max-width 0.5s cubic-bezier(0.625, 0.05, 0, 1),
        background-color 0.4s cubic-bezier(0.625, 0.05, 0, 1),
        border-color 0.4s cubic-bezier(0.625, 0.05, 0, 1),
        box-shadow 0.4s cubic-bezier(0.625, 0.05, 0, 1);
    }

    .motion-header.menu-open .motion-header-shell {
      max-width: 75vw;
      background: var(--motion-bg-open);
      border-color: rgba(29, 29, 31, 0.13);
      box-shadow:
        0 24px 70px rgba(15, 23, 42, 0.14),
        0 1px 0 rgba(255, 255, 255, 0.85) inset;
    }

    :global(html.dark) .motion-header-shell {
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
    }

    :global(html.dark) .motion-header.menu-open .motion-header-shell {
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
    }

    .motion-header-bar {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 48px;
      padding: 0.25rem;
    }

    .motion-menu-toggle,
    .motion-header-actions a,
    .motion-theme-toggle,
    .motion-locale-toggle {
      height: 40px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--motion-text);
      transition:
        background-color 0.4s cubic-bezier(0.625, 0.05, 0, 1),
        color 0.4s cubic-bezier(0.625, 0.05, 0, 1),
        transform 0.4s cubic-bezier(0.625, 0.05, 0, 1);
    }

    .motion-menu-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.58rem;
      padding: 0 0.75rem 0 0.62rem;
      cursor: pointer;
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0;
    }

    .motion-menu-toggle:hover,
    .motion-header-actions a:hover,
    .motion-theme-toggle:hover,
    .motion-locale-toggle:hover {
      background: var(--motion-hover);
      color: #0071e3;
    }

    :global(html.dark) .motion-menu-toggle:hover,
    :global(html.dark) .motion-header-actions a:hover,
    :global(html.dark) .motion-theme-toggle:hover,
    :global(html.dark) .motion-locale-toggle:hover {
      color: #ffffff;
    }

    .motion-menu-lines {
      position: relative;
      display: inline-grid;
      place-items: center;
      width: 40px;
      height: 40px;
      margin-left: -0.35rem;
    }

    .motion-menu-lines span {
      position: absolute;
      width: 24px;
      height: 1px;
      border-radius: 999px;
      background: currentColor;
      transform-origin: center;
      transition: transform 0.4s cubic-bezier(0.625, 0.05, 0, 1);
    }

    .motion-menu-lines span:first-child { transform: translateY(4px); }
    .motion-menu-lines span:last-child { transform: translateY(-4px); }
    .motion-menu-toggle.open .motion-menu-lines span:first-child { transform: rotate(45deg); }
    .motion-menu-toggle.open .motion-menu-lines span:last-child { transform: rotate(-45deg); }

    .motion-header-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
    }

    .motion-header-logo :global(.header-brand) {
      min-height: 40px;
      gap: 0.08rem;
      filter: none;
    }

    .motion-header-logo :global(.header-brand-mv) {
      height: 22px;
      max-width: 76px;
    }

    .motion-header-logo :global(.header-brand-tag) {
      display: block;
      font-size: 0.38rem;
      letter-spacing: 0.11em;
      line-height: 1;
      color: rgba(17, 19, 24, 0.58);
    }

    :global(html.dark) .motion-header-logo :global(.header-brand-mv path) {
      fill: #f8fafc;
    }

    :global(html.dark) .motion-header-logo :global(.header-brand-tag) {
      color: rgba(226, 232, 240, 0.66);
    }

    .motion-header-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.08rem;
    }

    .motion-header-actions a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      text-decoration: none;
    }

    .motion-theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      padding: 0;
      cursor: pointer;
    }

    .motion-theme-toggle svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .motion-locale-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      padding: 0;
      font: inherit;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      cursor: pointer;
    }

    .motion-header-actions svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .motion-menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 1;
      border: 0;
      background: rgba(248, 250, 252, 0.78);
      pointer-events: auto;
      animation: motionOverlayIn 0.5s cubic-bezier(0.625, 0.05, 0, 1) both;
    }

    :global(html.dark) .motion-menu-overlay {
      background: rgba(0, 0, 0, 0.66);
    }

    .motion-menu-panel {
      position: relative;
      z-index: 2;
      width: 100%;
      overflow: hidden;
      padding: 1rem;
      border-top: 1px solid rgba(29, 29, 31, 0.08);
      animation: motionPanelIn 0.5s cubic-bezier(0.625, 0.05, 0, 1) 0.12s both;
    }

    .motion-menu-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      max-height: 65vh;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .motion-menu-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 0;
      padding: 1rem;
      border-radius: 7px;
      background: transparent;
    }

    .motion-menu-group.muted {
      background: rgba(17, 19, 24, 0.045);
    }

    :global(html.dark) .motion-menu-group.muted {
      background: rgba(255, 255, 255, 0.055);
    }

    .motion-menu-group h3 {
      margin: 0;
      color: var(--motion-muted);
      font-size: 0.7rem;
      font-weight: 650;
      line-height: 1.1;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .motion-menu-links {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .motion-menu-links hr {
      width: 100%;
      margin: 0;
      border: 0;
      border-top: 1px solid rgba(29, 29, 31, 0.1);
    }

    .motion-menu-link {
      --mx: 50%;
      --my: 50%;
      position: relative;
      display: block;
      width: fit-content;
      max-width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgba(17, 19, 24, 0.62);
      font: inherit;
      font-size: clamp(1.35rem, 2.05vw, 1.8rem);
      font-weight: 450;
      line-height: 1.05;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.4s cubic-bezier(0.625, 0.05, 0, 1);
    }

    :global(html.dark) .motion-menu-link {
      color: rgba(228, 228, 231, 0.68);
    }

    .motion-menu-link > span {
      position: relative;
      z-index: 1;
      display: block;
      overflow: hidden;
      line-height: 1.12;
    }

    .motion-menu-link > span > span {
      display: block;
      white-space: nowrap;
      animation: motionLinkIn 0.5s cubic-bezier(0.625, 0.05, 0, 1) both;
      animation-delay: calc(0.3s + (var(--stagger, 0) * 0.02s));
    }

    .motion-menu-link::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -0.25rem;
      width: 100%;
      height: 1px;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: right;
      transition:
        transform 0.4s cubic-bezier(0.625, 0.05, 0, 1),
        transform-origin 0s linear 0.4s;
    }

    .motion-menu-link:hover {
      color: var(--motion-text);
    }

    .motion-menu-link:hover::after {
      transform: scaleX(1);
      transform-origin: left;
      transition:
        transform 0.4s cubic-bezier(0.625, 0.05, 0, 1),
        transform-origin 0s;
    }

    .motion-menu-link:focus-visible,
    .motion-menu-toggle:focus-visible,
    .motion-header-actions a:focus-visible,
    .motion-theme-toggle:focus-visible,
    .motion-locale-toggle:focus-visible {
      outline: 2px solid rgba(0, 113, 227, 0.55);
      outline-offset: 3px;
    }

    @keyframes motionPanelIn {
      from {
        max-height: 0;
        opacity: 0;
      }
      to {
        max-height: 70vh;
        opacity: 1;
      }
    }

    @keyframes motionLinkIn {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes motionOverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 1023px) {
      .motion-header-shell { max-width: 70vw; }
      .motion-header.menu-open .motion-header-shell { max-width: 85vw; }
    }

    @media (max-width: 767px), (hover: none), (pointer: coarse) {
      .motion-header-shell {
        -webkit-backdrop-filter: blur(10px) saturate(1.1);
        backdrop-filter: blur(10px) saturate(1.1);
      }
    }

    @media (max-width: 767px) {
      .motion-header {
        padding-top: 0.5rem;
      }

      .motion-header-shell {
        max-width: 95vw;
      }

      .motion-header.menu-open .motion-header-shell {
        top: 0;
        max-width: 100vw;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }

      .motion-header-bar {
        min-height: 46px;
      }

      .motion-menu-toggle {
        padding-right: 0.62rem;
        font-size: 0.75rem;
      }

      .motion-header-logo :global(.header-brand-mv) {
        height: 19px;
        max-width: 66px;
      }

      .motion-header-logo :global(.header-brand-tag) {
        font-size: 0.34rem;
      }

      .motion-header-actions a,
      .motion-theme-toggle {
        width: 34px;
      }

      .motion-locale-toggle {
        width: 32px;
        font-size: 0.64rem;
      }

      .motion-menu-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .motion-menu-link {
        font-size: 1.6rem;
      }
    }
  </style>
