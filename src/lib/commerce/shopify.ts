import type {
	Cart,
	Collection,
	MenuLink,
	MerchantPageSummary,
	Product,
	ShopConfig,
	StoreContent,
	Variant,
	ProductImage,
	Money
} from './types';
import { defaultMenu, defaultStoreContent } from '../content/storefront';

const inventoryUnavailable = new WeakSet<ShopConfig>();

export async function storefront<T>(
	config: ShopConfig,
	query: string,
	variables: Record<string, unknown> = {},
	fetcher: typeof fetch = fetch
): Promise<T> {
	if (!config.live) throw new Error('The shop is not connected yet.');
	if (inventoryUnavailable.has(config)) query = query.replace(/\bquantityAvailable\b/g, '');
	const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
	const routes = inBrowser
		? (window as Window & { Shopify?: { routes?: { apiProxyPrefix?: string } } }).Shopify?.routes
		: undefined;
	const prefix = routes?.apiProxyPrefix ?? '/__shopify';
	const proxyPrefix = /^\/(?!\/)[a-z0-9_/-]+$/i.test(prefix) ? prefix : '/__shopify';
	const endpoint = inBrowser
		? `${proxyPrefix}/api/${config.version}/graphql.json`
		: `https://${config.domain}/api/${config.version}/graphql.json`;
	// Browser carts share Shopify's HTTP-only consent session through this app.
	// Catalogue requests on the server remain independent of visitor cookies.
	const response = await fetcher(endpoint, {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': config.token
		},
		body: JSON.stringify({ query, variables }),
		signal: AbortSignal.timeout(15000)
	});
	if (!response.ok) throw new Error('The shop could not be reached. Please try again.');
	const result = (await response.json()) as {
		data?: T;
		errors?: { message: string; path?: (string | number)[]; extensions?: { code?: string } }[];
	};
	// Inventory access is a separate Storefront scope. Partial field errors leave
	// usable product/cart data; never replay a mutation which may already have run.
	if (
		query.includes('quantityAvailable') &&
		result.errors?.length &&
		result.errors.every(
			(error) =>
				(error.path?.includes('quantityAvailable') || /quantityAvailable/.test(error.message)) &&
				(error.extensions?.code === 'ACCESS_DENIED' ||
					/access|scope|permission/i.test(error.message))
		)
	) {
		inventoryUnavailable.add(config);
		if (result.data) return result.data;
		if (!/^\s*mutation\b/.test(query)) return storefront<T>(config, query, variables, fetcher);
	}
	if (result.errors?.length || !result.data)
		throw new Error('The shop could not complete this request. Please try again.');
	return result.data;
}
const variantFields = `id sku title availableForSale quantityAvailable currentlyNotInStock quantityRule { minimum maximum increment } price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } image { url altText }`;
const productFields = `id handle title description seo { title description } updatedAt productType tags options { name values } images(first: 20) { nodes { url altText } } variants(first: 100) { nodes { ${variantFields} } pageInfo { hasNextPage endCursor } } medium: metafield(namespace: "artwork", key: "medium") { value } dimensions: metafield(namespace: "artwork", key: "dimensions") { value } year: metafield(namespace: "artwork", key: "year") { value } framing: metafield(namespace: "artwork", key: "framing") { value } careInstructions: metafield(namespace: "artwork", key: "care_instructions") { value }`;
type Page<T> = { nodes: T[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
type RawProduct = Omit<Product, 'images' | 'variants' | 'careInstructions'> & {
	images: { nodes: ProductImage[] };
	variants: Page<Variant>;
	medium?: { value: string } | null;
	dimensions?: { value: string } | null;
	year?: { value: string } | null;
	framing?: { value: string } | null;
	careInstructions?: { value: string } | null;
};
function nextCursor<T>(page: Page<T>): string | null {
	if (!page.pageInfo.hasNextPage) return null;
	if (!page.pageInfo.endCursor) throw new Error('The shop returned an incomplete page.');
	return page.pageInfo.endCursor;
}
async function normalizeProduct(
	raw: RawProduct,
	config: ShopConfig,
	fetcher: typeof fetch
): Promise<Product> {
	const {
		images,
		variants: firstVariants,
		medium,
		dimensions,
		year,
		framing,
		careInstructions,
		...product
	} = raw;
	const variants = [...firstVariants.nodes];
	let cursor = nextCursor(firstVariants);
	while (cursor) {
		const more: { product: { variants: Page<Variant> } | null } = await storefront(
			config,
			`query Variants($id: ID!, $after: String) { product(id: $id) { variants(first: 100, after: $after) { nodes { ${variantFields} } pageInfo { hasNextPage endCursor } } } }`,
			{ id: raw.id, after: cursor },
			fetcher
		);
		if (!more.product) throw new Error('This product is no longer available.');
		variants.push(...more.product.variants.nodes);
		const after = nextCursor(more.product.variants);
		if (after === cursor) throw new Error('The shop returned a repeated page.');
		cursor = after;
	}
	const artwork = Object.fromEntries(
		Object.entries({ medium, dimensions, year, framing })
			.filter(([, field]) => !!field?.value?.trim())
			.map(([key, field]) => [key, field!.value])
	);
	return {
		...product,
		images: images.nodes,
		variants,
		...(careInstructions?.value?.trim() ? { careInstructions: careInstructions.value } : {}),
		...(Object.keys(artwork).length ? { artwork } : {})
	};
}
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
			const product = await normalizeProduct(raw, config, fetcher);
			if (product.variants.length) products.push(product);
		}
		const after = nextCursor(data.products);
		if (after && after === cursor) throw new Error('The shop returned a repeated page.');
		cursor = after;
	} while (cursor);
	return products;
}
const collectionFields =
	'id handle title description seo { title description } updatedAt image { url altText }';
