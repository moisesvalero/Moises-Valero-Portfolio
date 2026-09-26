import http from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const DASHBOARD_HTML_PATH =
	'/Users/moisesvalerosanchez/Proyectos Web/android-home-server/media_server/dashboard/index.html';
const CHROME_PATH =
	'/Users/moisesvalerosanchez/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const mockSystem = {
	storage: { total_gb: 128.0, used_gb: 42.8, free_gb: 85.2, percent_used: 33.4 },
	battery: {
		percentage: 52,
		temperature: 34.8,
		status: 'CARGANDO',
		plugged: 'AC',
		health: 'GOOD',
		voltage: 3820,
		available: true
	},
	ram: { percent: 41.2, used_gb: 2.5, total_gb: 6.0, available: true },
	dlna_online: true,
	uptime: '14 días, 8 horas'
};

const mockMedia = [
	{
		filename: 'Dune.Part.Two.2024.1080p.mkv',
		clean_title: 'Dune: Parte Dos (2024)',
		category: 'peliculas',
		size_formatted: '4.8 GB',
		size_bytes: 5153960755,
		has_cover: true,
		cover_path: 'peliculas/dune2.jpg',
		rel_path: 'peliculas/Dune.Part.Two.2024.1080p.mkv',
		mtime: 1711000000
	},
	{
		filename: 'Oppenheimer.2023.1080p.mp4',
		clean_title: 'Oppenheimer (2023)',
		category: 'peliculas',
		size_formatted: '5.2 GB',
		size_bytes: 5583457484,
		has_cover: true,
		cover_path: 'peliculas/oppenheimer.jpg',
		rel_path: 'peliculas/Oppenheimer.2023.1080p.mp4',
		mtime: 1708000000
	},
	{
		filename: 'Interstellar.2014.1080p.mkv',
		clean_title: 'Interstellar (2014)',
		category: 'peliculas',
		size_formatted: '6.1 GB',
		size_bytes: 6549825126,
		has_cover: true,
		cover_path: 'peliculas/interstellar.jpg',
		rel_path: 'peliculas/Interstellar.2014.1080p.mkv',
		mtime: 1705000000
	},
	{
		filename: 'Severance.S01E01.1080p.mkv',
		clean_title: 'Severance - T1:E1 Good News About Hell',
		category: 'series',
		size_formatted: '1.4 GB',
		size_bytes: 1503238553,
		has_cover: true,
		cover_path: 'series/severance.jpg',
		rel_path: 'series/Severance.S01E01.1080p.mkv',
		mtime: 1712000000
	},
	{
		filename: 'The.Last.of.Us.S01E01.1080p.mkv',
		clean_title: "The Last of Us - T1:E1 When You're Lost",
		category: 'series',
		size_formatted: '1.8 GB',
		size_bytes: 1932735283,
		has_cover: true,
		cover_path: 'series/tlou.jpg',
		rel_path: 'series/The.Last.of.Us.S01E01.1080p.mkv',
		mtime: 1710000000
	},
	{
		filename: 'Blade.Runner.2049.1080p.mkv',
		clean_title: 'Blade Runner 2049',
		category: 'peliculas',
		size_formatted: '5.6 GB',
		size_bytes: 6012954214,
		has_cover: true,
		cover_path: 'peliculas/bladerunner.jpg',
		rel_path: 'peliculas/Blade.Runner.2049.1080p.mkv',
		mtime: 1707000000
	}
];

// SVG placeholder generator for covers
function generateSvgCover(title, color1, color2) {
	return `
	<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
		<defs>
			<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="${color1}"/>
				<stop offset="100%" stop-color="${color2}"/>
			</linearGradient>
		</defs>
		<rect width="300" height="450" fill="url(#grad)" rx="12"/>
		<circle cx="150" cy="180" r="50" fill="white" opacity="0.15"/>
		<polygon points="140,160 170,180 140,200" fill="white" opacity="0.85"/>
		<text x="150" y="320" fill="white" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" letter-spacing="-0.5">${title}</text>
		<text x="150" y="350" fill="white" opacity="0.6" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" text-anchor="middle">Android Media Server</text>
	</svg>`;
}

const covers = {
	'peliculas/dune2.jpg': generateSvgCover('Dune: Parte Dos', '#c27b38', '#5c2d12'),
	'peliculas/oppenheimer.jpg': generateSvgCover('Oppenheimer', '#ea580c', '#18181b'),
	'peliculas/interstellar.jpg': generateSvgCover('Interstellar', '#0284c7', '#0f172a'),
	'series/severance.jpg': generateSvgCover('Severance', '#2563eb', '#1e293b'),
	'series/tlou.jpg': generateSvgCover('The Last of Us', '#16a34a', '#14532d'),
	'peliculas/bladerunner.jpg': generateSvgCover('Blade Runner 2049', '#d946ef', '#1e1b4b')
};

async function main() {
	const htmlContent = readFileSync(DASHBOARD_HTML_PATH, 'utf-8');

	const server = http.createServer((req, res) => {
		const url = new URL(req.url, 'http://localhost:8098');

		if (url.pathname === '/' || url.pathname === '/index.html') {
			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(htmlContent);
			return;
		}

		if (url.pathname === '/api/system') {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(mockSystem));
			return;
		}

		if (url.pathname === '/api/media') {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(mockMedia));
			return;
		}

		if (url.pathname === '/api/cover') {
			const coverPath = url.searchParams.get('path');
			const svg = covers[coverPath] || generateSvgCover('Media', '#3b82f6', '#1d4ed8');
			res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
			res.end(svg);
			return;
		}

		res.writeHead(404);
		res.end('Not found');
	});

	await new Promise((res) => server.listen(8098, res));
	console.log('Servidor mock iniciado en http://localhost:8098');

	const browser = await chromium.launch({
		headless: true,
		executablePath: CHROME_PATH,
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});

	try {
		const context = await browser.newContext({
			viewport: { width: 1440, height: 810 },
			deviceScaleFactor: 2
		});

		const page = await context.newPage();

		console.log('Navegando al Dashboard real...');
		await page.goto('http://localhost:8098', { waitUntil: 'networkidle' });

		// Esperar a que se apliquen los datos de telemetría y animaciones
		await page.waitForTimeout(2000);

		// 1. Captura de la vista principal del Dashboard (16:9)
		const outDashboard = resolve('static/imagenes/android-home-server-secundaria1.png');
		await page.screenshot({ path: outDashboard });
		console.log('✅ Captura real del Dashboard guardada en: ' + outDashboard);

		// Guardar también copia en el repositorio android-home-server
		const outRepoDashboard =
			'/Users/moisesvalerosanchez/Proyectos Web/android-home-server/assets/dashboard-preview.png';
		await page.screenshot({ path: outRepoDashboard });
		console.log('✅ Captura guardada en assets de android-home-server: ' + outRepoDashboard);

		// 2. Abrir la Biblioteca y capturar el explorador VisionOS/macOS modal
		console.log('Abriendo modal de la Biblioteca para captura adicional...');
		await page.click('button[onclick*="openLibraryModal(\'all\')"]');
		await page.waitForTimeout(1000);

		const outLibrary = resolve('static/imagenes/android-home-server-dashboard-library.png');
		await page.screenshot({ path: outLibrary });
		console.log('✅ Captura de la Biblioteca guardada en: ' + outLibrary);
	} finally {
		await browser.close();
		server.close();
		console.log('Servidor y navegador cerrados.');
	}
}

main().catch((err) => {
	console.error('Error durante la captura:', err);
	process.exit(1);
});
