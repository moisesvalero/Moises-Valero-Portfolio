<script lang="ts">
	import { resolve } from '$app/paths';
	import { getCareerModalControls } from '$lib/career-modal-context';
	import PointerHighlight from '$lib/components/motion/PointerHighlight.svelte';

	interface Props {
		cvHref?: string;
		label?: string;
		title?: string;
		subtitle?: string;
		bio?: string;
		ctaPrimaryLabel?: string;
		careerCtaLabel?: string;
	}

	let {
		cvHref = '/#contacto',
		label = 'PORTFOLIO – MOISÉS VALERO',
		title = 'Desarrollador Web',
		subtitle = 'SvelteKit | React/Next.js | APIs | IA aplicada | WordPress',
		ctaPrimaryLabel = 'Ver CV',
		careerCtaLabel = 'Ver Trayectoria'
	}: Props = $props();

	const heroCapabilities = $derived([
		{ label: 'SvelteKit', icon: 'simple-icons:svelte', color: '#ff3e00' },
		{
			label: 'React/Next.js',
			icon: 'simple-icons:nextdotjs',
			color: '#111827',
			darkColor: '#f8fafc'
		},
		{ label: 'APIs', icon: 'lucide:webhook', color: '#0ea5e9' },
		{ label: 'IA aplicada', shortLabel: 'IA', icon: 'lucide:brain-circuit', color: '#6d5dfc' },
		{ label: 'WordPress', shortLabel: 'WP', icon: 'simple-icons:wordpress', color: '#21759b' }
	]);
	const heroCapabilitiesLabel = $derived(heroCapabilities.map((item) => item.label).join(' · '));
	const titleWords = $derived(title.split(/\s+/).filter(Boolean));
	const iconifySvgUrl = (name: string) =>
		`url("https://api.iconify.design/${encodeURIComponent(name)}.svg")`;
	const resolvePath = resolve as unknown as (href: string) => string;
	const cvLinkProps = $derived({
		href: /^\/(?!\/)/.test(cvHref) ? resolvePath(cvHref) : cvHref,
		target: '_blank',
		rel: 'noopener noreferrer'
	});

	const careerModal = getCareerModalControls();
</script>

