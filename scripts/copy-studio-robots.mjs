import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
	const robotsContent = 'User-agent: *\nDisallow: /\n';
	fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsContent);
	console.log('robots.txt copiado exitosamente a dist/');
} else {
	console.error('El directorio dist/ no existe. Asegúrate de ejecutar sanity build primero.');
}
