<script lang="ts">
  import CardFluidOverlay from '$lib/components/portfolio/CardFluidOverlay.svelte';

  type StackIcon = {
    src?: string;
    iconify?: string;
    alt: string;
    title?: string;
  };

  type StackCategory = {
    title: string;
    icons: StackIcon[];
  };

  interface Props {
    meta?: string;
    title?: string;
    categories?: StackCategory[];
  }

  const defaultCategories: StackCategory[] = [
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
        { src: '/imagenes/codex-color.svg', alt: 'OpenAI Codex', title: 'OpenAI Codex' },
        { src: '/imagenes/opencode.svg', alt: 'OpenCode', title: 'OpenCode' },
        { src: '/imagenes/antigravity.svg', alt: 'Antigravity', title: 'Google Antigravity' }
      ]
    }
  ];

  let {
    meta = 'TECNOLOGÍAS Y HERRAMIENTAS',
    title = 'Mi Stack Tecnológico',
    categories = defaultCategories
  }: Props = $props();

  function iconifySvgUrl(name: string): string {
    return `https://api.iconify.design/${encodeURIComponent(name)}.svg`;
  }
</script>

<section class="stack-container" id="stack" aria-labelledby="stack-titulo">
  <div class="stack-header">
    <p class="meta-stack">{meta}</p>
    <h2 id="stack-titulo">{title}</h2>
  </div>

  <div class="stack-grid">
    {#each categories as cat (cat.title)}
      <div class="stack-cat">
        <CardFluidOverlay radius={260} blur={36} />
        <p class="cat-title">{cat.title}</p>
        <div class="iconos-flex">
          {#each cat.icons as icon ((icon.iconify ?? icon.src ?? '') + icon.alt)}
            <div class="item-stack" class:is-woocommerce={icon.alt === 'WooCommerce'}>
              {#if icon.iconify}
                <img
                  src={iconifySvgUrl(icon.iconify)}
                  alt={icon.alt}
                  title={icon.title ?? icon.alt}
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                />
              {:else if icon.src}
                <img
                  src={icon.src}
                  alt={icon.alt}
                  title={icon.title ?? icon.alt}
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .stack-container {
    max-width: 1200px;
    margin: 60px auto;
    padding: 0 20px;
    scroll-margin-top: 96px;
  }

  .stack-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .meta-stack {
    color: #86868b;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
  }

  .stack-header h2 {
    color: #1d1d1f;
    font-size: 38px;
    font-weight: 800;
  }

  .stack-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 25px;
  }

  .stack-cat {
    background: #fbfbfd;
    padding: 30px;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    min-width: 0;
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .cat-title {
    color: #1d1d1f;
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 20px;
    border-bottom: 2px solid #0071e3;
    display: inline-block;
  }

  .iconos-flex {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    justify-items: center;
    align-items: center;
  }

  .item-stack {
    width: 72px;
    height: 72px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 12px;
    transition: all 0.25s ease;
    box-sizing: border-box;
  }

  .item-stack img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(20%);
    opacity: 0.92;
  }

  .item-stack:hover {
    border-color: #0071e3;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 113, 227, 0.12);
  }

  .item-stack:hover img {
    filter: grayscale(0%);
    opacity: 1;
  }

  .item-stack.is-woocommerce img {
    width: 120%;
  }

  /* Tablet / iPad horizontal: 3 columnas estrechas rompían la fila de 4 iconos */
  @media (max-width: 1199px) {
    .stack-container {
      scroll-margin-top: 88px;
    }

    .stack-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

    .stack-cat {
      padding: 22px;
      margin: 0;
      max-width: none;
    }
  }

  @media (max-width: 768px) {
    .stack-grid {
      grid-template-columns: 1fr;
    }

    .stack-cat {
      padding: 20px;
    }

    .item-stack {
      width: 68px;
      height: 68px;
      padding: 10px;
    }
  }

  @media (max-width: 480px) {
    .stack-header h2 {
      font-size: 28px;
    }

    .iconos-flex {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .item-stack {
      width: 64px;
      height: 64px;
      padding: 8px;
    }
  }
</style>
