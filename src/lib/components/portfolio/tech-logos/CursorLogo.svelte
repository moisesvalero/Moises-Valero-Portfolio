<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<img class={className} src="/imagenes/cursor.svg" alt="Cursor" loading="lazy" decoding="async" />
