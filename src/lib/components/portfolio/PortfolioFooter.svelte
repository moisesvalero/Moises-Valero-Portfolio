<script lang="ts">
  import { t } from '$lib/i18n/index.js';
  import { openCookiePreferences } from '$lib/cookie-consent';

  interface Props {
    /** Sustituye `{{year}}` por el año actual (útil con Sanity). */
    copyrightTemplate?: string;
    githubHref?: string;
    linkedinHref?: string;
    maltHref?: string;
    emailHref?: string;
  }

  const year = new Date().getFullYear();

  let {
    copyrightTemplate =
      'Servicios Web: One Page, Web Profesional, E-commerce y Mantenimiento | SEO Local en Alcoy (Alicante) | Disponible para proyectos en remoto y presenciales. Moisés Valero © {{year}} | Especialista en SvelteKit, WordPress y Sanity CMS.',
    githubHref = 'https://github.com/moisesvalero',
    linkedinHref = 'https://www.linkedin.com/in/moisesvalero',
    maltHref = 'https://www.malt.es/profile/moisesvalerosanchez',
    emailHref = 'mailto:info@moisesvalero.es'
  }: Props = $props();

  const copyrightText = $derived(copyrightTemplate.replace(/\{\{year\}\}/g, String(year)));
  const footerParts = $derived(
    (() => {
      const parts = copyrightText
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length <= 3) {
        return parts;
      }

      const tertiary = parts.pop() ?? '';
      const secondary = parts.pop() ?? '';
      const primary = parts.join(' | ');
      return [primary, secondary, tertiary];
    })()
  );
</script>

<footer class="footer-custom">
  <div class="footer-copy">
    <p class="footer-primary">{footerParts[0] ?? ''}</p>
    {#if footerParts[1]}
      <p class="footer-secondary">{footerParts[1]}</p>
    {/if}
    {#if footerParts[2]}
      <p class="footer-tertiary">{footerParts[2]}</p>
    {/if}
  </div>

  <nav class="footer-legal" aria-label="Legal">
    <a href="/privacidad">{$t('legalFooter.privacy')}</a>
    <span class="footer-dot" aria-hidden="true">·</span>
    <a href="/cookies">{$t('legalFooter.cookies')}</a>
    <span class="footer-dot" aria-hidden="true">·</span>
    <button type="button" class="footer-legal-btn" onclick={() => openCookiePreferences()}>
      {$t('legalFooter.preferences')}
    </button>
    <span class="footer-dot" aria-hidden="true">·</span>
    <a href="/diseno-web-alcoy" class="footer-landing-link">Diseño web en Alcoy</a>
    <span class="footer-dot" aria-hidden="true">·</span>
    <a href="/diseno-web-alcoy/articulos" class="footer-landing-link">Artículos</a>
    <span class="footer-dot" aria-hidden="true">·</span>
    <a
      href="https://moisesvalero.es"
      class="footer-portfolio-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      Portfolio
    </a>
  </nav>

  <div class="footer-icons">
    <a href={githubHref} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
        />
      </svg>
    </a>

    <a href={linkedinHref} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      </svg>
    </a>

    <a
      href={maltHref}
      class="footer-malt"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Malt"
    >
      <span class="footer-malt-icon" aria-hidden="true"></span>
    </a>

    <a href={emailHref} aria-label="Email">
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    </a>
  </div>
</footer>

<style>
  .footer-custom {
    text-align: center;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    padding: 42px 20px 48px;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    border-top: 1px solid #e2e8f0;
  }

  .footer-copy {
    max-width: 1100px;
    margin: 0 auto 24px;
    padding: 0 16px;
  }

  .footer-legal {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
    margin: 0 auto 28px;
    max-width: 1100px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 600;
  }

  .footer-legal a {
    color: #64748b;
    text-decoration: none;
  }

  .footer-landing-link,
  .footer-portfolio-link {
    color: #64748b !important;
    font-weight: 500;
  }

  .footer-landing-link:hover,
  .footer-portfolio-link:hover {
    color: #334155 !important;
    text-decoration: none;
  }

  .footer-legal a:hover {
    color: #334155;
    text-decoration: none;
  }

  .footer-dot {
    color: #94a3b8;
    user-select: none;
  }

  .footer-legal-btn {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    text-decoration: none;
  }

  .footer-legal-btn:hover {
    color: #334155;
  }

  .footer-primary,
  .footer-secondary,
  .footer-tertiary {
    margin: 0;
    line-height: 1.65;
  }

  .footer-primary {
    color: #0f172a;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1px;
  }

  .footer-secondary {
    color: #475569;
    font-size: 13px;
    margin-top: 6px;
    font-weight: 500;
  }

  .footer-tertiary {
    color: #2563eb;
    font-size: 13px;
    margin-top: 6px;
    font-weight: 600;
  }

  .footer-icons {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .footer-icons a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #475569;
    transition: all 0.3s ease;
    text-decoration: none;
  }

  .footer-icons a:hover {
    background-color: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
  }

  .footer-icons svg {
    width: 20px;
    height: 20px;
  }

  /* Logo de /imagenes/malt-svgrepo-com.svg teñido con el color del enlace (como fill currentColor) */
  .footer-malt-icon {
    display: block;
    width: 22px;
    height: 22px;
    background-color: currentColor;
    mask: url('/imagenes/malt-svgrepo-com.svg') no-repeat center / contain;
    -webkit-mask: url('/imagenes/malt-svgrepo-com.svg') no-repeat center / contain;
  }

  @media (max-width: 768px) {
    .footer-custom {
      padding-top: 34px;
    }

    .footer-copy {
      padding: 0 14px;
      margin-bottom: 26px;
    }

    .footer-primary,
    .footer-secondary,
    .footer-tertiary {
      font-size: 12px;
      line-height: 1.7;
    }

    .footer-icons {
      gap: 16px;
    }

    .footer-icons a {
      width: 44px;
      height: 44px;
    }

    .footer-icons svg {
      width: 18px;
      height: 18px;
    }

    .footer-malt-icon {
      width: 20px;
      height: 20px;
    }
  }
</style>
