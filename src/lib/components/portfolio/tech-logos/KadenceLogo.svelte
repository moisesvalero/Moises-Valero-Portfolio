<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<img class={className} src="/imagenes/kadence.svg" alt="Kadence" loading="lazy" decoding="async" />
