import { getCliClient } from 'sanity/cli';

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const docs = await client.fetch<
		Array<{ _id: string; title?: string; slug: string; liveUrl?: string }>
	>(
		`*[_type == "caseStudy" && defined(slug.current)]{ _id, title, "slug": slug.current, liveUrl }`
	);
	for (const d of docs) {
		console.log(`${d.slug}\t${d.liveUrl ?? '(vacío)'}`);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
