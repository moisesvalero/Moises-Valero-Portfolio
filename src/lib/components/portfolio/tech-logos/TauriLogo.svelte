<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<img
	class={className}
	src="https://svgl.app/library/tauri.svg"
	alt="Tauri"
	loading="lazy"
	decoding="async"
/>
