<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<img
	class={className}
	src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/svelte/svelte-original.svg"
	alt="SvelteKit"
	loading="lazy"
	decoding="async"
/>
