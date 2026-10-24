<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useShop } from '$lib/commerce/shop.svelte';
	import type { MenuLink } from '$lib/commerce/types';
	import Icon from './shop/icon.svelte';
	import NavigationLink from './navigation-link.svelte';
	const shop = useShop();
	let menu = $state(false);
	let navigationElement = $state<HTMLElement>();
	let navigationToggle = $state<HTMLButtonElement>();
	let artistPage = $derived(
		!!page.data.hostedShopUrl ||
			page.url.pathname === '/' ||
			page.url.pathname.startsWith('/murals')
	);
	const fallback: MenuLink[] = [
		{ id: 'home', title: 'Home', url: '/', items: [] },
		{ id: 'shop', title: 'Shop all', url: '/shop', items: [] },
		{ id: 'prints', title: 'Prints', url: '/collections/prints', items: [] },
		{ id: 'originals', title: 'Originals', url: '/collections/originals', items: [] },
		{ id: 'about', title: 'About', url: '/about', items: [] },
		{ id: 'murals', title: 'Murals', url: '/murals', items: [] }
	];
	let navigation = $derived(page.data.menus?.header ?? fallback);
	$effect(() => {
		void page.url.href;
		menu = false;
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key !== 'Escape') return;
		const target = event.target instanceof Element ? event.target : null;
		const group = target?.closest<HTMLDetailsElement>('details[open]');
		if (group && navigationElement?.contains(group)) {
			group.open = false;
			group.querySelector('summary')?.focus();
		} else if (menu) {
			menu = false;
			navigationToggle?.focus();
		}
	}}
/>

<header class="site-header">
	<div class="site-header__inner wrap">
		<a
			class="site-wordmark"
			href={artistPage ? resolve('/') : resolve('/shop')}
			aria-label={artistPage ? 'Ellie Seal home' : 'Seal Stuff shop'}
		>
			{artistPage ? 'Ellie Seal' : 'Seal Stuff'}
			<span>{artistPage ? 'ART, PRINTS & MURALS' : 'BY ELLIE SEAL'}</span>
		</a>
		<nav
			id="main-nav"
			class:expanded={menu}
			aria-label="Main navigation"
			bind:this={navigationElement}
		>
			<ul>
				{#each navigation as link (link.id)}
					<li><NavigationLink {link} /></li>
				{/each}
			</ul>
			{#if !artistPage}
				<div class="navigation-utilities">
					<a href={resolve('/saved')}>Saved pieces</a>
					<a href={resolve('/account')}>Your account</a>
				</div>
			{/if}
		</nav>
		<div class="site-actions">
			<a
				class="icon-button search-shortcut"
				href={resolve('/shop?search=1')}
				aria-label="Search the shop"><Icon name="search" size={20} /></a
			>
			{#if !artistPage}
				<a class="icon-button saved-link" href={resolve('/saved')} aria-label="Saved pieces"
					><Icon name="heart" size={20} /></a
				>
				<a class="icon-button account-shortcut" href={resolve('/account')} aria-label="Your account"
					><Icon name="user" size={20} /></a
				>
				<button
					class="icon-button bag-toggle"
					aria-label={`Open bag, ${shop.count} items`}
					onclick={() => (shop.open = true)}
					><Icon name="bag" size={20} /><span>{shop.count}</span></button
				>
			{/if}
			<button
				class="icon-button navigation-toggle"
				bind:this={navigationToggle}
				aria-label={menu ? 'Close navigation' : 'Open navigation'}
				aria-expanded={menu}
				aria-controls="main-nav"
				onclick={() => (menu = !menu)}><Icon name={menu ? 'close' : 'menu'} /></button
			>
		</div>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 30;
		border-bottom: 1px solid var(--line);
		background: #f7f3ecf5;
		backdrop-filter: blur(12px);
		color: var(--navy);
	}
	.site-header__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		min-height: var(--site-header-height);
	}
	.site-wordmark {
		flex-shrink: 0;
		font-size: 2.3rem;
		font-weight: 600;
		letter-spacing: -0.075em;
		line-height: 0.95;
		text-decoration: none;
		white-space: nowrap;
	}
	.site-wordmark span {
		display: block;
		margin-top: 0.6rem;
		font-family: var(--font-sans);
		font-size: 0.45rem;
		font-weight: 500;
		letter-spacing: 0.19em;
	}
	nav {
		min-width: 0;
	}
	nav > ul {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0 clamp(0.8rem, 1.7vw, 1.8rem);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.site-actions {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		gap: 0.15rem;
	}
	.navigation-toggle {
		display: none;
	}
	.navigation-utilities {
		display: none;
	}
	@media (max-width: 1050px) {
		.site-header__inner {
			gap: 1rem;
		}
		.navigation-toggle {
			display: inline-flex;
		}
		nav {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			max-height: calc(100dvh - var(--site-header-height));
			overflow-y: auto;
			padding: 1rem max(1.5rem, calc((100vw - var(--content-width)) / 2));
			background: var(--paper);
			border-bottom: 1px solid var(--line);
		}
		nav.expanded {
			display: block;
		}
		nav > ul {
			display: block;
		}
		.saved-link {
			display: none;
		}
		.navigation-utilities {
			display: grid;
			border-top: 1px solid var(--line);
			margin-top: 0.75rem;
			padding-top: 0.75rem;
		}
		.navigation-utilities a {
			display: flex;
			align-items: center;
			min-height: 44px;
			font-family: var(--font-sans);
			font-size: 0.8rem;
			text-decoration: none;
		}
	}
	@media (max-width: 600px) {
		.site-wordmark {
			font-size: 2rem;
		}
		.site-wordmark span {
			font-size: 0.4rem;
		}
		.account-shortcut {
			display: none;
		}
	}
</style>
