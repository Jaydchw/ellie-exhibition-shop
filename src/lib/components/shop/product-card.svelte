<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Product } from '$lib/commerce/types';
	import { money, matchingVariants } from '$lib/commerce/types';
	import { isOnSale, isClothing, isOriginal, isSoldOriginal } from '$lib/commerce/presentation';
	import { useShop } from '$lib/commerce/shop.svelte';
	import ProductMedia from './product-media.svelte';
	import Icon from './icon.svelte';
	import ImageViewer from '$lib/components/ui/image-viewer.svelte';
	let {
		product,
		index = 0,
		gallery = false,
		finishFilter = '',
		saleOnly = false
	}: {
		product: Product;
		index?: number;
		gallery?: boolean;
		finishFilter?: string;
		saleOnly?: boolean;
	} = $props();
	const shop = useShop();
	let zoom = $state(false);
	let image = $derived(product.images[0]);
	let original = $derived(isOriginal(product));
	let sold = $derived(isSoldOriginal(product));
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

<article class="product-card" class:original class:gallery-piece={gallery}>
	<div
		class="product-card__visual"
		class:sage={!original && index % 3 === 1}
		class:blush={!original && index % 3 === 2}
	>
		<a
			class="product-card__image"
			class:clothing={isClothing(product)}
			{href}
			aria-label={`View ${product.title}`}><ProductMedia {product} finish={cardFinish} /></a
		>
		{#if !sold && matching.some(isOnSale)}<span class="sale-badge">Sale</span>{/if}
		{#if image}<button
				class="enlarge-button"
				type="button"
				aria-label={`Enlarge ${product.title}`}
				onclick={() => (zoom = true)}><Icon name="zoom" size={18} /></button
			>{/if}
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
			{#if gallery}<span class="gallery-number" aria-hidden="true"
					>{String(index + 1).padStart(2, '0')}</span
				>{/if}
			<p class="product-category">
				{original
					? (product.artwork?.medium ?? 'Original')
					: isClothing(product)
						? product.productType
						: 'Prints & posters'}
			</p>
			<h3><a {href}>{product.title}</a></h3>
			{#if gallery && product.artwork?.dimensions}<p class="gallery-dimensions">
					{product.artwork.dimensions}
				</p>{/if}
		</div>
		{#if sold}<p class="product-card__price sold-label">Sold</p>
		{:else if cheapest}<p class="product-card__price" class:sale-price={isOnSale(cheapest)}>
				{#if product.variants.some((v) => v.price.amount !== cheapest.price.amount)}From
				{/if}{money(cheapest.price)}{#if isOnSale(cheapest)}<del
						>{money(cheapest.compareAtPrice!)}</del
					>{/if}
			</p>{/if}
	</div>
</article>
{#if image}<ImageViewer
		bind:open={zoom}
		src={image.url}
		alt={image.altText ?? product.title}
		title={product.title}
	/>{/if}

<style>
	.original .product-card__visual {
		background: color-mix(in srgb, var(--stone) 35%, var(--paper));
		aspect-ratio: 1.12;
	}
	.original .product-card__image {
		padding: 8%;
		height: 100%;
		min-height: 0;
	}
	.original .product-card__image :global(.product-photo) {
		height: 100%;
		max-height: 100%;
	}
	.enlarge-button {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border: 0;
		border-radius: 50%;
		background: #f7f3ecdf;
		color: var(--navy);
		cursor: zoom-in;
	}
	.original .product-card__info {
		padding-top: 1rem;
		border-top: 1px solid var(--line);
		margin-top: 1.25rem;
	}
	.sold-label {
		color: var(--moss);
	}
	.gallery-piece .product-card__info {
		position: relative;
		padding: 1.25rem 0 0 2.4rem;
		margin-top: 1.5rem;
	}
	.gallery-number {
		position: absolute;
		left: 0;
		top: 1.5rem;
		color: var(--moss);
		font: 400 0.65rem var(--font-sans);
	}
	.gallery-piece h3 {
		font-size: clamp(1.65rem, 3vw, 2.4rem);
		font-style: italic;
		line-height: 1.15;
	}
	.gallery-dimensions {
		margin: 0.4rem 0 0;
		color: var(--muted);
		font-size: 0.65rem;
	}
	.gallery-piece .sold-label::before {
		content: '';
		display: inline-block;
		width: 0.4rem;
		height: 0.4rem;
		margin-right: 0.45rem;
		border-radius: 50%;
		background: var(--terracotta);
	}
</style>
