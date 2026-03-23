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
    Soy <strong>Moisés Valero</strong>. Tras una sólida trayectoria profesional en sectores de alta
    exigencia, he regresado al desarrollo tecnológico con una visión clara: crear soluciones web que no
    solo funcionen, sino que rindan al máximo. Cuento con un
    <strong>Certificado de Profesionalidad de Nivel 3</strong> y una formación actualizada en el stack
    más moderno.
  </p>
  <p>
    Me especializo en <strong>WordPress</strong>, <strong>SvelteKit</strong> y <strong>SEO Técnico</strong>,
    enfocándome en el rendimiento (performance), la seguridad y el mantenimiento eficiente. Utilizo la
    <strong>IA generativa</strong> como una herramienta estratégica para acelerar el desarrollo y
    garantizar resultados sólidos en menos tiempo.
  </p>
  <p>
    Mi objetivo es aportar mi experiencia y capacidad de resolución a una empresa donde pueda crecer, o
    colaborar en proyectos freelance que necesiten un soporte técnico de confianza en la zona de
    <strong>Alcoy</strong> y <strong>Alicante</strong>. Si buscas compromiso, madurez y dominio técnico,
    hablemos.
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

  @media (max-width: 768px) {
    .sobre-mi-minimal {
      margin: 48px auto;
      padding: 0 20px;
      scroll-margin-top: 96px;
    }

    .meta-sobre {
      font-size: 11px;
      letter-spacing: 0.12em;
    }

    .col-texto h2 {
      font-size: 28px !important;
      letter-spacing: -0.04em;
      margin: 0 0 14px 0 !important;
    }

    .texto-contenido :global(p) {
      font-size: 15px;
      line-height: 1.55;
      margin-bottom: 14px;
      text-align: left;
    }

    .sobre-mi-flex {
      text-align: left;
      align-items: flex-start;
    }

    .col-foto {
      align-self: center;
    }
  }
</style>
