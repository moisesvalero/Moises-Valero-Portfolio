<script lang="ts">
  import { onMount } from 'svelte';
  import { getCareerModalControls } from '$lib/career-modal-context';

  interface Props {
    cvHref?: string;
    label?: string;
    title?: string;
    subtitle?: string;
    bio?: string;
    ctaPrimaryLabel?: string;
    careerCtaLabel?: string;
  }

  let {
    cvHref = '/#contacto',
    label = 'PORTFOLIO – MOISÉS VALERO · Alcoy / Alicante',
    title = 'Desarrollador Web',
    subtitle = 'SvelteKit | WordPress | Sistemas & SEO',
    bio = 'Desarrollo soluciones robustas enfocadas en Web Performance. Me encargo de la infraestructura técnica y el soporte para que tú solo te preocupes de tu negocio. Uso IA para optimizar tiempos, ya sea colaborando con empresas de la zona (Alcoy/Alicante) o integrándome en plantilla.',
    ctaPrimaryLabel = '¿Hablamos?',
    careerCtaLabel = 'Ver Trayectoria'
  }: Props = $props();

  const primaryOpensNewTab = $derived(/^https?:\/\//i.test(cvHref));

  const careerModal = getCareerModalControls();

  let scrollHintOpacity = $state(1);

  onMount(() => {
    const onScroll = () => {
      scrollHintOpacity = window.scrollY > 50 ? 0 : 1;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<div class="hero-viewport-root" id="top">
  <div class="hero-stripe-pro-v2">
    <div class="luces-dinamicas" aria-hidden="true"></div>

    <div class="contenido-hero">
      <p class="label-top anim-fade-up">{label}</p>
      <h1 class="anim-fade-up">{title}</h1>
      <h2 class="sub-frase anim-fade-up">{subtitle}</h2>
      <p class="texto-bio anim-fade-up">{bio}</p>
      <div class="botones-wrap anim-fade-up">
        <a
          href={cvHref}
          class="btn-apple-blue"
          target={primaryOpensNewTab ? '_blank' : undefined}
          rel={primaryOpensNewTab ? 'noopener noreferrer' : undefined}
        >
          {ctaPrimaryLabel}
        </a>
        <button type="button" class="btn-ghost-slim" onclick={() => careerModal?.open()}>
          {careerCtaLabel}
        </button>
      </div>
    </div>
  </div>

  <div
    class="scroll-hint-fixed"
    style:opacity={scrollHintOpacity}
    aria-hidden="true"
  >
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="6,10 14,18 22,10"
        stroke="#1d1d1f"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</div>

<style>
  /* Equivalente a wrappers Elementor: cadena flex + altura viewport */
  .hero-viewport-root {
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
  }

  .hero-stripe-pro-v2 {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 0;
    flex: 1;
    min-height: 100vh;
    min-height: 100svh;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 8%;
    overflow: hidden;
    font-family: inherit;
    box-sizing: border-box;
  }

  @keyframes aparecer {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .anim-fade-up {
    animation: aparecer 0.9s ease-out forwards;
    opacity: 0;
  }

  .label-top {
    animation-delay: 0.1s;
  }

  .hero-stripe-pro-v2 h1.anim-fade-up {
    animation-delay: 0.25s;
  }

  .sub-frase {
    animation-delay: 0.4s;
  }

  .texto-bio {
    animation-delay: 0.55s;
  }

  .botones-wrap {
    animation-delay: 0.7s;
  }

  .luces-dinamicas {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background:
      radial-gradient(circle at 15% 25%, rgba(0, 113, 227, 0.4) 0%, transparent 35%),
      radial-gradient(circle at 85% 15%, rgba(255, 45, 85, 0.35) 0%, transparent 35%),
      radial-gradient(circle at 50% 85%, rgba(251, 191, 36, 0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 35%);
    filter: blur(60px);
    animation: tormentaColores 12s linear infinite;
    z-index: 1;
    pointer-events: none;
  }

  @keyframes tormentaColores {
    0% {
      transform: rotate(0deg) scale(1) translate(0, 0);
    }
    33% {
      transform: rotate(120deg) scale(1.2) translate(5%, 5%);
    }
    66% {
      transform: rotate(240deg) scale(0.8) translate(-5%, -5%);
    }
    100% {
      transform: rotate(360deg) scale(1) translate(0, 0);
    }
  }

  .contenido-hero {
    position: relative;
    z-index: 10;
    max-width: 900px;
    text-align: center;
    margin: 0 auto;
    width: 100%;
  }

  .label-top {
    color: #86868b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: block;
  }

  .hero-stripe-pro-v2 h1 {
    color: #1d1d1f !important;
    font-size: clamp(36px, 5.5vw, 80px) !important;
    font-weight: 800 !important;
    margin: 0 0 16px 0 !important;
    letter-spacing: -0.03em;
    line-height: 1;
    white-space: nowrap;
  }

  .sub-frase {
    color: #0071e3 !important;
    font-size: clamp(16px, 2vw, 24px) !important;
    margin: 0 0 28px 0 !important;
    font-weight: 500 !important;
    line-height: 1.4;
  }

  .texto-bio {
    color: #6e6e73;
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 44px;
    max-width: min(640px, 92vw);
    margin-left: auto;
    margin-right: auto;
  }

  .botones-wrap {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-apple-blue {
    background: #0071e3;
    color: #ffffff !important;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-apple-blue:hover {
    background: #0077ed;
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 113, 227, 0.35);
    color: #ffffff !important;
  }

  .btn-ghost-slim {
    background: transparent;
    color: #1d1d1f !important;
    padding: 13px 26px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    font-family: inherit;
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-ghost-slim:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.3);
    transform: translateY(-3px);
    color: #1d1d1f !important;
  }

  .scroll-hint-fixed {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .scroll-hint-fixed :global(svg) {
    animation: bounceArrow 1.8s ease-in-out infinite;
    display: block;
    opacity: 0.5;
  }

  @keyframes bounceArrow {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    50% {
      transform: translateY(7px);
      opacity: 1;
    }
  }

  /* iPad horizontal y portátiles estrechos: evitar desbordes del título */
  @media (max-width: 1199px) {
    .hero-stripe-pro-v2 h1 {
      white-space: normal;
    }
  }

  @media (max-width: 1024px) {
    .hero-viewport-root {
      min-height: 100svh;
    }

    .hero-stripe-pro-v2 {
      padding: 60px 24px 80px;
      min-height: 100svh;
    }

    .hero-stripe-pro-v2 h1 {
      font-size: clamp(48px, 11vw, 64px) !important;
    }

    .sub-frase {
      font-size: 18px !important;
    }

    .texto-bio {
      font-size: 16px;
      margin-bottom: 32px;
    }

    .botones-wrap {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .btn-apple-blue,
    .btn-ghost-slim {
      justify-content: center;
      text-align: center;
    }

    .scroll-hint-fixed {
      display: none;
    }
  }

  /* Cabecera fija: el label gris no debe quedar tapado en móvil */
  @media (max-width: 768px) {
    .hero-stripe-pro-v2 {
      align-items: flex-start;
      padding-top: max(6.25rem, calc(env(safe-area-inset-top, 0px) + 5.25rem));
      padding-bottom: 72px;
    }

    .label-top {
      font-size: 11px;
      letter-spacing: 0.12em;
      line-height: 1.45;
      margin-bottom: 14px;
      padding: 0 4px;
      max-width: 100%;
    }

    .hero-stripe-pro-v2 h1 {
      font-size: clamp(32px, 9.5vw, 52px) !important;
    }

    .sub-frase {
      font-size: 16px !important;
      margin: 0 0 20px 0 !important;
    }

    .texto-bio {
      font-size: 15px;
      line-height: 1.65;
      margin-bottom: 28px;
    }
  }
</style>
