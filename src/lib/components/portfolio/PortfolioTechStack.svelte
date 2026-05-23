<script lang="ts">
  import type { Component } from 'svelte';
  import { LogoCarousel } from '$lib/motion-core';
  import AntigravityLogo from './tech-logos/AntigravityLogo.svelte';
  import ClaudeLogo from './tech-logos/ClaudeLogo.svelte';
  import CloudflareLogo from './tech-logos/CloudflareLogo.svelte';
  import CodexLogo from './tech-logos/CodexLogo.svelte';
  import Css3Logo from './tech-logos/Css3Logo.svelte';
  import CursorLogo from './tech-logos/CursorLogo.svelte';
  import ElementorLogo from './tech-logos/ElementorLogo.svelte';
  import GeminiLogo from './tech-logos/GeminiLogo.svelte';
  import GitHubLogo from './tech-logos/GitHubLogo.svelte';
  import Html5Logo from './tech-logos/Html5Logo.svelte';
  import JavaScriptLogo from './tech-logos/JavaScriptLogo.svelte';
  import KadenceLogo from './tech-logos/KadenceLogo.svelte';
  import OpenAiLogo from './tech-logos/OpenAiLogo.svelte';
  import OpenCodeLogo from './tech-logos/OpenCodeLogo.svelte';
  import PwaLogo from './tech-logos/PwaLogo.svelte';
  import SanityLogo from './tech-logos/SanityLogo.svelte';
  import StripeLogo from './tech-logos/StripeLogo.svelte';
  import SupabaseLogo from './tech-logos/SupabaseLogo.svelte';
  import SvelteKitLogo from './tech-logos/SvelteKitLogo.svelte';
  import TailwindLogo from './tech-logos/TailwindLogo.svelte';
  import TypeScriptLogo from './tech-logos/TypeScriptLogo.svelte';
  import VercelLogo from './tech-logos/VercelLogo.svelte';
  import ViteLogo from './tech-logos/ViteLogo.svelte';
  import WordPressLogo from './tech-logos/WordPressLogo.svelte';

  type StackIcon = {
    src?: string;
    devicon?: string;
    iconify?: string;
    alt: string;
    title?: string;
  };

  type StackCategory = {
    title: string;
    icons: StackIcon[];
  };

  type Logo = {
    name: string;
    id: number;
    component: Component;
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
        { devicon: 'typescript/typescript-original.svg', alt: 'TypeScript', title: 'TypeScript' },
        { devicon: 'javascript/javascript-original.svg', alt: 'JavaScript', title: 'JavaScript (ES6+)' },
        { devicon: 'html5/html5-original.svg', alt: 'HTML5', title: 'HTML5' },
        { devicon: 'css3/css3-original.svg', alt: 'CSS3', title: 'CSS3' }
      ]
    },
    {
      title: 'Frameworks y Librerías',
      icons: [
        { devicon: 'svelte/svelte-original.svg', alt: 'SvelteKit', title: 'SvelteKit / Svelte 5' },
        { devicon: 'tailwindcss/tailwindcss-original.svg', alt: 'Tailwind CSS', title: 'Tailwind CSS' },
        { devicon: 'vitejs/vitejs-original.svg', alt: 'Vite', title: 'Vite' },
        { iconify: 'logos:pwa', alt: 'PWA', title: 'Progressive Web Apps' }
      ]
    },
    {
      title: 'Backend e Infraestructura',
      icons: [
        { devicon: 'supabase/supabase-original.svg', alt: 'Supabase', title: 'Supabase (PostgreSQL)' },
        { devicon: 'vercel/vercel-original.svg', alt: 'Vercel', title: 'Vercel' },
        { devicon: 'cloudflare/cloudflare-original.svg', alt: 'Cloudflare', title: 'Cloudflare' },
        { devicon: 'github/github-original.svg', alt: 'GitHub', title: 'GitHub' }
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
        { devicon: 'wordpress/wordpress-plain.svg', alt: 'WordPress', title: 'WordPress' },
        { src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
        { src: '/imagenes/elementor.svg', alt: 'Elementor', title: 'Elementor' },
        { devicon: 'sanity/sanity-original.svg', alt: 'Sanity', title: 'Sanity.io' }
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

  const logoComponents: Partial<Record<string, Component>> = {
    Antigravity: AntigravityLogo,
    Claude: ClaudeLogo,
    Cloudflare: CloudflareLogo,
    CSS3: Css3Logo,
    Cursor: CursorLogo,
    Elementor: ElementorLogo,
    Gemini: GeminiLogo,
    GitHub: GitHubLogo,
    HTML5: Html5Logo,
    JavaScript: JavaScriptLogo,
    Kadence: KadenceLogo,
    OpenAI: OpenAiLogo,
    'OpenAI Codex': CodexLogo,
    OpenCode: OpenCodeLogo,
    PWA: PwaLogo,
    Sanity: SanityLogo,
    Stripe: StripeLogo,
    Supabase: SupabaseLogo,
    SvelteKit: SvelteKitLogo,
    'Tailwind CSS': TailwindLogo,
    TypeScript: TypeScriptLogo,
    Vercel: VercelLogo,
    Vite: ViteLogo,
    WordPress: WordPressLogo
  };

  let {
    meta = 'TECNOLOGÍAS Y HERRAMIENTAS',
    title = 'Mi Stack Tecnológico',
    categories = defaultCategories
  }: Props = $props();

  const logos: Logo[] = $derived(
    categories.flatMap((category, categoryIndex) =>
      category.icons.flatMap((icon, iconIndex) => {
        const component = logoComponents[icon.alt];

        return component
          ? [
              {
                name: icon.title ?? icon.alt,
                id: categoryIndex * 100 + iconIndex,
                component
              }
            ]
          : [];
      })
    )
  );
</script>

<section class="stack-container" id="stack" aria-labelledby="stack-titulo">
  <div class="stack-header">
    <p class="meta-stack">{meta}</p>
    <h2 id="stack-titulo">{title}</h2>
  </div>

  <div class="carousel-stage" aria-label="Tecnologías y herramientas">
    <LogoCarousel logos={logos} columnCount={4} cycleInterval={1800} />
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

  .carousel-stage {
    position: relative;
    display: flex;
    min-height: 320px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid rgba(226, 232, 240, 0.74);
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.7)),
      radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.11), transparent 48%);
  }

  .carousel-stage::before,
  .carousel-stage::after {
    content: '';
    position: absolute;
    inset-block: 0;
    z-index: 1;
    width: 16%;
    pointer-events: none;
  }

  .carousel-stage::before {
    left: 0;
    background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0));
  }

  .carousel-stage::after {
    right: 0;
    background: linear-gradient(270deg, #fff, rgba(255, 255, 255, 0));
  }

  .carousel-stage :global(.flex.space-x-4) {
    position: relative;
    z-index: 0;
    gap: clamp(14px, 3vw, 34px);
  }

  .carousel-stage :global(img) {
    max-width: 84%;
    max-height: 84%;
    filter: saturate(1.04);
  }

  :global(html.dark) .carousel-stage {
    border-color: rgba(148, 163, 184, 0.16);
    background:
      linear-gradient(90deg, rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.66)),
      radial-gradient(circle at 50% 50%, rgba(10, 132, 255, 0.14), transparent 50%);
  }

  :global(html.dark) .carousel-stage::before {
    background: linear-gradient(90deg, #0a0a0a, rgba(10, 10, 10, 0));
  }

  :global(html.dark) .carousel-stage::after {
    background: linear-gradient(270deg, #0a0a0a, rgba(10, 10, 10, 0));
  }

  @media (max-width: 1199px) {
    .stack-container {
      scroll-margin-top: 88px;
    }
  }

  @media (max-width: 768px) {
    .carousel-stage {
      min-height: 260px;
    }
  }

  @media (max-width: 560px) {
    .stack-header h2 {
      font-size: 28px;
    }

    .carousel-stage {
      min-height: 220px;
    }
  }
</style>
