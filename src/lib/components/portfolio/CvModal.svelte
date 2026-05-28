<script lang="ts">
	import { resolve } from '$app/paths';
	import PortfolioModalShell from '$lib/components/portfolio/PortfolioModalShell.svelte';

	interface Props {
		open?: boolean;
		cvHref?: string;
		locale?: 'es' | 'en';
	}

	let { open = $bindable(false), cvHref = '/api/cv', locale = 'es' }: Props = $props();

	const resolvePath = resolve as unknown as (href: string) => string;
	const resolvedCvHref = $derived(/^\/(?!\/)/.test(cvHref) ? resolvePath(cvHref) : cvHref);
	const previewHref = $derived(resolvePath('/imagenes/cv/moises-valero-cv-1.png'));
	const copy = $derived(
		locale === 'en'
			? {
					title: 'Curriculum',
					eyebrow: 'Professional profile',
					open: 'Open in tab',
					download: 'Download',
					close: 'Close CV'
				}
			: {
					title: 'Currículum',
					eyebrow: 'Perfil profesional',
					open: 'Abrir en pestaña',
					download: 'Descargar',
					close: 'Cerrar CV'
				}
	);
	let previewFailed = $state(false);

	function close() {
		open = false;
	}
</script>

<svelte:head>
	<link rel="preload" as="image" href={previewHref} />
</svelte:head>

