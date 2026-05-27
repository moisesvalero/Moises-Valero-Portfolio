<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<img
	class={className}
	src="/imagenes/claude-ai-icon.svg"
	alt="Claude"
	loading="lazy"
	decoding="async"
/>
