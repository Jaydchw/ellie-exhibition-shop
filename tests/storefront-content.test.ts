import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	getCollection,
	getCollections,
	getMenu,
	getProducts,
	getStoreContent,
	getStorefrontData,
	readCart
} from '../src/lib/commerce/shopify';
import { defaultMenu, defaultStoreContent } from '../src/lib/content/storefront';
import type { ShopConfig } from '../src/lib/commerce/types';

const config: ShopConfig = {
	domain: 'seal-test.myshopify.com',
	token: 'public-test-token',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
const money = { amount: '450.00', currencyCode: 'GBP' };
const variant = {
	id: 'variant-1',
	title: 'Default Title',
	availableForSale: false,
	price: money,
	selectedOptions: [{ name: 'Title', value: 'Default Title' }]
};
const page = <T>(nodes: T[], more = false, cursor: string | null = null) => ({
	nodes,
	pageInfo: { hasNextPage: more, endCursor: cursor }
});
const rawProduct = (id = 'p1') => ({
	id,
	handle: id,
	title: id,
	description: 'An original painting.',
	productType: 'Original',
	tags: ['original'],
	options: [{ name: 'Title', values: ['Default Title'] }],
	images: { nodes: [] },
	variants: page([variant]),
	medium: { value: 'Oil on canvas' },
	dimensions: { value: '60 × 40 cm' },
	year: { value: '2026' },
	framing: null
});
const collection = {
	id: 'c1',
	handle: 'originals',
	title: 'Original paintings',
	description: 'Paintings by Ellie.',
	image: null
};
const reply = (data: unknown) =>
	new Response(JSON.stringify({ data }), { headers: { 'Content-Type': 'application/json' } });
const request = (init: RequestInit) => JSON.parse(String(init.body));
const faq = (id: string, question: string, answer: string) => ({
	id,
	fields: [
		{ key: 'question', value: question },
		{ key: 'answer', value: answer }
	]
});

afterEach(() => vi.unstubAllGlobals());

describe('Shopify collections and artwork', () => {
	it('loads every collection page, including an empty category', async () => {
		const empty = { ...collection, id: 'c2', handle: 'new-work', title: 'New work' };
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(reply({ collections: page([collection], true, 'c1') }))
			.mockResolvedValueOnce(reply({ collections: page([empty]) }));
		expect(await getCollections(config, fetcher)).toEqual([collection, empty]);
		expect(request(fetcher.mock.calls[1][1]).variables.after).toBe('c1');
	});

	it('keeps merchant collection order and paginates products and variants', async () => {
		const first = { ...rawProduct('z-last-alphabetically'), variants: page([variant], true, 'v1') };
		const second = rawProduct('a-first-alphabetically');
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				reply({ collection: { ...collection, products: page([first], true, 'p1') } })
			)
			.mockResolvedValueOnce(
				reply({ product: { variants: page([{ ...variant, id: 'variant-2' }]) } })
			)
			.mockResolvedValueOnce(reply({ collection: { ...collection, products: page([second]) } }));
		const result = await getCollection(config, 'originals', fetcher);
		expect(result?.collection).toEqual(collection);
		expect(result?.products.map((product) => product.id)).toEqual([first.id, second.id]);
		expect(result?.products[0].variants).toHaveLength(2);
		expect(request(fetcher.mock.calls[0][1]).query).toContain('sortKey: COLLECTION_DEFAULT');
		expect(request(fetcher.mock.calls[1][1]).variables.after).toBe('v1');
		expect(request(fetcher.mock.calls[2][1]).variables.after).toBe('p1');
	});

	it('returns null for an unpublished or missing collection', async () => {
		expect(
			await getCollection(config, 'missing', vi.fn().mockResolvedValue(reply({ collection: null })))
		).toBeNull();
	});

	it('preserves sold originals and normalizes optional artwork fields', async () => {
		const fetcher = vi.fn().mockResolvedValue(reply({ products: page([rawProduct()]) }));
		const [product] = await getProducts(config, fetcher);
		expect(product.variants[0].availableForSale).toBe(false);
		expect(product.artwork).toEqual({
			medium: 'Oil on canvas',
			dimensions: '60 × 40 cm',
			year: '2026'
		});
		expect(product).not.toHaveProperty('medium');
	});
});

