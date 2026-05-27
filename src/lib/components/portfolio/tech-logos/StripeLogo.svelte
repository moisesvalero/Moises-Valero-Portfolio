<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-stripe ${className}`}>
	<img
		src="https://api.iconify.design/logos%3Astripe.svg"
		alt="Stripe"
		loading="lazy"
		decoding="async"
	/>
</span>

<style>
	.logo-fill :global(img) {
		display: block;
	}
</style>
