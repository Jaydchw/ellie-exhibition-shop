export type Money = { amount: string; currencyCode: string };
export type ProductImage = { url: string; altText: string | null };
export type Variant = {
	id: string;
	title: string;
	availableForSale: boolean;
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
