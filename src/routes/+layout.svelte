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

  const ctaOpensNewTab = $derived(/^https?:\/\//i.test(site.header.ctaHref));

  let menuOpen = $state(false);
  
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

  /** getBoundingClientRect en cada mousemove fuerza reflow; una lectura por frame basta. */
  const handleLinkMove = (event: MouseEvent) => {
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

  {#if !hideSiteChrome}
  <header class="header" class:menu-open={menuOpen}>
	<div class="header-inner">
	  <HeaderBrand
		href={site.header.logoHref}
		ariaLabel={`${site.header.logoText} — ${data.locale === 'en' ? 'Web developer' : 'Desarrollador web'}`}
	  />

	  <nav class="nav-desktop">
		{#each site.header.navItems as item (item.label + item.href + (item.openCareerModal ? '1' : '0'))}
		  {#if item.openCareerModal}
			<button
			  type="button"
			  class="nav-text"
			  onmousemove={handleLinkMove}
			  onclick={() => (careerOpen = true)}
			>
			  {item.label}
			</button>
		  {:else}
			<a href={item.href} onmousemove={handleLinkMove}>{item.label}</a>
		  {/if}
		{/each}
	  </nav>

	  <a
		href={site.header.ctaHref}
		target={ctaOpensNewTab ? '_blank' : undefined}
		rel={ctaOpensNewTab ? 'noopener noreferrer' : undefined}
		class="btn-cta desktop-only"
		onmousemove={handleLinkMove}
	  >
		{site.header.ctaLabel}
	  </a>

	  <button
		class="lang-btn desktop-only"
		type="button"
		onclick={() => void setLocale(data.locale === 'en' ? 'es' : 'en')}
		aria-label={data.locale === 'en' ? 'Cambiar a español' : 'Switch to English'}
	  >
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071e3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		  <circle cx="12" cy="12" r="10"/>
		  <line x1="2" y1="12" x2="22" y2="12"/>
		  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
		</svg>
		<span>{data.locale === 'en' ? 'EN' : 'ES'}</span>
		<div class="lang-dot"></div>
	  </button>

	  <button
		class="lang-btn mobile-lang"
		type="button"
		onclick={() => void setLocale(data.locale === 'en' ? 'es' : 'en')}
		aria-label={data.locale === 'en' ? 'Cambiar a español' : 'Switch to English'}
	  >
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071e3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		  <circle cx="12" cy="12" r="10"/>
		  <line x1="2" y1="12" x2="22" y2="12"/>
		  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
		</svg>
		<span>{data.locale === 'en' ? 'EN' : 'ES'}</span>
		<div class="lang-dot"></div>
	  </button>

	  <button
		type="button"
		class="hamburger"
		class:open={menuOpen}
		onclick={toggleMenu}
		aria-label={$t('layout.aria.toggleMenu')}
	  >
		<span></span>
		<span></span>
		<span></span>
	  </button>
	</div>
	
	{#if menuOpen}
	  <div 
		class="mobile-menu"
		role="button"
		tabindex="0"
		onclick={(e) => e.currentTarget === e.target && closeMenu()}
		onkeydown={(e) => e.key === 'Escape' && closeMenu()}
	  >
		<nav class="mobile-nav">
		  {#each site.header.navItems as item (item.label + item.href + (item.openCareerModal ? '1' : '0'))}
		    {#if item.openCareerModal}
		      <button
		        type="button"
		        class="mobile-nav-text"
		        onclick={() => {
		          careerOpen = true;
		          closeMenu();
		        }}
		      >
		        {item.label}
		      </button>
		    {:else}
		      <a href={item.href} onclick={closeMenu}>{item.label}</a>
		    {/if}
		  {/each}
		  <a
		    href={site.header.ctaHref}
		    class="btn-cta mobile-cta"
		    onclick={closeMenu}
		    target={ctaOpensNewTab ? '_blank' : undefined}
		    rel={ctaOpensNewTab ? 'noopener noreferrer' : undefined}
		  >
			{site.header.ctaLabel}
		  </a>
		</nav>
	  </div>
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
	/* Misma familia y paleta que el portfolio (CaseStudy / secciones) */
	.header {
	  --header-text: #1d1d1f;
	  --header-muted: #86868b;
	  --header-accent: #0071e3;
	  --header-border: #e8e8ed;
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  z-index: 100;
	  padding-top: 0.8rem;
	  display: flex;
	  justify-content: center;
	  pointer-events: none;
	  font-family: var(--font-sans);
	}
	.header-inner {
	  width: min(92%, 1200px);
	  margin: 0 auto;
	  padding: 1rem 1.5rem;
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  gap: 1rem;
	  overflow: visible;
	  background: rgba(255, 255, 255, 0.92);
	  border: 1px solid var(--header-border);
	  border-radius: 999px;
	  box-shadow:
		0 14px 40px rgba(29, 29, 31, 0.08),
		0 1px 0 rgba(255, 255, 255, 0.8) inset;
	  pointer-events: auto;
	  transition:
		background-color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
		box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
		border-color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.nav-desktop { display:flex; gap:0.4rem; margin-left:auto; margin-right:0.8rem; }
	.nav-desktop a,
	.nav-desktop .nav-text {
	  --mx: 50%;
	  --my: 50%;
	  text-decoration: none;
	  color: var(--header-muted);
	  font-size: 0.9rem;
	  font-weight: 500;
	  letter-spacing: -0.015em;
	  min-height: 44px;
	  display: inline-flex;
	  align-items: center;
	  justify-content: center;
	  padding: 0.62rem 1rem;
	  border-radius: 999px;
	  position: relative;
	  overflow: hidden;
	  transition: color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.nav-desktop .nav-text {
	  border: none;
	  background: transparent;
	  cursor: pointer;
	  font-family: inherit;
	}
	.nav-desktop a::before,
	.nav-desktop .nav-text::before {
	  content: "";
	  position: absolute;
	  inset: 0;
	  border-radius: inherit;
	  background:
		radial-gradient(circle at var(--mx) var(--my), rgba(0, 113, 227, 0.12), transparent 58%),
		rgba(0, 113, 227, 0.04);
	  opacity: 0;
	  transform: scale(0.985);
	  transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	  pointer-events: none;
	}
	.nav-desktop a:hover,
	.nav-desktop .nav-text:hover {
	  color: var(--header-accent);
	  transform: translateY(-0.25px);
	}
	.nav-desktop a:hover::before,
	.nav-desktop .nav-text:hover::before {
	  opacity: 0.55;
	  transform: scale(1);
	}
	.desktop-only { margin-left: 0; }
	.btn-cta {
	  text-decoration:none;
	  background: var(--header-accent);
	  color:#fff !important;
	  border: 1px solid rgba(0, 113, 227, 0.35);
	  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.22);
	  min-height: 44px;
	  display: inline-flex;
	  align-items: center;
	  justify-content: center;
	  padding: 0.62rem 1rem;
	  border-radius:999px;
	  font-size: 0.9rem;
	  font-weight:600;
	  position: relative;
	  overflow: hidden;
	  transition:
		transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
		box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
		opacity 0.2s;
	}
	.btn-cta::before {
	  content: "";
	  position: absolute;
	  inset: 0;
	  background:
		linear-gradient(
		  115deg,
		  transparent 18%,
		  rgba(255, 255, 255, 0.35) 46%,
		  rgba(255, 255, 255, 0.04) 62%,
		  transparent 78%
		);
	  opacity: 0.65;
	  transform: translateX(-120%);
	  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	  pointer-events: none;
	}
	.btn-cta:hover {
	  color: #ffffff;
	  transform: translateY(-1px);
	  box-shadow: 0 12px 32px rgba(0, 113, 227, 0.28);
	  opacity: 0.92;
	}
	.btn-cta:hover::before {
	  opacity: 1;
	  transform: translateX(120%);
	}

	.hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; z-index:110; }
	.hamburger span { display:block; width:22px; height:2px; background: var(--header-text); border-radius:2px; transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s; transform-origin:center; }
	.hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
	.hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
	.hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }

	.mobile-menu { position:fixed; inset:0; background:rgba(7,9,20,0.56); z-index:99; animation:fadeIn 0.3s ease; pointer-events:auto; }
	.mobile-nav { position:absolute; top:0; right:0; bottom:0; width:75%; max-width:300px; background:#ffffff; opacity:1; border-left:1px solid rgba(0,0,0,0.08); box-shadow:-18px 0 36px rgba(15,23,42,0.18); padding:80px 24px 32px; display:flex; flex-direction:column; gap:8px; animation:slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
	.mobile-nav a,
	.mobile-nav .mobile-nav-text { font-size:18px; font-weight:600; color: var(--header-text); text-decoration:none; padding:12px 0; border-bottom:1px solid var(--header-border); transition:color 0.3s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1); text-align:left; width:100%; }
	.mobile-nav .mobile-nav-text { border:none; background:transparent; cursor:pointer; font-family:inherit; }
	.mobile-nav a:hover,
	.mobile-nav .mobile-nav-text:hover { color: var(--header-accent); transform:translateX(4px); }
	.mobile-cta { margin-top:12px; text-align:center; border-bottom:none !important; padding:10px 14px !important; min-height:36px; font-size:13px; }
	.lang-btn {
	  display: flex;
	  align-items: center;
	  gap: 7px;
	  padding: 7px 14px;
	  border-radius: 999px;
	  border: 1px solid var(--header-border);
	  background: rgba(255,255,255,0.9);
	  backdrop-filter: blur(8px);
	  cursor: pointer;
	  font-family: var(--font-sans);
	  font-size: 13px;
	  font-weight: 600;
	  color: var(--header-text);
	  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
	  box-shadow: 0 1px 4px rgba(29,29,31,0.06);
	}
	.lang-btn:hover {
	  border-color: rgba(0, 113, 227, 0.25);
	  background: rgba(0, 113, 227, 0.06);
	  transform: scale(1.05);
	  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.12);
	}
	.lang-btn svg {
	  opacity: 0.7;
	  transition: opacity 0.3s;
	}
	.lang-btn:hover svg { opacity: 1; }
	.mobile-lang { display: none; }
	.lang-dot {
	  width: 5px;
	  height: 5px;
	  border-radius: 50%;
	  background: var(--header-accent);
	  animation: dotPulse 2s ease-in-out infinite;
	}
	@keyframes dotPulse {
	  0%,100%{opacity:1;transform:scale(1)}
	  50%{opacity:0.4;transform:scale(0.7)}
	}

	@keyframes fadeIn { from{opacity:0} to{opacity:1} }
	@keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

	@media (max-width: 768px) {
	  .header { padding-top:0.5rem; pointer-events:auto; }
	  .header-inner {
		width:min(95%, 560px);
		padding:0.66rem 0.85rem;
		border-radius:18px;
		background:#fff;
		border:1px solid var(--header-border);
		box-shadow:0 10px 28px rgba(29,29,31,0.08);
	  }
	  .nav-desktop { display:none; }
	  .desktop-only { display:none; }
	  .mobile-lang {
		display: inline-flex;
		margin-left: auto;
	  }
	  .hamburger { display:flex; }
	}

	@media (min-width: 769px) {
	  .mobile-menu { display:none; }
	}
  </style>