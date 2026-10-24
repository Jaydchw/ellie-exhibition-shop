export type Money = { amount: string; currencyCode: string };
export type ProductImage = { url: string; altText: string | null };
export type SearchMetadata = { title?: string | null; description?: string | null };
export type MerchantPageSummary = {
	handle: string;
	title: string;
	updatedAt?: string;
	seo?: SearchMetadata;
};
export type Collection = {
	id: string;
	handle: string;
	title: string;
	description: string;
	image: ProductImage | null;
	seo?: SearchMetadata;
	updatedAt?: string;
	hasProducts?: boolean;
};
export type MenuLink = { id: string; title: string; url: string; items: MenuLink[] };
export type StoreContent = {
	homeTitle: string;
	homeText: string;
	homeImage: ProductImage | null;
	shopTitle: string;
	shopText: string;
	shopImage: ProductImage | null;
	aboutTitle: string;
	aboutText: string;
	aboutImage: ProductImage | null;
	faqs: { id: string; title: string; body: string }[];
};
export type Variant = {
	id: string;
	sku?: string | null;
	title: string;
	availableForSale: boolean;
	quantityAvailable?: number | null;
	currentlyNotInStock?: boolean;
	quantityRule?: { minimum: number; maximum: number | null; increment: number };
	price: Money;
	compareAtPrice?: Money | null;
	selectedOptions: { name: string; value: string }[];
	image?: ProductImage | null;
};
export type Product = {
	id: string;
	handle: string;
	title: string;
	description: string;
	productType: string;
	tags: string[];
	images: ProductImage[];
	variants: Variant[];
	options: { name: string; values: string[] }[];
	seo?: SearchMetadata;
	updatedAt?: string;
	careInstructions?: string;
	artwork?: { medium?: string; dimensions?: string; year?: string; framing?: string };
	sizeGuide?: { headers: string[]; rows: string[][]; note: string };
};
export type ShopConfig = {
	invalid?: boolean;
	domain: string;
	token: string;
	version: string;
	live: boolean;
	accountUrl: string;
	newsletterUrl: string;
};
export type CartLine = {
	id: string;
	quantity: number;
	title: string;
	handle: string;
	image: string;
	variant: Variant;
	productType?: string;
	tags?: string[];
};
export type Cart = {
	id: string;
	checkoutUrl: string;
	lines: CartLine[];
	subtotal: Money;
	total: Money;
	discountCodes: { code: string; applicable: boolean }[];
};
export function money(value: Money) {
	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: value.currencyCode,
		maximumFractionDigits: Number(value.amount) % 1 ? 2 : 0
	}).format(Number(value.amount));
}
export function matchingVariants(product: Product, finish = '') {
	if (!finish) return product.variants;
	const needle = finish.toLowerCase();
	const matches = (value: string) =>
		value.toLowerCase().includes(needle) &&
		!(needle === 'frame' && /unframed|no frame/i.test(value));
	return product.variants.filter(
		(v) => matches(product.productType) || v.selectedOptions.some((o) => matches(o.value))
	);
}
export function fromPrice(product: Product, finish = '') {
	const variants = matchingVariants(product, finish);
	return variants.reduce(
		(min, v) => (Number(v.price.amount) < Number(min.amount) ? v.price : min),
		variants[0]?.price ?? { amount: '0', currencyCode: 'GBP' }
	);
}
