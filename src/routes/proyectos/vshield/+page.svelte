<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { projectLiveUrls } from '$lib/data/project-live-urls';
	import { getProyectoPageLabels } from '$lib/i18n/proyecto-page-labels';
	import { getVshieldPageCopy } from '$lib/i18n/proyectos/vshield-copy';
	import JsonLdScript from '$lib/components/JsonLdScript.svelte';
	import { stringifyJsonLdForHtml } from '$lib/json-ld-html.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const baseUrl = new URL(env.PUBLIC_SITE_URL || 'https://moisesvalero.es')
		.toString()
		.replace(/\/$/, '');
	const canonical = `${baseUrl}/proyectos/vshield`;
	const ogImage = `${baseUrl}/og-image-2026.png`;
	const ogTitleShort = 'V-Shield — Caso de Estudio';
	const ogDesc =
		'Landing de ciberseguridad con terminal interactiva, formulario sin plugins y optimización de rendimiento.';

	const c = $derived(getVshieldPageCopy(data.locale));
	const L = $derived(getProyectoPageLabels(data.locale));
	const seoEs = getVshieldPageCopy('es');
	const projectJsonLd = $derived(
		stringifyJsonLdForHtml({
			'@context': 'https://schema.org',
			'@type': 'CreativeWork',
			name: seoEs.heroTitle,
			description: seoEs.headDescription,
			url: canonical,
			inLanguage: data.locale,
			author: {
				'@type': 'Person',
				name: 'Moisés Valero'
			},
			image: ogImage
		})
	);
</script>

<svelte:head>
	<title>{seoEs.headTitle}</title>
	<meta name="description" content={seoEs.headDescription} />
	<link rel="alternate" hreflang="es" href={canonical} />
	<link rel="alternate" hreflang="x-default" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={ogTitleShort} />
	<meta property="og:description" content={ogDesc} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content="Moisés Valero" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitleShort} />
	<meta name="twitter:description" content={ogDesc} />
	<meta name="twitter:image" content={ogImage} />
	<JsonLdScript json={projectJsonLd} />
</svelte:head>

<div class="vshield-page">
	<section class="hero">
		<div class="hero-inner">
			<span class="hero-tag">{c.heroTag}</span>
			<h1>{c.heroTitle}</h1>
			<p class="hero-sub">{c.heroSub}</p>
			<div class="tags">
				<span class="tag">WordPress</span>
				<span class="tag">Elementor</span>
				<span class="tag">Astra</span>
				<span class="tag">JavaScript</span>
				<span class="tag">Custom Scripts</span>
				<span class="tag">Prompt Engineering</span>
			</div>
		</div>
	</section>

	<div class="mockup-container">
		<div class="window-mockup">
			<div class="window-header">
				<div class="dot red"></div>
				<div class="dot yellow"></div>
				<div class="dot green"></div>
			</div>
			<div class="window-content">
				<img
					src="/imagenes/captura-vshieldfinal_ember-scaled.avif"
					alt={c.imgMainAlt}
					width="1200"
					height="800"
					loading="eager"
					decoding="async"
				/>
			</div>
		</div>
	</div>

	<div class="stats-section">
		<div class="stats-grid">
			<div class="stat">
				<span class="stat-num">{@html c.stat1Num}</span>
				<span class="stat-label">{c.stat1Label}</span>
			</div>
			<div class="stat">
				<span class="stat-num">{@html c.stat2Num}</span>
				<span class="stat-label">{c.stat2Label}</span>
			</div>
			<div class="stat">
				<span class="stat-num">{@html c.stat3Num}</span>
				<span class="stat-label">{c.stat3Label}</span>
			</div>
			<div class="stat">
				<span class="stat-num">{@html c.stat4Num}</span>
				<span class="stat-label">{c.stat4Label}</span>
			</div>
		</div>
	</div>

	<div class="content">
		<div class="section">
			<p class="section-label">{L.elReto}</p>
			<h2>{c.retoTitle}</h2>
			<p>{c.retoP}</p>
		</div>
		<div class="section">
			<p class="section-label">{L.loQueHice}</p>
			<h2>{c.hiceTitle}</h2>
			<p>{c.hiceP1}</p>
			<div class="highlight-box">
				{@html c.hiceHighlightHtml}
			</div>
			<p>{c.hiceP2}</p>
		</div>
	</div>

	<div class="mockup-grid-container">
		<div class="window-mockup-small">
			<div class="window-header">
				<div class="dot red"></div>
				<div class="dot yellow"></div>
				<div class="dot green"></div>
			</div>
			<div class="window-content-static">
				<img
					src="/imagenes/terminalfinal.jpeg"
					alt={c.imgTerminalAlt}
					width="800"
					height="600"
					loading="lazy"
					decoding="async"
				/>
			</div>
		</div>

		<div class="window-mockup-small">
			<div class="window-header">
				<div class="dot red"></div>
				<div class="dot yellow"></div>
				<div class="dot green"></div>
			</div>
			<div class="window-content-static">
				<img
					src="/imagenes/formulario-vshield.jpeg"
					alt={c.imgFormAlt}
					width="800"
					height="600"
					loading="lazy"
					decoding="async"
				/>
			</div>
		</div>
	</div>

	<div class="content">
		<div class="section section-result">
			<p class="section-label">{L.resultado}</p>
			<h2>{c.resultadoTitle}</h2>
			<p>{c.resultadoP}</p>
		</div>
	</div>

	<div class="stack-section">
		<div class="stack-inner">
			<p class="section-label stack-label">{L.stackTech}</p>
			<div class="stack-grid">
				<span class="stack-item">WordPress</span>
				<span class="stack-item">Astra</span>
				<span class="stack-item">Elementor</span>
				<span class="stack-item">JavaScript</span>
				<span class="stack-item">Formspree</span>
				<span class="stack-item">SVG Icons</span>
				<span class="stack-item">Autoptimize</span>
				<span class="stack-item">Yoast SEO</span>
				<span class="stack-item">WPS Hide Login</span>
				<span class="stack-item">Cursor Agent</span>
			</div>
		</div>
	</div>

	<div class="cta-section">
		<h3>{c.ctaTitle}</h3>
		<p class="cta-lead">{c.ctaLead}</p>
		<a href={projectLiveUrls.vShield} class="btn" target="_blank" rel="noopener noreferrer"
			>{c.ctaBtn}</a
		>
		<a href="/#proyectos" class="btn btn-outline">{c.ctaBack}</a>
	</div>
