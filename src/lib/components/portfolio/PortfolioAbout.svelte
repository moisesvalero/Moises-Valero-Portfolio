<script lang="ts">
  interface Props {
    imageSrc?: string;
    imageAlt?: string;
    meta?: string;
    title?: string;
    /** HTML del cuerpo (contenido tuyo desde Sanity o por defecto). */
    aboutHtml?: string;
  }

  const defaultAboutHtml = `<p>
    Soy <strong>Moisés Valero</strong>, desarrollador web especializado en
    <strong>WordPress, SvelteKit y soporte técnico</strong>. Tras una etapa profesional en otros
    sectores, he regresado al ámbito tecnológico con formación actualizada y un enfoque centrado en
    <strong>rendimiento, seguridad y mantenimiento eficiente</strong>.
  </p>
  <p>
    He incorporado SvelteKit a mi stack para desarrollar aplicaciones modernas, rápidas y con
    arquitecturas flexibles. Trabajo con estructuras claras, soluciones ligeras y procesos bien
    organizados. Utilizo <strong>IA como apoyo</strong> para acelerar tareas y mejorar la calidad del
    desarrollo.
  </p>
  <p>
    Busco incorporarme a una <strong>empresa</strong> donde pueda aportar desde el primer día,
    seguir aprendiendo y crecer profesionalmente. Mientras tanto, también estoy disponible para
    <strong>proyectos freelance</strong> de desarrollo, optimización o mantenimiento web.
  </p>`;

  let {
    imageSrc = '/imagenes/Moises-Valero-Sanchez.png',
    imageAlt = 'Moisés Valero - Desarrollador WordPress',
    meta = 'UN POCO DE MI HISTORIA',
    title = 'Sobre mí',
    aboutHtml = defaultAboutHtml
  }: Props = $props();
</script>

<section class="sobre-mi-minimal" id="sobre" aria-labelledby="sobre-titulo">
  <div class="sobre-mi-flex">
    <div class="col-foto anim-sobre-mi-foto">
      <div class="foto-wrapper">
        <img src={imageSrc} alt={imageAlt} width="300" height="350" loading="lazy" decoding="async" />
      </div>
    </div>

    <div class="col-texto anim-sobre-mi-texto">
      <p class="meta-sobre">{meta}</p>
      <h2 id="sobre-titulo">{title}</h2>
      <div class="texto-contenido">{@html aboutHtml}</div>
    </div>
  </div>
</section>

<style>
  .sobre-mi-minimal {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 40px;
    font-family: inherit;
    overflow: hidden;
    scroll-margin-top: 96px;
  }

  .sobre-mi-flex {
    display: flex;
    align-items: center;
    gap: 60px;
  }

  .col-foto {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .foto-wrapper {
    width: 300px;
    height: 350px;
    overflow: hidden;
    transition: transform 0.5s ease-out;
  }

  .foto-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    border: 1px solid #e2e8f0;
  }

  .col-texto {
    flex: 1.5;
  }

  .meta-sobre {
    color: #86868b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .col-texto h2 {
    color: #1d1d1f !important;
    font-size: 44px !important;
    font-weight: 800 !important;
    margin: 0 0 20px 0 !important;
    letter-spacing: -1.5px;
  }

  .texto-contenido :global(p) {
    color: #424245;
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 18px;
  }

  .texto-contenido :global(strong) {
    color: #1d1d1f;
    font-weight: 600;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .anim-sobre-mi-foto,
  .anim-sobre-mi-texto {
    animation: fadeInUp 1s ease-out forwards;
    animation-timeline: view();
    animation-range: entry 10% cover 40%;
  }

  @media (max-width: 992px) {
    .sobre-mi-minimal {
      scroll-margin-top: 88px;
    }

    .sobre-mi-flex {
      flex-direction: column;
      text-align: center;
    }

    .foto-wrapper {
      width: 100%;
      max-width: 280px;
      height: 300px;
    }
  }
</style>
