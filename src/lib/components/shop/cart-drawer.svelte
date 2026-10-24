<script lang="ts">
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { useShop } from '$lib/commerce/shop.svelte';
	import { money } from '$lib/commerce/types';
	import { isOnSale, isOriginal } from '$lib/commerce/presentation';
	import Modal from './modal.svelte';
	import Icon from './icon.svelte';
	import QuantityPicker from './quantity-picker.svelte';
	const shop = useShop();
	let code = $state('');
	let savings = $derived(
		shop.cart?.lines.reduce(
			(sum, line) =>
				sum +
				(isOnSale(line.variant)
					? Math.round(
							(Number(line.variant.compareAtPrice!.amount) - Number(line.variant.price.amount)) *
								100
						) * line.quantity
					: 0),
			0
		) ?? 0
	);
	const duration = () =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
			? 0
			: 220;
</script>

<Modal bind:open={shop.open} title={`Your bag (${shop.count})`} drawer>
	<div class="bag-body" aria-busy={shop.busy}>
		{#if shop.error}<p class="error-message" role="alert">{shop.error}</p>{/if}
		{#if shop.cart?.lines.length}
			<div class="bag-lines">
				{#each shop.cart.lines as line (line.id)}
					<article
						class="bag-line"
						animate:flip={{ duration: duration() }}
						in:fly={{ x: 24, duration: duration() }}
						out:fly={{ x: 30, duration: duration() }}
					>
						{#if line.image}<img src={line.image} alt="" />{/if}
						<div>
							<a
								class="bag-line__title"
								href={resolve('/shop/[handle]', { handle: line.handle })}
								onclick={() => (shop.open = false)}>{line.title}</a
							>
							<p class="small muted">
								{isOriginal(line)
									? 'Original artwork'
									: line.variant.title === 'Default Title'
										? ''
										: line.variant.title}
							</p>
							<p class="small" class:sale-price={isOnSale(line.variant)}>
								{money(line.variant.price)}{#if isOnSale(line.variant)}
									<del>{money(line.variant.compareAtPrice!)}</del>{/if}
							</p>
							<QuantityPicker
								value={line.quantity}
								min={line.variant.quantityRule?.minimum ?? 1}
								step={line.variant.quantityRule?.increment ?? 1}
								max={shop.quantityMaximum(line.id)}
								disabled={shop.busy}
								label={`Quantity of ${line.title}`}
								onchange={(n) => shop.quantity(line.id, n)}
							/>
						</div>
						<button
							class="icon-button remove-item"
							disabled={shop.busy}
							aria-label={`Remove ${line.title}`}
							onclick={() => shop.quantity(line.id, 0)}><Icon name="trash" size={18} /></button
						>
					</article>
				{/each}
			</div>
			<div class="bag-summary">
				{#if savings > 0}<div class="bag-savings">
						<Icon name="tag" size={18} /><span
							>You save {money({
								amount: (savings / 100).toFixed(2),
								currencyCode: shop.cart.subtotal.currencyCode
							})} on sale items</span
						><Icon name="check" size={17} />
					</div>{/if}
				<details class="discount-details">
					<summary>Have a discount code? <Icon name="down" size={16} /></summary>
					<form
						class="discount-form"
						onsubmit={(e) => {
							e.preventDefault();
							shop.discount(code);
						}}
					>
						<label class="sr-only" for="discount">Discount code</label><input
							id="discount"
							bind:value={code}
							placeholder="Enter code"
							maxlength="100"
						/><button class="button secondary" disabled={shop.busy}>Apply</button>
					</form>
					{#each shop.cart.discountCodes.filter((d) => d.applicable) as discount (discount.code)}<button
							class="discount-chip"
							disabled={shop.busy}
							onclick={() => {
								code = '';
								shop.discount('');
							}}
							aria-label={`Remove discount ${discount.code}`}
							><Icon name="tag" size={14} />{discount.code}<Icon name="close" size={14} /></button
						>{/each}
				</details>
				{#if shop.notice}<p class="small" role="status">{shop.notice}</p>{/if}
				<div class="spread"><span>Subtotal</span><strong>{money(shop.cart.subtotal)}</strong></div>
				{#if shop.cart.total.amount !== shop.cart.subtotal.amount}<div class="spread">
						<span>Estimated total</span><strong>{money(shop.cart.total)}</strong>
					</div>{/if}
				<p class="small muted">Delivery and taxes calculated at checkout.</p>
				<button
					class="button full checkout-button"
					class:pending={shop.checkingOut}
					disabled={shop.busy}
					onclick={() => shop.checkout()}
					>{#if shop.checkingOut}<span class="spinner"><Icon name="spinner" size={20} /></span
						>Opening checkout…{:else}<Icon name="lock" size={18} />Checkout <Icon
							name="arrow"
							size={18}
						/>{/if}</button
				>
				<button class="text-button full" onclick={() => (shop.open = false)}
					>Continue shopping</button
				>
			</div>
		{:else}<div class="empty-state">
				<Icon name="bag" size={46} />
				<h3>Your bag is empty</h3>
				<a class="button" href={resolve('/shop')} onclick={() => (shop.open = false)}
					>Shop all <Icon name="arrow" size={18} /></a
				>
			</div>{/if}
	</div>
</Modal>

<style>
	.bag-savings {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		background: #e4e8d9;
		color: #41532f;
		padding: 0.9rem;
		border-radius: 6px;
		font-family: var(--font-sans);
		font-size: 0.72rem;
		margin-bottom: 1.2rem;
	}
	.bag-savings span {
		flex: 1;
	}
	.discount-details {
		margin-bottom: 1.4rem;
		font-family: var(--font-sans);
		font-size: 0.75rem;
	}
	.discount-details summary {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
		list-style: none;
	}
	.discount-details summary::-webkit-details-marker {
		display: none;
	}
	.discount-details .discount-form {
		margin-top: 0.75rem;
	}
	.discount-chip {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
		border: 0;
		padding: 0.4rem 0.6rem;
		background: var(--sage-light);
		color: var(--navy);
		border-radius: 4px;
	}
	.remove-item {
		min-width: 36px;
		min-height: 36px;
	}
	.checkout-button {
		position: relative;
		overflow: hidden;
		border-radius: 6px;
		justify-content: space-between;
	}
	.checkout-button.pending {
		justify-content: center;
	}
	.checkout-button.pending::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(100deg, transparent, #ffffff15, transparent);
		animation: shimmer 1.3s infinite;
	}
	.spinner {
		display: inline-flex;
		animation: spin 1s linear infinite;
	}
	.bag-line del {
		font-size: 0.7rem;
		color: var(--muted);
		margin-left: 0.25rem;
	}
	@keyframes shimmer {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(100%);
		}
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
