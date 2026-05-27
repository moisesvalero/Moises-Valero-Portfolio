<script lang="ts">
	import { spring } from 'svelte/motion';
	import type { Snippet } from 'svelte';
	import Pointer from './Pointer.svelte';

	let {
		children,
		rectangleClassName = '',
		pointerClassName = '',
		containerClassName = '',
		inView = true,
		delay = 0,
		pointerOffsetX = 4,
		pointerOffsetY = 4
	}: {
		children?: Snippet;
		rectangleClassName?: string;
		pointerClassName?: string;
		containerClassName?: string;
		inView?: boolean;
		delay?: number;
		pointerOffsetX?: number;
		pointerOffsetY?: number;
	} = $props();

	let containerRef = $state<HTMLSpanElement | undefined>();
	let width = $state(0);
	let height = $state(0);
	let hasRunOnce = $state(false);
	let delayTimer: number | undefined;
	let resizeObserver: ResizeObserver | undefined;
	let intersectionObserver: IntersectionObserver | undefined;

	const dimensions = spring({ width: 0, height: 0 }, { stiffness: 0.1, damping: 0.3 });

	function clearDelay() {
		if (delayTimer) window.clearTimeout(delayTimer);
		delayTimer = undefined;
	}

	function updateSize() {
		if (!containerRef) return;
		const rect = containerRef.getBoundingClientRect();
		dimensions.set({ width: rect.width, height: rect.height });
	}

	function runHighlight() {
		clearDelay();
		delayTimer = window.setTimeout(updateSize, delay);
	}

	function observeResize() {
		if (!containerRef || resizeObserver) return;
		resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			dimensions.set({ width: entry.contentRect.width, height: entry.contentRect.height });
		});
		resizeObserver.observe(containerRef);
	}

	function unobserveResize() {
		if (resizeObserver && containerRef) resizeObserver.unobserve(containerRef);
		resizeObserver?.disconnect();
		resizeObserver = undefined;
	}

	$effect(() => {
		const unsubscribe = dimensions.subscribe((val) => {
			width = val.width;
			height = val.height;
		});
		return unsubscribe;
	});

	$effect(() => {
		if (!containerRef) return;

		intersectionObserver = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (inView) {
						runHighlight();
						observeResize();
					} else if (!hasRunOnce) {
						hasRunOnce = true;
						runHighlight();
					}
				} else if (inView) {
					clearDelay();
					unobserveResize();
					dimensions.set({ width: 0, height: 0 });
				}
			},
			{ threshold: 0.1 }
		);

		intersectionObserver.observe(containerRef);
		if (inView) {
			runHighlight();
			observeResize();
		}

		return () => {
			clearDelay();
			intersectionObserver?.disconnect();
			intersectionObserver = undefined;
			unobserveResize();
		};
	});
</script>

<span bind:this={containerRef} class={`pointer-highlight ${containerClassName}`}>
	{#if width > 0 && height > 0}
		<span class="pointer-highlight-box" aria-hidden="true">
			<span
				class={`pointer-highlight-rectangle ${rectangleClassName}`}
				style={`width: ${width}px; height: ${height}px;`}
			></span>
		</span>
		<span
			class="pointer-highlight-cursor"
			style={`transform: translate(${width + pointerOffsetX}px, ${height + pointerOffsetY}px) rotate(-90deg);`}
			aria-hidden="true"
		>
			<Pointer class={`pointer-highlight-pointer ${pointerClassName}`} />
		</span>
	{/if}
	{@render children?.()}
</span>

<style>
	.pointer-highlight {
		position: relative;
		display: inline-block;
		width: fit-content;
	}

	.pointer-highlight-box,
	.pointer-highlight-cursor {
		position: absolute;
		pointer-events: none;
	}

	.pointer-highlight-box {
		inset: 0;
		z-index: -1;
		opacity: 1;
		transform: scale(1);
		transition:
			opacity 500ms ease-out,
			transform 500ms ease-out;
	}

	.pointer-highlight-rectangle {
		position: absolute;
		inset: 0;
		display: block;
		border: 1px solid #0f172a;
		background: rgba(0, 113, 227, 0.08);
		transition:
			width 1000ms ease-in-out,
			height 1000ms ease-in-out;
	}

	.pointer-highlight-cursor {
		left: 0;
		top: 0;
		z-index: 4;
		display: block;
		width: 1.25rem;
		height: 1.25rem;
		line-height: 0;
		opacity: 1;
		transition:
			opacity 100ms ease-in-out,
			transform 1000ms ease-in-out;
	}

	:global(.pointer-highlight-pointer) {
		color: #0071e3;
		filter: drop-shadow(0 8px 14px rgba(0, 113, 227, 0.2));
	}

	@media (prefers-reduced-motion: reduce) {
		.pointer-highlight-box,
		.pointer-highlight-rectangle,
		.pointer-highlight-cursor {
			transition-duration: 0.01ms !important;
		}
	}
</style>
