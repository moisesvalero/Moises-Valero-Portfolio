<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-pwa ${className}`}>
  <img src="https://api.iconify.design/logos%3Apwa.svg" alt="PWA" loading="lazy" decoding="async" />
</span>

<style>
  .logo-fill :global(img) {
    display: block;
  }
</style>
