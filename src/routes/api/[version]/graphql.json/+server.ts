import { getShopConfig } from '$lib/server/shop-config';
import { proxyStorefront } from '$lib/server/storefront-proxy';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request, params, fetch, getClientAddress }) => {
	let buyerIp: string | undefined;
	try {
		buyerIp = getClientAddress();
	} catch {
		// Adapter previews may not expose a client IP.
	}
	return proxyStorefront(request, params.version, getShopConfig(), fetch, buyerIp);
};
