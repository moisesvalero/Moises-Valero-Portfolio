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
  let panelEl = $state<HTMLDivElement | undefined>();
  let previouslyFocused = $state<HTMLElement | null>(null);

  const narrative = $derived(
    locale === 'en'
      ? {
          eyebrow: 'Non-linear route',
          pdfIntro: 'The complete CV stays available, but the modal keeps the story readable first.'
        }
      : {
          eyebrow: 'Recorrido no lineal',
          pdfIntro: 'El CV completo queda disponible, pero la historia se entiende antes.'
        }
  );

  const timelineItems = $derived(c.timeline ?? []);
  let currentIndex = $state(0);
  let carouselRef = $state<HTMLDivElement | undefined>();
  const collapseDelay = 5200;
  const activeTimelineItem = $derived(timelineItems[currentIndex] ?? timelineItems[0]);

  function careerRange(range: string): string {
    return /2025/i.test(range) && /presente|actualidad|present|current/i.test(range)
      ? '2025 – 2026'
      : range;
  }
  let showPdf = $state(false);

  function close() {
    open = false;
    showPdf = false;
  }

  function focusableElements(): HTMLElement[] {
    if (!panelEl) return [];
    return Array.from(
      panelEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
  }

  function onDialogKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
      return;
    }

    if (e.key !== 'Tab') return;
    const focusable = focusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      panelEl?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (e.shiftKey && current === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onBackdropMouseDown(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  function selectTimelineItem(index: number) {
    currentIndex = index;
  }

  function scrollTimelineItemIntoView(index: number) {
    const cards = carouselRef?.querySelectorAll<HTMLElement>('.career-feature-trigger');
    const card = cards?.[index];
    if (!carouselRef || !card) return;
    const cardRect = card.getBoundingClientRect();
    const carouselRect = carouselRef.getBoundingClientRect();
    const offset = cardRect.left - carouselRect.left - (carouselRect.width - cardRect.width) / 2;
    carouselRef.scrollTo({ left: carouselRef.scrollLeft + offset, behavior: 'smooth' });
  }

  $effect(() => {
    if (open) {
      currentIndex = 0;
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.body.style.overflow = 'hidden';
      let observer: IntersectionObserver | undefined;
      requestAnimationFrame(() => {
        panelEl?.focus();
        const root = panelEl?.querySelector('.career-scroll');
        const items = panelEl?.querySelectorAll<HTMLElement>('.career-reveal');
        if (root && items?.length) {
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add('career-reveal--visible');
              });
            },
            { root, threshold: 0.22 }
          );
          items.forEach((item) => observer?.observe(item));
        }
      });
      return () => {
        observer?.disconnect();
        document.body.style.overflow = '';
        previouslyFocused?.focus();
      };
    }
    document.body.style.overflow = '';
  });

  $effect(() => {
    if (!open || timelineItems.length <= 1) return;
    const timer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % timelineItems.length;
    }, collapseDelay);
    return () => window.clearInterval(timer);
  });

  $effect(() => {
    if (!open) return;
    scrollTimelineItemIntoView(currentIndex);
  });
</script>

