/**
 * Rellena en Sanity `hero.heroMarquee` de la landing Alcoy:
 * sube las capturas desde /static según `landing-hero-marquee.ts` y enlaza título, URL y alt.
 *
 * Requiere sesión Sanity (token de usuario con permiso de escritura):
 *   npm run sanity:hero-marquee
 *
 * Equivale a cargar manualmente las mismas imágenes en Studio.
 */
import { readFileSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCliClient } from 'sanity/cli';
import { landingHeroMarqueeItems } from '../src/lib/data/landing-hero-marquee';
import { landingAlcoyDefaults } from '../src/lib/data/landing-alcoy-defaults';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

function staticPathFromPublicUrl(src: string): string {
  const rel = src.replace(/^\//, '');
  return join(repoRoot, 'static', rel);
}

function keyOf(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

async function main() {
  const client = getCliClient({ apiVersion: '2025-01-01' });
  const kicker = landingAlcoyDefaults.hero.marquee.kicker;

  const items: Array<{
    _key: string;
    title: string;
    href: string;
    image: { _type: 'image'; asset: { _type: 'reference'; _ref: string } };
    imageAlt?: string;
  }> = [];

  for (let i = 0; i < landingHeroMarqueeItems.length; i++) {
    const row = landingHeroMarqueeItems[i];
    const filePath = staticPathFromPublicUrl(row.imageSrc);
    if (!existsSync(filePath)) {
      console.error(`No existe el archivo: ${filePath} (${row.title})`);
      process.exit(1);
    }
    const buffer = readFileSync(filePath);
    const filename = basename(filePath);
    const asset = await client.assets.upload('image', buffer, { filename });
    items.push({
      _key: keyOf('hero-marquee', i),
      title: row.title,
      href: row.href,
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id }
      },
      imageAlt: row.imageAlt
    });
    console.log(`Subido: ${filename} → ${asset._id}`);
  }

  await client
    .patch('landingDisenoWebAlcoy')
    .set({
      'hero.heroMarquee': {
        kicker,
        items
      }
    })
    .commit({ visibility: 'async' });

  console.log(`OK: landingDisenoWebAlcoy.hero.heroMarquee con ${items.length} proyecto(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
