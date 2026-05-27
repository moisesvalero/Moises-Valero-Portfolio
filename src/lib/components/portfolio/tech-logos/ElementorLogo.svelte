<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<img
	class={className}
	src="/imagenes/elementor.svg"
	alt="Elementor"
	loading="lazy"
	decoding="async"
/>
