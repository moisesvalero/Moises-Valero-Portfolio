import type { SiteLocale } from '$lib/i18n/site-locale';
import { publicPages } from '$lib/site-pages';
import { buildSitePageMarkdown, getAeoBaseUrl } from '../shared';

export function buildHomeMarkdown(locale: SiteLocale): string {
	const page = publicPages().find((p) => p.path === '/');
	if (!page) return '';
	const baseUrl = getAeoBaseUrl();
	return buildSitePageMarkdown(page, locale, [
		locale === 'en'
			? '## Professional focus\n- Frontend development with SvelteKit and WordPress\n- Technical SEO, performance and structured content\n- Integrations, APIs and IT support'
			: '## Enfoque profesional\n- Desarrollo frontend con SvelteKit y WordPress\n- SEO técnico, rendimiento y contenido estructurado\n- Integraciones, APIs y soporte IT',
		'',
		`## Contacto\n- Formulario: ${baseUrl}/#contacto\n- Email: info@moisesvalero.es\n- LinkedIn: https://www.linkedin.com/in/moisesvalero`
	]);
}
