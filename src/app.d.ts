// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/** Web component del embed JS de Typebot (`initStandard`). */
	namespace svelteHTML {
		interface IntrinsicElements {
			'typebot-standard': import('svelte/elements').HTMLAttributes<HTMLElement>;
		}
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		/** Opcional: activa lectura de case studies desde Sanity (ver .env.example). */
		interface PrivateEnv {
			SANITY_PROJECT_ID?: string;
			SANITY_DATASET?: string;
			/** Por defecto en código: 2024-01-01 */
			SANITY_API_VERSION?: string;
			/** Solo si el dataset no es público de lectura */
			SANITY_READ_TOKEN?: string;
		}
	}
}

export {};
