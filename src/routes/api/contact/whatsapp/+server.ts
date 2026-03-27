import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function normalizeE164(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

/**
 * Redirige a wa.me sin poner el número en el HTML de la página.
 * Número activo: +34 660 47 12 98.
 */
export const GET: RequestHandler = () => {
  const id = normalizeE164('34660471298');
  if (!id) {
    throw redirect(302, '/');
  }
  const text = encodeURIComponent('Hola, te escribo desde tu web.');
  throw redirect(302, `https://wa.me/${id}?text=${text}`);
};
