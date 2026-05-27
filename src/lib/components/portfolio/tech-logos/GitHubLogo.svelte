<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill logo-invert-dark ${className}`}>
	<img
		src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
		alt="GitHub"
		loading="lazy"
		decoding="async"
	/>
</span>
