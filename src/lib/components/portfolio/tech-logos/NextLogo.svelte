<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-invert-dark ${className}`}>
	<img
		src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg"
		alt="Next.js"
		loading="lazy"
		decoding="async"
	/>
</span>
