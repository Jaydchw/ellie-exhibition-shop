import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProducts, mutateCart, readCart, storefront } from '../src/lib/commerce/shopify';
import type { ShopConfig } from '../src/lib/commerce/types';
const config: ShopConfig = {
	domain: 'seal-test.myshopify.com',
	token: 'public-test-token',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
const price = { amount: '149.00', currencyCode: 'GBP' };
const variant = {
	id: 'gid://shopify/ProductVariant/1',
	title: 'A3 / Natural frame',
	availableForSale: true,
	price,
	compareAtPrice: { amount: '179.00', currencyCode: 'GBP' },
	selectedOptions: [
		{ name: 'Size', value: 'A3' },
		{ name: 'Finish', value: 'Natural frame' }
	]
};
const rawCart = {
	id: 'cart?id=secret',
	checkoutUrl: 'https://seal-test.myshopify.com/checkouts/123',
	discountCodes: [],
	cost: { subtotalAmount: price, totalAmount: price },
	lines: {
		nodes: [
			{
				id: 'line-1',
				quantity: 1,
				merchandise: {
					...variant,
					product: {
						title: 'Cosmic Shard',
						handle: 'cosmic-shard',
						featuredImage: { url: 'https://cdn.shopify.com/art.jpg' }
					}
				}
			}
		]
	}
};
const reply = (data: unknown) =>
	new Response(JSON.stringify({ data }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
afterEach(() => vi.unstubAllGlobals());
describe('Storefront boundary', () => {
	it('keeps browser cart reads on the same origin so Shopify consent accompanies checkout', async () => {
		const fetcher = vi.fn().mockResolvedValue(reply({ cart: rawCart }));
		vi.stubGlobal('window', { Shopify: { routes: { apiProxyPrefix: '/__shopify' } } });
		vi.stubGlobal('document', {});
		vi.stubGlobal('fetch', fetcher);
		await readCart(config, rawCart.id);
		expect(fetcher.mock.calls[0][0]).toBe('/__shopify/api/2026-07/graphql.json');
		expect(fetcher.mock.calls[0][1].credentials).toBe('same-origin');
	});
	it('sends the public token to the configured version and preserves decimal money', async () => {
		const fetcher = vi.fn().mockResolvedValue(reply({ cart: rawCart }));
		vi.stubGlobal('fetch', fetcher);
		const cart = await readCart(config, rawCart.id);
		expect(cart?.lines[0].variant.price.amount).toBe('149.00');
		expect(cart?.lines[0].variant.compareAtPrice?.amount).toBe('179.00');
		expect(JSON.parse(fetcher.mock.calls[0][1].body).query).toContain('compareAtPrice');
		expect(cart?.lines[0].image).toBe('https://cdn.shopify.com/art.jpg');
		expect(fetcher.mock.calls[0][0]).toBe(
			'https://seal-test.myshopify.com/api/2026-07/graphql.json'
		);
		expect(fetcher.mock.calls[0][1].headers['X-Shopify-Storefront-Access-Token']).toBe(
			'public-test-token'
		);
		expect(JSON.parse(fetcher.mock.calls[0][1].body).variables.id).toBe(rawCart.id);
	});
	it('treats an expired cart as empty', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ cart: null })));
		expect(await readCart(config, 'expired')).toBeNull();
	});
	it.each([
		['HTTP', new Response('', { status: 503 })],
		['GraphQL', new Response(JSON.stringify({ errors: [{ message: 'internal detail' }] }))]
	])('fails closed on %s failure', async (_, response) => {
		await expect(storefront(config, '{}', {}, vi.fn().mockResolvedValue(response))).rejects.toThrow(
			/shop/i
		);
	});
	it('never calls Shopify in preview mode', async () => {
		const fetcher = vi.fn();
		await expect(storefront({ ...config, live: false }, '{}', {}, fetcher)).rejects.toThrow(
			'not connected'
		);
		expect(fetcher).not.toHaveBeenCalled();
	});
	it('surfaces inventory errors and does not return a successful cart', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValue(
					reply({ result: { cart: rawCart, userErrors: [{ message: 'This print is sold out.' }] } })
				)
		);
		await expect(
			mutateCart(config, 'add', rawCart.id, [{ merchandiseId: variant.id, quantity: 2 }])
		).rejects.toThrow('sold out');
	});
	it('uses partial cart data after an optional inventory permission error without replaying a mutation', async () => {
		const restricted = { ...config };
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						data: { result: { cart: rawCart, userErrors: [] } },
						errors: [
							{
								message: 'Access denied for quantityAvailable field.',
								path: ['result', 'cart', 'lines', 'nodes', 0, 'merchandise', 'quantityAvailable'],
								extensions: { code: 'ACCESS_DENIED' }
							}
						]
					})
				)
			)
			.mockResolvedValueOnce(reply({ cart: rawCart }));
		vi.stubGlobal('fetch', fetcher);
		const cart = await mutateCart(restricted, 'add', rawCart.id, [
			{ merchandiseId: variant.id, quantity: 1 }
		]);
		expect(cart.lines[0].quantity).toBe(1);
		expect(fetcher).toHaveBeenCalledTimes(1);
		await readCart(restricted, cart.id);
		expect(JSON.parse(fetcher.mock.calls[0][1].body).query).toContain('quantityAvailable');
		expect(JSON.parse(fetcher.mock.calls[1][1].body).query).not.toContain('quantityAvailable');
	});
	it('retries an inventory-restricted read once without the optional field when no usable data is returned', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						errors: [
							{
								message: 'Access denied for quantityAvailable field.',
								extensions: { code: 'ACCESS_DENIED' }
							}
						]
					})
				)
			)
			.mockResolvedValueOnce(reply({ cart: rawCart }));
		vi.stubGlobal('fetch', fetcher);
		expect(await readCart({ ...config }, rawCart.id)).not.toBeNull();
		expect(fetcher).toHaveBeenCalledTimes(2);
		expect(JSON.parse(fetcher.mock.calls[1][1].body).query).not.toContain('quantityAvailable');
	});
	it('never replays a cart mutation when an inventory error has no usable result', async () => {
		const fetcher = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					errors: [
						{
							message: 'Access denied for quantityAvailable field.',
							extensions: { code: 'ACCESS_DENIED' }
						}
					]
				})
			)
		);
		vi.stubGlobal('fetch', fetcher);
		await expect(
			mutateCart({ ...config }, 'add', rawCart.id, [{ merchandiseId: variant.id, quantity: 1 }])
		).rejects.toThrow('shop');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
	it('does not suppress other GraphQL errors alongside an inventory permission error', async () => {
		const fetcher = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					data: { cart: rawCart },
					errors: [
						{
							message: 'Access denied for quantityAvailable field.',
							extensions: { code: 'ACCESS_DENIED' }
						},
						{ message: 'Cart unavailable' }
					]
				})
			)
		);
		vi.stubGlobal('fetch', fetcher);
		await expect(readCart({ ...config }, rawCart.id)).rejects.toThrow('shop');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
	it.each(['create', 'add', 'update', 'remove', 'discount'] as const)(
		'uses the %s cart mutation and returns Shopify totals',
		async (action) => {
			const fetcher = vi
				.fn()
				.mockResolvedValue(reply({ result: { cart: rawCart, userErrors: [] } }));
			vi.stubGlobal('fetch', fetcher);
			const input =
				action === 'create'
					? { lines: [{ merchandiseId: variant.id, quantity: 1 }] }
					: action === 'remove'
						? ['line-1']
						: action === 'discount'
							? ['WELCOME']
							: [{ id: 'line-1', quantity: 2 }];
			const cart = await mutateCart(config, action, rawCart.id, input);
			expect(cart.total).toEqual(price);
			expect(JSON.parse(fetcher.mock.calls[0][1].body).variables.input).toEqual(input);
		}
	);
	it('paginates both products and variants without silently losing options', async () => {
		const rawProduct = {
			id: 'p1',
			handle: 'cosmic-shard',
			title: 'Cosmic Shard',
			description: 'A study',
			productType: 'Print',
			tags: [],
			options: [{ name: 'Size', values: ['A3', 'A2'] }],
			images: { nodes: [] },
			variants: { nodes: [variant], pageInfo: { hasNextPage: true, endCursor: 'v1' } }
		};
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				reply({
					products: { nodes: [rawProduct], pageInfo: { hasNextPage: true, endCursor: 'p1' } }
				})
			)
			.mockResolvedValueOnce(
				reply({
					product: {
						variants: {
							nodes: [{ ...variant, id: 'v2' }],
							pageInfo: { hasNextPage: false, endCursor: 'v2' }
						}
					}
				})
			)
			.mockResolvedValueOnce(
				reply({
					products: {
						nodes: [
							{
								...rawProduct,
								id: 'p2',
								handle: 'another',
								variants: { nodes: [variant], pageInfo: { hasNextPage: false, endCursor: null } }
							}
						],
						pageInfo: { hasNextPage: false, endCursor: 'p2' }
					}
				})
			);
		const products = await getProducts(config, fetcher);
		expect(products).toHaveLength(2);
		expect(products[0].variants).toHaveLength(2);
		expect(JSON.parse(fetcher.mock.calls[1][1].body).variables.after).toBe('v1');
		expect(JSON.parse(fetcher.mock.calls[2][1].body).variables.after).toBe('p1');
	});
	it('loads merchant care instructions and inventory constraints with the product', async () => {
		const fetcher = vi.fn().mockResolvedValue(
			reply({
				products: {
					nodes: [
						{
							id: 'original-1',
							handle: 'original-1',
							title: 'Study',
							description: '',
							productType: 'Original',
							tags: [],
							options: [],
							images: { nodes: [] },
							careInstructions: { value: 'Clean the varnished surface with a soft dry cloth.' },
							variants: {
								nodes: [
									{
										...variant,
										quantityAvailable: 1,
										currentlyNotInStock: false,
										quantityRule: { minimum: 1, maximum: null, increment: 1 }
									}
								],
								pageInfo: { hasNextPage: false, endCursor: null }
							}
						}
					],
					pageInfo: { hasNextPage: false, endCursor: null }
				}
			})
		);
		const [product] = await getProducts({ ...config }, fetcher);
		expect(product.careInstructions).toBe('Clean the varnished surface with a soft dry cloth.');
		expect(product.variants[0].quantityAvailable).toBe(1);
		expect(product.variants[0].quantityRule?.increment).toBe(1);
		const query = JSON.parse(fetcher.mock.calls[0][1].body).query;
		expect(query).toContain('metafield(namespace: "artwork", key: "care_instructions")');
		expect(query).toContain('quantityAvailable');
	});
});
