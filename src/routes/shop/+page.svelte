<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ProductCard from '$lib/components/shop/product-card.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	import { categoryMatches, isClothing, isOnSale } from '$lib/commerce/presentation';
	import LeafAccent from '$lib/components/ui/leaf-accent.svelte';
	import { matchingVariants } from '$lib/commerce/types';
	let { data } = $props();
	let hasClothing = $derived(data.products.some(isClothing));
	let categoryTabs = $derived([
		{ label: 'All products', value: '' },
		{ label: 'Prints', value: 'prints' },
		...(hasClothing
			? [
					{ label: 'Clothing', value: 'clothing' },
					{ label: 'T-shirts', value: 'T-shirt' },
					{ label: 'Hoodies', value: 'Hoodie' }
				]
			: []),
		{ label: 'Sale', value: 'sale' }
	]);
	let query = $state(untrack(() => page.url.searchParams.get('q') ?? ''));
	let finish = $state(untrack(() => page.url.searchParams.get('finish') ?? ''));
	let sort = $state(untrack(() => page.url.searchParams.get('sort') ?? 'featured'));
	let searchInput: HTMLInputElement;
	$effect(() => {
		if (page.url.searchParams.has('search') && searchInput) searchInput.focus();
	});
	let available = $state(false);
	let category = $state(untrack(() => page.url.searchParams.get('category') ?? ''));
	$effect(() => {
		category = page.url.searchParams.get('category') ?? '';
		query = page.url.searchParams.get('q') ?? '';
		finish = page.url.searchParams.get('finish') ?? '';
		sort = page.url.searchParams.get('sort') ?? 'featured';
	});
	let finishOptions = $derived([
		...new Set(
			data.products.flatMap((p) =>
				p.options.filter((o) => /finish|format|style|frame/i.test(o.name)).flatMap((o) => o.values)
			)
		)
	]);
	function visibleVariants(product: (typeof data.products)[number]) {
		return matchingVariants(product, finish).filter((v) => category !== 'sale' || isOnSale(v));
	}
	function lowestPrice(product: (typeof data.products)[number]) {
		return Math.min(...visibleVariants(product).map((v) => Number(v.price.amount)));
	}
	let filtered = $derived.by(() => {
		const found = data.products.filter(
			(p) =>
				categoryMatches(p, category) &&
				(!query.trim() ||
					[p.title, p.description, ...p.tags]
						.join(' ')
						.toLowerCase()
						.includes(query.trim().toLowerCase())) &&
				visibleVariants(p).length > 0 &&
				(!available || visibleVariants(p).some((v) => v.availableForSale))
		);
		if (sort === 'low') found.sort((a, b) => lowestPrice(a) - lowestPrice(b));
		if (sort === 'high') found.sort((a, b) => lowestPrice(b) - lowestPrice(a));
		if (sort === 'az') found.sort((a, b) => a.title.localeCompare(b.title));
		return found;
	});
	function updateUrl() {
		const params = new SvelteURLSearchParams();
		if (category) params.set('category', category);
		if (query) params.set('q', query);
		if (finish) params.set('finish', finish);
		if (sort !== 'featured') params.set('sort', sort);
		void goto(params.size ? resolve(`/shop?${params.toString()}`) : resolve('/shop'), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
</script>

<svelte:head
	><title>Shop prints & {hasClothing ? 'clothing' : 'posters'} — Seal Stuff</title><meta
		name="description"
		content={hasClothing
			? 'Shop prints, posters, framed artwork, T-shirts and hoodies by Ellie Seal.'
			: 'Shop prints, posters and framed artwork by Ellie Seal.'}
	/></svelte:head
>
<main id="main-content" class="shop-page wrap">
	<section class="page-intro shop-intro">
		<LeafAccent size="medium" />
		<h1>Shop</h1>
		<p>
			{hasClothing ? 'Prints, posters and clothing' : 'Prints, posters and framed artwork'} by Ellie Seal.
		</p>
	</section>
	<div class="shop-tabs" aria-label="Product categories">
		{#each categoryTabs as tab (tab.value)}<button
				class:active={category === tab.value}
				aria-pressed={category === tab.value}
				onclick={() => {
					category = tab.value;
					finish = '';
					updateUrl();
				}}>{tab.label}</button
			>{/each}
	</div>
	<form
		class="filter-bar"
		onsubmit={(e) => {
			e.preventDefault();
			updateUrl();
		}}
	>
		<div class="search-input">
			<Icon name="search" size={18} /><label class="sr-only" for="shop-search"
				>Search products</label
			><input
				id="shop-search"
				bind:this={searchInput}
				name="q"
				bind:value={query}
				type="search"
				placeholder="Search products"
				autocomplete="off"
			/><button aria-label="Search" class="icon-button"><Icon name="arrow" size={16} /></button>
		</div>
		<div
			class="filter-select"
			class:filter-hidden={category === 'clothing' ||
				category === 'T-shirt' ||
				category === 'Hoodie'}
		>
			<label for="finish-filter">Finish</label><select
				id="finish-filter"
				bind:value={finish}
				onchange={updateUrl}
				><option value="">All finishes</option><option value="frame">All frames</option
				>{#each finishOptions as option (option)}<option value={option}>{option}</option
					>{/each}</select
			>
		</div>
		<div class="filter-select">
			<label for="sort-order">Sort by</label><select
				id="sort-order"
				bind:value={sort}
				onchange={updateUrl}
				><option value="featured">Collection order</option><option value="low"
					>Price: low to high</option
				><option value="high">Price: high to low</option><option value="az">Name: A–Z</option
				></select
			>
		</div>
	</form>
	<div class="results-bar">
		<p aria-live="polite">
			{filtered.length}
			{filtered.length === 1 ? 'product' : 'products'}
		</p>
		<label><input type="checkbox" bind:checked={available} /> Available only</label>
	</div>
	{#if data.catalogError}<div class="empty-state">
			<h2>Couldn’t load products</h2>
			<p>The shop couldn’t load the collection. Please refresh to try again.</p>
			<button class="button" onclick={() => window.location.reload()}>Try again</button>
		</div>
	{:else if filtered.length}<section class="product-grid collection-grid" aria-label="Products">
			{#each filtered as product, index (product.id)}<ProductCard
					{product}
					{index}
					finishFilter={finish}
					saleOnly={category === 'sale'}
				/>{/each}
		</section>
	{:else}<div class="empty-state">
			<Icon name="search" size={38} />
			<h2>No products found</h2>
			<p>Try another search or clear your filters.</p>
			<button
				class="button secondary"
				onclick={() => {
					query = '';
					category = '';
					finish = '';
					available = false;
					updateUrl();
				}}>Clear filters</button
			>
		</div>{/if}
</main>

<style>
	.shop-intro {
		position: relative;
		overflow: hidden;
	}
	.shop-intro h1,
	.shop-intro p {
		position: relative;
		z-index: 1;
	}
	.filter-select.filter-hidden {
		display: none;
	}
	.shop-tabs {
		display: flex;
		gap: 2rem;
		border-bottom: 1px solid var(--line);
	}
	.shop-tabs button {
		color: var(--muted);
		border: 0;
		border-bottom: 2px solid transparent;
		background: none;
		padding: 1.1rem 0;
		font-size: 0.8rem;
	}
	.shop-tabs button.active {
		color: var(--navy);
		border-bottom-color: var(--navy);
	}
	.filter-bar {
		display: flex;
		gap: 2rem;
		align-items: center;
		padding: 1.5rem 0;
		border-bottom: 1px solid var(--line);
	}
	.search-input {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 0.75rem;
	}
	.search-input input {
		border: 0;
		background: none;
		min-width: 0;
		width: 100%;
		font-size: 0.8rem;
		padding: 0.5rem 0;
	}
	.filter-select {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}
	.filter-select label {
		color: var(--muted);
		font-size: 0.65rem;
		white-space: nowrap;
	}
	select {
		border: 0;
		background-color: #fff8;
		border: 1px solid var(--line);
		border-radius: 6px;
		padding: 0.8rem 2.2rem 0.8rem 0.8rem;
		min-height: 44px;
		font-size: 0.75rem;
		max-width: 180px;
	}
	.results-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 1rem 0 1.75rem;
		font-size: 0.65rem;
		color: var(--muted);
	}
	.results-bar label {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.results-bar input {
		color: var(--navy);
	}
	.collection-grid {
		padding-bottom: 3rem;
	}

	@media (max-width: 760px) {
		.filter-bar {
			flex-wrap: wrap;
			gap: 1rem;
		}
		.search-input {
			flex-basis: 100%;
		}
		.filter-select {
			flex: 1;
			gap: 0.4rem;
		}
		.filter-select label {
			display: none;
		}
		.filter-select select {
			width: 100%;
			max-width: none;
		}
		.shop-tabs {
			gap: 1.3rem;
			overflow: auto;
		}
		.shop-tabs button {
			font-size: 0.68rem;
			white-space: nowrap;
		}
	}
</style>