{#if open}
  <div
    class="career-backdrop"
    role="presentation"
    onmousedown={onBackdropMouseDown}
  >
    <div
      bind:this={panelEl}
      class="career-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-modal-title"
      tabindex="-1"
      onmousedown={(e) => e.stopPropagation()}
      onkeydown={onDialogKeydown}
    >
      <button type="button" class="career-close" onclick={close} aria-label={c.closeAria}>
        <span aria-hidden="true">×</span>
      </button>

      <div class="career-scroll">
        <header class="career-head">
          <span class="career-eyebrow">{narrative.eyebrow}</span>
          <h2 id="career-modal-title" class="career-title">{c.title}</h2>
        </header>

        <section class="career-feature-stage career-reveal career-reveal--visible" aria-labelledby="career-exp">
          <h3 id="career-exp" class="sr-only">{c.expTitle}</h3>
          <div bind:this={carouselRef} class="career-feature-list" aria-label={c.expTitle}>
            {#each timelineItems as item, index (item.range + item.role)}
              <button
                type="button"
                class="career-feature-trigger"
                class:is-active={currentIndex === index}
                onclick={() => selectTimelineItem(index)}
                aria-pressed={currentIndex === index}
                style={`--progress-duration: ${currentIndex === index ? `${collapseDelay}ms` : '0ms'}`}
              >
                <span class="career-feature-node" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span class="career-feature-copy">
                  <span class="career-tl-range">{careerRange(item.range)}</span>
                  <strong>{item.role}</strong>
                </span>
              </button>
            {/each}
          </div>

          {#if activeTimelineItem}
            <article class="career-feature-preview" aria-live="polite">
              <div class="career-preview-art" aria-hidden="true">
                <span class="career-preview-core">{String(currentIndex + 1).padStart(2, '0')}</span>
              </div>
              <div class="career-preview-copy">
                <span class="career-tl-range">{careerRange(activeTimelineItem.range)}</span>
                <h4>{activeTimelineItem.role}</h4>
                <div class="career-tl-desc">
                  {@html activeTimelineItem.descHtml}
                </div>
              </div>
            </article>
          {/if}
        </section>

        <footer class="career-footer career-reveal" aria-labelledby="career-cv-title">
          <div class="career-story-heading">
            <h3 id="career-cv-title" class="career-h3">CV</h3>
            <p>{narrative.pdfIntro}</p>
          </div>
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
    background: rgba(11, 18, 32, 0.56);
    backdrop-filter: blur(14px) saturate(112%);
    -webkit-backdrop-filter: blur(14px) saturate(112%);
    box-sizing: border-box;
    font-family: var(--font-sans);
  }

  .career-panel {
    position: relative;
    width: min(100%, 1040px);
    height: min(88vh, 760px);
    background:
      radial-gradient(circle at 16% 8%, rgba(0, 113, 227, 0.12), transparent 22rem),
      radial-gradient(circle at 88% 0%, rgba(167, 243, 255, 0.18), transparent 24rem),
      linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%);
    border-radius: 8px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    box-shadow:
      0 42px 130px rgba(15, 23, 42, 0.28),
      0 1px 0 rgba(255, 255, 255, 0.9) inset;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    outline: none;
  }

  .career-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 2;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 6px;
    background: rgba(15, 23, 42, 0.045);
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
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
    padding: clamp(1.35rem, 2.6vw, 2.15rem);
    -webkit-overflow-scrolling: touch;
  }

  .career-head {
    max-width: 780px;
    margin-bottom: clamp(1.1rem, 3vh, 1.75rem);
  }

  .career-eyebrow {
    display: block;
    margin-bottom: 0.45rem;
    color: #0071e3;
    font-size: 0.72rem;
    font-weight: 760;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .career-title {
    margin: 0 2.25rem 0 0;
    color: #0f172a;
    font-size: clamp(2.1rem, 4.6vw, 4.15rem);
    font-weight: 900;
    letter-spacing: -0.058em;
    line-height: 0.88;
    text-wrap: balance;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .career-reveal {
    opacity: 0;
    transform: translate3d(0, 28px, 0);
    transition:
      opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .career-reveal--visible {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .career-feature-stage {
    display: grid;
    grid-template-columns: minmax(280px, 0.72fr) minmax(420px, 1fr);
    align-items: stretch;
    gap: clamp(1rem, 2.8vw, 1.6rem);
    min-height: 455px;
    padding-top: clamp(0.5rem, 1.8vh, 1rem);
  }

  .career-feature-list {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    min-width: 0;
  }

  .career-feature-trigger {
    position: relative;
    display: grid;
    grid-template-columns: 3.15rem minmax(0, 1fr);
    gap: 0.9rem;
    width: 100%;
    min-height: 88px;
    padding: 0.78rem 0.82rem;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.58);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
    transition:
      transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .career-feature-trigger:hover,
  .career-feature-trigger:focus-visible,
  .career-feature-trigger.is-active {
    transform: translateX(4px);
    border-color: rgba(0, 113, 227, 0.28);
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 20px 48px rgba(15, 23, 42, 0.1);
    outline: none;
  }

  .career-feature-node {
    position: relative;
    z-index: 1;
    width: 3.15rem;
    height: 3.15rem;
    display: grid;
    place-items: center;
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 6px;
    background: #0f172a;
    color: #f8fafc;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 850;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.14);
    transition:
      transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 360ms cubic-bezier(0.22, 1, 0.36, 1),
      background 360ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .career-feature-trigger.is-active .career-feature-node {
    transform: translateY(-2px);
    border-color: rgba(0, 113, 227, 0.48);
    background: #0066e5;
  }

  .career-feature-copy {
    min-width: 0;
    padding-top: 0.15rem;
  }

  .career-feature-copy strong {
    display: block;
    color: #0f172a;
    font-size: clamp(1.05rem, 1.8vw, 1.35rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.05;
    transition:
      color 260ms ease,
      transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .career-feature-trigger.is-active .career-feature-copy strong {
    color: #0052b8;
    transform: translateX(0.16rem);
  }

  .career-feature-preview {
    position: sticky;
    top: 0;
    align-self: start;
    min-height: 455px;
    display: grid;
    grid-template-rows: 210px minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 8px;
    background:
      radial-gradient(circle at 18% 0%, rgba(0, 113, 227, 0.08), transparent 18rem),
      #ffffff;
    box-shadow:
      0 24px 70px rgba(15, 23, 42, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.86) inset;
  }

  .career-preview-art {
    position: relative;
    min-height: 210px;
    overflow: hidden;
    background:
      radial-gradient(circle at 22% 28%, rgba(77, 163, 255, 0.28), transparent 16rem),
      radial-gradient(circle at 82% 18%, rgba(167, 243, 255, 0.12), transparent 14rem),
      linear-gradient(180deg, #101827 0%, #0b1220 100%);
  }

  .career-preview-art::before,
  .career-preview-art::after {
    content: none;
    display: none;
  }

  .career-preview-art::after {
    top: 4.7rem;
  }

  .career-preview-core {
    position: absolute;
    left: clamp(1.1rem, 4vw, 2.2rem);
    top: clamp(1.15rem, 3vw, 1.7rem);
    width: auto;
    height: auto;
    display: grid;
    min-width: 5.5rem;
    min-height: 4.6rem;
    place-items: center;
    border: 1px solid rgba(248, 250, 252, 0.2);
    border-radius: 6px;
    background: #f8fafc;
    color: #0052b8;
    font-family: var(--font-mono);
    font-size: clamp(1.65rem, 4vw, 2.5rem);
    font-weight: 900;
    letter-spacing: -0.08em;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.26);
  }

  .career-preview-copy {
    padding: clamp(1rem, 2.5vw, 1.35rem);
  }

  .career-preview-copy h4 {
    margin: 0.18rem 0 0.85rem;
    color: #0f172a;
    font-size: clamp(1.45rem, 2.8vw, 2.1rem);
    font-weight: 820;
    letter-spacing: -0.045em;
    line-height: 1;
  }

  .career-h3 {
    margin: 0 0 0.65rem;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #86868b;
  }

  .career-tl-range {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #0071e3;
    margin-bottom: 0.2rem;
  }

  .career-tl-desc {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.62;
    color: #6e6e73;
  }

  .career-tl-desc :global(p) {
    margin: 0 0 0.7rem;
  }

  .career-tl-desc :global(p:last-child) {
    margin-bottom: 0;
  }

  .career-tl-desc :global(strong),
  .career-tl-desc :global(b) {
    color: #334155;
    font-weight: 820;
  }

  .career-footer {
    margin-top: 0;
    padding-top: clamp(2.5rem, 7vh, 4.5rem);
    border-top: 0;
  }

  .career-pdf-toggle {
    display: inline-flex;
    align-items: center;
    min-height: 42px;
    padding: 0.72rem 0.9rem;
    border: 1px solid #0f172a;
    border-radius: 6px;
    background: #0f172a;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #f8fafc;
    cursor: pointer;
    text-decoration: none;
  }

  .career-pdf-toggle:hover {
    background: #005fd6;
    border-color: #005fd6;
    color: #ffffff;
  }

  .career-pdf-wrap {
    margin-top: 1rem;
  }

  .career-pdf-frame {
    width: 100%;
    height: min(48vh, 420px);
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

  :global(html.dark) .career-backdrop {
    background: rgba(0, 0, 0, 0.72);
  }

  :global(html.dark) .career-panel {
    background:
      radial-gradient(circle at 18% 7%, rgba(77, 163, 255, 0.18), transparent 22rem),
      radial-gradient(circle at 92% 0%, rgba(0, 113, 227, 0.1), transparent 24rem),
      linear-gradient(180deg, #101827 0%, #090d14 100%);
    border-color: rgba(125, 183, 255, 0.22);
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.58);
    color: #e5e7eb;
  }

  :global(html.dark) .career-close {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
  }

  :global(html.dark) .career-close:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  :global(html.dark) .career-title,
  :global(html.dark) .career-feature-copy strong,
  :global(html.dark) .career-preview-copy h4 {
    color: #f8fafc;
  }

  :global(html.dark) .career-eyebrow,
  :global(html.dark) .career-tl-range {
    color: #4da3ff;
  }

  :global(html.dark) .career-h3,
  :global(html.dark) .career-pdf-hint {
    color: #a1a1aa;
  }

  :global(html.dark) .career-pdf-toggle {
    background: #f8fafc;
    border-color: #f8fafc;
    color: #0a0a0a;
  }

  :global(html.dark) .career-footer,
  :global(html.dark) .career-pdf-frame {
    border-color: rgba(255, 255, 255, 0.14);
  }

  :global(html.dark) .career-feature-preview,
  :global(html.dark) .career-feature-node {
    border-color: rgba(255, 255, 255, 0.1);
  }

  :global(html.dark) .career-feature-trigger {
    border-color: rgba(148, 163, 184, 0.22);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .career-feature-trigger:hover,
  :global(html.dark) .career-feature-trigger:focus-visible,
  :global(html.dark) .career-feature-trigger.is-active {
    border-color: rgba(125, 183, 255, 0.48);
    background: rgba(77, 163, 255, 0.12);
    box-shadow: 0 22px 56px rgba(0, 0, 0, 0.28);
  }

  :global(html.dark) .career-feature-node {
    background: #f8fafc;
    color: #0a0a0a;
  }

  :global(html.dark) .career-feature-preview {
    background:
      radial-gradient(circle at 18% 0%, rgba(77, 163, 255, 0.14), transparent 18rem),
      #0e141f;
  }

  :global(html.dark) .career-feature-trigger.is-active .career-feature-node {
    background: rgba(77, 163, 255, 0.18);
    border-color: rgba(77, 163, 255, 0.52);
  }

  :global(html.dark) .career-feature-trigger.is-active .career-feature-copy strong {
    color: #4da3ff;
  }

  :global(html.dark) .career-pdf-toggle,
  :global(html.dark) .career-pdf-hint a {
    color: #f5f5f5;
  }

  :global(html.dark) .career-tl-desc,
  :global(html.dark) :global(.career-p) {
    color: #d4d4d8;
  }

  :global(html.dark) .career-tl-desc :global(strong),
  :global(html.dark) :global(.career-p strong) {
    color: #ffffff;
  }

  :global(html.dark) .career-pdf-frame {
    background: #111111;
  }

  @media (max-width: 760px) {
    .career-backdrop {
      padding: 0.75rem;
    }

    .career-panel {
      height: min(92vh, 860px);
      border-radius: 8px;
    }

    .career-feature-stage {
      grid-template-columns: 1fr;
      min-height: 0;
    }

    .career-feature-list {
      flex-direction: row;
      overflow-x: auto;
      gap: 0.75rem;
      width: 100%;
      box-sizing: border-box;
      padding: 0 0.65rem 0.35rem;
      margin-inline: 0;
      scroll-snap-type: x mandatory;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .career-feature-list::-webkit-scrollbar {
      display: none;
    }

    .career-feature-trigger {
      flex: 0 0 min(82vw, 310px);
      min-height: 102px;
      grid-template-columns: 2.75rem minmax(0, 1fr);
      padding: 0.25rem 0.5rem 0.65rem 0;
      scroll-snap-align: center;
    }

    .career-feature-node {
      width: 2.75rem;
      height: 2.75rem;
    }

    .career-feature-preview {
      position: relative;
      min-height: 0;
      grid-template-rows: 140px minmax(0, 1fr);
    }

    .career-preview-art {
      min-height: 140px;
    }
  }

  @media (max-width: 480px) {
    .career-scroll {
      padding: 1.35rem 1.05rem 1.15rem;
    }

    .career-title {
      font-size: 1.45rem;
      line-height: 1.02;
      margin-right: 2.6rem;
    }

    .career-close {
      top: 0.65rem;
      right: 0.65rem;
    }
  }
</style>
