import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL = process.env.NOVATAB_URL ?? 'https://start.moisesvalero.es';
const OUT_DIR = resolve('static/imagenes');

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
	'/usr/bin/chromium-browser',
	'/usr/bin/chromium',
	'/usr/bin/google-chrome',
	'/snap/bin/chromium'
].filter(Boolean);

async function launchBrowser() {
	for (const executablePath of CHROME_CANDIDATES) {
		try {
			const { access } = await import('node:fs/promises');
			await access(executablePath);
			return chromium.launch({
				headless: true,
				executablePath,
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
			});
		} catch {
			// Siguiente candidato
		}
	}
	console.warn('Chrome/Chromium del sistema no encontrado; intentando launch por defecto.');
	return chromium.launch({ headless: true });
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await launchBrowser();

	try {
		const page = await browser.newPage({
			deviceScaleFactor: 2
		});

		// 1. Captura Principal (Desktop 1440x900)
		console.log('Cargando ' + URL + ' para captura Principal...');
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
		await page.waitForTimeout(3000);
		const principalPath = resolve(OUT_DIR, 'novatab-principal.png');
		await page.screenshot({ path: principalPath, fullPage: false });
		console.log('OK: ' + principalPath);

		// 2. Captura Tarjeta Portada (Desktop 16:9 - 1440x810)
		console.log('Capturando tarjeta 16:9...');
		await page.setViewportSize({ width: 1440, height: 810 });
		await page.waitForTimeout(1000);
		const cardPath = resolve(OUT_DIR, 'novatab-card.png');
		await page.screenshot({ path: cardPath, fullPage: false });
		console.log('OK: ' + cardPath);

		// 3. Captura Detalle/Secundaria (abrir ajustes o widgets si existe botón)
		console.log('Intentando captura con panel de ajustes/widgets...');
		try {
			const buttons = await page.locator('button').all();
			for (const b of buttons) {
				const aria = await b.getAttribute('aria-label');
				const title = await b.getAttribute('title');
				if ((aria && /ajuste|config|setting/i.test(aria)) || (title && /ajuste|config|setting/i.test(title))) {
					await b.click();
					await page.waitForTimeout(1000);
					break;
				}
			}
		} catch (e) {
			console.log('No se pudo abrir panel:', e);
		}
		const secondary1Path = resolve(OUT_DIR, 'novatab-secondary1.png');
		await page.screenshot({ path: secondary1Path, fullPage: false });
		console.log('OK: ' + secondary1Path);

		// 4. Captura Mobile (390x844)
		console.log('Cargando para captura Mobile...');
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
		await page.waitForTimeout(2500);
		const mobilePath = resolve(OUT_DIR, 'novatab-mobile.png');
		await page.screenshot({ path: mobilePath, fullPage: false });
		console.log('OK: ' + mobilePath);

		console.log('Capturas de NovaTab completadas con éxito.');
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error('Error durante la captura:', error);
	process.exit(1);
});
