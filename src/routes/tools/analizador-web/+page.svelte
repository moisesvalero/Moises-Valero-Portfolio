<script lang="ts">
  import { resolve } from '$app/paths';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';

  type AnalyzerResult = {
    requestedUrl: string;
    strategy: string;
    performanceScore: number;
    severity: 'slow' | 'needs_improvement' | 'fast';
    cached?: boolean;
    metrics: {
      fcp: string;
      lcp: string;
      imageWeight: string;
      pageWeight: string;
    };
    highlights: string[];
  };

  const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
  const canonical = `${baseUrl}/tools/analizador-web`;
  const pageJsonLd = stringifyJsonLdForHtml({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Analizador web de Moises Valero',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: canonical,
    author: {
      '@type': 'Person',
      name: 'Moises Valero'
    }
  });

  let analyzerUrl = $state('');
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let errorMessage = $state('');
  let result = $state<AnalyzerResult | null>(null);
  let elapsedSeconds = $state(0);

  const scoreLabel = $derived(result ? `${result.performanceScore}/100` : '--');
  const scoreClass = $derived(
    !result ? 'score-neutral' : result.performanceScore >= 90 ? 'score-good' : result.performanceScore >= 60 ? 'score-mid' : 'score-low'
  );
  const scoreTone = $derived(
    !result ? '#94a3b8' : result.performanceScore >= 90 ? '#10b981' : result.performanceScore >= 60 ? '#f59e0b' : '#f43f5e'
  );
  const scoreRingStyle = $derived(`--score:${result ? result.performanceScore : 0};--score-tone:${scoreTone}`);
  const severityText = $derived(
    !result
      ? 'Sin analizar'
      : result.severity === 'fast'
        ? 'Rapida'
        : result.severity === 'needs_improvement'
          ? 'Mejorable'
          : 'Lenta'
  );
  const loadingSteps = [
    'Conectando con PageSpeed',
    'Midiendo Core Web Vitals',
    'Calculando peso de recursos',
    'Preparando diagnostico'
  ];
  const loadingMessages = [
    { after: 0, text: 'Enviando la URL a Google PageSpeed. Esto puede tardar un poco.' },
    { after: 8, text: 'PageSpeed esta abriendo la pagina como un movil real. Seguimos midiendo.' },
    { after: 18, text: 'La API suele tardar mas cuando la web tiene muchos recursos o imagenes pesadas.' },
    { after: 32, text: 'Seguimos esperando la respuesta de Google. No cierres esta ventana.' },
    { after: 50, text: 'Esta prueba va lenta, pero sigue activa. Si termina fuera de tiempo te avisare.' }
  ];
  const activeLoadingMessage = $derived(
    loadingMessages.findLast((message) => elapsedSeconds >= message.after)?.text ?? loadingMessages[0].text
  );
  const loadingProgress = $derived(Math.min(94, Math.round(12 + elapsedSeconds * 1.65)));
  const loadingProgressStyle = $derived(`--loading-progress:${loadingProgress}%`);

  $effect(() => {
    if (status !== 'loading') {
      elapsedSeconds = 0;
      return;
    }

    const startedAt = Date.now();
    elapsedSeconds = 0;
    const timer = window.setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    }, 1000);

    return () => window.clearInterval(timer);
  });

  function normalizeResult(input: Partial<AnalyzerResult>): AnalyzerResult {
    return {
      requestedUrl: input.requestedUrl || analyzerUrl,
      strategy: input.strategy || 'mobile',
      performanceScore: typeof input.performanceScore === 'number' ? input.performanceScore : 0,
      severity: input.severity || 'needs_improvement',
      cached: input.cached === true,
      metrics: {
        fcp: input.metrics?.fcp || 'N/D',
        lcp: input.metrics?.lcp || 'N/D',
        imageWeight: input.metrics?.imageWeight || 'N/D',
        pageWeight: input.metrics?.pageWeight || 'N/D'
      },
      highlights: Array.isArray(input.highlights) ? input.highlights : []
    };
  }

  async function pollAnalyzeJob(
    jobId: string,
    pollEveryMs: number
  ): Promise<{ ok: true; result: Partial<AnalyzerResult> } | { ok: false; error: string }> {
    const startedAt = Date.now();
    const timeoutMs = 120000;
    let intervalMs = Math.max(700, Math.min(5000, pollEveryMs));

    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const response = await fetch(`/api/pagespeed/analyze/${encodeURIComponent(jobId)}`);
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        status?: 'queued' | 'running' | 'completed' | 'error';
        error?: string;
        result?: Partial<AnalyzerResult>;
        pollAfterMs?: number;
      } | null;

      if (!response.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'No se pudo completar el analisis.' };
      }
      if (data.status === 'completed' && data.result) {
        return { ok: true, result: data.result };
      }
      if (data.status === 'error') {
        return { ok: false, error: data.error || 'El analisis termino con error.' };
      }
      intervalMs = Math.max(700, Math.min(5000, data.pollAfterMs ?? intervalMs));
    }

    return { ok: false, error: 'El analisis esta tardando demasiado. Prueba de nuevo en unos minutos.' };
  }

  async function analyzeUrl() {
    if (status === 'loading') return;
    status = 'loading';
    errorMessage = '';
    result = null;

    const response = await fetch('/api/pagespeed/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: analyzerUrl, strategy: 'mobile' })
    });

    const data = (await response.json().catch(() => null)) as
      | ({
          ok?: boolean;
          error?: string;
          status?: 'queued' | 'running' | 'completed' | 'error';
          jobId?: string;
          pollAfterMs?: number;
          result?: Partial<AnalyzerResult>;
        } & Partial<AnalyzerResult>)
      | null;

    if (!response.ok || !data?.ok) {
      status = 'error';
      errorMessage = data?.error || 'No se pudo analizar la URL.';
      return;
    }

    if (data.status === 'queued' && data.jobId) {
      const resolved = await pollAnalyzeJob(data.jobId, data.pollAfterMs ?? 1000);
      if (!resolved.ok) {
        status = 'error';
        errorMessage = resolved.error;
        return;
      }
      result = normalizeResult(resolved.result);
      status = 'success';
      return;
    }

    result = normalizeResult(data.status === 'completed' && data.result ? data.result : data);
    status = 'success';
  }
