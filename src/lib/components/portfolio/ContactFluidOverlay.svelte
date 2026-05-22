<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    /** Color principal del fluido (azul de marca) */
    color?: string;
    /** Color de acento para mezcla suave */
    accent?: string;
    /** Opacidad global del efecto (0..1) */
    opacity?: number;
    /** Radio del trail principal en px (CSS) */
    radius?: number;
    /** Blur CSS aplicado al canvas (en px) */
    blur?: number;
    /** Si es true, no se añaden nuevos trazos (la disipación sigue activa) */
    paused?: boolean;
  }

  let {
    color = '#4DA3FF',
    accent = '#7CB8FF',
    opacity = 0.5,
    radius = 158,
    blur = 16,
    paused = false
  }: Props = $props();

  /** Copia para el bucle requestAnimationFrame (fuera del grafo de efectos de Svelte). */
  let pausedLive = false;
  $effect(() => {
    pausedLive = paused;
  });

  let host: HTMLDivElement | null = $state(null);
  let canvas: HTMLCanvasElement | null = $state(null);

  function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    const full =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  onMount(() => {
    if (!host || !canvas) return;
    const section = host.parentElement as HTMLElement | null;
    if (!section) return;
    const isMobileViewport = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    if (isMobileViewport) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const colorRgb = hexToRgb(color);
    const accentRgb = hexToRgb(accent);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas || !ctx) return;
      const rect = section.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();

    const drawBlob = (
      x: number,
      y: number,
      r: number,
      rgb: [number, number, number],
      a: number
    ) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
      grad.addColorStop(0.45, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * 0.45})`);
      grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    if (reduceMotion) {
      ctx.globalCompositeOperation = 'lighter';
      drawBlob(width * 0.5, height * 0.5, radius * 1.6, colorRgb, opacity * 0.35);
      drawBlob(width * 0.7, height * 0.4, radius * 1.1, accentRgb, opacity * 0.25);
      return () => {
        ro.disconnect();
      };
    }

    let targetX = width * 0.5;
    let targetY = height * 0.5;
    let currentX = targetX;
    let currentY = targetY;
    let lastX = currentX;
    let lastY = currentY;
    let velX = 0;
    let velY = 0;
    let intensity = 0;
    let targetIntensity = 0;
    let pointerInside = false;
    let lastFrame = performance.now();
    let raf = 0;
    let running = false;
    let inViewport = false;
    let pageVisible = !document.hidden;

    const canRun = () => inViewport && pageVisible;

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const startLoop = () => {
      if (running || !canRun()) return;
      running = true;
      raf = requestAnimationFrame((t) => {
        lastFrame = t;
        tick(t);
      });
    };

    const setTargetFromEvent = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
    };

    const onPointerEnter = (event: PointerEvent) => {
      pointerInside = true;
      setTargetFromEvent(event);
      currentX = targetX;
      currentY = targetY;
      lastX = currentX;
      lastY = currentY;
      targetIntensity = 1;
      startLoop();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerInside = true;
      setTargetFromEvent(event);
      targetIntensity = 1;
      startLoop();
    };

    const onPointerLeave = () => {
      pointerInside = false;
      targetIntensity = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      setTargetFromEvent(event);
      currentX = targetX;
      currentY = targetY;
      lastX = currentX;
      lastY = currentY;
      targetIntensity = 1;
      startLoop();
    };

    const tick = (now: number) => {
      if (!ctx || !canRun()) {
        stopLoop();
        return;
      }
      const dt = Math.min(48, now - lastFrame);
      const dtN = dt / 16.6667;
      lastFrame = now;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${0.038 + dt * 0.00065})`;
      ctx.fillRect(0, 0, width, height);

      if (!pointerInside) {
        targetIntensity = 0;
      }

      const spring = 0.095;
      const damp = 0.82;
      velX = (velX + (targetX - currentX) * spring * dtN) * damp;
      velY = (velY + (targetY - currentY) * spring * dtN) * damp;
      currentX += velX;
      currentY += velY;
      intensity += (targetIntensity - intensity) * (pointerInside ? 0.12 : 0.05);

      if (intensity > 0.005 && !pausedLive) {
        ctx.globalCompositeOperation = 'lighter';

        const dx = currentX - lastX;
        const dy = currentY - lastY;
        const dist = Math.hypot(dx, dy);
        const speed = Math.hypot(velX, velY);
        const steps = Math.min(16, Math.max(2, Math.floor(dist / 3.6)));
        const flow = Math.min(1.45, 0.68 + speed * 0.08);

        const baseAlpha = opacity * 0.065 * intensity * flow;
        const accentAlpha = opacity * 0.048 * intensity * flow;
        const baseRadius = radius * (0.86 + Math.min(speed * 0.015, 0.42));
        const accentRadius = baseRadius * 0.66;

        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 0 : i / steps;
          const x = lastX + dx * t;
          const y = lastY + dy * t;
          drawBlob(x, y, baseRadius, colorRgb, baseAlpha);
          drawBlob(x, y, accentRadius, accentRgb, accentAlpha);
          if (speed > 0.22 && i % 2 === 0) {
            drawBlob(
              x - velX * 0.55 + (Math.random() - 0.5) * 2.4,
              y - velY * 0.55 + (Math.random() - 0.5) * 2.4,
              accentRadius * 0.6,
              accentRgb,
              accentAlpha * 0.45
            );
          }
        }
      }

      lastX = currentX;
      lastY = currentY;

      if (!pointerInside && intensity < 0.006) {
        ctx.clearRect(0, 0, width, height);
        stopLoop();
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startLoop();
      else stopLoop();
    };

    const io = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      if (inViewport) startLoop();
      else stopLoop();
    }, {
      rootMargin: '120px 0px',
      threshold: 0.01
    });
    io.observe(section);

    section.addEventListener('pointerenter', onPointerEnter, { passive: true });
    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave, { passive: true });
    section.addEventListener('pointercancel', onPointerLeave, { passive: true });
    section.addEventListener('pointerdown', onPointerDown, { passive: true });
    section.addEventListener('pointerup', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      section.removeEventListener('pointerenter', onPointerEnter);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
      section.removeEventListener('pointercancel', onPointerLeave);
      section.removeEventListener('pointerdown', onPointerDown);
      section.removeEventListener('pointerup', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<div
  bind:this={host}
  class="contact-fluid-overlay"
  style:--cfo-blur="{blur}px"
  aria-hidden="true"
>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .contact-fluid-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
  }

  .contact-fluid-overlay canvas {
    display: block;
    width: 100%;
    height: 100%;
    filter: blur(var(--cfo-blur, 16px)) saturate(128%) contrast(106%);
    will-change: filter, transform;
    transform: translateZ(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .contact-fluid-overlay canvas {
      filter: blur(calc(var(--cfo-blur, 18px) * 1.4)) saturate(110%);
    }
  }

  @media (max-width: 768px), (pointer: coarse) {
    .contact-fluid-overlay {
      display: none;
    }
  }
</style>
