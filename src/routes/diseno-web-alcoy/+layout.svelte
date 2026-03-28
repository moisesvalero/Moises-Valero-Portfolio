<script lang="ts">
	import '$lib/styles/alcoy-tailwind-entry.css';

	let { children }: { children: import('svelte').Snippet } = $props();
</script>

{@render children()}
