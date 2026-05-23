<script lang="ts">
  import { resolve } from '$app/paths';
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
    bio = 'Desarrollo sitios web y web apps rápidas, robustas y mantenibles, con foco en rendimiento, IA e integraciones reales. Busco incorporarme a un equipo donde aportar criterio técnico, aprendizaje rápido y valor desde el primer día.',
    ctaPrimaryLabel = '¿Hablamos?',
    careerCtaLabel = 'Ver Trayectoria'
  }: Props = $props();

  const heroCapabilities = $derived([
    { label: 'SvelteKit', icon: 'simple-icons:svelte' },
    { label: 'WordPress', icon: 'simple-icons:wordpress' },
    { label: 'APIs', icon: 'lucide:webhook' },
    { label: /IT Support/i.test(subtitle) ? 'AI' : 'IA', icon: 'lucide:sparkles' }
  ]);
  const titleWords = $derived(title.split(/\s+/).filter(Boolean));
  const iconifySvgUrl = (name: string) =>
    `url("https://api.iconify.design/${encodeURIComponent(name)}.svg")`;
  const resolvePath = resolve as unknown as (href: string) => string;
  const cvLinkProps = $derived({
    href: /^\/(?!\/)/.test(cvHref) ? resolvePath(cvHref) : cvHref,
    target: '_blank',
    rel: 'noopener noreferrer'
  });

  const careerModal = getCareerModalControls();

</script>

