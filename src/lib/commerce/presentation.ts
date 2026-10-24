import type { Product, Variant } from './types';
type ProductKind = { productType?: string; tags?: string[] };
export function isOriginal(product: ProductKind) {
	const original =
		/^(?:originals?|original (?:paintings?|artworks?|works?|art)|paintings?|one of a kind|one off)$/i;
	return [product.productType ?? '', ...(product.tags ?? [])].some((value) =>
		original.test(value.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' '))
	);
}
export function isSoldOriginal(product: Product) {
	return isOriginal(product) && !product.variants.some((variant) => variant.availableForSale);
}
export function quantityLimit(
	product: ProductKind & { variant?: Variant; variants?: Variant[] },
	variant = product.variant ?? (product.variants?.length === 1 ? product.variants[0] : undefined)
) {
	let limit = isOriginal(product) ? 1 : 99;
	if (!variant) return limit;
	if (!variant.availableForSale) return 0;
	// Backorders and untracked products can remain sellable with no stock. Only
	// a positive exposed count caps a sellable variant; Shopify validates checkout.
	if (
		Number.isInteger(variant.quantityAvailable) &&
		!variant.currentlyNotInStock &&
		variant.quantityAvailable! > 0
	)
		limit = Math.min(limit, variant.quantityAvailable!);
	const rule = variant.quantityRule;
	if (rule?.maximum != null) limit = Math.min(limit, rule.maximum);
	const increment = rule?.increment ?? 1;
	limit = Math.floor(limit / increment) * increment;
	return limit < (rule?.minimum ?? 1) ? 0 : limit;
}
export function isClothing(product: Product) {
	return /t.?shirt|hoodie|apparel|clothing/i.test([product.productType, ...product.tags].join(' '));
}
export function categoryMatches(product: Product, category: string) {
	if (!category) return true;
	if (category === 'sale') return product.variants.some(isOnSale);
	if (category === 'clothing') return isClothing(product);
	if (category === 'originals') return isOriginal(product);
	if (category === 'prints') return !isClothing(product) && !isOriginal(product);
	if (category === 'T-shirt')
		return /t.?shirts?/i.test([product.productType, ...product.tags].join(' '));
	if (category === 'Hoodie')
		return /hoodies?/i.test([product.productType, ...product.tags].join(' '));
	return product.productType.toLowerCase() === category.toLowerCase();
}
export function isOnSale(variant: Variant) {
	return (
		!!variant.compareAtPrice &&
		variant.compareAtPrice.currencyCode === variant.price.currencyCode &&
		Number(variant.compareAtPrice.amount) > Number(variant.price.amount)
	);
}
export function savingsPercent(variant: Variant) {
	return isOnSale(variant)
		? Math.round((1 - Number(variant.price.amount) / Number(variant.compareAtPrice!.amount)) * 100)
		: 0;
}
export const colourHex: Record<string, string> = {
	Natural: '#ded3bc',
	'Desert Dust': '#ded3bc',
	Ash: '#deded8',
	Black: '#292a27',
	White: '#f5f3ed'
};
