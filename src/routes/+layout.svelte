<script lang="ts">
	import './layout.css';
	import './shop.css';
	import { setContext, untrack } from 'svelte';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import portrait from '$lib/assets/images/murals/ellie-seal-mural-artist.png';
	import { safeJsonLd } from '$lib/seo';
	import { siteIdentity } from '$lib/content/identity';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';
	import CartDrawer from '$lib/components/shop/cart-drawer.svelte';
	import PrivacySettings from '$lib/components/privacy-settings.svelte';
	import Toasts from '$lib/components/ui/toasts.svelte';
	import { SHOP, ShopState } from '$lib/commerce/shop.svelte';
	let { data, children } = $props();
	const shop = new ShopState(untrack(() => data.config));
	setContext(SHOP, shop);
	let artistPage = $derived(
		!!data.hostedShopUrl || page.url.pathname === '/' || page.url.pathname.startsWith('/murals')
	);
	let shopInitialized = false;
	let identityMarkup = $derived(
		'<script type="application/ld+json">' +
			safeJsonLd(siteIdentity(data.siteUrl || page.url.origin, portrait, data.hostedShopUrl)) +
			'</' +
			'script>'
	);
	$effect(() => {
		if (!artistPage && !shopInitialized) {
			shopInitialized = true;
			untrack(() => void shop.init(data.products));
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#f7f3ec" />
	<meta property="og:site_name" content="Ellie Seal" />
	{#if page.url.pathname === '/' || page.url.pathname === '/about'}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD escapes script delimiters. -->
		{@html identityMarkup}
	{/if}
</svelte:head>
<a class="skip-link" href="#main-content">Skip to content</a>
<div class="site-shell" class:home-shell={page.url.pathname === '/'}>
	<SiteHeader />
	{@render children()}
	<SiteFooter />
</div>
{#if !artistPage}<CartDrawer />{/if}
<Toasts />
{#if !data.hostedShopUrl}<PrivacySettings config={data.config} />{/if}

<style>
	.home-shell {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		min-height: 100dvh;
	}
</style>
