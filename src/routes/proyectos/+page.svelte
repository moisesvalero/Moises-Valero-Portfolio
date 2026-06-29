<script lang="ts">
	import { resolve } from '$app/paths';
	import { sanityDefaultSrc, sanityImageSrcSet } from '$lib/sanity-image-url';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const resolvePath = resolve as unknown as (href: string) => string;
	const projects = $derived(
		(data.projects ?? []).toSorted((a, b) => {
			const dateA = a.createdAt ?? '';
			const dateB = b.createdAt ?? '';
			return dateB.localeCompare(dateA);
		})
	);
	const baseUrl = $derived(
		(data.canonicalUrl ?? 'https://moisesvalero.es/proyectos').replace(/\/$/, '')
	);

	function hrefFor(href: string): string {
		return /^https?:\/\//i.test(href) ? href : resolvePath(href);
	}

	function projectImage(src: string) {
		const widths = [360, 520, 720, 900, 1100] as const;
		return {
			src: sanityDefaultSrc(src, 720),
			srcset: sanityImageSrcSet(src, widths),
			sizes: '(max-width: 640px) 92vw, (max-width: 960px) 46vw, 352px'
		};
	}
</script>

<svelte:head>
	<title>Proyectos | Moisés Valero</title>
	<meta
		name="description"
		content="Archivo de proyectos web, aplicaciones, integraciones e interfaces desarrolladas por Moisés Valero."
	/>
	<link rel="canonical" href={baseUrl} />
</svelte:head>

