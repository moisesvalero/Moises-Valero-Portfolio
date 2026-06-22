import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE_URL = process.env.ANALYZER_URL ?? 'https://moisesvalero.es/tools/analizador-web';
const TARGET_URL = process.env.ANALYZER_TARGET ?? 'https://moisesvalero.es';
const OUT_DIR = resolve('static/imagenes');

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	'/usr/bin/chromium-browser',
	'/usr/bin/chromium',
	'/usr/bin/google-chrome',
	'/snap/bin/chromium'
].filter(Boolean);

async function resolveExecutable() {
	for (const path of CHROME_CANDIDATES) {
		try {
			const { access } = await import('node:fs/promises');
			await access(path);
			return path;
		} catch {
			// siguiente candidato
		}
	}
	return undefined;
}

async function launchBrowser() {
	const executablePath = await resolveExecutable();
	if (executablePath) {
		return chromium.launch({
			headless: true,
			executablePath,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
		});
	}
	console.warn('Chromium del sistema no encontrado; usando binario de Playwright.');
	return chromium.launch({ headless: true });
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await launchBrowser();

	try {
		const page = await browser.newPage();

		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await page.waitForSelector('#analyzer-url', { timeout: 15_000 });
		await page.screenshot({
			path: resolve(OUT_DIR, 'web-analyzer-home.png'),
			fullPage: false
		});

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await page.waitForSelector('#analyzer-url', { timeout: 15_000 });
		await page.screenshot({
			path: resolve(OUT_DIR, 'web-analyzer-mobile.png'),
			fullPage: false
		});

		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await page.fill('#analyzer-url', TARGET_URL);
		await page.click('button[type="submit"]');
		await page.waitForSelector('.hero-results', { timeout: 180_000 });
		await page.waitForTimeout(1500);
		await page.screenshot({
			path: resolve(OUT_DIR, 'web-analyzer-report.png'),
			fullPage: true
		});

		console.log('Capturas guardadas en static/imagenes/web-analyzer-*.png');
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
