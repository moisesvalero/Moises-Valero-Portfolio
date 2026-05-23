<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill ${className}`}>
  <img src="/imagenes/antigravity.svg" alt="Antigravity" loading="lazy" decoding="async" />
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
    width: 118%;
    height: 118%;
    object-fit: contain;
  }
</style>
