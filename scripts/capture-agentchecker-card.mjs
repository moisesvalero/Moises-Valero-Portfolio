import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL = process.env.AGENTCHECKER_URL ?? 'https://agentcheck-rho.vercel.app';
const OUT = resolve('static/imagenes/agentchecker-card.png');

async function launchBrowser() {
	const candidates = [
		process.env.CHROME_PATH,
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium',
		'/usr/bin/google-chrome'
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
	await mkdir(resolve('static/imagenes'), { recursive: true });
	const browser = await launchBrowser();
	try {
		const page = await browser.newPage({
			viewport: { width: 1440, height: 810 },
			deviceScaleFactor: 2
		});
		await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
		await page.waitForTimeout(1500);
		await page.screenshot({ path: OUT, type: 'png', fullPage: false });
		console.log(`OK: ${OUT}`);
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
