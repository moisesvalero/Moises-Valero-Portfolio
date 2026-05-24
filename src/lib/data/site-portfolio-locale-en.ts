import type { SitePortfolioContent } from '$lib/types/site-portfolio';

const aboutHtmlEn = `<p>
  I'm <strong>Moisés Valero</strong>. After years in the industrial sector, I returned to technology
  with a clear goal: to build efficient, practical and user-oriented websites, applications and
  digital solutions. I hold a <strong>Level 3 Vocational Certificate in Web Development</strong>
  and work from hands-on practice.
</p>
<p>
  I specialise in <strong>AI-Driven Development</strong> and
  <strong>Spec-Driven Development (SDD)</strong> methodologies to design software architectures and
  connect solutions with autonomy. My main stack focuses on <strong>SvelteKit</strong>,
  <strong>Supabase</strong>, <strong>Tailwind CSS</strong> and AI APIs
  (<strong>Gemini</strong>, <strong>OpenAI</strong>, <strong>Anthropic</strong>, <strong>Fal.ai</strong>),
  plus WordPress management and maintenance.
</p>
<p>
  I'm based in <strong>Alcoy (Alicante)</strong> and looking to join development teams
  (remote, hybrid or on-site). If you value maturity, problem-solving ability and command of the
  tools shaping the future, let's talk.
</p>`;

/**
 * Contenido EN solo para la demo i18n (selector del header).
 * El SEO (`site.seo`) no se modifica: sigue en español desde Sanity/defaults.
 */
