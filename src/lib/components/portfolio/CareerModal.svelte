<script lang="ts">
  import type { SiteLocale } from '$lib/i18n/site-locale';
  import type { SiteCareerModal } from '$lib/types/site-portfolio';
  import { getCareerModalCopy } from './career-modal-copy';

  let {
    open = $bindable(false),
    pdfHref = '/imagenes/MOISES-VALERO-CV.pdf',
    locale = 'es' as SiteLocale,
    career = undefined as SiteCareerModal | undefined
  }: {
    open?: boolean;
    pdfHref?: string;
    locale?: SiteLocale;
    career?: SiteCareerModal;
  } = $props();

  const baseCopy = $derived(getCareerModalCopy(locale));
  const c = $derived({
    ...baseCopy,
    ...(career
      ? {
          closeAria: career.closeAria,
          title: career.title,
          profileTitle: career.profileTitle,
          profileHtml: career.profileHtml,
          expTitle: career.expTitle,
          timeline: career.timeline,
          stackTitle: career.stackTitle,
          pdfHide: career.pdfHide,
          pdfShow: career.pdfShow,
          pdfIframeTitle: career.pdfIframeTitle,
          pdfHintBefore: career.pdfHintBefore,
          pdfHintLink: career.pdfHintLink
        }
      : {})
  });
  const effectivePdfHref = $derived(career?.pdfHref || pdfHref);
  // El iframe se carga siempre desde nuestro proxy mismo origen (`/api/cv`) para evitar el
  // bloqueo por CSP (`frame-src`) y por `Content-Disposition: attachment` que Sanity CDN
  // aplica a los PDFs. El enlace "abrir en pestaña nueva" mantiene la URL original.
  const pdfIframeSrc = '/api/cv';
  type StackIcon = {
    src?: string;
    iconify?: string;
    alt?: string;
    title: string;
  };

  type StackGroup = {
    title: string;
    icons: StackIcon[];
  };

  const stackGroups: StackGroup[] = [
    {
      title: 'Lenguajes y Core',
      icons: [
        { iconify: 'logos:typescript-icon', alt: 'TypeScript', title: 'TypeScript' },
        { src: '/imagenes/javascript.svg', alt: 'JavaScript', title: 'JavaScript (ES6+)' },
        { src: '/imagenes/html5.svg', alt: 'HTML5', title: 'HTML5' },
        { src: '/imagenes/css.svg', alt: 'CSS3', title: 'CSS3' }
      ]
    },
    {
      title: 'Frameworks y Librerías',
      icons: [
        { src: '/imagenes/svelte.svg', alt: 'SvelteKit', title: 'SvelteKit / Svelte 5' },
        { src: '/imagenes/tailwindcss.svg', alt: 'Tailwind CSS', title: 'Tailwind CSS' },
        { iconify: 'logos:vitejs', alt: 'Vite', title: 'Vite' },
        { iconify: 'logos:pwa', alt: 'PWA', title: 'Progressive Web Apps' }
      ]
    },
    {
      title: 'Backend e Infraestructura',
      icons: [
        { iconify: 'logos:supabase-icon', alt: 'Supabase', title: 'Supabase (PostgreSQL)' },
        { iconify: 'logos:vercel-icon', alt: 'Vercel', title: 'Vercel' },
        { src: '/imagenes/cloudflare.svg', alt: 'Cloudflare', title: 'Cloudflare' },
        { src: '/imagenes/github.svg', alt: 'GitHub', title: 'GitHub' }
      ]
    },
    {
      title: 'Integraciones y APIs',
      icons: [
        { iconify: 'logos:stripe', alt: 'Stripe', title: 'Stripe API' },
        { src: '/imagenes/claude-ai-icon.svg', alt: 'Claude', title: 'Claude API' },
        { iconify: 'logos:openai-icon', alt: 'OpenAI', title: 'OpenAI API' },
        { iconify: 'logos:google-gemini', alt: 'Gemini', title: 'Gemini API' }
      ]
    },
    {
      title: 'CMS y Low-Code',
      icons: [
        { src: '/imagenes/wordpress.svg', alt: 'WordPress', title: 'WordPress' },
        { src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
        { src: '/imagenes/elementor.svg', alt: 'Elementor', title: 'Elementor' },
        { iconify: 'logos:sanity', alt: 'Sanity', title: 'Sanity.io' }
      ]
    },
    {
      title: 'Entorno de Desarrollo e IA',
      icons: [
        { src: '/imagenes/cursor.svg', alt: 'Cursor', title: 'Cursor' },
        { iconify: 'simple-icons:ollama', alt: 'Ollama', title: 'Ollama' },
        { src: '/imagenes/opencode.svg', alt: 'OpenCode', title: 'OpenCode' },
        { src: '/imagenes/antigravity.svg', alt: 'Antigravity', title: 'Google Antigravity' }
      ]
    }
  ];

  function iconifySvgUrl(name: string): string {
    return `https://api.iconify.design/${encodeURIComponent(name)}.svg`;
  }

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
      <button type="button" class="career-close" onclick={close} aria-label={c.closeAria}>
        <span aria-hidden="true">×</span>
      </button>

      <div class="career-scroll">
        <h2 id="career-modal-title" class="career-title">{c.title}</h2>

        <section class="career-block" aria-labelledby="career-perfil">
          <h3 id="career-perfil" class="career-h3">{c.profileTitle}</h3>
          <!-- svelte-ignore hydration_html_changed -->
          {@html c.profileHtml}
        </section>

        <section class="career-block" aria-labelledby="career-exp">
          <h3 id="career-exp" class="career-h3">{c.expTitle}</h3>
          <ol class="career-timeline">
            {#each c.timeline as item (item.range + item.role)}
              <li
                class="career-tl-item"
                class:career-tl-item--span={item.span}
              >
                <span class="career-tl-range">{item.range}</span>
                <span class="career-tl-role">{item.role}</span>
                <p class="career-tl-desc">
                  <!-- svelte-ignore hydration_html_changed -->
                  {@html item.descHtml}
                </p>
              </li>
            {/each}
          </ol>
        </section>

        <section class="career-block" aria-labelledby="career-stack">
          <h3 id="career-stack" class="career-h3">{c.stackTitle}</h3>
          <div class="career-stack-groups">
            {#each stackGroups as group (group.title)}
              <section class="career-stack-group" aria-label={group.title}>
                <p class="career-stack-group-title">{group.title}</p>
                <ul class="career-stack-icons">
                  {#each group.icons as icon (icon.title)}
                    <li class="career-stack-icon-item">
                      <span class="career-stack-icon-mark">
                        <img
                          src={icon.iconify ? iconifySvgUrl(icon.iconify) : icon.src}
                          alt={icon.title}
                          title={icon.title}
                          width="16"
                          height="16"
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span class="career-stack-icon-text">{icon.title}</span>
                    </li>
                  {/each}
                </ul>
              </section>
            {/each}
          </div>
        </section>

        <footer class="career-footer">
          <button
            type="button"
            class="career-pdf-toggle"
            onclick={() => (showPdf = !showPdf)}
            aria-expanded={showPdf}
          >
            {showPdf ? c.pdfHide : c.pdfShow}
          </button>

          {#if showPdf}
            <div class="career-pdf-wrap">
              <iframe
                class="career-pdf-frame"
                src={pdfIframeSrc}
                title={c.pdfIframeTitle}
              ></iframe>
              <p class="career-pdf-hint">
                {c.pdfHintBefore}<a href={effectivePdfHref} target="_blank" rel="noopener noreferrer"
                  >{c.pdfHintLink}</a
                >.
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

  .career-stack-groups {
    display: grid;
    gap: 0.75rem;
  }

  .career-stack-group {
    padding: 0.65rem 0.75rem 0.75rem;
    background: #f8fafc;
    border: 1px solid #e8edf3;
    border-radius: 10px;
  }

  .career-stack-group-title {
    margin: 0 0 0.45rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
  }

  .career-stack-icons {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem 0.6rem;
  }

  .career-stack-icon-item {
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    min-width: 0;
  }

  .career-stack-icon-mark {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .career-stack-icon-mark img {
    width: 14px;
    height: 14px;
    object-fit: contain;
    display: block;
  }

  .career-stack-icon-text {
    font-size: 0.78rem;
    font-weight: 500;
    color: #1d1d1f;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
