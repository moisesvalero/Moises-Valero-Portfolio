<script lang="ts">
  let {
    open = $bindable(false),
    pdfHref = '/imagenes/MOISES-VALERO-CV.pdf'
  }: {
    open?: boolean;
    pdfHref?: string;
  } = $props();

  let showPdf = $state(false);

  function close() {
    open = false;
    showPdf = false;
  }

  function onBackdropMouseDown(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
      };
      window.addEventListener('keydown', onKey);
      return () => {
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="career-backdrop"
    role="presentation"
    onmousedown={onBackdropMouseDown}
  >
    <div
      class="career-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-modal-title"
      tabindex="-1"
      onmousedown={(e) => e.stopPropagation()}
    >
      <button type="button" class="career-close" onclick={close} aria-label="Cerrar">
        <span aria-hidden="true">×</span>
      </button>

      <div class="career-scroll">
        <h2 id="career-modal-title" class="career-title">Trayectoria Profesional — Moisés Valero</h2>

        <section class="career-block" aria-labelledby="career-perfil">
          <h3 id="career-perfil" class="career-h3">Perfil</h3>
          <p class="career-p">
            Cuento con el <strong>Certificado de Profesionalidad de Nivel 3 en Desarrollo Web</strong>
            (equivalente a formación de <strong>Grado Superior</strong>), que avala competencias
            actualizadas en desarrollo y entornos web profesionales.
          </p>
        </section>

        <section class="career-block" aria-labelledby="career-exp">
          <h3 id="career-exp" class="career-h3">Experiencia</h3>
          <ol class="career-timeline">
            <li class="career-tl-item">
              <span class="career-tl-range">2019 – 2022</span>
              <span class="career-tl-role">Autónomo</span>
              <p class="career-tl-desc">
                Digitalización de negocios, gestión de proyectos técnicos y mantenimiento de sistemas.
              </p>
            </li>
            <li class="career-tl-item">
              <span class="career-tl-range">2012 – 2014</span>
              <span class="career-tl-role">MutuaSAD</span>
              <p class="career-tl-desc">
                Administración WordPress, comercio electrónico (WooCommerce / PrestaShop) y soporte
                microinformático y de redes.
              </p>
            </li>
            <li class="career-tl-item career-tl-item--span">
              <span class="career-tl-range">2001 – 2026</span>
              <span class="career-tl-role">Trayectoria adicional</span>
              <p class="career-tl-desc">
                Más de dos décadas aportando <strong>madurez profesional</strong> y
                <strong>capacidad de liderazgo</strong> como oficial especialista en entornos
                industriales y en <strong>carpintería técnica</strong>, con fuerte orientación a la
                calidad, la coordinación y la resolución de problemas complejos.
              </p>
            </li>
          </ol>
        </section>

        <section class="career-block" aria-labelledby="career-stack">
          <h3 id="career-stack" class="career-h3">Stack técnico</h3>
          <ul class="career-tags">
            <li>WordPress <span class="career-tag-sub">Kadence · Elementor</span></li>
            <li>SvelteKit</li>
            <li>SEO on-page</li>
            <li>IA generativa <span class="career-tag-sub">prompt engineering · automatización</span></li>
          </ul>
        </section>

        <footer class="career-footer">
          <button
            type="button"
            class="career-pdf-toggle"
            onclick={() => (showPdf = !showPdf)}
            aria-expanded={showPdf}
          >
            {showPdf ? 'Ocultar CV en PDF' : 'Ver CV original en PDF'}
          </button>

          {#if showPdf}
            <div class="career-pdf-wrap">
              <iframe
                class="career-pdf-frame"
                src={pdfHref}
                title="CV de Moisés Valero (PDF)"
              ></iframe>
              <p class="career-pdf-hint">
                Si no se muestra el documento,
                <a href={pdfHref} target="_blank" rel="noopener noreferrer">ábrelo en una pestaña nueva</a>.
              </p>
            </div>
          {/if}
        </footer>
      </div>
    </div>
  </div>
{/if}

<style>
  .career-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    background: rgba(29, 29, 31, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-sizing: border-box;
    font-family: var(--font-sans);
  }

  .career-panel {
    position: relative;
    width: min(100%, 560px);
    max-height: min(90vh, 880px);
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8e8ed;
    box-shadow:
      0 24px 80px rgba(29, 29, 31, 0.12),
      0 1px 0 rgba(255, 255, 255, 0.9) inset;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .career-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 2;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.04);
    color: #1d1d1f;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .career-close:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: scale(1.04);
  }

  .career-scroll {
    overflow-y: auto;
    padding: 2.25rem 1.75rem 1.75rem;
    -webkit-overflow-scrolling: touch;
  }

  .career-title {
    margin: 0 2.25rem 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: #1d1d1f;
  }

  .career-block {
    margin-bottom: 1.75rem;
  }

  .career-h3 {
    margin: 0 0 0.65rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #86868b;
  }

  .career-p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.65;
    color: #424245;
  }

  .career-timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 2px solid #e8e8ed;
    padding-left: 1.25rem;
  }

  .career-tl-item {
    position: relative;
    padding-bottom: 1.35rem;
  }

  .career-tl-item::before {
    content: '';
    position: absolute;
    left: calc(-1.25rem - 5px);
    top: 0.35rem;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0071e3;
    box-shadow: 0 0 0 3px #fff;
  }

  .career-tl-range {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #0071e3;
    margin-bottom: 0.2rem;
  }

  .career-tl-role {
    display: block;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 0.35rem;
  }

  .career-tl-desc {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #6e6e73;
  }

  .career-tags {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .career-tags li {
    font-size: 0.9375rem;
    color: #1d1d1f;
    padding: 0.55rem 0.85rem;
    background: #f5f5f7;
    border-radius: 10px;
    border: 1px solid #e8e8ed;
    line-height: 1.4;
  }

  .career-tag-sub {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #86868b;
    margin-top: 0.15rem;
  }

  .career-footer {
    margin-top: 0.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #e8e8ed;
  }

  .career-pdf-toggle {
    display: inline-flex;
    align-items: center;
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #0071e3;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .career-pdf-toggle:hover {
    color: #0077ed;
  }

  .career-pdf-wrap {
    margin-top: 1rem;
  }

  .career-pdf-frame {
    width: 100%;
    height: min(52vh, 420px);
    border: 1px solid #e8e8ed;
    border-radius: 10px;
    background: #f5f5f7;
  }

  .career-pdf-hint {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    color: #86868b;
    line-height: 1.4;
  }

  .career-pdf-hint a {
    color: #0071e3;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  @media (max-width: 480px) {
    .career-scroll {
      padding: 2rem 1.15rem 1.25rem;
    }

    .career-title {
      font-size: 1.1rem;
    }
  }
</style>
