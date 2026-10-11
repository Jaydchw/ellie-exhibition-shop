import { describe, it, expect } from 'vitest';
import {
	isOnSale,
	savingsPercent,
	categoryMatches,
	isClothing
} from '../src/lib/commerce/presentation';
import type { Product, Variant } from '../src/lib/commerce/types';
const variant: Variant = {
	id: 'v',
	title: 'A4',
	availableForSale: true,
	selectedOptions: [],
	price: { amount: '28', currencyCode: 'GBP' },
	compareAtPrice: { amount: '35', currencyCode: 'GBP' }
};
const product: Product = {
	id: 'p',
	handle: 'p',
	title: 'P',
	description: '',
	productType: 'Art print',
	tags: [],
	images: [],
	variants: [variant],
	options: []
};
describe('sale and category presentation', () => {
	it('calculates a real compare-at reduction', () => {
		expect(isOnSale(variant)).toBe(true);
		expect(savingsPercent(variant)).toBe(20);
		expect(categoryMatches(product, 'sale')).toBe(true);
	});
	it('does not invent a sale for empty, equal, lower or foreign-currency compare-at prices', () => {
		for (const compareAtPrice of [
			null,
			{ amount: '28', currencyCode: 'GBP' },
			{ amount: '20', currencyCode: 'GBP' },
			{ amount: '35', currencyCode: 'USD' }
		]) {
			expect(isOnSale({ ...variant, compareAtPrice })).toBe(false);
			expect(savingsPercent({ ...variant, compareAtPrice })).toBe(0);
		}
	});
	it('separates apparel from prints using Shopify type or tags', () => {
		expect(categoryMatches(product, 'prints')).toBe(true);
		expect(categoryMatches(product, 'clothing')).toBe(false);
		expect(isClothing({ ...product, productType: 'Hoodie' })).toBe(true);
		expect(isClothing({ ...product, tags: ['Clothing'] })).toBe(true);
		expect(categoryMatches({ ...product, productType: 'T-shirt' }, 'T-shirt')).toBe(true);
	});
	it('includes products where only one variant is discounted', () => {
		expect(
			categoryMatches(
				{ ...product, variants: [{ ...variant, compareAtPrice: null }, variant] },
				'sale'
			)
		).toBe(true);
	});
});
