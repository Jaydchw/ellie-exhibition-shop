import type { Handle } from '@sveltejs/kit';
import { getSeoConfig } from '$lib/server/seo-config';
import { productionRedirect } from '$lib/seo-config';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { hostedShopDestination } from '$lib/server/hosted-shop';

export const handle: Handle = async ({ event, resolve }) => {
	const seo = getSeoConfig(event.url);
	const destination = productionRedirect(event.url, seo.siteUrl);
	if (destination) return new Response(null, { status: 308, headers: { Location: destination } });
	const shopDestination = hostedShopDestination(
		event.url,
		{
			siteUrl: seo.siteUrl,
			storeDomain: publicEnv.PUBLIC_SHOPIFY_STORE_DOMAIN,
			shopUrl: privateEnv.SHOPIFY_ONLINE_STORE_URL
		},
		event.request.method
	);
	if (shopDestination)
		return new Response(null, {
			status: 302,
			headers: { Location: shopDestination, 'Cache-Control': 'no-store' }
		});
	const response = await resolve(event);
	if (!seo.indexableDeployment || response.status >= 400) {
		response.headers.set('X-Robots-Tag', 'noindex, follow');
	}
	if (response.status === 503) {
		response.headers.set('Retry-After', '300');
		response.headers.set('Cache-Control', 'no-store');
	}
	return response;
};
