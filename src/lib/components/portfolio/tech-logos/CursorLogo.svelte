<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-invert-dark ${className}`}>
	<img src="/imagenes/cursor.svg" alt="Cursor" loading="lazy" decoding="async" />
</span>
