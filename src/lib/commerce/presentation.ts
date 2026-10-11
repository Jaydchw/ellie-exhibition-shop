import type { Product, Variant } from './types';
export function isClothing(product: Product) {
	return /t.?shirt|hoodie|apparel|clothing/i.test([product.productType, ...product.tags].join(' '));
}
export function categoryMatches(product: Product, category: string) {
	if (!category) return true;
	if (category === 'sale') return product.variants.some(isOnSale);
	if (category === 'clothing') return isClothing(product);
	if (category === 'prints') return !isClothing(product);
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
