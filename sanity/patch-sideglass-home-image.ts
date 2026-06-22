import { getCliClient } from 'sanity/cli';

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const id = await client.fetch<string | null>(
		`*[_type == "caseStudy" && slug.current == "sideglass-dashboard"][0]._id`
	);
	if (!id) {
		throw new Error('No se encontró caseStudy sideglass-dashboard');
	}
	await client
		.patch(id)
		.set({ 'images.cardImagePath': '/imagenes/sideglass-landscape-dark.png' })
		.commit();
	console.log('OK: cardImagePath landscape para sideglass-dashboard');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
