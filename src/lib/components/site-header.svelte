<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { storefrontOpen } from '$lib/commerce/availability';
	import { useShop } from '$lib/commerce/shop.svelte';
	import Icon from './shop/icon.svelte';
	import { isClothing, isOnSale } from '$lib/commerce/presentation';
	import type { Product } from '$lib/commerce/types';
	const shop = useShop();
	let menu = $state(false);
	let hasClothing = $derived(page.data.products?.some(isClothing) ?? false);
	let murals = $derived(page.url.pathname.startsWith('/murals'));
	$effect(() => {
		void page.url.href;
		menu = false;
	});
</script>

{#if !storefrontOpen}
	<header class="artist-header">
		<div class="artist-header__inner wrap">
			<a class="artist-wordmark" href={resolve('/murals')} aria-label="Ellie Seal murals">
				Ellie Seal<span>MURALS & COMMISSIONS</span>
			</a>
			<nav class="artist-navigation" aria-label="Main navigation">
				<a href={resolve('/murals')} aria-current={murals ? 'page' : undefined}>Murals</a>
				<a
					href={resolve('/shop')}
					class="artist-navigation__shop"
					aria-current={page.url.pathname === '/shop' ? 'page' : undefined}>Shop</a
				>
			</nav>
		</div>
	</header>
{:else}
	{#if !murals}<div class="announcement">
			{#if page.data.products?.some((p: Product) => p.variants.some(isOnSale))}<a
					href={resolve('/shop?category=sale')}
					>Selected products on sale <Icon name="arrow" size={14} /></a
				>{:else}Prints{hasClothing ? ' & clothing' : ' & posters'} by Ellie Seal{/if}<span
				>International delivery</span
			>
		</div>{/if}
	<header class="shop-header" class:mural-header={murals}>
		<div class="shop-header__inner wrap">
			<button
				class="icon-button mobile-menu"
				aria-label="Toggle navigation"
				aria-expanded={menu}
				aria-controls="main-nav"
				onclick={() => (menu = !menu)}><Icon name={menu ? 'close' : 'menu'} /></button
			>
			<a
				class="wordmark"
				href={resolve(murals ? '/murals' : '/')}
				aria-label={murals ? 'Ellie Seal murals' : 'Seal Stuff home'}
				>{murals ? 'Ellie Seal' : 'Seal Stuff'}<span
					>{murals ? 'MURALS & COMMISSIONS' : 'BY ELLIE SEAL'}</span
				></a
			>
			<nav id="main-nav" class:expanded={menu} aria-label="Main navigation">
				<a
					href={resolve('/shop')}
					aria-current={page.url.pathname === '/shop' && !page.url.search ? 'page' : undefined}
					>Shop all</a
				>
				<a href={resolve('/shop?category=prints')}>Prints</a>
				{#if hasClothing}<a href={resolve('/shop?category=clothing')}>Clothing</a>{/if}
				<a
					href={resolve('/about')}
					aria-current={page.url.pathname === '/about' ? 'page' : undefined}>About</a
				>
				<a href={resolve('/murals')} class="mural-link" aria-current={murals ? 'page' : undefined}
					>Murals ↗</a
				>
			</nav>
			<div class="header-actions">
				<a class="icon-button" href={resolve('/shop?search=1')} aria-label="Search the shop"
					><Icon name="search" size={20} /></a
				>
				<a class="icon-button account-shortcut" href={resolve('/account')} aria-label="Your account"
					><Icon name="user" size={20} /></a
				>
				<a class="icon-button saved-shortcut" href={resolve('/saved')} aria-label="Saved products"
					><Icon name="heart" size={20} /></a
				>
				<button
					class="icon-button bag-toggle"
					aria-label={`Open bag, ${shop.count} items`}
					onclick={() => (shop.open = true)}
					><Icon name="bag" size={20} /><span>{shop.count}</span></button
				>
			</div>
		</div>
	</header>
{/if}

<style>
	.artist-header {
		position: sticky;
		top: 0;
		z-index: 30;
		border-bottom: 1px solid var(--line);
		background: #f7f3ecf5;
		backdrop-filter: blur(12px);
		color: var(--navy);
	}

	.artist-header__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		min-height: var(--site-header-height);
	}

	.artist-wordmark {
		font-size: 2.3rem;
		font-weight: 600;
		letter-spacing: -0.075em;
		line-height: 0.95;
		text-decoration: none;
		white-space: nowrap;
	}

	.artist-wordmark span {
		display: block;
		margin-top: 0.6rem;
		font-family: var(--font-sans);
		font-size: 0.45rem;
		font-weight: 500;
		letter-spacing: 0.19em;
	}

	.artist-navigation {
		display: flex;
		align-items: center;
		gap: 2rem;
		font-family: var(--font-sans);
		font-size: 0.75rem;
	}

	.artist-navigation a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		text-decoration: none;
		white-space: nowrap;
	}

	.artist-navigation a:hover,
	.artist-navigation a:focus-visible,
	.artist-navigation a[aria-current='page'] {
		text-decoration: underline;
		text-underline-offset: 7px;
	}

	@media (max-width: 600px) {
		.artist-header__inner {
			gap: 0.75rem;
		}

		.artist-wordmark {
			font-size: 1.7rem;
		}

		.artist-wordmark span {
			font-size: 0.34rem;
			letter-spacing: 0.12em;
		}

		.artist-navigation {
			gap: 0.8rem;
			font-size: 0.65rem;
		}

		.artist-navigation a {
			gap: 0.25rem;
		}
	}
</style>
