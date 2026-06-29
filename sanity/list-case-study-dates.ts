import { getCliClient } from 'sanity/cli';

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	const docs =
		await client.fetch(`*[_type == "caseStudy" && defined(slug.current)] | order(_createdAt desc){
    "slug": slug.current,
    title,
    _createdAt
  }`);

	for (const d of docs) {
		const date = d._createdAt.slice(0, 10);
		console.log(`${date} — ${d.title} (/${d.slug})`);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exit(1);
});
