<script lang="ts">
  import { resolve } from '$app/paths';
  import { env } from '$env/dynamic/public';
  import JsonLdScript from '$lib/components/JsonLdScript.svelte';
  import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';

  type AnalyzerResult = {
    requestedUrl: string;
    finalUrl?: string;
    strategy: string;
    performanceScore: number;
    overallScore: number;
    deliveryVerdict: 'block' | 'review' | 'ready';
    severity: 'slow' | 'needs_improvement' | 'fast';
    categoryScores: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
      security: number;
      quality: number;
    };
    cached?: boolean;
    metrics: {
      fcp: string;
      lcp: string;
      cls: string;
      tbt: string;
      imageWeight: string;
      pageWeight: string;
    };
    categories: Array<{
      id: 'performance' | 'security' | 'seo' | 'accessibility' | 'quality';
      label: string;
      score: number;
      issues: AuditIssue[];
    }>;
    issues: AuditIssue[];
    passedChecks: string[];
    signals: {
      isHttps: boolean;
      redirectsToHttps: boolean;
      hasRobotsTxt: boolean;
      hasSitemap: boolean;
      isWordPress: boolean;
      externalScripts: number;
      internalLinks: number;
      imagesWithoutAlt: number;
    };
    highlights: string[];
  };

  type AuditIssue = {
    id: string;
    category: string;
    severity: 'critical' | 'warning' | 'info' | 'pass';
    title: string;
    why: string;
    fix: string;
    evidence?: string;
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
  const overallLabel = $derived(result ? `${result.overallScore}/100` : '--');
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
  const verdictText = $derived(
    !result
      ? 'Sin analizar'
      : result.deliveryVerdict === 'block'
        ? 'Critico'
        : result.deliveryVerdict === 'review'
          ? 'Mejorar'
          : 'Correcto'
  );
  const verdictClass = $derived(
    !result
      ? 'verdict-neutral'
      : result.deliveryVerdict === 'block'
        ? 'verdict-block'
        : result.deliveryVerdict === 'review'
          ? 'verdict-review'
          : 'verdict-ready'
  );
  const priorityIssues = $derived(
    result?.issues.filter((item) => item.severity === 'critical' || item.severity === 'warning').slice(0, 8) ?? []
  );
  const totalIssues = $derived(result?.issues.length ?? 0);
  const criticalIssues = $derived(result?.issues.filter((item) => item.severity === 'critical').length ?? 0);
  const warningIssues = $derived(result?.issues.filter((item) => item.severity === 'warning').length ?? 0);
  const infoIssues = $derived(result?.issues.filter((item) => item.severity === 'info').length ?? 0);
  const loadingSteps = [
    'Iniciando analisis',
    'Midiendo PageSpeed',
    'Revisando seguridad y SEO',
    'Preparando informe tecnico'
  ];
  const loadingMessages = [
    { after: 0, text: 'Estamos revisando la URL con pruebas de rendimiento, SEO y seguridad visible.' },
    { after: 8, text: 'Google PageSpeed esta midiendo rendimiento, SEO, accesibilidad y buenas practicas.' },
    { after: 18, text: 'Ahora se revisan cabeceras, HTTPS, sitemap, robots, HTML y senales visibles.' },
    { after: 32, text: 'El analisis puede tardar si la web pesa mucho, redirige varias veces o responde lento.' },
    { after: 50, text: 'Seguimos trabajando. Si algun check no puede completarse, el informe lo marcara claro.' }
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
      overallScore: typeof input.overallScore === 'number' ? input.overallScore : typeof input.performanceScore === 'number' ? input.performanceScore : 0,
      deliveryVerdict: input.deliveryVerdict || 'review',
      severity: input.severity || 'needs_improvement',
      categoryScores: {
        performance: input.categoryScores?.performance ?? input.performanceScore ?? 0,
        accessibility: input.categoryScores?.accessibility ?? 0,
        bestPractices: input.categoryScores?.bestPractices ?? 0,
        seo: input.categoryScores?.seo ?? 0,
        security: input.categoryScores?.security ?? 0,
        quality: input.categoryScores?.quality ?? 0
      },
      cached: input.cached === true,
      metrics: {
        fcp: input.metrics?.fcp || 'N/D',
        lcp: input.metrics?.lcp || 'N/D',
        cls: input.metrics?.cls || 'N/D',
        tbt: input.metrics?.tbt || 'N/D',
        imageWeight: input.metrics?.imageWeight || 'N/D',
        pageWeight: input.metrics?.pageWeight || 'N/D'
      },
      categories: Array.isArray(input.categories) ? input.categories : [],
      issues: Array.isArray(input.issues) ? input.issues : [],
      passedChecks: Array.isArray(input.passedChecks) ? input.passedChecks : [],
      signals: input.signals || {
        isHttps: false,
        redirectsToHttps: false,
        hasRobotsTxt: false,
        hasSitemap: false,
        isWordPress: false,
        externalScripts: 0,
        internalLinks: 0,
        imagesWithoutAlt: 0
      },
      highlights: Array.isArray(input.highlights) ? input.highlights : []
    };
  }

  function severityLabel(severity: AuditIssue['severity']) {
    if (severity === 'critical') return 'Critico';
    if (severity === 'warning') return 'Revisar';
    if (severity === 'info') return 'Aviso';
    return 'Correcto';
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
    content="Herramienta propia para analizar rendimiento, seguridad visible, SEO tecnico, accesibilidad y senales sospechosas de una URL."
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Analizador web tecnico | Moises Valero" />
  <meta
    property="og:description"
    content="Analisis completo para encontrar fallos de rendimiento, cabeceras, SEO, accesibilidad y codigo sospechoso antes de publicar una web."
  />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${baseUrl}/og-image.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={pageJsonLd} />
</svelte:head>

<main class="tool-page">
  <section class="tool-hero">
    <a class="back-link" href={resolve('/#proyectos')}>Portfolio</a>
    <p class="eyebrow">Herramienta propia</p>
    <h1>Analizador web</h1>
    <p class="lead">
      Analiza una URL en una sola pasada: rendimiento, seguridad visible, SEO tecnico, accesibilidad,
      cabeceras HTTP, WordPress y senales sospechosas. Pensado para revisar tus trabajos antes de publicarlos.
    </p>
    <div class="tool-spec" aria-label="Ficha tecnica del analizador">
      <div>
        <span>Motor</span>
        <strong>PageSpeed + checks propios</strong>
      </div>
      <div>
        <span>Revisa</span>
        <strong>SEO, headers y seguridad</strong>
      </div>
      <div>
        <span>Salida</span>
        <strong>Fallos y mejoras</strong>
      </div>
    </div>
  </section>

  <section class="analyzer-section" aria-label="Analizador web">
    <form class="analyzer-card" onsubmit={(event) => { event.preventDefault(); void analyzeUrl(); }}>
      <div class="card-head">
        <div>
          <p class="card-kicker">Analisis tecnico</p>
          <label for="analyzer-url">Introduce la URL</label>
        </div>
        <span class="status-pill" class:status-pill--active={status === 'loading'}>
          {status === 'loading' ? 'Analizando' : status === 'success' ? 'Informe listo' : 'Preparado'}
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
      <p class="input-help">URLs publicas http/https. Se bloquean localhost, IPs privadas y destinos internos.</p>

      {#if status === 'error'}
        <p class="feedback error">{errorMessage}</p>
      {/if}

      {#if status === 'idle' || status === 'error'}
        <div class="preflight-panel">
          <p>El informe revisara</p>
          <div>
            <span>PageSpeed</span>
            <span>Cabeceras HTTP</span>
            <span>HTTPS</span>
            <span>SEO tecnico</span>
            <span>Accesibilidad</span>
            <span>WordPress</span>
            <span>Scripts sospechosos</span>
            <span>Recursos visibles</span>
          </div>
        </div>
      {/if}

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
    </form>
  </section>

  {#if result}
    <section class="report-section" aria-label="Informe del analizador web">
      <div class="report-summary">
        <div class={`delivery-verdict ${verdictClass}`}>
          <div>
            <span>Estado general</span>
            <strong>{verdictText}</strong>
          </div>
          <p>{overallLabel}</p>
        </div>

        <div class="category-grid" aria-label="Puntuaciones por categoria">
          {#each result.categories as category (category.id)}
            <div>
              <span>{category.label}</span>
              <strong>{category.score}/100</strong>
            </div>
          {/each}
        </div>

        <div class="metrics">
          <div>
            <span>FCP</span>
            <strong>{result.metrics.fcp}</strong>
          </div>
          <div>
            <span>LCP</span>
            <strong>{result.metrics.lcp}</strong>
          </div>
          <div>
            <span>CLS</span>
            <strong>{result.metrics.cls}</strong>
          </div>
          <div>
            <span>TBT</span>
            <strong>{result.metrics.tbt}</strong>
          </div>
          <div>
            <span>Peso pagina</span>
            <strong>{result.metrics.pageWeight}</strong>
          </div>
          <div>
            <span>Imagenes</span>
            <strong>{result.metrics.imageWeight}</strong>
          </div>
        </div>

        <div class="signals-strip" aria-label="Senales tecnicas detectadas">
          <span class:signal-ok={result.signals.isHttps}>HTTPS</span>
          <span class:signal-ok={result.signals.hasRobotsTxt}>robots.txt</span>
          <span class:signal-ok={result.signals.hasSitemap}>sitemap.xml</span>
          <span class:signal-warn={result.signals.isWordPress}>WordPress</span>
          <span>{result.signals.externalScripts} scripts externos</span>
        </div>
      </div>

      <div class="full-report">
          <div class="report-head">
            <div>
              <p class="card-kicker">Informe completo</p>
              <h2>Revision tecnica de la URL</h2>
            </div>
            <div class="report-counters" aria-label="Resumen de fallos">
              <span>{criticalIssues} criticos</span>
              <span>{warningIssues} a revisar</span>
              <span>{infoIssues} avisos</span>
            </div>
          </div>

          <div class="source-grid" aria-label="Tipos de analisis incluidos">
            <div>
              <span>PageSpeed</span>
              <strong>Rendimiento, SEO y accesibilidad</strong>
            </div>
            <div>
              <span>MDN Observatory / SecurityHeaders</span>
              <strong>Cabeceras, HTTPS, CSP, HSTS y cookies</strong>
            </div>
            <div>
              <span>Sucuri-style visible scan</span>
              <strong>WordPress, iframes, scripts y senales sospechosas</strong>
            </div>
          </div>

          {#if totalIssues > 0}
            <div class="category-report">
              {#each result.categories as category (category.id)}
                <section class="category-report__section">
                  <header>
                    <div>
                      <span>{category.label}</span>
                      <strong>{category.score}/100</strong>
                    </div>
                    <p>{category.issues.length} hallazgos</p>
                  </header>

                  {#if category.issues.length}
                    <ul class="detailed-issue-list">
                      {#each category.issues as item (item.id)}
                        <li class={`detail-${item.severity}`}>
                          <div class="detail-title">
                            <strong>{item.title}</strong>
                            <span>{severityLabel(item.severity)}</span>
                          </div>
                          <p>{item.why}</p>
                          <div class="fix-box">
                            <span>Como arreglarlo</span>
                            <p>{item.fix}</p>
                          </div>
                          {#if item.evidence}
                            <small>Evidencia: {item.evidence}</small>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  {:else}
                    <p class="category-ok">Sin fallos detectados en esta categoria.</p>
                  {/if}
                </section>
              {/each}
            </div>
          {:else}
            <p class="category-ok">No se han detectado fallos en los checks automaticos.</p>
          {/if}

          {#if result.passedChecks.length}
            <div class="passed-panel">
              <p>Checks correctos</p>
              <ul>
                {#each result.passedChecks as check (check)}
                  <li>{check}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

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
    </section>
  {/if}

  <section class="notes-section">
    <div>
      <p class="eyebrow">Analisis completo</p>
      <h2>Todo lo importante en una sola revision</h2>
    </div>
    <p>
      Reune en un unico informe lo que normalmente mirarias en PageSpeed, MDN Observatory, SecurityHeaders y
      escaneres tipo Sucuri: velocidad, cabeceras, HTTPS, SEO, accesibilidad, WordPress y recursos sospechosos.
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
    width: min(1040px, calc(100% - 32px));
    margin: 0 auto;
    padding: max(7rem, calc(env(safe-area-inset-top, 0px) + 6rem)) 0 2.2rem;
    text-align: center;
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
    margin: 0 auto;
    font-size: clamp(2.75rem, 7vw, 5.6rem);
    line-height: 0.94;
  }

  h2 {
    font-size: clamp(1.7rem, 3vw, 2.35rem);
    line-height: 1.08;
  }

  .lead {
    max-width: 68ch;
    margin: 1.25rem auto 0;
    color: var(--text-secondary);
    font-size: clamp(1.02rem, 2vw, 1.18rem);
    line-height: 1.72;
  }

  .tool-spec {
    width: min(100%, 720px);
    margin: 1.8rem auto 0;
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

  .analyzer-section {
    position: relative;
    z-index: 1;
    width: min(820px, calc(100% - 32px));
    margin: 0 auto;
    padding-bottom: 3rem;
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

  .preflight-panel {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: rgba(248, 250, 252, 0.84);
  }

  .preflight-panel p {
    margin: 0 0 0.7rem;
    color: #0f172a;
    font-weight: 900;
  }

  .preflight-panel div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .preflight-panel span {
    padding: 0.42rem 0.58rem;
    border: 1px solid rgba(0, 113, 227, 0.14);
    border-radius: 8px;
    color: #0052b8;
    background: rgba(0, 113, 227, 0.06);
    font-size: 0.78rem;
    font-weight: 850;
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

  .delivery-verdict {
    padding: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #f8fafc;
  }

  .delivery-verdict span,
  .category-grid span {
    display: block;
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .delivery-verdict strong {
    display: block;
    margin-top: 0.2rem;
    color: #0f172a;
    font-size: 1.45rem;
    line-height: 1;
  }

  .delivery-verdict p {
    margin: 0;
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 950;
  }

  .verdict-block {
    border-color: rgba(244, 63, 94, 0.26);
    background: rgba(244, 63, 94, 0.08);
  }

  .verdict-review {
    border-color: rgba(245, 158, 11, 0.28);
    background: rgba(245, 158, 11, 0.1);
  }

  .verdict-ready {
    border-color: rgba(16, 185, 129, 0.24);
    background: rgba(16, 185, 129, 0.1);
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.55rem;
  }

  .category-grid div {
    min-height: 76px;
    padding: 0.75rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 8px;
    background: rgba(248, 250, 252, 0.9);
  }

  .category-grid strong {
    display: block;
    margin-top: 0.38rem;
    color: #0f172a;
    font-size: 1.05rem;
  }

  .signals-strip {
    margin-top: 0.8rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .signals-strip span {
    padding: 0.38rem 0.55rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    color: #475569;
    background: #f8fafc;
    font-size: 0.78rem;
    font-weight: 850;
  }

  .signals-strip .signal-ok {
    border-color: rgba(16, 185, 129, 0.24);
    color: #047857;
    background: rgba(16, 185, 129, 0.1);
  }

  .signals-strip .signal-warn {
    border-color: rgba(245, 158, 11, 0.28);
    color: #92400e;
    background: rgba(245, 158, 11, 0.1);
  }

  .report-section {
    position: relative;
    z-index: 1;
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto 3.2rem;
  }

  .report-summary {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.35fr);
    gap: 0.85rem;
    align-items: stretch;
    margin-bottom: 1rem;
  }

  .report-summary .metrics {
    grid-column: 1 / -1;
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .report-summary .signals-strip {
    grid-column: 1 / -1;
  }

  .full-report {
    padding: 1rem;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
  }

  .report-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.1);
  }

  .report-head h2 {
    margin: 0;
    color: #0f172a;
    font-size: clamp(1.25rem, 2vw, 1.65rem);
    line-height: 1.12;
  }

  .report-counters {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.4rem;
  }

  .report-counters span {
    padding: 0.38rem 0.52rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: #f8fafc;
    color: #334155;
    font-size: 0.76rem;
    font-weight: 850;
  }

  .source-grid {
    margin-top: 0.9rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
  }

  .source-grid div {
    min-height: 86px;
    padding: 0.78rem;
    border: 1px solid rgba(0, 113, 227, 0.12);
    border-radius: 8px;
    background: rgba(0, 113, 227, 0.045);
  }

  .source-grid span,
  .category-report__section header span,
  .fix-box span {
    display: block;
    color: #0066e5;
    font-size: 0.68rem;
    font-weight: 950;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .source-grid strong {
    display: block;
    margin-top: 0.35rem;
    color: #0f172a;
    font-size: 0.88rem;
    line-height: 1.35;
  }

  .category-report {
    margin-top: 1rem;
    display: grid;
    gap: 0.85rem;
  }

  .category-report__section {
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
  }

  .category-report__section header {
    padding: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .category-report__section header strong {
    display: block;
    margin-top: 0.25rem;
    color: #0f172a;
    font-size: 1.15rem;
  }

  .category-report__section header p {
    margin: 0;
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 850;
  }

  .detailed-issue-list {
    margin: 0;
    padding: 0.85rem;
    display: grid;
    gap: 0.75rem;
    list-style: none;
  }

  .detailed-issue-list li {
    padding: 0.85rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-left: 4px solid #94a3b8;
    border-radius: 8px;
    background: #ffffff;
  }

  .detailed-issue-list li.detail-critical {
    border-left-color: #f43f5e;
    background: rgba(244, 63, 94, 0.055);
  }

  .detailed-issue-list li.detail-warning {
    border-left-color: #f59e0b;
    background: rgba(245, 158, 11, 0.06);
  }

  .detailed-issue-list li.detail-info {
    border-left-color: #0071e3;
    background: rgba(0, 113, 227, 0.045);
  }

  .detail-title {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .detail-title strong {
    color: #0f172a;
    line-height: 1.3;
  }

  .detail-title span {
    flex: 0 0 auto;
    padding: 0.28rem 0.45rem;
    border-radius: 8px;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.86);
    font-size: 0.7rem;
    font-weight: 950;
    text-transform: uppercase;
  }

  .detailed-issue-list p,
  .fix-box p {
    margin: 0;
    color: #475569;
    line-height: 1.5;
  }

  .detailed-issue-list > li > p {
    margin-top: 0.45rem;
  }

  .fix-box {
    margin-top: 0.65rem;
    padding: 0.65rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
  }

  .fix-box p {
    margin-top: 0.25rem;
    color: #1e293b;
    font-weight: 750;
  }

  .detailed-issue-list small {
    display: block;
    margin-top: 0.55rem;
    color: #64748b;
    word-break: break-word;
  }

  .category-ok {
    margin: 0;
    padding: 0.9rem;
    color: #047857;
    background: rgba(16, 185, 129, 0.08);
    font-weight: 850;
  }

  .passed-panel {
    margin-top: 1rem;
    padding: 0.85rem;
    border: 1px solid rgba(16, 185, 129, 0.18);
    border-radius: 8px;
    background: rgba(16, 185, 129, 0.08);
  }

  .passed-panel p {
    margin: 0 0 0.55rem;
    color: #047857;
    font-weight: 950;
  }

  .passed-panel ul {
    margin: 0;
    padding-left: 1.1rem;
    color: #334155;
    line-height: 1.55;
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
  :global(html.dark) .loading-panel,
  :global(html.dark) .preflight-panel,
  :global(html.dark) .preflight-panel span,
  :global(html.dark) .delivery-verdict,
  :global(html.dark) .category-grid div,
  :global(html.dark) .signals-strip span,
  :global(html.dark) .full-report,
  :global(html.dark) .source-grid div,
  :global(html.dark) .category-report__section,
  :global(html.dark) .category-report__section header,
  :global(html.dark) .detailed-issue-list li,
  :global(html.dark) .fix-box,
  :global(html.dark) .passed-panel,
  :global(html.dark) .report-counters span {
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
  :global(html.dark) .metrics strong,
  :global(html.dark) .delivery-verdict strong,
  :global(html.dark) .delivery-verdict p,
  :global(html.dark) .category-grid strong,
  :global(html.dark) .preflight-panel p,
  :global(html.dark) .report-head h2,
  :global(html.dark) .source-grid strong,
  :global(html.dark) .category-report__section header strong,
  :global(html.dark) .detail-title strong,
  :global(html.dark) .detail-title span,
  :global(html.dark) .fix-box p {
    color: #f8fafc;
  }

  :global(html.dark) .score-core small,
  :global(html.dark) .metrics span,
  :global(html.dark) .delivery-verdict span,
  :global(html.dark) .category-grid span,
  :global(html.dark) .highlights,
  :global(html.dark) .loading-panel__head span,
  :global(html.dark) .signals-strip span,
  :global(html.dark) .report-counters span,
  :global(html.dark) .category-report__section header p,
  :global(html.dark) .detailed-issue-list p,
  :global(html.dark) .detailed-issue-list small,
  :global(html.dark) .passed-panel ul {
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
    .notes-section,
    .report-summary {
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
    .metrics,
    .category-grid,
    .report-summary .metrics,
    .source-grid {
      grid-template-columns: 1fr;
    }

    .card-head {
      flex-direction: column;
    }

    .report-head,
    .detail-title {
      flex-direction: column;
    }

    .report-counters {
      justify-content: flex-start;
    }

    .score-ring {
      min-height: 148px;
    }
  }
</style>