export const portfolioEnglishDemo: Omit<SitePortfolioContent, 'seo'> = {
  header: {
    logoText: 'Moisés Valero',
    logoHref: '/',
    navItems: [
      { label: 'Home', href: '/#top' },
      { label: 'About me', href: '/#sobre' },
      { label: 'Services', href: '/#servicios' },
      { label: 'Stack', href: '/#stack' },
      { label: 'Projects', href: '/#proyectos' },
      { label: 'Career', href: '#', openCareerModal: true }
    ]
  },
  hero: {
    cvHref: '/api/cv',
    label: 'PORTFOLIO — MOISÉS VALERO · Alcoy / Alicante',
    title: 'Web Developer',
    subtitle: 'SvelteKit | WordPress | IT Support',
    bio: 'I develop fast, robust and maintainable websites and web apps, with a focus on performance, AI and real integrations. I am looking to join a team where I can bring technical judgement, fast learning and value from day one.',
    ctaPrimaryLabel: 'View CV',
    careerCtaLabel: 'View career'
  },
  about: {
    imageSrc: '/imagenes/Moises-Valero-Sanchez.png',
    imageAlt: 'Moisés Valero — WordPress developer',
    meta: 'A BIT OF MY STORY',
    title: 'About me',
    aboutHtml: aboutHtmlEn
  },
  services: {
    meta: 'SKILLS',
    title: 'What I can bring to a team',
    items: [
      {
        icon: 'web_asset',
        title: 'E-commerce',
        description:
          'Online stores with WordPress and WooCommerce built to turn visits into customers. I focus on load speed, transaction security, and inventory workflows that save you time.'
      },
      {
        icon: 'article',
        title: 'Web Development',
        description:
          'I build optimised sites with lean architecture for strong SEO. I pair SvelteKit for custom apps with WordPress where it fits, using AI to ship faster without cutting corners.'
      },
      {
        icon: 'desktop_windows',
        title: 'IT Support',
        description:
          'I keep your stack running: networks, hardware, hosting, and email setup. Fast incident response and preventive maintenance so your business does not stop.'
      }
    ]
  },
  techStack: {
    meta: 'TECHNOLOGIES & TOOLS',
    title: 'My Tech Stack',
    categories: [
      {
        title: 'Languages & Core',
        icons: [
          { devicon: 'typescript/typescript-original.svg', alt: 'TypeScript', title: 'TypeScript' },
          { devicon: 'javascript/javascript-original.svg', alt: 'JavaScript', title: 'JavaScript (ES6+)' },
          { devicon: 'html5/html5-original.svg', alt: 'HTML5', title: 'HTML5' },
          { devicon: 'css3/css3-original.svg', alt: 'CSS3', title: 'CSS3' }
        ]
      },
      {
        title: 'Frameworks & Libraries',
        icons: [
          { devicon: 'svelte/svelte-original.svg', alt: 'SvelteKit', title: 'SvelteKit / Svelte 5' },
          { devicon: 'tailwindcss/tailwindcss-original.svg', alt: 'Tailwind CSS', title: 'Tailwind CSS' },
          { devicon: 'vitejs/vitejs-original.svg', alt: 'Vite', title: 'Vite' },
          { iconify: 'logos:pwa', alt: 'PWA', title: 'Progressive Web Apps' }
        ]
      },
      {
        title: 'Backend & Infrastructure',
        icons: [
          { devicon: 'supabase/supabase-original.svg', alt: 'Supabase', title: 'Supabase (PostgreSQL)' },
          { devicon: 'vercel/vercel-original.svg', alt: 'Vercel', title: 'Vercel' },
          { devicon: 'cloudflare/cloudflare-original.svg', alt: 'Cloudflare', title: 'Cloudflare' },
          { devicon: 'github/github-original.svg', alt: 'GitHub', title: 'GitHub' }
        ]
      },
      {
        title: 'Integrations & APIs',
        icons: [
          { iconify: 'logos:stripe', alt: 'Stripe', title: 'Stripe API' },
          { src: '/imagenes/claude-ai-icon.svg', alt: 'Claude', title: 'Claude API' },
          { iconify: 'logos:openai-icon', alt: 'OpenAI', title: 'OpenAI API' },
          { iconify: 'logos:google-gemini', alt: 'Gemini', title: 'Gemini API' }
        ]
      },
      {
        title: 'CMS & Low-Code',
        icons: [
          { devicon: 'wordpress/wordpress-plain.svg', alt: 'WordPress', title: 'WordPress' },
          { src: '/imagenes/kadence.svg', alt: 'Kadence', title: 'Kadence' },
          { src: '/imagenes/elementor.svg', alt: 'Elementor', title: 'Elementor' },
          { devicon: 'sanity/sanity-original.svg', alt: 'Sanity', title: 'Sanity.io' }
        ]
      },
      {
      title: 'Development Environment & AI',
      icons: [
        { src: '/imagenes/cursor.svg', alt: 'Cursor', title: 'Cursor' },
        { src: '/imagenes/codex-color.svg', alt: 'OpenAI Codex', title: 'OpenAI Codex' },
        { src: '/imagenes/opencode.svg', alt: 'OpenCode', title: 'OpenCode' },
        { src: '/imagenes/antigravity.svg', alt: 'Antigravity', title: 'Google Antigravity' }
      ]
      }
    ]
  },
  quality: {
    meta: 'MY WORK STANDARD',
    title: 'Commitment to Quality',
    items: [
      {
        icon: '🚀',
        title: 'Performance',
        description:
          'Real-world load speed first. Fewer plugins and more native features for fast sites that boost SEO and retention.'
      },
      {
        icon: '🛡️',
        title: 'Security & hardening',
        description:
          'Security protocols and best practices to protect your online business against common vulnerabilities.'
      },
      {
        icon: '📱',
        title: 'Responsive design',
        description:
          'Mobile-first development so your site looks right on every device — essential for modern SEO.'
      },
      {
        icon: '🤖',
        title: 'AI-assisted delivery',
        description:
          'Practical use of AI to speed up development, debug, and ship on competitive timelines without losing robustness.'
      },
      {
        icon: '⚙️',
        title: 'Structured Content Management (CMS)',
        description:
          'Sanity (Headless CMS) implementation so you can manage content safely, quickly, and at scale, while keeping data separate from design.'
      }
    ]
  },
  projects: {
    meta: 'SELECTED PORTFOLIO',
    title: 'Featured Projects',
    projects: [
      {
        imageSrc: '/imagenes/captura-novakit_ember.avif',
        imageAlt: 'NovaKit: UI Toolkit',
        href: '/proyectos/novakit',
        external: false,
        linkLabel: 'View project',
        title: 'NovaKit landing with SvelteKit',
        description:
          'UI toolkit landing with SvelteKit: CSS animations, interactive mockups, Spline 3D, and i18n. Live demo at novakit.moisesvalero.es.',
        tags: ['SvelteKit', 'UI/UX', 'CSS Animations', 'i18n']
      },
      {
        imageSrc: '/imagenes/galeria-nova-.jpeg',
        imageAlt: 'Galería Nova: AI art e-commerce',
        href: '/proyectos/galeria-nova',
        external: false,
        linkLabel: 'View project',
        title: 'Galería Nova | Art e-commerce',
        description:
          'Production e-commerce for digital art with WordPress and Kadence. WooCommerce integration and assets shaped with prompt engineering for a real client.',
        tags: ['Kadence', 'WooCommerce', 'Prompt Engineering', 'Performance']
      },
      {
        imageSrc:
          '/imagenes/Captura-de-pantalla_27-2-2026_114525_moisesvalero.es_.jpeg',
        imageAlt: 'Premium steakhouse',
        href: '/proyectos/ember-iron',
        external: false,
        linkLabel: 'View project',
        title: 'Ember & Iron | Premium steakhouse',
        description:
          'High-impact visual site focused on conversion. Background video with performance-conscious implementation on Kadence WP.',
        tags: ['Kadence', 'Performance', 'UI/UX', 'Video Optimization']
      },
      {
        imageSrc: '/imagenes/vshield-1.jpeg',
        imageAlt: 'V-Shield Cybersecurity',
        href: '/proyectos/vshield',
        external: false,
        linkLabel: 'View project',
        title: 'V-Shield | Cybersecurity',
        description:
          'High-fidelity landing page. Functional interactive terminal and business logic tuned with custom scripts.',
        tags: ['Elementor', 'WordPress', 'Custom Scripts', 'Prompt Engineering']
      },
      {
        imageSrc: '/imagenes/chatbot.jpeg',
        imageAlt: 'AI chatbot with Llama 3.3',
        href: '/proyectos/chatbot',
        external: false,
        linkLabel: 'View project',
        title: 'AI chatbot | Portfolio assistant',
        description:
          'Conversational assistant with Llama 3.3 via Groq API, trained on my professional profile. Make.com + Telegram automation for real-time alerts.',
        tags: ['Typebot', 'Groq API', 'Make.com', 'Llama 3.3']
      },
    ]
  },
  contact: {
    heading: "Let's talk",
    subtitle: '',
    formModalHeading: 'Tell me about your project',
    formModalText: 'Leave your details and I will get back to you soon.',
    formModalSubmitLabel: 'Send request',
    formModalPrivacyLabel: 'I have read and accept the privacy policy.',
    formModalSuccessMessage: 'Message sent. I will reply soon.'
  },
  footer: {
    copyrightTemplate:
      'High-Performance Web Development | Systems & SEO Alcoy(Alicante) | Available for remote and on-site projects. Moisés Valero © {{year}} | Specialist in SvelteKit, WordPress and Sanity CMS.',
    githubHref: 'https://github.com/moisesvalero',
    linkedinHref: 'https://www.linkedin.com/in/moisesvalero',
    maltHref: 'https://www.malt.es/profile/moisesvalerosanchez',
    emailHref: 'mailto:info@moisesvalero.es'
  },
  careerModal: {
    pdfHref: '/imagenes/MOISES-VALERO-CV.pdf',
    closeAria: 'Close',
    title: 'Professional background of Moisés Valero',
    profileTitle: 'Profile',
    profileHtml: `<p class="career-p">
            I hold a <strong>Level 3 Vocational Certificate in Web Development</strong>
            (equivalent to <strong>higher vocational training</strong>), covering up-to-date skills
            for professional web development environments.
          </p>`,
    expTitle: 'Experience',
    timeline: [
      {
        range: '2019 – 2022',
        role: 'Freelance',
        descHtml:
          'Business digitalisation, technical project management, and systems maintenance.'
      },
      {
        range: '2012 – 2014',
        role: 'MutuaSAD',
        descHtml:
          'WordPress administration, e-commerce (WooCommerce / PrestaShop), and IT and network support.'
      },
      {
        range: '2001 – 2026',
        role: 'Additional background',
        descHtml: `Over two decades bringing <strong>professional maturity</strong> and
                <strong>leadership</strong> as a specialist in industrial environments and
                <strong>technical woodworking</strong>, with a strong focus on quality, coordination,
                and solving complex problems.`,
        span: true
      }
    ],
    stackTitle: 'Technical stack',
    pdfHide: 'Hide PDF résumé',
    pdfShow: 'View original PDF résumé',
    pdfIframeTitle: 'Moisés Valero résumé (PDF)',
    pdfHintBefore: 'If the document does not display, ',
    pdfHintLink: 'open it in a new tab'
  }
};

export function applyPortfolioEnglishDemo(
  site: SitePortfolioContent,
  opts?: { preserveSanityServices?: boolean; preserveSanityProjects?: boolean }
): SitePortfolioContent {
  const seo = site.seo;
  const en = portfolioEnglishDemo;
  const preserveServices = opts?.preserveSanityServices === true;
  const preserveProjects = opts?.preserveSanityProjects === true;
  const categories = site.techStack.categories.map((cat, i) => ({
    ...cat,
    title: en.techStack.categories[i]?.title ?? cat.title
  }));
  return {
    ...site,
    header: en.header,
    hero: en.hero,
    /** Texto/meta EN; la foto y el alt siguen viniendo de Sanity (CDN optimizado). */
    about: { ...en.about, imageSrc: site.about.imageSrc, imageAlt: site.about.imageAlt },
    services: preserveServices ? site.services : en.services,
    techStack: {
      meta: en.techStack.meta,
      title: en.techStack.title,
      categories
    },
    quality: en.quality,
    projects: preserveProjects ? site.projects : en.projects,
    contact: en.contact,
    footer: en.footer,
    seo
  };
}