</script>

<svelte:head>
  <title>Analizador web tecnico | Moises Valero</title>
  <meta
    name="description"
    content="Herramienta propia para revisar rendimiento web con PageSpeed, metricas Core Web Vitals y senales tecnicas utiles para diagnostico frontend."
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Analizador web tecnico | Moises Valero" />
  <meta
    property="og:description"
    content="Una herramienta propia para auditar velocidad, peso y metricas clave de una URL."
  />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${baseUrl}/og-image.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={pageJsonLd} />
</svelte:head>

<main class="tool-page">
  <section class="tool-hero">
    <div class="tool-copy">
      <a class="back-link" href={resolve('/#proyectos')}>Portfolio</a>
      <p class="eyebrow">Herramienta propia</p>
      <h1>Analizador web</h1>
      <p class="lead">
        Una web app para medir rendimiento real, peso de recursos y senales Core Web Vitals con una lectura clara
        para tomar decisiones tecnicas sin perderse en ruido.
      </p>
      <div class="tool-spec" aria-label="Ficha tecnica del analizador">
        <div>
          <span>Fuente</span>
          <strong>PageSpeed API</strong>
        </div>
        <div>
          <span>Estrategia</span>
          <strong>Mobile first</strong>
        </div>
        <div>
          <span>Proceso</span>
          <strong>Jobs asincronos</strong>
        </div>
      </div>
      <div class="measurement-strip" aria-hidden="true">
        <span style="--w:68%"></span>
        <span style="--w:46%"></span>
        <span style="--w:82%"></span>
      </div>
    </div>

    <form class="analyzer-card" onsubmit={(event) => { event.preventDefault(); void analyzeUrl(); }}>
      <div class="card-head">
        <div>
          <p class="card-kicker">Live audit</p>
          <label for="analyzer-url">URL a analizar</label>
        </div>
        <span class="status-pill" class:status-pill--active={status === 'loading'}>
          {status === 'loading' ? 'Midiendo' : status === 'success' ? 'Resultado' : 'Preparado'}
        </span>
      </div>

      <div class="input-row">
        <input
          id="analyzer-url"
          bind:value={analyzerUrl}
          placeholder="https://ejemplo.com"
          autocomplete="url"
          required
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Analizando' : 'Analizar'}
        </button>
      </div>
      <p class="input-help">Puedes escribir un dominio con o sin https://.</p>

      {#if status === 'error'}
        <p class="feedback error">{errorMessage}</p>
      {/if}

      <div class="diagnostic-stage" class:loading={status === 'loading'}>
        <div class={`score-ring ${scoreClass}`} style={scoreRingStyle}>
          <div class="score-core">
            <span>{scoreLabel}</span>
            <small>{severityText}</small>
          </div>
        </div>
        <div class="metrics">
          <div>
            <span>FCP</span>
            <strong>{result?.metrics.fcp || 'N/D'}</strong>
          </div>
          <div>
            <span>LCP</span>
            <strong>{result?.metrics.lcp || 'N/D'}</strong>
          </div>
          <div>
            <span>Peso pagina</span>
            <strong>{result?.metrics.pageWeight || 'N/D'}</strong>
          </div>
          <div>
            <span>Imagenes</span>
            <strong>{result?.metrics.imageWeight || 'N/D'}</strong>
          </div>
        </div>
      </div>

      {#if status === 'loading'}
        <div class="loading-panel" aria-live="polite">
          <div class="loading-panel__head">
            <div>
              <p>Analisis en curso</p>
              <strong>{activeLoadingMessage}</strong>
            </div>
            <span>{elapsedSeconds}s</span>
          </div>
          <div class="loading-bar" style={loadingProgressStyle} aria-hidden="true">
            <span></span>
          </div>
          <div class="loading-steps" aria-label="Progreso del analisis">
            {#each loadingSteps as step, index (step)}
              <span class:step-active={index <= Math.min(3, Math.floor(elapsedSeconds / 10))} style={`--delay:${index * 120}ms`}>{step}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if result?.highlights.length}
        <div class="highlights-panel">
          <p>Lectura rapida</p>
          <ul class="highlights">
            {#each result.highlights as item (item)}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </form>
  </section>

  <section class="notes-section">
    <div>
      <p class="eyebrow">Diagnóstico claro</p>
      <h2>Detecta qué está frenando una web</h2>
    </div>
    <p>
      Reúne las métricas que más importan en una lectura rápida: carga inicial, LCP, peso de página e imágenes.
      Así es más fácil separar lo urgente de lo secundario y decidir el siguiente paso con criterio.
    </p>
  </section>
</main>

<style>
  .tool-page {
    position: relative;
    min-height: 100vh;
    color: var(--text-main);
    background:
      linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px) 0 0 / 72px 72px,
      linear-gradient(180deg, var(--bg-main) 0%, var(--bg-surface) 58%, var(--bg-main) 100%);
    font-family: var(--font-sans);
  }

  .tool-hero {
    position: relative;
    z-index: 1;
    width: min(1180px, calc(100% - 32px));
    min-height: 100svh;
    margin: 0 auto;
    padding: max(7rem, calc(env(safe-area-inset-top, 0px) + 6rem)) 0 4rem;
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(380px, 1fr);
    gap: clamp(2rem, 6vw, 5.5rem);
    align-items: center;
  }

  .back-link {
    display: inline-flex;
    margin-bottom: 1.2rem;
    color: #0071e3;
    font-weight: 800;
    text-decoration: none;
  }

  .eyebrow,
  .card-kicker {
    margin: 0 0 0.85rem;
    color: #0071e3;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h1,
  h2 {
    margin: 0;
    color: var(--text-main);
    letter-spacing: 0;
  }

  h1 {
    max-width: 12ch;
    font-size: clamp(2.75rem, 7vw, 5.6rem);
    line-height: 0.94;
  }

  h2 {
    font-size: clamp(1.7rem, 3vw, 2.35rem);
    line-height: 1.08;
  }

  .lead {
    max-width: 58ch;
    margin: 1.25rem 0 0;
    color: var(--text-secondary);
    font-size: clamp(1.02rem, 2vw, 1.18rem);
    line-height: 1.72;
  }

  .tool-spec {
    width: min(100%, 560px);
    margin-top: 1.8rem;
    border-top: 1px solid rgba(15, 23, 42, 0.16);
    border-bottom: 1px solid rgba(15, 23, 42, 0.16);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tool-spec div {
    padding: 0.92rem 1rem 0.92rem 0;
    border-right: 1px solid rgba(15, 23, 42, 0.12);
  }

  .tool-spec div:last-child {
    border-right: 0;
    padding-left: 1rem;
  }

  .tool-spec div:nth-child(2) {
    padding-left: 1rem;
  }

  .tool-spec span {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .tool-spec strong {
    display: block;
    color: var(--text-main);
    font-size: 0.94rem;
  }

  .measurement-strip {
    width: min(100%, 460px);
    margin-top: 1.3rem;
    display: grid;
    gap: 0.42rem;
  }

  .measurement-strip span {
    width: var(--w);
    height: 3px;
    background: #111318;
    opacity: 0.82;
  }

  .measurement-strip span:nth-child(2) {
    opacity: 0.42;
  }

  .measurement-strip span:nth-child(3) {
    opacity: 0.18;
  }

  .analyzer-card {
    position: relative;
    padding: clamp(1.1rem, 3vw, 1.8rem);
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow:
      0 22px 60px rgba(15, 23, 42, 0.1),
      0 1px 0 rgba(255, 255, 255, 0.8) inset;
    backdrop-filter: blur(14px);
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: start;
    margin-bottom: 1rem;
  }

  .card-kicker {
    margin-bottom: 0.35rem;
    font-size: 0.68rem;
  }

  .analyzer-card label {
    display: block;
    color: var(--text-main);
    font-size: clamp(1.35rem, 2vw, 1.7rem);
    font-weight: 900;
    line-height: 1.05;
  }

  .status-pill {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.48rem 0.66rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    color: #475569;
    background: rgba(248, 250, 252, 0.8);
    font-size: 0.78rem;
    font-weight: 800;
  }

  .status-pill::before {
    content: "";
    width: 0.48rem;
    height: 0.48rem;
    border-radius: 999px;
    background: #94a3b8;
  }

  .status-pill--active::before {
    background: #0071e3;
    box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.32);
    animation: statusPulse 1.2s ease-out infinite;
  }

  .input-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.65rem;
  }

  input {
    width: 100%;
    min-height: 52px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 0 1rem;
    color: #0f172a;
    background: #ffffff;
    font: inherit;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
  }

  input:focus {
    outline: 3px solid rgba(0, 113, 227, 0.16);
    border-color: #0071e3;
  }

  button {
    min-height: 52px;
    border: 0;
    border-radius: 8px;
    padding: 0 1.2rem;
    color: #ffffff;
    background: #0066e5;
    font: inherit;
    font-weight: 850;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(0, 102, 229, 0.24);
    transition: transform 0.24s ease, box-shadow 0.24s ease, background-color 0.24s ease;
  }

  button:hover,
  button:focus-visible {
    transform: translateY(-2px);
    background: #0052b8;
    box-shadow: 0 18px 38px rgba(0, 102, 229, 0.32);
  }

  button:disabled {
    opacity: 0.7;
    cursor: wait;
    transform: none;
  }

  .input-help,
  .feedback {
    margin: 0.65rem 0 0;
    color: var(--text-secondary);
    font-size: 0.92rem;
  }

  .feedback.error {
    color: #b42318;
    font-weight: 800;
  }

  .diagnostic-stage {
    margin-top: 1.35rem;
    display: grid;
    grid-template-columns: 168px minmax(0, 1fr);
    gap: 1rem;
    align-items: stretch;
  }

  .diagnostic-stage.loading {
    opacity: 0.82;
  }

  .score-ring {
    --score: 0;
    --score-tone: #94a3b8;
    min-height: 168px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at center, rgba(255, 255, 255, 0.98) 0 55%, transparent 56%),
      conic-gradient(var(--score-tone) calc(var(--score) * 1%), rgba(148, 163, 184, 0.22) 0);
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  }

  .score-core {
    width: 112px;
    height: 112px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 0.1rem;
    background: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.08);
  }

  .score-core span {
    color: #0f172a;
    font-size: 1.9rem;
    font-weight: 950;
    line-height: 1;
  }

  .score-core small {
    color: #475569;
    font-weight: 850;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .metrics div {
    min-height: 78px;
    padding: 0.85rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9));
  }

  .metrics span {
    display: block;
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .metrics strong {
    display: block;
    margin-top: 0.42rem;
    color: #0f172a;
    font-size: 1.12rem;
  }

  .loading-panel {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(0, 113, 227, 0.14);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(0, 113, 227, 0.06), rgba(255, 255, 255, 0.84));
  }

  .loading-panel__head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
  }

  .loading-panel__head p {
    margin: 0 0 0.2rem;
    color: #0066e5;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .loading-panel__head strong {
    display: block;
    color: #0f172a;
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .loading-panel__head span {
    flex: 0 0 auto;
    color: #475569;
    font-size: 0.82rem;
    font-weight: 900;
  }

  .loading-bar {
    position: relative;
    height: 8px;
    margin-top: 0.9rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.22);
  }

  .loading-bar span {
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--loading-progress);
    min-width: 18%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0066e5, #11a37f);
    transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .loading-bar span::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    animation: loadingSweep 1.4s ease-in-out infinite;
  }

  .loading-steps {
    margin-top: 0.9rem;
    display: grid;
    gap: 0.45rem;
  }

  .loading-steps span {
    position: relative;
    padding-left: 1.25rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    animation: stepGlow 1.2s ease-in-out infinite alternate;
    animation-delay: var(--delay);
  }

  .loading-steps span.step-active {
    color: #0f172a;
    font-weight: 800;
  }

  .loading-steps span::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 999px;
    background: #0071e3;
  }

  .highlights-panel {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(0, 113, 227, 0.14);
    border-radius: 8px;
    background: rgba(0, 113, 227, 0.055);
  }

  .highlights-panel p {
    margin: 0 0 0.55rem;
    color: #0052b8;
    font-weight: 900;
  }

  .highlights {
    margin: 0;
    padding-left: 1.2rem;
    color: #334155;
    line-height: 1.62;
  }

  .notes-section {
    position: relative;
    z-index: 1;
    width: min(980px, calc(100% - 32px));
    margin: 0 auto 4rem;
    padding: clamp(1.2rem, 3vw, 2rem);
    display: grid;
    grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1fr);
    gap: 2rem;
    border-top: 1px solid rgba(15, 23, 42, 0.12);
  }

  .notes-section p:last-child {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.78;
  }

  @keyframes statusPulse {
    to {
      box-shadow: 0 0 0 8px rgba(0, 113, 227, 0);
    }
  }

  @keyframes stepGlow {
    from {
      opacity: 0.52;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes loadingSweep {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  :global(html.dark) .tool-page {
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px) 0 0 / 72px 72px,
      linear-gradient(180deg, #0a0a0a 0%, #0b0b0b 52%, #0a0a0a 100%);
  }

  :global(html.dark) .tool-spec {
    border-color: rgba(255, 255, 255, 0.16);
  }

  :global(html.dark) .tool-spec div {
    border-color: rgba(255, 255, 255, 0.12);
  }

  :global(html.dark) .measurement-strip span {
    background: #f8fafc;
  }

  :global(html.dark) .analyzer-card,
  :global(html.dark) .metrics div,
  :global(html.dark) .score-core,
  :global(html.dark) .highlights-panel,
  :global(html.dark) .loading-panel {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.86);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) input {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(10, 10, 10, 0.72);
    color: #f8fafc;
  }

  :global(html.dark) .status-pill {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: #d4d4d8;
  }

  :global(html.dark) .score-ring {
    background:
      radial-gradient(circle at center, rgba(18, 18, 18, 0.98) 0 55%, transparent 56%),
      conic-gradient(var(--score-tone) calc(var(--score) * 1%), rgba(255, 255, 255, 0.12) 0);
  }

  :global(html.dark) .score-core span,
  :global(html.dark) .metrics strong {
    color: #f8fafc;
  }

  :global(html.dark) .score-core small,
  :global(html.dark) .metrics span,
  :global(html.dark) .highlights,
  :global(html.dark) .loading-panel__head span {
    color: #d4d4d8;
  }

  :global(html.dark) .loading-panel__head strong,
  :global(html.dark) .loading-steps span.step-active {
    color: #f8fafc;
  }

  :global(html.dark) .notes-section {
    border-top-color: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 940px) {
    .tool-hero,
    .notes-section {
      grid-template-columns: 1fr;
    }

    h1 {
      max-width: 11ch;
    }
  }

  @media (max-width: 600px) {
    .tool-hero {
      width: min(100% - 24px, 1180px);
      padding-top: max(6.5rem, calc(env(safe-area-inset-top, 0px) + 5.5rem));
    }

    .input-row,
    .diagnostic-stage,
    .metrics {
      grid-template-columns: 1fr;
    }

    .card-head {
      flex-direction: column;
    }

    .score-ring {
      min-height: 148px;
    }
  }
</style>
