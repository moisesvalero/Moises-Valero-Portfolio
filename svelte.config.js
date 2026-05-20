import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Adapter explicito: adapter-auto se saltaba el wrapper en Vercel y dejaba
		// "DEV" como check en runtime, lo que rompia la hidratacion (__sveltekit_dev vs __sveltekit_<hash>).
		adapter: adapter()
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) => ({ runes: !filename.includes('node_modules') })
	}
};

export default config;