describe('Shopify menu links', () => {
	it('keeps built-in navigation local when Shopify uses a different primary domain', async () => {
		const items = ['FRONTPAGE', 'CATALOG', 'COLLECTIONS', 'SEARCH'].map((type) => ({
			id: type,
			title: type,
			type,
			url: 'https://primary-store.example/'
		}));
		const links = await getMenu(
			config,
			'main-menu',
			vi.fn().mockResolvedValue(reply({ menu: { items } }))
		);
		expect(links.map((link) => link.url)).toEqual(['/', '/shop', '/shop', '/shop?search=1']);
	});

	it('maps Shopify resources to local routes and keeps tagged collection links', async () => {
		const items = [
			{
				id: 'collection',
				title: 'Small originals',
				url: 'https://custom-shop.example/collections/originals',
				resource: { __typename: 'Collection', handle: 'originals' },
				tags: ['Small work', 'Oil']
			},
			{
				id: 'product',
				title: 'A painting',
				url: null,
				resource: { __typename: 'Product', handle: 'gesture-one' }
			},
			{
				id: 'about',
				title: 'About',
				url: null,
				resource: { __typename: 'Page', handle: 'about' }
			},
			{
				id: 'custom',
				title: 'Exhibitions',
				url: null,
				resource: { __typename: 'Page', handle: 'exhibitions' }
			},
			{ id: 'all', title: 'Shop', url: `https://${config.domain}/collections/all` },
			{ id: 'legacy', title: 'Print', url: `https://${config.domain}/products/print?variant=1` },
			{ id: 'external', title: 'Instagram', url: 'https://www.instagram.com/sealstuff_/' }
		];
		const result = await getMenu(
			config,
			'main-menu',
			vi.fn().mockResolvedValue(reply({ menu: { items } }))
		);
		expect(result.map((item) => item.url)).toEqual([
			'/collections/originals?tag=Small+work&tag=Oil',
			'/shop/gesture-one',
			'/about',
			'/pages/exhibitions',
			'/shop',
			'/shop/print?variant=1',
			'https://www.instagram.com/sealstuff_/'
		]);
	});

	it('rejects unsafe URLs and retains a maximum of three menu levels', async () => {
		const item = (id: string, url: string, items: unknown[] = []) => ({
			id,
			title: id,
			url,
			items
		});
		const items = [
			item('script', 'javascript:alert(1)'),
			item('protocol-relative', '//evil.example/path'),
			item('insecure', 'http://example.com'),
			item('credentials', 'https://user:password@example.com'),
			item('backslash', '/\\evil.example'),
			item('parent', '/shop', [
				item('child', '/collections/prints', [item('third', '/about', [item('fourth', '/help')])])
			])
		];
		const result = await getMenu(
			config,
			'main-menu',
			vi.fn().mockResolvedValue(reply({ menu: { items } }))
		);
		expect(result.map((link) => link.id)).toEqual(['parent']);
		expect(result[0].items[0].items[0]).toMatchObject({ id: 'third', items: [] });
	});

	it('uses defaults for a missing menu but respects an intentionally empty menu', async () => {
		expect(
			await getMenu(config, 'footer', vi.fn().mockResolvedValue(reply({ menu: null })))
		).toEqual(defaultMenu('footer'));
		expect(
			await getMenu(config, 'footer', vi.fn().mockResolvedValue(reply({ menu: { items: [] } })))
		).toEqual([]);
	});

	it('shows supported policies locally while keeping accounts and unsupported policies on Shopify', async () => {
		const paths = [
			'/policies/privacy-policy',
			'/policies/legal-notice',
			'/account',
			'/collections',
			'/murals',
			'/search?q=oil'
		];
		const items = paths.map((path) => ({
			id: path,
			title: path,
			url: `https://${config.domain}${path}`
		}));
		const result = await getMenu(
			config,
			'footer',
			vi.fn().mockResolvedValue(reply({ menu: { items } }))
		);
		expect(result.map((item) => item.url)).toEqual([
			'/policies/privacy-policy',
			`https://${config.domain}/policies/legal-notice`,
			`https://${config.domain}/account`,
			'/shop',
			'/murals',
			'/shop?q=oil&search=1'
		]);
	});
	it('maps Shopify policy resources locally even when the hosted store has a different primary domain', async () => {
		const items = [
			{
				id: 'privacy',
				title: 'Privacy',
				url: 'https://primary-shop.example/policies/privacy-policy',
				resource: { __typename: 'ShopPolicy', handle: 'privacy-policy' }
			}
		];
		const result = await getMenu(
			config,
			'footer',
			vi.fn().mockResolvedValue(reply({ menu: { items } }))
		);
		expect(result[0].url).toBe('/policies/privacy-policy');
	});
});

