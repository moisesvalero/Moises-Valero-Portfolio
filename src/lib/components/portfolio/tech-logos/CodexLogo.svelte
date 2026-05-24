<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-codex ${className}`}>
  <img src="/imagenes/codex-color.svg" alt="OpenAI Codex" loading="lazy" decoding="async" />
</span>

<style>
  .logo-fill :global(img) {
    display: block;
  }
</style>
