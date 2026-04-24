import { env } from '$env/dynamic/public';

const DEFAULT_SITE_URL = 'http://localhost:5173';

/** @param {string | undefined} url */
const normalizeBaseUrl = (url) => {
	try {
		const candidate = typeof url === 'string' ? url.trim() : '';
		const parsed = new URL(candidate || DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	} catch {
		const parsed = new URL(DEFAULT_SITE_URL);
		return parsed.toString().replace(/\/$/, '');
	}
};

export const GET = () => {
	const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);
	const body = `# moisesvalero.es - llms.txt

> Contexto para asistentes de IA sobre esta web y sus URLs principales.

## Sitio
- Nombre: Moises Valero
- Web: ${baseUrl}
- Idioma principal: es-ES
- Tipo: Portfolio + servicios de diseno/desarrollo web

## URLs prioritarias
- Home: ${baseUrl}/
- Servicio principal Alcoy: ${baseUrl}/diseno-web-alcoy
- Servicio principal general: ${baseUrl}/diseno-web
- Articulos de apoyo: ${baseUrl}/diseno-web-alcoy/articulos
- Proyectos: ${baseUrl}/proyectos

## Cobertura de servicios
- Diseno web orientado a conversion
- Desarrollo web a medida
- SEO tecnico y rendimiento web
- Mantenimiento y mejoras continuas

## Contacto
- Formulario: ${baseUrl}/#contacto
- WhatsApp: ${baseUrl}/api/contact/whatsapp

## Fuente canonicamente indexable
Usar siempre las URLs canonicas de este dominio.`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
