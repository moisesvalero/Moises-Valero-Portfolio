<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-openai logo-invert-dark ${className}`}>
  <img src="https://api.iconify.design/logos%3Aopenai-icon.svg" alt="OpenAI" loading="lazy" decoding="async" />
</span>

<style>
  .logo-fill :global(img) {
    display: block;
  }
</style>
