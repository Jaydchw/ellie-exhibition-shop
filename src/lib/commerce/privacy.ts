import type { ShopConfig } from './types';

export const privacyScriptUrl =
	'https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js';
export const privacySettingsEvent = 'seal:privacy-settings';
export const dataSharingSettingsEvent = 'seal:data-sharing-settings';

export type VisitorConsent = {
	analytics?: string;
	marketing?: string;
	preferences?: string;
	sale_of_data?: string;
};
export type CustomerPrivacyApi = {
	config?: Record<string, unknown>;
	consentStatus?: 'loading' | 'loaded';
	currentVisitorConsent: () => VisitorConsent;
	saleOfDataAllowed: () => boolean;
	saleOfDataRegion?: () => boolean;
	setTrackingConsent: (consent: { sale_of_data: boolean }) => Promise<unknown>;
};
export type PrivacyWindow = Window & {
	Shopify?: {
		shop?: string;
		locale?: string;
		routes?: { root?: string; apiProxyPrefix?: string };
		customerPrivacy?: Partial<CustomerPrivacyApi>;
	};
	privacyBanner?: { showPreferences: () => Promise<void> };
};

export function openPrivacySettings() {
	if (typeof window !== 'undefined') window.dispatchEvent(new Event(privacySettingsEvent));
}
export function openDataSharingSettings() {
	if (typeof window !== 'undefined') window.dispatchEvent(new Event(dataSharingSettingsEvent));
}

// Shopify's current headless bootstrap uses an HTTP-only consent session through
// the same-origin proxy. No consent cookie or parallel local consent is written here.
export function configurePrivacy(target: PrivacyWindow, config: ShopConfig, base = '') {
	if (!config.live || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(config.domain))
		throw new Error('Privacy settings are temporarily unavailable. Please try again later.');
	const shopify = (target.Shopify ??= {});
	shopify.shop = config.domain;
	shopify.locale = 'en';
	shopify.routes = {
		...shopify.routes,
		root: `${base}/`,
		apiProxyPrefix: `${base}/__shopify`
	};
	const api = (shopify.customerPrivacy ??= {});
	api.config = {
		...api.config,
		isHeadless: true,
		asyncConsent: true,
		asyncVisitorState: true,
		consentDomain: target.location.host
	};
}

export function getPrivacyApi(target: PrivacyWindow): CustomerPrivacyApi | null {
	const api = target.Shopify?.customerPrivacy;
	return api &&
		typeof api.currentVisitorConsent === 'function' &&
		typeof api.saleOfDataAllowed === 'function' &&
		typeof api.setTrackingConsent === 'function' &&
		api.consentStatus === 'loaded'
		? (api as CustomerPrivacyApi)
		: null;
}

export function hasConsentChoice(consent: VisitorConsent) {
	return ['analytics', 'marketing', 'preferences', 'sale_of_data'].some(
		(key) =>
			consent[key as keyof VisitorConsent] === 'yes' ||
			consent[key as keyof VisitorConsent] === 'no'
	);
}

export function loadPrivacy(config: ShopConfig, base = ''): Promise<CustomerPrivacyApi> {
	const target = window as PrivacyWindow;
	configurePrivacy(target, config, base);
	const existingApi = getPrivacyApi(target);
	if (existingApi && target.privacyBanner) return Promise.resolve(existingApi);
	return new Promise((resolve, reject) => {
		let script = document.getElementById('shopify-privacy-sdk') as HTMLScriptElement | null;
		const poll = setInterval(ready, 100);
		const timeout = setTimeout(() => fail(), 15000);
		function cleanup() {
			clearTimeout(timeout);
			clearInterval(poll);
			document.removeEventListener('consentTrackingApiLoaded', ready);
			script?.removeEventListener('error', fail);
		}
		function fail() {
			cleanup();
			script?.remove();
			reject(new Error('Privacy settings could not load. Please try again.'));
		}
		function ready() {
			const api = getPrivacyApi(target);
			if (!api || !target.privacyBanner) return;
			cleanup();
			resolve(api);
		}
		document.addEventListener('consentTrackingApiLoaded', ready);
		if (!script) {
			script = document.createElement('script');
			script.id = 'shopify-privacy-sdk';
			script.src = privacyScriptUrl;
			script.async = true;
			script.addEventListener('error', fail, { once: true });
			document.head.appendChild(script);
		}
		// The API readiness event and banner can arrive in either order.
		ready();
	});
}

export function browserOptedOut(target: PrivacyWindow, api: CustomerPrivacyApi) {
	return (
		(target.navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ===
			true && api.saleOfDataRegion?.() === true
	);
}

export async function saveDataSharing(
	target: PrivacyWindow,
	api: CustomerPrivacyApi,
	allow: boolean
): Promise<boolean> {
	if (allow && browserOptedOut(target, api))
		throw new Error('Your browser privacy signal keeps data sharing switched off.');
	const result = await api.setTrackingConsent({ sale_of_data: allow });
	if (result && typeof result === 'object' && 'error' in result && result.error)
		throw new Error('Your privacy choice could not be saved. Please try again.');
	return api.saleOfDataAllowed();
}
