import type { RequestHandler } from './$types';
import { resolveCvPdfResponse } from '$lib/server/cv/fetch-cv-pdf';

/** Proxy del CV en PDF para el iframe del modal de trayectoria (mismo origen, inline). */
export const GET: RequestHandler = async ({ url, fetch }) => {
	return resolveCvPdfResponse(url.origin, fetch);
};