export async function getCollections(
	config: ShopConfig,
	fetcher: typeof fetch
): Promise<Collection[]> {
	const collections: Collection[] = [];
	let cursor: string | null = null;
	do {
		const data: { collections: Page<Collection & { products?: { nodes: { id: string }[] } }> } =
			await storefront(
				config,
				`query Collections($after: String) { collections(first: 100, after: $after, sortKey: TITLE) { nodes { ${collectionFields} products(first: 1) { nodes { id } } } pageInfo { hasNextPage endCursor } } }`,
				{ after: cursor },
				fetcher
			);
		collections.push(
			...data.collections.nodes.map(({ products, ...collection }) => ({
				...collection,
				...(products ? { hasProducts: products.nodes.length > 0 } : {})
			}))
		);
		const after = nextCursor(data.collections);
		if (after && after === cursor) throw new Error('The shop returned a repeated page.');
		cursor = after;
	} while (cursor);
	return collections;
}
export async function getCollection(
	config: ShopConfig,
	handle: string,
	fetcher: typeof fetch
): Promise<{ collection: Collection; products: Product[] } | null> {
	let collection: Collection | undefined;
	const products: Product[] = [];
	let cursor: string | null = null;
	do {
		const data: { collection: (Collection & { products: Page<RawProduct> }) | null } =
			await storefront(
				config,
				`query Collection($handle: String!, $after: String) { collection(handle: $handle) { ${collectionFields} products(first: 40, after: $after, sortKey: COLLECTION_DEFAULT) { nodes { ${productFields} } pageInfo { hasNextPage endCursor } } } }`,
				{ handle, after: cursor },
				fetcher
			);
		if (!data.collection) return null;
		const { products: page, ...details } = data.collection;
		collection = details;
		for (const raw of page.nodes) {
			const product = await normalizeProduct(raw, config, fetcher);
			if (product.variants.length) products.push(product);
		}
		const after = nextCursor(page);
		if (after && after === cursor) throw new Error('The shop returned a repeated page.');
		cursor = after;
	} while (cursor);
	return { collection: collection!, products };
}

export async function getPages(
	config: ShopConfig,
	fetcher: typeof fetch
): Promise<MerchantPageSummary[]> {
	const pages: MerchantPageSummary[] = [];
	let cursor: string | null = null;
	do {
		const data: { pages: Page<MerchantPageSummary> } = await storefront(
			config,
			`query WebsitePages($after: String) { pages(first: 100, after: $after) { nodes { handle title updatedAt seo { title description } } pageInfo { hasNextPage endCursor } } }`,
			{ after: cursor },
			fetcher
		);
		pages.push(...data.pages.nodes);
		const after = nextCursor(data.pages);
		if (after && after === cursor) throw new Error('The shop returned a repeated page.');
		cursor = after;
	} while (cursor);
	return pages;
}

