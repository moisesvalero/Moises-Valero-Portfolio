<script lang="ts">
	import { locale } from '$lib/i18n/index.js';

	type ServiceItem = {
		icon: string;
		title: string;
		description: string;
	};

	type RoleFact = {
		label: string;
		value: string;
	};

	interface Props {
		meta?: string;
		title?: string;
		items?: ServiceItem[];
	}

	let { meta = 'COMPETENCIAS', items = [] }: Props = $props();

	const heading = $derived(
		$locale === 'en' ? 'What I can bring to a team.' : 'Lo que puedo aportar dentro de un equipo.'
	);

	const summary = $derived(
		$locale === 'en'
			? 'I build websites and web apps with modern tooling, real integrations and enough technical judgement to keep projects maintainable.'
			: 'Trabajo desde especificaciones claras, guío la IA con criterio técnico y reviso cada resultado con foco en rendimiento y mantenibilidad.'
	);

	const roleFacts = $derived<RoleFact[]>(
		$locale === 'en'
			? [
					{ label: 'Target role', value: 'Web Developer' },
					{ label: 'Stack + focus', value: 'SvelteKit · TypeScript · Performance · SEO' },
					{ label: 'Development practices', value: 'Clear specs / human review / AI support' },
					{ label: 'Attitude', value: 'I learn what the team needs' }
				]
			: [
					{ label: 'Rol objetivo', value: 'Desarrollador web' },
					{ label: 'Stack + foco', value: 'SvelteKit · TypeScript · Performance · SEO' },
					{
						label: 'Buenas prácticas',
						value: 'AI-Driven Dev · Spec-Driven Development'
					},
					{ label: 'Actitud', value: 'Aprendo lo que el equipo necesite' }
				]
	);

	const hasLegacyItems = $derived(items.length > 0);
</script>

<section
	class="servicios-grid-container"
	class:has-legacy-items={hasLegacyItems}
	id="servicios"
	aria-labelledby="servicios-titulo"
>
	<div class="servicios-intro">
		<div class="servicios-heading">
			<p class="meta-servicios">{meta}</p>
			<h2 id="servicios-titulo">{heading}</h2>
		</div>

		<p class="servicios-summary">{summary}</p>
	</div>

	<div
		class="role-strip"
		aria-label={$locale === 'en' ? 'Professional fit summary' : 'Resumen de encaje profesional'}
	>
		{#each roleFacts as fact, index (fact.label)}
			<article class="role-card" class:is-primary={index === 0}>
				<span>{fact.label}</span>
				<strong>{fact.value}</strong>
			</article>
		{/each}
	</div>
</section>

<style>
	.servicios-grid-container {
		max-width: 1180px;
		margin: 80px auto;
		padding: 34px 20px 0;
		font-family: inherit;
		scroll-margin-top: 96px;
	}

	.servicios-intro {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.48fr);
		gap: clamp(28px, 5vw, 72px);
		align-items: end;
		margin-bottom: 34px;
	}

	.meta-servicios {
		color: #0071e3;
		font-size: 12px;
		font-weight: 850;
		letter-spacing: 0.16em;
		margin: 0 0 12px;
		text-transform: uppercase;
	}

	.servicios-heading h2 {
		max-width: 780px;
		color: #15171a !important;
		font-size: clamp(42px, 6vw, 78px) !important;
		font-weight: 850 !important;
		line-height: 0.94 !important;
		letter-spacing: -0.055em;
		margin: 0 !important;
		text-wrap: balance;
	}

	.servicios-summary {
		color: #1f2937;
		font-size: 18px;
		line-height: 1.55;
		margin: 0 0 5px;
		text-wrap: pretty;
	}

	.role-strip {
		display: grid;
		grid-template-columns: minmax(0, 1.32fr) repeat(3, minmax(0, 0.58fr));
		border: 1px solid rgba(21, 23, 26, 0.12);
		background: #ffffff;
		box-shadow: none;
		overflow: hidden;
		isolation: isolate;
	}

	.role-card {
		position: relative;
		min-height: 110px;
		padding: 24px 22px;
		overflow: hidden;
		border-left: 1px solid rgba(21, 23, 26, 0.1);
		background: #ffffff;
		transition:
			background-color 680ms cubic-bezier(0.16, 1, 0.3, 1),
			color 680ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 680ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.role-card:first-child {
		border-left: 0;
	}

	.role-card::before {
		content: '';
		position: absolute;
		inset: auto -20% 0 -20%;
		height: 3px;
		background: #0071e3;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.role-card::after {
		content: none;
	}

	.role-card span,
	.role-card strong {
		position: relative;
		z-index: 1;
	}

	.role-card span {
		display: block;
		margin-bottom: 10px;
		color: #9aa4b2;
		font-size: 11px;
		font-weight: 850;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		transition: color 680ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.role-card strong {
		display: block;
		color: #111317;
		font-size: clamp(17px, 1.55vw, 24px);
		font-weight: 850;
		line-height: 1.05;
		letter-spacing: -0.035em;
		transition: color 680ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.role-card.is-primary {
		background: #111317;
		color: #ffffff;
	}

	.role-card.is-primary span {
		color: #aeb8c5;
	}

	.role-card.is-primary strong {
		color: #ffffff;
	}

	.role-card:hover,
	.role-card:focus-within {
		z-index: 2;
		background: #111317;
		transform: translateY(-3px);
	}

	.role-card:hover::before,
	.role-card:focus-within::before {
		transform: scaleX(1);
	}

	.role-card:hover span,
	.role-card:focus-within span {
		color: #aeb8c5;
	}

	.role-card:hover strong,
	.role-card:focus-within strong {
		color: #ffffff;
	}

	@media (max-width: 1100px) {
		.role-strip {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.role-card:nth-child(3) {
			border-left: 0;
			border-top: 1px solid rgba(21, 23, 26, 0.1);
		}

		.role-card:nth-child(4) {
			border-top: 1px solid rgba(21, 23, 26, 0.1);
		}
	}

	@media (max-width: 860px) {
		.servicios-grid-container {
			margin: 58px auto;
			scroll-margin-top: 88px;
		}

		.servicios-intro {
			grid-template-columns: 1fr;
			gap: 20px;
			margin-bottom: 26px;
		}

		.servicios-heading h2 {
			font-size: clamp(40px, 11vw, 64px) !important;
		}
	}

	@media (max-width: 620px) {
		.servicios-grid-container {
			padding: 26px 16px 0;
		}

		.servicios-summary {
			font-size: 16.5px;
		}

		.role-strip {
			grid-template-columns: 1fr;
		}

		.role-card,
		.role-card:nth-child(3),
		.role-card:nth-child(4) {
			min-height: 96px;
			border-left: 0;
			border-top: 1px solid rgba(21, 23, 26, 0.1);
			padding: 20px;
		}

		.role-card:first-child {
			border-top: 0;
		}

		.role-card:hover,
		.role-card:focus-within {
			transform: translateY(-3px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.role-card,
		.role-card::before,
		.role-card span,
		.role-card strong {
			transition: none;
		}

		.role-card:hover,
		.role-card:focus-within {
			transform: none;
		}
	}
</style>
