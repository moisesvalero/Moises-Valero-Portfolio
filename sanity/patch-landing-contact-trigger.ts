/**
 * Fija contactModal.triggerLabel a «Formulario» (sustituye copia antigua «Prefiero formulario»).
 * Ejecutar desde la raíz: npx sanity exec sanity/patch-landing-contact-trigger.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';

const LABEL = 'Formulario';

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });

	await client
		.patch('landingDisenoWebAlcoy')
		.set({ 'contactModal.triggerLabel': LABEL })
		.commit({ visibility: 'async' });

	console.log(`OK: contactModal.triggerLabel → «${LABEL}» (CTA final y footer)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
