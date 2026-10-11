<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useShop } from '$lib/commerce/shop.svelte';
	import { money } from '$lib/commerce/types';
	import ProductMedia from '$lib/components/shop/product-media.svelte';
	import VariantPicker from '$lib/components/shop/variant-picker.svelte';
	import QuantityPicker from '$lib/components/shop/quantity-picker.svelte';
	import { isClothing, isOnSale, savingsPercent } from '$lib/commerce/presentation';
	import ProductCard from '$lib/components/shop/product-card.svelte';
	import Modal from '$lib/components/shop/modal.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	let { data } = $props();
	const shop = useShop();
	let selected = $state<Record<string, string>>({});
	let quantity = $state(1);
	let zoom = $state(false);
	let guide = $state(false);
	let imageIndex = $state(0);
	let product = $derived(data.product);
	$effect(() => {
		const initial =
			product.variants.find((v) => v.id === page.url.searchParams.get('variant')) ??
			product.variants.find((v) => v.availableForSale) ??
			product.variants[0];
		selected = Object.fromEntries(initial.selectedOptions.map((o) => [o.name, o.value]));
		imageIndex = 0;
		quantity = 1;
	});
	let choices = $derived(
		Object.keys(selected).length
			? selected
			: Object.fromEntries(
					(
						product.variants.find((v) => v.availableForSale) ?? product.variants[0]
					).selectedOptions.map((o) => [o.name, o.value])
				)
	);
	let variant = $derived(
		product.variants.find((v) => v.selectedOptions.every((o) => choices[o.name] === o.value))
	);
	let finish = $derived(
		Object.entries(choices).find(([key]) => /finish|frame|style/i.test(key))?.[1] ?? 'Print'
	);
	let image = $derived(
		imageIndex === 0 && variant?.image
			? variant.image
			: (product.images[imageIndex] ?? product.images[0])
	);
	let demo = $derived(product.id.startsWith('demo-'));
	let clothing = $derived(isClothing(product));
	function choose(name: string, value: string) {
		const requested = { ...choices, [name]: value };
		const exact = product.variants.find(
			(v) => v.availableForSale && v.selectedOptions.every((o) => requested[o.name] === o.value)
		);
		const next =
			exact ??
			product.variants.find(
				(v) =>
					v.availableForSale && v.selectedOptions.some((o) => o.name === name && o.value === value)
			);
		selected = next
			? Object.fromEntries(next.selectedOptions.map((o) => [o.name, o.value]))
			: requested;
		imageIndex = 0;
	}
	let related = $derived(
		data.products.filter((p) => p.id !== product.id && isClothing(p) === clothing).slice(0, 3)
	);
	let structured = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.title,
			description: product.description,
			image: product.images.map((i) => i.url),
			brand: { '@type': 'Brand', name: 'Seal Stuff' },
			offers: variant
				? {
						'@type': 'Offer',
						price: variant.price.amount,
						priceCurrency: variant.price.currencyCode,
						availability: variant.availableForSale
							? 'https://schema.org/InStock'
							: 'https://schema.org/OutOfStock',
						url: page.url.origin + page.url.pathname
					}
				: undefined
		}).replace(/</g, '\\u003c')
	);
	let structuredMarkup = $derived(
		'<script type="application/ld+json">' + structured + '</' + 'script>'
	);
</script>

