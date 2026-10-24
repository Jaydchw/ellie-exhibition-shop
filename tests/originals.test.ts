import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	categoryMatches,
	isOriginal,
	isSoldOriginal,
	quantityLimit
} from '../src/lib/commerce/presentation';
import type { Product } from '../src/lib/commerce/types';
import { ShopState } from '../src/lib/commerce/shop.svelte';

const original: Product = {
	id: 'original-1',
	handle: 'original-1',
	title: 'Movement study',
	description: '',
	productType: 'Original painting',
	tags: [],
	images: [],
	options: [],
	variants: [
		{
			id: 'variant-1',
			title: 'Default Title',
			availableForSale: true,
			price: { amount: '400', currencyCode: 'GBP' },
			selectedOptions: []
		}
	]
};

describe('original artwork', () => {
	it('keeps originals in the full catalogue and out of prints', () => {
		expect(categoryMatches(original, '')).toBe(true);
		expect(categoryMatches(original, 'originals')).toBe(true);
		expect(categoryMatches(original, 'prints')).toBe(false);
	});
	it('recognises an original by its Shopify type or explicit tag', () => {
		expect(isOriginal({ productType: 'Original painting' })).toBe(true);
		expect(isOriginal({ productType: 'Art', tags: ['Original'] })).toBe(true);
		expect(isOriginal({ productType: 'Original artwork' })).toBe(true);
		expect(isOriginal({ productType: 'original-paintings' })).toBe(true);
		expect(isOriginal({ tags: ['original_artwork'] })).toBe(true);
		expect(isOriginal({ tags: ['one-of-a-kind'] })).toBe(true);
	});
	it('does not misclassify prints with original in their type or tag', () => {
		expect(isOriginal({ productType: 'Original art print', tags: ['original-print'] })).toBe(false);
		expect(categoryMatches({ ...original, productType: 'Art print' }, 'prints')).toBe(true);
	});
	it('marks an original sold only when every variant is unavailable', () => {
		const unavailable = { ...original.variants[0], availableForSale: false };
		expect(isSoldOriginal({ ...original, variants: [unavailable] })).toBe(true);
		expect(isSoldOriginal({ ...original, variants: [unavailable, original.variants[0]] })).toBe(
			false
		);
		expect(isSoldOriginal({ ...original, productType: 'Art print', variants: [unavailable] })).toBe(
			false
		);
	});
	it('limits unique originals in both catalogue and cart metadata', () => {
		expect(quantityLimit(original)).toBe(1);
		expect(quantityLimit({ productType: 'Original', tags: [] })).toBe(1);
		expect(quantityLimit({ tags: ['original'] })).toBe(1);
		expect(quantityLimit({ productType: 'Art print' })).toBe(99);
	});
	it('honours tracked inventory even when the product type has not been set', () => {
		const variant = { ...original.variants[0], quantityAvailable: 1 };
		expect(quantityLimit({ productType: '' }, variant)).toBe(1);
		expect(quantityLimit({ productType: '', variant })).toBe(1);
		expect(quantityLimit({ productType: '', variants: [variant] })).toBe(1);
		expect(quantityLimit({ productType: '' }, { ...variant, quantityAvailable: 0 })).toBe(99);
		expect(
			quantityLimit(
				{ productType: '' },
				{ ...variant, quantityAvailable: 0, availableForSale: false }
			)
		).toBe(0);
	});
	it('keeps Shopify backorders available and does not invent a stock count', () => {
		const variant = { ...original.variants[0], quantityAvailable: 0, currentlyNotInStock: true };
		expect(quantityLimit({ productType: 'Print' }, variant)).toBe(99);
		expect(quantityLimit({ productType: 'Print' }, { ...variant, quantityAvailable: null })).toBe(
			99
		);
		expect(quantityLimit(original, variant)).toBe(1);
		expect(quantityLimit(original, { ...variant, availableForSale: false })).toBe(0);
	});
	it('applies quantity rule limits and increments on top of stock', () => {
		const variant = {
			...original.variants[0],
			quantityAvailable: 7,
			quantityRule: { minimum: 2, increment: 2, maximum: 6 }
		};
		expect(quantityLimit({ productType: 'Print' }, variant)).toBe(6);
		expect(quantityLimit({ productType: 'Print' }, { ...variant, quantityAvailable: 1 })).toBe(0);
	});
});

