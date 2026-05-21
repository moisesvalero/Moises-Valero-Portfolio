import { sitePortfolioDefaults } from '$lib/data/site-portfolio-defaults';
import type { SiteLocale } from '$lib/i18n/site-locale';
import type { SiteProjectCard } from '$lib/types/site-portfolio';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { mapProject } from './sanity/map-site-portfolio';

const projectArchiveQuery = `*[
  _type == "caseStudy" &&
  defined(slug.current)
] | order(coalesce(homeSortOrder, 999) asc, _updatedAt desc){
  "thumbnail": images.principalImage,
  "imageSrc": coalesce(
    images.principal,
    "/imagenes/captura-novakit_ember.avif"
  ),
  "imageAlt": coalesce(title, "Proyecto"),
  "destinationUrl": "/proyectos/" + slug.current,
  "title": {
    "es": coalesce(title, "Proyecto"),
    "en": coalesce(titleEn, "")
  },
  "description": {
    "es": coalesce(heroDescription, seoDescription, ""),
    "en": coalesce(heroDescriptionEn, seoDescriptionEn, "")
  },
  "homeLayoutTier": coalesce(homeLayoutTier, "standard"),
  homeEyebrow,
  homeProofLine,
  "homeValueTags": coalesce(homeValueTags, []),
  homeRole,
  homeYear,
  homeComplexity,
  "tags": select(
    count(coalesce(tagsEn, [])) > 0 => coalesce(tagsEn, []),
    coalesce(tags, [])
  ),
  "linkLabel": { "es": "Ver proyecto", "en": "View project" }
}`;

const manualProjectCardsQuery = `coalesce(
  *[_type == "sitePortfolio" && _id == "portfolioSite"][0],
  *[_type == "sitePortfolio"] | order(_updatedAt desc)[0]
).projects.projects[] | order(coalesce(sortOrder, 999) asc){
  thumbnail,
  imageSrc,
  imageAlt,
  destinationUrl,
  title,
  description,
  tags,
  linkLabel
}`;

function dedupeProjects(projects: SiteProjectCard[]): SiteProjectCard[] {
  const seen = new Set<string>();
  const out: SiteProjectCard[] = [];
  for (const project of projects) {
    const key = project.href.replace(/\/+$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(project);
  }
  return out;
}

export async function fetchProjectArchive(locale: SiteLocale): Promise<SiteProjectCard[]> {
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client || !cfg) {
    return sitePortfolioDefaults.projects.projects;
  }

  try {
    const [caseStudyRows, manualRows] = await Promise.all([
      client.fetch<unknown[] | null>(projectArchiveQuery),
      client.fetch<unknown[] | null>(manualProjectCardsQuery)
    ]);
    const mapped = [...(caseStudyRows ?? []), ...(manualRows ?? [])]
      .map((row) => mapProject(row, { ...cfg, locale }))
      .filter((project): project is SiteProjectCard => Boolean(project));

    return dedupeProjects(mapped.length ? mapped : sitePortfolioDefaults.projects.projects);
  } catch (error) {
    console.warn('[project-archive] Sanity unavailable, using portfolio defaults.', error);
    return sitePortfolioDefaults.projects.projects;
  }
}
