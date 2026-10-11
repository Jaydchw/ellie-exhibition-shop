<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Product } from '$lib/commerce/types';
	import { money, matchingVariants } from '$lib/commerce/types';
	import { isOnSale, isClothing } from '$lib/commerce/presentation';
	import { useShop } from '$lib/commerce/shop.svelte';
	import ProductMedia from './product-media.svelte';
	import Icon from './icon.svelte';
	let {
		product,
		index = 0,
		finishFilter = '',
		saleOnly = false
	}: { product: Product; index?: number; finishFilter?: string; saleOnly?: boolean } = $props();
	const shop = useShop();
	let matching = $derived(
		matchingVariants(product, finishFilter).filter((v) => !saleOnly || isOnSale(v))
	);
	let cheapest = $derived(
		matching.reduce(
			(a, b) => (Number(a.price.amount) <= Number(b.price.amount) ? a : b),
			matching[0]
		)
	);
	let href = $derived(
		resolve(
			`/shop/${encodeURIComponent(product.handle)}${(finishFilter || saleOnly) && cheapest ? '?variant=' + encodeURIComponent(cheapest.id) : ''}`
		)
	);
	let cardFinish = $derived(
		finishFilter
			? (cheapest?.selectedOptions.find((o) => /finish|frame/i.test(o.name))?.value ?? 'Print')
			: index % 3 === 1
				? 'Black frame'
				: 'Natural frame'
	);
</script>

<article class="product-card">
	<div class="product-card__visual" class:sage={index % 3 === 1} class:blush={index % 3 === 2}>
		<a
			class="product-card__image"
			class:clothing={isClothing(product)}
			{href}
			aria-label={`View ${product.title}`}><ProductMedia {product} finish={cardFinish} /></a
		>
		{#if matching.some(isOnSale)}<span class="sale-badge">Sale</span>{/if}
		<button
			class="save-button"
			class:is-saved={shop.saved.includes(product.handle)}
			aria-label={`${shop.saved.includes(product.handle) ? 'Unsave' : 'Save'} ${product.title}`}
			aria-pressed={shop.saved.includes(product.handle)}
			onclick={() => shop.toggleSaved(product.handle)}><Icon name="heart" size={18} /></button
		>
	</div>
	<div class="product-card__info">
		<div>
			<p class="product-category">
				{isClothing(product) ? product.productType : 'Prints & posters'}
			</p>
			<h3><a {href}>{product.title}</a></h3>
		</div>
		{#if cheapest}<p class="product-card__price" class:sale-price={isOnSale(cheapest)}>
				{#if product.variants.some((v) => v.price.amount !== cheapest.price.amount)}From
				{/if}{money(cheapest.price)}{#if isOnSale(cheapest)}<del
						>{money(cheapest.compareAtPrice!)}</del
					>{/if}
			</p>{/if}
	</div>
</article>