describe('unique artwork in a bag', () => {
	beforeEach(() => {
		// Exercise the imperative bag transitions without a component renderer.
		vi.stubGlobal('$state', (value: unknown) => value);
		vi.stubGlobal('$derived', (value: unknown) => value);
		vi.stubGlobal('localStorage', { setItem: vi.fn() });
	});
	afterEach(() => vi.unstubAllGlobals());
	const createBag = () => {
		const shop = new ShopState({
			domain: '',
			token: '',
			version: '2026-07',
			live: false,
			accountUrl: '',
			newsletterUrl: ''
		});
		shop.busy = false;
		return shop;
	};
	it('caps an original addition and never adds a second copy', async () => {
		const shop = createBag();
		await shop.add(original, original.variants[0], 4);
		await shop.add(original, original.variants[0]);
		expect(shop.cart?.lines).toHaveLength(1);
		expect(shop.cart?.lines[0].quantity).toBe(1);
		expect(shop.cart?.total.amount).toBe('400.00');
		expect(shop.notice).toContain('already in your bag');
		expect(shop.busy).toBe(false);
	});
	it('caps cart edits for originals and still allows removal', async () => {
		const shop = createBag();
		await shop.add(original, original.variants[0]);
		await shop.quantity(original.variants[0].id, 8);
		expect(shop.cart?.lines[0].quantity).toBe(1);
		await shop.quantity(original.variants[0].id, 0);
		expect(shop.cart?.lines).toHaveLength(0);
	});
	it('allows multiple print copies and rejects unavailable originals', async () => {
		const shop = createBag();
		const print = { ...original, productType: 'Art print' };
		await shop.add(print, print.variants[0], 2);
		await shop.add(print, print.variants[0], 3);
		expect(shop.cart?.lines[0].quantity).toBe(5);
		const sold = { ...original, handle: 'sold' };
		await shop.add(sold, { ...sold.variants[0], availableForSale: false });
		expect(shop.cart?.lines).toHaveLength(1);
	});
	it('caps cumulative additions and cart edits to the Shopify stock count', async () => {
		const shop = createBag();
		const variant = { ...original.variants[0], quantityAvailable: 3 };
		const product = { ...original, productType: '', variants: [variant] };
		await shop.add(product, variant, 2);
		await shop.add(product, variant, 4);
		expect(shop.cart?.lines[0].quantity).toBe(3);
		await shop.add(product, variant);
		expect(shop.cart?.lines[0].quantity).toBe(3);
		expect(shop.notice).toContain('already in your bag');
		await shop.quantity(variant.id, 8);
		expect(shop.cart?.lines[0].quantity).toBe(3);
		await shop.quantity(variant.id, 0);
		expect(shop.cart?.lines).toHaveLength(0);
	});
	it('limits an uncategorised one-stock painting to one copy', async () => {
		const shop = createBag();
		const variant = { ...original.variants[0], quantityAvailable: 1 };
		const product = { ...original, productType: '', variants: [variant] };
		await shop.add(product, variant, 4);
		await shop.quantity(variant.id, 5);
		expect(shop.cart?.lines[0].quantity).toBe(1);
	});
	it('applies minimum and increment rules to the total quantity, including additional copies', async () => {
		const shop = createBag();
		const variant = {
			...original.variants[0],
			quantityRule: { minimum: 4, increment: 2, maximum: 10 }
		};
		const product = { ...original, productType: 'Print', variants: [variant] };
		await shop.add(product, variant);
		expect(shop.cart?.lines[0].quantity).toBe(4);
		await shop.add(product, variant, 2);
		expect(shop.cart?.lines[0].quantity).toBe(6);
		await shop.quantity(variant.id, 9);
		expect(shop.cart?.lines[0].quantity).toBe(8);
	});
	it('deduplicates restored originals and drops unavailable saved lines', async () => {
		const variant = original.variants[0];
		const sold = {
			...original,
			handle: 'sold',
			variants: [{ ...variant, id: 'sold-variant', availableForSale: false }]
		};
		vi.stubGlobal('localStorage', {
			setItem: vi.fn(),
			getItem: (key: string) =>
				key.includes(':bag:')
					? JSON.stringify({
							lines: [
								{ variant: { id: variant.id }, quantity: 4 },
								{ variant: { id: variant.id }, quantity: 2 },
								{ variant: { id: 'sold-variant' }, quantity: 1 }
							]
						})
					: '[]'
		});
		const shop = createBag();
		await shop.init([original, sold]);
		expect(shop.cart?.lines).toHaveLength(1);
		expect(shop.cart?.lines[0].quantity).toBe(1);
	});
});
