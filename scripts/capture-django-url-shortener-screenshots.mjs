import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL = process.env.SHORTENER_URL ?? 'https://acortador.moisesvalero.es';
const OUT_DIR = resolve('static/imagenes');

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
	'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
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
	console.warn('Chromium del sistema no encontrado; usando binario de Playwright.');
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
		console.log(`Cargando ${URL} para captura Principal...`);
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await page.waitForTimeout(2000); // Esperar a efectos
		const principalPath = resolve(OUT_DIR, 'django-url-shortener-principal.png');
		await page.screenshot({ path: principalPath, fullPage: false });
		console.log(`OK: ${principalPath}`);

		// 2. Captura Tarjeta Portada (Desktop 16:9 - 1440x810)
		console.log('Capturando tarjeta 16:9...');
		await page.setViewportSize({ width: 1440, height: 810 });
		const cardPath = resolve(OUT_DIR, 'django-url-shortener-card.png');
		await page.screenshot({ path: cardPath, fullPage: false });
		console.log(`OK: ${cardPath}`);

		// 3. Captura Mobile (390x844)
		console.log('Cargando para captura Mobile...');
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await page.waitForTimeout(2000);
		const mobilePath = resolve(OUT_DIR, 'django-url-shortener-mobile.png');
		await page.screenshot({ path: mobilePath, fullPage: false });
		console.log(`OK: ${mobilePath}`);

		console.log('Capturas de Django URL Shortener completadas con éxito.');
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error('Error durante la captura:', error);
	process.exit(1);
});