describe('merchant editorial content', () => {
	it('loads plain text, images and ordered FAQs while keeping defaults for omitted fields', async () => {
		const image = { url: 'https://cdn.shopify.com/ellie.jpg', altText: 'In the studio' };
		const fields = [
			{ key: 'home_title', value: 'Ellie in colour' },
			{ key: 'shop_text', value: '' },
			{ key: 'about_text', value: 'First paragraph.\n\nSecond paragraph.' },
			{ key: 'home_image', value: 'gid://shopify/MediaImage/1', reference: { image } }
		];
		const fetcher = vi.fn().mockResolvedValue(
			reply({
				metaobject: {
					fields,
					faqs: {
						references: page([
							faq('q2', 'Delivery?', 'Delivery depends on the piece.\nContact Ellie for help.'),
							faq('q1', 'Framing?', 'See each listing.'),
							faq('draft', '', 'Incomplete entry.')
						])
					}
				}
			})
		);
		const content = await getStoreContent(config, fetcher);
		expect(content).toMatchObject({
			homeTitle: 'Ellie in colour',
			homeImage: image,
			shopText: '',
			aboutText: 'First paragraph.\n\nSecond paragraph.',
			shopTitle: defaultStoreContent().shopTitle
		});
		expect(content.faqs.map((entry) => entry.id)).toEqual(['q2', 'q1']);
		expect(content.faqs[0].body).toContain('\n');
	});

	it('continues a FAQ reference list past its first page', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				reply({
					metaobject: {
						fields: [],
						faqs: { references: page([faq('q1', 'One?', 'One.')], true, 'q1') }
					}
				})
			)
			.mockResolvedValueOnce(
				reply({
					metaobject: { fields: [], faqs: { references: page([faq('q2', 'Two?', 'Two.')]) } }
				})
			);
		expect((await getStoreContent(config, fetcher)).faqs.map((entry) => entry.id)).toEqual([
			'q1',
			'q2'
		]);
		expect(request(fetcher.mock.calls[1][1]).variables.after).toBe('q1');
	});

	it('keeps an explicitly empty FAQ list and falls back when no entry is published', async () => {
		expect(
			(
				await getStoreContent(
					config,
					vi
						.fn()
						.mockResolvedValue(
							reply({ metaobject: { fields: [], faqs: { references: page([]) } } })
						)
				)
			).faqs
		).toEqual([]);
		expect(
			await getStoreContent(config, vi.fn().mockResolvedValue(reply({ metaobject: null })))
		).toEqual(defaultStoreContent());
	});
});

describe('independent storefront permissions', () => {
	it('keeps products available when menus and metaobjects lack permission', async () => {
		const fetcher = vi.fn().mockImplementation(async (_url, init: RequestInit) => {
			const { query } = request(init);
			if (query.includes('query Catalogue')) return reply({ products: page([rawProduct()]) });
			if (query.includes('query Collections')) return reply({ collections: page([collection]) });
			return new Response(JSON.stringify({ errors: [{ message: 'Access denied' }] }));
		});
		const data = await getStorefrontData(config, fetcher);
		expect(data.catalogError).toBe(false);
		expect(data.contentError).toBe(true);
		expect(data.products).toHaveLength(1);
		expect(data.collections).toEqual([collection]);
		expect(data.content).toEqual(defaultStoreContent());
		expect(data.menus.header).toEqual(defaultMenu('main-menu'));
	});

	it('loads artist-page content without requesting products or collections', async () => {
		const fetcher = vi.fn().mockImplementation(async (_url, init: RequestInit) => {
			const { query } = request(init);
			if (query.includes('query Navigation')) return reply({ menu: { items: [] } });
			if (query.includes('query StoreContent')) return reply({ metaobject: null });
			throw new Error('An artist page requested the catalogue.');
		});
		const data = await getStorefrontData(config, fetcher, false);
		expect(fetcher).toHaveBeenCalledTimes(3);
		expect(data).toMatchObject({
			products: [],
			collections: [],
			catalogError: false,
			contentError: false
		});
	});

	it('makes no Shopify calls without live configuration', async () => {
		const fetcher = vi.fn();
		const data = await getStorefrontData({ ...config, live: false }, fetcher, false);
		expect(fetcher).not.toHaveBeenCalled();
		expect(data.products).toEqual([]);
		expect(data.content).toEqual(defaultStoreContent());
	});

	it('keeps original classification on restored cart lines', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				reply({
					cart: {
						id: 'cart1',
						checkoutUrl: 'https://seal-test.myshopify.com/checkouts/one',
						discountCodes: [],
						cost: { subtotalAmount: money, totalAmount: money },
						lines: {
							nodes: [
								{
									id: 'line1',
									quantity: 1,
									merchandise: {
										...variant,
										product: {
											title: 'Gesture',
											handle: 'gesture',
											productType: 'Original',
											tags: ['original'],
											featuredImage: null
										}
									}
								}
							]
						}
					}
				})
			)
		);
		expect((await readCart(config, 'cart1'))?.lines[0]).toMatchObject({
			productType: 'Original',
			tags: ['original']
		});
	});
});
