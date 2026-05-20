<script lang="ts">
  import { onMount } from 'svelte';
  import { Camera, Mesh, Program, Renderer, Transform, Triangle, Vec2, Vec3 } from 'ogl';
  import { getCareerModalControls } from '$lib/career-modal-context';

  interface Props {
    cvHref?: string;
    label?: string;
    title?: string;
    subtitle?: string;
    bio?: string;
    ctaPrimaryLabel?: string;
    careerCtaLabel?: string;
  }

  let {
    cvHref = '/#contacto',
    label = 'PORTFOLIO – MOISÉS VALERO · Alcoy / Alicante',
    title = 'Desarrollador Web',
    subtitle = 'SvelteKit | WordPress | Sistemas & SEO',
    bio = 'Desarrollo soluciones robustas enfocadas en Web Performance. Me encargo de la infraestructura técnica y el soporte para que tú solo te preocupes de tu negocio. Uso IA para optimizar tiempos, ya sea colaborando con empresas de la zona (Alcoy/Alicante) o integrándome en plantilla.',
    ctaPrimaryLabel = '¿Hablamos?',
    careerCtaLabel = 'Ver Trayectoria'
  }: Props = $props();

  const primaryOpensNewTab = $derived(/^https?:\/\//i.test(cvHref));
  const heroCapabilities = $derived([
    { label: 'SvelteKit', icon: 'simple-icons:svelte' },
    { label: 'WordPress', icon: 'simple-icons:wordpress' },
    { label: 'APIs', icon: 'lucide:webhook' },
    { label: /IT Support/i.test(subtitle) ? 'AI' : 'IA', icon: 'lucide:sparkles' }
  ]);
  const iconifySvgUrl = (name: string) =>
    `url("https://api.iconify.design/${encodeURIComponent(name)}.svg")`;

  const careerModal = getCareerModalControls();

  let scrollHintOpacity = $state(1);
  let showScrollHint = $state(true);
  let disableHeroShader = $state(false);
  const lightShaderConfig = {
    color: '#0066E5',
    secondaryColor: '#0052B8',
    accentColor: '#F59E0B',
    backgroundColor: '#F8FAFC',
    speed: 0.52,
    distortion: 0.2,
    hueShift: 9,
    intensity: 4.2
  } as const;

  const darkShaderConfig: ShaderConfig = {
    color: '#8B9CFF',
    secondaryColor: '#3F3F46',
    accentColor: '#A7F3FF',
    backgroundColor: '#0A0A0A',
    speed: 0.4,
    distortion: 0.16,
    hueShift: -6,
    intensity: 0.74
  };

  type ShaderConfig = {
    color: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    speed: number;
    distortion: number;
    hueShift: number;
    intensity: number;
  };

  const toLinearChannel = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const hexToLinearRgb = (hex: string): [number, number, number] => {
    const sanitized = hex.replace('#', '').trim();
    const expanded =
      sanitized.length === 3
        ? sanitized
            .split('')
            .map((c) => c + c)
            .join('')
        : sanitized;
    const int = Number.parseInt(expanded, 16);
    if (!Number.isFinite(int) || expanded.length !== 6) {
      return [1, 1, 1];
    }
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return [toLinearChannel(r), toLinearChannel(g), toLinearChannel(b)];
  };

  const applyHexColor = (target: Vec3, hex: string, fallback: [number, number, number]) => {
    const [r, g, b] = hexToLinearRgb(hex);
    target.set(
      Number.isFinite(r) ? r : fallback[0],
      Number.isFinite(g) ? g : fallback[1],
      Number.isFinite(b) ? b : fallback[2]
    );
  };

  const vertexShader = `
    attribute vec2 uv;
    attribute vec2 position;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorAccent;
    uniform vec3 uBackgroundColor;
    uniform float uSpeed;
    uniform float uDistortion;
    uniform float uHueShift;
    uniform float uIntensity;

    mat3 hueRot(float a) {
      float c = cos(a), s = sin(a), t = 1.0 - c;
      return mat3(
      t*.333+c,    t*.333-s*.577, t*.333+s*.577,
      t*.333+s*.577, t*.333+c,   t*.333-s*.577,
      t*.333-s*.577, t*.333+s*.577, t*.333+c
      );
    }

    float colorLuma(vec3 c) {
      return dot(c, vec3(0.2126, 0.7152, 0.0722));
    }

    vec3 hueFromColor(vec3 c, vec3 fallback) {
      float m = max(max(c.r, c.g), c.b);
      if (m < 1e-5) return fallback;
      return clamp(c / m, 0.0, 1.0);
    }

    vec3 blendAdaptive(vec3 bg, vec3 effect, float softness) {
      float bgLum = colorLuma(bg);
      float lightBg = smoothstep(0.45, 0.95, bgLum);
      float edge = clamp(softness, 0.0, 1.0);

      vec3 additive = bg + effect;
      vec3 effectHue = hueFromColor(effect, vec3(1.0));
      vec3 tintTarget = mix(bg, effectHue, 0.9);
      vec3 tint = mix(bg, tintTarget, edge);

      return mix(additive, tint, lightBg);
    }

    vec3 linearToSrgb(vec3 color) {
      vec3 safe = max(color, vec3(0.0));
      vec3 low = safe * 12.92;
      vec3 high = 1.055 * pow(safe, vec3(1.0 / 2.4)) - 0.055;
      vec3 cutoff = step(vec3(0.0031308), safe);
      return mix(low, high, cutoff);
    }

    void mainImage(out vec4 o, vec2 uv) {
      vec2 u = (uv * 2.0 - 1.0);
      u.x *= uResolution.x / uResolution.y;

      float time = uTime * uSpeed;

      u /= 0.5 + uDistortion * dot(u, u);
      u += 0.2 * cos(time) - 7.56;

      vec3 palette[5];
      palette[0] = uColor;
      palette[1] = hueRot(radians(uHueShift * 0.35)) * uColor;
      palette[2] = uColorAccent;
      palette[3] = uColorSecondary;
      palette[4] = mix(uColorAccent, uColor, 0.7);

      float weight[5];
      weight[0] = 1.0;
      weight[1] = 0.36;
      weight[2] = 0.22;
      weight[3] = 0.0;
      weight[4] = 0.26;

      vec3 col = vec3(0.0);
      float edgeField = 0.0;
      for(int i = 0; i < 5; i++) {
        vec2 uv_loop = sin(1.5 * u.yx + 2.0 * cos(u -= 0.01));
        float val = 1.0 - exp(-6.0 / exp(6.0 * length(uv_loop + sin(5.0 * uv_loop.y - 3.0 * time) / 4.0)));
        val = pow(clamp(val, 0.0, 1.0), 1.4);
        edgeField += val;
        col += val * palette[i] * weight[i];
      }
      vec3 bands = col * uIntensity;
      float softMask = 1.0 - exp(-0.85 * edgeField * uIntensity);
      vec3 rgb = blendAdaptive(uBackgroundColor, bands, softMask);
      o = vec4(rgb, 1.0);
    }

    void main() {
      vec4 fragColor;
      mainImage(fragColor, vUv);
      fragColor.rgb = linearToSrgb(fragColor.rgb);
      gl_FragColor = fragColor;
    }
  `;

  onMount(() => {
    /**
     * Safari/iOS suele crear contexto WebGL2; el fragment shader usa `gl_FragColor` (GLSL100) y falla allí.
     * Forzamos WebGL1 en `mountSpecularBand`. Aquí solo evitamos animación si el usuario pide menos movimiento
     * o si Chrome reporta RAM muy baja (`deviceMemory`). No usamos `hardwareConcurrency`: en iPhone suele ser ≤4
     * por privacidad y quitaba el canvas entero sin ser un móvil “cutre”.
     */
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncHeroShaderMode = () => {
      if (motionMq.matches) {
        disableHeroShader = true;
        return;
      }
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      disableHeroShader = typeof mem === 'number' && mem <= 2;
    };

    const hintMedia = window.matchMedia('(max-width: 1199px), (hover: none), (pointer: coarse)');
    const syncScrollHintVisibility = () => {
      showScrollHint = !hintMedia.matches;
    };
    const onScroll = () => {
      scrollHintOpacity = window.scrollY > 50 ? 0 : 1;
    };
    syncHeroShaderMode();
    syncScrollHintVisibility();
    onScroll();
    motionMq.addEventListener('change', syncHeroShaderMode);
    window.addEventListener('scroll', onScroll, { passive: true });
    hintMedia.addEventListener('change', syncScrollHintVisibility);
    window.addEventListener('resize', syncScrollHintVisibility, { passive: true });
    return () => {
      motionMq.removeEventListener('change', syncHeroShaderMode);
      window.removeEventListener('scroll', onScroll);
      hintMedia.removeEventListener('change', syncScrollHintVisibility);
      window.removeEventListener('resize', syncScrollHintVisibility);
    };
  });

  const mountSpecularBand = (targetCanvas: HTMLCanvasElement) => {
    const renderer = new Renderer({
      canvas: targetCanvas,
      alpha: true,
      /** GLSL con `gl_FragColor` es válido en WebGL1; en WebGL2 (Safari por defecto) el enlace del programa falla. */
      webgl: 1,
      dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    targetCanvas.style.width = '100%';
    targetCanvas.style.height = '100%';

    const camera = new Camera(gl);
    camera.position.z = 1;

    const scene = new Transform();
    const geometry = new Triangle(gl);

    const getActiveShaderConfig = (): ShaderConfig =>
      document.documentElement.classList.contains('dark') ? darkShaderConfig : lightShaderConfig;

    const applyShaderConfig = (config: ShaderConfig) => {
      applyHexColor(uniforms.uColor.value, config.color, [0, 102 / 255, 229 / 255]);
      applyHexColor(uniforms.uColorSecondary.value, config.secondaryColor, [0, 82 / 255, 184 / 255]);
      applyHexColor(uniforms.uColorAccent.value, config.accentColor, [245 / 255, 158 / 255, 11 / 255]);
      applyHexColor(uniforms.uBackgroundColor.value, config.backgroundColor, [248 / 255, 250 / 255, 252 / 255]);
      uniforms.uSpeed.value = config.speed;
      uniforms.uDistortion.value = config.distortion;
      uniforms.uHueShift.value = config.hueShift;
      uniforms.uIntensity.value = config.intensity;
    };

    const initialConfig = getActiveShaderConfig();
    const initialColor = hexToLinearRgb(initialConfig.color);
    const initialBackgroundColor = hexToLinearRgb(initialConfig.backgroundColor);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new Vec2(1, 1) },
      uColor: {
        value: new Vec3(initialColor[0], initialColor[1], initialColor[2])
      },
      uColorSecondary: {
        value: new Vec3(1, 1, 1)
      },
      uColorAccent: {
        value: new Vec3(1, 1, 1)
      },
      uBackgroundColor: {
        value: new Vec3(
          initialBackgroundColor[0],
          initialBackgroundColor[1],
          initialBackgroundColor[2]
        )
      },
      uSpeed: { value: initialConfig.speed },
      uDistortion: { value: initialConfig.distortion },
      uHueShift: { value: initialConfig.hueShift },
      uIntensity: { value: initialConfig.intensity }
    };
    applyShaderConfig(initialConfig);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let raf = 0;
    let previous = 0;
    const tick = (now: number) => {
      const w = Math.max(1, targetCanvas.clientWidth);
      const h = Math.max(1, targetCanvas.clientHeight);
      const bufW = Math.round(w * renderer.dpr);
      const bufH = Math.round(h * renderer.dpr);
      if (targetCanvas.width !== bufW || targetCanvas.height !== bufH) {
        targetCanvas.width = bufW;
        targetCanvas.height = bufH;
        renderer.width = w;
        renderer.height = h;
        renderer.state.viewport = { x: 0, y: 0, width: null, height: null };
        uniforms.uResolution.value.set(w, h);
      }
      const delta = previous ? (now - previous) / 1000 : 0;
      previous = now;
      uniforms.uTime.value += delta;

      renderer.render({ scene, camera });
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    const themeObserver = new MutationObserver(() => {
      applyShaderConfig(getActiveShaderConfig());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    return {
      destroy() {
        window.cancelAnimationFrame(raf);
        themeObserver.disconnect();
      }
    };
  };

</script>

<div class="hero-viewport-root" id="top">
  <div class="hero-stripe-pro-v2">
    {#if !disableHeroShader}
      <canvas
        use:mountSpecularBand
        class="luces-dinamicas-canvas"
        style="width:100%;height:100%;"
        aria-hidden="true"
      ></canvas>
    {/if}
    <div class="hero-bottom-fade" aria-hidden="true"></div>

    <div class="contenido-hero">
      <p class="label-top anim-fade-up">{label}</p>
      <h1 class="anim-fade-up">{title}</h1>
      <h2 class="sub-frase anim-fade-up" aria-label={subtitle}>
        {#each heroCapabilities as item (item.label)}
          <span class="hero-tech-item">
            <span class="hero-tech-icon" style:--hero-tech-icon={iconifySvgUrl(item.icon)} aria-hidden="true"></span>
            <span>{item.label}</span>
          </span>
        {/each}
      </h2>
      <p class="texto-bio anim-fade-up">{bio}</p>
      <div class="botones-wrap anim-fade-up">
        <a
          href={cvHref}
          class="btn-apple-blue"
          target={primaryOpensNewTab ? '_blank' : undefined}
          rel={primaryOpensNewTab ? 'noopener noreferrer' : undefined}
        >
          {ctaPrimaryLabel}
        </a>
        <button type="button" class="btn-ghost-slim" onclick={() => careerModal?.open()}>
          {careerCtaLabel}
        </button>
      </div>
    </div>
  </div>

  {#if showScrollHint}
    <div
      class="scroll-hint-fixed"
      style:opacity={scrollHintOpacity}
      aria-hidden="true"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="6,10 14,18 22,10"
          stroke="#1d1d1f"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  {/if}
</div>

<style>
  /* Equivalente a wrappers Elementor: cadena flex + altura viewport */
  .hero-viewport-root {
    width: 100%;
    min-height: 100vh;
    min-height: 100svh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
  }

  .hero-stripe-pro-v2 {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 0;
    flex: 1;
    min-height: 100vh;
    min-height: 100svh;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 8%;
    overflow: hidden;
    font-family: inherit;
    box-sizing: border-box;
  }

  .hero-stripe-pro-v2::before,
  .hero-stripe-pro-v2::after {
    content: "";
    position: absolute;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    transition: opacity 360ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-stripe-pro-v2::before {
    width: min(760px, 82vw);
    height: min(760px, 82vw);
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    background:
      radial-gradient(circle at 50% 48%, rgba(167, 243, 255, 0.14), transparent 34%),
      radial-gradient(circle at 38% 42%, rgba(139, 156, 255, 0.16), transparent 38%);
    mask-image: radial-gradient(circle, #000 0%, transparent 68%);
  }

  .hero-stripe-pro-v2::after {
    content: none;
    display: none;
  }

  @keyframes aparecer {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0) scale(0.99);
      filter: saturate(0.86);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
      filter: saturate(1);
    }
  }

  @keyframes hero-tech-pop {
    from {
      opacity: 0;
      transform: translate3d(0, 10px, 0) scale(0.92);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes hero-label-pulse {
    0%,
    100% {
      opacity: 0.82;
      letter-spacing: 2px;
      transform: translate3d(0, 0, 0);
    }
    50% {
      opacity: 0.94;
      letter-spacing: 2.16px;
      transform: translate3d(0, -0.5px, 0);
    }
  }

  .anim-fade-up {
    animation: aparecer 0.86s cubic-bezier(0.16, 1, 0.3, 1) both;
    will-change: transform, opacity, filter;
  }

  .label-top {
    animation-delay: 0.1s;
  }

  .label-top.anim-fade-up {
    animation:
      aparecer 0.86s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both,
      hero-label-pulse 4.8s ease-in-out 1.2s infinite;
  }

  .hero-stripe-pro-v2 h1.anim-fade-up {
    animation-delay: 0.25s;
  }

  .sub-frase {
    animation-delay: 0.4s;
  }

  .texto-bio {
    animation-delay: 0.55s;
  }

  .botones-wrap {
    animation-delay: 0.7s;
  }

  .luces-dinamicas-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  .hero-bottom-fade {
    position: absolute;
    inset: auto 0 0 0;
    /* Fade ligeramente mas largo y sin escalones para que no quede borde
       cuando el body tambien usa #f8fafc */
    height: clamp(180px, 28vh, 340px);
    z-index: 5;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(248, 250, 252, 0) 0%,
      rgba(248, 250, 252, 0.35) 38%,
      rgba(248, 250, 252, 0.78) 70%,
      #f8fafc 100%
    );
  }

  .contenido-hero {
    position: relative;
    z-index: 10;
    max-width: 900px;
    text-align: center;
    margin: 0 auto;
    width: 100%;
  }

  .label-top {
    color: #64748b;
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: block;
  }

  .hero-stripe-pro-v2 h1 {
    color: #0f172a !important;
    font-size: clamp(36px, 5.5vw, 80px) !important;
    font-weight: 800 !important;
    margin: 0 0 16px 0 !important;
    letter-spacing: -0.03em;
    line-height: 1;
    white-space: nowrap;
  }

  .sub-frase {
    color: #111827 !important;
    font-size: clamp(14px, 1.55vw, 18px) !important;
    margin: 0 0 28px 0 !important;
    font-weight: 600 !important;
    line-height: 1.2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px 14px;
    max-width: min(760px, 92vw);
    letter-spacing: 0;
  }

  .hero-tech-item {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 0 2px;
    color: inherit;
    font-family: var(--font-mono);
    font-size: 0.82em;
    font-weight: 650;
    letter-spacing: 0.01em;
    white-space: nowrap;
    opacity: 0;
    animation: hero-tech-pop 0.62s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .hero-tech-item:nth-child(1) {
    animation-delay: 0.58s;
  }

  .hero-tech-item:nth-child(2) {
    animation-delay: 0.66s;
  }

  .hero-tech-item:nth-child(3) {
    animation-delay: 0.74s;
  }

  .hero-tech-item:nth-child(4) {
    animation-delay: 0.82s;
  }

  .hero-tech-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    color: #005fcf;
    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.72));
    opacity: 0.92;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: currentColor;
    mask: var(--hero-tech-icon) center / contain no-repeat;
    -webkit-mask: var(--hero-tech-icon) center / contain no-repeat;
  }

  .texto-bio {
    color: #172033;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.74;
    letter-spacing: 0.005em;
    margin-bottom: 44px;
    max-width: min(700px, 92vw);
    margin-left: auto;
    margin-right: auto;
    text-wrap: pretty;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.92),
      0 0 18px rgba(255, 255, 255, 0.9),
      0 10px 30px rgba(248, 250, 252, 0.72);
  }

  .botones-wrap {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-apple-blue {
    background: #0066e5;
    color: #ffffff !important;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition:
      transform 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      background 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      border-color 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      box-shadow 0.32s cubic-bezier(0.23, 1, 0.32, 1),
      color 0.32s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-apple-blue:hover {
    background: #0052b8;
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 102, 229, 0.35);
    color: #ffffff !important;
  }

  .btn-ghost-slim {
    background: transparent;
    color: #0f172a !important;
    padding: 13px 26px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    font-family: inherit;
    border: 1.5px solid #e2e8f0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-ghost-slim:hover {
    background: rgba(15, 23, 42, 0.04);
    border-color: #cbd5e1;
    transform: translateY(-3px);
    color: #0f172a !important;
  }

  :global(html.dark) .btn-apple-blue {
    background: linear-gradient(135deg, #ffffff 0%, #f5f7ff 52%, #e7fbff 100%) !important;
    color: #0a0a0a !important;
    border: 1px solid rgba(255, 255, 255, 0.78) !important;
    text-shadow: none !important;
    box-shadow:
      0 16px 38px rgba(0, 0, 0, 0.34),
      0 0 24px rgba(167, 243, 255, 0.14),
      0 0 0 1px rgba(0, 0, 0, 0.06) inset !important;
  }

  :global(html.dark) .btn-apple-blue:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f7f8ff 48%, #ecfbff 100%) !important;
    color: #000000 !important;
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.9) !important;
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.34),
      0 0 22px rgba(167, 243, 255, 0.18),
      0 0 0 1px rgba(0, 0, 0, 0.07) inset !important;
  }

  :global(html.dark) .btn-ghost-slim {
    background: rgba(10, 10, 10, 0.68) !important;
    color: #f4f4f5 !important;
    border-color: rgba(167, 243, 255, 0.24) !important;
    text-shadow: none !important;
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.28),
      0 0 22px rgba(139, 156, 255, 0.09),
      0 1px 0 rgba(255, 255, 255, 0.08) inset !important;
    backdrop-filter: blur(18px) saturate(140%);
  }

  :global(html.dark) .sub-frase {
    color: #f4f4f5 !important;
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.72),
      0 12px 42px rgba(0, 0, 0, 0.46);
  }

  :global(html.dark) .hero-tech-icon {
    color: #a7f3ff;
    filter: drop-shadow(0 0 14px rgba(167, 243, 255, 0.2));
    opacity: 0.96;
  }

  :global(html.dark) .hero-stripe-pro-v2::before {
    opacity: 1;
  }

  :global(html.dark) .hero-stripe-pro-v2::after {
    opacity: 0;
  }

  :global(html.dark) .btn-ghost-slim:hover {
    background: #fafafa !important;
    color: #0a0a0a !important;
    border-color: #ffffff !important;
  }

  .scroll-hint-fixed {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .scroll-hint-fixed :global(svg) {
    animation: bounceArrow 1.8s ease-in-out infinite;
    display: block;
    opacity: 0.5;
  }

  @keyframes bounceArrow {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    50% {
      transform: translateY(7px);
      opacity: 1;
    }
  }

  /* iPad horizontal y portátiles estrechos: evitar desbordes del título */
  @media (max-width: 1199px) {
    .hero-stripe-pro-v2 h1 {
      white-space: normal;
    }
  }

  @media (max-width: 1024px) {
    .hero-viewport-root {
      min-height: 100svh;
    }

    .hero-stripe-pro-v2 {
      padding: 60px 24px 80px;
      min-height: 100svh;
    }

    .hero-stripe-pro-v2 h1 {
      font-size: clamp(48px, 11vw, 64px) !important;
    }

    .sub-frase {
      font-size: 16px !important;
      gap: 8px 12px;
    }

    .texto-bio {
      font-size: 16.5px;
      margin-bottom: 32px;
    }

    .botones-wrap {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .btn-apple-blue,
    .btn-ghost-slim {
      justify-content: center;
      text-align: center;
    }

    .scroll-hint-fixed {
      display: none;
    }
  }

  /* En móviles y tablets táctiles no mostramos la pista de scroll:
     evita que el chevron se perciba como una raya entre secciones. */
  @media (max-width: 1199px), (hover: none), (pointer: coarse) {
    .scroll-hint-fixed {
      display: none !important;
    }
  }

  /* Cabecera fija: el label gris no debe quedar tapado en móvil */
  @media (prefers-reduced-motion: reduce) {
    .anim-fade-up,
    .hero-tech-item {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }

    .luces-dinamicas-canvas {
      display: none;
    }

  }

  @media (max-width: 768px) {
    .hero-stripe-pro-v2 {
      align-items: flex-start;
      padding-top: max(6.25rem, calc(env(safe-area-inset-top, 0px) + 5.25rem));
      padding-bottom: 72px;
    }

    .label-top {
      font-size: 11.5px;
      letter-spacing: 0.12em;
      line-height: 1.45;
      margin-bottom: 14px;
      padding: 0 4px;
      max-width: 100%;
    }

    .hero-stripe-pro-v2 h1 {
      font-size: clamp(34px, 10vw, 54px) !important;
    }

    .sub-frase {
      font-size: 14.5px !important;
      margin: 0 0 20px 0 !important;
      gap: 6px 10px;
    }

    .hero-tech-item {
      min-height: 28px;
      gap: 6px;
    }

    .hero-tech-icon {
      width: 16px;
      height: 16px;
    }

    .texto-bio {
      font-size: 15.5px;
      line-height: 1.62;
      margin-bottom: 28px;
    }
  }
</style>
