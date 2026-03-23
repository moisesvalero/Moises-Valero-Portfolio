<script lang="ts">
  import { sitePortfolioDefaults } from '$lib/data/site-portfolio-defaults';
  import type { SiteProjectCard } from '$lib/types/site-portfolio';

  interface Props {
    meta?: string;
    title?: string;
    projects?: SiteProjectCard[];
  }

  let {
    meta = sitePortfolioDefaults.projects.meta,
    title = sitePortfolioDefaults.projects.title,
    projects = sitePortfolioDefaults.projects.projects
  }: Props = $props();
</script>

<section class="proyectos-container" id="proyectos" aria-labelledby="proyectos-titulo">
  <div class="proyectos-header">
    <p class="meta-proyectos">{meta}</p>
    <h2 id="proyectos-titulo">{title}</h2>
  </div>

  <div class="proyectos-grid">
    {#each projects as project (project.title + project.href)}
      <article class="proyecto-card">
        <div class="proyecto-imagen">
          <img
            src={project.imageSrc}
            alt={project.imageAlt}
            width="800"
            height="450"
            loading="lazy"
            decoding="async"
          />
          <div class="proyecto-overlay">
            <a
              href={project.href}
              class="btn-visitar"
              target={project.external ? '_blank' : undefined}
              rel={project.external ? 'noopener noreferrer' : undefined}
            >
              {project.linkLabel} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div class="proyecto-info">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div class="proyecto-tags">
            {#each project.tags as tag (tag)}
              <span>{tag}</span>
            {/each}
          </div>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .proyectos-container {
    max-width: 1200px;
    margin: 100px auto;
    padding: 0 20px;
    font-family: inherit;
    scroll-margin-top: 96px;
  }

  .proyectos-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .meta-proyectos {
    color: #86868b;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
  }

  .proyectos-header h2 {
    color: #1d1d1f;
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -1.5px;
  }

  .proyectos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
    gap: 40px;
  }

  .proyecto-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 0;
    overflow: hidden;
    transition: all 0.4s ease;
  }

  .proyecto-imagen {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #fbfbfd;
  }

  .proyecto-imagen img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .proyecto-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(29, 29, 31, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .proyecto-card:hover .proyecto-overlay,
  .proyecto-card:focus-within .proyecto-overlay {
    opacity: 1;
  }

  .proyecto-card:hover .proyecto-imagen img,
  .proyecto-card:focus-within .proyecto-imagen img {
    transform: scale(1.05);
  }

  .proyecto-card:hover {
    border-color: #0071e3;
    transform: translateY(-5px);
  }

  .proyecto-card:focus-within {
    border-color: #0071e3;
    transform: translateY(-5px);
  }

  .btn-visitar {
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    padding: 12px 25px;
    border: 1px solid #0071e3;
    transition: all 0.3s ease;
    text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);
  }

  .btn-visitar:hover {
    background: #0071e3;
    color: #ffffff !important;
    border-color: #0071e3;
    text-shadow: none;
  }

  .proyecto-info {
    padding: 30px;
  }

  .proyecto-info h3 {
    color: #1d1d1f;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .proyecto-info p {
    color: #424245;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
    height: 75px;
    overflow: hidden;
  }

  .proyecto-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .proyecto-tags span {
    background: #f2f2f7;
    color: #1d1d1f;
    font-size: 12px;
    padding: 5px 12px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .proyectos-container {
      scroll-margin-top: 88px;
    }

    .proyectos-grid {
      grid-template-columns: 1fr;
    }

    .proyecto-info p {
      font-size: 11px !important;
      line-height: 1.4 !important;
      height: auto !important;
      max-height: 85px !important;
      margin-bottom: 15px !important;
    }

    .proyecto-info h3 {
      font-size: 20px !important;
    }
  }
</style>
