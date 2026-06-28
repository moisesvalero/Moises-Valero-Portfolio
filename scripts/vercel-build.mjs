import { execSync } from 'node:child_process';

const ADMIN_PROJECT_ID = 'prj_uRgQPJ9hh0bdiFcwKlU7RvRjjZ4S';
const projectId = process.env.VERCEL_PROJECT_ID ?? '';

const studioEnv = {
	...process.env,
	SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID || '5zhz6irf',
	SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET || 'production'
};

if (projectId === ADMIN_PROJECT_ID) {
	// Sanity 6.x carga tsconfig.json (extends "./.svelte-kit/tsconfig.json"); en builds limpios de Vercel ese archivo no existe.
	execSync('pnpm exec svelte-kit sync', { stdio: 'inherit', env: studioEnv });
	execSync('pnpm exec sanity build', { stdio: 'inherit', env: studioEnv });
} else {
	execSync('pnpm run build', { stdio: 'inherit' });
}
