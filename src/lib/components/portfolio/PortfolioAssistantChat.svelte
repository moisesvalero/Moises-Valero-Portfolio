<script lang="ts">
  import { loadTypebotWebModule, resetTypebotWebModuleCache } from '$lib/load-typebot';

  interface Props {
    iframeTitle?: string;
    compact?: boolean;
  }

  let {
    iframeTitle = 'Asistente IA de Moises Valero',
    compact = false
  }: Props = $props();

  const TYPEBOT_PUBLIC_ID = 'asistente-mois-s-valero-sud5oya';
  const typebotTheme = {
    chatWindow: {
      backgroundColor: 'transparent'
    }
  };

  let typebotStandardStarted = false;
  let typebotLoadError = $state(false);

  $effect(() => {
    if (typebotStandardStarted) return;
    typebotStandardStarted = true;
    typebotLoadError = false;

    let cancelled = false;

    void loadTypebotWebModule()
      .then((Typebot) => {
        if (cancelled) return;
        Typebot.initStandard({
          typebot: TYPEBOT_PUBLIC_ID,
          theme: typebotTheme
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('[typebot] No se pudo cargar el embed', err);
        typebotLoadError = true;
      });

    return () => {
      cancelled = true;
    };
  });

  function retryTypebot() {
    typebotLoadError = false;
    typebotStandardStarted = false;
    resetTypebotWebModuleCache();
  }
</script>

<div class="assistant-chat" class:is-compact={compact}>
  {#if typebotLoadError}
    <div class="chat-load-error" role="alert">
      <p class="chat-load-error-title">No se ha podido cargar el asistente.</p>
      <p class="chat-load-error-body">Prueba de nuevo o usa el contacto directo.</p>
      <button type="button" class="btn-enable-chat" onclick={retryTypebot}>Reintentar</button>
    </div>
  {:else}
    <typebot-standard
      class="typebot-frame typebot-standard-embed"
      style={`width: 100%; height: ${compact ? '420px' : '620px'};`}
      aria-label={iframeTitle}
    ></typebot-standard>
  {/if}
</div>

<style>
  .assistant-chat {
    width: 100%;
    min-height: 620px;
  }

  .assistant-chat.is-compact {
    min-height: 420px;
  }

  .typebot-frame {
    width: 100%;
    border: none;
    border-radius: 0;
    box-shadow: none;
    display: block;
    background: transparent;
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
    min-height: 360px;
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
    font-weight: 700;
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

  :global(html.dark) .typebot-standard-embed {
    --typebot-chat-window-bg: #050505;
    --typebot-chat-background: #050505;
    --typebot-container-background: #050505;
  }

  @media (max-width: 768px) {
    .assistant-chat,
    .assistant-chat.is-compact {
      min-height: 500px;
    }

    .typebot-frame {
      height: 500px !important;
    }
  }
</style>
