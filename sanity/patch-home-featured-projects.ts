import { getCliClient } from 'sanity/cli';

const FEATURED = [
	{ slug: 'fisionova', homeLayoutTier: 'hero', homeSortOrder: 1 },
	{ slug: 'rebranding-galeria-nova', homeLayoutTier: 'spotlight', homeSortOrder: 2 },
	{ slug: 'agentchecker', homeLayoutTier: 'spotlight', homeSortOrder: 3 },
	{ slug: 'sideglass-dashboard', homeLayoutTier: 'spotlight', homeSortOrder: 4 }
] as const;

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const featuredSlugs = new Set(FEATURED.map((item) => item.slug));

	const all = await client.fetch<Array<{ _id: string; slug: string; title?: string }>>(
		`*[_type == "caseStudy" && defined(slug.current)]{ _id, title, "slug": slug.current }`
	);

	const bySlug = new Map(all.map((doc) => [doc.slug, doc]));

	for (const item of FEATURED) {
		const doc = bySlug.get(item.slug);
		if (!doc) {
			console.error(`MISSING slug: ${item.slug}`);
			continue;
		}
		await client
			.patch(doc._id)
			.set({
				showOnHome: true,
				homeLayoutTier: item.homeLayoutTier,
				homeSortOrder: item.homeSortOrder
			})
			.commit();
		console.log(`OK featured: ${item.slug} -> ${item.homeLayoutTier} #${item.homeSortOrder}`);
	}

	for (const doc of all) {
		if (featuredSlugs.has(doc.slug)) continue;
		await client.patch(doc._id).set({ showOnHome: false }).commit();
	}

	const onHome = await client.fetch(
		`*[_type == "caseStudy" && showOnHome == true] | order(homeSortOrder asc){
      title, "slug": slug.current, homeLayoutTier, homeSortOrder
    }`
	);
	console.log('Portada actual:', JSON.stringify(onHome, null, 2));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
