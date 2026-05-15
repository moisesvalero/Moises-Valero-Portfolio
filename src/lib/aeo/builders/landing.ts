import { fetchLandingDisenoWeb } from '$lib/server/fetch-landing-diseno-web';
import { fetchLandingDisenoWebAlcoy } from '$lib/server/fetch-landing-alcoy';
import type { SiteLocale } from '$lib/i18n/site-locale';
import { getAeoBaseUrl } from '../shared';
import { renderLandingMarkdown } from '../render-landing';
import { buildSitePageMarkdownByPath } from './site-page';

export async function buildDisenoWebMarkdown(_locale: SiteLocale): Promise<string> {
	const baseUrl = getAeoBaseUrl();
	const landing = await fetchLandingDisenoWeb().catch(() => null);
	if (landing) {
		return renderLandingMarkdown(
			'Diseño web profesional (nacional)',
			`${baseUrl}/diseno-web`,
			landing
		);
	}
	return buildSitePageMarkdownByPath('/diseno-web', 'es');
}

export async function buildDisenoWebAlcoyMarkdown(_locale: SiteLocale): Promise<string> {
	const baseUrl = getAeoBaseUrl();
	const landing = await fetchLandingDisenoWebAlcoy().catch(() => null);
	if (landing) {
		return renderLandingMarkdown('Diseño web en Alcoy', `${baseUrl}/diseno-web-alcoy`, landing);
	}
	return buildSitePageMarkdownByPath('/diseno-web-alcoy', 'es');
}
