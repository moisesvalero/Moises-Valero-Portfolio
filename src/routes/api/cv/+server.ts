import type { RequestHandler } from './$types';
import { resolveCvPdfResponse } from '$lib/server/cv/fetch-cv-pdf';

/** Proxy del CV en PDF para abrirlo inline desde el portfolio. */
export const GET: RequestHandler = async ({ url, fetch }) => {
	return resolveCvPdfResponse(url.origin, fetch);
};
