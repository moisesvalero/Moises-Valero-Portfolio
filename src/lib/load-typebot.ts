const TYPEBOT_WEB_JS = 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';

export type TypebotWebModule = {
	initStandard: (opts: Record<string, unknown>) => void;
};

let loadPromise: Promise<TypebotWebModule> | null = null;

function loadViaInlineModule(): Promise<TypebotWebModule> {
	return new Promise((resolve, reject) => {
		if (typeof window === 'undefined') {
			reject(new Error('typebot: no window'));
			return;
		}

		if (window.__typebotWebModule) {
			resolve(window.__typebotWebModule);
			return;
		}

		const onReady = () => {
			if (window.__typebotWebModule) {
				resolve(window.__typebotWebModule);
				return;
			}
			reject(new Error('typebot: module missing after ready'));
		};

		const existing = document.getElementById('typebot-web-module-loader');
		if (existing) {
			if (window.__typebotWebModule) {
				resolve(window.__typebotWebModule);
				return;
			}
			window.addEventListener('typebot:module-ready', onReady, { once: true });
			return;
		}

		const script = document.createElement('script');
		script.id = 'typebot-web-module-loader';
		script.type = 'module';
		script.textContent = `
import Typebot from "${TYPEBOT_WEB_JS}";
window.__typebotWebModule = Typebot;
window.dispatchEvent(new Event("typebot:module-ready"));
`;
		const timeout = window.setTimeout(() => {
			reject(new Error('typebot: load timeout'));
		}, 20_000);

		script.onerror = () => {
			window.clearTimeout(timeout);
			reject(new Error('typebot: script error'));
		};

		window.addEventListener(
			'typebot:module-ready',
			() => {
				window.clearTimeout(timeout);
				onReady();
			},
			{ once: true }
		);

		document.head.appendChild(script);
	});
}

async function loadViaDynamicImport(): Promise<TypebotWebModule> {
	const mod = (await import(/* @vite-ignore */ TYPEBOT_WEB_JS)) as
		| TypebotWebModule
		| { default: TypebotWebModule };
	return 'initStandard' in mod ? mod : mod.default;
}

/** Carga el SDK de Typebot (import dinámico; fallback con `<script type="module">` para Safari/iOS). */
export function loadTypebotWebModule(): Promise<TypebotWebModule> {
	if (!loadPromise) {
		loadPromise = loadViaDynamicImport().catch(() => loadViaInlineModule());
	}
	return loadPromise;
}

export function resetTypebotWebModuleCache() {
	loadPromise = null;
	if (typeof window !== 'undefined') {
		delete window.__typebotWebModule;
		document.getElementById('typebot-web-module-loader')?.remove();
	}
}
