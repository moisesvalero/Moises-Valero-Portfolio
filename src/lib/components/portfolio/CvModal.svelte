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
	const copy = $derived(
		locale === 'en'
			? {
					title: 'Moises Valero CV',
					eyebrow: 'Professional profile',
					description: 'Preview the CV without leaving the portfolio.',
					open: 'Open in tab',
					download: 'Download',
					close: 'Close CV'
				}
			: {
					title: 'CV de Moises Valero',
					eyebrow: 'Perfil profesional',
					description: 'Vista previa del CV sin salir del portfolio.',
					open: 'Abrir en pestana',
					download: 'Descargar',
					close: 'Cerrar CV'
				}
	);

	function close() {
		open = false;
	}
</script>

<PortfolioModalShell bind:open labelledBy="cv-modal-title" panelClass="cv-modal-panel">
	<div class="cv-modal-content">
		<header class="cv-modal-head">
			<div>
				<p>{copy.eyebrow}</p>
				<h2 id="cv-modal-title">{copy.title}</h2>
				<span>{copy.description}</span>
			</div>
			<div class="cv-modal-actions">
				<a href={resolvedCvHref} target="_blank" rel="noopener noreferrer">{copy.open}</a>
				<a href={resolvedCvHref} download>{copy.download}</a>
				<button type="button" aria-label={copy.close} onclick={close}>
					<span aria-hidden="true">close</span>
				</button>
			</div>
		</header>

		<div class="cv-frame-wrap">
			<iframe class="cv-frame" src={resolvedCvHref} title={copy.title}></iframe>
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

	.cv-modal-head span {
		display: block;
		margin-top: 9px;
		color: #64748b;
		font-size: 0.95rem;
		line-height: 1.4;
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
		height: 38px;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 7px;
		background: rgba(255, 255, 255, 0.72);
		color: #111827;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 780;
		line-height: 1;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			transform 180ms ease,
			background-color 180ms ease,
			border-color 180ms ease;
	}

	.cv-modal-actions a {
		padding: 0 12px;
	}

	.cv-modal-actions button {
		width: 38px;
		padding: 0;
	}

	.cv-modal-actions button span {
		margin: 0;
		font-family: 'Material Symbols Outlined';
		font-size: 20px;
		font-weight: 400;
		line-height: 1;
	}

	.cv-modal-actions a:hover,
	.cv-modal-actions button:hover {
		border-color: rgba(0, 113, 227, 0.28);
		background: rgba(219, 234, 254, 0.78);
		transform: translateY(-1px);
	}

	.cv-frame-wrap {
		min-height: 0;
		padding: 14px;
		background:
			linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
		background-size: 22px 22px;
	}

	.cv-frame {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 10px;
		background: #f8fafc;
		box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
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

	:global(html.dark) .cv-modal-head span {
		color: #cbd5e1;
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

	:global(html.dark) .cv-frame-wrap {
		background:
			linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
		background-size: 22px 22px;
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

		.cv-frame-wrap {
			padding: 8px;
		}
	}
</style>
