<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-invert-dark ${className}`}>
	<img
		src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg"
		alt="WordPress"
		loading="lazy"
		decoding="async"
	/>
</span>
