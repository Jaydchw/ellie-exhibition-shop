import { getContext } from 'svelte';
import { SvelteURL } from 'svelte/reactivity';
import { mutateCart, readCart } from './shopify';
import type { Cart, Product, ShopConfig, Variant } from './types';
import { isOriginal, quantityLimit } from './presentation';

function boundedQuantity(quantity: number, maximum: number, variant: Variant) {
	const minimum = variant.quantityRule?.minimum ?? 1;
	const increment = variant.quantityRule?.increment ?? 1;
	if (maximum < minimum) return 0;
	return Math.max(minimum, Math.floor(Math.min(quantity, maximum) / increment) * increment);
}

export const SHOP = Symbol('shop');
export const useShop = () => getContext<ShopState>(SHOP);
export class ShopState {
	config: ShopConfig;
	cart = $state<Cart | null>(null);
	saved = $state<string[]>([]);
	open = $state(false);
	busy = $state(true);
	checkingOut = $state(false);
	error = $state('');
	notice = $state('');
	count = $derived(this.cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0);
	constructor(config: ShopConfig) {
		this.config = config;
	}
	private get key() {
		return `seal-stuff:bag:${this.config.live ? this.config.domain : 'preview'}:v1`;
	}
	private persist() {
		try {
			localStorage.setItem(
				this.key,
				JSON.stringify(this.config.live ? { id: this.cart?.id } : this.cart)
			);
		} catch {
			/* Shopping still works without persistent storage. */
		}
	}
	async init(products: Product[]) {
		try {
			const saved = JSON.parse(localStorage.getItem('seal-stuff:saved:v1') ?? '[]');
			if (Array.isArray(saved))
				this.saved = saved.filter((s): s is string => typeof s === 'string');
			const previous = JSON.parse(localStorage.getItem(this.key) ?? 'null');
			if (this.config.live && typeof previous?.id === 'string')
				this.cart = await readCart(this.config, previous.id);
			else if (!this.config.live && Array.isArray(previous?.lines)) {
				const lines: Cart['lines'] = [];
				for (const line of previous.lines as { variant?: { id?: string }; quantity?: number }[]) {
					const p = products.find((p) => p.variants.some((v) => v.id === line.variant?.id));
					const v = p?.variants.find((v) => v.id === line.variant?.id);
					if (!p || !v || !Number.isInteger(line.quantity) || line.quantity! < 1) continue;
					if (isOriginal(p) && lines.some((item) => item.handle === p.handle)) continue;
					const existing = lines.find((item) => item.variant.id === v.id);
					const quantity = boundedQuantity(
						(existing?.quantity ?? 0) + line.quantity!,
						quantityLimit(p, v),
						v
					);
					if (!quantity) continue;
					if (existing) existing.quantity = quantity;
					else
						lines.push({
							id: v.id,
							title: p.title,
							handle: p.handle,
							productType: p.productType,
							tags: p.tags,
							image: v.image?.url ?? p.images[0]?.url ?? '',
							variant: v,
							quantity
						});
				}
				this.cart = {
					id: 'preview',
					checkoutUrl: '',
					lines,
					subtotal: { amount: '0', currencyCode: 'GBP' },
					total: { amount: '0', currencyCode: 'GBP' },
					discountCodes: []
				};
				this.retotal();
			}
		} catch {
			this.error =
				'Your saved bag could not be restored. You can start a new bag or refresh to try again.';
		} finally {
			this.busy = false;
		}
	}
	toggleSaved(handle: string) {
		this.saved = this.saved.includes(handle)
			? this.saved.filter((s) => s !== handle)
			: [...this.saved, handle];
		try {
			localStorage.setItem('seal-stuff:saved:v1', JSON.stringify(this.saved));
		} catch {
			/* Session only. */
		}
	}
	private retotal() {
		if (!this.cart) return;
		const amount = (
			this.cart.lines.reduce(
				(n, l) => n + Math.round(Number(l.variant.price.amount) * 100) * l.quantity,
				0
			) / 100
		).toFixed(2);
		this.cart.subtotal = { amount, currencyCode: 'GBP' };
		this.cart.total = { ...this.cart.subtotal };
	}
	quantityMaximum(id: string) {
		const line = this.cart?.lines.find((item) => item.id === id);
		if (!line) return 0;
		const otherCopies = this.cart!.lines.reduce(
			(sum, item) =>
				sum +
				(item.id !== id &&
				(isOriginal(line) ? item.handle === line.handle : item.variant.id === line.variant.id)
					? item.quantity
					: 0),
			0
		);
		return Math.max(0, quantityLimit(line) - otherCopies);
	}
	async add(product: Product, variant: Variant, quantity = 1) {
		if (
			this.busy ||
			!variant.availableForSale ||
			!Number.isInteger(quantity) ||
			quantity < 1 ||
			quantity > 99
		)
			return;
		this.busy = true;
		this.error = '';
		this.notice = '';
		this.open = true;
		try {
			if (isOriginal(product)) {
				if (this.cart?.lines.some((line) => line.handle === product.handle)) {
					this.notice = 'This original is already in your bag.';
					return;
				}
				quantity = 1;
			}
			const existingQuantity =
				this.cart?.lines.reduce(
					(sum, line) => sum + (line.variant.id === variant.id ? line.quantity : 0),
					0
				) ?? 0;
			const maximum = quantityLimit(product, variant);
			const targetQuantity = boundedQuantity(existingQuantity + quantity, maximum, variant);
			quantity = Math.max(0, targetQuantity - existingQuantity);
			if (!quantity) {
				this.notice = maximum
					? 'All available copies are already in your bag.'
					: 'This piece is no longer available.';
				return;
			}
			if ((this.cart?.lines.length ?? 0) >= 100)
				throw new Error('Your bag is full. Please check out before adding more pieces.');
			if (this.config.live)
				this.cart = await mutateCart(
					this.config,
					this.cart ? 'add' : 'create',
					this.cart?.id,
					this.cart
						? [{ merchandiseId: variant.id, quantity }]
						: { lines: [{ merchandiseId: variant.id, quantity }] }
				);
			else {
				this.cart ??= {
					id: 'preview',
					checkoutUrl: '',
					lines: [],
					subtotal: { amount: '0', currencyCode: 'GBP' },
					total: { amount: '0', currencyCode: 'GBP' },
					discountCodes: []
				};
				const existing = this.cart.lines.find((l) => l.variant.id === variant.id);
				if (existing) existing.quantity += quantity;
				else
					this.cart.lines.push({
						id: variant.id,
						quantity,
						title: product.title,
						handle: product.handle,
						productType: product.productType,
						tags: product.tags,
						image: variant.image?.url ?? product.images[0]?.url ?? '',
						variant
					});
				this.retotal();
			}
			this.persist();
		} catch (error) {
			this.error =
				error instanceof Error ? error.message : 'Something went wrong. Please try again.';
		} finally {
			this.busy = false;
		}
	}
	async quantity(id: string, quantity: number) {
		if (this.busy || !this.cart || !Number.isInteger(quantity) || quantity < 0 || quantity > 99)
			return;
		const line = this.cart.lines.find((item) => item.id === id);
		if (!line) return;
		if (quantity) {
			quantity = boundedQuantity(quantity, this.quantityMaximum(id), line.variant);
			// An unavailable item can still be removed explicitly, but increasing
			// its quantity must not silently remove it from the customer's bag.
			if (!quantity || quantity === line.quantity) return;
		}
		this.busy = true;
		this.error = '';
		this.notice = '';
		try {
			if (this.config.live)
				this.cart = await mutateCart(
					this.config,
					quantity ? 'update' : 'remove',
					this.cart.id,
					quantity ? [{ id, quantity }] : [id]
				);
			else {
				this.cart.lines = this.cart.lines.flatMap((l) =>
					l.id !== id ? [l] : quantity ? [{ ...l, quantity }] : []
				);
				this.retotal();
			}
			this.persist();
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not update your bag.';
		} finally {
			this.busy = false;
		}
	}
	async discount(code: string) {
		if (this.busy || !this.cart) return;
		if (!this.config.live) {
			this.error = 'Discount codes are unavailable. Please try again later.';
			return;
		}
		this.busy = true;
		this.error = '';
		this.notice = '';
		try {
			this.cart = await mutateCart(
				this.config,
				'discount',
				this.cart.id,
				code.trim() ? [code.trim()] : []
			);
			this.notice = !code.trim()
				? 'Discount removed.'
				: this.cart.discountCodes.some((d) => d.applicable)
					? 'Discount applied.'
					: 'That code is not available for this bag.';
			this.persist();
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Could not apply your code.';
		} finally {
			this.busy = false;
		}
	}
	async checkout() {
		if (!this.cart || this.busy) return;
		this.busy = true;
		this.checkingOut = true;
		this.error = '';
		try {
			if (!this.config.live) throw new Error('Checkout is unavailable. Please try again later.');
			this.cart = await readCart(this.config, this.cart.id);
			this.persist();
			if (!this.cart?.lines.length)
				throw new Error('This bag has expired. Please add your pieces again.');
			if (
				this.cart.lines.some(
					(line) =>
						isOriginal(line) &&
						this.cart!.lines.reduce(
							(sum, item) => sum + (item.handle === line.handle ? item.quantity : 0),
							0
						) > 1
				)
			)
				throw new Error('An original can only be purchased once. Update its quantity in your bag.');
			if (
				this.cart.lines.some((line) => {
					const copies = this.cart!.lines.reduce(
						(sum, item) => sum + (item.variant.id === line.variant.id ? item.quantity : 0),
						0
					);
					const rule = line.variant.quantityRule;
					return (
						copies > quantityLimit(line) ||
						copies < (rule?.minimum ?? 1) ||
						copies % (rule?.increment ?? 1) !== 0
					);
				})
			)
				throw new Error(
					'Availability has changed. Please update the quantities in your bag before checkout.'
				);
			const destination = new SvelteURL(this.cart.checkoutUrl);
			if (destination.protocol !== 'https:')
				throw new Error('Checkout is unavailable. Please try again.');
			window.location.assign(destination.href);
		} catch (error) {
			this.error =
				error instanceof Error ? error.message : 'Checkout is unavailable. Please try again.';
		} finally {
			this.busy = false;
			this.checkingOut = false;
		}
	}
}
