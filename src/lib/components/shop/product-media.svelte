<script lang="ts">
	import type { Product, ProductImage } from '$lib/commerce/types';
	import { isClothing, isOriginal } from '$lib/commerce/presentation';
	import ArtDisplay from './art-display.svelte';
	let {
		product,
		image = product.images[0],
		finish = 'Natural frame',
		eager = false
	}: { product: Product; image?: ProductImage; finish?: string; eager?: boolean } = $props();
</script>

{#if image}
	{#if product.id.startsWith('demo-') && !isClothing(product) && !isOriginal(product)}
		<ArtDisplay src={image.url} alt={image.altText ?? product.title} {finish} {eager} />
	{:else}<img
			class="product-photo"
			src={image.url}
			alt={image.altText ?? product.title}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
		/>{/if}
{:else}<span class="small muted">No image available</span>{/if}

<style>
	.product-photo {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
		object-fit: contain;
		transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
	}
</style>
