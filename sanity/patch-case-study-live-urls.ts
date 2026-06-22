import { getCliClient } from 'sanity/cli';

const patches: { id: string; liveUrl: string }[] = [
	{ id: 'caseStudy.vshield', liveUrl: 'https://v-shield.moisesvalero.es' },
	{ id: 'caseStudy.ember-iron', liveUrl: 'https://ember.moisesvalero.es' }
];

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	for (const { id, liveUrl } of patches) {
		await client.patch(id).set({ liveUrl }).commit();
		console.log(`OK ${id} -> ${liveUrl}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
