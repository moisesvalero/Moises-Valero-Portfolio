<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { getChatbotPageCopy } from '$lib/i18n/proyectos/chatbot-copy';
  import { getProyectoPageLabels } from '$lib/i18n/proyecto-page-labels';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const canonical = `${baseUrl}/proyectos/chatbot`;
  const ogImage = `${baseUrl}/og-image.png`;
  const ogTitleShort = 'Chatbot IA — Caso de Estudio';
  const ogDesc =
    'IA conversacional entrenada con tu perfil, webhooks y notificaciones en tiempo real sin infraestructura compleja.';

  const c = $derived(getChatbotPageCopy(data.locale));
  const L = $derived(getProyectoPageLabels(data.locale));
  const seoEs = getChatbotPageCopy('es');
  const projectJsonLd = $derived(
    stringifyJsonLdForHtml({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: seoEs.headTitle,
      description: seoEs.headDescription,
      url: canonical,
      inLanguage: data.locale,
      author: {
        '@type': 'Person',
        name: 'Moisés Valero'
      },
      image: ogImage
    })
  );
</script>

<svelte:head>
  <title>{seoEs.headTitle}</title>
  <meta name="description" content={seoEs.headDescription} />
  <link rel="alternate" hreflang="es" href={canonical} />
  <link rel="alternate" hreflang="x-default" href={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={ogTitleShort} />
  <meta property="og:description" content={ogDesc} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Moisés Valero" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={ogTitleShort} />
  <meta name="twitter:description" content={ogDesc} />
  <meta name="twitter:image" content={ogImage} />
  <JsonLdScript json={projectJsonLd} />
</svelte:head>

<div class="chatbot-case-page">
  <section class="hero">
    <div class="hero-inner">
      <span class="hero-tag">{c.heroTag}</span>
      <h1>{@html c.heroTitleHtml}</h1>
      <p class="hero-sub">{c.heroSub}</p>
      <div class="tags">
        <span class="tag">Typebot</span>
        <span class="tag">Groq API</span>
        <span class="tag">Llama 3.3</span>
        <span class="tag">Make.com</span>
        <span class="tag">Telegram Bot</span>
        <span class="tag">WordPress</span>
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
          src="/imagenes/captura-portfolio_ember-scaled.avif"
          alt={c.imgMainAlt}
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
        <span class="stat-num">{@html c.stat1Num}</span>
        <span class="stat-label">{c.stat1Label}</span>
      </div>
      <div class="stat">
        <span class="stat-num">{c.stat2Num}</span>
        <span class="stat-label">{c.stat2Label}</span>
      </div>
      <div class="stat">
        <span class="stat-num">{c.stat3Num}</span>
        <span class="stat-label">{c.stat3Label}</span>
      </div>
      <div class="stat">
        <span class="stat-num" aria-hidden="true">📱</span>
        <span class="stat-label">{c.stat4Label}</span>
      </div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <p class="section-label">{L.elReto}</p>
      <h2>{c.retoTitle}</h2>
      <p>{c.retoP}</p>
    </div>
    <div class="section">
      <p class="section-label">{L.loQueHice}</p>
      <h2>{c.hiceTitle}</h2>
      <p>{c.hiceP1}</p>
      <div class="highlight-box">
        <!-- svelte-ignore hydration_html_changed -->
        {@html c.hiceHighlightHtml}
      </div>
    </div>
  </div>

  <div class="flow-section">
    <div class="flow-inner">
      <p class="flow-title">{c.flowTitle}</p>
      <div class="flow">
        <div class="flow-step">
          <div class="flow-icon">💬</div>
          <span class="flow-label">{@html c.flowL1}</span>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <div class="flow-icon">🤖</div>
          <span class="flow-label">{@html c.flowL2}</span>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <div class="flow-icon">⚡</div>
          <span class="flow-label">{@html c.flowL3}</span>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <div class="flow-icon">🔗</div>
          <span class="flow-label">{@html c.flowL4}</span>
        </div>
        <span class="flow-arrow">→</span>
        <div class="flow-step">
          <div class="flow-icon">📱</div>
          <span class="flow-label">{@html c.flowL5}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="chat-section">
    <div class="chat-inner">
      <p class="chat-title">{c.chatTitle}</p>
      <div class="chat-window">
        <div class="chat-msg user">
          <div class="chat-avatar">R</div>
          <div class="chat-bubble">{c.chatUser1}</div>
        </div>
        <div class="chat-msg bot">
          <div class="chat-avatar">MV</div>
          <div class="chat-bubble">{c.chatBot1}</div>
        </div>
        <div class="chat-msg user">
          <div class="chat-avatar">R</div>
          <div class="chat-bubble">{c.chatUser2}</div>
        </div>
        <div class="chat-msg bot">
          <div class="chat-avatar">MV</div>
          <div class="chat-bubble">{c.chatBot2}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="stack-section">
    <div class="stack-inner">
      <p class="section-label stack-label">{L.stackTech}</p>
      <div class="stack-grid">
        <span class="stack-item">Typebot</span>
        <span class="stack-item">Groq API</span>
        <span class="stack-item">Llama 3.3</span>
        <span class="stack-item">Make.com</span>
        <span class="stack-item">Webhook</span>
        <span class="stack-item">Telegram Bot</span>
        <span class="stack-item">WordPress</span>
        <span class="stack-item">iframe</span>
      </div>
    </div>
  </div>

  <div class="cta-section">
    <h3>{c.ctaTitle}</h3>
    <p class="cta-lead">{c.ctaLead}</p>
    <a href="/#contacto" class="btn">
      {c.ctaBtn}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15,3 21,3 21,9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
    <a href="/#proyectos" class="btn btn-outline">{c.ctaBack}</a>
  </div>
</div>

<style>
  .chatbot-case-page {
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

  .flow-section {
    background: var(--fondo-suave);
    border-top: 1px solid var(--borde);
    border-bottom: 1px solid var(--borde);
    padding: 64px 48px;
  }

  .flow-inner {
    max-width: 760px;
    margin: 0 auto;
  }

  .flow-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--secundario);
    margin-bottom: 32px;
  }

  .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .flow-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--principal);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .flow-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--secundario);
    text-align: center;
    line-height: 1.35;
  }

  .flow-arrow {
    color: var(--enfasis);
    font-size: 22px;
    font-weight: 700;
    padding-bottom: 24px;
  }

  .chat-section {
    padding: 64px 48px;
    border-bottom: 1px solid var(--borde);
  }

  .chat-inner {
    max-width: 600px;
    margin: 0 auto;
  }

  .chat-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--secundario);
    margin-bottom: 32px;
  }

  .chat-window {
    background: var(--fondo-suave);
    border: 1px solid var(--borde);
    border-radius: 20px;
    padding: 28px;
  }

  .chat-msg {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .chat-msg.user {
    flex-direction: row-reverse;
  }

  .chat-bubble {
    max-width: 78%;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 15px;
    line-height: 1.5;
  }

  .chat-msg.bot .chat-bubble {
    background: #fff;
    border: 1px solid var(--borde);
    color: var(--principal);
    border-radius: 4px 14px 14px 14px;
  }

  .chat-msg.user .chat-bubble {
    background: var(--enfasis);
    color: #fff;
    border-radius: 14px 4px 14px 14px;
  }

  .chat-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--principal);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .chat-msg.user .chat-avatar {
    background: var(--secundario);
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
    .flow-section,
    .chat-section {
      padding: 40px 24px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .window-mockup {
      height: 350px;
      --mock-inner-height: calc(350px - 34px);
    }

    .flow {
      flex-direction: column;
    }

    .flow-arrow {
      transform: rotate(90deg);
      padding-bottom: 0;
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
