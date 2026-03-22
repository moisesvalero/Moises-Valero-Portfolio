<script lang="ts">
  type QualityPillar = {
    icon: string;
    title: string;
    description: string;
  };

  interface Props {
    meta?: string;
    title?: string;
    items?: QualityPillar[];
  }

  const defaultItems: QualityPillar[] = [
    {
      icon: '🚀',
      title: 'Rendimiento',
      description:
        'Priorizo la velocidad de carga. Menos plugins, más funciones nativas y optimización de activos para conseguir sitios ágiles.'
    },
    {
      icon: '🛡️',
      title: 'Seguridad',
      description:
        'Implementación de protocolos esenciales de endurecimiento (Hardening) y buenas prácticas para proteger la integridad del sitio.'
    },
    {
      icon: '📱',
      title: 'Adaptabilidad',
      description:
        'Desarrollo pensando primero en móviles (Mobile-first), asegurando una experiencia fluida en cualquier dispositivo o resolución.'
    },
    {
      icon: '🤖',
      title: 'Eficiencia IA',
      description:
        'Uso avanzado de herramientas de IA para agilizar el desarrollo, depurar código y asegurar entregas en tiempos competitivos.'
    }
  ];

  let {
    meta = 'MI ESTÁNDAR DE TRABAJO',
    title = 'Compromiso con la Calidad',
    items = defaultItems
  }: Props = $props();
</script>

<section class="garantias-container" id="calidad" aria-labelledby="calidad-titulo">
  <div class="garantias-header">
    <p class="meta-garantias">{meta}</p>
    <h2 id="calidad-titulo">{title}</h2>
  </div>

  <div class="garantias-grid">
    {#each items as item (item.title)}
      <article class="garantia-item">
        <div class="garantia-icon" aria-hidden="true">{item.icon}</div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </article>
    {/each}
  </div>
</section>

<style>
  .garantias-container {
    max-width: 1200px;
    margin: 60px auto;
    padding: 0 20px;
    font-family: inherit;
    scroll-margin-top: 96px;
  }

  .garantias-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .meta-garantias {
    color: #86868b;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
  }

  .garantias-header h2 {
    color: #1d1d1f;
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -1px;
    margin: 0;
  }

  .garantias-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    background: #e2e8f0;
    border: 1px solid #e2e8f0;
  }

  .garantia-item {
    background: #ffffff;
    padding: 30px;
    display: flex;
    flex-direction: column;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    z-index: 1;
  }

  .garantia-item:hover {
    background: #fbfbfd;
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
    z-index: 2;
  }

  .garantia-icon {
    font-size: 32px;
    margin-bottom: 15px;
    transition: transform 0.3s ease;
  }

  .garantia-item:hover .garantia-icon {
    transform: scale(1.1) rotate(-5deg);
  }

  .garantia-item h3 {
    color: #1d1d1f !important;
    font-size: 18px !important;
    font-weight: 700 !important;
    margin-bottom: 10px !important;
  }

  .garantia-item p {
    color: #424245;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }

  @media (min-width: 768px) and (max-width: 1024px) {
    .garantias-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .garantias-header h2 {
      font-size: 32px;
    }
  }

  @media (max-width: 767px) {
    .garantias-container {
      margin: 40px auto;
      scroll-margin-top: 88px;
    }

    .garantias-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
