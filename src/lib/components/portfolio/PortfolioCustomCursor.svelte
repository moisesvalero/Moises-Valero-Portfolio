<script lang="ts">
  import { onMount } from 'svelte';

  let dotEl: HTMLDivElement | undefined;
  let outlineEl: HTMLDivElement | undefined;

  onMount(() => {
    const dot = dotEl;
    const outline = outlineEl;
    if (!dot || !outline) return;

    const mq = window.matchMedia('(max-width: 768px)');

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let outlineX = 0;
    let outlineY = 0;

    const frictionDot = 0.5;
    const frictionOutline = 0.15;

    let rafId = 0;
    let running = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      if (!running) return;

      dotX += (mouseX - dotX) * frictionDot;
      dotY += (mouseY - dotY) * frictionDot;
      outlineX += (mouseX - outlineX) * frictionOutline;
      outlineY += (mouseY - outlineY) * frictionOutline;

      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

      rafId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (running || mq.matches) return;
      running = true;
      dot.removeAttribute('hidden');
      outline.removeAttribute('hidden');
      window.addEventListener('mousemove', onMove, { passive: true });
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
      window.removeEventListener('mousemove', onMove);
      dot.setAttribute('hidden', '');
      outline.setAttribute('hidden', '');
    };

    const syncMq = () => {
      if (mq.matches) stop();
      else start();
    };

    syncMq();
    mq.addEventListener('change', syncMq);

    return () => {
      mq.removeEventListener('change', syncMq);
      stop();
    };
  });
</script>

<div class="cursor-dot" bind:this={dotEl} hidden aria-hidden="true"></div>
<div class="cursor-outline" bind:this={outlineEl} hidden aria-hidden="true"></div>

<style>
  :global(body) {
    cursor: auto;
  }

  .cursor-dot {
    width: 6px;
    height: 6px;
    background-color: #ffffff;
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 999999;
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
    opacity: 0.9;
  }

  .cursor-outline {
    width: 25px;
    height: 25px;
    border: 1px solid rgba(0, 113, 227, 0.5);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    top: 0;
    left: 0;
    will-change: transform;
    opacity: 0.6;
    transform: translate(-50%, -50%);
  }

  .cursor-dot[hidden],
  .cursor-outline[hidden] {
    display: none;
  }

  :global(body.career-modal-open) .cursor-dot,
  :global(body.career-modal-open) .cursor-outline {
    display: none !important;
  }

  @media (max-width: 768px) {
    .cursor-dot,
    .cursor-outline {
      display: none !important;
    }
  }
</style>
