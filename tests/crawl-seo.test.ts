import { describe, expect, it, vi } from 'vitest';
import {
	robotsText,
	shopSitemapResponse,
	shopSitemapXml,
	sitemapIndexXml,
	sitemapXml,
	staticSitemapXml
} from '../src/lib/server/sitemap';
import type { Collection, Product, ShopConfig } from '../src/lib/commerce/types';

const origin = 'https://ellie.example';
const product: Product = {
	id: 'original-1',
	handle: 'sold-work',
	title: 'Sold work',
	description: '',
	productType: 'Original',
	tags: [],
	options: [],
	updatedAt: '2026-10-20T12:30:00Z',
	images: [
		{ url: 'https://cdn.shopify.com/art.jpg?width=1200&format=webp', altText: 'Original painting' }
	],
	variants: [
		{
			id: 'v1',
			title: 'Default Title',
			availableForSale: false,
			selectedOptions: [],
			price: { amount: '300', currencyCode: 'GBP' }
		}
	]
};
const collection: Collection = {
	id: 'collection-1',
	handle: 'originals',
	title: 'Originals',
	description: '',
	image: null,
	hasProducts: true,
	updatedAt: '2026-10-19T09:00:00Z'
};
const config: ShopConfig = {
	domain: 'ellie-test.myshopify.com',
	token: 'public-test-token',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
const emptyPage = { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };

describe('sitemap discovery', () => {
	it('advertises canonical child sitemaps without inventing modification dates', () => {
		const index = sitemapIndexXml(origin);
		expect(index).toContain('<sitemapindex');
		expect(index).toContain('<loc>https://ellie.example/sitemap-pages.xml</loc>');
		expect(index).toContain('<loc>https://ellie.example/sitemap-shop.xml</loc>');
		expect(index).not.toContain('lastmod');
	});

	it('keeps local service pages discoverable independently of Shopify', () => {
		const xml = staticSitemapXml(origin);
		expect(xml).toContain('<loc>https://ellie.example/murals/hull</loc>');
		expect(xml).toContain('<loc>https://ellie.example/murals</loc>');
		expect(xml).not.toContain('<loc>https://ellie.example/about</loc>');
		expect(xml).not.toContain('<loc>https://ellie.example/help</loc>');
		expect(xml).not.toContain('<loc>https://ellie.example/contact</loc>');
		expect(xml).not.toContain('/saved');
		expect(xml).not.toContain('/account');
		expect(xml).not.toContain('lastmod');
	});
	it('can advertise only the artist sitemap after commerce moves to native Shopify', () => {
		const index = sitemapIndexXml(origin, ['/sitemap-pages.xml']);
		expect(index).toContain('<loc>https://ellie.example/sitemap-pages.xml</loc>');
		expect(index).not.toContain('sitemap-shop.xml');
		expect(staticSitemapXml(origin)).not.toContain('<loc>https://ellie.example/shop');
		expect(sitemapXml(origin, [])).not.toContain('<url>');
	});

	it('includes sold originals, excludes empty collections and avoids duplicate editorial URLs', () => {
		const xml = shopSitemapXml(
			origin,
			[product],
			[collection, { ...collection, handle: 'empty', hasProducts: false }],
			[
				{ handle: 'studio-visits', title: 'Studio visits', updatedAt: '2026-10-21T10:00:00Z' },
				{ handle: 'about', title: 'About Ellie' }
			]
		);
		expect(xml).toContain('<loc>https://ellie.example/shop/sold-work</loc>');
		expect(xml).toContain('<loc>https://ellie.example/collections/originals</loc>');
		expect(xml).toContain('<loc>https://ellie.example/pages/studio-visits</loc>');
		expect(xml).toContain('<lastmod>2026-10-20T12:30:00.000Z</lastmod>');
		expect(xml).toContain(
			'<image:loc>https://cdn.shopify.com/art.jpg?width=1200&amp;format=webp</image:loc>'
		);
		expect(xml).not.toContain('/collections/empty');
		expect(xml).not.toContain('/pages/about');
		expect(xml).not.toContain('?variant=');
	});

	it('does not advertise an empty shop or use invalid dates and image schemes', () => {
		expect(shopSitemapXml(origin, [], [], [])).not.toContain('<loc>');
		const xml = sitemapXml(origin, [
			{
				path: '/help',
				updatedAt: 'invalid',
				images: ['javascript:alert(1)', 'data:image/png;base64,none']
			},
			{ path: '/help' }
		]);
		expect(xml.match(/<loc>/g) ?? []).toHaveLength(1);
		expect(xml).not.toContain('lastmod');
		expect(xml).not.toContain('<image:image>');
	});
	it('discovers only published policy pages and their index', () => {
		const xml = shopSitemapXml(origin, [], [], [], [{ handle: 'privacy-policy' }]);
		expect(xml).toContain('<loc>https://ellie.example/policies</loc>');
		expect(xml).toContain('<loc>https://ellie.example/policies/privacy-policy</loc>');
		expect(xml).not.toContain('refund-policy');
	});

	it('returns a retryable error rather than a truncated successful shop sitemap', async () => {
		const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
		const response = await shopSitemapResponse(origin, config, fetcher);
		expect(response.status).toBe(503);
		expect(response.headers.get('Retry-After')).toBe('300');
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(await response.text()).not.toContain('<urlset');
	});

	it('makes no requests with unavailable Shopify configuration', async () => {
		const fetcher = vi.fn();
		const response = await shopSitemapResponse(origin, { ...config, live: false }, fetcher);
		expect(response.status).toBe(503);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('produces a complete XML response only after all resource queries succeed', async () => {
		const fetcher = vi.fn().mockImplementation(async (_url, init: RequestInit) => {
			const { query } = JSON.parse(String(init.body));
			if (query.includes('query ShopPolicies')) return Response.json({ data: { shop: {} } });
			const key = query.includes('query Catalogue')
				? 'products'
				: query.includes('query Collections')
					? 'collections'
					: 'pages';
			return Response.json({ data: { [key]: emptyPage } });
		});
		const response = await shopSitemapResponse(origin, config, fetcher);
		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('application/xml');
		expect(fetcher).toHaveBeenCalledTimes(4);
		expect(await response.text()).toContain('<urlset');
	});
	it('retains a complete catalogue sitemap if optional policy discovery is unavailable', async () => {
		const fetcher = vi.fn().mockImplementation(async (_url, init: RequestInit) => {
			const { query } = JSON.parse(String(init.body));
			if (query.includes('query ShopPolicies')) return new Response('', { status: 503 });
			const key = query.includes('query Catalogue')
				? 'products'
				: query.includes('query Collections')
					? 'collections'
					: 'pages';
			return Response.json({ data: { [key]: emptyPage } });
		});
		const response = await shopSitemapResponse(origin, config, fetcher);
		expect(response.status).toBe(200);
		expect(await response.text()).not.toContain('/policies');
	});
});

describe('robots discovery', () => {
	it('links the canonical sitemap and leaves noindex pages and render assets crawlable', () => {
		const robots = robotsText(origin);
		expect(robots).toContain('User-agent: *\nAllow: /');
		expect(robots).toContain('Sitemap: https://ellie.example/sitemap.xml');
		expect(robots).not.toContain('Disallow:');
		expect(robots).not.toContain('noindex');
	});
});
