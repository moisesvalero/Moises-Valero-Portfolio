import assert from 'node:assert/strict';
import test from 'node:test';
import {
	computeDeliveryVerdict,
	detectWordPress,
	enrichIssue,
	isAllowedPublicAuditUrl,
	scoreCategoryFromIssues,
	auditClientLibraries,
	analyzeCms,
	type AuditIssue
} from './web-delivery-auditor.ts';

test('blocks local and private audit targets', () => {
	assert.equal(isAllowedPublicAuditUrl('http://localhost:5173'), false);
	assert.equal(isAllowedPublicAuditUrl('https://127.0.0.1'), false);
	assert.equal(isAllowedPublicAuditUrl('https://10.0.0.8'), false);
	assert.equal(isAllowedPublicAuditUrl('https://192.168.1.2'), false);
	assert.equal(isAllowedPublicAuditUrl('ftp://example.com'), false);
});

test('allows ordinary public http and https targets', () => {
	assert.equal(isAllowedPublicAuditUrl('https://example.com'), true);
	assert.equal(isAllowedPublicAuditUrl('http://example.com/path'), true);
});

test('computes delivery verdict from issue severity', () => {
	assert.equal(computeDeliveryVerdict([]), 'ready');
	assert.equal(computeDeliveryVerdict([{ severity: 'warning' } as AuditIssue]), 'review');
	assert.equal(computeDeliveryVerdict([{ severity: 'critical' } as AuditIssue]), 'block');
});

test('scores a category by penalizing critical, warning and info issues', () => {
	const issues = [
		{ severity: 'critical' },
		{ severity: 'warning' },
		{ severity: 'warning' },
		{ severity: 'info' }
	] as AuditIssue[];

	assert.equal(scoreCategoryFromIssues(issues), 54);
});

test('does not detect WordPress from plain copy mentions', () => {
	assert.equal(
		detectWordPress(`
			<html>
				<head><title>SvelteKit portfolio</title></head>
				<body>
					<p>Trabajo con SvelteKit, Supabase, APIs de IA y WordPress.</p>
					<img src="/imagenes/wordpress-logo.svg" alt="WordPress" />
				</body>
			</html>
		`),
		false
	);
});

test('detects WordPress from strong platform signals', () => {
	assert.equal(
		detectWordPress(`
			<html>
				<head>
					<meta name="generator" content="WordPress 6.5" />
					<link rel="stylesheet" href="/wp-content/themes/theme/style.css" />
				</head>
			</html>
		`),
		true
	);
	assert.equal(
		detectWordPress(
			'<script src="https://example.com/wp-includes/js/jquery/jquery.min.js"></script>'
		),
		true
	);
	assert.equal(detectWordPress('<a href="/wp-admin/">Entrar</a>'), true);
});

test('enriches mixed-content issues with repair context and AI prompt', () => {
	const issue = enrichIssue({
		id: 'security.mixed-content',
		category: 'security',
		severity: 'warning',
		title: 'Posible mixed content',
		why: 'Recursos HTTP dentro de una pagina HTTPS pueden bloquearse.',
		fix: 'Cambia recursos http:// por https:// o alojalos localmente.',
		evidence: 'http://example.com/logo.png'
	});

	assert.equal(issue.confidence, 'alta');
	assert.deepEqual(issue.affectedResources, ['http://example.com/logo.png']);
	assert.ok(issue.repairSteps?.some((step) => step.includes('http:// exacta')));
	assert.match(issue.aiPrompt ?? '', /http:\/\/example\.com\/logo\.png/);
});

test('detects vulnerable client libraries', () => {
	const htmlPolyfill = `<html><body><script src="https://polyfill.io/v3/polyfill.min.js"></script></body></html>`;
	const issuesPolyfill = auditClientLibraries(htmlPolyfill);
	assert.ok(issuesPolyfill.some((issue) => issue.id === 'security.polyfill-supply-chain'));

	const htmlOldJquery = `<html><body><script src="https://code.jquery.com/jquery-3.4.1.min.js"></script></body></html>`;
	const issuesJquery = auditClientLibraries(htmlOldJquery);
	assert.ok(issuesJquery.some((issue) => issue.id === 'security.outdated-jquery'));

	const htmlNewJquery = `<html><body><script src="https://code.jquery.com/jquery-3.6.0.min.js"></script></body></html>`;
	const issuesNewJquery = auditClientLibraries(htmlNewJquery);
	assert.equal(issuesNewJquery.length, 0);
});

test('detects CMS features like Shopify and Webflow', async () => {
	const issuesShopify = await analyzeCms('https://mystore.com', ['Shopify'], '');
	assert.ok(issuesShopify.some((issue) => issue.id === 'cms.shopify-detected'));

	const issuesWebflowBadge = await analyzeCms(
		'https://myweb.com',
		['Webflow'],
		'<html><body><div class="w-webflow-badge">Made in Webflow</div></body></html>'
	);
	assert.ok(issuesWebflowBadge.some((issue) => issue.id === 'cms.webflow-detected'));
	assert.ok(issuesWebflowBadge.some((issue) => issue.id === 'cms.webflow-badge'));
});
