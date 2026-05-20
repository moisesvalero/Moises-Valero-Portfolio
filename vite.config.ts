import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * En el runtime de la funcion serverless de Vercel, `process.env.NODE_ENV`
 * no quedaba inline y el fallback de `esm-env` dejaba `DEV` como check dinamico:
 * el SSR emitia `__sveltekit_dev` mientras el cliente usaba el hash real,
 * rompiendo hidratacion (menu, botones, lazy media, `$env/dynamic/public`).
 * Forzamos `DEV=false` (y `BROWSER` segun bundle) mediante `define`.
 */
export default defineConfig({
	plugins: [sveltekit()],
	define: {
		'process.env.NODE_ENV': JSON.stringify('production')
	}
});
