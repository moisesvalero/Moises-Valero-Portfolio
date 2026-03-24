<script lang="ts">
  import { onDestroy } from 'svelte';
  import { t } from '$lib/i18n/index.js';
  import { cookieConsent, setCookieConsent } from '$lib/cookie-consent';

  interface Props {
    heading?: string;
    subtitle?: string;
    typebotSrc?: string;
    whatsappLead?: string;
    whatsappButtonLabel?: string;
    formLead?: string;
    formButtonLabel?: string;
    formModalHeading?: string;
    formModalText?: string;
    formModalSubmitLabel?: string;
    formModalPrivacyLabel?: string;
    formModalSuccessMessage?: string;
    iframeTitle?: string;
  }

  let {
    heading = '¿Hablamos?',
    subtitle = '',
    typebotSrc = 'https://typebot.io/asistente-mois-s-valero-sud5oya',
    whatsappLead = '¿Prefieres WhatsApp? Te respondo rápido por ahí.',
    whatsappButtonLabel = 'Escribir por WhatsApp',
    formLead = '¿Prefieres formulario? Déjame tus datos y te escribo por email.',
    formButtonLabel = 'Abrir formulario',
    formModalHeading = 'Cuéntame tu proyecto',
    formModalText = 'Déjame tus datos y te responderé lo antes posible.',
    formModalSubmitLabel = 'Enviar solicitud',
    formModalPrivacyLabel = 'He leído y acepto la política de privacidad.',
    formModalSuccessMessage = 'Mensaje enviado. Te responderé en breve.',
    iframeTitle = 'Asistente de chat — Moisés Valero'
  }: Props = $props();

  /** El número no va en el HTML: redirección en servidor (WHATSAPP_E164 en .env). */
  const whatsappHref = '/api/contact/whatsapp';

  let allowTypebot = $state(false);
  let isFormModalOpen = $state(false);
  let formStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
  let formError = $state('');
  let form = $state({
    name: '',
    email: '',
    phone: '',
    message: '',
    privacyAccepted: false
  });
  const unsub = cookieConsent.subscribe((v) => {
    allowTypebot = v === 'all';
  });
  onDestroy(() => unsub());

  function enableChat() {
    setCookieConsent('all');
  }

  function openFormModal() {
    isFormModalOpen = true;
    formStatus = 'idle';
    formError = '';
  }

  function closeFormModal() {
    isFormModalOpen = false;
  }

  async function submitForm(event: SubmitEvent) {
    event.preventDefault();
    if (formStatus === 'sending') return;
    formStatus = 'sending';
    formError = '';

    const response = await fetch('/api/contact/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) {
      formStatus = 'error';
      formError = data?.error || 'No se pudo enviar el formulario.';
      return;
    }
    formStatus = 'success';
    form = { name: '', email: '', phone: '', message: '', privacyAccepted: false };
  }
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
      {#if allowTypebot}
        <iframe
          src={typebotSrc}
          class="typebot-frame"
          title={iframeTitle}
          allow="camera; microphone; autoplay; encrypted-media"
        ></iframe>
      {:else}
        <div class="chat-blocked" role="status">
          <p class="chat-blocked-title">{$t('contactChatBlocked.title')}</p>
          <p class="chat-blocked-body">{$t('contactChatBlocked.body')}</p>
          <button type="button" class="btn-enable-chat" onclick={enableChat}>
            {$t('contactChatBlocked.accept')}
          </button>
        </div>
      {/if}
    </div>

    <div class="botones-final">
      <p class="contact-cta-mobile-intro">{$t('contactCta.mobileIntro')}</p>
      <div class="cta-stack">
        <p class="texto-whatsapp-final texto-cta-lead-desktop">{whatsappLead}</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          class="btn-whatsapp-final"
        >
          <span class="btn-cta-label-long">{whatsappButtonLabel}</span>
          <span class="btn-cta-label-short">{$t('contactCta.whatsappShort')}</span>
          <span aria-hidden="true" class="btn-cta-arrow">→</span>
        </a>
      </div>
      <div class="cta-stack">
        <p class="texto-whatsapp-final texto-cta-lead-desktop">{formLead}</p>
        <button type="button" class="btn-form-final" onclick={openFormModal}>
          <span class="btn-cta-label-long">{formButtonLabel}</span>
          <span class="btn-cta-label-short">{$t('contactCta.formShort')}</span>
          <span aria-hidden="true" class="btn-cta-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</section>

{#if isFormModalOpen}
  <div class="modal-shell" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
    <button type="button" class="modal-backdrop" onclick={closeFormModal} aria-label="Cerrar"></button>
    <div class="modal-card">
      <div class="modal-head">
        <h4 id="form-modal-title">{formModalHeading}</h4>
        <p>{formModalText}</p>
      </div>
      <form class="modal-form" onsubmit={submitForm}>
        <label>
          <span>Nombre *</span>
          <input required bind:value={form.name} maxlength="100" />
        </label>
        <label>
          <span>Email *</span>
          <input type="email" required bind:value={form.email} maxlength="120" />
        </label>
        <label>
          <span>Teléfono (opcional)</span>
          <input bind:value={form.phone} maxlength="40" />
        </label>
        <label>
          <span>Mensaje *</span>
          <textarea required bind:value={form.message} maxlength="2000"></textarea>
        </label>
        <label class="checkline">
          <input type="checkbox" required bind:checked={form.privacyAccepted} />
          <span>{formModalPrivacyLabel} <a href="/privacidad">Ver política</a></span>
        </label>
        {#if formStatus === 'error' && formError}
          <p class="form-feedback error">{formError}</p>
        {/if}
        {#if formStatus === 'success'}
          <p class="form-feedback success">{formModalSuccessMessage}</p>
        {/if}
        <div class="modal-actions">
          <button type="button" class="btn-modal-ghost" onclick={closeFormModal}>Cerrar</button>
          <button type="submit" class="btn-modal-primary" disabled={formStatus === 'sending'}>
            {formStatus === 'sending' ? 'Enviando...' : formModalSubmitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

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

  .chat-blocked {
    width: 100%;
    min-height: 280px;
    padding: 28px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
  }

  .chat-blocked-title {
    margin: 0 0 10px;
    color: #f5f5f7;
    font-size: 17px;
    font-weight: 700;
  }

  .chat-blocked-body {
    margin: 0 0 18px;
    color: #a1a1a6;
    font-size: 14px;
    line-height: 1.55;
    max-width: 420px;
  }

  .btn-enable-chat {
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 22px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    background: #0071e3;
    color: #fff;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .btn-enable-chat:hover {
    background: #0077ed;
    transform: translateY(-1px);
  }

  .contact-cta-mobile-intro {
    display: none;
  }

  .btn-cta-label-short {
    display: none;
  }

  .btn-cta-label-long {
    display: inline;
  }

  .texto-whatsapp-final {
    color: #a1a1a6;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .botones-final {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;
  }

  .cta-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .btn-whatsapp-final {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgb(37, 211, 102);
    color: #ffffff !important;
    padding: 14px 30px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    max-width: 100%;
  }

  .btn-whatsapp-final:hover {
    background: rgb(30, 175, 85);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    color: #ffffff !important;
  }

  .btn-form-final {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    color: #f5f5f7;
    padding: 14px 30px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    max-width: 100%;
  }

  .btn-form-final:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .modal-shell {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(4, 7, 13, 0.72);
    border: 0;
    cursor: pointer;
  }

  .modal-card {
    position: relative;
    z-index: 1;
    width: min(700px, 100%);
    max-height: calc(100vh - 32px);
    overflow: auto;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
    text-align: left;
  }

  .modal-head {
    padding: 24px 24px 8px;
  }

  .modal-head h4 {
    margin: 0;
    color: #1d1d1f;
    font-size: 28px;
    font-weight: 800;
  }

  .modal-head p {
    margin: 10px 0 0;
    color: #65656b;
    font-size: 15px;
  }

  .modal-form {
    padding: 16px 24px 24px;
    display: grid;
    gap: 12px;
  }

  .modal-form label {
    display: grid;
    gap: 6px;
  }

  .modal-form span {
    color: #232328;
    font-size: 14px;
    font-weight: 600;
  }

  .modal-form input,
  .modal-form textarea {
    width: 100%;
    border: 1px solid #d4d4dc;
    border-radius: 10px;
    padding: 11px 12px;
    font-size: 15px;
    font-family: inherit;
  }

  .modal-form textarea {
    min-height: 120px;
    resize: vertical;
  }

  .checkline {
    display: flex !important;
    align-items: flex-start;
    gap: 10px;
    margin-top: 4px;
  }

  .checkline input {
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }

  .checkline span {
    color: #5d5d65;
    font-size: 13px;
    font-weight: 500;
  }

  .checkline a {
    color: #006c49;
    text-decoration: none;
    font-weight: 700;
  }

  .form-feedback {
    margin: 4px 0;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
  }

  .form-feedback.error {
    color: #a61d24;
    background: #fdecec;
    border: 1px solid #f7cfd1;
  }

  .form-feedback.success {
    color: #116a3b;
    background: #e8f7ef;
    border: 1px solid #c8ebd7;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
  }

  .btn-modal-ghost,
  .btn-modal-primary {
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    border: 0;
    cursor: pointer;
  }

  .btn-modal-ghost {
    background: #f1f2f5;
    color: #2e2f34;
  }

  .btn-modal-primary {
    background: #ffffff;
    color: #111111;
    border: 1px solid #1f1f1f;
  }

  .btn-modal-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .seccion-final-unificada {
      padding: 32px 16px 36px;
      scroll-margin-top: 88px;
    }

    .header-final {
      margin-bottom: 16px;
    }

    .seccion-final-unificada h3 {
      font-size: 26px !important;
      letter-spacing: -0.5px !important;
    }

    .header-final p {
      font-size: 15px !important;
      margin-bottom: 16px !important;
    }

    .chat-container-final {
      margin-bottom: 12px;
    }

    .typebot-frame {
      height: min(52vh, 360px);
    }

    .chat-blocked {
      min-height: 220px;
      padding: 20px 16px;
    }

    .contact-cta-mobile-intro {
      display: block;
      grid-column: 1 / -1;
      margin: 0 0 10px;
      color: #86868d;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.35;
    }

    .texto-cta-lead-desktop {
      display: none;
    }

    .btn-cta-label-long {
      display: none;
    }

    .btn-cta-label-short {
      display: inline;
    }

    .btn-cta-arrow {
      display: none;
    }

    .botones-final {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      align-items: stretch;
      margin-top: 0;
    }

    .cta-stack {
      width: 100%;
    }

    .btn-whatsapp-final,
    .btn-form-final {
      width: 100%;
      padding: 11px 12px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 10px;
    }

    .modal-head h4 {
      font-size: 22px;
    }

    .modal-head {
      padding: 18px 16px 4px;
    }

    .modal-form {
      padding: 12px 16px 16px;
    }
  }
</style>
