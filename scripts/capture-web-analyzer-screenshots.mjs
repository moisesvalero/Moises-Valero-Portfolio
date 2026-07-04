import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/** App standalone del repo https://github.com/moisesvalero/web-analyzer */
const BASE_URL = process.env.ANALYZER_URL ?? 'https://syrax-analyzer.moisesvalero.es';
const OUT_DIR = resolve('static/imagenes');

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
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
			// siguiente
		}
	}
	console.warn('Chromium del sistema no encontrado; usando binario de Playwright.');
	return chromium.launch({ headless: true });
}

async function waitForDashboard(page) {
	await page.locator('input[type="url"]').waitFor({
		timeout: 60_000
	});
}

async function runDemoAudit(page) {
	await page.getByRole('button', { name: 'moisesvalero.es', exact: true }).click();
	await page.locator('text=/Resultados del análisis|Audit results|RESULTADOS TÉCNICOS/i').first().waitFor({
		timeout: 180_000
	});
	await page.waitForTimeout(1200);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await launchBrowser();

	try {
		const page = await browser.newPage();

		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await waitForDashboard(page);
		await page.screenshot({
			path: resolve(OUT_DIR, 'web-analyzer-home.png'),
			fullPage: false
		});

		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await waitForDashboard(page);
		await page.screenshot({
			path: resolve(OUT_DIR, 'web-analyzer-mobile.png'),
			fullPage: false
		});

		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await waitForDashboard(page);
		await runDemoAudit(page);
		await page.screenshot({
			path: resolve(OUT_DIR, 'web-analyzer-report.png'),
			fullPage: true
		});

		console.log('Capturas del Web Analyzer standalone guardadas en static/imagenes/web-analyzer-*.png');
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
