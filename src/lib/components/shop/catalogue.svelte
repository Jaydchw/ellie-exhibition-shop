<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Collection, MenuLink, Product, ProductImage } from '$lib/commerce/types';
	import { matchingVariants } from '$lib/commerce/types';
	import { categoryMatches, isOriginal, isOnSale } from '$lib/commerce/presentation';
	import { collectionUrl } from '$lib/commerce/collection-navigation';
	import ProductCard from './product-card.svelte';
	import Icon from './icon.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Seo from '$lib/components/seo.svelte';
	import ImageViewer from '$lib/components/ui/image-viewer.svelte';
	import { breadcrumbStructuredData, collectionStructuredData } from '$lib/seo';
	let {
		products,
		collections,
		menu,
		collection = null,
		title = 'Shop',
		description = '',
		image = null,
		catalogError = false
	}: {
		products: Product[];
		collections: Collection[];
		menu?: MenuLink[];
		collection?: Collection | null;
		title?: string;
		description?: string;
		image?: ProductImage | null;
		catalogError?: boolean;
	} = $props();
	function collectionLinks(links: MenuLink[]): MenuLink[] {
		return links.flatMap((link) => {
			const url = collectionUrl(link.url, collections);
			return [
				...(url.startsWith('/collections/') ? [{ ...link, url }] : []),
				...collectionLinks(link.items)
			];
		});
	}
	let tabs = $derived.by(() => {
		const links = collectionLinks(menu ?? []);
		const source = [
			...links.map((link) => ({ label: link.title, url: link.url })),
			...collections.map((item) => ({
				label: item.title,
				url: `/collections/${encodeURIComponent(item.handle)}`
			}))
		];
		return source.filter(
			(item, index) => source.findIndex((other) => other.url === item.url) === index
		);
	});
	let query = $state(untrack(() => page.url.searchParams.get('q') ?? ''));
	let heroZoom = $state(false);
	let finish = $state(untrack(() => page.url.searchParams.get('finish') ?? ''));
	let sort = $state(untrack(() => page.url.searchParams.get('sort') ?? 'featured'));
	let available = $state(untrack(() => page.url.searchParams.get('available') === '1'));
	let searchInput: HTMLInputElement;
	let category = $derived(page.url.searchParams.get('category') ?? '');
	let tags = $derived(page.url.searchParams.getAll('tag'));
	function activeTab(url: string) {
		const [path, search = ''] = url.split('?');
		const tabTags = new SvelteURLSearchParams(search).getAll('tag');
		return (
			page.url.pathname === path &&
			tabTags.length === tags.length &&
			tabTags.every((tag) => tags.includes(tag))
		);
	}
	let gallery = $derived(
		!!collection &&
			(collection.handle === 'originals' || (products.length > 0 && products.every(isOriginal)))
	);
	$effect(() => {
		query = page.url.searchParams.get('q') ?? '';
		finish = page.url.searchParams.get('finish') ?? '';
		sort = page.url.searchParams.get('sort') ?? 'featured';
		available = page.url.searchParams.get('available') === '1';
	});
	$effect(() => {
		if (page.url.searchParams.has('search') && searchInput) searchInput.focus();
	});
	let finishOptions = $derived([
		...new Set(
			products.flatMap((product) =>
				product.options
					.filter((option) => /finish|format|style|frame/i.test(option.name))
					.flatMap((option) => option.values)
			)
		)
	]);
	function visibleVariants(product: Product) {
		return matchingVariants(product, finish).filter(
			(variant) => category !== 'sale' || isOnSale(variant)
		);
	}
	function lowestPrice(product: Product) {
		return Math.min(...visibleVariants(product).map((variant) => Number(variant.price.amount)));
	}
	let filtered = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		const found = products.filter(
			(product) =>
				categoryMatches(product, category) &&
				tags.every((tag) =>
					product.tags.some((value) => value.toLowerCase() === tag.toLowerCase())
				) &&
				(!needle ||
					[product.title, product.description, ...product.tags]
						.join(' ')
						.toLowerCase()
						.includes(needle)) &&
				visibleVariants(product).length > 0 &&
				(!available || visibleVariants(product).some((variant) => variant.availableForSale))
		);
		if (sort === 'low') found.sort((a, b) => lowestPrice(a) - lowestPrice(b));
		if (sort === 'high') found.sort((a, b) => lowestPrice(b) - lowestPrice(a));
		if (sort === 'az') found.sort((a, b) => a.title.localeCompare(b.title));
		return found;
	});
	let filteredState = $derived(
		!!query || !!finish || available || sort !== 'featured' || !!category || tags.length > 0
	);
	function updateUrl() {
		const params = new SvelteURLSearchParams();
		if (category) params.set('category', category);
		for (const tag of tags) params.append('tag', tag);
		if (query) params.set('q', query);
		if (finish) params.set('finish', finish);
		if (sort !== 'featured') params.set('sort', sort);
		if (available) params.set('available', '1');
		const path = collection ? `/collections/${encodeURIComponent(collection.handle)}` : '/shop';
		void goto(resolve((path + (params.size ? `?${params.toString()}` : '')) as '/shop'), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
	function clearFilters() {
		void goto(
			resolve(
				(collection ? `/collections/${encodeURIComponent(collection.handle)}` : '/shop') as '/shop'
			),
			{
				replaceState: true,
				noScroll: true,
				keepFocus: true
			}
		);
	}
</script>

<Seo
	title={collection?.seo?.title?.trim() || `${title} - Seal Stuff`}
	description={collection?.seo?.description?.trim() ||
		description ||
		`${title} by Ellie Seal. Explore original paintings, art prints and framed artwork.`}
	image={image || products[0]?.images[0]}
	noindex={catalogError || products.length === 0}
	structuredData={catalogError
		? undefined
		: [
				collectionStructuredData(page.data.siteUrl || page.url.origin, title, filtered, collection),
				breadcrumbStructuredData(page.data.siteUrl || page.url.origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Shop', path: '/shop' },
					...(collection
						? [
								{
									name: collection.title,
									path: `/collections/${encodeURIComponent(collection.handle)}`
								}
							]
						: [])
				])
			]}
/>

<main id="main-content" class="shop-page wrap" class:gallery>
	<section class="catalogue-intro" class:with-image={!!image}>
		<div class="catalogue-intro__copy">
			{#if gallery}<p class="gallery-byline">Original paintings by Ellie Seal</p>{/if}
			<h1>{title}</h1>
			{#if description}<p>{description}</p>{/if}
		</div>
		{#if image}<button
				type="button"
				class="catalogue-intro__image"
				aria-label={`Enlarge ${image.altText || title}`}
				onclick={() => (heroZoom = true)}
			>
				<img src={image.url} alt={image.altText || title} fetchpriority="high" />
			</button>{/if}
	</section>
	<nav class="collection-tabs" aria-label="Shop collections">
		<a
			href={resolve('/shop')}
			class:active={!collection && !category}
			aria-current={!collection && !category ? 'page' : undefined}>Shop all</a
		>
		{#each tabs as tab (tab.url)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Collection URLs are local and resolved here. -->
			<a
				href={resolve(tab.url as '/shop')}
				class:active={activeTab(tab.url)}
				aria-current={activeTab(tab.url) ? 'page' : undefined}>{tab.label}</a
			>
		{/each}
	</nav>
	<form
		class="filter-bar"
		onsubmit={(event) => {
			event.preventDefault();
			updateUrl();
		}}
	>
		<div class="catalogue-search">
			<Icon name="search" size={18} />
			<label class="sr-only" for="shop-search">Search artwork</label>
			<input
				id="shop-search"
				bind:this={searchInput}
				name="q"
				bind:value={query}
				type="search"
				placeholder="Search artwork"
				autocomplete="off"
			/>
			<button class="icon-button" aria-label="Search"><Icon name="arrow" size={16} /></button>
		</div>
		{#if finishOptions.length && !gallery}
			<div class="filter-select">
				<Select
					id="finish-filter"
					label="Finish"
					value={finish}
					options={[
						{ value: '', label: 'All finishes' },
						...finishOptions.map((option) => ({ value: option, label: option }))
					]}
					hideLabel
					compact
					onchange={(value) => {
						finish = value;
						updateUrl();
					}}
				/>
			</div>
		{/if}
		<div class="filter-select">
			<Select
				id="sort-order"
				label="Sort artwork"
				value={sort}
				options={[
					{ value: 'featured', label: 'Featured' },
					{ value: 'low', label: 'Price: low to high' },
					{ value: 'high', label: 'Price: high to low' },
					{ value: 'az', label: 'Name: A-Z' }
				]}
				hideLabel
				compact
				onchange={(value) => {
					sort = value;
					updateUrl();
				}}
			/>
		</div>
	</form>
	<div class="results-bar">
		<p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</p>
		<div>
			{#if filteredState}<button class="clear-filters" onclick={clearFilters}>Clear filters</button
				>{/if}
			<label
				><input type="checkbox" bind:checked={available} onchange={updateUrl} /> Available only</label
			>
		</div>
	</div>
	{#if catalogError}
		<div class="empty-state">
			<h2>Couldn't load the artwork</h2>
			<button class="button secondary" onclick={() => window.location.reload()}>Try again</button>
		</div>
	{:else if filtered.length}
		<section
			class="product-grid collection-grid"
			aria-label={gallery ? 'Original artwork' : 'Artwork'}
		>
			{#each filtered as product, index (product.id)}
				<ProductCard
					{product}
					{index}
					{gallery}
					finishFilter={finish}
					saleOnly={category === 'sale'}
				/>
			{/each}
		</section>
	{:else}
		<div class="empty-state">
			<h2>{filteredState ? 'No pieces found' : 'More art soon.'}</h2>
			{#if filteredState}<button class="button secondary" onclick={clearFilters}
					>Clear filters</button
				>{/if}
		</div>
	{/if}
</main>
{#if image}<ImageViewer bind:open={heroZoom} src={image.url} alt={image.altText || title} />{/if}

<style>
	.catalogue-intro {
		padding: 2.5rem 0 1.75rem;
	}
	.catalogue-intro__copy {
		position: relative;
		overflow: clip;
	}
	.catalogue-intro h1 {
		position: relative;
		z-index: 1;
		margin: 0 0 0.65rem;
		max-width: 30ch;
		font-size: clamp(2rem, 3vw, 2.75rem);
		line-height: 1.1;
		letter-spacing: -0.035em;
		text-wrap: pretty;
	}
	.catalogue-intro p {
		position: relative;
		z-index: 1;
		max-width: 40rem;
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.65;
		color: var(--body);
		white-space: pre-line;
	}
	.catalogue-intro.with-image {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 8rem;
		gap: 2rem;
		align-items: center;
	}
	.catalogue-intro__image {
		width: 7rem;
		height: 7rem;
		border: 0;
		padding: 0;
		background: transparent;
		cursor: zoom-in;
		max-height: 7rem;
		overflow: hidden;
	}
	.catalogue-intro__image img {
		display: block;
		width: 100%;
		height: 100%;
		max-height: 7rem;
		object-fit: contain;
	}
	.collection-tabs {
		display: flex;
		gap: 1.75rem;
		border-bottom: 1px solid var(--line);
		overflow-x: auto;
	}
	.collection-tabs a {
		flex-shrink: 0;
		color: var(--muted);
		border-bottom: 2px solid transparent;
		padding: 0.8rem 0;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		text-decoration: none;
		transition: color 180ms;
	}
	.collection-tabs a.active,
	.collection-tabs a:hover {
		color: var(--navy);
		border-bottom-color: var(--navy);
	}
	.filter-bar {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.85rem 0;
		border-bottom: 1px solid var(--line);
	}
	.catalogue-search {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 0.6rem;
		min-width: 0;
		max-width: 28rem;
		margin-right: auto;
		padding-left: 0.75rem;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--paper);
	}
	.catalogue-search:focus-within {
		border-color: var(--moss);
	}
	.catalogue-search input {
		border: 0;
		background: none;
		min-width: 0;
		width: 100%;
		padding: 0.6rem 0;
		font-size: 0.8rem;
	}
	.filter-select {
		max-width: 13rem;
	}
	.results-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin: 0.35rem 0 1.25rem;
		color: var(--muted);
		font-size: 0.68rem;
	}
	.results-bar > div,
	.results-bar label {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.results-bar > div {
		gap: 1.5rem;
	}
	.results-bar input {
		color: var(--navy);
	}
	.clear-filters {
		min-height: 44px;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font-size: inherit;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.collection-grid {
		padding-bottom: 5rem;
	}
	.gallery .catalogue-intro {
		position: relative;
		padding: 2.75rem 0 2rem;
		text-align: center;
	}
	.gallery .catalogue-intro.with-image {
		grid-template-columns: minmax(0, 1fr) 8rem;
		gap: 2rem;
	}
	.gallery .catalogue-intro h1 {
		max-width: none;
		margin: 0.65rem 0;
		font-size: clamp(2.5rem, 4vw, 3.5rem);
		letter-spacing: -0.045em;
	}
	.gallery .catalogue-intro p {
		margin-inline: auto;
		max-width: 34rem;
	}
	.gallery .catalogue-intro .gallery-byline {
		font-size: 0.62rem;
		letter-spacing: 0.17em;
		text-transform: uppercase;
		color: var(--moss);
	}
	.gallery .catalogue-intro__image {
		max-width: 8rem;
		margin-inline: auto;
	}
	.gallery .collection-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: clamp(3rem, 5vw, 5rem) clamp(2rem, 5vw, 5rem);
		padding: 1.5rem 0 5rem;
	}
	.gallery .collection-grid :global(.product-card:nth-of-type(even)) {
		margin-top: 3rem;
	}
	.gallery .collection-grid :global(.product-card__visual) {
		aspect-ratio: 1.12;
		background: color-mix(in srgb, var(--stone) 35%, var(--paper));
		overflow: hidden;
	}
	.gallery .collection-grid :global(.product-card__image) {
		height: 100%;
		min-height: 0;
		padding: 8%;
	}
	.gallery .collection-grid :global(.product-photo) {
		height: 100%;
		max-height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 12px 12px #34281a18);
	}
	.gallery .collection-grid :global(.product-card__price) {
		padding-top: 0.5rem;
	}
	@media (max-width: 760px) {
		.catalogue-intro {
			padding: 1.75rem 0 1.25rem;
		}
		.catalogue-intro.with-image,
		.gallery .catalogue-intro.with-image {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		.catalogue-intro__image {
			display: none;
		}
		.collection-tabs {
			gap: 1.5rem;
		}
		.filter-bar {
			flex-wrap: wrap;
			gap: 0.25rem 0.5rem;
		}
		.catalogue-search {
			flex-basis: 100%;
			max-width: none;
		}
		.filter-select {
			flex: 1;
			max-width: none;
		}
		.results-bar > div {
			gap: 0.9rem;
		}
		.gallery .collection-grid {
			gap: 3rem 1.5rem;
			padding-top: 1rem;
			padding-bottom: 4rem;
		}
		.gallery .collection-grid :global(.product-card__image) {
			padding: 8%;
		}
		.gallery .collection-grid :global(.product-card:nth-of-type(even)) {
			margin-top: 2rem;
		}
	}
	@media (max-width: 500px) {
		.gallery .collection-grid {
			grid-template-columns: 1fr;
		}
		.gallery .collection-grid :global(.product-card:nth-of-type(even)) {
			margin-top: 0;
		}
	}
</style>
