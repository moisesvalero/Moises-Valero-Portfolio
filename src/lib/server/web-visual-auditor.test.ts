import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, isPrivateOrLocalResource, isSmallTapTarget, visualAuditUnavailableSignals } from './web-visual-auditor.ts';

test('computes WCAG contrast ratio extremes', () => {
	assert.equal(Math.round(contrastRatio([0, 0, 0], [255, 255, 255])), 21);
	assert.equal(contrastRatio([255, 255, 255], [255, 255, 255]), 1);
});

test('detects small tap targets using 44px baseline', () => {
	assert.equal(isSmallTapTarget(43, 60), true);
	assert.equal(isSmallTapTarget(60, 43), true);
	assert.equal(isSmallTapTarget(44, 44), false);
	assert.equal(isSmallTapTarget(90, 52), false);
});

test('builds visual audit fallback signals', () => {
	const signals = visualAuditUnavailableSignals('Chromium missing');
	assert.equal(signals.visualAuditAvailable, false);
	assert.equal(signals.visualAuditReason, 'Chromium missing');
	assert.deepEqual(signals.viewportChecks, []);
});

test('blocks private browser subresources', () => {
	assert.equal(isPrivateOrLocalResource('http://localhost:3000/app.js'), true);
	assert.equal(isPrivateOrLocalResource('https://127.0.0.1/admin'), true);
	assert.equal(isPrivateOrLocalResource('https://192.168.1.4/file'), true);
	assert.equal(isPrivateOrLocalResource('https://example.com/app.js'), false);
});