<svelte:head
	><title>{product.title} — Seal Stuff</title><meta
		name="description"
		content={product.description.slice(0, 155)}
	/><meta property="og:title" content={product.title + ' — Seal Stuff'} />{#if image}<meta
			property="og:image"
			content={image.url}
		/>{/if}{#if shop.config.live}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON is serialized and all less-than characters are escaped. -->
		{@html structuredMarkup}
	{/if}</svelte:head
>
<main id="main-content" class="shop-page wrap">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href={resolve('/shop')}>Shop</a><span>/</span><span>{product.title}</span>
	</nav>
	<section class="product-detail">
		<div class="product-gallery">
			<button
				class="product-stage"
				class:garment={clothing}
				aria-label="Enlarge product image"
				onclick={() => (zoom = true)}
				><ProductMedia {product} {image} finish={demo ? finish : 'Print'} eager /><span
					class="zoom-label"><Icon name="zoom" size={22} /></span
				></button
			>
			{#if product.images.length > 1}<div class="thumbnails">
					{#each product.images as img, i (img.url)}<button
							class:active={image?.url === img.url}
							aria-label={`View image ${i + 1}`}
							aria-pressed={image?.url === img.url}
							onclick={() => {
								const candidate = product.variants.find((v) => v.image?.url === img.url);
								const colour = candidate?.selectedOptions.find((o) => /colou?r/i.test(o.name));
								if (colour) choose(colour.name, colour.value);
								else imageIndex = i;
							}}><img src={img.url} alt={img.altText ?? product.title} /></button
						>{/each}
				</div>{/if}
		</div>
		<div class="product-options">
			<p class="product-category">{clothing ? product.productType : 'Art print'} · Ellie Seal</p>
			<h1>{product.title}</h1>
			<div class="price-row" aria-live="polite">
				<p class="product-price" class:sale-price={variant && isOnSale(variant)}>
					{variant ? money(variant.price) : 'Unavailable'}{#if variant && isOnSale(variant)}<del
							>{money(variant.compareAtPrice!)}</del
						>{/if}
				</p>
				{#if variant && isOnSale(variant)}<span class="sale-badge inline"
						>Save {savingsPercent(variant)}%</span
					>{/if}
			</div>
			{#if clothing}<p class="product-intro">{product.description.split('\n\n')[0]}</p>{/if}
			<VariantPicker {product} {choices} onchoose={choose} />
			<button class="text-button size-link" onclick={() => (guide = true)}
				><Icon name="ruler" size={18} />{clothing ? 'Size & fit' : 'Size guide'}</button
			>
			<div class="buy-row">
				<QuantityPicker value={quantity} onchange={(value) => (quantity = value)} /><button
					class="button"
					disabled={!variant?.availableForSale || shop.busy}
					onclick={() => variant && shop.add(product, variant, quantity)}
					><Icon name={shop.busy ? 'spinner' : 'bag'} size={19} />{shop.busy
						? 'Adding…'
						: variant?.availableForSale
							? 'Add to bag'
							: 'Unavailable'}</button
				><button
					class="save-product icon-button"
					class:saved={shop.saved.includes(product.handle)}
					aria-label={shop.saved.includes(product.handle) ? 'Unsave product' : 'Save product'}
					aria-pressed={shop.saved.includes(product.handle)}
					onclick={() => shop.toggleSaved(product.handle)}><Icon name="heart" size={21} /></button
				>
			</div>
			<div class="product-promises">
				<p><Icon name="truck" size={19} /> International delivery</p>
				<p><Icon name="lock" size={19} /> Secure checkout</p>
			</div>
			<details class="help-details">
				<summary>Product details</summary
				>{#each product.description.split('\n\n') as paragraph, i (i)}<p>
						{paragraph}
					</p>{/each}{#if demo && !clothing}<p>
						Available as a poster, matte fine art print, or framed print. Black, natural and white
						frames. A4, A3 and A2 sizes.
					</p>{/if}
			</details>
			<details class="help-details">
				<summary>Delivery & returns</summary>
				<p>
					Made to order. Delivery options and costs are shown at checkout. Items may arrive in
					separate parcels. <a href={resolve('/help')}>Delivery help</a> ·
					<a href={resolve('/policies')}>Returns policy</a>
				</p>
			</details>
			<details class="help-details">
				<summary>Care instructions</summary>
				<p>
					{clothing
						? 'Follow the garment care label. Wash inside out with similar colours. Do not iron directly over the print.'
						: 'Handle prints with clean, dry hands. Keep away from moisture and direct sunlight. Dust frames with a soft, dry cloth.'}
				</p>
			</details>
		</div>
	</section>
	{#if related.length}<section class="section">
			<div class="section-heading">
				<h2>You may also like</h2>
				<a class="text-link" href={resolve('/shop')}>Shop all</a>
			</div>
			<div class="product-grid">
				{#each related as item, index (item.id)}<ProductCard product={item} {index} />{/each}
			</div>
		</section>{/if}
</main>
<Modal bind:open={zoom} title={product.title} hideTitle
	><div class="zoom-stage">
		<ProductMedia {product} {image} finish={demo ? finish : 'Print'} />
	</div></Modal
>
<Modal bind:open={guide} title={clothing ? 'Size & fit' : 'Print sizes'}
	><div class="size-guide">
		{#if clothing}{#if product.sizeGuide}<table>
					<thead
						><tr
							>{#each product.sizeGuide.headers as heading (heading)}<th>{heading}</th>{/each}</tr
						></thead
					><tbody
						>{#each product.sizeGuide.rows as row (row[0])}<tr
								>{#each row as cell, i (i)}<td>{cell}</td>{/each}</tr
							>{/each}</tbody
					>
				</table>
				<p class="small">{product.sizeGuide.note}</p>{:else}<p class="small">
					{product.description}
				</p>{/if}
			<p class="small">
				Available sizes: {product.options.find((o) => /size/i.test(o.name))?.values.join(', ')}.
			</p>
			<p class="small muted">
				Need help choosing? <a href={resolve('/help#contact')} onclick={() => (guide = false)}
					>Contact Ellie</a
				>.
			</p>
		{:else}<table>
				<thead><tr><th>Size</th><th>Paper dimensions</th></tr></thead><tbody
					><tr><td>A4</td><td>21 × 29.7 cm</td></tr><tr><td>A3</td><td>29.7 × 42 cm</td></tr><tr
						><td>A2</td><td>42 × 59.4 cm</td></tr
					></tbody
				>
			</table>
			<p class="small muted">
				Dimensions are the short and long edges. Frames add to the outside measurements. Check the
				product options for available sizes.
			</p>{/if}
	</div></Modal
>

<style>
	.product-detail {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 4rem;
		padding-top: 2rem;
	}
	.product-gallery {
		align-self: start;
		position: sticky;
		top: 7rem;
	}
	.product-stage {
		width: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 13%;
		aspect-ratio: 1;
		background: #e5dfd3;
		border: 0;
		color: var(--navy);
		overflow: hidden;
	}
	.product-stage.garment {
		padding: 2%;
	}
	.product-stage :global(.art-display),
	.product-stage :global(.product-photo) {
		transition: transform 0.35s;
	}
	.product-stage:hover :global(.art-display),
	.product-stage:hover :global(.product-photo) {
		transform: scale(1.025);
	}
	.zoom-label {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		background: #f7f3eccf;
		border-radius: 50%;
		padding: 0.7rem;
		display: flex;
	}
	.product-options h1 {
		font-size: clamp(2.6rem, 3.5vw, 3.8rem);
		line-height: 1.06;
		margin-top: 0.65rem;
	}
	.product-category {
		font-size: 0.72rem;
		color: var(--muted);
		margin: 0;
	}
	.price-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 1rem 0 1.5rem;
	}
	.product-price {
		font-size: 1.3rem;
		margin: 0;
	}
	.product-price del {
		margin-left: 0.65rem;
		font-size: 1rem;
		color: var(--muted);
	}
	.product-intro {
		font-size: 0.8rem;
		color: var(--body);
	}
	.size-link {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.72rem;
		margin-bottom: 1rem;
		padding-top: 0;
	}
	.buy-row {
		display: flex;
		gap: 0.6rem;
	}
	.buy-row :global(.quantity) {
		margin: 0;
	}
	.buy-row .button {
		flex: 1;
		padding-inline: 0.8rem;
		gap: 0.6rem;
	}
	.save-product {
		border: 1px solid var(--line);
		border-radius: 6px;
		width: 50px;
		flex-shrink: 0;
	}
	.save-product.saved {
		background: var(--navy);
		color: var(--paper);
	}
	.product-promises {
		display: flex;
		gap: 1.5rem;
		margin: 1.1rem 0 1.5rem;
	}
	.product-promises p {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.66rem;
		color: var(--muted);
		margin: 0;
	}
	.thumbnails {
		display: flex;
		gap: 0.6rem;
		margin-top: 1rem;
		overflow: auto;
	}
	.thumbnails button {
		width: 75px;
		height: 75px;
		border: 1px solid transparent;
		background: var(--stone);
		padding: 0.2rem;
		flex-shrink: 0;
		transition: border-color 0.2s;
	}
	.thumbnails button.active {
		border-color: var(--navy);
	}
	.thumbnails img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.zoom-stage {
		height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4%;
	}
	.zoom-stage :global(.art-display) {
		max-width: 100%;
		max-height: 100%;
	}
	.size-guide table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-sans);
		font-size: 0.8rem;
	}
	.size-guide th,
	.size-guide td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid var(--line);
	}
	@media (max-width: 1000px) {
		.product-detail {
			gap: 2rem;
		}
		.buy-row {
			flex-wrap: wrap;
		}
		.buy-row .button {
			min-width: 130px;
		}
	}
	@media (max-width: 760px) {
		.product-detail {
			grid-template-columns: 1fr;
			gap: 1.8rem;
			padding-top: 1.3rem;
		}
		.product-gallery {
			position: static;
		}
		.product-stage {
			aspect-ratio: 1.12;
		}
		.product-options h1 {
			font-size: 2.8rem;
		}
		.breadcrumb {
			font-size: 0.6rem;
			flex-wrap: wrap;
		}
		.product-promises {
			gap: 1rem;
		}
		.buy-row .button {
			min-width: 0;
		}
		.zoom-stage {
			height: 60vh;
		}
	}
</style>
