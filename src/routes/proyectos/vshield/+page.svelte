<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { setSeo } from '$lib/seo';

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'http://localhost:5173').toString().replace(/\/$/, '');
  const canonical = `${baseUrl}/proyectos/vshield`;

  $effect(() => {
    setSeo({
      title: 'V-Shield — Caso de Estudio | Moisés Valero',
      description:
        'Landing de ciberseguridad con terminal interactiva en JavaScript, WordPress, Elementor y alto PageSpeed en móvil.',
      ogTitle: 'V-Shield — Caso de Estudio',
      ogDescription:
        'Landing de ciberseguridad con terminal interactiva, formulario sin plugins y optimización de rendimiento.',
      canonical,
      ogUrl: canonical,
      ogImage: `${baseUrl}/og-image.png`,
      twitterCard: 'summary_large_image'
    });
  });
</script>

<svelte:head>
  <title>V-Shield — Caso de Estudio | Moisés Valero</title>
  <meta
    name="description"
    content="Landing de ciberseguridad con terminal interactiva en JavaScript, WordPress, Elementor y alto PageSpeed en móvil."
  />
  <link rel="canonical" href={canonical} />
</svelte:head>

<div class="vshield-page">
  <section class="hero">
    <div class="hero-inner">
      <span class="hero-tag">Proyecto de Portfolio · Landing Page</span>
      <h1>V-Shield</h1>
      <p class="hero-sub">
        Landing page de alto impacto para empresa de ciberseguridad, con terminal interactiva funcional desarrollada en
        JavaScript.
      </p>
      <div class="tags">
        <span class="tag">WordPress</span>
        <span class="tag">Elementor</span>
        <span class="tag">Astra</span>
        <span class="tag">JavaScript</span>
        <span class="tag">Custom Scripts</span>
        <span class="tag">Prompt Engineering</span>
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
          src="/imagenes/captura-vshieldfinal_ember-scaled.avif"
          alt="Captura principal de V-Shield"
          width="1200"
          height="800"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  </div>

  <div class="stats-section">
    <div class="stats-grid">
      <div class="stat">
        <span class="stat-num">~100</span>
        <span class="stat-label">PageSpeed móvil</span>
      </div>
      <div class="stat">
        <span class="stat-num">JS</span>
        <span class="stat-label">Terminal funcional</span>
      </div>
      <div class="stat">
        <span class="stat-num">0</span>
        <span class="stat-label">Plugins de formulario</span>
      </div>
      <div class="stat">
        <span class="stat-num">SVG</span>
        <span class="stat-label">Todos los iconos</span>
      </div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <p class="section-label">El reto</p>
      <h2>Credibilidad técnica desde el primer segundo</h2>
      <p>
        Crear una landing page de alto impacto para una empresa de ciberseguridad ficticia, transmitiendo credibilidad
        técnica y profesionalidad mediante una experiencia visual inmersiva y elementos interactivos reales.
      </p>
    </div>
    <div class="section">
      <p class="section-label">Lo que hice</p>
      <h2>WordPress + Elementor llevado al límite</h2>
      <p>
        Desarrollé la web con WordPress + Astra + Elementor, construyendo prácticamente toda la página con widgets HTML
        personalizados y código CSS/JS generado y depurado con apoyo de IA.
      </p>
      <div class="highlight-box">
        <p>
          <strong>Elemento destacado:</strong> Terminal interactiva completamente funcional desarrollada en JavaScript
          puro, que simula comandos reales y refuerza la identidad técnica de la marca.
        </p>
      </div>
      <p>
        El formulario de contacto está desarrollado íntegramente con código propio sin plugins, integrado con Formspree.io.
        Todos los iconos en SVG para máximo rendimiento. SEO on-page con Yoast, optimización con Autoptimize y seguridad
        con WPS Hide Login.
      </p>
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
          src="/imagenes/terminalfinal.jpeg"
          alt="Terminal interactiva"
          width="800"
          height="600"
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
          src="/imagenes/formulario-vshield.jpeg"
          alt="Formulario de contacto"
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  </div>

  <div class="content">
    <div class="section section-result">
      <p class="section-label">Resultado</p>
      <h2>El mejor rendimiento del portfolio</h2>
      <p>
        Puntuación PageSpeed cercana a 100 en móvil — el mejor resultado de todos los proyectos. Landing funcional con
        terminal operativa, formulario sin plugins y carga ultrarrápida.
      </p>
    </div>
  </div>

  <div class="stack-section">
    <div class="stack-inner">
      <p class="section-label stack-label">Stack tecnológico</p>
      <div class="stack-grid">
        <span class="stack-item">WordPress</span>
        <span class="stack-item">Astra</span>
        <span class="stack-item">Elementor</span>
        <span class="stack-item">JavaScript</span>
        <span class="stack-item">Formspree</span>
        <span class="stack-item">SVG Icons</span>
        <span class="stack-item">Autoptimize</span>
        <span class="stack-item">Yoast SEO</span>
        <span class="stack-item">WPS Hide Login</span>
        <span class="stack-item">Cursor Agent</span>
      </div>
    </div>
  </div>

  <div class="cta-section">
    <h3>¿Quieres ver el proyecto en vivo?</h3>
    <p class="cta-lead">Visita la landing completa o contáctame para hablar sobre tu proyecto.</p>
    <a href="https://moisesvalero.es/v-shield/" class="btn" target="_blank" rel="noopener noreferrer">Ver proyecto en vivo</a>
    <a href="/#proyectos" class="btn btn-outline">← Volver</a>
  </div>
