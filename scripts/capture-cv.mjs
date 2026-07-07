import { chromium } from 'playwright-core';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const PDF_PATH = resolve('static/imagenes/MOISES-VALERO-CV.pdf');
const OUT_PATH = resolve('static/imagenes/cv/moises-valero-cv-1.png');

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
	console.log('Cargando PDF...');
	const pdfBuffer = await readFile(PDF_PATH);
	const pdfBase64 = pdfBuffer.toString('base64');

	console.log('Iniciando navegador...');
	const browser = await launchBrowser();
	try {
		const page = await browser.newPage();

		console.log('Cargando estructura HTML...');
		await page.setContent(`
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body { margin: 0; padding: 0; background: transparent; }
					canvas { display: block; }
				</style>
			</head>
			<body>
				<canvas id="pdf-canvas"></canvas>
			</body>
			</html>
		`);

		console.log('Inyectando PDF.js...');
		await page.addScriptTag({
			url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
		});

		console.log('Renderizando PDF a canvas...');
		const dimensions = await page.evaluate(async (base64Data) => {
			// Configurar worker de PDF.js
			pdfjsLib.GlobalWorkerOptions.workerSrc =
				'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

			// Convertir base64 a Uint8Array
			const bin = atob(base64Data);
			const len = bin.length;
			const bytes = new Uint8Array(len);
			for (let i = 0; i < len; i++) {
				bytes[i] = bin.charCodeAt(i);
			}

			// Cargar documento PDF
			const loadingTask = pdfjsLib.getDocument({ data: bytes });
			const pdf = await loadingTask.promise;

			// Obtener primera página
			const pdfPage = await pdf.getPage(1);

			// Usar escala alta para nitidez
			const scale = 2.0;
			const viewport = pdfPage.getViewport({ scale });

			const canvas = document.getElementById('pdf-canvas');
			const context = canvas.getContext('2d');
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			const renderContext = {
				canvasContext: context,
				viewport: viewport
			};
			await pdfPage.render(renderContext).promise;

			return {
				width: Math.ceil(viewport.width),
				height: Math.ceil(viewport.height)
			};
		}, pdfBase64);

		console.log(
			`Ajustando viewport a las dimensiones del canvas: ${dimensions.width}x${dimensions.height}`
		);
		await page.setViewportSize({ width: dimensions.width, height: dimensions.height });

		console.log('Creando directorio de salida...');
		await mkdir(resolve('static/imagenes/cv'), { recursive: true });

		console.log(`Guardando captura en: ${OUT_PATH}`);
		const canvasElement = await page.$('#pdf-canvas');
		if (!canvasElement) {
			throw new Error('No se encontró el elemento canvas');
		}
		await canvasElement.screenshot({ path: OUT_PATH, omitBackground: true });
		console.log('¡Captura realizada con éxito!');
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error('Error al capturar el CV:', err);
	process.exit(1);
});
