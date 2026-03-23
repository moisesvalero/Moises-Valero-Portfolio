<script lang="ts">
  interface Props {
    heading?: string;
    subtitle?: string;
    typebotSrc?: string;
    whatsappLead?: string;
    whatsappButtonLabel?: string;
    iframeTitle?: string;
  }

  let {
    heading = '¿Hablamos?',
    subtitle = '',
    typebotSrc = 'https://typebot.io/asistente-mois-s-valero-sud5oya',
    whatsappLead = '¿Prefieres WhatsApp? Escríbeme sin salir de un clic.',
    whatsappButtonLabel = 'Escribir por WhatsApp',
    iframeTitle = 'Asistente de chat — Moisés Valero'
  }: Props = $props();

  /** El número no va en el HTML: redirección en servidor (WHATSAPP_E164 en .env). */
  const whatsappHref = '/api/contact/whatsapp';
</script>

<section class="seccion-final-unificada" id="contacto" aria-labelledby="contacto-titulo">
  <div class="luces-fondo-unificado" aria-hidden="true"></div>

  <div class="contenido-unificado">
    <div class="header-final">
      <h3 id="contacto-titulo">{heading}</h3>
      {#if subtitle}
        <p>{subtitle}</p>
      {/if}
    </div>

    <div class="chat-container-final">
      <iframe
        src={typebotSrc}
        class="typebot-frame"
        title={iframeTitle}
        allow="camera; microphone; autoplay; encrypted-media"
      ></iframe>
    </div>

    <div class="botones-final">
      <p class="texto-whatsapp-final">{whatsappLead}</p>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-whatsapp-final"
      >
        {whatsappButtonLabel} <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>

<style>
  .seccion-final-unificada {
    position: relative;
    width: 100%;
    max-width: min(1200px, 100%);
    margin: 60px auto;
    padding: 60px clamp(16px, 5vw, 48px) 50px;
    background: #1d1d1f;
    border-radius: 20px;
    overflow: hidden;
    text-align: center;
    font-family: inherit;
    box-sizing: border-box;
    scroll-margin-top: 96px;
  }

  .luces-fondo-unificado {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.15) 0%, transparent 70%);
    z-index: 1;
    pointer-events: none;
  }

  .contenido-unificado {
    position: relative;
    z-index: 10;
  }

  .header-final {
    margin-bottom: 24px;
  }

  .seccion-final-unificada h3 {
    color: #f5f5f7 !important;
    font-size: 40px !important;
    font-weight: 800 !important;
    margin: 0 0 10px 0 !important;
    letter-spacing: -1px;
  }

  .header-final p {
    color: #a1a1a6 !important;
    font-size: 18px !important;
    max-width: 650px;
    margin: 0 auto 24px auto !important;
    line-height: 1.5;
  }

  .chat-container-final {
    margin-bottom: 16px;
    min-height: auto;
    position: relative;
  }

  .typebot-frame {
    width: 100%;
    height: 380px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: block;
  }

  .texto-whatsapp-final {
    color: #a1a1a6;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .btn-whatsapp-final {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgb(37, 211, 102);
    color: #ffffff !important;
    padding: 14px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-whatsapp-final:hover {
    background: rgb(30, 175, 85);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    color: #ffffff !important;
  }

  @media (max-width: 768px) {
    .seccion-final-unificada {
      padding: 40px 20px;
      scroll-margin-top: 88px;
    }

    .seccion-final-unificada h3 {
      font-size: 30px !important;
    }

    .typebot-frame {
      height: 420px;
    }
  }
</style>
