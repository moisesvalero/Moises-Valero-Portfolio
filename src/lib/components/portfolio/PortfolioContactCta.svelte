<script lang="ts">
	import { resolve } from '$app/paths';
	import { Globe, type GlobeMarker, type GlobeMarkerTooltipContext } from '$lib/motion-core';
	import PortfolioModalShell from '$lib/components/portfolio/PortfolioModalShell.svelte';

	interface Props {
		heading?: string;
		subtitle?: string;
		formModalHeading?: string;
		formModalText?: string;
		formModalSubmitLabel?: string;
		formModalPrivacyLabel?: string;
		formModalSuccessMessage?: string;
	}

	let {
		heading = 'Listo para aportar en un equipo tecnico',
		subtitle = 'Busco incorporarme a un equipo donde pueda sumar en webs, web apps, rendimiento, integraciones e IA aplicada.',
		formModalHeading = 'Hablemos de una oportunidad',
		formModalText = 'Dejame tus datos y te respondere lo antes posible.',
		formModalSubmitLabel = 'Enviar mensaje',
		formModalPrivacyLabel = 'He leido y acepto la politica de privacidad.',
		formModalSuccessMessage = 'Mensaje enviado. Te respondere en breve.'
	}: Props = $props();

	const resolvedHeading = $derived(
		heading.trim().toLowerCase().includes('hablamos')
			? 'Listo para aportar en un equipo tecnico'
			: heading
	);
	const resolvedSubtitle = $derived(
		subtitle.trim().length > 0
			? subtitle
			: 'Busco incorporarme a un equipo donde pueda sumar en webs, web apps, rendimiento, integraciones e IA aplicada.'
	);

	const whatsappHref = '/api/contact/whatsapp';
	const alcoyLocation: [number, number] = [38.6987, -0.4743];
	const markers: GlobeMarker[] = [
		{ location: alcoyLocation, label: 'Alcoy', size: 0.16, color: '#f8fafc' }
	];

	let isFormModalOpen = $state(false);
	let formStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let formError = $state('');
	let form = $state({
		name: '',
		email: '',
		phone: '',
		message: '',
		privacyAccepted: false
	});

	function openFormModal() {
		isFormModalOpen = true;
		formStatus = 'idle';
		formError = '';
	}

	function closeFormModal() {
		isFormModalOpen = false;
	}

	async function submitForm(event: SubmitEvent) {
		event.preventDefault();
		if (formStatus === 'sending') return;
		formStatus = 'sending';
		formError = '';

		const response = await fetch('/api/contact/form', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});
		const data = (await response.json().catch(() => null)) as {
			ok?: boolean;
			error?: string;
		} | null;
		if (!response.ok || !data?.ok) {
			formStatus = 'error';
			formError = data?.error || 'No se pudo enviar el formulario.';
			return;
		}
		formStatus = 'success';
		form = { name: '', email: '', phone: '', message: '', privacyAccepted: false };
	}
</script>

