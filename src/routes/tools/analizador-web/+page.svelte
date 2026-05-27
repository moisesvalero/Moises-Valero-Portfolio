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
      id:
        | 'security'
        | 'cms'
        | 'seo'
        | 'ai'
        | 'accessibility'
        | 'performance'
        | 'privacy'
        | 'quality'
        | 'trust'
        | 'delivery';
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
      hasLlmsTxt: boolean;
      hasSecurityTxt: boolean;
      isWordPress: boolean;
      externalScripts: number;
      internalLinks: number;
      imagesWithoutAlt: number;
      responseTimeMs: number;
      resourceCount: number;
      resourceErrors: number;
      brokenInternalLinks: number;
      estimatedResourceBytes: number;
      detectedTechnologies: string[];
      wordPressPlugins: string[];
      hasCustom404: boolean;
    };
    highlights: string[];
    analysisMode?: 'complete' | 'partial';
    analysisNote?: string;
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
  const MIN_ANALYSIS_REVEAL_MS = 10000;
  const pageJsonLd = stringifyJsonLdForHtml({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Analizador web de Moisés Valero',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    url: canonical,
    author: {
      '@type': 'Person',
      name: 'Moisés Valero'
    }
  });

  let analyzerUrl = $state('');
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let errorMessage = $state('');
  let result = $state<AnalyzerResult | null>(null);
  let animatedProgress = $state(0);
  let loadingProgress = $state(0);
  let leadEmail = $state('');
  let leadStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
  let leadError = $state('');
  let leadHoneypot = $state('');

  const animatedOverallScore = $derived(result ? Math.round(result.overallScore * animatedProgress) : 0);
  const scoreLabel = $derived(`${animatedOverallScore}%`);
  const scoreClass = $derived(
    !result ? 'score-neutral' : result.overallScore >= 90 ? 'score-good' : result.overallScore >= 60 ? 'score-mid' : 'score-low'
  );
  const scoreTone = $derived(
    !result ? '#94a3b8' : result.overallScore >= 90 ? '#10b981' : result.overallScore >= 60 ? '#f59e0b' : '#f43f5e'
  );
  const scoreRingStyle = $derived(`--score:${animatedOverallScore};--score-tone:${scoreTone}`);
  const loadingPercent = $derived(Math.max(0, Math.min(99, Math.round(loadingProgress))));
  const loadingRingStyle = $derived(`--loading-progress:${loadingPercent}`);
  const loadingStageLabel = $derived(
    loadingPercent < 28
      ? 'Conectando con la URL'
      : loadingPercent < 54
        ? 'Midiendo rendimiento'
        : loadingPercent < 78
          ? 'Revisando cabeceras y SEO'
          : 'Preparando informe'
  );
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
  const priorityIssues = $derived(
    result?.issues.filter((item) => item.severity === 'critical' || item.severity === 'warning').slice(0, 8) ?? []
  );
  const totalIssues = $derived(result?.issues.length ?? 0);
  const criticalIssues = $derived(result?.issues.filter((item) => item.severity === 'critical').length ?? 0);
  const warningIssues = $derived(result?.issues.filter((item) => item.severity === 'warning').length ?? 0);
  const infoIssues = $derived(result?.issues.filter((item) => item.severity === 'info').length ?? 0);
  const categoryIssueCount = (id: AnalyzerResult['categories'][number]['id']) =>
    result?.categories.find((category) => category.id === id)?.issues.length ?? 0;
  const heroCards = $derived(
    result
      ? [
          {
            label: 'Rendimiento',
            score: Math.round((result.categoryScores.performance || result.performanceScore) * animatedProgress),
            checks: [
              `${categoryIssueCount('performance')} hallazgos`,
              `${result.signals.responseTimeMs || 0} ms respuesta`,
              `${formatBytes(result.signals.estimatedResourceBytes)} recursos`
            ]
          },
          {
            label: 'SEO',
            score: Math.round(result.categoryScores.seo * animatedProgress),
            checks: [
              result.signals.hasRobotsTxt ? 'robots.txt detectado' : 'robots.txt pendiente',
              result.signals.hasSitemap ? 'sitemap.xml detectado' : 'sitemap.xml pendiente',
              `${result.signals.brokenInternalLinks} enlaces rotos`
            ]
          },
          {
            label: 'Seguridad',
            score: Math.round(result.categoryScores.security * animatedProgress),
            checks: [
              result.signals.isHttps ? 'HTTPS correcto' : 'HTTPS pendiente',
              result.signals.redirectsToHttps ? 'Redirige a HTTPS' : 'Sin redirección HTTPS',
              result.signals.hasSecurityTxt ? 'security.txt detectado' : 'security.txt pendiente',
              `${criticalIssues} críticos`
            ]
          },
          {
            label: 'Accesibilidad',
            score: Math.round(result.categoryScores.accessibility * animatedProgress),
            checks: [`${result.signals.imagesWithoutAlt} imágenes sin alt`, `${result.signals.resourceErrors} recursos rotos`, `${infoIssues} notas`]
          }
        ]
      : []
  );
  const heroSuggestions = $derived(
    result ? (priorityIssues.length ? priorityIssues : result.issues).slice(0, 3) : []
  );

  function scoreToneClass(score: number) {
    if (score >= 90) return 'score-good';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  }

  function cardRingStyle(score: number) {
    const tone = score >= 90 ? '#22c55e' : score >= 60 ? '#f2b015' : '#f43f5e';
    return `--score:${score};--score-tone:${tone}`;
  }

  function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  }

  function normalizeSignals(input: Partial<AnalyzerResult>['signals']): AnalyzerResult['signals'] {
    return {
      isHttps: input?.isHttps === true,
      redirectsToHttps: input?.redirectsToHttps === true,
      hasRobotsTxt: input?.hasRobotsTxt === true,
      hasSitemap: input?.hasSitemap === true,
      hasLlmsTxt: input?.hasLlmsTxt === true,
      hasSecurityTxt: input?.hasSecurityTxt === true,
      isWordPress: input?.isWordPress === true,
      externalScripts: typeof input?.externalScripts === 'number' ? input.externalScripts : 0,
      internalLinks: typeof input?.internalLinks === 'number' ? input.internalLinks : 0,
      imagesWithoutAlt: typeof input?.imagesWithoutAlt === 'number' ? input.imagesWithoutAlt : 0,
      responseTimeMs: typeof input?.responseTimeMs === 'number' ? input.responseTimeMs : 0,
      resourceCount: typeof input?.resourceCount === 'number' ? input.resourceCount : 0,
      resourceErrors: typeof input?.resourceErrors === 'number' ? input.resourceErrors : 0,
      brokenInternalLinks: typeof input?.brokenInternalLinks === 'number' ? input.brokenInternalLinks : 0,
      estimatedResourceBytes: typeof input?.estimatedResourceBytes === 'number' ? input.estimatedResourceBytes : 0,
      detectedTechnologies: Array.isArray(input?.detectedTechnologies)
        ? input.detectedTechnologies.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [],
      wordPressPlugins: Array.isArray(input?.wordPressPlugins)
        ? input.wordPressPlugins.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [],
      hasCustom404: input?.hasCustom404 === true
    };
  }

  async function waitForPremiumReveal(startedAt: number) {
    const elapsed = performance.now() - startedAt;
    const remaining = MIN_ANALYSIS_REVEAL_MS - elapsed;
    if (remaining <= 0) return;
    loadingProgress = Math.max(loadingProgress, 92);
    await new Promise((resolve) => setTimeout(resolve, remaining));
    loadingProgress = 100;
    await new Promise((resolve) => setTimeout(resolve, 220));
  }

  $effect(() => {
    if (!result) {
      animatedProgress = 0;
      return;
    }

    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      animatedProgress = 1 - Math.pow(1 - progress, 3);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  });

  $effect(() => {
    if (status !== 'loading') {
      loadingProgress = 0;
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const target = elapsed < 1800
        ? 18 + (elapsed / 1800) * 34
        : elapsed < 9000
          ? 52 + ((elapsed - 1800) / 7200) * 30
          : elapsed < 45000
            ? 82 + ((elapsed - 9000) / 36000) * 11
            : 94;

      loadingProgress = Math.max(loadingProgress, Math.min(94, target));
      frame = requestAnimationFrame(tick);
    };

    loadingProgress = 8;
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
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
      signals: normalizeSignals(input.signals),
      highlights: Array.isArray(input.highlights) ? input.highlights : [],
      analysisMode: input.analysisMode === 'partial' ? 'partial' : 'complete',
      analysisNote: typeof input.analysisNote === 'string' ? input.analysisNote : undefined
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
      const response = await fetch(`/api/web-audit/analyze/${encodeURIComponent(jobId)}`);
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        status?: 'queued' | 'running' | 'completed' | 'error';
        error?: string;
        result?: Partial<AnalyzerResult>;
        pollAfterMs?: number;
      } | null;

      if (!response.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'No se pudo completar el análisis.' };
      }
      if (data.status === 'completed' && data.result) {
        return { ok: true, result: data.result };
      }
      if (data.status === 'error') {
        return { ok: false, error: data.error || 'El análisis terminó con error.' };
      }
      intervalMs = Math.max(700, Math.min(5000, data.pollAfterMs ?? intervalMs));
    }

    return { ok: false, error: 'El análisis está tardando demasiado. Prueba de nuevo en unos minutos.' };
  }

  async function analyzeUrl() {
    if (status === 'loading') return;
    const revealStartedAt = performance.now();
    status = 'loading';
    loadingProgress = 8;
    errorMessage = '';
    result = null;
    leadStatus = 'idle';
    leadError = '';

    const response = await fetch('/api/web-audit/analyze', {
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
      await waitForPremiumReveal(revealStartedAt);
      result = normalizeResult(resolved.result);
      status = 'success';
      return;
    }

    await waitForPremiumReveal(revealStartedAt);
    result = normalizeResult(data.status === 'completed' && data.result ? data.result : data);
    status = 'success';
  }

  function resetAnalyzer() {
    status = 'idle';
    errorMessage = '';
    result = null;
    animatedProgress = 0;
    loadingProgress = 0;
    leadEmail = '';
    leadStatus = 'idle';
    leadError = '';
    leadHoneypot = '';
  }

  async function submitLeadForm() {
    if (!result || leadStatus === 'sending') return;
    leadStatus = 'sending';
    leadError = '';

    const response = await fetch('/api/web-audit/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: leadEmail,
        url: result.requestedUrl,
        score: result.performanceScore,
        severity: result.severity,
        overallScore: result.overallScore,
        deliveryVerdict: result.deliveryVerdict,
        finalUrl: result.finalUrl,
        categoryScores: result.categoryScores,
        metrics: result.metrics,
        categories: result.categories,
        issues: result.issues,
        passedChecks: result.passedChecks,
        signals: result.signals,
        highlights: result.highlights,
        analysisMode: result.analysisMode,
        analysisNote: result.analysisNote,
        website: leadHoneypot
      })
    });

    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !data?.ok) {
      leadStatus = 'error';
      leadError = data?.error || 'No se pudo enviar el informe por email.';
      return;
    }

    leadStatus = 'success';
    leadEmail = '';
    leadHoneypot = '';
  }