<div class="hero-viewport-root" id="top">
  <div class="hero-stripe-pro-v2">
    <div class="luces-dinamicas" aria-hidden="true"></div>
    <div class="hero-bottom-fade" aria-hidden="true"></div>

    <div class="contenido-hero">
      <p class="label-top hero-entry hero-entry-1">{label}</p>
      <h1 class="hero-entry hero-entry-2" aria-label={title}>
        {#each titleWords as word, index (word + index)}
          <span class:hero-title-accent={index === titleWords.length - 1}>
            {word}
          </span>
        {/each}
      </h1>
      <h2 class="sub-frase hero-entry hero-entry-3" aria-label={subtitle}>
        {#each heroCapabilities as item (item.label)}
          <span class="hero-tech-item">
            <span class="hero-tech-icon" style:--hero-tech-icon={iconifySvgUrl(item.icon)} aria-hidden="true"></span>
            <span>{item.label}</span>
          </span>
        {/each}
      </h2>
      <p class="texto-bio hero-entry hero-entry-4">{bio}</p>
      <div class="botones-wrap hero-entry hero-entry-5">
        <button type="button" class="btn-apple-blue" onclick={() => careerModal?.open()}>
          {careerCtaLabel}
        </button>
        <a {...cvLinkProps} class="btn-ghost-slim">
          {ctaPrimaryLabel}
        </a>
      </div>
    </div>
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
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 8%;
    overflow: hidden;
    font-family: inherit;
    box-sizing: border-box;
  }

  .hero-stripe-pro-v2::before,
  .hero-stripe-pro-v2::after {
    content: "";
    position: absolute;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    transition: opacity 360ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-stripe-pro-v2::before {
    width: min(760px, 82vw);
    height: min(760px, 82vw);
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    background:
      radial-gradient(circle at 50% 48%, rgba(167, 243, 255, 0.14), transparent 34%),
      radial-gradient(circle at 38% 42%, rgba(139, 156, 255, 0.16), transparent 38%);
    mask-image: radial-gradient(circle, #000 0%, transparent 68%);
  }

  .hero-stripe-pro-v2::after {
    content: none;
    display: none;
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

  .hero-bottom-fade {
    position: absolute;
    inset: auto 0 0 0;
    /* Fade ligeramente mas largo y sin escalones para que no quede borde
       cuando el body tambien usa #f8fafc */
    height: clamp(180px, 28vh, 340px);
    z-index: 5;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(248, 250, 252, 0) 0%,
      rgba(248, 250, 252, 0.35) 38%,
      rgba(248, 250, 252, 0.78) 70%,
      #f8fafc 100%
    );
  }

  .contenido-hero {
    position: relative;
    z-index: 10;
    max-width: 900px;
    text-align: center;
    margin: 0 auto;
    width: 100%;
  }

  @keyframes heroCinematicIn {
    from {
      opacity: 0;
      transform: translate3d(0, var(--hero-entry-y, 24px), 0)
        scale(var(--hero-entry-scale, 0.985));
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  .hero-entry {
    --hero-entry-y: 24px;
    --hero-entry-scale: 0.985;
    animation: heroCinematicIn var(--hero-entry-duration, 1080ms) cubic-bezier(0.19, 1, 0.22, 1)
      both;
    transform-origin: center;
    backface-visibility: hidden;
    will-change: opacity, transform;
  }

  .hero-entry-1 {
    --hero-entry-y: -10px;
    --hero-entry-scale: 1;
    --hero-entry-duration: 860ms;
    animation-delay: 90ms;
  }

  .hero-entry-2 {
    --hero-entry-y: 34px;
    --hero-entry-scale: 0.972;
    --hero-entry-duration: 1220ms;
    animation-delay: 180ms;
  }

  .hero-entry-3 {
    --hero-entry-y: 22px;
    --hero-entry-scale: 0.99;
    --hero-entry-duration: 1040ms;
    animation-delay: 300ms;
  }

  .hero-entry-4 {
    --hero-entry-y: 20px;
    --hero-entry-scale: 0.995;
    --hero-entry-duration: 980ms;
    animation-delay: 390ms;
  }

  .hero-entry-5 {
    --hero-entry-y: 18px;
    --hero-entry-scale: 1;
    --hero-entry-duration: 900ms;
    animation-delay: 500ms;
  }

  .label-top {
    color: #64748b;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 14px;
    display: block;
  }

  .hero-stripe-pro-v2 h1 {
    color: #0f172a !important;
    font-size: clamp(36px, 5.5vw, 80px) !important;
    font-weight: 800 !important;
    margin: 0 0 13px 0 !important;
    letter-spacing: -0.062em;
    line-height: 0.9;
    white-space: nowrap;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.08em 0.18em;
  }

  .hero-stripe-pro-v2 h1 span {
    display: inline-block;
  }

  @keyframes heroAccentSweep {
    0%,
    100% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }
  }

  .hero-title-accent {
    position: relative;
    margin-right: 0.035em;
    padding-right: 0.045em;
    color: #005fd6;
    background-image: linear-gradient(110deg, #004fb8 0%, #0066e5 42%, #38bdf8 52%, #0066e5 62%, #003f95 100%);
    background-size: 240% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: heroAccentSweep 7.5s cubic-bezier(0.37, 0, 0.63, 1) infinite;
  }

  .hero-title-accent::after {
    content: "";
    position: absolute;
    left: 0.04em;
    right: 0.02em;
    bottom: -0.08em;
    height: 0.07em;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(0, 102, 229, 0.12), rgba(0, 102, 229, 0.72), rgba(56, 189, 248, 0.18));
    transform: scaleX(0.92);
    transform-origin: center;
    opacity: 0.82;
  }

  .sub-frase {
    color: #111827 !important;
    font-size: clamp(14px, 1.55vw, 18px) !important;
    margin: 0 0 24px 0 !important;
    font-weight: 600 !important;
    line-height: 1.2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px 14px;
    max-width: min(760px, 92vw);
    letter-spacing: 0;
  }

  .hero-tech-item {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 0 2px;
    font-family: var(--font-mono);
    font-size: 0.82em;
    font-weight: 650;
    letter-spacing: 0.01em;
    color: inherit;
    white-space: nowrap;
  }

  .hero-tech-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    color: #005fcf;
    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.72));
    opacity: 0.92;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: currentColor;
    mask: var(--hero-tech-icon) center / contain no-repeat;
    -webkit-mask: var(--hero-tech-icon) center / contain no-repeat;
  }

  .texto-bio {
    color: #172033;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.74;
    letter-spacing: 0.005em;
    margin-bottom: 40px;
    max-width: min(700px, 92vw);
    margin-left: auto;
    margin-right: auto;
    text-wrap: pretty;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.92),
      0 0 18px rgba(255, 255, 255, 0.9),
      0 10px 30px rgba(248, 250, 252, 0.72);
  }

  .botones-wrap {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-apple-blue {
    appearance: none;
    background: #0066e5;
    border: 1px solid transparent;
    color: #ffffff !important;
    cursor: pointer;
    font-family: inherit;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition:
      transform 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      background 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      border-color 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      color 0.32s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-apple-blue:hover {
    background: #0052b8;
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 102, 229, 0.35);
    color: #ffffff !important;
  }

  .btn-ghost-slim {
    background: transparent;
    color: #0f172a !important;
    padding: 13px 26px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    font-family: inherit;
    border: 1.5px solid #e2e8f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-ghost-slim:hover {
    background: rgba(15, 23, 42, 0.04);
    border-color: #cbd5e1;
    transform: translateY(-3px);
    color: #0f172a !important;
  }

  :global(html.dark) .btn-apple-blue {
    background: linear-gradient(135deg, #ffffff 0%, #f5f7ff 52%, #e7fbff 100%) !important;
    color: #0a0a0a !important;
    border: 1px solid rgba(255, 255, 255, 0.78) !important;
    text-shadow: none !important;
    box-shadow:
      0 16px 38px rgba(0, 0, 0, 0.34),
      0 0 24px rgba(167, 243, 255, 0.14),
      0 0 0 1px rgba(0, 0, 0, 0.06) inset !important;
  }

  :global(html.dark) .btn-apple-blue:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f7f8ff 48%, #ecfbff 100%) !important;
    color: #000000 !important;
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.9) !important;
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.34),
      0 0 22px rgba(167, 243, 255, 0.18),
      0 0 0 1px rgba(0, 0, 0, 0.07) inset !important;
  }

  :global(html.dark) .btn-ghost-slim {
    background: rgba(10, 10, 10, 0.68) !important;
    color: #f4f4f5 !important;
    border-color: rgba(167, 243, 255, 0.24) !important;
    text-shadow: none !important;
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.28),
      0 0 22px rgba(139, 156, 255, 0.09),
      0 1px 0 rgba(255, 255, 255, 0.08) inset !important;
    backdrop-filter: blur(18px) saturate(140%);
  }

  :global(html.dark) .sub-frase {
    color: #f4f4f5 !important;
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.72),
      0 12px 42px rgba(0, 0, 0, 0.46);
  }

  :global(html.dark) .hero-title-accent {
    color: #f8fafc;
    background-image: linear-gradient(110deg, #ffffff 0%, #dff9ff 34%, #a7f3ff 48%, #ffffff 62%, #c7d2fe 100%);
    text-shadow: 0 0 24px rgba(167, 243, 255, 0.18);
  }

  :global(html.dark) .hero-title-accent::after {
    background: linear-gradient(90deg, rgba(167, 243, 255, 0.06), rgba(167, 243, 255, 0.62), rgba(139, 156, 255, 0.18));
  }

  :global(html.dark) .hero-tech-icon {
    color: #a7f3ff;
    filter: drop-shadow(0 0 14px rgba(167, 243, 255, 0.2));
    opacity: 0.96;
  }

  /*
   * Hero oscuro — "luz de estudio nocturna": malla azul de marca, deriva lenta,
   * núcleo detrás del título y viñeta para profundidad (sin rosa/amarillo del claro).
   */
  :global(html.dark) .hero-stripe-pro-v2 {
    --hero-dark-glow-primary: rgba(77, 163, 255, 0.42);
    --hero-dark-glow-secondary: rgba(139, 156, 255, 0.26);
    --hero-dark-glow-depth: rgba(0, 102, 229, 0.3);
    --hero-dark-glow-core: rgba(167, 243, 255, 0.16);
    --hero-dark-drift-duration: 32s;
    --hero-dark-breathe-duration: 26s;
  }

  :global(html.dark) .hero-stripe-pro-v2::before {
    opacity: 1;
    background:
      radial-gradient(circle at 50% 42%, rgba(167, 243, 255, 0.26), transparent 44%),
      radial-gradient(circle at 40% 46%, rgba(139, 156, 255, 0.2), transparent 48%);
    animation: heroDarkCoreBreathe var(--hero-dark-breathe-duration) ease-in-out infinite;
  }

  @keyframes heroDarkCoreBreathe {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(0.96);
      opacity: 0.82;
    }

    50% {
      transform: translate(-50%, -50%) scale(1.06);
      opacity: 1;
    }
  }

  :global(html.dark) .hero-stripe-pro-v2::after {
    content: "";
    display: block;
    position: absolute;
    inset: 0;
    z-index: 3;
    opacity: 1;
    pointer-events: none;
    background:
      radial-gradient(ellipse 92% 68% at 50% 44%, transparent 30%, rgba(0, 0, 0, 0.5) 100%),
      linear-gradient(180deg, rgba(10, 10, 10, 0) 55%, rgba(10, 10, 10, 0.4) 100%);
  }

  :global(html.dark) .luces-dinamicas {
    background:
      radial-gradient(ellipse 58% 48% at 22% 34%, var(--hero-dark-glow-primary), transparent 68%),
      radial-gradient(ellipse 52% 44% at 80% 26%, var(--hero-dark-glow-secondary), transparent 66%),
      radial-gradient(ellipse 62% 52% at 54% 78%, var(--hero-dark-glow-depth), transparent 72%),
      radial-gradient(circle at 50% 48%, var(--hero-dark-glow-core), transparent 58%);
    filter: blur(48px) saturate(1.12);
    opacity: 1;
    animation: heroDarkAmbientDrift var(--hero-dark-drift-duration) ease-in-out infinite;
    will-change: transform;
  }

  @keyframes heroDarkAmbientDrift {
    0%,
    100% {
      transform: translate(-2%, -1%) scale(1.04) rotate(0deg);
    }

    25% {
      transform: translate(2.5%, 1.5%) scale(1.08) rotate(2.5deg);
    }

    50% {
      transform: translate(1.5%, -2%) scale(1.02) rotate(-1.5deg);
    }

    75% {
      transform: translate(-1.5%, 2%) scale(1.06) rotate(1.5deg);
    }
  }

  :global(html.dark) .btn-ghost-slim:hover {
    background: #fafafa !important;
    color: #0a0a0a !important;
    border-color: #ffffff !important;
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
      letter-spacing: -0.046em;
      line-height: 0.94;
    }

    .sub-frase {
      font-size: 16px !important;
      gap: 8px 12px;
    }

    .texto-bio {
      font-size: 16.5px;
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

  }

  /* Cabecera fija: el label gris no debe quedar tapado en móvil */
  @media (prefers-reduced-motion: reduce) {
    .hero-entry {
      opacity: 1;
      animation: none !important;
      transform: none !important;
      will-change: auto;
    }

    .hero-title-accent {
      animation: none !important;
      background: none;
      -webkit-text-fill-color: currentColor;
    }

    .luces-dinamicas {
      animation: none;
      transform: none;
    }

    :global(html.dark) .luces-dinamicas {
      animation: none;
      transform: none;
    }

    :global(html.dark) .hero-stripe-pro-v2::before,
    :global(html.dark) .hero-stripe-pro-v2::after {
      animation: none;
    }

    :global(html.dark) .hero-stripe-pro-v2::before {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(1);
    }

  }

  @media (max-width: 768px) {
    .hero-entry {
      --hero-entry-y: 18px;
      --hero-entry-duration: 860ms;
    }

    .hero-entry-1 {
      --hero-entry-y: -8px;
      animation-delay: 60ms;
    }

    .hero-entry-2 {
      --hero-entry-y: 24px;
      animation-delay: 130ms;
    }

    .hero-entry-3 {
      --hero-entry-y: 18px;
      animation-delay: 220ms;
    }

    .hero-entry-4 {
      --hero-entry-y: 16px;
      animation-delay: 300ms;
    }

    .hero-entry-5 {
      --hero-entry-y: 14px;
      animation-delay: 390ms;
    }

    .hero-stripe-pro-v2 {
      align-items: flex-start;
      padding-top: max(6.25rem, calc(env(safe-area-inset-top, 0px) + 5.25rem));
      padding-bottom: 72px;
    }

    .label-top {
      font-size: 11.5px;
      letter-spacing: 0.12em;
      line-height: 1.45;
      margin-bottom: 14px;
      padding: 0 4px;
      max-width: 100%;
    }

    .hero-stripe-pro-v2 h1 {
      font-size: clamp(34px, 10vw, 54px) !important;
      letter-spacing: -0.034em;
      line-height: 0.96;
    }

    .sub-frase {
      font-size: 14.5px !important;
      margin: 0 0 20px 0 !important;
      gap: 6px 10px;
    }

    .hero-tech-item {
      min-height: 28px;
      gap: 6px;
    }

    .hero-tech-icon {
      width: 16px;
      height: 16px;
    }

    .texto-bio {
      font-size: 15.5px;
      line-height: 1.62;
      margin-bottom: 28px;
    }
  }
</style>
