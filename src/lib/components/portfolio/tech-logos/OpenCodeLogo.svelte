<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-opencode logo-invert-dark ${className}`}>
  <img src="/imagenes/opencode.svg" alt="OpenCode" loading="lazy" decoding="async" />
</span>

<style>
  .logo-fill :global(img) {
    display: block;
  }
</style>