</script>

<svelte:head>
  <title>Analizador web técnico | Moisés Valero</title>
  <meta
    name="description"
    content="Herramienta propia para analizar rendimiento, seguridad visible, SEO técnico, accesibilidad y señales sospechosas de una URL."
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Analizador web técnico | Moisés Valero" />
  <meta
    property="og:description"
    content="Análisis completo para encontrar fallos de rendimiento, cabeceras, SEO, accesibilidad y código sospechoso antes de publicar una web."
  />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${baseUrl}/og-image-2026.png`} />
  <meta name="twitter:card" content="summary_large_image" />
  <JsonLdScript json={pageJsonLd} />
</svelte:head>

<main class="tool-page">
  <section class="tool-hero">
    <a class="back-link" href={resolve('/#proyectos')}>Portfolio</a>
    <p class="eyebrow">Herramienta propia</p>
    <h1>Analizador web</h1>
    <p class="lead">
      Analiza una URL en una sola pasada: rendimiento, seguridad visible, SEO técnico, accesibilidad,
      cabeceras HTTP, WordPress y señales sospechosas. Pensado para revisar tus trabajos antes de publicarlos.
    </p>
  </section>

  {#if status === 'idle' || status === 'error'}
    <section class="analyzer-section" aria-label="Analizador web">
      <form class="analyzer-card" onsubmit={(event) => { event.preventDefault(); void analyzeUrl(); }}>
        <div class="card-head">
          <div>
            <p class="card-kicker">Análisis técnico</p>
            <label for="analyzer-url">Introduce la URL</label>
          </div>
          <span class="status-pill">Preparado</span>
        </div>

        <div class="input-row">
          <input
            id="analyzer-url"
            bind:value={analyzerUrl}
            placeholder="https://ejemplo.com"
            autocomplete="url"
            required
          />
          <button type="submit">Analizar</button>
        </div>
        {#if status === 'error'}
          <p class="feedback error">{errorMessage}</p>
        {/if}

        {#if status === 'idle' || status === 'error'}
          <div class="preflight-panel">
            <p>El informe revisará</p>
            <div>
              <span>SEO técnico</span>
              <span>AEO / IA</span>
              <span>Seguridad visible</span>
              <span>CMS / WordPress</span>
              <span>Accesibilidad</span>
              <span>Rendimiento estructural</span>
              <span>Privacidad / legal</span>
              <span>Calidad de entrega</span>
              <span>Confianza comercial</span>
              <span>Veredicto final</span>
            </div>
          </div>
        {/if}

      </form>
    </section>
  {/if}

  {#if status === 'loading'}
    <section class="analysis-loading" aria-label="Análisis en curso" aria-live="polite" style={loadingRingStyle}>
      <div
        class="loading-orbit"
        role="progressbar"
        aria-label="Progreso estimado del análisis"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={loadingPercent}
      >
        <i></i>
        <strong>{loadingPercent}%</strong>
      </div>
      <div class="loading-copy">
        <p class="card-kicker">Análisis en curso</p>
        <h2>Revisando la URL</h2>
        <p class="loading-stage">{loadingStageLabel}</p>
        <p>
          Estoy midiendo rendimiento, cabeceras, SEO técnico, accesibilidad y señales visibles antes de montar el
          informe.
        </p>
      </div>
      <div
        class="analysis-progress"
        aria-hidden="true"
      >
        <span></span>
      </div>
      <div class="analysis-steps">
        <span>Auditor propio</span>
        <span>Cabeceras HTTP</span>
        <span>SEO técnico</span>
        <span>Accesibilidad</span>
      </div>
    </section>
  {:else if result}
    <section class={`hero-results ${scoreClass}`} aria-label="Resultado del analizador" aria-live="polite">
      <div class="global-score">
        <div class="global-score-ring" style={scoreRingStyle} aria-label={`Puntuación global: ${scoreLabel}`}>
          <span>{scoreLabel}</span>
        </div>
        <strong>Puntuación Global</strong>
        <p>{verdictText} - {severityText}</p>
      </div>

      <div class="hero-metric-grid">
        {#each heroCards as card (card.label)}
          <article class={`metric-card ${scoreToneClass(card.score)}`}>
            <h2>{card.label}</h2>
            <div class="metric-card-body">
              <div class="mini-ring" style={cardRingStyle(card.score)} aria-label={`${card.label}: ${card.score}%`}>
                <span>{card.score}%</span>
              </div>
              <ul>
                {#each card.checks as check (check)}
                  <li>
                    <span
                      aria-hidden="true"
                      class:marker-good={card.score >= 90}
                      class:marker-warn={card.score >= 60 && card.score < 90}
                      class:marker-low={card.score < 60}
                    ></span>
                    {check}
                  </li>
                {/each}
              </ul>
            </div>
          </article>
        {/each}
      </div>

      <div class="hero-suggestions">
        <h2>Sugerencias de Mejora</h2>
        <div>
          {#each heroSuggestions as suggestion (suggestion.id)}
            <article>
              <strong>{suggestion.title}</strong>
              <p>{suggestion.fix}</p>
            </article>
          {/each}
        </div>
      </div>

      <form class="lead-panel" onsubmit={(event) => { event.preventDefault(); void submitLeadForm(); }}>
        <div>
          <h2>Enviar informe por email</h2>
          <p>Te envío los 10 apartados, puntuaciones, problemas prioritarios y acciones recomendadas.</p>
        </div>
        <input
          bind:value={leadEmail}
          type="email"
          placeholder="tu@email.com"
          autocomplete="email"
          required
          disabled={leadStatus === 'sending' || leadStatus === 'success'}
        />
        <input class="lead-hp" bind:value={leadHoneypot} type="text" tabindex="-1" autocomplete="off" />
        <button type="submit" disabled={leadStatus === 'sending' || leadStatus === 'success'}>
          {leadStatus === 'sending' ? 'Enviando' : leadStatus === 'success' ? 'Enviado' : 'Enviar informe'}
        </button>
        {#if leadStatus === 'error'}
          <p class="feedback error">{leadError}</p>
        {:else if leadStatus === 'success'}
          <p class="feedback success">Informe enviado correctamente.</p>
        {/if}
      </form>

      <button class="reset-button" type="button" onclick={resetAnalyzer}>Analizar otra URL</button>
    </section>
  {/if}

  {#if result}
    <section class="report-section" aria-label="Informe del analizador web">
      <details class="full-report" open>
        <summary>
          <span>Informe completo</span>
          <strong>Ver revisión técnica detallada</strong>
        </summary>
          <div class="report-head">
            <div>
              <p class="card-kicker">Informe completo</p>
              <h2>Revisión técnica de la URL</h2>
            </div>
            <div class="report-counters" aria-label="Resumen de fallos">
              <span>{criticalIssues} críticos</span>
              <span>{warningIssues} a revisar</span>
              <span>{infoIssues} avisos</span>
            </div>
          </div>

          <div class="source-grid" aria-label="Tipos de análisis incluidos">
            <div>
              <span>Auditor propio</span>
              <strong>10 apartados de entrega web con checks propios</strong>
            </div>
            <div>
              <span>Cabeceras y politicas</span>
              <strong>Cabeceras, HTTPS, CSP, HSTS y cookies</strong>
            </div>
            <div>
              <span>Revision editorial y tecnica</span>
              <strong>SEO, AEO, privacidad, confianza, CMS y calidad visible</strong>
            </div>
          </div>

          <div class="source-grid" aria-label="Senales tecnicas detectadas">
            <div>
              <span>Respuesta HTML</span>
              <strong>{result.signals.responseTimeMs || 0} ms</strong>
            </div>
            <div>
              <span>Recursos revisados</span>
              <strong>{result.signals.resourceCount} recursos - {result.signals.resourceErrors} errores</strong>
            </div>
            <div>
              <span>Enlaces internos</span>
              <strong>{result.signals.internalLinks} detectados - {result.signals.brokenInternalLinks} rotos</strong>
            </div>
            <div>
              <span>Peso estimado</span>
              <strong>{formatBytes(result.signals.estimatedResourceBytes)}</strong>
            </div>
            <div>
              <span>404</span>
              <strong>{result.signals.hasCustom404 ? 'Personalizada detectada' : 'No detectada'}</strong>
            </div>
            <div>
              <span>Tecnologias</span>
              <strong>{result.signals.detectedTechnologies.length ? result.signals.detectedTechnologies.slice(0, 4).join(', ') : 'Sin fingerprint claro'}</strong>
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
                    <p class="category-ok">Sin fallos detectados en esta categoría.</p>
                  {/if}
                </section>
              {/each}
            </div>
          {:else}
            <p class="category-ok">No se han detectado fallos en los checks automáticos.</p>
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
      </details>

      {#if result?.highlights.length}
        <div class="highlights-panel">
          <p>Lectura rápida</p>
          <ul class="highlights">
            {#each result.highlights as item (item)}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </section>
  {/if}

</main>

<style>
  .tool-page {
    position: relative;
    min-height: 100vh;
    color: var(--text-main);
    background:
      radial-gradient(circle at 50% 0%, rgba(0, 113, 227, 0.1), transparent 32rem),
      linear-gradient(180deg, rgba(232, 240, 249, 0.96), rgba(242, 246, 251, 0.9) 42%, var(--bg-main) 100%),
      #e9f0f8;
    font-family: var(--font-sans);
  }

  .tool-hero {
    position: relative;
    z-index: 1;
    width: min(980px, calc(100% - 32px));
    margin: 0 auto;
    padding: max(6.4rem, calc(env(safe-area-inset-top, 0px) + 5.4rem)) 0 1.2rem;
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
    font-size: clamp(3rem, 6.8vw, 5.8rem);
    font-weight: 900;
    letter-spacing: -0.058em;
    line-height: 0.9;
  }

  h2 {
    font-size: clamp(1.7rem, 3vw, 2.35rem);
    line-height: 1.08;
  }

  .lead {
    max-width: 720px;
    margin: 1rem auto 0;
    color: #1f2937;
    font-size: clamp(1.02rem, 2vw, 1.18rem);
    font-weight: 520;
    line-height: 1.68;
  }

  .analysis-loading {
    position: relative;
    z-index: 1;
    width: min(760px, calc(100% - 32px));
    margin: clamp(1.3rem, 3vw, 2rem) auto 2.5rem;
    padding: clamp(1.2rem, 3vw, 1.8rem);
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 8px;
    background:
      linear-gradient(90deg, rgba(0, 113, 227, 0.08), transparent 36%, rgba(16, 185, 129, 0.08)),
      rgba(255, 255, 255, 0.94);
    box-shadow:
      0 24px 70px rgba(15, 23, 42, 0.11),
      0 1px 0 rgba(255, 255, 255, 0.82) inset;
  }

  .analysis-loading::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 0 34%, rgba(255, 255, 255, 0.72) 46%, transparent 58% 100%);
    animation: analysisSweep 2.2s ease-in-out infinite;
    pointer-events: none;
  }

  .loading-orbit {
    position: relative;
    width: 128px;
    aspect-ratio: 1;
    margin: 0 auto 1rem;
    border-radius: 999px;
    background:
      radial-gradient(circle at center, rgba(255, 255, 255, 0.98) 0 58%, transparent 59%),
      conic-gradient(#0071e3 calc(var(--loading-progress) * 1%), rgba(0, 113, 227, 0.13) 0);
    box-shadow: 0 18px 52px rgba(0, 113, 227, 0.18);
  }

  .loading-orbit::after {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 999px;
    border: 1px solid rgba(0, 113, 227, 0.18);
    border-top-color: rgba(16, 185, 129, 0.72);
    animation: orbitSpin 1.65s linear infinite;
    pointer-events: none;
  }

  .loading-orbit i {
    position: absolute;
    inset: 34px;
    z-index: 1;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.96);
  }

  .loading-orbit strong {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    place-items: center;
    color: #0052b8;
    font-size: 1.45rem;
    font-weight: 950;
    letter-spacing: -0.06em;
    line-height: 1;
  }

  .loading-copy {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .loading-copy h2 {
    margin: 0;
    color: #101114;
    font-size: clamp(1.65rem, 3vw, 2.35rem);
    font-weight: 950;
    letter-spacing: -0.055em;
    line-height: 1;
  }

  .loading-copy p:last-child {
    max-width: 58ch;
    margin: 0.75rem auto 0;
    color: #475569;
    font-weight: 620;
    line-height: 1.58;
  }

  .loading-stage {
    display: inline-flex;
    min-height: 30px;
    align-items: center;
    margin: 0.75rem auto 0;
    padding: 0 0.72rem;
    border: 1px solid rgba(0, 113, 227, 0.16);
    border-radius: 6px;
    background: rgba(0, 113, 227, 0.06);
    color: #0052b8;
    font-size: 0.78rem;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .analysis-progress {
    position: relative;
    z-index: 1;
    height: 8px;
    margin-top: 1.2rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.2);
  }

  .analysis-progress span {
    position: absolute;
    inset: 0 auto 0 0;
    width: calc(var(--loading-progress) * 1%);
    border-radius: inherit;
    background: linear-gradient(90deg, #0071e3, #10b981);
    transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .analysis-steps {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .analysis-steps span {
    min-height: 42px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(0, 113, 227, 0.12);
    border-radius: 8px;
    color: #0052b8;
    background: rgba(0, 113, 227, 0.06);
    font-size: 0.78rem;
    font-weight: 900;
    animation: stepPulse 1.6s ease-in-out infinite;
  }

  .analysis-steps span:nth-child(2) {
    animation-delay: 0.18s;
  }

  .analysis-steps span:nth-child(3) {
    animation-delay: 0.36s;
  }

  .analysis-steps span:nth-child(4) {
    animation-delay: 0.54s;
  }

  .hero-results {
    position: relative;
    z-index: 1;
    width: min(100%, 940px);
    margin: clamp(1.4rem, 3vw, 2.3rem) auto 0;
    text-align: left;
  }

  .global-score {
    display: grid;
    justify-items: center;
    gap: 0.62rem;
    text-align: center;
  }

  .global-score-ring,
  .mini-ring {
    --score: 0;
    --score-tone: #94a3b8;
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    border-radius: 999px;
    background:
      radial-gradient(circle at center, rgba(255, 255, 255, 0.98) 0 58%, transparent 59%),
      conic-gradient(var(--score-tone) calc(var(--score) * 1%), rgba(148, 163, 184, 0.2) 0);
  }

  .global-score-ring {
    width: clamp(160px, 18vw, 210px);
    box-shadow:
      0 0 0 1px rgba(34, 197, 94, 0.16),
      0 22px 72px color-mix(in srgb, var(--score-tone) 25%, transparent);
  }

  .global-score-ring span {
    color: var(--score-tone);
    font-size: clamp(2.55rem, 5vw, 4.45rem);
    font-weight: 950;
    letter-spacing: -0.065em;
    line-height: 1;
  }

  .global-score strong {
    color: #101114;
    font-size: clamp(1.2rem, 2vw, 1.48rem);
    font-weight: 950;
    letter-spacing: -0.035em;
  }

  .global-score p {
    margin: -0.3rem 0 0;
    color: #64748b;
    font-size: 0.88rem;
    font-weight: 800;
  }

  .hero-metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
    margin-top: clamp(1.25rem, 3vw, 1.8rem);
  }

  .metric-card,
  .hero-suggestions article {
    border: 1px solid rgba(15, 23, 42, 0.11);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow:
      0 16px 36px rgba(15, 23, 42, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.86) inset;
  }

  .metric-card {
    padding: 0.95rem 1rem;
  }

  .metric-card h2,
  .hero-suggestions h2 {
    margin: 0;
    color: #101114;
    font-size: clamp(1.15rem, 2vw, 1.55rem);
    font-weight: 950;
    letter-spacing: -0.04em;
    line-height: 1.05;
  }

  .metric-card-body {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 0.8rem;
    align-items: center;
    margin-top: 0.75rem;
  }

  .mini-ring {
    width: 88px;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
  }

  .mini-ring span {
    color: #101114;
    font-size: 1.28rem;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .metric-card ul {
    display: grid;
    gap: 0.42rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .metric-card li {
    display: flex;
    gap: 0.42rem;
    align-items: flex-start;
    color: #1f2937;
    font-size: 0.84rem;
    font-weight: 720;
    line-height: 1.3;
  }

  .metric-card li span {
    display: grid;
    flex: 0 0 auto;
    width: 1rem;
    height: 1rem;
    place-items: center;
    border-radius: 4px;
    background: #22c55e;
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: 950;
    line-height: 1;
  }

  .metric-card li span.marker-warn {
    background: #f2b015;
  }

  .metric-card li span.marker-low {
    background: #f43f5e;
  }

  .metric-card.score-mid li span {
    background: #f2b015;
  }

  .metric-card.score-low li span {
    background: #f43f5e;
  }

  .hero-suggestions {
    margin-top: clamp(1.3rem, 3vw, 2rem);
  }

  .hero-suggestions > div {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
    margin-top: 0.8rem;
  }

  .hero-suggestions article {
    min-height: 112px;
    padding: 0.95rem;
  }

  .hero-suggestions strong {
    display: block;
    color: #101114;
    font-size: 1rem;
    font-weight: 920;
    letter-spacing: -0.025em;
    line-height: 1.12;
  }

  .hero-suggestions p {
    margin: 0.58rem 0 0;
    color: #475569;
    font-size: 0.88rem;
    line-height: 1.46;
  }

  .lead-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.48fr) auto;
    gap: 0.7rem;
    align-items: end;
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid rgba(0, 113, 227, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  }

  .lead-panel h2 {
    margin: 0;
    color: #101114;
    font-size: 1.15rem;
    font-weight: 950;
    letter-spacing: -0.035em;
  }

  .lead-panel p {
    margin: 0.3rem 0 0;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.42;
  }

  .lead-panel input {
    min-height: 44px;
  }

  .lead-panel button,
  .reset-button {
    min-height: 44px;
  }

  .lead-panel .feedback {
    grid-column: 1 / -1;
  }

  .lead-hp {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .reset-button {
    display: flex;
    width: fit-content;
    margin: 0.8rem auto 0;
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: rgba(255, 255, 255, 0.82);
    color: #101114;
    box-shadow: none;
  }

  .analyzer-section {
    position: relative;
    z-index: 1;
    width: min(760px, calc(100% - 32px));
    margin: 0 auto;
    padding: 1.2rem 0 2.2rem;
  }

  .analyzer-card {
    position: relative;
    padding: clamp(1.1rem, 3vw, 1.8rem);
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow:
      0 24px 70px rgba(15, 23, 42, 0.11),
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.56rem 1rem;
  }

  .preflight-panel span {
    display: inline-flex;
    align-items: center;
    gap: 0.48rem;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: #1f2937;
    background: transparent;
    font-size: 0.78rem;
    font-weight: 850;
  }

  .preflight-panel span::before {
    content: "";
    width: 0.46rem;
    height: 0.46rem;
    flex: 0 0 auto;
    border-radius: 2px;
    background: #0071e3;
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
    font-size: clamp(1.42rem, 2vw, 1.86rem);
    font-weight: 900;
    letter-spacing: -0.035em;
    line-height: 1.02;
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
    border-radius: 3px;
    background: #94a3b8;
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

  .reset-button {
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: rgba(255, 255, 255, 0.82);
    color: #101114;
    box-shadow: none;
  }

  .reset-button:hover,
  .reset-button:focus-visible {
    background: #ffffff;
    color: #0066e5;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
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

  .feedback.success {
    color: #047857;
    font-weight: 850;
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

  .report-section {
    position: relative;
    z-index: 1;
    width: min(980px, calc(100% - 32px));
    margin: 0 auto 2.6rem;
  }

  .full-report {
    padding: clamp(1rem, 2vw, 1.25rem);
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 20px 52px rgba(15, 23, 42, 0.08);
  }

  .full-report > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    cursor: pointer;
    list-style: none;
  }

  .full-report > summary::-webkit-details-marker {
    display: none;
  }

  .full-report > summary span {
    color: #0071e3;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .full-report > summary strong {
    color: #101114;
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    font-weight: 950;
    letter-spacing: -0.035em;
  }

  .full-report > summary::after {
    content: "+";
    display: grid;
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 4px;
    color: #101114;
    background: #ffffff;
    font-size: 1.1rem;
    font-weight: 850;
  }

  .full-report[open] > summary {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(15, 23, 42, 0.1);
    margin-bottom: 1rem;
  }

  .full-report[open] > summary::after {
    content: "-";
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
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: #ffffff;
  }

  .detailed-issue-list li.detail-critical {
    border-color: rgba(244, 63, 94, 0.28);
    background: rgba(244, 63, 94, 0.055);
  }

  .detailed-issue-list li.detail-warning {
    border-color: rgba(245, 158, 11, 0.28);
    background: rgba(245, 158, 11, 0.06);
  }

  .detailed-issue-list li.detail-info {
    border-color: rgba(0, 113, 227, 0.24);
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

  @keyframes analysisSweep {
    from {
      transform: translateX(-120%);
    }
    to {
      transform: translateX(120%);
    }
  }

  @keyframes orbitSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes progressDrift {
    0% {
      transform: translateX(-40%);
    }
    50% {
      transform: translateX(140%);
    }
    100% {
      transform: translateX(-40%);
    }
  }

  @keyframes stepPulse {
    0%,
    100% {
      opacity: 0.58;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-2px);
    }
  }

  :global(html.dark) .tool-page {
    background:
      radial-gradient(circle at 50% 0%, rgba(77, 163, 255, 0.14), transparent 32rem),
      linear-gradient(180deg, rgba(12, 18, 30, 0.98), rgba(7, 12, 21, 0.94) 52%, #0a0a0a 100%),
      #0c1220;
  }

  :global(html.dark) .lead {
    color: #d4d4d8;
  }

  :global(html.dark) .global-score-ring,
  :global(html.dark) .mini-ring {
    background:
      radial-gradient(circle at center, rgba(18, 18, 18, 0.98) 0 58%, transparent 59%),
      conic-gradient(var(--score-tone) calc(var(--score) * 1%), rgba(255, 255, 255, 0.12) 0);
  }

  :global(html.dark) .global-score strong,
  :global(html.dark) .metric-card h2,
  :global(html.dark) .hero-suggestions h2,
  :global(html.dark) .lead-panel h2,
  :global(html.dark) .full-report > summary strong,
  :global(html.dark) .hero-suggestions strong,
  :global(html.dark) .mini-ring span {
    color: #f8fafc;
  }

  :global(html.dark) .global-score p,
  :global(html.dark) .metric-card li,
  :global(html.dark) .lead-panel p,
  :global(html.dark) .hero-suggestions p,
  :global(html.dark) .loading-copy p:last-child {
    color: #d4d4d8;
  }

  :global(html.dark) .analysis-loading {
    border-color: rgba(255, 255, 255, 0.12);
    background:
      linear-gradient(90deg, rgba(0, 113, 227, 0.12), transparent 36%, rgba(16, 185, 129, 0.1)),
      rgba(18, 18, 18, 0.86);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .analysis-loading::before {
    background: linear-gradient(110deg, transparent 0 34%, rgba(255, 255, 255, 0.1) 46%, transparent 58% 100%);
  }

  :global(html.dark) .loading-orbit {
    background:
      radial-gradient(circle at center, rgba(18, 18, 18, 0.98) 0 58%, transparent 59%),
      conic-gradient(#4da3ff calc(var(--loading-progress) * 1%), rgba(77, 163, 255, 0.14) 0);
  }

  :global(html.dark) .loading-orbit::after {
    border-color: rgba(77, 163, 255, 0.2);
    border-top-color: rgba(52, 211, 153, 0.72);
  }

  :global(html.dark) .loading-orbit i {
    background: rgba(18, 18, 18, 0.96);
  }

  :global(html.dark) .loading-orbit strong {
    color: #eaf4ff;
  }

  :global(html.dark) .loading-copy h2 {
    color: #f8fafc;
  }

  :global(html.dark) .loading-stage {
    border-color: rgba(77, 163, 255, 0.26);
    background: rgba(77, 163, 255, 0.1);
    color: #bfdbfe;
  }

  :global(html.dark) .analysis-steps span {
    border-color: rgba(96, 165, 250, 0.18);
    color: #bfdbfe;
    background: rgba(96, 165, 250, 0.08);
  }

  :global(html.dark) .analyzer-card,
  :global(html.dark) .metric-card,
  :global(html.dark) .hero-suggestions article,
  :global(html.dark) .lead-panel,
  :global(html.dark) .highlights-panel,
  :global(html.dark) .preflight-panel,
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

  :global(html.dark) .reset-button,
  :global(html.dark) .full-report > summary::after {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.07);
    color: #f8fafc;
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

  :global(html.dark) .preflight-panel span {
    color: #d4d4d8;
  }

  :global(html.dark) .preflight-panel span::before {
    background: #4da3ff;
  }

  :global(html.dark) .preflight-panel p,
  :global(html.dark) .report-head h2,
  :global(html.dark) .source-grid strong,
  :global(html.dark) .category-report__section header strong,
  :global(html.dark) .detail-title strong,
  :global(html.dark) .detail-title span,
  :global(html.dark) .fix-box p {
    color: #f8fafc;
  }

  :global(html.dark) .highlights,
  :global(html.dark) .report-counters span,
  :global(html.dark) .category-report__section header p,
  :global(html.dark) .detailed-issue-list p,
  :global(html.dark) .detailed-issue-list small,
  :global(html.dark) .passed-panel ul {
    color: #d4d4d8;
  }

  @media (max-width: 940px) {
    .tool-hero {
      grid-template-columns: 1fr;
    }

    .hero-metric-grid,
    .hero-suggestions > div,
    .analysis-steps {
      grid-template-columns: 1fr;
    }

    .lead-panel {
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

    .metric-card-body {
      grid-template-columns: 82px minmax(0, 1fr);
    }

    .mini-ring {
      width: 78px;
    }

    .input-row,
    .source-grid,
    .preflight-panel div {
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

  }
</style>