type RawMenuItem = {
	id: string;
	title: string;
	url: string | null;
	type?: string;
	tags?: string[];
	resource?: { __typename: string; handle?: string } | null;
	items?: RawMenuItem[];
};
const menuItemFields = `id title url type tags resource { __typename ... on Collection { handle } ... on Product { handle } ... on Page { handle } ... on ShopPolicy { handle } }`;
function pagePath(handle: string) {
	return handle === 'about' || handle === 'help' || handle === 'murals' || handle === 'contact'
		? `/${handle}`
		: `/pages/${encodeURIComponent(handle)}`;
}
function menuUrl(item: RawMenuItem, domain: string): string | null {
	if (item.type === 'FRONTPAGE') return '/';
	if (item.type === 'CATALOG' || item.type === 'COLLECTIONS') return '/shop';
	if (item.type === 'SEARCH') return '/shop?search=1';
	const resource = item.resource;
	if (resource?.handle) {
		if (resource.__typename === 'Collection') {
			const path =
				resource.handle === 'all' ? '/shop' : `/collections/${encodeURIComponent(resource.handle)}`;
			const filters = new URLSearchParams();
			for (const tag of item.tags ?? []) filters.append('tag', tag);
			return path + (filters.size ? `?${filters}` : '');
		}
		if (resource.__typename === 'Product') return `/shop/${encodeURIComponent(resource.handle)}`;
		if (resource.__typename === 'Page') return pagePath(resource.handle);
		if (
			resource.__typename === 'ShopPolicy' &&
			/^(?:privacy-policy|refund-policy|shipping-policy|terms-of-service)$/.test(resource.handle)
		)
			return `/policies/${resource.handle}`;
	}
	const value = item.url?.trim();
	if (
		!value ||
		value.startsWith('//') ||
		Array.from(value).some(
			(character) =>
				character === '\\' || character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127
		)
	)
		return null;
	const internal = value.startsWith('/') && !value.startsWith('//');
	let parsed: URL;
	try {
		parsed = new URL(value, `https://${domain}`);
	} catch {
		return null;
	}
	if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
	if (!internal && parsed.host !== domain) return parsed.href;
	let path = parsed.pathname;
	const product = path.match(/^\/products\/([^/]+)\/?$/);
	const page = path.match(/^\/pages\/([^/]+)\/?$/);
	if (product) path = `/shop/${product[1]}`;
	else if (page) {
		try {
			path = pagePath(decodeURIComponent(page[1]));
		} catch {
			return null;
		}
	} else if (/^\/collections(?:\/all)?\/?$/.test(path)) path = '/shop';
	else if (/^\/search\/?$/.test(path)) {
		path = '/shop';
		parsed.searchParams.set('search', '1');
	}
	const localPath =
		path === '/' ||
		['/shop', '/about', '/help', '/murals', '/saved', '/policies'].includes(
			path.replace(/\/$/, '')
		) ||
		/^\/(?:shop|collections|pages)\//.test(path) ||
		/^\/policies\/(?:privacy-policy|refund-policy|shipping-policy|terms-of-service)\/?$/.test(path);
	// Account, unsupported policies, blog and checkout pages remain on Shopify. Only
	// known storefront routes should turn a hosted Shopify URL into a local URL.
	if (!internal && !localPath) return parsed.href;
	return path + parsed.search + parsed.hash;
}
function normalizeMenu(items: RawMenuItem[], domain: string, depth = 1): MenuLink[] {
	return items.flatMap((item) => {
		const url = menuUrl(item, domain);
		if (!url) return [];
		return [
			{
				id: item.id,
				title: item.title,
				url,
				items: depth < 3 ? normalizeMenu(item.items ?? [], domain, depth + 1) : []
			}
		];
	});
}
export async function getMenu(
	config: ShopConfig,
	handle: string,
	fetcher: typeof fetch
): Promise<MenuLink[]> {
	const data = await storefront<{ menu: { items: RawMenuItem[] } | null }>(
		config,
		`query Navigation($handle: String!) { menu(handle: $handle) { items { ${menuItemFields} items { ${menuItemFields} items { ${menuItemFields} } } } } }`,
		{ handle },
		fetcher
	);
	return data.menu ? normalizeMenu(data.menu.items, config.domain) : defaultMenu(handle);
}