{#snippet markerTooltip(ctx: GlobeMarkerTooltipContext)}
	<div class="globe-marker-tooltip">
		{ctx.marker.label}
		<span aria-hidden="true"></span>
	</div>
{/snippet}

<section class="team-contact-section" id="contacto" aria-labelledby="contacto-titulo">
	<div class="team-contact-copy">
		<p class="contact-kicker">Disponibilidad profesional</p>
		<h3 id="contacto-titulo">{resolvedHeading}</h3>
		<p class="contact-lead">{resolvedSubtitle}</p>

		<div class="fit-grid" aria-label="Resumen de encaje profesional">
			<span>Desarrollador web</span>
			<span>Remoto · hibrido · presencial</span>
		</div>

		<div class="contact-actions">
			<button type="button" class="primary-action" onclick={openFormModal}>Contacto</button>
			<a
				href={resolve(whatsappHref)}
				target="_blank"
				rel="noopener noreferrer"
				class="secondary-action"
			>
				WhatsApp
			</a>
		</div>
	</div>

	<div class="globe-panel" aria-label="Mapa de disponibilidad profesional">
		<Globe
			class="portfolio-globe"
			{markers}
			{markerTooltip}
			radius={1.9}
			focusOn={alcoyLocation}
			pointCount={25000}
			pointSize={0.042}
			landPointColor="#4da3ff"
			autoRotate={true}
			lockedPolarAngle={false}
			fresnelConfig={{ color: '#07101d', rimColor: '#4da3ff', rimPower: 5.2, rimIntensity: 1.65 }}
			atmosphereConfig={{
				color: '#4da3ff',
				scale: 1.12,
				power: 10,
				coefficient: 0.82,
				intensity: 1.15
			}}
		/>
	</div>
</section>

<PortfolioModalShell
	bind:open={isFormModalOpen}
	labelledBy="form-modal-title"
	panelClass="contact-modal-panel"
>
	<div class="contact-modal-content">
		<div class="modal-head">
			<div>
				<p class="modal-kicker">Contacto directo</p>
				<h4 id="form-modal-title">{formModalHeading}</h4>
				<p>{formModalText}</p>
			</div>
			<button
				type="button"
				class="modal-close"
				aria-label="Cerrar formulario"
				onclick={closeFormModal}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4 6.4 5Zm11.2 0L19 6.4 6.4 19 5 17.6 17.6 5Z" />
				</svg>
			</button>
		</div>
		<form class="modal-form" onsubmit={submitForm}>
			<label>
				<span>Nombre *</span>
				<input required bind:value={form.name} maxlength="100" />
			</label>
			<label>
				<span>Email *</span>
				<input type="email" required bind:value={form.email} maxlength="120" />
			</label>
			<label>
				<span>Telefono (opcional)</span>
				<input bind:value={form.phone} maxlength="40" />
			</label>
			<label>
				<span>Mensaje *</span>
				<textarea required bind:value={form.message} maxlength="2000"></textarea>
			</label>
			<label class="checkline">
				<input type="checkbox" required bind:checked={form.privacyAccepted} />
				<span>{formModalPrivacyLabel} <a href={resolve('/privacidad')}>Ver politica</a></span>
			</label>
			{#if formStatus === 'error' && formError}
				<p class="form-feedback error">{formError}</p>
			{/if}
			{#if formStatus === 'success'}
				<p class="form-feedback success">{formModalSuccessMessage}</p>
			{/if}
			<div class="modal-actions">
				<button type="button" class="btn-modal-ghost" onclick={closeFormModal}>Cerrar</button>
				<button type="submit" class="btn-modal-primary" disabled={formStatus === 'sending'}>
					{formStatus === 'sending' ? 'Enviando...' : formModalSubmitLabel}
				</button>
			</div>
		</form>
	</div>
</PortfolioModalShell>

<style>
	.team-contact-section {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 0.92fr) minmax(360px, 0.78fr);
		gap: clamp(26px, 6vw, 82px);
		align-items: center;
		width: min(1200px, calc(100% - 40px));
		margin: 84px auto 72px;
		padding: clamp(34px, 6vw, 72px) 0;
		scroll-margin-top: 96px;
		isolation: isolate;
	}

	.team-contact-section::before {
		content: '';
		position: absolute;
		inset: 8% -9% 0 48%;
		z-index: -1;
		background:
			radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.14), transparent 54%),
			linear-gradient(135deg, rgba(77, 163, 255, 0.08), transparent 58%);
		filter: blur(8px);
		pointer-events: none;
	}

	.team-contact-copy {
		max-width: 670px;
	}

	.contact-kicker {
		margin: 0 0 14px;
		color: #0071e3;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.team-contact-copy h3 {
		margin: 0;
		color: #111827;
		font-size: clamp(2.35rem, 5vw, 4.7rem);
		font-weight: 850;
		line-height: 0.95;
		letter-spacing: 0;
	}

	.contact-lead {
		max-width: 620px;
		margin: 24px 0 0;
		color: #475569;
		font-size: clamp(1.02rem, 1.5vw, 1.22rem);
		line-height: 1.72;
	}

	.fit-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0;
		margin-top: 28px;
		border-block: 1px solid rgba(15, 23, 42, 0.12);
	}

	.fit-grid span {
		padding: 13px 18px 13px 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: #334155;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 760;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		box-shadow: none;
	}

	.fit-grid span + span {
		padding-left: 18px;
		border-left: 1px solid rgba(15, 23, 42, 0.12);
	}

	.contact-actions {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		max-width: 610px;
		margin-top: 34px;
	}

	.primary-action,
	.secondary-action {
		display: inline-flex;
		width: 100%;
		height: var(--portfolio-action-height);
		align-items: center;
		justify-content: center;
		padding: 0 20px;
		border-radius: var(--portfolio-action-radius);
		appearance: none;
		font-family: inherit;
		font-size: 0.96rem;
		font-weight: 800;
		line-height: 1;
		text-decoration: none;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		transition:
			transform 0.22s ease,
			box-shadow 0.22s ease,
			background 0.22s ease,
			border-color 0.22s ease;
	}

	.primary-action {
		border: 1px solid var(--portfolio-action-primary-border);
		background: var(--portfolio-action-primary-bg);
		color: var(--portfolio-action-primary-text);
		box-shadow: var(--portfolio-action-primary-shadow);
	}

	.secondary-action {
		border: 1px solid var(--portfolio-action-secondary-border);
		background: var(--portfolio-action-secondary-bg);
		color: var(--portfolio-action-secondary-text);
	}

	.primary-action:hover,
	.secondary-action:hover {
		transform: translateY(-2px);
	}

	.secondary-action:hover {
		border-color: var(--portfolio-action-secondary-border-hover);
		background: var(--portfolio-action-secondary-bg-hover);
	}

	.primary-action:hover {
		border-color: var(--portfolio-action-primary-bg-hover);
		background: var(--portfolio-action-primary-bg-hover);
	}

	.globe-panel {
		position: relative;
		display: grid;
		min-height: clamp(390px, 40vw, 560px);
		place-items: center;
		overflow: visible;
	}

	:global(.portfolio-globe) {
		position: relative;
		width: min(100%, clamp(390px, 40vw, 560px));
		height: clamp(390px, 40vw, 560px);
		min-height: 0;
	}

	.globe-panel::after {
		content: '';
		position: absolute;
		inset: auto 10% 4% 10%;
		height: 34px;
		border-radius: 50%;
		background: rgba(15, 23, 42, 0.12);
		filter: blur(18px);
	}

	:global(.globe-marker-tooltip) {
		position: relative;
		padding: 5px 8px;
		border-radius: 4px;
		background: #111827;
		color: #ffffff;
		font-size: 0.64rem;
		font-weight: 850;
		letter-spacing: 0.04em;
		line-height: 1;
		text-transform: uppercase;
		white-space: nowrap;
		box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
	}

	:global(.globe-marker-tooltip span) {
		position: absolute;
		top: calc(100% - 1px);
		left: 50%;
		width: 0;
		height: 0;
		transform: translateX(-50%);
		border-top: 5px solid #111827;
		border-right: 5px solid transparent;
		border-left: 5px solid transparent;
	}

	.contact-modal-content {
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.72), transparent 150px),
			color-mix(in srgb, #f8fafc 98%, #dbeafe 2%);
	}

	.modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 18px;
		padding: 24px 24px 8px;
	}

	.modal-kicker {
		margin: 0 0 8px !important;
		color: #0071e3 !important;
		font-family: var(--font-mono);
		font-size: 0.68rem !important;
		font-weight: 820;
		letter-spacing: 0.12em;
		line-height: 1.1;
		text-transform: uppercase;
	}

	.modal-head h4 {
		margin: 0;
		color: #1d1d1f;
		font-size: 28px;
		font-weight: 800;
	}

	.modal-head p {
		margin: 10px 0 0;
		color: #65656b;
		font-size: 15px;
	}

	.modal-close {
		display: inline-flex;
		width: 38px;
		height: 38px;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 7px;
		background: rgba(255, 255, 255, 0.72);
		color: #111827;
		cursor: pointer;
		transition:
			transform 180ms ease,
			background-color 180ms ease,
			border-color 180ms ease;
	}

	.modal-close svg {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}

	.modal-close:hover {
		border-color: rgba(0, 113, 227, 0.28);
		background: rgba(219, 234, 254, 0.78);
		transform: translateY(-1px);
	}

	.modal-form {
		padding: 16px 24px 24px;
		display: grid;
		gap: 12px;
	}

	.modal-form label {
		display: grid;
		gap: 6px;
	}

	.modal-form span {
		color: #232328;
		font-size: 14px;
		font-weight: 600;
	}

	.modal-form input,
	.modal-form textarea {
		width: 100%;
		border: 1px solid #d4d4dc;
		border-radius: 10px;
		padding: 11px 12px;
		font-size: 15px;
		font-family: inherit;
	}

	.modal-form textarea {
		min-height: 120px;
		resize: vertical;
	}

	.checkline {
		display: flex !important;
		align-items: flex-start;
		gap: 10px;
		margin-top: 4px;
	}

	.checkline input {
		width: 16px;
		height: 16px;
		margin-top: 2px;
	}

	.checkline span {
		color: #5d5d65;
		font-size: 13px;
		font-weight: 500;
		line-height: 1.5;
	}

	.checkline a {
		color: #111111;
		text-decoration: none;
		font-weight: 700;
	}

	.form-feedback {
		margin: 4px 0;
		padding: 10px 12px;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
	}

	.form-feedback.error {
		color: #a61d24;
		background: #fdecec;
		border: 1px solid #f7cfd1;
	}

	.form-feedback.success {
		color: #116a3b;
		background: #e8f7ef;
		border: 1px solid #c8ebd7;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 6px;
	}

	.btn-modal-ghost,
	.btn-modal-primary {
		min-height: 44px;
		border-radius: var(--portfolio-action-radius);
		padding: 0 16px;
		font-size: 14px;
		font-weight: 760;
		border: 1px solid transparent;
		cursor: pointer;
	}

	.btn-modal-ghost {
		background: var(--portfolio-action-secondary-bg);
		border-color: var(--portfolio-action-secondary-border);
		color: var(--portfolio-action-secondary-text);
	}

	.btn-modal-primary {
		background: var(--portfolio-action-primary-bg);
		color: var(--portfolio-action-primary-text);
		border-color: var(--portfolio-action-primary-border);
	}

	.btn-modal-primary:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	:global(html.dark) .team-contact-section::before {
		background:
			radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.11), transparent 52%),
			linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 58%);
	}

	:global(html.dark) .team-contact-copy h3 {
		color: #f8fafc;
	}

	:global(html.dark) .contact-kicker {
		color: #4da3ff;
	}

	:global(html.dark) .contact-lead {
		color: #d4d4d8;
	}

	:global(html.dark) .fit-grid {
		border-block-color: rgba(255, 255, 255, 0.14);
	}

	:global(html.dark) .fit-grid span {
		border-color: rgba(255, 255, 255, 0.14);
		background: transparent;
		color: #e5e7eb;
		box-shadow: none;
	}

	:global(html.dark .globe-marker-tooltip) {
		background: #f8fafc;
		color: #0a0a0a;
	}

	:global(html.dark .globe-marker-tooltip span) {
		border-top-color: #f8fafc;
	}

	:global(html.dark) .secondary-action:hover {
		border-color: var(--portfolio-action-secondary-border-hover);
		background: var(--portfolio-action-secondary-bg-hover);
	}

	:global(html.dark) .contact-modal-content {
		background:
			linear-gradient(180deg, rgba(15, 23, 42, 0.5), transparent 150px),
			color-mix(in srgb, #090f1a 98%, #4da3ff 2%);
	}

	:global(html.dark) .modal-head h4 {
		color: #f8fafc;
	}

	:global(html.dark) .modal-head p,
	:global(html.dark) .checkline span {
		color: #d4d4d8;
	}

	:global(html.dark) .modal-form span {
		color: #f4f4f5;
	}

	:global(html.dark) .modal-form input,
	:global(html.dark) .modal-form textarea {
		background: rgba(255, 255, 255, 0.055);
		border-color: rgba(255, 255, 255, 0.14);
		color: #f8fafc;
	}

	:global(html.dark) .modal-close {
		border-color: rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.055);
		color: #f8fafc;
	}

	:global(html.dark) .modal-close:hover {
		border-color: rgba(77, 163, 255, 0.32);
		background: rgba(77, 163, 255, 0.12);
	}

	:global(html.dark) .checkline a {
		color: #ffffff;
	}

	@media (max-width: 900px) {
		.team-contact-section {
			grid-template-columns: 1fr;
			gap: 20px;
			padding-top: 42px;
		}

		.globe-panel {
			min-height: clamp(300px, 62vw, 390px);
		}

		:global(.portfolio-globe) {
			width: min(100%, clamp(300px, 62vw, 390px));
			height: clamp(300px, 62vw, 390px);
		}
	}

	@media (max-width: 640px) {
		.team-contact-section {
			width: min(100% - 28px, 1200px);
			margin-block: 56px;
		}

		.contact-actions {
			grid-template-columns: 1fr;
		}

		.fit-grid {
			grid-template-columns: 1fr;
		}

		.fit-grid span {
			padding: 12px 0;
		}

		.fit-grid span + span {
			padding-left: 0;
			border-left: 0;
			border-top: 1px solid rgba(15, 23, 42, 0.12);
		}

		:global(html.dark) .fit-grid span + span {
			border-top-color: rgba(255, 255, 255, 0.14);
		}

		.globe-panel {
			min-height: clamp(248px, 74vw, 310px);
			margin-inline: auto;
			width: min(100%, 320px);
		}

		:global(.portfolio-globe) {
			width: min(100%, clamp(248px, 74vw, 310px));
			height: clamp(248px, 74vw, 310px);
		}

		.modal-head {
			padding: 18px 16px 4px;
		}

		.modal-head h4 {
			font-size: 22px;
		}

		.modal-form {
			padding: 12px 16px 16px;
		}

		.modal-actions {
			flex-direction: column;
			align-items: stretch;
			gap: 10px;
			margin-top: 10px;
		}
	}
</style>
