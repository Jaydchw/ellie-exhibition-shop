import { env } from '$env/dynamic/public';
import type { ShopConfig } from '$lib/commerce/types';
function httpsUrl(value: string | undefined, fallback = '') {
	if (!value) return fallback;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' ? url.href : fallback;
	} catch {
		return fallback;
	}
}
export function getShopConfig(): ShopConfig {
	const domain = (env.PUBLIC_SHOPIFY_STORE_DOMAIN ?? '')
		.trim()
		.replace(/^https:\/\//, '')
		.replace(/\/$/, '');
	const token = (env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '').trim();
	// Restrict the API destination, and never accept a private/Admin token here.
	const live =
		/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain) &&
		!!token &&
		!/^shpat_|^shppa_/.test(token);
	return {
		domain,
		token: live ? token : '',
		live,
		invalid: !!(domain || token) && !live,
		version: /^\d{4}-(01|04|07|10)$/.test(env.PUBLIC_SHOPIFY_API_VERSION ?? '')
			? env.PUBLIC_SHOPIFY_API_VERSION!
			: '2026-07',
		accountUrl: httpsUrl(env.PUBLIC_CUSTOMER_ACCOUNT_URL, live ? `https://${domain}/account` : ''),
		newsletterUrl: httpsUrl(env.PUBLIC_NEWSLETTER_URL)
	};
}
