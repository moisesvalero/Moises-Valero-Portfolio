<script lang="ts">
  import { Camera, Mesh, Program, Renderer, Transform, Triangle, Vec2, Vec3 } from 'ogl';

  interface Props {
    accent?: string;
    ocean?: string;
    atmosphere?: string;
    speed?: number;
    opacity?: number;
  }

  let {
    accent = '#78BCFF',
    ocean = '#04162F',
    atmosphere = '#2A84FF',
    speed = 0.22,
    opacity = 0.92
  }: Props = $props();

  const hexToVec3 = (hex: string, fallback: [number, number, number]): Vec3 => {
    const clean = hex.trim().replace('#', '');
    const normalized = clean.length === 3 ? clean.split('').map((c) => `${c}${c}`).join('') : clean;
    if (!/^[\da-fA-F]{6}$/.test(normalized)) {
      return new Vec3(fallback[0], fallback[1], fallback[2]);
    }
    const int = Number.parseInt(normalized, 16);
    return new Vec3(((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255);
  };

  const vertex = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragment = `
    precision highp float;

    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform vec3 uOcean;
    uniform vec3 uAccent;
    uniform vec3 uAtmosphere;
    uniform float uTime;
    uniform float uOpacity;

    const float PI = 3.14159265359;
    const float TAU = 6.28318530718;

    float hash(vec2 p) {
      p = fract(p * vec2(234.34, 435.35));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p *= 2.03;
        amp *= 0.5;
      }
      return value;
    }

    vec3 shadeGlobe(vec3 normal, float time) {
      float lon = atan(normal.z, normal.x);
      float lat = asin(clamp(normal.y, -1.0, 1.0));
      vec2 mapUv = vec2((lon + time * 0.5) / TAU + 0.5, lat / PI + 0.5);

      float mass = fbm(vec2(mapUv.x * 5.4, mapUv.y * 4.2));
      mass += fbm(vec2(mapUv.x * 11.0, mapUv.y * 8.0)) * 0.35;
      float continentMask = smoothstep(0.6, 0.8, mass);

      float coast = smoothstep(0.52, 0.7, mass) - smoothstep(0.7, 0.82, mass);
      float latBand = sin((mapUv.y * PI) * 6.0) * 0.5 + 0.5;
      float meridian = sin((mapUv.x * TAU) * 26.0) * 0.5 + 0.5;
      float grid = smoothstep(0.94, 0.995, meridian * latBand);

      float cityNoise = noise(mapUv * 130.0);
      float cityDots = step(0.982, cityNoise) * smoothstep(0.0, 0.4, normal.z);

      vec3 deepOcean = mix(uOcean, vec3(0.015, 0.045, 0.095), smoothstep(-0.9, 0.9, normal.y));
      vec3 shallowOcean = uAccent * 0.34 + vec3(0.03, 0.06, 0.11);
      vec3 oceanColor = mix(deepOcean, shallowOcean, 0.28 + 0.22 * normal.y);

      vec3 landBase = mix(vec3(0.07, 0.16, 0.25), uAccent * 0.78, 0.65);
      vec3 landColor = mix(landBase, uAccent, coast * 0.65);

      vec3 color = mix(oceanColor, landColor, continentMask * 0.85);
      color += grid * uAccent * 0.14;
      color += cityDots * uAccent * 0.95;

      vec3 lightDir = normalize(vec3(-0.35, 0.4, 0.85));
      float ndl = max(dot(normal, lightDir), 0.0);
      float softShadow = max(dot(normal, normalize(vec3(0.45, -0.1, 0.6))), 0.0);
      color *= 0.58 + ndl * 0.58 + softShadow * 0.12;

      float fresnel = pow(1.0 - max(normal.z, 0.0), 2.1);
      color += uAtmosphere * fresnel * 1.22;
      return color;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= uResolution.x / max(uResolution.y, 1.0);

      float radius = 0.56;
      float dist = length(uv);
      float edge = smoothstep(radius + 0.004, radius - 0.004, dist);

      vec3 color = vec3(0.0);
      float alpha = 0.0;

      if (edge > 0.0) {
        vec2 p = uv / radius;
        float z = sqrt(max(0.0, 1.0 - dot(p, p)));
        vec3 n = normalize(vec3(p, z));
        color = shadeGlobe(n, uTime);
        alpha = edge * uOpacity;
      }

      float haloRing = smoothstep(radius + 0.29, radius - 0.01, dist) * (1.0 - smoothstep(radius + 0.02, radius - 0.01, dist));
      float outerHalo = exp(-11.5 * max(0.0, dist - radius + 0.015)) * smoothstep(radius + 0.32, radius + 0.02, dist);
      vec3 halo = uAtmosphere * (haloRing * 0.48 + outerHalo * 0.42);
      color += halo;
      alpha = max(alpha, (haloRing * 0.22 + outerHalo * 0.25) * uOpacity);

      gl_FragColor = vec4(color, alpha);
    }
  `;

  const mountGlobe = (canvas: HTMLCanvasElement) => {
    const renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 1.75)
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const scene = new Transform();
    const camera = new Camera(gl);
    camera.position.z = 1;

    const uniforms = {
      uResolution: { value: new Vec2(1, 1) },
      uOcean: { value: hexToVec3(ocean, [4 / 255, 22 / 255, 47 / 255]) },
      uAccent: { value: hexToVec3(accent, [120 / 255, 188 / 255, 1]) },
      uAtmosphere: { value: hexToVec3(atmosphere, [42 / 255, 132 / 255, 1]) },
      uTime: { value: 0 },
      uOpacity: { value: opacity }
    };

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    mesh.setParent(scene);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceEnabled = reducedMotion.matches;
    let running = true;
    let raf = 0;
    let previous = performance.now();

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
      renderer.render({ scene, camera });
    };

    const render = (time: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (time - previous) / 1000);
      previous = time;

      if (!reduceEnabled) {
        uniforms.uTime.value += dt * speed;
      }

      renderer.render({ scene, camera });
      raf = window.requestAnimationFrame(render);
    };

    const onReducedChange = () => {
      reduceEnabled = reducedMotion.matches;
      if (reduceEnabled) {
        renderer.render({ scene, camera });
      }
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        previous = performance.now();
        raf = window.requestAnimationFrame(render);
      } else {
        window.cancelAnimationFrame(raf);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    reducedMotion.addEventListener('change', onReducedChange);
    document.addEventListener('visibilitychange', onVisibility);
    raf = window.requestAnimationFrame(render);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      reducedMotion.removeEventListener('change', onReducedChange);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  };
</script>

<canvas class="globe-canvas" {@attach mountGlobe} aria-hidden="true"></canvas>

<style>
  .globe-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .globe-canvas {
      opacity: 0.65;
    }
  }
</style>
