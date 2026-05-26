<script lang="ts">
  import PortfolioAssistantChat from '$lib/components/portfolio/PortfolioAssistantChat.svelte';
</script>

<svelte:head>
  <title>Asistente IA | Moises Valero</title>
  <meta
    name="description"
    content="Asistente IA de Moises Valero: una demo conversacional para explorar perfil tecnico, stack, proyectos y trayectoria."
  />
</svelte:head>

<main class="assistant-page">
  <section class="assistant-hero" aria-labelledby="assistant-title">
    <div class="assistant-copy">
      <p class="assistant-kicker">Asistente conversacional</p>
      <h1 id="assistant-title">Asistente IA</h1>
      <p>
        Un espacio para explorar mi perfil profesional, proyectos y trayectoria a traves de una
        experiencia conversacional directa.
      </p>
    </div>
    <div class="assistant-proof" aria-label="Resumen tecnico">
      <span>SvelteKit</span>
      <span>Typebot</span>
      <span>IA aplicada</span>
    </div>
  </section>

  <section class="assistant-chat-shell" aria-label="Chat con el asistente IA">
    <PortfolioAssistantChat />
  </section>
</main>

<style>
  .assistant-page {
    width: 100%;
    margin: 0 auto;
    padding: 150px 0 80px;
    background:
      radial-gradient(circle at 50% 0%, rgba(0, 113, 227, 0.1), transparent 32rem),
      linear-gradient(180deg, rgba(232, 240, 249, 0.96), rgba(242, 246, 251, 0.9) 38%, var(--bg-main) 100%),
      #e9f0f8;
  }

  .assistant-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 28px;
    align-items: end;
    width: min(1180px, calc(100% - 36px));
    margin: 0 auto 34px;
  }

  .assistant-copy {
    max-width: 760px;
  }

  .assistant-kicker {
    margin: 0 0 14px;
    color: #0071e3;
    font-size: 0.78rem;
    font-weight: 850;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: #111827;
    font-size: clamp(3rem, 7vw, 7.4rem);
    font-weight: 900;
    line-height: 0.88;
    letter-spacing: -0.058em;
  }

  .assistant-copy p:last-child {
    max-width: 650px;
    margin: 24px 0 0;
    color: #475569;
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    line-height: 1.7;
  }

  .assistant-proof {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    max-width: 320px;
  }

  .assistant-proof span {
    padding: 9px 12px;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.68);
    color: #334155;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    font-weight: 800;
  }

  .assistant-chat-shell {
    width: min(1180px, calc(100% - 36px));
    margin: 0 auto;
    overflow: hidden;
    border-radius: 8px;
    background: #081120;
    box-shadow: 0 30px 90px rgba(15, 23, 42, 0.16);
  }

  :global(html.dark) h1 {
    color: #f8fafc;
  }

  :global(html.dark) .assistant-copy p:last-child {
    color: #d4d4d8;
  }

  :global(html.dark) .assistant-kicker {
    color: #4da3ff;
  }

  :global(html.dark) .assistant-proof span {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: #e5e7eb;
  }

  :global(html.dark) .assistant-chat-shell {
    background: #050505;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.48);
  }

  :global(html.dark) .assistant-page {
    background:
      radial-gradient(circle at 50% 0%, rgba(77, 163, 255, 0.14), transparent 32rem),
      linear-gradient(180deg, rgba(12, 18, 30, 0.98), rgba(7, 12, 21, 0.94) 38%, #0a0a0a 100%),
      #0c1220;
  }

  @media (max-width: 760px) {
    .assistant-page {
      padding-top: 118px;
    }

    .assistant-hero,
    .assistant-chat-shell {
      width: min(100% - 28px, 1180px);
    }

    .assistant-hero {
      grid-template-columns: 1fr;
    }

    .assistant-proof {
      justify-content: flex-start;
    }
  }
</style>
