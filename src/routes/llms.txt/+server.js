import { env } from '$env/dynamic/public';
import { publicPages } from '$lib/site-pages';

const DEFAULT_SITE_URL = 'http://localhost:5173';

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

	const landing = pages.filter((p) => p.group === 'landing');
	const portfolio = pages.filter((p) => p.group === 'portfolio');
	const support = pages.filter((p) => p.group === 'support');
	const projects = pages.filter((p) => p.group === 'project');
	const legal = pages.filter((p) => p.group === 'legal');

	/** @param {import('$lib/site-pages').SitePage} p */
	const line = (p) =>
		`- [${p.titleEs ?? p.path}](${baseUrl}${p.path})${p.descEs ? `: ${p.descEs}` : ''}`;

	const body = `# Moisés Valero — moisesvalero.es

> Portfolio y servicios de Moisés Valero, desarrollador web freelance en Alcoy (Alicante, España). Diseño web orientado a conversión, SEO técnico y soporte IT. Stack: SvelteKit, WordPress, Sanity CMS.

## Servicios de diseño web (landings principales)
${landing.map(line).join('\n')}

## Portfolio
${portfolio.map(line).join('\n')}

## Recursos (artículos de apoyo)
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
- Landings de servicios indexables: ${baseUrl}/diseno-web y ${baseUrl}/diseno-web-alcoy.
- Artículos: la canónica es siempre ${baseUrl}/diseno-web-alcoy/{slug}. La variante ${baseUrl}/diseno-web/{slug} apunta a la canónica de Alcoy.

## Contacto
- Web: ${baseUrl}/
- Formulario: ${baseUrl}/#contacto
- WhatsApp: ${baseUrl}/api/contact/whatsapp
- Email: info@moisesvalero.es

## Datos de la entidad
- Nombre: Moisés Valero
- Rol: Desarrollador web freelance
- Zona principal: Alcoy, Alicante, España
- Idiomas: español (principal), inglés
- Servicios: diseño web, desarrollo web, SEO técnico, rendimiento, mantenimiento, e-commerce, WooCommerce, SvelteKit, WordPress, Sanity CMS, soporte IT.
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