<main class="projects-page">
	<section class="projects-hero" aria-labelledby="projects-title">
		<div>
			<a class="back-link" href={resolve('/#proyectos')}>Portfolio</a>
			<p class="eyebrow">Archivo de proyectos</p>
			<h1 id="projects-title">Proyectos</h1>
			<p class="hero-copy">
				Trabajos, pruebas técnicas y soluciones web organizadas como archivo vivo. La home muestra
				una selección; aquí queda el recorrido completo.
			</p>
		</div>
		<div class="hero-meta" aria-label="Resumen del archivo">
			<span>{projects.length}</span>
			<p>{projects.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}</p>
		</div>
	</section>

	<section class="projects-archive" aria-label="Listado de proyectos">
		{#if projects.length}
			<div class="archive-grid">
				{#each projects as project (project.href)}
					{@const image = projectImage(project.imageSrc)}
					{@const cardHref = hrefFor(project.href)}
					<a
						class="archive-card"
						href={cardHref}
						target={project.external ? '_blank' : undefined}
						rel={project.external ? 'noopener noreferrer' : undefined}
						aria-label={`${project.linkLabel}: ${project.title}`}
					>
						<article>
							<div class="card-media">
								<img
									src={image.src}
									srcset={image.srcset}
									sizes={image.sizes}
									alt={project.imageAlt}
									width="720"
									height="405"
									loading="lazy"
									decoding="async"
								/>
							</div>
							<div class="card-copy">
								<div class="card-topline">
									<span>{project.homeEyebrow || project.tags[0] || 'Proyecto'}</span>
								</div>
								<h2>{project.title}</h2>
								<p>{project.homeProofLine || project.description}</p>
								{#if project.tags.length}
									<ul class="tag-list" aria-label="Tecnologías">
										{#each project.tags.slice(0, 4) as tag (tag)}
											<li>{tag}</li>
										{/each}
									</ul>
								{/if}
								<span class="project-cta">
									{project.linkLabel}
									<span aria-hidden="true">-></span>
								</span>
							</div>
						</article>
					</a>
				{/each}
			</div>
		{:else}
			<p class="empty-state">Todavía no hay proyectos publicados.</p>
		{/if}
	</section>
</main>

<style>
	.projects-page {
		background:
			radial-gradient(circle at 50% 0%, rgba(0, 113, 227, 0.1), transparent 32rem),
			linear-gradient(
				180deg,
				rgba(232, 240, 249, 0.96),
				rgba(242, 246, 251, 0.9) 42%,
				#f8fafc 100%
			),
			#e9f0f8;
		color: #111827;
		min-height: 100vh;
	}

	.projects-hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(180px, 260px);
		gap: clamp(36px, 7vw, 96px);
		align-items: end;
		width: min(100% - 48px, 1120px);
		margin: 0 auto;
		padding: clamp(78px, 12vw, 148px) 0 clamp(44px, 8vw, 86px);
	}

	.back-link,
	.eyebrow,
	.card-topline {
		font-size: 12px;
		font-weight: 820;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.back-link {
		color: #006ee6;
		text-decoration: none;
	}

	.eyebrow {
		color: #006ee6;
		margin-top: 28px;
	}

	h1 {
		max-width: 780px;
		margin: 18px 0 0;
		color: #111827;
		font-size: clamp(64px, 12vw, 132px);
		font-weight: 880;
		line-height: 0.88;
		letter-spacing: -0.065em;
	}

	.hero-copy {
		max-width: 720px;
		margin-top: 28px;
		color: #526070;
		font-size: clamp(17px, 2vw, 21px);
		line-height: 1.58;
	}

	.hero-meta {
		border-left: 1px solid rgba(15, 23, 42, 0.14);
		padding-left: 28px;
	}

	.hero-meta span {
		display: block;
		color: #111827;
		font-size: clamp(30px, 4vw, 46px);
		font-weight: 840;
		line-height: 0.95;
		letter-spacing: -0.04em;
	}

	.hero-meta p {
		max-width: 18ch;
		margin-top: 10px;
		color: #5b6676;
		font-size: 13px;
		font-weight: 680;
		line-height: 1.35;
	}

	.projects-archive {
		padding: clamp(28px, 5vw, 56px) 0 clamp(74px, 10vw, 128px);
	}

	.archive-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
		width: min(100% - 48px, 1120px);
		margin: 0 auto;
	}

	.archive-card {
		color: inherit;
		text-decoration: none;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 8px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.78);
		box-shadow: 0 20px 54px rgba(15, 23, 42, 0.07);
		transition:
			transform 360ms cubic-bezier(0.16, 1, 0.3, 1),
			border-color 360ms cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 360ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.archive-card:hover,
	.archive-card:focus-visible {
		transform: translateY(-6px);
		border-color: rgba(0, 113, 227, 0.34);
		box-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);
		outline: none;
	}

	.archive-card article {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
	}

	.card-media {
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(232, 238, 247, 0.78)), #eef2f7;
	}

	.card-media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: center top;
		padding: 10px;
		transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.archive-card:hover .card-media img,
	.archive-card:focus-visible .card-media img {
		transform: scale(1.035);
	}

	.card-copy {
		padding: 22px;
	}

	.card-topline {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		color: #006ee6;
	}

	.card-topline time {
		color: #7b8190;
	}

	h2 {
		margin-top: 14px;
		color: #111827;
		font-size: clamp(22px, 2.2vw, 28px);
		font-weight: 840;
		line-height: 1.05;
		letter-spacing: -0.035em;
	}

	.card-copy p {
		display: -webkit-box;
		margin-top: 12px;
		overflow: hidden;
		color: #4b5563;
		font-size: 14.5px;
		line-height: 1.5;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 18px 0 0;
		padding: 0;
		list-style: none;
	}

	.tag-list li {
		min-height: 25px;
		padding: 6px 10px;
		border: 1px solid rgba(0, 113, 227, 0.16);
		border-radius: 6px;
		background: rgba(0, 113, 227, 0.06);
		color: #155ea8;
		font-size: 11px;
		font-weight: 760;
		line-height: 1;
	}

	.project-cta {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		margin-top: 20px;
		color: #111827;
		font-size: 14px;
		font-weight: 820;
	}

	.project-cta span {
		color: #0071e3;
		transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.archive-card:hover .project-cta span,
	.archive-card:focus-visible .project-cta span {
		transform: translateX(5px);
	}

	.empty-state {
		width: min(100% - 48px, 1120px);
		margin: 0 auto;
		color: #526070;
		font-size: 17px;
	}

	@media (max-width: 960px) {
		.projects-hero {
			grid-template-columns: 1fr;
			gap: 32px;
		}

		.hero-meta {
			border-left: 0;
			border-top: 1px solid rgba(15, 23, 42, 0.14);
			padding: 24px 0 0;
		}

		.archive-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	:global(html.dark) .projects-page {
		background:
			radial-gradient(circle at 50% 0%, rgba(77, 163, 255, 0.14), transparent 32rem),
			linear-gradient(180deg, rgba(12, 18, 30, 0.98), rgba(7, 12, 21, 0.94) 42%, #0a0a0a 100%),
			#0c1220;
		color: #f8fafc;
	}

	:global(html.dark) h1,
	:global(html.dark) h2,
	:global(html.dark) .hero-meta span,
	:global(html.dark) .project-cta {
		color: #f8fafc;
	}

	:global(html.dark) .hero-copy,
	:global(html.dark) .hero-meta p,
	:global(html.dark) .empty-state {
		color: #d4d4d8;
	}

	:global(html.dark) .hero-meta {
		border-color: rgba(255, 255, 255, 0.18);
	}

	:global(html.dark) .archive-card {
		border-color: rgba(255, 255, 255, 0.12);
		background: rgba(18, 18, 18, 0.86);
		box-shadow: 0 20px 54px rgba(0, 0, 0, 0.26);
	}

	:global(html.dark) .card-media {
		background: #101827;
	}

	:global(html.dark) .card-copy p,
	:global(html.dark) .card-topline time {
		color: #d4d4d8;
	}

	:global(html.dark) .tag-list li {
		border-color: rgba(77, 163, 255, 0.24);
		background: rgba(77, 163, 255, 0.08);
		color: #a7d5ff;
	}

	@media (max-width: 640px) {
		.projects-hero,
		.archive-grid,
		.empty-state {
			width: min(100% - 28px, 1120px);
		}

		h1 {
			font-size: clamp(48px, 18vw, 72px);
			letter-spacing: -0.055em;
		}

		.archive-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.archive-card,
		.card-media img,
		.project-cta span {
			transition: none !important;
		}
	}
</style>
