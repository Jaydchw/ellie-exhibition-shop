import { describe, expect, it } from 'vitest';
import { fromPrice, matchingVariants } from '../src/lib/commerce/types';
import type { Product } from '../src/lib/commerce/types';
const product: Product = {
	id: 'p1',
	title: 'Movement',
	handle: 'movement',
	description: '',
	productType: 'Abstract',
	tags: [],
	images: [],
	options: [],
	variants: ['Unframed print', 'Black frame', 'Natural frame'].map((finish, index) => ({
		id: String(index),
		title: finish,
		availableForSale: true,
		price: { amount: String([35, 99, 110][index]), currencyCode: 'GBP' },
		selectedOptions: [{ name: 'Finish', value: finish }]
	}))
};
describe('format browsing', () => {
	it('does not confuse unframed prints with framed pieces', () => {
		expect(matchingVariants(product, 'frame').map((v) => v.title)).toEqual([
			'Black frame',
			'Natural frame'
		]);
	});
	it('shows the minimum price for the selected format', () => {
		expect(fromPrice(product).amount).toBe('35');
		expect(fromPrice(product, 'frame').amount).toBe('99');
	});
	it('supports separate Shopify product types', () => {
		expect(matchingVariants({ ...product, productType: 'Framed prints' }, 'frame')).toHaveLength(3);
	});
});
