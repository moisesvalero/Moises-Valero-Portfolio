import { getCliClient } from 'sanity/cli';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expectedProjectId =
	process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || '5zhz6irf';
const expectedDataset =
	process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production';

async function main() {
	const client = getCliClient({ apiVersion: '2025-01-01' });
	const config = client.config();

	const [user, caseStudyCount, sampleTitles] = await Promise.all([
		client.request<{ id: string; name: string; email: string }>({ uri: '/users/me', withCredentials: true }),
		client.fetch<number>(`count(*[_type == "caseStudy"])`),
		client.fetch<Array<{ title?: string; slug?: { current?: string } }>>(
			`*[_type == "caseStudy"] | order(_updatedAt desc)[0...5]{ title, slug }`
		)
	]);

	const projectMatch = config.projectId === expectedProjectId;
	const datasetMatch = config.dataset === expectedDataset;

	const result = {
		ok: projectMatch && datasetMatch,
		loggedInAs: {
			id: user.id,
			name: user.name,
			email: user.email
		},
		cliConfig: {
			projectId: config.projectId,
			dataset: config.dataset
		},
		expected: {
			projectId: expectedProjectId,
			dataset: expectedDataset
		},
		projectMatch,
		datasetMatch,
		caseStudyCount,
		recentCaseStudies: sampleTitles.map((doc) => ({
			title: doc.title ?? '(sin titulo)',
			slug: doc.slug?.current ?? '(sin slug)'
		}))
	};

	const outPath = resolve(process.cwd(), 'sanity/.auth-check-result.json');
	writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
	console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	writeFileSync(
		resolve(process.cwd(), 'sanity/.auth-check-result.json'),
		`${JSON.stringify({ ok: false, error: message }, null, 2)}\n`,
		'utf8'
	);
	console.error(message);
	process.exit(1);
});