</div>

<style>
  .vshield-page {
    --principal: #1d1d1f;
    --secundario: #86868b;
    --enfasis: #0071e3;
    --fondo: #ffffff;
    --fondo-suave: #f5f5f7;
    --borde: #e8e8ed;

    font-family: var(--font-sans);
    background: var(--fondo);
    color: var(--principal);
    line-height: 1.6;
    width: 100%;
  }

  .hero {
    background: var(--fondo-suave);
    padding: 100px 48px 80px;
    width: 100%;
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
    color: var(--principal);
    margin-bottom: 20px;
  }

  .hero-sub {
    font-size: 20px;
    color: var(--secundario);
    font-weight: 400;
    margin-bottom: 40px;
    max-width: 560px;
    line-height: 1.5;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #fff;
    color: var(--principal);
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 100px;
    border: 1px solid var(--borde);
  }

  .mockup-container {
    background: var(--fondo-suave);
    padding: 80px 48px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--borde);
    border-bottom: 1px solid var(--borde);
  }

  .window-mockup {
    --mock-inner-height: calc(550px - 34px);
    width: 100%;
    max-width: 1000px;
    height: 550px;
    background: #fff;
    border-radius: 16px;
    box-shadow:
      0 30px 100px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
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
    position: sticky;
    top: 0;
    z-index: 2;
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
    display: block;
    transition: transform 6s ease-in-out;
  }

  .window-mockup:hover .window-content img {
    transform: translateY(min(0px, calc(-100% + var(--mock-inner-height))));
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
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.1),
      0 8px 15px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
    overflow: hidden;
    position: relative;
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

  .section-result {
    margin-top: 0;
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
  }

  .stack-label {
    border-bottom: none;
    padding-bottom: 0;
  }

  .section h2 {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.8px;
    color: var(--principal);
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .section p {
    font-size: 17px;
    color: #3a3a3c;
    line-height: 1.8;
    margin-bottom: 16px;
  }

  .highlight-box {
    background: #f0f7ff;
    border: 1px solid #cce0ff;
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
  }

  .highlight-box p {
    color: #0055b3;
    font-size: 16px;
    margin: 0;
    line-height: 1.6;
  }

  .highlight-box strong {
    color: #003d80;
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

  .cta-section h3 {
    font-size: 24px;
    font-weight: 700;
    color: var(--principal);
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }

  .cta-lead {
    color: var(--secundario);
    margin-bottom: 30px;
    font-size: 17px;
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
    .hero,
    .stats-section,
    .mockup-container,
    .mockup-grid-container {
      padding: 40px 24px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .window-mockup {
      height: 350px;
      --mock-inner-height: calc(350px - 34px);
    }

    .mockup-grid-container {
      flex-direction: column;
      gap: 30px;
    }

    .window-mockup-small {
      height: 280px;
    }

    .btn-outline {
      margin-left: 0;
      margin-top: 12px;
    }

    .cta-section .btn {
      display: inline-flex;
      width: 100%;
      max-width: 320px;
      justify-content: center;
    }
  }
</style>
