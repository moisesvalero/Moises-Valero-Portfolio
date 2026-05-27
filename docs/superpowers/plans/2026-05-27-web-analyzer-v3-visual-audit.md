# Web Analyzer V3 Visual Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-browser visual audit layer to the existing web analyzer without breaking the current V2 HTML/header audit.

**Architecture:** Keep `web-delivery-auditor.ts` as the orchestrator. Add a focused `web-visual-auditor.ts` module that attempts an optional Chromium/Playwright render, returns issues, passed checks, and visual signals, and gracefully reports unavailable checks if the runtime cannot launch a browser. UI and email consume the new signals like the existing V2 signals.

**Tech Stack:** SvelteKit server code, TypeScript, optional `playwright-core` + `@sparticuz/chromium`, existing Svelte UI, `node:test` for pure helper coverage.

---

### Task 1: Add Optional Browser Audit Module

**Files:**
- Create: `src/lib/server/web-visual-auditor.ts`
- Modify: `src/lib/server/web-delivery-auditor.ts`
- Test: `src/lib/server/web-visual-auditor.test.ts`

- [ ] Add exported helper functions for contrast ratio, tap target evaluation, browser availability fallback, and issue creation from visual signals.
- [ ] Add `auditVisualWebsite(url, options)` that dynamically imports browser dependencies, opens the page with console/request tracking, audits mobile and desktop viewports, and returns `{ available, issues, passed, signals }`.
- [ ] Ensure failures return `available: false` and never throw into the main analyzer.
- [ ] Add pure unit tests for contrast and tap-target helpers.

### Task 2: Merge Visual Signals Into Public Audit

**Files:**
- Modify: `src/lib/server/web-delivery-auditor.ts`
- Modify: `src/lib/server/web-audit-analyzer.ts`

- [ ] Extend `PublicWebAudit.signals` with visual audit signals.
- [ ] Run `auditVisualWebsite(finalUrl)` in parallel with existing async checks.
- [ ] Append visual issues and passed checks to the main categories.
- [ ] Add fallback signal defaults in `fallbackAudit`.

### Task 3: Surface V3 In UI And Email

**Files:**
- Modify: `src/routes/tools/analizador-web/+page.svelte`
- Modify: `src/routes/api/web-audit/lead/+server.ts`

- [ ] Add visual audit signals to the Svelte result type and normalization.
- [ ] Add visible report cards for browser audit availability, console errors, failed render resources, tap-target warnings, contrast warnings, overflow, cookies-before-consent, and responsive viewports.
- [ ] Add the same values to the email technical-signal tables.
- [ ] Run Svelte autofixer.

### Task 4: Verify Production Safety

**Files:**
- Modify: `package.json`, `package-lock.json` only if dependencies are needed.

- [ ] Install optional browser dependencies if absent.
- [ ] Run unit tests with `node --test`.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Run local analyzer on `https://example.com` and confirm V2 still works even if browser audit is unavailable.
- [ ] Commit and push.
