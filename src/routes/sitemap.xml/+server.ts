import { getShopConfig } from '$lib/server/shop-config';
import { getProducts } from '$lib/commerce/shopify';
import { storefrontOpen } from '$lib/commerce/availability';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ url, fetch }) => {
	let paths: string[] = ['/murals'];
	if (storefrontOpen) {
		const config = getShopConfig();
		if (!config.live) {
			return new Response('Catalogue temporarily unavailable', { status: 503 });
		}
		try {
			const products = await getProducts(config, fetch);
			paths = [
				'',
				'/shop',
				'/about',
				'/help',
				'/murals',
				...products.map((p) => '/shop/' + encodeURIComponent(p.handle))
			];
		} catch {
			return new Response('Catalogue temporarily unavailable', { status: 503 });
		}
	}
	const escape = (value: string) =>
		value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
	return new Response(
		'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
			paths.map((p) => '<url><loc>' + escape(url.origin + p) + '</loc></url>').join('') +
			'</urlset>',
		{
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=300'
			}
		}
	);
};
