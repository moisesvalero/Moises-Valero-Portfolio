import { getCliClient } from 'sanity/cli';

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const id = await client.fetch<string | null>(
		`*[_type == "caseStudy" && slug.current == "agentchecker"][0]._id`
	);
	if (!id) throw new Error('No se encontró caseStudy agentchecker');
	await client
		.patch(id)
		.set({ 'images.cardImagePath': '/imagenes/agentchecker-card.png' })
		.commit();
	console.log('OK: cardImagePath agentchecker-card.png');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
