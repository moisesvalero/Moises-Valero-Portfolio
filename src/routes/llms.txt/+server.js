import { env } from '$env/dynamic/public';
import { publicPages } from '$lib/site-pages';

const DEFAULT_SITE_URL = 'https://moisesvalero.es';

/** @param {string | undefined} url */
const normalizeBaseUrl = (url) => {
	try {
		const parsed = new URL((url ?? '').trim() || DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	} catch {
		const parsed = new URL(DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	}
};

/**
 * llms.txt según convención de llmstxt.org:
 *   # Título
 *   > Resumen
 *   ## Sección
 *   - [Título](URL): descripción
 */
export const GET = () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);
	const pages = publicPages();

	const portfolio = pages.filter((p) => p.group === 'portfolio');
	const support = pages.filter((p) => p.group === 'support');
	const projects = pages.filter((p) => p.group === 'project');
	const legal = pages.filter((p) => p.group === 'legal');

	/** @param {import('$lib/site-pages').SitePage} p */
	const line = (p) =>
		`- [${p.titleEs ?? p.path}](${baseUrl}${p.path})${p.descEs ? `: ${p.descEs}` : ''}`;

	const body = `# Moisés Valero — moisesvalero.es

> Portfolio profesional de Moisés Valero, Full-Stack Developer especializado en SvelteKit, Next.js, Astro, TypeScript e integraciones de IA.

## Portfolio
${portfolio.map(line).join('\n')}

## Blog técnico
${support.map(line).join('\n')}


## Proyectos / casos de estudio
${projects.map(line).join('\n')}

## Legal
${legal.map(line).join('\n')}

## Recursos para LLMs
- [Versión extendida con todo el contenido](${baseUrl}/llms-full.txt): mismo contenido que la web en Markdown.
- [Sitemap XML](${baseUrl}/sitemap.xml)
- [Robots](${baseUrl}/robots.txt)

## Canonicalización
- Portfolio principal: ${baseUrl}/

## Contacto
- Web: ${baseUrl}/
- Formulario: ${baseUrl}/#contacto
- Email: info@moisesvalero.es

## Datos de la entidad
- Nombre: Moisés Valero
- Rol: Full-Stack Developer
- Zona principal: Alcoy, Alicante, España
- Idiomas: español (principal), inglés
- Áreas: desarrollo web, frontend, SvelteKit, WordPress, Sanity CMS, rendimiento, SEO técnico, integraciones, soporte IT.
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
