import { caseStudyEnOverrides } from '$lib/data/case-studies-en-overrides';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { CaseStudy, CaseStudySection } from '$lib/types/case-study';

function mergeSection(base: CaseStudySection, patch?: Partial<CaseStudySection>): CaseStudySection {
	if (!patch) {
		return base;
	}
	return {
		title: patch.title ?? base.title,
		bodyHtml: patch.bodyHtml ?? base.bodyHtml
	};
}

export function localizeCaseStudy(study: CaseStudy, locale: SiteLocale): CaseStudy {
	if (locale !== 'en') {
		return study;
	}
	const ov = caseStudyEnOverrides[study.slug];
	if (!ov) {
		return study;
	}
	return {
		...study,
		title: ov.title ?? study.title,
		seoDescription: ov.seoDescription ?? study.seoDescription,
		heroTag: ov.heroTag ?? study.heroTag,
		heroDescription: ov.heroDescription ?? study.heroDescription,
		tags: ov.tags ?? study.tags,
		metrics: ov.metrics ?? study.metrics,
		reto: mergeSection(study.reto, ov.reto),
		hice: mergeSection(study.hice, ov.hice),
		resultado: mergeSection(study.resultado, ov.resultado),
		stack: ov.stack ?? study.stack,
		liveUrl: ov.liveUrl ?? study.liveUrl,
		repoUrl: ov.repoUrl ?? study.repoUrl,
		images: study.images,
		slug: study.slug
	};
}
