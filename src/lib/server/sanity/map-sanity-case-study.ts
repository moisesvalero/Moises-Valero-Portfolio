import type { CaseStudy, CaseStudyMetric, CaseStudySection } from '$lib/types/case-study';
import type { SiteLocale } from '$lib/i18n/site-locale';
import { imageUrl } from './image-builder';

/** Fila devuelta por GROQ (caseStudyBySlugQuery). */
export type SanityCaseStudyRow = {
  slug: string;
  title: string;
  titleEn?: string | null;
  seoDescription?: string | null;
  seoDescriptionEn?: string | null;
  heroTag: string;
  heroTagEn?: string | null;
  heroDescription: string;
  heroDescriptionEn?: string | null;
  tags: string[];
  tagsEn?: string[] | null;
  images?: {
    principalImage?: unknown;
    secondary1Image?: unknown;
    secondary2Image?: unknown;
    principal?: string | null;
    secondary1?: string | null;
    secondary2?: string | null;
  } | null;
  metrics?: Array<{ value?: string | null; label?: string | null }> | null;
  metricsEn?: Array<{ value?: string | null; label?: string | null }> | null;
  reto?: Partial<CaseStudySection> | null;
  retoEn?: Partial<CaseStudySection> | null;
  hice?: Partial<CaseStudySection> | null;
  hiceEn?: Partial<CaseStudySection> | null;
  resultado?: Partial<CaseStudySection> | null;
  resultadoEn?: Partial<CaseStudySection> | null;
  stack?: string[] | null;
  stackEn?: string[] | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
};

const placeholder = 'https://placehold.co/1200x800/e8e8ed/1d1d1f?text=Imagen';

function normalizeMetrics(raw: SanityCaseStudyRow['metrics']): CaseStudy['metrics'] {
  const list: CaseStudyMetric[] = (raw ?? []).map((m) => ({
    value: m?.value?.trim() || '—',
    label: m?.label?.trim() || '—'
  }));
  while (list.length < 4) {
    list.push({ value: '—', label: '—' });
  }
  return [list[0], list[1], list[2], list[3]] as CaseStudy['metrics'];
}

function chooseString(locale: SiteLocale, esValue: string | null | undefined, enValue: string | null | undefined): string {
  const en = typeof enValue === 'string' ? enValue.trim() : '';
  const es = typeof esValue === 'string' ? esValue.trim() : '';
  if (locale === 'en' && en) {
    return en;
  }
  return es;
}

function section(
  key: string,
  locale: SiteLocale,
  dataEs: Partial<CaseStudySection> | null | undefined,
  dataEn: Partial<CaseStudySection> | null | undefined,
  fallbackTitle: string
): CaseStudySection {
  const title = chooseString(locale, dataEs?.title, dataEn?.title) || fallbackTitle;
  const esBody = typeof dataEs?.bodyHtml === 'string' ? dataEs.bodyHtml : '';
  const enBody = typeof dataEn?.bodyHtml === 'string' ? dataEn.bodyHtml : '';
  const chosenBody = chooseString(locale, esBody, enBody);
  const bodyHtml =
    chosenBody || `<p>(${key})</p>`;
  return { title, bodyHtml };
}

export function mapSanityRowToCaseStudy(
  row: SanityCaseStudyRow,
  locale: SiteLocale = 'es',
  ctx?: { projectId: string; dataset: string }
): CaseStudy {
  const img = row.images ?? {};
  const principalFromAsset =
    ctx && ctx.projectId && ctx.dataset ? imageUrl(ctx.projectId, ctx.dataset, img.principalImage, 1600) : undefined;
  const secondary1FromAsset =
    ctx && ctx.projectId && ctx.dataset ? imageUrl(ctx.projectId, ctx.dataset, img.secondary1Image, 1200) : undefined;
  const secondary2FromAsset =
    ctx && ctx.projectId && ctx.dataset ? imageUrl(ctx.projectId, ctx.dataset, img.secondary2Image, 1200) : undefined;
  const principal = principalFromAsset || img.principal?.trim() || placeholder;
  const tags =
    locale === 'en' && Array.isArray(row.tagsEn) && row.tagsEn.length
      ? row.tagsEn
      : Array.isArray(row.tags)
        ? row.tags
        : [];
  const stack =
    locale === 'en' && Array.isArray(row.stackEn) && row.stackEn.length
      ? row.stackEn
      : Array.isArray(row.stack)
        ? row.stack
        : [];
  const metricsSource = locale === 'en' && Array.isArray(row.metricsEn) ? row.metricsEn : row.metrics;

  return {
    slug: row.slug,
    title: chooseString(locale, row.title, row.titleEn) || row.title,
    seoDescription: chooseString(locale, row.seoDescription, row.seoDescriptionEn) || undefined,
    heroTag: chooseString(locale, row.heroTag, row.heroTagEn) || row.heroTag,
    heroDescription: chooseString(locale, row.heroDescription, row.heroDescriptionEn) || row.heroDescription,
    tags,
    images: {
      principal,
      secondary1: secondary1FromAsset || img.secondary1?.trim() || principal,
      secondary2: secondary2FromAsset || img.secondary2?.trim() || principal
    },
    metrics: normalizeMetrics(metricsSource),
    reto: section('reto', locale, row.reto, row.retoEn, locale === 'en' ? 'Challenge' : 'El reto'),
    hice: section('hice', locale, row.hice, row.hiceEn, locale === 'en' ? 'What I built' : 'Lo que hice'),
    resultado: section(
      'resultado',
      locale,
      row.resultado,
      row.resultadoEn,
      locale === 'en' ? 'Outcome' : 'Resultado'
    ),
    stack,
    liveUrl: row.liveUrl?.trim() || '/',
    repoUrl: row.repoUrl?.trim() || undefined
  };
}
