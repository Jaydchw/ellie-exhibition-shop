import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { getSiteOrigin } from './seo-config';
import { hostedShopDestination } from './hosted-shop';

export function getHostedShopUrl(requestUrl: URL): string | null {
	return hostedShopDestination(new URL('/shop', requestUrl), {
		siteUrl: getSiteOrigin(requestUrl),
		storeDomain: publicEnv.PUBLIC_SHOPIFY_STORE_DOMAIN,
		shopUrl: privateEnv.SHOPIFY_ONLINE_STORE_URL
	});
}
