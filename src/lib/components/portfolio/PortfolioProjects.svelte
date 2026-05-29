<script lang="ts">
	import { resolve } from '$app/paths';
	import { reveal } from '$lib';
	import { sitePortfolioDefaults } from '$lib/data/site-portfolio-defaults';
	import { sanityDefaultSrc, sanityImageSrcSet } from '$lib/sanity-image-url';
	import type { SiteProjectCard } from '$lib/types/site-portfolio';

	interface Props {
		meta?: string;
		title?: string;
		intro?: string;
		maxHomeProjects?: number;
		archiveLinkLabel?: string;
		archiveHref?: string;
		projects?: SiteProjectCard[];
	}

	const homeProjectCap = 4;
	const fallbackIntro =
		'Una seleccion curada de productos, e-commerce, automatizaciones e interfaces donde el criterio visual pesa tanto como la arquitectura.';
	const resolvePath = resolve as unknown as (href: string) => string;

	let {
		meta = sitePortfolioDefaults.projects.meta,
		title = sitePortfolioDefaults.projects.title,
		intro = sitePortfolioDefaults.projects.intro ?? fallbackIntro,
		maxHomeProjects = sitePortfolioDefaults.projects.maxHomeProjects ?? homeProjectCap,
		archiveLinkLabel = sitePortfolioDefaults.projects.archiveLinkLabel ?? 'Ver todos los proyectos',
		archiveHref = sitePortfolioDefaults.projects.archiveHref,
		projects = sitePortfolioDefaults.projects.projects
	}: Props = $props();

	const effectiveHomeLimit = $derived(
		maxHomeProjects > 0 ? Math.min(maxHomeProjects, homeProjectCap) : homeProjectCap
	);
	const visibleProjects = $derived(
		effectiveHomeLimit > 0 ? projects.slice(0, effectiveHomeLimit) : projects
	);
	const heroProject = $derived(
		visibleProjects.find((project) => project.homeLayoutTier === 'hero') ?? visibleProjects[0]
	);
	const projectsAfterHero = $derived(
		heroProject ? visibleProjects.filter((project) => project.href !== heroProject.href) : []
	);
	const spotlightProjects = $derived(
		projectsAfterHero.filter((project) => project.homeLayoutTier === 'spotlight').slice(0, 3)
	);
	const spotlightHrefs = $derived(new Set(spotlightProjects.map((project) => project.href)));
	const standardProjects = $derived(
		projectsAfterHero.filter((project) => !spotlightHrefs.has(project.href))
	);

	function projectTarget(project: SiteProjectCard): string | undefined {
		return project.external ? '_blank' : undefined;
	}

	function projectLinkProps(project: SiteProjectCard) {
		return {
			href: project.external ? project.href : resolvePath(project.href),
			target: projectTarget(project),
			rel: projectRel(project)
		};
	}

	function projectRel(project: SiteProjectCard): string | undefined {
		return project.external ? 'noopener noreferrer' : undefined;
	}

	function eyebrowFor(
		project: SiteProjectCard,
		index: number,
		tier: 'hero' | 'spotlight' | 'standard'
	) {
		if (project.homeEyebrow) return project.homeEyebrow;
		const valueTag = project.homeValueTags?.[0] || project.tags[0];
		if (valueTag) return valueTag;
		if (tier === 'hero') return 'Proyecto seleccionado';
		return 'Caso de estudio';
	}

	function proofLineFor(project: SiteProjectCard): string {
		return project.homeProofLine || project.description;
	}

	function valueTagsFor(project: SiteProjectCard, limit: number): string[] {
		const editorial = project.homeValueTags?.filter(Boolean) ?? [];
		const source = editorial.length ? editorial : project.tags;
		return source.slice(0, limit);
	}

	function metaItemsFor(project: SiteProjectCard): string[] {
		return [project.homeRole, project.homeYear, project.homeComplexity].filter(
			(item): item is string => Boolean(item)
		);
	}

	function archiveLinkProps(href: string) {
		return {
			href: /^https?:\/\//i.test(href) ? href : resolvePath(href)
		};
	}

	function heroProjectImage(project: SiteProjectCard) {
		const widths = [640, 800, 960, 1200, 1440, 1600] as const;
		return {
			src: sanityDefaultSrc(project.imageSrc, 1200),
			srcset: sanityImageSrcSet(project.imageSrc, widths),
			sizes: '(max-width: 1100px) 100vw, 670px'
		};
	}

	function spotlightProjectImage(project: SiteProjectCard) {
		const widths = [360, 520, 720, 900, 1100] as const;
		return {
			src: sanityDefaultSrc(project.imageSrc, 720),
			srcset: sanityImageSrcSet(project.imageSrc, widths),
			sizes: '(max-width: 768px) 92vw, (max-width: 1100px) 33vw, 400px'
		};
	}

	function standardProjectImage(project: SiteProjectCard) {
		const widths = [320, 480, 640, 800, 960] as const;
		return {
			src: sanityDefaultSrc(project.imageSrc, 640),
			srcset: sanityImageSrcSet(project.imageSrc, widths),
			sizes: '(max-width: 768px) 92vw, (max-width: 1100px) 33vw, 360px'
		};
	}

	const heroImg = $derived(heroProject ? heroProjectImage(heroProject) : null);
	const projectRevealOptions = {
		stage: 'content',
		distance: 54
	} as const;

	function staggerDelay(index: number, base = 110) {
		return base + index * 110;
	}
