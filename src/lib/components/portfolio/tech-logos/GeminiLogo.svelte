<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-gemini ${className}`}>
	<img
		src="https://api.iconify.design/logos%3Agoogle-gemini.svg"
		alt="Gemini"
		loading="lazy"
		decoding="async"
	/>
</span>

<style>
	.logo-fill :global(img) {
		display: block;
	}
</style>
