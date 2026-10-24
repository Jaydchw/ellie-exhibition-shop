import { getCollections, getPages, getProducts } from '../commerce/shopify';
import { getPolicies, type StorePolicy } from '../commerce/policies';
import type { Collection, MerchantPageSummary, Product, ShopConfig } from '../commerce/types';

export const staticPagePaths = ['/', '/murals', '/murals/hull', '/about', '/help', '/contact'];
export const sitemapPaths = ['/sitemap-pages.xml', '/sitemap-shop.xml'];

type SitemapEntry = { path: string; updatedAt?: string; images?: string[] };

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function absoluteUrl(origin: string, path: string): string {
	return new URL(path, origin + '/').href;
}

function lastModified(value?: string): string | undefined {
	if (!value) return undefined;
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function latestModified(values: (string | undefined)[]): string | undefined {
	return values
		.map(lastModified)
		.filter((value): value is string => !!value)
		.sort()
		.at(-1);
}

function validImage(value: string): boolean {
	try {
		return new URL(value).protocol === 'https:';
	} catch {
		return false;
	}
}

export function sitemapXml(origin: string, entries: SitemapEntry[]): string {
	const seen = new Set<string>();
	const urls = entries.flatMap((entry) => {
		const url = absoluteUrl(origin, entry.path);
		if (seen.has(url)) return [];
		seen.add(url);
		const modified = lastModified(entry.updatedAt);
		const images = [...new Set(entry.images?.filter(validImage) ?? [])].slice(0, 1000);
		return [
			'<url><loc>' +
				escapeXml(url) +
				'</loc>' +
				(modified ? '<lastmod>' + modified + '</lastmod>' : '') +
				images
					.map(
						(image) => '<image:image><image:loc>' + escapeXml(image) + '</image:loc></image:image>'
					)
					.join('') +
				'</url>'
		];
	});
	return (
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' +
		urls.join('') +
		'</urlset>'
	);
}

export function sitemapIndexXml(origin: string, paths = sitemapPaths): string {
	return (
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
		paths
			.map((path) => '<sitemap><loc>' + escapeXml(absoluteUrl(origin, path)) + '</loc></sitemap>')
			.join('') +
		'</sitemapindex>'
	);
}

export function staticSitemapXml(origin: string): string {
	return sitemapXml(
		origin,
		staticPagePaths.map((path) => ({ path }))
	);
}

export function shopSitemapXml(
	origin: string,
	products: Product[],
	collections: Collection[],
	pages: MerchantPageSummary[],
	policies: Pick<StorePolicy, 'handle'>[] = []
): string {
	const entries: SitemapEntry[] = products.length
		? [{ path: '/shop', updatedAt: latestModified(products.map((product) => product.updatedAt)) }]
		: [];
	entries.push(
		...products.map((product) => ({
			path: '/shop/' + encodeURIComponent(product.handle),
			updatedAt: product.updatedAt,
			images: product.images.map((image) => image.url)
		}))
	);
	entries.push(
		...collections
			.filter((collection) => collection.hasProducts === true)
			.map((collection) => ({
				path: '/collections/' + encodeURIComponent(collection.handle),
				updatedAt: collection.updatedAt,
				images: collection.image ? [collection.image.url] : []
			}))
	);
	// These Shopify page handles link to the site's existing editorial pages.
	// Include only their canonical local route in the static sitemap.
	entries.push(
		...pages
			.filter((page) => !['about', 'help', 'murals', 'contact'].includes(page.handle))
			.map((page) => ({
				path: '/pages/' + encodeURIComponent(page.handle),
				updatedAt: page.updatedAt
			}))
	);
	if (policies.length) {
		entries.push(
			{ path: '/policies' },
			...policies.map((policy) => ({ path: `/policies/${policy.handle}` }))
		);
	}
	return sitemapXml(origin, entries);
}

export function xmlResponse(body: string): Response {
	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=300, s-maxage=300',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}

export async function shopSitemapResponse(
	origin: string,
	config: ShopConfig,
	fetcher: typeof fetch
): Promise<Response> {
	try {
		if (!config.live) throw new Error('Shopify is unavailable.');
		const [products, collections, pages, policies] = await Promise.all([
			getProducts(config, fetcher),
			getCollections(config, fetcher),
			getPages(config, fetcher),
			// Policy discovery is independent of catalogue availability.
			getPolicies(config, fetcher).catch(() => [])
		]);
		return xmlResponse(shopSitemapXml(origin, products, collections, pages, policies));
	} catch {
		// Keep a temporary API outage from replacing the last successful catalogue
		// with a misleading, incomplete 200 response. The static sitemap stays live.
		return new Response('The shop sitemap is temporarily unavailable. Please try again later.', {
			status: 503,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store',
				'Retry-After': '300'
			}
		});
	}
}

export function robotsText(origin: string): string {
	// Utility pages use noindex metadata. Blocking them here would prevent
	// crawlers from seeing that instruction. Public CSS, JS and images stay open.
	return 'User-agent: *\nAllow: /\n\nSitemap: ' + absoluteUrl(origin, '/sitemap.xml') + '\n';
}
