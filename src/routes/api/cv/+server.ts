import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSanityServerClient } from '$lib/server/sanity/get-server-client';

/**
 * Proxy del CV en PDF.
 *
 * Motivo: el `<iframe>` que muestra el CV en el modal de trayectoria se bloquea cuando el PDF
 * vive en `cdn.sanity.io` por dos razones combinadas:
 *   1) `frame-src` de la CSP del sitio no incluye `cdn.sanity.io` (ver `src/hooks.server.ts`).
 *   2) Sanity CDN sirve los assets `application/pdf` con `Content-Disposition: attachment`,
 *      cosa que algunos navegadores (p.ej. Brave/Chrome con políticas estrictas) bloquean al
 *      incrustarlos en un iframe ("Este contenido está bloqueado").
 *
 * Solución: servir el PDF desde el mismo origen con `Content-Disposition: inline`. Si la URL es
 * local (servida desde `/static`), simplemente redirigimos a ella.
 */

const PDF_QUERY = `coalesce(
  *[_type == "sitePortfolio" && _id == "portfolioSite"][0],
  *[_type == "sitePortfolio"] | order(_updatedAt desc)[0]
){
  "pdfAssetUrl": careerModal.pdfFile.asset->url,
  "pdfHref": careerModal.pdfHref
}`;

const DEFAULT_PDF_PATH = '/imagenes/MOISES-VALERO-CV.pdf';
const ALLOWED_REMOTE_HOSTS = new Set(['cdn.sanity.io']);

async function resolvePdfUrl(origin: string): Promise<string> {
  const client = getSanityServerClient();
  if (client) {
    try {
      const result = await client.fetch<{ pdfAssetUrl?: string | null; pdfHref?: string | null }>(
        PDF_QUERY
      );
      const fromSanity = result?.pdfAssetUrl?.trim() || result?.pdfHref?.trim();
      if (fromSanity) {
        return fromSanity;
      }
    } catch {
      // Si Sanity falla, caemos al PDF estático de respaldo.
    }
  }
  return new URL(DEFAULT_PDF_PATH, origin).toString();
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  const target = await resolvePdfUrl(url.origin);

  let parsed: URL;
  try {
    parsed = new URL(target, url.origin);
  } catch {
    throw error(500, 'URL del CV inválida');
  }

  // PDF servido desde el mismo origen (p.ej. /imagenes/MOISES-VALERO-CV.pdf): redirigimos.
  if (parsed.origin === url.origin) {
    throw redirect(302, parsed.pathname + parsed.search);
  }

  // Solo permitimos proxy a hosts conocidos para evitar SSRF.
  if (!ALLOWED_REMOTE_HOSTS.has(parsed.hostname)) {
    throw error(403, 'Origen del CV no permitido');
  }

  const upstream = await fetch(parsed.toString(), {
    headers: { Accept: 'application/pdf' }
  });

  if (!upstream.ok || !upstream.body) {
    throw error(upstream.status || 502, 'No se pudo obtener el CV');
  }

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', 'inline; filename="MOISES-VALERO-CV.pdf"');
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  const length = upstream.headers.get('content-length');
  if (length) headers.set('Content-Length', length);

  return new Response(upstream.body, { status: 200, headers });
};
