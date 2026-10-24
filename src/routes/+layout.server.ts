import { getShopConfig } from '$lib/server/shop-config';
import { getStorefrontData } from '$lib/commerce/shopify';
import { getSeoConfig } from '$lib/server/seo-config';
import { getHostedShopUrl } from '$lib/server/hosted-shop-config';
import { defaultMenu } from '$lib/content/storefront';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ fetch, url }) => {
	const config = getShopConfig();
	const hostedShopUrl = getHostedShopUrl(url);
	const path = url.pathname.replace(/\/$/, '');
	const needsCatalogue =
		path === '/shop' ||
		path.startsWith('/shop/') ||
		path.startsWith('/collections/') ||
		path === '/saved';
	return {
		config,
		hostedShopUrl,
		...getSeoConfig(url),
		...(await getStorefrontData(config, fetch, needsCatalogue)),
		...(hostedShopUrl
			? { menus: { header: defaultMenu('main-menu'), footer: defaultMenu('footer') } }
			: {})
	};
};
