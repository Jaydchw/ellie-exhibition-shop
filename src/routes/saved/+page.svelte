<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import { resolve } from '$app/paths';
	import { useShop } from '$lib/commerce/shop.svelte';
	import ProductCard from '$lib/components/shop/product-card.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	let { data } = $props();
	const shop = useShop();
	let products = $derived(data.products.filter((p) => shop.saved.includes(p.handle)));
</script>

<Seo title="Saved artwork | Seal Stuff" description="Your saved artwork on this device." noindex />
<main id="main-content" class="shop-page wrap">
	<section class="page-intro">
		<h1>Saved products</h1>
		<p>Saved on this device.</p>
	</section>
	{#if data.catalogError}<p class="error-message">
			Your pieces couldn’t be loaded. Please refresh to try again.
		</p>{:else if products.length}<div class="product-grid section">
			{#each products as product, index (product.id)}<ProductCard {product} {index} />{/each}
		</div>{:else}<div class="empty-state">
			<Icon name="heart" size={40} />
			<h2>No saved products</h2>
			<p>Use the heart button on a product to save it here.</p>
			<a class="button" href={resolve('/shop')}>Shop all <Icon name="arrow" size={18} /></a>
		</div>{/if}
</main>
