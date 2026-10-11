<script lang="ts">
	import './layout.css';
	import './shop.css';
	import { setContext, untrack } from 'svelte';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
	import CartDrawer from '$lib/components/shop/cart-drawer.svelte';
	import UnderConstruction from '$lib/components/shop/under-construction.svelte';
	import { storefrontOpen } from '$lib/commerce/availability';
	import { SHOP, ShopState } from '$lib/commerce/shop.svelte';
	let { data, children } = $props();
	const shop = new ShopState(untrack(() => data.config));
	setContext(SHOP, shop);
	let artistPage = $derived(page.url.pathname === '/' || page.url.pathname.startsWith('/murals'));
	let shopInitialized = false;
	$effect(() => {
		if (storefrontOpen && !artistPage && !shopInitialized) {
			shopInitialized = true;
			untrack(() => void shop.init(data.products));
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f7f3ec" />
	<meta property="og:site_name" content="Ellie Seal" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.origin + page.url.pathname} />
	<link rel="canonical" href={page.url.origin + page.url.pathname} />
	{#if !artistPage && (!storefrontOpen || !data.config.live)}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>
<a class="skip-link" href="#main-content">Skip to content</a>
<div class="site-shell">
	<SiteHeader />
	{#if storefrontOpen || artistPage}
		{@render children()}
	{:else}
		<UnderConstruction />
	{/if}
	<SiteFooter />
</div>
{#if storefrontOpen && !artistPage}<CartDrawer />{/if}
