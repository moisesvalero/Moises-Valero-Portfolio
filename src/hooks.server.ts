import type { Handle } from '@sveltejs/kit';

/** Refuerza UTF-8 en HTML para evitar interpretaciones erróneas del juego de caracteres. */
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const type = response.headers.get('content-type');
  if (type?.startsWith('text/html') && !/charset=/i.test(type)) {
    response.headers.set('content-type', 'text/html; charset=utf-8');
  }
  return response;
};
