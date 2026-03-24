import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// En Vercel (VERCEL=1) adapter-auto usa @sveltejs/adapter-vercel. En Windows local puede avisar sin adaptar.
		adapter: adapter()
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) => ({ runes: !filename.includes('node_modules') })
	}
};

export default config;
