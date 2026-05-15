import type { SiteLocale } from '$lib/i18n/site-locale';
import { publicPages } from '$lib/site-pages';
import { buildSitePageMarkdown, getAeoBaseUrl } from '../shared';

export function buildHomeMarkdown(locale: SiteLocale): string {
	const page = publicPages().find((p) => p.path === '/');
	if (!page) return '';
	const baseUrl = getAeoBaseUrl();
	const body = buildSitePageMarkdown(page, locale, [
		locale === 'en'
			? '## Services\n- Web design and development (SvelteKit, WordPress)\n- Technical SEO and performance\n- IT support for businesses and freelancers'
			: '## Servicios\n- Diseño y desarrollo web (SvelteKit, WordPress)\n- SEO técnico y rendimiento\n- Soporte IT para empresas y freelance',
		'',
		`## Contacto\n- Formulario: ${baseUrl}/#contacto\n- WhatsApp: ${baseUrl}/api/contact/whatsapp\n- Email: info@moisesvalero.es`
	]);
	return body;
}
