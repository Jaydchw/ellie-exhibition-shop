<script lang="ts">
	import Seo from '$lib/components/seo.svelte';
	import { productStructuredData, breadcrumbStructuredData } from '$lib/seo';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useShop } from '$lib/commerce/shop.svelte';
	import { money } from '$lib/commerce/types';
	import ProductMedia from '$lib/components/shop/product-media.svelte';
	import VariantPicker from '$lib/components/shop/variant-picker.svelte';
	import QuantityPicker from '$lib/components/shop/quantity-picker.svelte';
	import {
		isClothing,
		isOriginal,
		isSoldOriginal,
		isOnSale,
		savingsPercent,
		quantityLimit
	} from '$lib/commerce/presentation';
	import ProductCard from '$lib/components/shop/product-card.svelte';
	import Modal from '$lib/components/shop/modal.svelte';
	import ImageViewer from '$lib/components/ui/image-viewer.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	let { data } = $props();
	const shop = useShop();
	let selected = $state<Record<string, string>>({});
	let zoom = $state(false);
	let guide = $state(false);
	let imageIndex = $state(0);
	let product = $derived(data.product);
	let initialVariant = $derived(
		product.variants.find((v) => v.id === page.url.searchParams.get('variant')) ??
			product.variants.find((v) => v.availableForSale) ??
			product.variants[0]
	);
	$effect(() => {
		selected = Object.fromEntries(initialVariant.selectedOptions.map((o) => [o.name, o.value]));
		imageIndex = 0;
	});
	let choices = $derived(
		Object.keys(selected).length
			? selected
			: Object.fromEntries(initialVariant.selectedOptions.map((o) => [o.name, o.value]))
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
	let original = $derived(isOriginal(product));
	let sold = $derived(isSoldOriginal(product));
	let inBag = $derived(original && shop.cart?.lines.some((line) => line.handle === product.handle));
	let step = $derived(original ? 1 : (variant?.quantityRule?.increment ?? 1));
	let maximum = $derived(quantityLimit(product, variant));
	let existingQuantity = $derived(
		shop.cart?.lines
			.filter((line) => line.variant.id === variant?.id)
			.reduce((total, line) => total + line.quantity, 0) ?? 0
	);
	let minimum = $derived(
		original ? 1 : existingQuantity > 0 ? step : (variant?.quantityRule?.minimum ?? 1)
	);
	let remaining = $derived(Math.max(0, maximum - existingQuantity));
	let addMaximum = $derived(minimum + Math.max(0, Math.floor((remaining - minimum) / step)) * step);
	let quantity = $derived(Math.min(minimum, addMaximum));
	let canAdd = $derived(!!variant?.availableForSale && remaining >= minimum);
	let careInstructions = $derived(
		product.careInstructions?.trim() ||
			(original
				? ''
				: clothing
					? 'Follow the garment care label. Wash inside out with similar colours. Do not iron directly over the print.'
					: 'Handle prints with clean, dry hands. Keep away from moisture and direct sunlight. Dust frames with a soft, dry cloth.')
	);
	const printDimensions: Record<string, string> = {
		A4: '21 × 29.7 cm',
		A3: '29.7 × 42 cm'
	};
	let printSizes = $derived(
		product.options
			.find((option) => /^size$/i.test(option.name))
			?.values.filter((value) => printDimensions[value]) ?? []
	);
	let artworkDetails = $derived(
		Object.entries({
			Medium: product.artwork?.medium,
			Dimensions: product.artwork?.dimensions,
			Year: product.artwork?.year,
			Framing: product.artwork?.framing
		}).filter(([, value]) => value)
	);
	function choose(name: string, value: string) {
		const requested = { ...choices, [name]: value };
		const exact = product.variants.find(
			(v) => v.availableForSale && v.selectedOptions.every((o) => requested[o.name] === o.value)
		);
		const next =
			exact ??
			product.variants
				.filter(
					(v) =>
						v.availableForSale &&
						v.selectedOptions.some((o) => o.name === name && o.value === value)
				)
				.sort((a, b) => {
					const matches = (candidate: typeof a) =>
						candidate.selectedOptions.filter((option) => choices[option.name] === option.value)
							.length;
					return matches(b) - matches(a);
				})[0];
		selected = next
			? Object.fromEntries(next.selectedOptions.map((o) => [o.name, o.value]))
			: requested;
		imageIndex = 0;
	}
	let related = $derived(
		data.products
			.filter(
				(p) => p.id !== product.id && isClothing(p) === clothing && isOriginal(p) === original
			)
			.slice(0, 3)
	);
</script>

<Seo
	title={product.seo?.title?.trim() || product.title + ' - Seal Stuff'}
	description={product.seo?.description?.trim() || product.description}
	image={image || product.images[0]}
	type="product"
	structuredData={shop.config.live
		? [
				productStructuredData(page.data.siteUrl || page.url.origin, product),
				breadcrumbStructuredData(page.data.siteUrl || page.url.origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Shop', path: '/shop' },
					{ name: product.title, path: '/shop/' + encodeURIComponent(product.handle) }
				])
			]
		: undefined}