</div>

<style>
	.vshield-page {
		--principal: #1d1d1f;
		--secundario: #86868b;
		--enfasis: #0071e3;
		--fondo: #ffffff;
		--fondo-suave: #f5f5f7;
		--borde: #e8e8ed;

		font-family: var(--font-sans);
		background: var(--fondo);
		color: var(--principal);
		line-height: 1.6;
		width: 100%;
	}

	.hero {
		background: var(--fondo-suave);
		padding: 100px 48px 80px;
		width: 100%;
	}

	.hero-inner {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-tag {
		display: inline-block;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--enfasis);
		margin-bottom: 20px;
	}

	.hero h1 {
		font-size: clamp(40px, 6vw, 72px);
		font-weight: 700;
		line-height: 1.05;
		letter-spacing: -2px;
		color: var(--principal);
		margin-bottom: 20px;
	}

	.hero-sub {
		font-size: 20px;
		color: var(--secundario);
		font-weight: 400;
		margin-bottom: 40px;
		max-width: 560px;
		line-height: 1.5;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag {
		background: #fff;
		color: var(--principal);
		font-size: 13px;
		font-weight: 500;
		padding: 6px 14px;
		border-radius: 100px;
		border: 1px solid var(--borde);
	}

	.mockup-container {
		background: var(--fondo-suave);
		padding: 80px 48px;
		display: flex;
		justify-content: center;
		border-top: 1px solid var(--borde);
		border-bottom: 1px solid var(--borde);
	}

	.window-mockup {
		--mock-inner-height: calc(550px - 34px);
		width: 100%;
		max-width: 1000px;
		height: 550px;
		background: #fff;
		border-radius: 16px;
		box-shadow:
			0 30px 100px rgba(0, 0, 0, 0.15),
			0 10px 20px rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.08);
		overflow: hidden;
		position: relative;
		transition:
			transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
			box-shadow 0.4s ease;
	}

	.window-mockup:hover {
		transform: translateY(-8px);
		box-shadow:
			0 50px 120px rgba(0, 0, 0, 0.2),
			0 20px 40px rgba(0, 0, 0, 0.1);
	}

	.window-header {
		height: 34px;
		background: #f8f8f9;
		border-bottom: 1px solid var(--borde);
		display: flex;
		align-items: center;
		padding: 0 18px;
		gap: 7px;
		position: sticky;
		top: 0;
		z-index: 2;
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}

	.dot.red {
		background: #ff5f57;
		border: 1px solid #e0443e;
	}

	.dot.yellow {
		background: #ffbd2e;
		border: 1px solid #dea123;
	}

	.dot.green {
		background: #28c840;
		border: 1px solid #1aab29;
	}

	.window-content {
		width: 100%;
		height: calc(100% - 34px);
		cursor: n-resize;
		overflow: hidden;
	}

	.window-content img {
		width: 100%;
		height: auto;
		display: block;
		transition: transform 6s ease-in-out;
	}

	.window-mockup:hover .window-content img {
		transform: translateY(min(0px, calc(-100% + var(--mock-inner-height))));
	}

	.mockup-grid-container {
		background: var(--fondo-suave);
		padding: 80px 48px;
		display: flex;
		justify-content: center;
		gap: 40px;
	}

	.window-mockup-small {
		flex: 1;
		max-width: 500px;
		height: 380px;
		background: #fff;
		border-radius: 14px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.1),
			0 8px 15px rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.06);
		overflow: hidden;
		position: relative;
		transition: transform 0.3s ease;
	}

	.window-mockup-small:hover {
		transform: translateY(-5px);
	}

	.window-content-static {
		width: 100%;
		height: calc(100% - 34px);
	}

	.window-content-static img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		display: block;
	}

	.stats-section {
		background: #1d1d1f;
		padding: 48px;
		color: #fff;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		max-width: 1200px;
		margin: 0 auto;
	}

	.stat {
		text-align: center;
		padding: 24px;
		border-right: 1px solid rgba(255, 255, 255, 0.1);
	}

	.stat:last-child {
		border-right: none;
	}

	.stat-num {
		font-size: 42px;
		font-weight: 700;
		color: #fff;
		letter-spacing: -1.5px;
		display: block;
	}

	.stat-label {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 6px;
		display: block;
	}

	.content {
		max-width: 760px;
		margin: 0 auto;
		padding: 80px 24px;
	}

	.section {
		margin-bottom: 64px;
	}

	.section-result {
		margin-top: 0;
	}

	.section-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: var(--secundario);
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--borde);
	}

	.stack-label {
		border-bottom: none;
		padding-bottom: 0;
	}

	.section h2 {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.8px;
		color: var(--principal);
		margin-bottom: 16px;
		line-height: 1.2;
	}

	.section p {
		font-size: 17px;
		color: #3a3a3c;
		line-height: 1.8;
		margin-bottom: 16px;
	}

	.highlight-box {
		background: #f0f7ff;
		border: 1px solid #cce0ff;
		border-radius: 12px;
		padding: 24px;
		margin: 24px 0;
	}

	.highlight-box :global(p) {
		color: #0055b3;
		font-size: 16px;
		margin: 0;
		line-height: 1.6;
	}

	.highlight-box :global(strong) {
		color: #003d80;
	}

	.stack-section {
		background: var(--fondo-suave);
		padding: 64px 48px;
		border-top: 1px solid var(--borde);
		border-bottom: 1px solid var(--borde);
	}

	.stack-inner {
		max-width: 760px;
		margin: 0 auto;
	}

	.stack-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.stack-item {
		background: var(--principal);
		color: #fff;
		font-size: 13px;
		font-weight: 500;
		padding: 10px 18px;
		border-radius: 8px;
	}

	.cta-section {
		padding: 100px 48px;
		text-align: center;
	}

	.cta-section h3 {
		font-size: 24px;
		font-weight: 700;
		color: var(--principal);
		margin-bottom: 12px;
		letter-spacing: -0.5px;
	}

	.cta-lead {
		color: var(--secundario);
		margin-bottom: 30px;
		font-size: 17px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--enfasis);
		color: #fff;
		font-size: 15px;
		font-weight: 600;
		padding: 16px 32px;
		border-radius: 100px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.btn:hover {
		opacity: 0.85;
		transform: translateY(-2px);
	}

	.btn-outline {
		background: transparent;
		color: var(--principal);
		border: 1.5px solid var(--borde);
		margin-left: 14px;
	}

	@media (max-width: 768px) {
		.hero,
		.stats-section,
		.mockup-container,
		.mockup-grid-container {
			padding: 40px 24px;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.window-mockup {
			height: 350px;
			--mock-inner-height: calc(350px - 34px);
		}

		.mockup-grid-container {
			flex-direction: column;
			gap: 30px;
		}

		.window-mockup-small {
			height: 280px;
		}

		.btn-outline {
			margin-left: 0;
			margin-top: 12px;
		}

		.cta-section .btn {
			display: inline-flex;
			width: 100%;
			max-width: 320px;
			justify-content: center;
		}
	}
</style>
