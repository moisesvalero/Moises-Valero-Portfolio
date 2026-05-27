import { serveMarkdownTwin } from '$lib/aeo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) =>
	serveMarkdownTwin(event, '/proyectos/galeria-nova.md');
