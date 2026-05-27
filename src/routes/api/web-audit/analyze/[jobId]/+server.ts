import { json } from '@sveltejs/kit';
import { getAnalyzeJob } from '$lib/server/web-audit-analyzer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const jobId = params.jobId?.trim();
	if (!jobId) {
		return json({ ok: false, error: 'Falta identificador del analisis.' }, { status: 400 });
	}

	const job = getAnalyzeJob(jobId);
	if (!job) {
		return json({ ok: false, error: 'Analisis no encontrado o expirado.' }, { status: 404 });
	}

	if (job.status === 'completed' && job.result) {
		return json({ ok: true, status: 'completed', result: job.result });
	}
	if (job.status === 'error') {
		return json({
			ok: true,
			status: 'error',
			error: job.error || 'No se pudo completar el analisis.'
		});
	}

	return json({ ok: true, status: job.status, pollAfterMs: 1000 });
};
