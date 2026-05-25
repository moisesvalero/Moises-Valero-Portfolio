import assert from 'node:assert/strict';
import test from 'node:test';
import {
	computeDeliveryVerdict,
	isAllowedPublicAuditUrl,
	scoreCategoryFromIssues,
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