</script>

<section class="proyectos-container" id="proyectos" aria-labelledby="proyectos-titulo">
	<div class="proyectos-header" use:reveal={{ stage: 'title' }}>
		<p class="meta-proyectos">{meta}</p>
		<div class="proyectos-heading-row">
			<h2 id="proyectos-titulo">{title}</h2>
			{#if archiveHref}
				<a class="proyectos-archive-link" {...archiveLinkProps(archiveHref)}>
					{archiveLinkLabel}
				</a>
			{/if}
		</div>
		{#if intro}
			<p class="proyectos-intro">{intro}</p>
		{/if}
	</div>

	{#if heroProject && heroImg}
		<div class="project-showcase">
			<a
				class="project-card project-card-hero"
				use:reveal={{ ...projectRevealOptions, delay: 0 }}
				{...projectLinkProps(heroProject)}
				aria-label={`${heroProject.linkLabel}: ${heroProject.title}`}
			>
				<article>
					<div class="project-hero-media">
						<img
							src={heroImg.src}
							srcset={heroImg.srcset}
							sizes={heroImg.sizes}
							alt={heroProject.imageAlt}
							width="1200"
							height="675"
							loading="lazy"
							decoding="async"
						/>
						<div class="project-media-sheen" aria-hidden="true"></div>
					</div>

					<div class="project-hero-copy">
						<div class="project-kicker-row">
							<span class="project-number">01</span>
							<span class="project-eyebrow">{eyebrowFor(heroProject, 0, 'hero')}</span>
						</div>

						<h3>{heroProject.title}</h3>
						<p class="project-proof">{proofLineFor(heroProject)}</p>

						{#if metaItemsFor(heroProject).length}
							<dl class="project-meta-strip">
								{#each metaItemsFor(heroProject) as item, index (item)}
									<div>
										<dt>{index === 0 ? 'Rol' : index === 1 ? 'Año' : 'Complejidad'}</dt>
										<dd>{item}</dd>
									</div>
								{/each}
							</dl>
						{/if}

						<div class="project-value-tags" aria-label="Valores destacados">
							{#each valueTagsFor(heroProject, 7) as tag (tag)}
								<span>{tag}</span>
							{/each}
						</div>

						<span class="project-cta">
							{heroProject.linkLabel}
							<span aria-hidden="true">-></span>
						</span>
					</div>
				</article>
			</a>

			{#if spotlightProjects.length}
				<div class="project-spotlight-grid" aria-label="Proyectos destacados">
					{#each spotlightProjects as project, index (project.href)}
						{@const spotlightImg = spotlightProjectImage(project)}
						<a
							class="project-card project-card-spotlight"
							use:reveal={{
								...projectRevealOptions,
								delay: staggerDelay(index, 220)
							}}
							{...projectLinkProps(project)}
							aria-label={`${project.linkLabel}: ${project.title}`}
						>
							<article>
								<div class="project-thumb">
									<img
										src={spotlightImg.src}
										srcset={spotlightImg.srcset}
										sizes={spotlightImg.sizes}
										alt={project.imageAlt}
										width="700"
										height="394"
										loading="lazy"
										decoding="async"
									/>
								</div>
								<div class="project-compact-copy">
									<div class="project-kicker-row">
										<span class="project-number">{String(index + 2).padStart(2, '0')}</span>
										<span class="project-eyebrow">{eyebrowFor(project, index, 'spotlight')}</span>
									</div>
									<h3>{project.title}</h3>
									<p>{proofLineFor(project)}</p>
									<div class="project-value-tags">
										{#each valueTagsFor(project, 4) as tag (tag)}
											<span>{tag}</span>
										{/each}
									</div>
									<span class="project-cta">
										{project.linkLabel}
										<span aria-hidden="true">-></span>
									</span>
								</div>
							</article>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if standardProjects.length}
		<div class="project-standard-grid" aria-label="Mas casos de estudio">
			{#each standardProjects as project, index (project.href)}
				{@const standardImg = standardProjectImage(project)}
				<a
					class="project-card project-card-standard"
					use:reveal={{
						...projectRevealOptions,
						delay: staggerDelay(index)
					}}
					{...projectLinkProps(project)}
					aria-label={`${project.linkLabel}: ${project.title}`}
				>
					<article>
						<div class="project-standard-media">
							<img
								src={standardImg.src}
								srcset={standardImg.srcset}
								sizes={standardImg.sizes}
								alt={project.imageAlt}
								width="520"
								height="293"
								loading="lazy"
								decoding="async"
							/>
						</div>
						<div class="project-standard-copy">
							<div class="project-kicker-row">
								<span class="project-number">
									{String(index + spotlightProjects.length + 2).padStart(2, '0')}
								</span>
								<span class="project-eyebrow">{eyebrowFor(project, index, 'standard')}</span>
							</div>
							<h3>{project.title}</h3>
							<p>{proofLineFor(project)}</p>
							<div class="project-value-tags">
								{#each valueTagsFor(project, 3) as tag (tag)}
									<span>{tag}</span>
								{/each}
							</div>
							<span class="project-cta">
								{project.linkLabel}
								<span aria-hidden="true">-></span>
							</span>
						</div>
					</article>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.proyectos-container {
		width: min(100% - 40px, 1240px);
		margin: 112px auto;
		font-family: inherit;
		scroll-margin-top: 96px;
	}

	.proyectos-header {
		margin-bottom: 34px;
	}

	.meta-proyectos {
		color: #0071e3;
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 12px;
	}

	.proyectos-heading-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
		gap: 24px;
	}

	.proyectos-header h2 {
		color: #101114;
		font-size: clamp(38px, 5vw, 72px);
		font-weight: 850;
		line-height: 0.94;
		letter-spacing: -0.045em;
		max-width: 760px;
	}

	.proyectos-intro {
		max-width: 720px;
		color: #4a4f5c;
		font-size: clamp(16px, 1.6vw, 19px);
		line-height: 1.58;
		margin-top: 22px;
	}

	.proyectos-archive-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 46px;
		padding: 0 18px;
		color: var(--portfolio-action-primary-text);
		text-decoration: none;
		font-size: 14px;
		font-weight: 820;
		border: 1px solid var(--portfolio-action-primary-border);
		border-radius: var(--portfolio-action-radius);
		background: var(--portfolio-action-primary-bg);
		box-shadow: var(--portfolio-action-primary-shadow);
		transition:
			transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
			background-color 260ms cubic-bezier(0.16, 1, 0.3, 1),
			border-color 260ms cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 260ms cubic-bezier(0.16, 1, 0.3, 1),
			color 260ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.proyectos-archive-link::after {
		content: '->';
		color: currentColor;
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 820;
		transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.proyectos-archive-link:hover,
	.proyectos-archive-link:focus-visible {
		transform: translateY(-2px);
		border-color: var(--portfolio-action-primary-bg-hover);
		background: var(--portfolio-action-primary-bg-hover);
		color: var(--portfolio-action-primary-text);
		box-shadow: var(--portfolio-action-primary-shadow);
	}

	.proyectos-archive-link:hover::after,
	.proyectos-archive-link:focus-visible::after {
		transform: translateX(3px);
	}

	.project-showcase {
		display: block;
	}

	.project-showcase + .project-standard-grid {
		margin-top: 18px;
	}

	.project-showcase {
		gap: 18px;
	}

	.project-card {
		color: inherit;
		text-decoration: none;
		display: block;
		position: relative;
		border: 1px solid rgba(15, 23, 42, 0.12);
		border-radius: 8px;
		overflow: hidden;
		background: #ffffff;
		box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
		isolation: isolate;
		transition:
			transform 420ms cubic-bezier(0.16, 1, 0.3, 1),
			border-color 420ms cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.project-card::before {
		content: none;
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		opacity: 0;
		background:
			linear-gradient(115deg, transparent 10%, rgba(255, 255, 255, 0.52) 32%, transparent 52%),
			radial-gradient(
				circle at var(--x, 68%) var(--y, 18%),
				rgba(0, 113, 227, 0.16),
				transparent 34%
			);
		transform: translateX(-18%);
		transition:
			opacity 420ms cubic-bezier(0.16, 1, 0.3, 1),
			transform 720ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.project-card:hover,
	.project-card:focus-visible {
		transform: translateY(-4px);
		border-color: rgba(0, 113, 227, 0.34);
		box-shadow: 0 18px 38px rgba(15, 23, 42, 0.09);
		outline: none;
	}

	.project-card:hover::before,
	.project-card:focus-visible::before {
		opacity: 1;
		transform: translateX(18%);
	}

	.project-card article {
		height: 100%;
	}

	.project-card-hero article {
		display: grid;
		grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
		min-height: 360px;
	}

	.project-hero-media,
	.project-thumb,
	.project-standard-media {
		position: relative;
		overflow: hidden;
		background: #f5f8fc;
	}

	.project-hero-media img,
	.project-thumb img,
	.project-standard-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transform: scale(1.012);
		transition: transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.project-hero-media {
		min-height: 360px;
		background: #f5f8fc;
	}

	.project-hero-media img {
		object-fit: contain;
		object-position: center top;
		padding: clamp(12px, 1.6vw, 20px);
		transform: scale(1);
	}

	.project-card-hero:hover .project-hero-media img,
	.project-card-hero:focus-visible .project-hero-media img {
		transform: scale(1.025);
	}

	.project-card:hover img,
	.project-card:focus-visible img {
		transform: scale(1.06);
	}

	.project-media-sheen {
		position: absolute;
		inset: auto 0 0;
		height: 38%;
		background: linear-gradient(180deg, rgba(16, 17, 20, 0), rgba(16, 17, 20, 0.24));
		pointer-events: none;
	}

	.project-hero-copy {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: clamp(24px, 3vw, 38px);
		background: #ffffff;
	}

	.project-kicker-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
	}

	.project-number {
		font-family: var(--font-mono, monospace);
		color: #0071e3;
		font-size: 12px;
		font-weight: 760;
		letter-spacing: 0.06em;
	}

	.project-eyebrow {
		color: #6f7480;
		font-size: 11px;
		font-weight: 820;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.project-card h3 {
		color: #101114;
		font-size: clamp(24px, 2.65vw, 38px);
		line-height: 1.02;
		letter-spacing: -0.038em;
		font-weight: 850;
		margin: 0;
	}

	.project-proof {
		color: #303541;
		font-size: clamp(15.5px, 1.28vw, 17.5px);
		line-height: 1.55;
		margin-top: 16px;
		max-width: 790px;
	}

	.project-meta-strip {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		margin: 20px 0 0;
		overflow: hidden;
		border: 1px solid rgba(15, 23, 42, 0.1);
		border-radius: 8px;
		background: rgba(15, 23, 42, 0.08);
	}

	.project-meta-strip div {
		padding: 14px 16px;
		background: rgba(255, 255, 255, 0.76);
	}

	.project-meta-strip dt {
		color: #7b8190;
		font-size: 10px;
		font-weight: 780;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	.project-meta-strip dd {
		color: #101114;
		font-size: 14px;
		font-weight: 760;
		margin-top: 4px;
	}

	.project-value-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin-top: 18px;
		padding-top: 13px;
		border-top: 1px solid rgba(15, 23, 42, 0.1);
	}

	.project-value-tags span {
		display: inline-flex;
		align-items: center;
		min-height: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		color: #475569;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 760;
		letter-spacing: 0.06em;
		line-height: 1.35;
		text-transform: uppercase;
	}

	.project-value-tags span:not(:last-child)::after {
		content: '/';
		margin: 0 9px;
		color: rgba(71, 85, 105, 0.42);
	}

	.project-cta {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		margin-top: 20px;
		color: #101114;
		font-size: 14px;
		font-weight: 820;
	}

	.project-cta span {
		color: #0071e3;
		transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.project-card:hover .project-cta span,
	.project-card:focus-visible .project-cta span {
		transform: translateX(5px);
	}

	.project-spotlight-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
		margin-top: 18px;
	}

	.project-card-spotlight article {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.project-thumb {
		aspect-ratio: 16 / 9;
		min-height: 0;
		background: #f5f8fc;
	}

	.project-card-spotlight .project-thumb img {
		object-fit: contain;
		object-position: center top;
		padding: 10px;
		transform: scale(1);
	}

	.project-card-spotlight:hover .project-thumb img,
	.project-card-spotlight:focus-visible .project-thumb img {
		transform: scale(1.035);
	}

	.project-compact-copy,
	.project-standard-copy {
		position: relative;
		z-index: 2;
		padding: 22px;
	}

	.project-compact-copy h3,
	.project-standard-copy h3 {
		font-size: 22px;
		line-height: 1.08;
		letter-spacing: -0.03em;
	}

	.project-compact-copy p,
	.project-standard-copy p {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: #4a4f5c;
		font-size: 14px;
		line-height: 1.5;
		margin-top: 12px;
	}

	.project-card-spotlight .project-compact-copy p {
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.project-standard-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
		margin-top: 18px;
	}

	.project-card-standard article {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.project-standard-media {
		aspect-ratio: 16 / 9;
	}

	.project-card-standard .project-value-tags span,
	.project-card-spotlight .project-value-tags span {
		min-height: 0;
		font-size: 11px;
		color: #475569;
		background: transparent;
	}

	@media (max-width: 1100px) {
		.project-card-hero article {
			grid-template-columns: 1fr;
			min-height: 0;
		}

		.project-hero-media {
			aspect-ratio: 16 / 8.6;
			min-height: 0;
		}

		.project-standard-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 768px) {
		.proyectos-container {
			width: min(100% - 28px, 1240px);
			margin: 72px auto;
			scroll-margin-top: 88px;
		}

		.proyectos-heading-row {
			grid-template-columns: 1fr;
			align-items: start;
			gap: 18px;
		}

		.proyectos-header h2 {
			font-size: clamp(34px, 12vw, 48px);
		}

		.proyectos-intro {
			font-size: 15.5px;
			line-height: 1.55;
		}

		.project-hero-copy,
		.project-compact-copy,
		.project-standard-copy {
			padding: 20px;
		}

		.project-card-hero h3 {
			font-size: clamp(25px, 7vw, 34px);
		}

		.project-card-hero .project-proof {
			display: -webkit-box;
			-webkit-line-clamp: 3;
			line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.project-meta-strip {
			grid-template-columns: 1fr;
		}

		.project-spotlight-grid,
		.project-standard-grid {
			grid-template-columns: 1fr;
		}

		.project-card:hover,
		.project-card:focus-visible {
			transform: translateY(-4px);
		}
	}

	@media (max-width: 560px) {
		.project-hero-media {
			aspect-ratio: 16 / 8;
		}

		.project-card-hero .project-value-tags span:nth-child(n + 6) {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card,
		.project-card::before,
		.project-card img,
		.project-cta span {
			transition: none !important;
		}
	}

	:global(html.dark) .project-card {
		background: #111111;
		border-color: rgba(255, 255, 255, 0.12);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
	}

	:global(html.dark) .project-card:hover,
	:global(html.dark) .project-card:focus-visible {
		border-color: rgba(255, 255, 255, 0.28);
		box-shadow: 0 20px 48px rgba(0, 0, 0, 0.38);
	}

	:global(html.dark) .proyectos-header h2,
	:global(html.dark) .project-card h3,
	:global(html.dark) .project-meta-strip dd,
	:global(html.dark) .project-cta {
		color: #f8fafc;
	}

	:global(html.dark) .proyectos-intro,
	:global(html.dark) .project-proof,
	:global(html.dark) .project-compact-copy p,
	:global(html.dark) .project-standard-copy p {
		color: #d4d4d8;
	}

	:global(html.dark) .project-hero-copy,
	:global(html.dark) .project-meta-strip div {
		background: rgba(18, 18, 18, 0.86);
	}

	:global(html.dark) .project-meta-strip {
		border-color: rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.1);
	}

	:global(html.dark) .project-value-tags span {
		border-color: transparent;
		background: transparent;
		color: #d4d4d8;
	}

	:global(html.dark) .project-value-tags {
		border-top-color: rgba(255, 255, 255, 0.12);
	}

	:global(html.dark) .project-value-tags span:not(:last-child)::after {
		color: rgba(212, 212, 216, 0.38);
	}

	:global(html.dark) .proyectos-archive-link {
		color: var(--portfolio-action-primary-text);
		border-color: var(--portfolio-action-primary-border);
		background: var(--portfolio-action-primary-bg);
	}
</style>