/>
<main id="main-content" class="shop-page wrap">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href={resolve('/shop')}>Shop</a><span>/</span><span>{product.title}</span>
	</nav>
	<section class="product-detail" class:original>
		<div class="product-gallery">
			<button
				class="product-stage"
				class:garment={clothing}
				class:original-stage={original}
				aria-label="Enlarge product image"
				disabled={!image}
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
			<p class="product-category">
				{original
					? 'Original artwork'
					: product.productType || (clothing ? 'Clothing' : 'Art print')} · Ellie Seal
			</p>
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
			{#if original}
				{#each product.description.split(/\n\s*\n/).filter(Boolean) as paragraph, i (i)}
					<p class="product-intro original-description">{paragraph}</p>
				{/each}
				{#if artworkDetails.length}<dl class="artwork-details">
						{#each artworkDetails as [label, value] (label)}<div>
								<dt>{label}</dt>
								<dd>{value}</dd>
							</div>{/each}
					</dl>{/if}
			{:else}
				{#if clothing}<p class="product-intro">{product.description.split('\n\n')[0]}</p>{/if}
				<VariantPicker {product} {choices} onchoose={choose} />
				{#if clothing || printSizes.length}
					<button class="text-button size-link" onclick={() => (guide = true)}
						><Icon name="ruler" size={18} />{clothing ? 'Size & fit' : 'Size guide'}</button
					>
				{/if}
			{/if}
			<div class="buy-row">
				{#if !original && remaining > minimum}<QuantityPicker
						value={quantity}
						min={minimum}
						max={addMaximum}
						{step}
						disabled={shop.busy || !canAdd}
						onchange={(value) => (quantity = value)}
					/>{/if}<button
					class="button"
					disabled={shop.busy || (!canAdd && !inBag && existingQuantity === 0)}
					onclick={() =>
						inBag || (!canAdd && existingQuantity > 0)
							? (shop.open = true)
							: variant && shop.add(product, variant, original ? 1 : quantity)}
					><Icon name={shop.busy && !sold ? 'spinner' : 'bag'} size={19} />{shop.busy && !sold
						? 'Adding…'
						: sold
							? 'Sold'
							: inBag || (!canAdd && existingQuantity > 0)
								? 'View bag'
								: canAdd
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
				{#if !sold}<p><Icon name="truck" size={19} /> Delivery at checkout</p>{/if}
				<p><Icon name="lock" size={19} /> Secure checkout</p>
			</div>
			{#if !original}<details class="help-details">
					<summary>Product details</summary
					>{#each product.description.split('\n\n') as paragraph, i (i)}<p>
							{paragraph}
						</p>{/each}{#if demo && !clothing}<p>
							Available as a poster, matte fine art print, or framed print. Black, natural and white
							frames. A4 and A3 sizes.
						</p>{/if}
				</details>{/if}
			<details class="help-details">
				<summary>Delivery & returns</summary>
				<p>
					{original
						? 'Sent by Ellie. Delivery and collection options are shown at checkout where available.'
						: 'Made to order. Delivery options and costs are shown at checkout. Items may arrive in separate parcels.'}
					<a href={resolve('/help')}>Delivery help</a> ·
					<a href={resolve('/policies')}>Returns policy</a>
				</p>
			</details>
			{#if careInstructions}<details class="help-details">
					<summary>Care instructions</summary>
					{#each careInstructions.split(/\n\s*\n/).filter(Boolean) as paragraph, i (i)}
						<p>{paragraph}</p>
					{/each}
				</details>{/if}
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
{#if image}<ImageViewer
		bind:open={zoom}
		src={image.url}
		alt={image.altText ?? product.title}
		title={product.title}
	/>{/if}
{#if !original}<Modal bind:open={guide} title={clothing ? 'Size & fit' : 'Print sizes'}
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
						>{#each printSizes as size (size)}<tr
								><td>{size}</td><td>{printDimensions[size]}</td></tr
							>{/each}</tbody
					>
				</table>
				<p class="small muted">
					Dimensions are the short and long edges. Frames add to the outside measurements. Check the
					product options for available sizes.
				</p>{/if}
		</div></Modal
	>{/if}

<style>
	.original .original-stage {
		background: color-mix(in srgb, var(--stone) 35%, var(--paper));
		padding: 8%;
	}
	.original-stage :global(.product-photo) {
		height: 100%;
		max-height: 100%;
	}
	.artwork-details {
		margin: 1.8rem 0 2rem;
		font-family: var(--font-sans);
		font-size: 0.75rem;
	}
	.artwork-details > div {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 1rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--line);
	}
	.artwork-details dt {
		color: var(--muted);
	}
	.artwork-details dd {
		margin: 0;
	}
	.original-description {
		white-space: pre-line;
	}
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
		cursor: zoom-in;
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
	}
</style>
