<script lang="ts">
  import { locale } from '$lib/i18n/index.js';
  import CardFluidOverlay from '$lib/components/portfolio/CardFluidOverlay.svelte';

  type ServiceItem = {
    icon: string;
    title: string;
    description: string;
  };

  interface Props {
    meta?: string;
    title?: string;
    items?: ServiceItem[];
  }

  const defaultItems: ServiceItem[] = [
    {
      icon: '🛒',
      title: 'E-commerce',
      description:
        'Tiendas online con WordPress y WooCommerce diseñadas para convertir visitas en clientes. Priorizo la velocidad de carga, la seguridad en las transacciones y una gestión de inventario que te ahorre tiempo.'
    },
    {
      icon: '🌐',
      title: 'Desarrollo Web',
      description:
        'Creo sitios web optimizados con arquitecturas ligeras para un SEO imbatible. Combino el poder de SvelteKit para aplicaciones a medida con la flexibilidad de WordPress, utilizando IA para entregar resultados en tiempo récord.'
    },
    {
      icon: '⚙️',
      title: 'Soporte Técnico IT',
      description:
        'Me encargo de que tu infraestructura nunca falle: redes, hardware, hosting y configuración de correos. Aporto soluciones rápidas a incidencias y mantenimiento preventivo para que tu empresa no se detenga.'
    }
  ];

  let {
    meta = 'MIS ESPECIALIDADES',
    title = 'Soluciones Web de Alto Rendimiento',
    items = defaultItems
  }: Props = $props();

  const designLandingLabel = $derived(
    $locale === 'en' ? 'View web design service' : 'Ver servicio de diseño web'
  );

  function isWebDesignService(titleText: string): boolean {
    const normalized = titleText.trim().toLowerCase();
    return normalized === 'desarrollo web' || normalized === 'web development';
  }
</script>

<section class="servicios-grid-container" id="servicios" aria-labelledby="servicios-titulo">
  <div class="servicios-header">
    <p class="meta-servicios">{meta}</p>
    <h2 id="servicios-titulo">{title}</h2>
  </div>

  <div class="servicios-flex">
    {#each items as item (item.title)}
      <article class="card-servicio">
        <CardFluidOverlay />
        <div class="icono-wrap" aria-hidden="true">{item.icon}</div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {#if isWebDesignService(item.title)}
          <a href="/diseno-web" class="service-cta-link" data-sveltekit-reload="true">{designLandingLabel}</a>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .servicios-grid-container {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 20px;
    font-family: inherit;
    scroll-margin-top: 96px;
  }

  .servicios-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .meta-servicios {
    color: #86868b;
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: 1.5px;
    margin-bottom: 10px;
  }

  .servicios-header h2 {
    color: #1d1d1f !important;
    font-size: 42px !important;
    font-weight: 800 !important;
    letter-spacing: -1px;
  }

  .servicios-flex {
    display: flex;
    gap: 30px;
    justify-content: center;
  }

  .card-servicio {
    flex: 1;
    min-width: 0;
    background: #ffffff;
    padding: 40px;
    border: 1px solid #f1f5f9;
    border-radius: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .card-servicio:hover {
    border-color: #0071e3;
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  }

  .icono-wrap {
    font-size: 40px;
    margin-bottom: 25px;
    transition: transform 0.3s ease;
  }

  .card-servicio:hover .icono-wrap {
    transform: scale(1.1) rotate(-5deg);
  }

  .card-servicio h3 {
    color: #1d1d1f !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    margin-bottom: 15px !important;
  }

  .card-servicio p {
    color: #424245;
    font-size: 16.5px;
    line-height: 1.58;
    margin: 0;
  }

  .service-cta-link {
    display: inline-flex;
    margin-top: 16px;
    color: #0071e3;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: -0.01em;
  }

  .service-cta-link:hover {
    color: #005bb5;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 992px) {
    .servicios-grid-container {
      scroll-margin-top: 88px;
    }

    .servicios-flex {
      flex-direction: column;
    }

    .card-servicio {
      padding: 30px;
    }

    .servicios-header h2 {
      font-size: 32px !important;
    }
  }
</style>
