<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface Props {
		open?: boolean;
		labelledBy: string;
		panelClass?: string;
		children: Snippet;
	}

	let { open = $bindable(false), labelledBy, panelClass = '', children }: Props = $props();

	let panel: HTMLDivElement | undefined = $state();
	let reduceMotion = $state(false);
	let previousOverflow = '';

	const fadeParams = $derived({ duration: reduceMotion ? 0 : 180 });
	const flyInParams = $derived({
		y: reduceMotion ? 0 : 18,
		duration: reduceMotion ? 0 : 320,
		easing: quintOut
	});
	const flyOutParams = $derived({
		y: reduceMotion ? 0 : 10,
		duration: reduceMotion ? 0 : 170,
		easing: quintOut
	});
	const scaleParams = $derived({
		start: reduceMotion ? 1 : 0.975,
		duration: reduceMotion ? 0 : 260,
		easing: quintOut
	});

	function close() {
		open = false;
	}

	function portal(node: HTMLElement) {
		if (typeof document === 'undefined') return;
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = media.matches;
		const handleChange = () => {
			reduceMotion = media.matches;
		};
		media.addEventListener('change', handleChange);
		return () => media.removeEventListener('change', handleChange);
	});

	$effect(() => {
		if (!open) return;

		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleKeyDown);
		void tick().then(() => panel?.focus());

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

{#if open}
	<div
		class="portfolio-modal-layer"
		use:portal
		role="presentation"
		transition:fade={fadeParams}
		onmousedown={close}
	>
		<div
			bind:this={panel}
			class={`portfolio-modal-panel ${panelClass}`.trim()}
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelledBy}
			tabindex="-1"
			in:fly={flyInParams}
			out:fly={flyOutParams}
			onmousedown={(event) => event.stopPropagation()}
		>
			<div class="portfolio-modal-scale" in:scale={scaleParams} out:scale={scaleParams}>
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.portfolio-modal-layer {
		position: fixed;
		inset: 0;
		z-index: 20000;
		display: grid;
		place-items: center;
		padding: clamp(12px, 2.2vw, 24px);
		background:
			radial-gradient(circle at 50% 12%, rgba(77, 163, 255, 0.18), transparent 32rem),
			rgba(5, 8, 15, 0.72);
		-webkit-backdrop-filter: blur(8px) saturate(1.08);
		backdrop-filter: blur(8px) saturate(1.08);
		box-sizing: border-box;
	}

	.portfolio-modal-panel {
		width: min(720px, 100%);
		max-height: min(860px, calc(100svh - 24px));
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 14px;
		background: color-mix(in srgb, #f8fafc 97%, #dbeafe 3%);
		box-shadow:
			0 34px 110px rgba(2, 6, 23, 0.36),
			0 1px 0 rgba(255, 255, 255, 0.78) inset;
		color: #111827;
		outline: none;
		text-align: left;
	}

	.portfolio-modal-panel:focus-visible {
		outline: 2px solid rgba(77, 163, 255, 0.75);
		outline-offset: 4px;
	}

	.portfolio-modal-scale {
		height: 100%;
		min-height: 0;
	}

	:global(html.dark) .portfolio-modal-layer {
		background:
			radial-gradient(circle at 50% 12%, rgba(77, 163, 255, 0.18), transparent 32rem),
			rgba(2, 6, 12, 0.78);
	}

	:global(html.dark) .portfolio-modal-panel {
		border-color: rgba(255, 255, 255, 0.12);
		background: color-mix(in srgb, #090f1a 96%, #4da3ff 4%);
		box-shadow:
			0 34px 120px rgba(0, 0, 0, 0.62),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		color: #f8fafc;
	}

	:global(.cv-modal-panel) {
		width: min(1040px, 100%);
		height: min(820px, calc(100svh - 24px));
	}

	:global(.contact-modal-panel) {
		width: min(700px, 100%);
		max-height: min(760px, calc(100svh - 24px));
		overflow: auto;
	}

	@media (max-width: 640px) {
		.portfolio-modal-layer {
			align-items: end;
			padding: 8px;
		}

		.portfolio-modal-panel {
			width: 100%;
			max-height: calc(100svh - 16px);
			border-radius: 12px;
		}

		:global(.cv-modal-panel) {
			height: calc(100svh - 16px);
		}
	}
</style>
