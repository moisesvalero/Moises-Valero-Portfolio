<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill ${className}`}>
  <img src="/imagenes/codex-color.svg" alt="OpenAI Codex" loading="lazy" decoding="async" />
</span>

<style>
  .logo-fill {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  .logo-fill img {
    width: 122%;
    height: 122%;
    object-fit: contain;
  }
</style>
