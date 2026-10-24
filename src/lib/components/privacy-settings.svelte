<script lang="ts">
	import { onMount } from 'svelte';
	import { base, resolve } from '$app/paths';
	import type { ShopConfig } from '$lib/commerce/types';
	import {
		loadPrivacy,
		browserOptedOut,
		saveDataSharing,
		hasConsentChoice,
		privacySettingsEvent,
		dataSharingSettingsEvent,
		type CustomerPrivacyApi,
		type PrivacyWindow
	} from '$lib/commerce/privacy';
	import Modal from './shop/modal.svelte';
	import { toast } from './ui/toast';
	let { config }: { config: ShopConfig } = $props();
	let open = $state(false);
	let busy = $state(false);
	let allowed = $state(false);
	let globalOptOut = $state(false);
	let error = $state('');
	let pending: Promise<CustomerPrivacyApi> | undefined;
	let lastConsent = '';
	let initialized = false;
	let saving = false;
	function api() {
		return (pending ??= loadPrivacy(config, base)
			.then((current) => {
				lastConsent = JSON.stringify(current.currentVisitorConsent());
				initialized = true;
				return current;
			})
			.catch((cause) => {
				pending = undefined;
				throw cause;
			}));
	}
	async function preferences() {
		try {
			await api();
			await (window as PrivacyWindow).privacyBanner!.showPreferences();
		} catch {
			toast('Cookie preferences could not load. Please try again.', 'error');
		}
	}
	async function sharing() {
		try {
			const current = await api();
			allowed = current.saleOfDataAllowed();
			globalOptOut = browserOptedOut(window as PrivacyWindow, current);
			error = '';
			open = true;
		} catch {
			toast('Privacy choices could not load. Please try again.', 'error');
		}
	}
	async function save(allow: boolean) {
		if (busy) return;
		busy = true;
		saving = true;
		error = '';
		try {
			const current = await api();
			allowed = await saveDataSharing(window as PrivacyWindow, current, allow);
			lastConsent = JSON.stringify(current.currentVisitorConsent());
			open = false;
			toast(allowed ? 'Data sharing preference saved.' : 'Data sharing is switched off.');
		} catch {
			error = 'Your privacy choice could not be saved. Please try again.';
			toast(error, 'error');
		} finally {
			busy = false;
			saving = false;
		}
	}
	onMount(() => {
		const target = window as PrivacyWindow;
		function consentChanged() {
			const consent = target.Shopify?.customerPrivacy?.currentVisitorConsent?.();
			if (!consent || !hasConsentChoice(consent)) return;
			const next = JSON.stringify(consent);
			if (initialized && !saving && next !== lastConsent) toast('Privacy preferences saved.');
			lastConsent = next;
		}
		window.addEventListener(privacySettingsEvent, preferences);
		window.addEventListener(dataSharingSettingsEvent, sharing);
		document.addEventListener('visitorConsentCollected', consentChanged);
		if (config.live)
			void api()
				.then((current) => {
					lastConsent = JSON.stringify(current.currentVisitorConsent());
					initialized = true;
				})
				.catch(() => {
					// Reopening the footer control retries and reports a loading failure.
				});
		return () => {
			window.removeEventListener(privacySettingsEvent, preferences);
			window.removeEventListener(dataSharingSettingsEvent, sharing);
			document.removeEventListener('visitorConsentCollected', consentChanged);
		};
	});
</script>

<Modal bind:open title="Your privacy choices">
	<div class="privacy-content" aria-busy={busy}>
		<p>Choose whether your browsing data can be shared for advertising.</p>
		<p class="privacy-state">
			Data sharing is currently <strong>{allowed ? 'allowed' : 'switched off'}</strong>.
		</p>
		{#if globalOptOut}<p>Your browser’s privacy signal keeps data sharing switched off.</p>{/if}
		<p><a href={resolve('/policies/privacy-policy')}>Read our privacy policy</a></p>
		{#if error}<p class="error-message" role="alert">{error}</p>{/if}
		<div class="privacy-actions">
			<button type="button" class="button" disabled={busy} onclick={() => save(false)}
				>{busy ? 'Saving…' : 'Opt out of data sharing'}</button
			>
			<button
				type="button"
				class="button secondary"
				disabled={busy || globalOptOut}
				onclick={() => save(true)}>Allow data sharing</button
			>
		</div>
	</div>
</Modal>

<style>
	.privacy-content {
		max-width: 32rem;
		font-family: var(--font-sans);
	}
	.privacy-content p {
		font-size: 0.82rem;
		line-height: 1.8;
	}
	.privacy-state {
		padding-block: 0.75rem;
		border-block: 1px solid var(--line);
	}
	.privacy-actions {
		display: grid;
		gap: 0.7rem;
		margin-top: 1.5rem;
	}
</style>
