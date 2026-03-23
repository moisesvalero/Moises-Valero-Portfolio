/**
 * Actualiza en Sanity la ruta OG a /og-image.png en documentos ya publicados.
 * Ejecutar desde la raíz del repo: npx sanity exec sanity/patch-og-image.ts --with-user-token
 */
import { getCliClient } from 'sanity/cli';

const OG = '/og-image.png';

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });

  await client
    .patch('portfolioSite')
    .set({ 'seo.ogImage': OG })
    .commit({ visibility: 'async' });

  await client
    .patch('landingDisenoWebAlcoy')
    .set({ 'seo.ogImagePath': OG })
    .commit({ visibility: 'async' });

  console.log(`OK: seo.ogImage y seo.ogImagePath → ${OG}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
