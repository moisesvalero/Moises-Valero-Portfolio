<script lang="ts">
  import { getProyectoPageLabels } from '$lib/i18n/proyecto-page-labels';
  import type { SiteLocale } from '$lib/i18n/site-locale';
  import type { CaseStudy } from '$lib/types/case-study';

  interface Props {
    study: CaseStudy;
    locale?: SiteLocale;
  }

  let { study, locale = 'es' }: Props = $props();

  const L = $derived(getProyectoPageLabels(locale));
  const altMain = $derived(
    locale === 'en' ? `${study.title} — main view` : `${study.title} — vista principal`
  );
  const altSec = (n: number) =>
    locale === 'en' ? `${study.title} — screenshot ${n}` : `${study.title} — captura secundaria ${n}`;
</script>

<div class="case-study-root">
  <section class="hero">
    <div class="hero-inner">
      <span class="hero-tag">{study.heroTag}</span>
      <h1>{study.title}</h1>
      <p class="hero-sub">{study.heroDescription}</p>
      <div class="tags">
        {#each study.tags as tag (tag)}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    </div>
  </section>

  <div class="mockup-container">
    <div class="window-mockup">
      <div class="window-header">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="window-content">
        <img
          src={study.images.principal}
          alt={altMain}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  </div>

  <div class="stats-section">
    <div class="stats-grid">
      {#each study.metrics as m (m.label)}
        <div class="stat">
          <span class="stat-num">{m.value}</span>
          <span class="stat-label">{m.label}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="content">
    <div class="section">
      <p class="section-label">{L.elReto}</p>
      <h2>{study.reto.title}</h2>
      <div class="section-body">{@html study.reto.bodyHtml}</div>
    </div>
    <div class="section">
      <p class="section-label">{L.loQueHice}</p>
      <h2>{study.hice.title}</h2>
      <div class="section-body">{@html study.hice.bodyHtml}</div>
    </div>
  </div>

  <div class="mockup-grid-container">
    <div class="window-mockup-small">
      <div class="window-header">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="window-content-static">
        <img
          src={study.images.secondary1}
          alt={altSec(1)}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
    <div class="window-mockup-small">
      <div class="window-header">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="window-content-static">
        <img
          src={study.images.secondary2}
          alt={altSec(2)}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <p class="section-label">{L.resultado}</p>
      <h2>{study.resultado.title}</h2>
      <div class="section-body">{@html study.resultado.bodyHtml}</div>
    </div>
  </div>

  <div class="stack-section">
    <div class="stack-inner">
      <p class="section-label stack-label">{L.stackTech}</p>
      <div class="stack-grid">
        {#each study.stack as tech (tech)}
          <span class="stack-item">{tech}</span>
        {/each}
      </div>
    </div>
  </div>

  <div class="cta-section">
    <a href={study.liveUrl} class="btn" target="_blank" rel="noopener noreferrer">{L.verProyectoVivo}</a>
    <a href="/#proyectos" class="btn btn-outline">{L.volverPortfolio}</a>
  </div>
</div>

<style>
  .case-study-root {
    --principal: #1d1d1f;
    --secundario: #86868b;
    --enfasis: #0071e3;
    --fondo: #ffffff;
    --fondo-suave: #f5f5f7;
    --borde: #e8e8ed;

    font-family: var(--font-sans);
    background: var(--fondo);
    color: var(--principal);
    width: 100%;
    -webkit-font-smoothing: antialiased;
  }

  .hero {
    background: var(--fondo-suave);
    padding: 100px 48px 80px;
  }

  .hero-inner {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-tag {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--enfasis);
    margin-bottom: 20px;
  }

  .hero h1 {
    font-size: clamp(40px, 6vw, 72px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 20px;
    border: none;
  }

  .hero-sub {
    font-size: 20px;
    color: var(--secundario);
    font-weight: 400;
    margin-bottom: 40px;
    line-height: 1.5;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #fff;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 100px;
    border: 1px solid var(--borde);
  }

  .mockup-container {
    background: var(--fondo-suave);
    padding: 80px 48px;
    border-top: 1px solid var(--borde);
    border-bottom: 1px solid var(--borde);
    display: flex;
    justify-content: center;
  }

  .window-mockup {
    /* Altura útil bajo la barra de ventana (34px); el hover usa esto para no desplazar imágenes cortas hacia abajo */
    --mock-inner-height: calc(550px - 34px);
    width: 100%;
    max-width: 1000px;
    height: 550px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
    box-shadow:
      0 30px 100px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
      box-shadow 0.4s ease;
  }

  .window-mockup:hover {
    transform: translateY(-8px);
    box-shadow:
      0 50px 120px rgba(0, 0, 0, 0.2),
      0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .window-header {
    height: 34px;
    background: #f8f8f9;
    border-bottom: 1px solid var(--borde);
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 7px;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .dot.red {
    background: #ff5f57;
    border: 1px solid #e0443e;
  }

  .dot.yellow {
    background: #ffbd2e;
    border: 1px solid #dea123;
  }

  .dot.green {
    background: #28c840;
    border: 1px solid #1aab29;
  }

  .window-content {
    width: 100%;
    height: calc(100% - 34px);
    cursor: n-resize;
    overflow: hidden;
  }

  .window-content img {
    width: 100%;
    height: auto;
    transition: transform 6s ease-in-out;
    display: block;
  }

  .window-mockup:hover .window-content img {
    transform: translateY(min(0px, calc(-100% + var(--mock-inner-height))));
  }

  .stats-section {
    background: var(--principal);
    padding: 48px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }

  .stat {
    text-align: center;
    padding: 24px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat:last-child {
    border-right: none;
  }

  .stat-num {
    font-size: 42px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -1.5px;
    display: block;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 6px;
    display: block;
  }

  .content {
    max-width: 760px;
    margin: 0 auto;
    padding: 80px 24px;
  }

  .section {
    margin-bottom: 64px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--secundario);
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--borde);
    display: block;
  }

  .stack-label {
    border-bottom: none;
    padding-bottom: 0;
  }

  .section h2 {
    font-size: 28px;
    font-weight: 700;
    color: var(--principal);
    margin-bottom: 16px;
    border: none;
  }

  .section-body :global(p) {
    font-size: 17px;
    color: #3a3a3c;
    line-height: 1.8;
    margin-bottom: 16px;
  }

  .section-body :global(p:last-child) {
    margin-bottom: 0;
  }

  .mockup-grid-container {
    background: var(--fondo-suave);
    padding: 80px 48px;
    display: flex;
    justify-content: center;
    gap: 40px;
  }

  .window-mockup-small {
    flex: 1;
    max-width: 500px;
    height: 380px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    overflow: hidden;
    position: relative;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.1),
      0 8px 15px rgba(0, 0, 0, 0.04);
    transition: transform 0.3s ease;
  }

  .window-mockup-small:hover {
    transform: translateY(-5px);
  }

  .window-content-static {
    width: 100%;
    height: calc(100% - 34px);
  }

  .window-content-static img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
  }

  .stack-section {
    background: var(--fondo-suave);
    padding: 64px 48px;
    border-top: 1px solid var(--borde);
    border-bottom: 1px solid var(--borde);
  }

  .stack-inner {
    max-width: 760px;
    margin: 0 auto;
  }

  .stack-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .stack-item {
    background: var(--principal);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 18px;
    border-radius: 8px;
  }

  .cta-section {
    padding: 100px 48px;
    text-align: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--enfasis);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    padding: 16px 32px;
    border-radius: 100px;
    text-decoration: none;
    transition: all 0.2s;
  }

  .btn:hover {
    opacity: 0.85;
    transform: translateY(-2px);
  }

  .btn-outline {
    background: transparent;
    color: var(--principal);
    border: 1.5px solid var(--borde);
    margin-left: 14px;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .mockup-grid-container {
      flex-direction: column;
      gap: 30px;
      padding: 40px 24px;
    }

    .window-mockup {
      height: 350px;
      --mock-inner-height: calc(350px - 34px);
    }

    .window-mockup-small {
      height: 280px;
    }

    .btn-outline {
      margin-left: 0;
      margin-top: 15px;
    }

    .cta-section .btn {
      display: flex;
      width: 100%;
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
      justify-content: center;
    }

    .cta-section .btn-outline {
      display: flex;
    }
  }
</style>
