import { sveltekit } from '@sveltejs/kit/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const esmEnvDevFalse = path.resolve(__dirname, 'node_modules/esm-env/false.js');

/**
 * En Vercel, el bundle SSR puede resolver `esm-env/development` al fallback
 * (`globalThis.process?.env?.NODE_ENV`), que en runtime serverless no empieza
 * por "prod" → DEV=true → SSR emite `__sveltekit_dev` mientras el cliente usa
 * `__sveltekit_<hash>`, rompiendo hidratacion (estilos, menu, media lazy, env).
 *
 * En build de produccion: alias a false.js + condicion `production` en SSR.
 * Ademas conviene NODE_ENV=production en variables de entorno de Vercel (runtime).
 */
export default defineConfig(({ mode }) => {
	const isProd = mode === 'production';

	return {
		plugins: [sveltekit()],
		...(isProd && {
			define: {
				'process.env.NODE_ENV': JSON.stringify('production')
			},
			resolve: {
				alias: {
					'esm-env/development': esmEnvDevFalse
				}
			},
			ssr: {
				external: ['@sparticuz/chromium', 'playwright-core'],
				resolve: {
					conditions: ['production', 'module', 'node', 'import'],
					externalConditions: ['production', 'module', 'node', 'import']
				}
			}
		})
	};
});
