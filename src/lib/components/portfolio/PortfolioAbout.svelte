<script lang="ts">
  import { sanityDefaultSrc, sanityImageSrcSet } from '$lib/sanity-image-url';

  interface Props {
    imageSrc?: string;
    imageAlt?: string;
    meta?: string;
    title?: string;
    /** HTML del cuerpo (contenido tuyo desde Sanity o por defecto). */
    aboutHtml?: string;
  }

  const defaultAboutHtml = `<p>Soy <strong>Moisés Valero</strong>. Tras años en el sector industrial, regresé al desarrollo tecnológico con una visión clara: construir páginas web, aplicaciones y soluciones digitales eficientes, resolutivas y orientadas al usuario.</p>
  <p>Me especializo en metodologías de <strong>AI-Driven Development</strong> y <strong>Spec-Driven Development (SDD)</strong> para diseñar arquitecturas de software y conectar soluciones con total autonomía. Mi stack principal está enfocado en <strong>SvelteKit</strong>, <strong>Supabase</strong>, <strong>Tailwind CSS</strong> y APIs de IA (<strong>Gemini</strong>, <strong>OpenAI</strong>, <strong>Anthropic</strong>, <strong>Fal.ai</strong>), además de la gestión y mantenimiento de <strong>WordPress</strong>.</p>
  <p>Estoy en <strong>Alcoy (Alicante)</strong> y busco incorporarme a equipos de desarrollo (remoto, híbrido o presencial). Si buscas madurez, capacidad de resolución y dominio de las herramientas del futuro, hablemos.</p>`;

  let {
    imageSrc = '/imagenes/Moises-Valero-Sanchez.png',
    imageAlt = 'Moisés Valero - Desarrollador WordPress',
    meta = 'UN POCO DE MI HISTORIA',
    title = 'Sobre mí',
    aboutHtml = defaultAboutHtml
  }: Props = $props();

  const aboutPhotoWidths = [320, 480, 600, 720, 900] as const;
  const aboutPhotoSrc = $derived(sanityDefaultSrc(imageSrc, 600));
  const aboutPhotoSrcSet = $derived(sanityImageSrcSet(imageSrc, aboutPhotoWidths));
</script>

<section class="sobre-mi-minimal" id="sobre" aria-labelledby="sobre-titulo">
  <div class="sobre-mi-flex">
    <div class="col-foto anim-sobre-mi-foto">
      <div class="foto-wrapper">
        <img
          src={aboutPhotoSrc}
          srcset={aboutPhotoSrcSet}
          alt={imageAlt}
          width="300"
          height="350"
          sizes="(max-width: 992px) min(280px, 92vw), 300px"
          loading="lazy"
          decoding="async"
        />
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
    margin: 52px auto 112px;
    padding: 0 40px;
    font-family: inherit;
    overflow: hidden;
    scroll-margin-top: 96px;
  }

  .sobre-mi-flex {
    display: flex;
    align-items: center;
    gap: clamp(58px, 7vw, 92px);
    min-width: 0;
  }

  .col-foto {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
  }

  .foto-wrapper {
    position: relative;
    width: 300px;
    height: 350px;
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.14);
    box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
    transition: transform 0.5s ease-out;
  }

  .foto-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    border: 0;
  }

  .col-texto {
    flex: 1.5;
    min-width: 0;
  }

  .meta-sobre {
    color: #0071e3;
    font-size: 12.5px;
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
    font-size: 18.5px;
    line-height: 1.58;
    margin-bottom: 18px;
  }

  .texto-contenido :global(strong) {
    color: #1d1d1f;
    font-weight: 760;
  }

  :global(html.dark) .foto-wrapper {
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.34);
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
      margin: clamp(1.35rem, 4.5vh, 2.75rem) auto 72px;
      padding: 0 20px;
      scroll-margin-top: 96px;
    }

    .meta-sobre {
      font-size: 11.5px;
      letter-spacing: 0.12em;
    }

    .col-texto h2 {
      font-size: 28px !important;
      letter-spacing: -0.04em;
      margin: 0 0 14px 0 !important;
    }

    .texto-contenido :global(p) {
      font-size: 15.5px;
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
