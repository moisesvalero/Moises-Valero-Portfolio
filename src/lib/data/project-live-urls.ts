/**
 * URLs públicas de proyectos desplegados (subdominios y dominios propios).
 * Referencia para portfolio, seeds y documentación.
 */
export const projectLiveUrls = {
	portfolio: 'https://moisesvalero.es',
	portfolioWww: 'https://www.moisesvalero.es',
	sanityAdmin: 'https://admin.moisesvalero.es',
	novakit: 'https://novakit.moisesvalero.es',
	emberIron: 'https://ember.moisesvalero.es',
	vShield: 'https://v-shield.moisesvalero.es',
	galeriaNova: 'https://galerianova.moisesvalero.es',
	galeriaNovaV2: 'https://galerianova.es',
	soporteIt: 'https://soporte.moisesvalero.es',
	sideglass: 'https://sideglass.moisesvalero.es',
	webAnalyzer: 'https://syrax-analyzer.moisesvalero.es',
	agentChecker: 'https://agentcheck.moisesvalero.es',
	scanit: 'https://scanit.moisesvalero.es',
	cvGenerator: 'https://cv.moisesvalero.es',
	win95Gpt: 'https://win95.moisesvalero.es',
	devDays: 'https://devdays.moisesvalero.es',
	primeHaus: 'https://prime.moisesvalero.es',
	recepcionistaIa: 'https://recepcionista.moisesvalero.es'
} as const;

/** Slug Sanity `caseStudy` → URL demo pública (subdominio custom). */
export const caseStudySlugLiveUrls: Partial<Record<string, string>> = {
	novakit: projectLiveUrls.novakit,
	vshield: projectLiveUrls.vShield,
	'ember-iron': projectLiveUrls.emberIron,
	'galeria-nova': projectLiveUrls.galeriaNova,
	'rebranding-galeria-nova': projectLiveUrls.galeriaNova,
	'sideglass-dashboard': projectLiveUrls.sideglass,
	agentchecker: projectLiveUrls.agentChecker,
	'web-analyzer': projectLiveUrls.webAnalyzer,
	scanit: projectLiveUrls.scanit,
	'cv-generator': projectLiveUrls.cvGenerator,
	'win95-gpt': projectLiveUrls.win95Gpt,
	primehaus: projectLiveUrls.primeHaus,
	fisionova: projectLiveUrls.recepcionistaIa,
	'dev-days': projectLiveUrls.devDays
};

/** Prioriza subdominio canónico por slug; si no hay mapeo, usa CMS. */
export function resolveCaseStudyLiveUrl(slug: string, cmsLiveUrl?: string | null): string {
	const canonical = caseStudySlugLiveUrls[slug];
	if (canonical) return canonical;
	const trimmed = cmsLiveUrl?.trim();
	return trimmed && trimmed !== '/' ? trimmed : '/';
}

export type ProjectLiveUrlKey = keyof typeof projectLiveUrls;

/** Alias .vercel.app (siguen activos en Vercel; preferir subdominio custom). */
export const projectLegacyVercelUrls = {
	webAnalyzer: 'https://web-analyzer-three.vercel.app',
	agentChecker: 'https://agentcheck-rho.vercel.app',
	scanit: 'https://scanit-rho.vercel.app',
	cvGenerator: 'https://cv-generator-ecru-xi.vercel.app',
	win95Gpt: 'https://win95-gpt-eight.vercel.app',
	devDays: 'https://dev-days-two.vercel.app',
	primeHaus: 'https://prime-haus.vercel.app',
	recepcionistaIa: 'https://proyecto-ia-recepcionista.vercel.app'
} as const;
