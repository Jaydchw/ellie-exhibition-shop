import { describe, expect, it, vi } from 'vitest';
import {
	absoluteImageUrl,
	canonicalUrl,
	collectionStructuredData,
	hasSearchFacets,
	productStructuredData,
	safeJsonLd,
	searchDescription
} from '../src/lib/seo';
import { getCollections, getPages, getProducts } from '../src/lib/commerce/shopify';
import type { Product, ShopConfig } from '../src/lib/commerce/types';

const siteUrl = 'https://ellie.example';
const product: Product = {
	id: 'gid://shopify/Product/1',
	handle: 'movement',
	title: 'Movement',
	description: 'An original painting.',
	productType: 'Original',
	tags: [],
	images: [{ url: 'https://cdn.shopify.com/painting.jpg', altText: 'Movement painting' }],
	options: [],
	variants: [
		{
			id: 'gid://shopify/ProductVariant/1',
			title: 'Default Title',
			sku: 'ORIGINAL-1',
			availableForSale: false,
			price: { amount: '240.00', currencyCode: 'GBP' },
			selectedOptions: []
		}
	]
};
const config: ShopConfig = {
	domain: 'seal-test.myshopify.com',
	token: 'public-test',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
const page = <T>(nodes: T[], more = false, cursor: string | null = null) => ({
	nodes,
	pageInfo: { hasNextPage: more, endCursor: cursor }
});
const reply = (data: unknown) => new Response(JSON.stringify({ data }));

describe('canonical metadata', () => {
	it('uses one clean product URL for variants, filters, tracking and fragments', () => {
		expect(canonicalUrl(siteUrl, '/shop/movement/?variant=123&utm_source=email#image')).toBe(
			siteUrl + '/shop/movement'
		);
		expect(canonicalUrl(siteUrl + '/', '/')).toBe(siteUrl + '/');
	});
	it('preserves a configured application base without repeating it', () => {
		expect(canonicalUrl(siteUrl + '/studio/', '/shop')).toBe(siteUrl + '/studio/shop');
		expect(canonicalUrl(siteUrl + '/studio/', '/studio/shop/')).toBe(siteUrl + '/studio/shop');
	});
	it('excludes search and faceted URLs without excluding variant or campaign URLs', () => {
		for (const parameter of [
			'q=flowers',
			'search=1',
			'category=prints',
			'finish=Poster',
			'tag=Oil',
			'sort=low',
			'available=1'
		]) {
			expect(hasSearchFacets(new URL(siteUrl + '/shop?' + parameter))).toBe(true);
		}
		expect(
			hasSearchFacets(new URL(siteUrl + '/shop/movement?variant=1&utm_source=instagram'))
		).toBe(false);
	});
	it('creates absolute image URLs and rejects executable image schemes', () => {
		expect(absoluteImageUrl(siteUrl, '/_app/portrait.png')).toBe(siteUrl + '/_app/portrait.png');
		expect(absoluteImageUrl(siteUrl, 'javascript:alert(1)')).toBeNull();
	});
	it('escapes closing scripts in structured data while preserving the JSON value', () => {
		const value = { name: '</script><script>alert(1)</script>' };
		const json = safeJsonLd(value);
		expect(json).not.toContain('<');
		expect(JSON.parse(json)).toEqual(value);
	});
	it('normalizes merchant descriptions into concise snippets', () => {
		expect(searchDescription('  Oil\n on paper.  ')).toBe('Oil on paper.');
		expect(searchDescription('art '.repeat(100)).length).toBeLessThanOrEqual(160);
	});
});

describe('truthful product structured data', () => {
	it('keeps a sold original as an out-of-stock offer with its real SKU and price', () => {
		expect(productStructuredData(siteUrl, product)).toMatchObject({
			'@type': 'Product',
			sku: 'ORIGINAL-1',
			url: siteUrl + '/shop/movement',
			offers: {
				'@type': 'Offer',
				price: '240.00',
				priceCurrency: 'GBP',
				availability: 'https://schema.org/OutOfStock'
			}
		});
	});
	it('describes each print variant with its own selectable URL and actual availability', () => {
		const print = {
			...product,
			productType: 'Art print',
			options: [{ name: 'Size', values: ['A4', 'A3'] }],
			variants: [
				{
					...product.variants[0],
					title: 'A4',
					sku: 'PRINT-A4',
					availableForSale: true,
					price: { amount: '49.00', currencyCode: 'GBP' },
					selectedOptions: [{ name: 'Size', value: 'A4' }]
				},
				{
					...product.variants[0],
					id: 'gid://shopify/ProductVariant/2',
					title: 'A3',
					sku: 'PRINT-A3',
					price: { amount: '75.00', currencyCode: 'GBP' },
					selectedOptions: [{ name: 'Size', value: 'A3' }]
				}
			]
		};
		const schema = JSON.parse(JSON.stringify(productStructuredData(siteUrl, print)));
		expect(schema['@type']).toBe('ProductGroup');
		expect(schema.variesBy).toEqual(['https://schema.org/size']);
		expect(schema.hasVariant).toHaveLength(2);
		expect(schema.hasVariant[0]).toMatchObject({
			sku: 'PRINT-A4',
			size: 'A4',
			offers: { price: '49.00', availability: 'https://schema.org/InStock' }
		});
		expect(new URL(schema.hasVariant[1].offers.url).searchParams.get('variant')).toBe(
			'gid://shopify/ProductVariant/2'
		);
		expect(schema.hasVariant[1].offers.availability).toBe('https://schema.org/OutOfStock');
		expect(JSON.stringify(schema)).not.toContain('AggregateOffer');
		expect(schema).not.toHaveProperty('aggregateRating');
	});
	it('describes collections as ordered lists, without claiming product rich results for category pages', () => {
		const schema = collectionStructuredData(siteUrl, 'Shop', [product], null);
		expect(schema['@type']).toBe('CollectionPage');
		expect(schema.mainEntity.itemListElement[0]).toEqual({
			'@type': 'ListItem',
			position: 1,
			name: 'Movement',
			url: siteUrl + '/shop/movement'
		});
	});
});

describe('Shopify search data', () => {
	it('retains merchant product SEO and actual modification dates', async () => {
		const raw = {
			...product,
			seo: { title: 'Buy Movement by Ellie', description: 'Original oil painting.' },
			updatedAt: '2026-10-20T10:00:00Z',
			images: { nodes: product.images },
			variants: page(product.variants)
		};
		const fetcher = vi.fn().mockResolvedValue(reply({ products: page([raw]) }));
		expect((await getProducts(config, fetcher))[0]).toMatchObject({
			seo: raw.seo,
			updatedAt: raw.updatedAt
		});
	});
	it('detects empty collections without fetching their whole catalogue', async () => {
		const base = {
			id: 'c1',
			handle: 'empty',
			title: 'Empty',
			description: '',
			image: null,
			updatedAt: '2026-10-20T10:00:00Z'
		};
		const fetcher = vi
			.fn()
			.mockResolvedValue(reply({ collections: page([{ ...base, products: { nodes: [] } }]) }));
		expect((await getCollections(config, fetcher))[0]).toMatchObject({
			hasProducts: false,
			updatedAt: base.updatedAt
		});
	});
	it('enumerates all merchant pages for sitemap discovery', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				reply({ pages: page([{ handle: 'studio', title: 'Studio' }], true, 'p1') })
			)
			.mockResolvedValueOnce(
				reply({ pages: page([{ handle: 'exhibitions', title: 'Exhibitions' }]) })
			);
		expect((await getPages(config, fetcher)).map((item) => item.handle)).toEqual([
			'studio',
			'exhibitions'
		]);
		expect(JSON.parse(fetcher.mock.calls[1][1].body).variables.after).toBe('p1');
	});
});
