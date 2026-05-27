import {
	LOCALE_LOAD_DEPENDENCY,
	PORTFOLIO_LOCALE_COOKIE,
	resolveSiteLocale
} from '$lib/i18n/site-locale';
import type { LayoutServerLoad } from './$types';

/** Asegura `locale` en datos de todas las rutas `/proyectos/*` y revalidación al cambiar idioma. */
export const load: LayoutServerLoad = async ({ cookies, depends }) => {
	depends(LOCALE_LOAD_DEPENDENCY);
	return {
		locale: resolveSiteLocale(cookies.get(PORTFOLIO_LOCALE_COOKIE))
	};
};