type ContentField = {
	key: string;
	type?: string;
	value: string | null;
	reference?: { image?: ProductImage | null } | null;
};
type RawFaq = { id: string; fields: ContentField[] };
type RawContent = {
	fields: ContentField[];
	faqs: { references: Page<RawFaq> | null } | null;
};
function fieldText(field: ContentField | undefined, fallback = ''): string {
	if (!field) return fallback;
	return field.value ?? '';
}
export async function getStoreContent(
	config: ShopConfig,
	fetcher: typeof fetch
): Promise<StoreContent> {
	let content = defaultStoreContent();
	const faqs: StoreContent['faqs'] = [];
	let cursor: string | null = null;
	let hasFaqField = false;
	do {
		const data: { metaobject: RawContent | null } = await storefront(
			config,
			`query StoreContent($after: String) { metaobject(handle: { type: "storefront_content", handle: "main" }) { fields { key type value reference { ... on MediaImage { image { url altText } } } } faqs: field(key: "faqs") { references(first: 100, after: $after) { nodes { ... on Metaobject { id fields { key type value } } } pageInfo { hasNextPage endCursor } } } } }`,
			{ after: cursor },
			fetcher
		);
		if (!data.metaobject) return defaultStoreContent();
		if (!cursor) {
			const fields = new Map(data.metaobject.fields.map((field) => [field.key, field]));
			content = {
				homeTitle: fieldText(fields.get('home_title'), content.homeTitle),
				homeText: fieldText(fields.get('home_text'), content.homeText),
				homeImage: fields.get('home_image')?.reference?.image ?? null,
				shopTitle: fieldText(fields.get('shop_title'), content.shopTitle),
				shopText: fieldText(fields.get('shop_text'), content.shopText),
				shopImage: fields.get('shop_image')?.reference?.image ?? null,
				aboutTitle: fieldText(fields.get('about_title'), content.aboutTitle),
				aboutText: fieldText(fields.get('about_text'), content.aboutText),
				aboutImage: fields.get('about_image')?.reference?.image ?? null,
				faqs: content.faqs
			};
			hasFaqField = !!data.metaobject.faqs;
		}
		const references = data.metaobject.faqs?.references;
		if (!references) break;
		for (const faq of references.nodes) {
			const fields = new Map(faq.fields.map((field) => [field.key, field]));
			const title = fieldText(fields.get('question'));
			const body = fieldText(fields.get('answer'));
			if (title.trim() && body.trim()) faqs.push({ id: faq.id, title, body });
		}
		const after = nextCursor(references);
		if (after && after === cursor) throw new Error('The shop returned a repeated page.');
		cursor = after;
	} while (cursor);
	return { ...content, faqs: hasFaqField ? faqs : content.faqs };
}

export async function getStorefrontData(
	config: ShopConfig,
	fetcher: typeof fetch,
	includeCatalogue = true
) {
	const defaults = {
		products: [] as Product[],
		collections: [] as Collection[],
		menus: { header: defaultMenu('main-menu'), footer: defaultMenu('footer') },
		content: defaultStoreContent(),
		catalogError: false,
		contentError: false
	};
	if (!config.live) return { ...defaults, catalogError: includeCatalogue, contentError: true };
	// Content permissions are independent of product access. A missing content
	// scope must never take the catalogue offline. Artist pages skip the catalogue.
	const [header, footer, content, collections, products] = await Promise.allSettled([
		getMenu(config, 'main-menu', fetcher),
		getMenu(config, 'footer', fetcher),
		getStoreContent(config, fetcher),
		includeCatalogue ? getCollections(config, fetcher) : Promise.resolve([] as Collection[]),
		includeCatalogue ? getProducts(config, fetcher) : Promise.resolve([] as Product[])
	]);
	return {
		products: products.status === 'fulfilled' ? products.value : [],
		catalogError: products.status === 'rejected',
		collections: collections.status === 'fulfilled' ? collections.value : [],
		menus: {
			header: header.status === 'fulfilled' ? header.value : defaults.menus.header,
			footer: footer.status === 'fulfilled' ? footer.value : defaults.menus.footer
		},
		content: content.status === 'fulfilled' ? content.value : defaults.content,
		contentError: [header, footer, content, collections].some(
			(result) => result.status === 'rejected'
		)
	};
}

const cartFields = `id checkoutUrl discountCodes { code applicable } cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first: 250) { nodes { id quantity merchandise { ... on ProductVariant { ${variantFields} product { title handle productType tags featuredImage { url } } } } } }`;
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
				product: {
					title: string;
					handle: string;
					productType?: string;
					tags?: string[];
					featuredImage: { url: string } | null;
				};
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
			productType: l.merchandise.product.productType,
			tags: l.merchandise.product.tags,
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
