import type { Cart, Product, ShopConfig, Variant, ProductImage, Money } from './types';

export async function storefront<T>(
	config: ShopConfig,
	query: string,
	variables: Record<string, unknown> = {},
	fetcher: typeof fetch = fetch
): Promise<T> {
	if (!config.live) throw new Error('The shop is not connected yet.');
	const response = await fetcher(`https://${config.domain}/api/${config.version}/graphql.json`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': config.token
		},
		body: JSON.stringify({ query, variables }),
		signal: AbortSignal.timeout(15000)
	});
	if (!response.ok) throw new Error('The shop could not be reached. Please try again.');
	const result = (await response.json()) as { data?: T; errors?: { message: string }[] };
	if (result.errors?.length || !result.data)
		throw new Error('The shop could not complete this request. Please try again.');
	return result.data;
}
const variantFields = `id title availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } image { url altText }`;
const productFields = `id handle title description productType tags options { name values } images(first: 20) { nodes { url altText } } variants(first: 100) { nodes { ${variantFields} } pageInfo { hasNextPage endCursor } }`;
type Page<T> = { nodes: T[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
type RawProduct = Omit<Product, 'images' | 'variants'> & {
	images: { nodes: ProductImage[] };
	variants: Page<Variant>;
};
export async function getProducts(config: ShopConfig, fetcher: typeof fetch): Promise<Product[]> {
	const products: Product[] = [];
	let cursor: string | null = null;
	do {
		const data: { products: Page<RawProduct> } = await storefront(
			config,
			`query Catalogue($after: String) { products(first: 40, after: $after, sortKey: TITLE) { nodes { ${productFields} } pageInfo { hasNextPage endCursor } } }`,
			{ after: cursor },
			fetcher
		);
		for (const raw of data.products.nodes) {
			const variants = [...raw.variants.nodes];
			let info = raw.variants.pageInfo;
			while (info.hasNextPage) {
				const more: { product: { variants: Page<Variant> } } = await storefront(
					config,
					`query Variants($id: ID!, $after: String) { product(id: $id) { variants(first: 100, after: $after) { nodes { ${variantFields} } pageInfo { hasNextPage endCursor } } } }`,
					{ id: raw.id, after: info.endCursor },
					fetcher
				);
				variants.push(...more.product.variants.nodes);
				info = more.product.variants.pageInfo;
			}
			if (variants.length) products.push({ ...raw, images: raw.images.nodes, variants });
		}
		cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
	} while (cursor);
	return products;
}
const cartFields = `id checkoutUrl discountCodes { code applicable } cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first: 250) { nodes { id quantity merchandise { ... on ProductVariant { ${variantFields} product { title handle featuredImage { url } } } } } }`;
type RawCart = {
	id: string;
	checkoutUrl: string;
	discountCodes: Cart['discountCodes'];
	cost: { subtotalAmount: Money; totalAmount: Money };
	lines: {
		nodes: {
			id: string;
			quantity: number;
			merchandise: Variant & {
				product: { title: string; handle: string; featuredImage: { url: string } | null };
			};
		}[];
	};
};
function normalizeCart(raw: RawCart): Cart {
	return {
		id: raw.id,
		checkoutUrl: raw.checkoutUrl,
		discountCodes: raw.discountCodes,
		subtotal: raw.cost.subtotalAmount,
		total: raw.cost.totalAmount,
		lines: raw.lines.nodes.map((l) => ({
			id: l.id,
			quantity: l.quantity,
			variant: l.merchandise,
			title: l.merchandise.product.title,
			handle: l.merchandise.product.handle,
			image: l.merchandise.image?.url ?? l.merchandise.product.featuredImage?.url ?? ''
		}))
	};
}
export async function readCart(config: ShopConfig, id: string): Promise<Cart | null> {
	const data = await storefront<{ cart: RawCart | null }>(
		config,
		`query Cart($id: ID!) { cart(id: $id) { ${cartFields} } }`,
		{ id }
	);
	return data.cart ? normalizeCart(data.cart) : null;
}
export async function mutateCart(
	config: ShopConfig,
	action: 'create' | 'add' | 'update' | 'remove' | 'discount',
	cartId: string | undefined,
	input: unknown
): Promise<Cart> {
	const mutations = {
		create: [`$input: CartInput!`, `cartCreate(input: $input)`],
		add: [
			`$cartId: ID!, $input: [CartLineInput!]!`,
			`cartLinesAdd(cartId: $cartId, lines: $input)`
		],
		update: [
			`$cartId: ID!, $input: [CartLineUpdateInput!]!`,
			`cartLinesUpdate(cartId: $cartId, lines: $input)`
		],
		remove: [`$cartId: ID!, $input: [ID!]!`, `cartLinesRemove(cartId: $cartId, lineIds: $input)`],
		discount: [
			`$cartId: ID!, $input: [String!]!`,
			`cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $input)`
		]
	};
	const [args, mutation] = mutations[action];
	const result = await storefront<{
		result: { cart: RawCart | null; userErrors: { message: string }[] };
	}>(
		config,
		`mutation ChangeCart(${args}) { result: ${mutation} { cart { ${cartFields} } userErrors { message } } }`,
		{ cartId, input }
	);
	if (result.result.userErrors.length)
		throw new Error(result.result.userErrors.map((e) => e.message).join(' '));
	if (!result.result.cart) throw new Error('Your bag could not be updated. Please try again.');
	return normalizeCart(result.result.cart);
}
