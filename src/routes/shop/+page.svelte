<script lang="ts">
	import Catalogue from '$lib/components/shop/catalogue.svelte';
	let { data } = $props();
</script>

<Catalogue
	products={data.products}
	collections={data.collections}
	menu={data.menus.header}
	title={data.content.shopTitle}
	description={data.content.shopText}
	image={data.content.shopImage}
	catalogError={data.catalogError}
/>
