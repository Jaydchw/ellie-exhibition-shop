import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	configurePrivacy,
	getPrivacyApi,
	hasConsentChoice,
	loadPrivacy,
	privacyScriptUrl,
	saveDataSharing,
	type CustomerPrivacyApi,
	type PrivacyWindow
} from '../src/lib/commerce/privacy';
import type { ShopConfig } from '../src/lib/commerce/types';

const config: ShopConfig = {
	domain: 'seal-test.myshopify.com',
	token: 'public-token',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
function api(): CustomerPrivacyApi {
	return {
		consentStatus: 'loaded',
		currentVisitorConsent: () => ({ analytics: 'no', sale_of_data: 'no' }),
		saleOfDataAllowed: vi.fn(() => false),
		saleOfDataRegion: () => true,
		setTrackingConsent: vi.fn(async () => undefined)
	};
}
function target(current = api(), gpc = false): PrivacyWindow {
	return {
		location: { host: 'localhost:5173' },
		navigator: { globalPrivacyControl: gpc },
		Shopify: { customerPrivacy: current }
	} as unknown as PrivacyWindow;
}
afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe('Shopify privacy choices', () => {
	it('configures the native SDK and same-origin consent session without granting any consent', () => {
		const current = api();
		const browser = target(current);
		configurePrivacy(browser, config, '/shop-front');
		expect(browser.Shopify?.shop).toBe(config.domain);
		expect(browser.Shopify?.routes).toEqual({
			root: '/shop-front/',
			apiProxyPrefix: '/shop-front/__shopify'
		});
		expect(browser.Shopify?.customerPrivacy?.config).toMatchObject({
			isHeadless: true,
			asyncConsent: true,
			asyncVisitorState: true,
			consentDomain: 'localhost:5173'
		});
		expect(current.setTrackingConsent).not.toHaveBeenCalled();
	});
	it('does not configure a disconnected shop or arbitrary endpoint', () => {
		expect(() => configurePrivacy(target(), { ...config, live: false })).toThrow('unavailable');
		expect(() => configurePrivacy(target(), { ...config, domain: 'example.com' })).toThrow(
			'unavailable'
		);
	});
	it('does not treat a still-loading API or blank initial event as a saved choice', () => {
		expect(getPrivacyApi(target({ ...api(), consentStatus: 'loading' }))).toBeNull();
		expect(getPrivacyApi(target({ ...api(), consentStatus: undefined }))).toBeNull();
		expect(
			hasConsentChoice({ analytics: '', marketing: '', preferences: '', sale_of_data: '' })
		).toBe(false);
		expect(hasConsentChoice({ sale_of_data: 'no' })).toBe(true);
	});
	it('saves data-sharing independently of analytics or marketing consent', async () => {
		const current = api();
		expect(await saveDataSharing(target(current), current, false)).toBe(false);
		expect(current.setTrackingConsent).toHaveBeenCalledExactlyOnceWith({ sale_of_data: false });
	});
	it('reads Shopify state after an opt-in instead of assuming success', async () => {
		const current = api();
		current.setTrackingConsent = vi.fn(async () => {
			current.saleOfDataAllowed = () => true;
		});
		expect(await saveDataSharing(target(current), current, true)).toBe(true);
	});
	it('honours a browser opt-out signal in Shopify-configured data sale regions', async () => {
		const current = api();
		await expect(saveDataSharing(target(current, true), current, true)).rejects.toThrow(
			'privacy signal'
		);
		expect(current.setTrackingConsent).not.toHaveBeenCalled();
	});
	it('does not report success on an API failure', async () => {
		const current = api();
		current.setTrackingConsent = vi.fn().mockResolvedValue({ error: 'Failed' });
		await expect(saveDataSharing(target(current), current, false)).rejects.toThrow(
			'could not be saved'
		);
		expect(current.saleOfDataAllowed).not.toHaveBeenCalled();
	});
	it('lets Shopify show its regional banner automatically instead of forcing it open', async () => {
		vi.useFakeTimers();
		const browser = target();
		delete browser.Shopify!.customerPrivacy;
		const banner = { showPreferences: vi.fn(async () => undefined), showBanner: vi.fn() };
		const script = Object.assign(new EventTarget(), {
			id: '',
			src: '',
			async: false,
			remove: vi.fn()
		});
		const doc = Object.assign(new EventTarget(), {
			getElementById: () => null,
			createElement: () => script,
			head: { appendChild: vi.fn() }
		});
		vi.stubGlobal('window', browser);
		vi.stubGlobal('document', doc);
		const loaded = loadPrivacy(config);
		expect(script.src).toBe(privacyScriptUrl);
		browser.Shopify!.customerPrivacy = api();
		browser.privacyBanner = banner;
		doc.dispatchEvent(new Event('consentTrackingApiLoaded'));
		await expect(loaded).resolves.toHaveProperty('consentStatus', 'loaded');
		expect(banner.showBanner).not.toHaveBeenCalled();
		expect(banner.showPreferences).not.toHaveBeenCalled();
		expect(vi.getTimerCount()).toBe(0);
	});
	it('removes a failed SDK script so the next user request can retry', async () => {
		vi.useFakeTimers();
		const browser = target();
		delete browser.Shopify!.customerPrivacy;
		const script = Object.assign(new EventTarget(), {
			id: '',
			src: '',
			async: false,
			remove: vi.fn()
		});
		const doc = Object.assign(new EventTarget(), {
			getElementById: () => null,
			createElement: () => script,
			head: { appendChild: vi.fn() }
		});
		vi.stubGlobal('window', browser);
		vi.stubGlobal('document', doc);
		const loaded = loadPrivacy(config);
		const rejected = expect(loaded).rejects.toThrow('could not load');
		script.dispatchEvent(new Event('error'));
		await rejected;
		expect(script.remove).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
	});
});