<PortfolioModalShell bind:open labelledBy="cv-modal-title" panelClass="cv-modal-panel">
	<div class="cv-modal-content">
		<header class="cv-modal-head">
			<div>
				<p>{copy.eyebrow}</p>
				<h2 id="cv-modal-title">{copy.title}</h2>
			</div>
			<div class="cv-modal-actions">
				<a
					href={resolvedCvHref}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={copy.open}
					title={copy.open}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M14 4h6v6h-2V7.42l-7.3 7.3-1.42-1.42 7.3-7.3H14V4ZM5.8 6h5.4v2H8v8h8v-3.2h2v5a.2.2 0 0 1-.2.2h-12a.2.2 0 0 1-.2-.2v-12c0-.11.09-.2.2-.2Z"
						/>
					</svg>
				</a>
				<a href={resolvedCvHref} download aria-label={copy.download} title={copy.download}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M11 4h2v8.17l3.24-3.24 1.42 1.41L12 16l-5.66-5.66 1.42-1.41L11 12.17V4ZM5 18h14v2H5v-2Z"
						/>
					</svg>
				</a>
				<button type="button" aria-label={copy.close} onclick={close}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4 6.4 5Zm11.2 0L19 6.4 6.4 19 5 17.6 17.6 5Z" />
					</svg>
				</button>
			</div>
		</header>

		<div class="cv-preview-wrap">
			{#if previewFailed}
				<div class="cv-preview-fallback">
					<p>
						{locale === 'en' ? 'The CV is available as a PDF.' : 'El CV está disponible en PDF.'}
					</p>
					<a href={resolvedCvHref} target="_blank" rel="noopener noreferrer">{copy.open}</a>
				</div>
			{:else}
				<a
					class="cv-preview-link"
					href={resolvedCvHref}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={copy.open}
				>
					<img
						class="cv-preview-image"
						src={previewHref}
						alt={locale === 'en' ? 'Curriculum preview' : 'Vista previa del currículum'}
						loading="eager"
						decoding="async"
						onerror={() => {
							previewFailed = true;
						}}
					/>
				</a>
			{/if}
		</div>
	</div>
</PortfolioModalShell>

<style>
	.cv-modal-content {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
		min-height: 0;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent 132px),
			color-mix(in srgb, #f8fafc 98%, #dbeafe 2%);
	}

	.cv-modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 18px;
		padding: 18px;
		border-bottom: 1px solid rgba(15, 23, 42, 0.1);
	}

	.cv-modal-head p {
		margin: 0 0 7px;
		color: #0071e3;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 820;
		letter-spacing: 0.12em;
		line-height: 1.1;
		text-transform: uppercase;
	}

	.cv-modal-head h2 {
		margin: 0;
		color: #111827;
		font-size: clamp(1.45rem, 2vw, 2.05rem);
		font-weight: 850;
		letter-spacing: 0;
		line-height: 1;
	}

	.cv-modal-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		flex: 0 0 auto;
	}

	.cv-modal-actions a,
	.cv-modal-actions button {
		display: inline-flex;
		width: 38px;
		height: 38px;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 7px;
		background: rgba(255, 255, 255, 0.72);
		color: #111827;
		font: inherit;
		line-height: 1;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 180ms ease,
			background-color 180ms ease,
			border-color 180ms ease;
	}

	.cv-modal-actions a,
	.cv-modal-actions button {
		padding: 0;
	}

	.cv-modal-actions a svg,
	.cv-modal-actions button svg {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

	.cv-modal-actions a:hover,
	.cv-modal-actions button:hover {
		border-color: rgba(0, 113, 227, 0.28);
		background: rgba(219, 234, 254, 0.78);
		transform: translateY(-1px);
	}

	.cv-preview-wrap {
		overflow: auto;
		min-height: 0;
		padding: 14px;
		background:
			linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
		background-size: 22px 22px;
	}

	.cv-preview-link {
		display: block;
		width: 100%;
		max-width: 860px;
		margin: 0 auto;
		border-radius: 10px;
		text-decoration: none;
	}

	.cv-preview-image {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 10px;
		background: #f8fafc;
		box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
	}

	.cv-preview-fallback {
		display: grid;
		min-height: 360px;
		place-content: center;
		gap: 16px;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 10px;
		background: #f8fafc;
		text-align: center;
	}

	.cv-preview-fallback p {
		margin: 0;
		color: #475569;
		font-size: 0.98rem;
		font-weight: 650;
	}

	.cv-preview-fallback a {
		display: inline-flex;
		min-height: 42px;
		align-items: center;
		justify-content: center;
		border-radius: var(--portfolio-action-radius);
		background: var(--portfolio-action-primary-bg);
		color: var(--portfolio-action-primary-text);
		padding: 0 16px;
		font-size: 0.9rem;
		font-weight: 780;
		text-decoration: none;
	}

	:global(html.dark) .cv-modal-content {
		background:
			linear-gradient(180deg, rgba(15, 23, 42, 0.5), transparent 132px),
			color-mix(in srgb, #090f1a 98%, #4da3ff 2%);
	}

	:global(html.dark) .cv-modal-head {
		border-bottom-color: rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .cv-modal-head p {
		color: #4da3ff;
	}

	:global(html.dark) .cv-modal-head h2 {
		color: #f8fafc;
	}

	:global(html.dark) .cv-modal-actions a,
	:global(html.dark) .cv-modal-actions button {
		border-color: rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.055);
		color: #f8fafc;
	}

	:global(html.dark) .cv-modal-actions a:hover,
	:global(html.dark) .cv-modal-actions button:hover {
		border-color: rgba(77, 163, 255, 0.32);
		background: rgba(77, 163, 255, 0.12);
	}

	:global(html.dark) .cv-preview-wrap {
		background:
			linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
		background-size: 22px 22px;
	}

	:global(html.dark) .cv-preview-image,
	:global(html.dark) .cv-preview-fallback {
		border-color: rgba(255, 255, 255, 0.12);
		background: #0f172a;
		box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
	}

	:global(html.dark) .cv-preview-fallback p {
		color: #cbd5e1;
	}

	@media (max-width: 760px) {
		.cv-modal-head {
			flex-direction: column;
			padding: 15px;
		}

		.cv-modal-actions {
			width: 100%;
			justify-content: stretch;
		}

		.cv-modal-actions a {
			flex: 1 1 auto;
		}

		.cv-preview-wrap {
			padding: 8px;
		}
	}
</style>
