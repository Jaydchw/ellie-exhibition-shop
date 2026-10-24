type HostedShopOptions = {
	siteUrl: string;
	storeDomain?: string;
	shopUrl?: string;
};

function shopOrigin(options: HostedShopOptions): URL | null {
	try {
		const domain = (options.storeDomain?.trim() || 'pr8fqg-6y.myshopify.com')
			.trim()
			.replace(/^https:\/\//i, '')
			.replace(/\/$/, '');
		const configured = options.shopUrl?.trim();
		if (!configured && !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) return null;
		const shop = new URL(configured || `https://${domain}`);
		const site = new URL(options.siteUrl);
		if (
			shop.protocol !== 'https:' ||
			shop.username ||
			shop.password ||
			shop.port ||
			shop.pathname !== '/' ||
			shop.search ||
			shop.hash ||
			shop.hostname.replace(/^www\./, '') === site.hostname.replace(/^www\./, '') ||
			shop.hostname === 'localhost' ||
			shop.hostname.endsWith('.localhost') ||
			/^\d+(?:\.\d+){3}$/.test(shop.hostname) ||
			shop.hostname.startsWith('[')
		)
			return null;
		return shop;
	} catch {
		return null;
	}
}

/**
 * The public artist site hands shopping over to Shopify. The custom commerce
 * routes remain untouched and can still be opened on localhost/branch previews.
 * This must run in the request hook before any catalogue/layout load functions.
 */
export function hostedShopDestination(
	requestUrl: URL,
	options: HostedShopOptions,
	method = 'GET'
): string | null {
	if (!['GET', 'HEAD'].includes(method)) return null;
	try {
		if (requestUrl.origin !== new URL(options.siteUrl).origin) return null;
	} catch {
		return null;
	}
	const path = requestUrl.pathname.replace(/\/+$/, '') || '/';
	let destinationPath: string;
	let product = false;
	if (path === '/shop') {
		const category = requestUrl.searchParams.get('category');
		destinationPath =
			category === 'prints' || category === 'originals' ? `/collections/${category}` : '/';
	} else if (path === '/account' || path === '/account/login') {
		destinationPath = '/account';
	} else if (path === '/cart') {
		destinationPath = '/cart';
	} else if (path === '/saved') {
		destinationPath = '/';
	} else if (path === '/policies') {
		destinationPath = '/policies/privacy-policy';
	} else {
		const match = /^\/(shop|collections|policies)\/([^/]+)$/.exec(path);
		if (!match) return null;
		let handle: string;
		try {
			handle = decodeURIComponent(match[2]);
		} catch {
			return null;
		}
		if (!/^[a-z0-9][a-z0-9-]*$/i.test(handle)) return null;
		product = match[1] === 'shop';
		destinationPath = `/${product ? 'products' : match[1]}/${encodeURIComponent(handle)}`;
	}
	const shop = shopOrigin(options);
	if (!shop) return null;
	shop.pathname = destinationPath;
	// Shopify's variant URL uses a numeric ID rather than the Storefront GID.
	const variant = requestUrl.searchParams.get('variant');
	if (product && variant) {
		const match = /^(?:gid:\/\/shopify\/ProductVariant\/)?(\d+)$/.exec(variant);
		if (match) shop.searchParams.set('variant', match[1]);
	}
	if (path === '/shop') {
		const query = requestUrl.searchParams.get('q')?.trim();
		if (query || requestUrl.searchParams.get('search') === '1') {
			shop.pathname = '/search';
			if (query) shop.searchParams.set('q', query.slice(0, 250));
			shop.searchParams.set('type', 'product');
		}
	}
	return shop.href;
}
