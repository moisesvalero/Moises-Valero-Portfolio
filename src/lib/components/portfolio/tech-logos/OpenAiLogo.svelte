<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill ${className}`}>
  <img src="https://api.iconify.design/logos%3Aopenai-icon.svg" alt="OpenAI" loading="lazy" decoding="async" />
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
    width: 128%;
    height: 128%;
    object-fit: contain;
  }
</style>
