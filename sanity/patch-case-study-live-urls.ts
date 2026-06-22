import { getCliClient } from 'sanity/cli';
import { caseStudySlugLiveUrls } from '../src/lib/data/project-live-urls';

/** Slugs que no deben tocarse (plantillas, enlaces externos). */
const SKIP_SLUGS = new Set(['sveltekit-starter', 'next-agent-template', 'planificador-de-instagram', 'chatbot']);

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const docs = await client.fetch<Array<{ _id: string; slug: string; liveUrl?: string }>>(
		`*[_type == "caseStudy" && defined(slug.current)]{ _id, "slug": slug.current, liveUrl }`
	);

	for (const doc of docs) {
		if (SKIP_SLUGS.has(doc.slug)) {
			console.log(`SKIP ${doc.slug}`);
			continue;
		}
		const liveUrl = caseStudySlugLiveUrls[doc.slug];
		if (!liveUrl) {
			console.log(`SKIP ${doc.slug} (sin mapeo)`);
			continue;
		}
		if (doc.liveUrl === liveUrl) {
			console.log(`OK ${doc.slug} (ya actualizado)`);
			continue;
		}
		await client.patch(doc._id).set({ liveUrl }).commit();
		console.log(`PATCH ${doc.slug}: ${doc.liveUrl ?? '(vacío)'} -> ${liveUrl}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
