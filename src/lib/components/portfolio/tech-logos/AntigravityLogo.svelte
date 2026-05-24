<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-antigravity ${className}`}>
  <img src="/imagenes/antigravity.svg" alt="Antigravity" loading="lazy" decoding="async" />
</span>

<style>
  .logo-fill :global(img) {
    display: block;
  }
</style>
