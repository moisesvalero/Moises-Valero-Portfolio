import type { CaseStudy } from '$lib/types/case-study';

/** Textos EN para case studies resueltos desde `case-studies.ts` / Sanity (slug coincide). */
export const caseStudyEnOverrides: Partial<Record<string, Partial<CaseStudy>>> = {
	novakit: {
		title: 'NovaKit landing with SvelteKit',
		seoDescription:
			'Case study: UI toolkit landing with SvelteKit, pure CSS animations, interactive mockups, Spline 3D, and i18n. Live at https://novakit.moisesvalero.es',
		heroTag: 'UI toolkit · SvelteKit',
		heroDescription:
			'My first project outside WordPress: a product landing with SvelteKit, CSS animations, interactive mockups, and native multi-language support.',
		tags: ['SvelteKit', 'UI/UX', 'CSS Animations', 'i18n'],
		metrics: [
			{ value: '247', label: 'UI components' },
			{ value: '100%', label: 'Pure CSS' },
			{ value: '2', label: 'Languages' },
			{ value: 'Mobile', label: 'First' }
		],
		reto: {
			title: 'Prove real SvelteKit skills without a client brief',
			bodyHtml:
				'<p>I needed a portfolio piece beyond a static site: something that showed component architecture, state, performance, and product thinking. With no client brief, the challenge was to set a high bar and let the landing speak for itself to recruiters and technical teams.</p>'
		},
		hice: {
			title: 'A full UI toolkit landing with interactive mockups and a custom design system',
			bodyHtml:
				'<p>I built the landing with SvelteKit and TypeScript, with CSS-animated sections, browser-style mockups, and reusable blocks. I integrated a 3D scene with Spline, an i18n system for Spanish and English, and Vitest tests where they added value. Everything is mobile-first with a focus on Core Web Vitals.</p>'
		},
		resultado: {
			title: 'From design intent to technical delivery: moving to the modern stack',
			bodyHtml:
				'<p>The result is a deployable, maintainable site aligned with how I work today: modern stack, fewer unnecessary dependencies, and a clear base to iterate on. It works as a live demo of the interfaces and discipline I can bring to a product or engineering team.</p>'
		},
		stack: ['SvelteKit', 'TypeScript', 'CSS animations', 'Spline 3D', 'i18n', 'Vitest']
	}
};
