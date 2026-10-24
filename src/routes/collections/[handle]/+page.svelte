<script lang="ts">
	import Catalogue from '$lib/components/shop/catalogue.svelte';
	let { data } = $props();
</script>

<Catalogue
	products={data.products}
	collections={data.collections}
	menu={data.menus.header}
	collection={data.collection}
	title={data.collection?.title ?? 'Collection'}
	description={data.collection?.description ?? ''}
	image={data.collection?.image ?? null}
	catalogError={data.catalogError}
/>
