<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill ${className}`}>
  <img src="https://api.iconify.design/logos%3Apwa.svg" alt="PWA" loading="lazy" decoding="async" />
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
    width: 134%;
    height: 134%;
    object-fit: contain;
  }
</style>
