<script lang="ts">
  type StackIcon = {
    src: string;
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
      title: 'Maquetación y Estructura',
      icons: [
        { src: '/imagenes/svelte.svg', alt: 'SvelteKit', title: 'SvelteKit' },
        { src: '/imagenes/html5.svg', alt: 'HTML5', title: 'HTML5' },
        { src: '/imagenes/css.svg', alt: 'CSS3', title: 'CSS3' },
        {
          src: '/imagenes/tailwindcss.svg',
          alt: 'Tailwind CSS',
          title: 'Tailwind CSS'
        }
      ]
    },
    {
      title: 'Ecosistema WordPress',
      icons: [
        { src: '/imagenes/wordpress.svg', alt: 'WordPress', title: 'WordPress' },
        { src: '/imagenes/elementor.svg', alt: 'Elementor', title: 'Elementor' },
        { src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
        { src: '/imagenes/localwp.svg', alt: 'Local WP', title: 'Local WP' }
      ]
    },
    {
      title: 'Flujo de Trabajo e IA',
      icons: [
        { src: '/imagenes/cursor_light.svg', alt: 'Cursor AI', title: 'Cursor AI' },
        {
          src: '/imagenes/claude-ai-icon.svg',
          alt: 'Claude AI',
          title: 'Claude AI'
        },
        { src: '/imagenes/cloudflare.svg', alt: 'Cloudflare', title: 'Cloudflare' },
        { src: '/imagenes/github.svg', alt: 'GitHub', title: 'GitHub' }
      ]
    }
  ];

  let {
    meta = 'TECNOLOGÍAS Y HERRAMIENTAS',
    title = 'Mi Stack Tecnológico',
    categories = defaultCategories
  }: Props = $props();
</script>

<section class="stack-container" id="stack" aria-labelledby="stack-titulo">
  <div class="stack-header">
    <p class="meta-stack">{meta}</p>
    <h2 id="stack-titulo">{title}</h2>
  </div>

  <div class="stack-grid">
    {#each categories as cat (cat.title)}
      <div class="stack-cat">
        <p class="cat-title">{cat.title}</p>
        <div class="iconos-flex">
          {#each cat.icons as icon (icon.src + icon.alt)}
            <div class="item-stack">
              <img
                src={icon.src}
                alt={icon.alt}
                title={icon.title ?? icon.alt}
                width="40"
                height="40"
                loading="lazy"
                decoding="async"
              />
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
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
  }

  .stack-cat {
    background: #fbfbfd;
    padding: 30px;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
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
    grid-template-columns: repeat(4, 60px);
    gap: 12px;
    justify-content: start;
  }

  .item-stack {
    width: 60px;
    height: 60px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .item-stack img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: grayscale(100%);
    opacity: 0.7;
  }

  .item-stack:hover {
    border-color: #0071e3;
    transform: translateY(-3px);
  }

  .item-stack:hover img {
    filter: grayscale(0%);
    opacity: 1;
  }

  @media (max-width: 1024px) {
    .stack-container {
      scroll-margin-top: 88px;
    }

    .stack-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .stack-cat {
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
    }

    .iconos-flex {
      grid-template-columns: repeat(4, 60px);
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .stack-header h2 {
      font-size: 28px;
    }
  }
</style>