<div class="hero-viewport-root" id="top">
	<div class="hero-stripe-pro-v2">
		<div class="hero-bottom-fade" aria-hidden="true"></div>

		<div class="contenido-hero">
			<p class="label-top hero-entry hero-entry-1">{label}</p>
			<h1 class="hero-entry hero-entry-2" aria-label={title}>
				{#each titleWords as word, index (word + index)}
					{#if index === titleWords.length - 1}
						<PointerHighlight
							containerClassName="hero-pointer-highlight"
							rectangleClassName="hero-pointer-rectangle"
							pointerClassName="hero-pointer-cursor"
							delay={1180}
						>
							<span class="hero-title-accent">{word}</span>
						</PointerHighlight>
					{:else}
						<span>{word}</span>
					{/if}
				{/each}
			</h1>
			<h2 class="sub-frase hero-entry hero-entry-3" aria-label={heroCapabilitiesLabel || subtitle}>
				{#each heroCapabilities as item, index (item.label)}
					<span
						class="hero-tech-item"
						style:--hero-tech-index={index}
						style:--hero-tech-color={item.color}
						style:--hero-tech-dark-color={item.darkColor ?? item.color}
					>
						<span
							class="hero-tech-icon"
							style:--hero-tech-icon={iconifySvgUrl(item.icon)}
							aria-hidden="true"
						></span>
						<span class="hero-tech-label-full">{item.label}</span>
						<span class="hero-tech-label-short">{item.shortLabel ?? item.label}</span>
					</span>
				{/each}
			</h2>
			<div class="botones-wrap hero-entry hero-entry-5">
				<button type="button" class="btn-apple-blue" onclick={() => careerModal?.open()}>
					{careerCtaLabel}
				</button>
				<a {...cvLinkProps} class="btn-ghost-slim">
					{ctaPrimaryLabel}
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	/* Equivalente a wrappers Elementor: cadena flex + altura viewport */
	.hero-viewport-root {
		width: 100%;
		min-height: 100vh;
		min-height: 100svh;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		box-sizing: border-box;
	}

	.hero-stripe-pro-v2 {
		position: relative;
		width: 100%;
		max-width: 100%;
		margin: 0;
		flex: 1;
		min-height: 100vh;
		min-height: 100svh;
		background:
			radial-gradient(circle at 50% 18%, rgba(0, 113, 227, 0.16), transparent 34rem),
			radial-gradient(circle at 18% 72%, rgba(167, 243, 255, 0.28), transparent 26rem),
			linear-gradient(180deg, rgba(239, 245, 252, 0.98), rgba(246, 249, 253, 0.93) 56%, #f8fafc),
			#edf4fb;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80px 8%;
		overflow: hidden;
		font-family: inherit;
		box-sizing: border-box;
	}

	.hero-stripe-pro-v2::before,
	.hero-stripe-pro-v2::after {
		content: '';
		position: absolute;
		pointer-events: none;
		z-index: 2;
		opacity: 0;
		transition: opacity 360ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hero-stripe-pro-v2::before {
		content: none;
		display: none;
	}

	.hero-stripe-pro-v2::after {
		content: none;
		display: none;
	}

	.hero-bottom-fade {
		position: absolute;
		inset: auto 0 0 0;
		/* Fade ligeramente mas largo y sin escalones para que no quede borde
       cuando el body tambien usa #f8fafc */
		height: clamp(180px, 28vh, 340px);
		z-index: 5;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(248, 250, 252, 0) 0%,
			rgba(248, 250, 252, 0.35) 38%,
			rgba(248, 250, 252, 0.78) 70%,
			#f8fafc 100%
		);
	}

	.contenido-hero {
		position: relative;
		z-index: 10;
		max-width: 900px;
		text-align: center;
		margin: 0 auto;
		width: 100%;
	}

	@keyframes heroStageIn {
		0% {
			opacity: 0;
			transform: translate3d(0, 14px, 0) scale(0.992);
			filter: blur(8px);
		}

		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1);
			filter: blur(0);
		}
	}

	@keyframes heroTextRise {
		0% {
			opacity: 0;
			transform: translate3d(0, var(--hero-entry-y, 22px), 0);
			filter: blur(var(--hero-entry-blur, 9px));
		}

		62% {
			opacity: 1;
		}

		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0);
			filter: blur(0);
		}
	}

	:global(.hero-pointer-highlight) {
		z-index: 1;
		padding: 0 0.055em 0.04em;
	}

	:global(.hero-pointer-rectangle) {
		border-color: color-mix(in srgb, #005fd6 72%, #0f172a 28%) !important;
		background: rgba(0, 113, 227, 0.075) !important;
		box-shadow: 0 18px 48px rgba(0, 113, 227, 0.1);
	}

	:global(.hero-pointer-cursor) {
		color: #005fd6 !important;
		filter: drop-shadow(0 10px 18px rgba(0, 95, 214, 0.24));
	}

	.contenido-hero {
		animation: heroStageIn 820ms cubic-bezier(0.22, 1, 0.36, 1) 40ms both;
		will-change: opacity, transform, filter;
	}

	.hero-entry {
		--hero-entry-y: 22px;
		--hero-entry-blur: 9px;
		animation: heroTextRise var(--hero-entry-duration, 820ms) cubic-bezier(0.22, 1, 0.36, 1) both;
		transform-origin: center;
		backface-visibility: hidden;
		will-change: opacity, transform, filter;
	}

	.hero-entry-1 {
		--hero-entry-y: 12px;
		--hero-entry-blur: 7px;
		--hero-entry-duration: 700ms;
		animation-delay: 140ms;
	}

	.hero-entry-2 {
		--hero-entry-y: 30px;
		--hero-entry-blur: 10px;
		--hero-entry-duration: 940ms;
		animation-delay: 230ms;
	}

	.hero-entry-3 {
		--hero-entry-y: 18px;
		--hero-entry-blur: 8px;
		--hero-entry-duration: 820ms;
		animation-delay: 430ms;
	}

	.hero-entry-4 {
		--hero-entry-y: 16px;
		--hero-entry-blur: 7px;
		--hero-entry-duration: 660ms;
		animation-delay: 480ms;
	}

	.hero-entry-5 {
		--hero-entry-y: 14px;
		--hero-entry-blur: 6px;
		--hero-entry-duration: 760ms;
		animation-delay: 590ms;
	}

	.label-top {
		color: #0071e3;
		font-size: 12.5px;
		font-weight: 700;
		letter-spacing: 2px;
		text-transform: uppercase;
		margin-bottom: 14px;
		display: block;
	}

	.hero-stripe-pro-v2 h1 {
		color: #0f172a !important;
		font-size: clamp(48px, 7.25vw, 124px) !important;
		font-weight: 800 !important;
		margin: 0 0 13px 0 !important;
		letter-spacing: -0.062em;
		line-height: 0.9;
		white-space: nowrap;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.08em 0.18em;
	}

	.hero-stripe-pro-v2 h1 span {
		display: inline-block;
	}

	.hero-title-accent {
		position: relative;
		margin-right: 0.035em;
		padding-right: 0.045em;
		color: #005fd6;
		background: none;
		-webkit-text-fill-color: currentColor;
	}

	.sub-frase {
		position: relative;
		color: #0f172a !important;
		font-size: clamp(14px, 1.22vw, 16px) !important;
		margin: 0 0 34px 0 !important;
		font-weight: 700 !important;
		line-height: 1.25;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		column-gap: 22px;
		row-gap: 12px;
		max-width: min(820px, 92vw);
		padding: 0;
		letter-spacing: 0;
	}

	.hero-tech-item {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		min-height: 34px;
		padding: 0;
		font-family: var(--font-mono);
		font-size: 0.9em;
		font-weight: 720;
		letter-spacing: 0;
		color: inherit;
		white-space: nowrap;
		transition:
			color 220ms ease,
			transform 220ms ease;
	}

	.hero-tech-item:not(:last-child)::after {
		content: '/';
		position: absolute;
		top: 50%;
		right: -16px;
		transform: translateY(-50%);
		color: rgba(15, 23, 42, 0.24);
		font-family: var(--font-sans);
		font-size: 0.9em;
		font-weight: 500;
	}

	.hero-tech-item:hover {
		color: var(--hero-tech-color);
		transform: translateY(-2px);
	}

	.hero-tech-icon {
		width: 28px;
		height: 28px;
		flex: 0 0 auto;
		color: var(--hero-tech-color, #005fcf);
		filter: none;
		opacity: 0.9;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: currentColor;
		mask: var(--hero-tech-icon) center / contain no-repeat;
		-webkit-mask: var(--hero-tech-icon) center / contain no-repeat;
	}

	.hero-tech-label-short {
		display: none;
	}

	.texto-bio {
		color: #172033;
		font-size: clamp(18px, 1.75vw, 24px);
		font-weight: 620;
		line-height: 1.48;
		letter-spacing: -0.01em;
		margin-bottom: 36px;
		max-width: min(760px, 92vw);
		margin-left: auto;
		margin-right: auto;
		text-wrap: pretty;
		text-shadow: none;
	}

	.botones-wrap {
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn-apple-blue {
		appearance: none;
		min-height: var(--portfolio-action-height);
		background: var(--portfolio-action-primary-bg);
		border: 1px solid var(--portfolio-action-primary-border);
		color: var(--portfolio-action-primary-text) !important;
		cursor: pointer;
		font-family: inherit;
		padding: 0 28px;
		border-radius: var(--portfolio-action-radius);
		text-decoration: none;
		font-size: 16px;
		font-weight: 760;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		box-shadow: var(--portfolio-action-primary-shadow);
		transition:
			transform 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			background 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			border-color 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			box-shadow 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			color 0.32s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.btn-apple-blue:hover {
		background: var(--portfolio-action-primary-bg-hover);
		border-color: var(--portfolio-action-primary-bg-hover);
		transform: translateY(-2px);
		box-shadow: var(--portfolio-action-primary-shadow);
		color: var(--portfolio-action-primary-text) !important;
	}

	.btn-ghost-slim {
		min-height: var(--portfolio-action-height);
		background: var(--portfolio-action-secondary-bg);
		color: var(--portfolio-action-secondary-text) !important;
		padding: 0 26px;
		border-radius: var(--portfolio-action-radius);
		text-decoration: none;
		font-size: 16px;
		font-weight: 760;
		font-family: inherit;
		border: 1px solid var(--portfolio-action-secondary-border);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		cursor: pointer;
		transition:
			transform 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			background-color 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			border-color 0.32s cubic-bezier(0.23, 1, 0.32, 1),
			color 0.32s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.btn-ghost-slim:hover {
		background: var(--portfolio-action-secondary-bg-hover);
		border-color: var(--portfolio-action-secondary-border-hover);
		transform: translateY(-2px);
		color: var(--portfolio-action-secondary-text) !important;
	}

	:global(html.dark) .btn-apple-blue {
		background: var(--portfolio-action-primary-bg) !important;
		color: var(--portfolio-action-primary-text) !important;
		border-color: var(--portfolio-action-primary-border) !important;
		text-shadow: none !important;
		box-shadow: var(--portfolio-action-primary-shadow) !important;
	}

	:global(html.dark) .btn-apple-blue:hover {
		background: var(--portfolio-action-primary-bg-hover) !important;
		color: var(--portfolio-action-primary-text) !important;
		transform: translateY(-2px);
		border-color: var(--portfolio-action-primary-bg-hover) !important;
		box-shadow: var(--portfolio-action-primary-shadow) !important;
	}

	:global(html.dark) .btn-ghost-slim {
		background: var(--portfolio-action-secondary-bg) !important;
		color: var(--portfolio-action-secondary-text) !important;
		border-color: var(--portfolio-action-secondary-border) !important;
		text-shadow: none !important;
		box-shadow: none !important;
	}

	:global(html.dark) .sub-frase {
		color: #f4f4f5 !important;
		text-shadow: 0 10px 34px rgba(0, 0, 0, 0.44);
	}

	:global(html.dark) .hero-tech-item:not(:last-child)::after {
		color: rgba(255, 255, 255, 0.28);
	}

	:global(html.dark) .hero-tech-item:hover {
		color: var(--hero-tech-dark-color, var(--hero-tech-color));
	}

	:global(html.dark) .hero-title-accent {
		color: #4da3ff;
		background: none;
		text-shadow: none;
	}

	:global(html.dark .hero-pointer-rectangle) {
		border-color: rgba(77, 163, 255, 0.72) !important;
		background: rgba(77, 163, 255, 0.105) !important;
		box-shadow:
			0 20px 54px rgba(77, 163, 255, 0.16),
			0 0 0 1px rgba(167, 243, 255, 0.08) inset;
	}

	:global(html.dark .hero-pointer-cursor) {
		color: #4da3ff !important;
		filter: drop-shadow(0 0 12px rgba(77, 163, 255, 0.4))
			drop-shadow(0 10px 20px rgba(0, 0, 0, 0.28));
	}

	:global(html.dark) .hero-tech-icon {
		color: var(--hero-tech-dark-color, var(--hero-tech-color, #a7f3ff));
		filter: drop-shadow(
				0 0 10px
					color-mix(
						in srgb,
						var(--hero-tech-dark-color, var(--hero-tech-color, #a7f3ff)) 28%,
						transparent
					)
			)
			drop-shadow(0 10px 22px rgba(0, 0, 0, 0.24));
		opacity: 0.96;
	}

	/*
   * Hero oscuro — "luz de estudio nocturna": malla azul de marca, deriva lenta,
   * núcleo detrás del título y viñeta para profundidad (sin rosa/amarillo del claro).
   */
	:global(html.dark) .hero-stripe-pro-v2,
	:global(html[data-theme='dark']) .hero-stripe-pro-v2 {
		background:
			radial-gradient(circle at 48% 16%, rgba(77, 163, 255, 0.24), transparent 31rem),
			radial-gradient(circle at 18% 72%, rgba(0, 113, 227, 0.15), transparent 28rem),
			radial-gradient(circle at 86% 64%, rgba(167, 243, 255, 0.09), transparent 24rem),
			linear-gradient(180deg, #101827 0%, #0a1322 58%, #080c14 100%);
	}

	:global(html.dark) .hero-stripe-pro-v2::before,
	:global(html[data-theme='dark']) .hero-stripe-pro-v2::before {
		content: none;
		display: none;
	}

	:global(html.dark) .hero-stripe-pro-v2::after,
	:global(html[data-theme='dark']) .hero-stripe-pro-v2::after {
		content: '';
		display: block;
		position: absolute;
		inset: 0;
		z-index: 3;
		opacity: 1;
		pointer-events: none;
		background:
			radial-gradient(ellipse 92% 68% at 50% 44%, transparent 38%, rgba(3, 8, 16, 0.2) 100%),
			linear-gradient(180deg, rgba(8, 12, 20, 0) 64%, rgba(8, 12, 20, 0.24) 100%);
	}

	:global(html.dark) .btn-ghost-slim:hover {
		background: #fafafa !important;
		color: #0a0a0a !important;
		border-color: #ffffff !important;
	}

	/* iPad horizontal y portátiles estrechos: evitar desbordes del título */
	@media (max-width: 1199px) {
		.hero-stripe-pro-v2 h1 {
			white-space: normal;
		}
	}

	@media (max-width: 1024px) {
		.hero-viewport-root {
			min-height: 100svh;
		}

		.hero-stripe-pro-v2 {
			padding: 60px 24px 80px;
			min-height: 100svh;
		}

		.hero-stripe-pro-v2 h1 {
			font-size: clamp(52px, 12vw, 74px) !important;
			letter-spacing: -0.046em;
			line-height: 0.94;
		}

		.sub-frase {
			font-size: 16px !important;
			max-width: min(620px, 92vw);
			margin-bottom: 30px !important;
		}

		.texto-bio {
			font-size: 16.5px;
			margin-bottom: 32px;
		}

		.botones-wrap {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}

		.btn-apple-blue,
		.btn-ghost-slim {
			justify-content: center;
			text-align: center;
		}
	}

	/* Cabecera fija: el label gris no debe quedar tapado en móvil */
	@media (prefers-reduced-motion: reduce) {
		.contenido-hero,
		.hero-entry {
			opacity: 1;
			filter: none;
			animation: none !important;
			transform: none !important;
			will-change: auto;
		}

		.hero-title-accent {
			animation: none !important;
			background: none;
			-webkit-text-fill-color: currentColor;
		}

		.hero-stripe-pro-v2::before,
		:global(html.dark) .hero-stripe-pro-v2::before,
		:global(html.dark) .hero-stripe-pro-v2::after {
			animation: none !important;
			will-change: auto;
		}

		:global(html.dark) .hero-stripe-pro-v2::before {
			opacity: 0.9;
		}
	}

	@media (max-width: 768px) {
		.hero-viewport-root {
			min-height: 100svh;
		}

		.hero-entry {
			--hero-entry-y: 16px;
			--hero-entry-blur: 7px;
			--hero-entry-duration: 760ms;
		}

		.hero-entry-1 {
			--hero-entry-y: 10px;
			animation-delay: 120ms;
		}

		.hero-entry-2 {
			--hero-entry-y: 22px;
			animation-delay: 200ms;
		}

		.hero-entry-3 {
			--hero-entry-y: 15px;
			animation-delay: 350ms;
		}

		.hero-entry-4 {
			--hero-entry-y: 14px;
			animation-delay: 380ms;
		}

		.hero-entry-5 {
			--hero-entry-y: 12px;
			animation-delay: 480ms;
		}

		.hero-stripe-pro-v2 {
			align-items: center;
			justify-content: center;
			min-height: 100svh;
			padding-top: max(5.5rem, calc(env(safe-area-inset-top, 0px) + 4.75rem));
			padding-bottom: max(3.5rem, env(safe-area-inset-bottom, 0px));
		}

		.contenido-hero {
			margin-top: clamp(-88px, -7svh, -48px);
		}

		.label-top {
			font-size: 11.5px;
			letter-spacing: 0.12em;
			line-height: 1.45;
			margin-bottom: 14px;
			padding: 0 4px;
			max-width: 100%;
		}

		.hero-stripe-pro-v2 h1 {
			font-size: clamp(50px, 14.6vw, 60px) !important;
			letter-spacing: -0.055em;
			line-height: 0.88;
		}

		.sub-frase {
			display: inline-flex;
			width: min(100%, 350px);
			font-size: 12.5px !important;
			margin: 0 0 24px 0 !important;
			column-gap: 13px;
			row-gap: 8px;
		}

		.hero-tech-item {
			justify-content: center;
			min-height: 24px;
			gap: 5px;
		}

		.hero-tech-item:not(:last-child)::after {
			content: none;
		}

		.hero-tech-icon {
			width: 16px;
			height: 16px;
		}

		.hero-tech-label-full {
			display: none;
		}

		.hero-tech-label-short {
			display: inline;
		}

		.texto-bio {
			font-size: 15.5px;
			line-height: 1.62;
			margin-bottom: 28px;
		}

		.botones-wrap {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			width: min(100%, 340px);
			margin: 0 auto;
			gap: 10px;
			align-items: center;
		}

		.btn-apple-blue,
		.btn-ghost-slim {
			width: 100%;
			min-height: 44px;
			padding: 11px 12px;
			border-radius: 7px;
			font-size: 14.5px;
			line-height: 1.15;
			white-space: normal;
		}
	}

	@media (max-width: 420px) {
		.hero-stripe-pro-v2 {
			min-height: 100svh;
			padding-top: max(5.25rem, calc(env(safe-area-inset-top, 0px) + 4.55rem));
		}

		.hero-stripe-pro-v2 h1 {
			font-size: clamp(47px, 13.9vw, 55px) !important;
		}
	}
</style>
