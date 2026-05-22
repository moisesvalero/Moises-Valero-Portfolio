<script lang="ts">
  import { tick } from 'svelte';
  import { t } from '$lib/i18n/index.js';
  import { loadTypebotWebModule, resetTypebotWebModuleCache } from '$lib/load-typebot';
  import ContactFluidOverlay from './ContactFluidOverlay.svelte';

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
    formLead = 'Formulario',
    formButtonLabel = 'Abrir formulario',
    formModalHeading = 'Cuéntame tu proyecto',
    formModalText = 'Déjame tus datos y te responderé lo antes posible.',
    formModalSubmitLabel = 'Enviar solicitud',
    formModalPrivacyLabel = 'He leído y acepto la política de privacidad.',
    formModalSuccessMessage = 'Mensaje enviado. Te responderé en breve.',
    iframeTitle = 'Asistente de chat — Moisés Valero'
  }: Props = $props();

  /** El número no va en el HTML: redirección en servidor al WhatsApp activo. */
  const whatsappHref = '/api/contact/whatsapp';

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
  /** Hover en textos y foco dentro de zonas de lectura pausan nuevos trazos del fluido. */
  let readingHoverDepth = $state(0);
  let readingFocusDepth = $state(0);
  const fluidPaused = $derived(readingHoverDepth > 0 || readingFocusDepth > 0);

  function readingZonePointerEnter() {
    readingHoverDepth++;
  }

  function readingZonePointerLeave() {
    readingHoverDepth = Math.max(0, readingHoverDepth - 1);
  }

  function isInsideReadingZone(node: EventTarget | null, root: HTMLElement): boolean {
    const el = node instanceof Element ? node : null;
    return !!(el && root.contains(el) && el.closest('.contact-reading-zone'));
  }

  function readingAreaFocusIn(event: FocusEvent & { currentTarget: HTMLElement }) {
    if (!isInsideReadingZone(event.target, event.currentTarget)) return;
    const prev = event.relatedTarget as Node | null;
    if (isInsideReadingZone(prev, event.currentTarget)) return;
    readingFocusDepth++;
  }

  function readingAreaFocusOut(event: FocusEvent & { currentTarget: HTMLElement }) {
    const next = event.relatedTarget as Node | null;
    if (isInsideReadingZone(next, event.currentTarget)) return;
    if (!isInsideReadingZone(event.target, event.currentTarget)) return;
    readingFocusDepth = Math.max(0, readingFocusDepth - 1);
  }

  const TYPEBOT_PUBLIC_ID = 'asistente-mois-s-valero-sud5oya';
  const typebotTheme = {
    chatWindow: {
      backgroundColor: 'transparent'
    }
  };

  let typebotLoadStarted = false;
  let typebotLoadError = $state(false);
  let typebotReady = $state(false);
  let shouldLoadTypebot = $state(false);

  function isChatNearViewport(node: HTMLElement, margin = 280) {
    const rect = node.getBoundingClientRect();
    return rect.top < window.innerHeight + margin && rect.bottom > -margin;
  }

  /** IO + scroll + timeout: Safari/iOS a veces no dispara IO dentro de overflow:hidden. */
  function loadTypebotWhenVisible(node: HTMLElement) {
    const activate = () => {
      shouldLoadTypebot = true;
    };

    if (isChatNearViewport(node)) {
      activate();
      return;
    }

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          activate();
        },
        { rootMargin: '280px 0px', threshold: 0 }
      );
      io.observe(node);
    }

    const onScrollOrResize = () => {
      if (isChatNearViewport(node)) activate();
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    const timeout = window.setTimeout(activate, 10_000);

    return {
      destroy() {
        io?.disconnect();
        window.removeEventListener('scroll', onScrollOrResize);
        window.removeEventListener('resize', onScrollOrResize);
        window.clearTimeout(timeout);
      }
    };
  }

  $effect(() => {
    if (!shouldLoadTypebot) return;
    if (typebotLoadStarted) return;
    typebotLoadStarted = true;
    typebotLoadError = false;
    typebotReady = false;

    let cancelled = false;

    void (async () => {
      try {
        await tick();
        if (cancelled) return;
        const mod = await loadTypebotWebModule();
        if (cancelled) return;
        await tick();
        if (cancelled) return;
        mod.initStandard({
          typebot: TYPEBOT_PUBLIC_ID,
          theme: typebotTheme
        });
        if (cancelled) return;
        typebotReady = true;
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('[typebot] No se pudo cargar el embed', err);
        typebotLoadError = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  });

  function retryTypebot() {
    typebotLoadError = false;
    typebotReady = false;
    typebotLoadStarted = false;
    resetTypebotWebModuleCache();
  }

  function openFormModal() {
    isFormModalOpen = true;
    formStatus = 'idle';
    formError = '';
  }

  function closeFormModal() {
    isFormModalOpen = false;
  }

  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return;
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      }
    };
  }

  $effect(() => {
    if (!isFormModalOpen) return;

    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFormModal();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  });

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
  <ContactFluidOverlay
    color="#4DA3FF"
    accent="#7CB8FF"
    opacity={0.5}
    radius={158}
    blur={16}
    paused={fluidPaused}
  />

  <div
    class="contenido-unificado"
    onfocusin={readingAreaFocusIn}
    onfocusout={readingAreaFocusOut}
  >
    <div
      role="group"
      class="header-final contact-reading-zone"
      onpointerenter={readingZonePointerEnter}
      onpointerleave={readingZonePointerLeave}
    >
      <h3 id="contacto-titulo">{heading}</h3>
      {#if subtitle}
        <p>{subtitle}</p>
      {/if}
    </div>

    <div class="chat-container-final" role="group" use:loadTypebotWhenVisible>
      {#if typebotLoadError}
        <div class="chat-load-error" role="alert">
          <p class="chat-load-error-title">No se ha podido cargar el asistente.</p>
          <p class="chat-load-error-body">Prueba de nuevo o escribe por WhatsApp.</p>
          <button type="button" class="btn-enable-chat" onclick={retryTypebot}>
            Reintentar
          </button>
        </div>
      {:else if shouldLoadTypebot}
        <div class="chat-typebot-host">
          {#if !typebotReady}
            <div class="chat-placeholder" aria-busy="true" aria-label="Cargando asistente">
              <span></span>
              <span></span>
              <span></span>
            </div>
          {/if}
          <typebot-standard
            class="typebot-frame typebot-standard-embed"
            class:typebot-frame-ready={typebotReady}
            style="width: 100%; height: 380px;"
            aria-label={iframeTitle}
            aria-hidden={!typebotReady}
          ></typebot-standard>
        </div>
      {:else}
        <div class="chat-placeholder" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      {/if}
    </div>

    <div class="botones-final">
      <div
        role="group"
        class="contact-reading-zone contact-cta-mobile-intro-wrap"
        onpointerenter={readingZonePointerEnter}
        onpointerleave={readingZonePointerLeave}
      >
        <p class="contact-cta-mobile-intro">{$t('contactCta.mobileIntro')}</p>
      </div>
      <div class="cta-stack">
        <div
          role="group"
          class="contact-reading-zone"
          onpointerenter={readingZonePointerEnter}
          onpointerleave={readingZonePointerLeave}
        >
          <p class="texto-whatsapp-final texto-cta-lead-desktop">{whatsappLead}</p>
        </div>
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
        <div
          role="group"
          class="contact-reading-zone"
          onpointerenter={readingZonePointerEnter}
          onpointerleave={readingZonePointerLeave}
        >
          <p class="texto-whatsapp-final texto-cta-lead-desktop">{formLead}</p>
        </div>
        <button
          type="button"
          class="btn-form-final"
          onclick={openFormModal}
        >
          <span class="btn-cta-label-long">{formButtonLabel}</span>
          <span class="btn-cta-label-short">{$t('contactCta.formShort')}</span>
          <span aria-hidden="true" class="btn-cta-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</section>

{#if isFormModalOpen}
  <div class="modal-shell" use:portal role="presentation" onmousedown={closeFormModal}>
    <div
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      tabindex="-1"
      onmousedown={(event) => event.stopPropagation()}
    >
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
    background: #0b1220;
    border-radius: 20px;
    overflow: clip;
    text-align: center;
    font-family: inherit;
    box-sizing: border-box;
    scroll-margin-top: 96px;
    isolation: isolate;
  }

  .luces-fondo-unificado {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: radial-gradient(circle at 50% 46%, rgba(77, 163, 255, 0.18) 0%, transparent 72%);
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
    color: #e6eef9 !important;
    font-size: 40px !important;
    font-weight: 800 !important;
    margin: 0 0 10px 0 !important;
    letter-spacing: -1px;
  }

  .header-final p {
    color: #c2d2e9 !important;
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

  .chat-typebot-host {
    position: relative;
    width: 100%;
  }

  .chat-typebot-host .chat-placeholder {
    position: absolute;
    inset: 0;
    z-index: 1;
    min-height: 380px;
  }

  .typebot-frame {
    width: 100%;
    height: 380px;
    border: none;
    border-radius: 0;
    box-shadow: none;
    display: block;
    background: transparent;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .typebot-frame-ready {
    opacity: 1;
    pointer-events: auto;
  }

  :global(.typebot-standard-embed) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    --tb-background-color: transparent;
    --chat-container-bg: transparent;
    --typebot-chat-window-bg: transparent;
    --typebot-chat-background: transparent;
    --typebot-container-background: transparent;
  }

  :global(.typebot-standard-embed iframe) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .chat-load-error {
    width: 100%;
    min-height: 280px;
    padding: 28px 20px;
    border-radius: 12px;
    background: rgba(13, 26, 46, 0.62);
    border: 1px solid rgba(77, 163, 255, 0.28);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
  }

  .chat-placeholder {
    width: 100%;
    min-height: 300px;
    border-radius: 12px;
    background:
      linear-gradient(180deg, rgba(77, 163, 255, 0.12), rgba(77, 163, 255, 0.04)),
      rgba(13, 26, 46, 0.34);
    border: 1px solid rgba(77, 163, 255, 0.18);
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 12px;
  }

  .chat-placeholder span {
    display: block;
    height: 10px;
    border-radius: 999px;
    background: rgba(194, 210, 233, 0.22);
  }

  .chat-placeholder span:nth-child(1) {
    width: min(360px, 72%);
  }

  .chat-placeholder span:nth-child(2) {
    width: min(280px, 58%);
  }

  .chat-placeholder span:nth-child(3) {
    width: min(210px, 44%);
  }

  .chat-load-error-title {
    margin: 0 0 10px;
    color: #e6eef9;
    font-size: 17px;
    font-weight: 700;
  }

  .chat-load-error-body {
    margin: 0 0 18px;
    color: #bdd0ea;
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
    background: #4da3ff;
    color: #081120;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .btn-enable-chat:hover {
    background: #69b1ff;
    transform: translateY(-1px);
  }

  .contact-cta-mobile-intro-wrap {
    display: none;
  }

  .contact-cta-mobile-intro {
    margin: 0;
  }

  .btn-cta-label-short {
    display: none;
  }

  .btn-cta-label-long {
    display: inline;
  }

  .texto-whatsapp-final {
    color: #c2d2e9;
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
    background: #4da3ff;
    color: #081120 !important;
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
    background: #69b1ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    color: #081120 !important;
  }

  .btn-form-final {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    color: #e6eef9;
    padding: 14px 30px;
    border-radius: 8px;
    border: 1px solid rgba(77, 163, 255, 0.42);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    max-width: 100%;
  }

  .btn-form-final:hover {
    transform: translateY(-2px);
    background: rgba(77, 163, 255, 0.14);
    border-color: rgba(77, 163, 255, 0.75);
  }

  .btn-enable-chat:focus-visible,
  .btn-whatsapp-final:focus-visible,
  .btn-form-final:focus-visible {
    outline: 2px solid #4da3ff;
    outline-offset: 2px;
  }

  .modal-shell {
    position: fixed;
    inset: 0;
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(4, 7, 13, 0.72);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    box-sizing: border-box;
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
    line-height: 1.5;
  }

  .checkline a {
    color: #111111;
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
    box-shadow: none;
    transform: none;
  }

  :global(html.dark) .seccion-final-unificada {
    background: #050505;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  :global(html.dark) .luces-fondo-unificado {
    background:
      radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.08) 0%, transparent 62%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0));
  }

  :global(html.dark) .seccion-final-unificada h3 {
    color: #f8fafc !important;
  }

  :global(html.dark) .header-final p,
  :global(html.dark) .texto-whatsapp-final {
    color: #d4d4d8 !important;
  }

  :global(html.dark) .typebot-standard-embed {
    --typebot-chat-window-bg: #050505;
    --typebot-chat-background: #050505;
    --typebot-container-background: #050505;
  }

  :global(html.dark) .chat-load-error {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
  }

  :global(html.dark) .chat-placeholder {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.02)),
      rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.1);
  }

  :global(html.dark) .chat-load-error-title {
    color: #f8fafc;
  }

  :global(html.dark) .chat-load-error-body {
    color: #d4d4d8;
  }

  :global(html.dark) .btn-enable-chat,
  :global(html.dark) .btn-whatsapp-final {
    background: #f5f5f5;
    color: #050505 !important;
  }

  :global(html.dark) .btn-enable-chat:hover,
  :global(html.dark) .btn-whatsapp-final:hover {
    background: #ffffff;
    color: #050505 !important;
  }

  :global(html.dark) .btn-form-final {
    color: #f8fafc;
    border-color: rgba(255, 255, 255, 0.18);
  }

  :global(html.dark) .btn-form-final:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.36);
  }

  :global(html.dark) .btn-enable-chat:focus-visible,
  :global(html.dark) .btn-whatsapp-final:focus-visible,
  :global(html.dark) .btn-form-final:focus-visible {
    outline-color: #f5f5f5;
  }

  :global(html.dark) .modal-shell {
    background: rgba(0, 0, 0, 0.76);
  }

  :global(html.dark) .modal-card {
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.58);
    color: #e5e7eb;
  }

  :global(html.dark) .modal-head h4 {
    color: #f8fafc;
  }

  :global(html.dark) .modal-head p,
  :global(html.dark) .checkline span {
    color: #d4d4d8;
  }

  :global(html.dark) .modal-form span {
    color: #f4f4f5;
  }

  :global(html.dark) .modal-form input,
  :global(html.dark) .modal-form textarea {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.14);
    color: #f8fafc;
    outline-color: #f5f5f5;
  }

  :global(html.dark) .modal-form input:focus,
  :global(html.dark) .modal-form textarea:focus {
    border-color: rgba(255, 255, 255, 0.36);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
  }

  :global(html.dark) .checkline a {
    color: #ffffff;
  }

  :global(html.dark) .btn-modal-ghost {
    background: rgba(255, 255, 255, 0.08);
    color: #f4f4f5;
  }

  :global(html.dark) .btn-modal-ghost:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  :global(html.dark) .btn-modal-primary {
    background: #f5f5f5;
    color: #050505;
    border-color: #ffffff;
  }

  :global(html.dark) .btn-modal-primary:hover {
    background: #ffffff;
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

    .chat-typebot-host .chat-placeholder {
      min-height: min(52vh, 360px);
    }

    .chat-load-error {
      min-height: 220px;
      padding: 20px 16px;
    }

    .chat-placeholder {
      min-height: 220px;
    }

    .contact-cta-mobile-intro-wrap {
      display: block;
      grid-column: 1 / -1;
      margin: 0 0 10px;
    }

    .contact-cta-mobile-intro {
      color: #b8c9e2;
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
      display: inline;
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

    .modal-head {
      padding: 18px 16px 4px;
    }

    .modal-head h4 {
      font-size: 22px;
    }

    .modal-form {
      padding: 12px 16px 16px;
    }

    .modal-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      margin-top: 10px;
    }

    .btn-modal-ghost,
    .btn-modal-primary {
      width: 100%;
    }
  }
</style>
