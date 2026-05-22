<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    /** Color base del fluido (azul de marca por defecto) */
    color?: string;
    /** Intensidad: 0..1. Controla la opacidad del color en el centro del splash */
    strength?: number;
    /** Radio del splash en px */
    radius?: number;
    /** Blur del filtro en px (más alto = más etéreo) */
    blur?: number;
  }

  let {
    color = '#0066E5',
    strength = 0.22,
    radius = 220,
    blur = 32
  }: Props = $props();

  let host: HTMLDivElement | null = $state(null);

  onMount(() => {
    if (!host) return;
    const card = host.parentElement as HTMLElement | null;
    if (!card) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;
    let active = 0;
    let targetActive = 0;
    let raf = 0;
    let running = false;

    const applyVars = () => {
      if (!host) return;
      host.style.setProperty('--cf-x', `${(currentX * 100).toFixed(2)}%`);
      host.style.setProperty('--cf-y', `${(currentY * 100).toFixed(2)}%`);
      host.style.setProperty('--cf-a', active.toFixed(3));
    };

    const tick = () => {
      const ease = 0.16;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      active += (targetActive - active) * 0.1;
      applyVars();

      const settled =
        Math.abs(targetX - currentX) < 0.001 &&
        Math.abs(targetY - currentY) < 0.001 &&
        Math.abs(targetActive - active) < 0.002;

      if (settled && targetActive === 0) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const ensureRunning = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const updateTargetFromEvent = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetX = (event.clientX - rect.left) / rect.width;
      targetY = (event.clientY - rect.top) / rect.height;
    };

    const onEnter = (event: PointerEvent) => {
      updateTargetFromEvent(event);
      currentX = targetX;
      currentY = targetY;
      targetActive = 1;
      ensureRunning();
    };

    const onMove = (event: PointerEvent) => {
      updateTargetFromEvent(event);
      targetActive = 1;
      ensureRunning();
    };

    const onLeave = () => {
      targetActive = 0;
      ensureRunning();
    };

    const onTouchTap = (event: PointerEvent) => {
      updateTargetFromEvent(event);
      currentX = targetX;
      currentY = targetY;
      targetActive = 0.7;
      ensureRunning();
      window.setTimeout(() => {
        targetActive = 0;
        ensureRunning();
      }, 380);
    };

    if (isCoarse) {
      card.addEventListener('pointerdown', onTouchTap);
    } else {
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('pointercancel', onLeave);
    }

    applyVars();

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('pointercancel', onLeave);
      card.removeEventListener('pointerdown', onTouchTap);
    };
  });
</script>

<div
  bind:this={host}
  class="card-fluid-overlay"
  style:--cf-color={color}
  style:--cf-strength={strength}
  style:--cf-radius="{radius}px"
  style:--cf-blur="{blur}px"
  aria-hidden="true"
></div>

<style>
  .card-fluid-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    opacity: var(--cf-a, 0);
    border-radius: inherit;
    transition: opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
    background:
      radial-gradient(
        circle var(--cf-radius, 220px) at var(--cf-x, 50%) var(--cf-y, 50%),
        color-mix(in srgb, var(--cf-color, #0066e5) calc(var(--cf-strength, 0.22) * 100%), transparent) 0%,
        color-mix(in srgb, var(--cf-color, #0066e5) calc(var(--cf-strength, 0.22) * 45%), transparent) 38%,
        transparent 70%
      );
    filter: saturate(112%);
  }

  @media (max-width: 768px), (hover: none), (pointer: coarse) {
    .card-fluid-overlay {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card-fluid-overlay {
      display: none;
    }
  }
</style>
