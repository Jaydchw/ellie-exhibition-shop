import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { AccountConfig } from './customer-account';

export function getAccountConfig(): AccountConfig {
	return {
		domain: (publicEnv.PUBLIC_SHOPIFY_STORE_DOMAIN ?? '')
			.trim()
			.replace(/^https:\/\//, '')
			.replace(/\/$/, ''),
		clientId: (privateEnv.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ?? '').trim(),
		clientSecret: (privateEnv.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET ?? '').trim() || undefined,
		sessionSecret: privateEnv.CUSTOMER_ACCOUNT_SESSION_SECRET ?? '',
		discoveryDomain: (privateEnv.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN ?? '').trim() || undefined
	};
}
