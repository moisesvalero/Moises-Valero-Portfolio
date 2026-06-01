<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class={`logo-fill ${className}`}>
	<img
		class="rust-light"
		src="https://svgl.app/library/rust.svg"
		alt="Rust"
		loading="lazy"
		decoding="async"
	/>
	<img
		class="rust-dark"
		src="https://svgl.app/library/rust_dark.svg"
		alt="Rust"
		loading="lazy"
		decoding="async"
	/>
</span>

<style>
	.rust-dark {
		display: none;
	}

	:global(html.dark) .rust-light {
		display: none;
	}

	:global(html.dark) .rust-dark {
		display: block;
	}
</style>
