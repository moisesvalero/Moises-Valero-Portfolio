<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { t } from '$lib/i18n/index.js';
	import {
		cookieConsent,
		cookiePreferencesOpen,
		setCookieConsent,
		type CookieConsentValue
	} from '$lib/cookie-consent';

	let mounted = $state(false);
	let consent = $state<CookieConsentValue | null>(null);
	let prefsOpen = $state(false);

	const unsubConsent = cookieConsent.subscribe((v) => {
		consent = v;
	});
	const unsubPrefs = cookiePreferencesOpen.subscribe((v) => {
		prefsOpen = v;
	});

	onMount(() => {
		mounted = true;
	});

	onDestroy(() => {
		unsubConsent();
		unsubPrefs();
	});

	const visible = $derived(mounted && (consent === null || prefsOpen));

	function onEssential() {
		setCookieConsent('essential');
	}

	function onAll() {
		setCookieConsent('all');
	}
</script>

{#if visible}
	<div class="cookie-banner-root" role="region" aria-label={$t('cookieBanner.ariaLabel')}>
		<div class="cookie-banner-card">
			<p class="cookie-title">{$t('cookieBanner.title')}</p>
			<p class="cookie-text">{$t('cookieBanner.body')}</p>
			<p class="cookie-links">
				<a href={resolve('/cookies')}>{$t('cookieBanner.policyLink')}</a>
				·
				<a href={resolve('/privacidad')}>{$t('cookieBanner.privacyLink')}</a>
			</p>
			<div class="cookie-actions">
				<button type="button" class="btn ghost" onclick={onEssential}>
					{$t('cookieBanner.essential')}
				</button>
				<button type="button" class="btn primary" onclick={onAll}>
					{$t('cookieBanner.all')}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.cookie-banner-root {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 15000;
		padding: 16px;
		padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
		display: flex;
		justify-content: center;
		pointer-events: none;
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
	}

	.cookie-banner-card {
		pointer-events: auto;
		max-width: 520px;
		width: 100%;
		background: rgba(255, 255, 255, 0.96);
		border: 1px solid #e8e8ed;
		border-radius: 18px;
		padding: 20px 22px;
		box-shadow:
			0 18px 50px rgba(29, 29, 31, 0.14),
			0 1px 0 rgba(255, 255, 255, 0.9) inset;
		backdrop-filter: blur(12px);
		contain: layout style paint;
	}

	.cookie-title {
		margin: 0 0 8px;
		font-size: 15px;
		font-weight: 700;
		color: #1d1d1f;
		letter-spacing: -0.02em;
	}

	.cookie-text {
		margin: 0 0 10px;
		font-size: 13px;
		line-height: 1.55;
		color: #424245;
	}

	.cookie-links {
		margin: 0 0 16px;
		font-size: 12px;
	}

	.cookie-links a {
		color: #0071e3;
		text-decoration: none;
		font-weight: 600;
	}

	.cookie-links a:hover {
		text-decoration: underline;
	}

	.cookie-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: flex-end;
	}

	.btn {
		font-family: inherit;
		font-size: 13px;
		font-weight: 600;
		padding: 10px 16px;
		border-radius: 8px;
		cursor: pointer;
		border: none;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.btn.primary {
		background: #0071e3;
		color: #fff;
		box-shadow: 0 6px 20px rgba(0, 113, 227, 0.25);
	}

	.btn.primary:hover {
		background: #0077ed;
		transform: translateY(-1px);
	}

	.btn.ghost {
		background: rgba(0, 0, 0, 0.05);
		color: #1d1d1f;
		border: 1px solid #e8e8ed;
	}

	.btn.ghost:hover {
		background: rgba(0, 0, 0, 0.08);
	}

	@media (max-width: 480px) {
		.cookie-actions {
			flex-direction: column-reverse;
			align-items: stretch;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
