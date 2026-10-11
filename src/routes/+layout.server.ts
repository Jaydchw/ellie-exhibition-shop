import { getShopConfig } from '$lib/server/shop-config';
import { getProducts } from '$lib/commerce/shopify';
import { storefrontOpen } from '$lib/commerce/availability';
import type { ShopConfig } from '$lib/commerce/types';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ fetch }) => {
	if (!storefrontOpen) {
		const config: ShopConfig = {
			domain: '',
			token: '',
			version: '',
			live: false,
			accountUrl: '',
			newsletterUrl: ''
		};
		return { config, products: [], catalogError: false };
	}
	const config = getShopConfig();
	if (config.invalid) return { config, products: [], catalogError: true };
	if (!config.live) return { config, products: [], catalogError: true };
	try {
		return { config, products: await getProducts(config, fetch), catalogError: false };
	} catch {
		return { config, products: [], catalogError: true };
	}
};
