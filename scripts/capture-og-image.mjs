import { chromium } from 'playwright-core';
import { resolve } from 'node:path';

const URL = 'https://moisesvalero.es';
const OUT_OG = resolve('static/og-image.png');
const OUT_OG_2026 = resolve('static/og-image-2026.png');

async function launchBrowser() {
	const candidates = [
		process.env.CHROME_PATH,
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
	].filter(Boolean);
	for (const executablePath of candidates) {
		try {
			const { access } = await import('node:fs/promises');
			await access(executablePath);
			return chromium.launch({
				headless: true,
				executablePath,
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			});
		} catch {
			// siguiente
		}
	}
	return chromium.launch({ headless: true });
}

async function main() {
	console.log(`Lanzando navegador para capturar ${URL}...`);
	const browser = await launchBrowser();
	try {
		const page = await browser.newPage({
			viewport: { width: 1200, height: 630 },
			deviceScaleFactor: 2
		});

		console.log(`Navegando a ${URL}...`);
		await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });

		console.log('Esperando 3 segundos para que se completen las animaciones de entrada...');
		await page.waitForTimeout(3000);

		console.log(`Guardando captura en: ${OUT_OG}`);
		await page.screenshot({ path: OUT_OG, type: 'png' });

		console.log(`Guardando copia en: ${OUT_OG_2026}`);
		await page.screenshot({ path: OUT_OG_2026, type: 'png' });

		console.log('¡Capturas guardadas con éxito!');
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error('Error al capturar la pantalla:', error);
	process.exit(1);
});
