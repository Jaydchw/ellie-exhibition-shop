<script lang="ts">
	import { resolve } from '$app/paths';
	import { isClothing, isOnSale } from '$lib/commerce/presentation';
	import ProductCard from '$lib/components/shop/product-card.svelte';
	import ProductMedia from '$lib/components/shop/product-media.svelte';
	import LeafAccent from '$lib/components/ui/leaf-accent.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	import mural from '$lib/assets/images/murals/botanical-kitchen-mural.jpg';
	let { data } = $props();
	let prints = $derived(data.products.filter((p) => !isClothing(p)));
	let clothing = $derived(data.products.filter(isClothing));
	let sale = $derived(data.products.some((p) => p.variants.some(isOnSale)));
</script>

<svelte:head
	><title>Seal Stuff — Prints & {clothing.length ? 'clothing' : 'posters'} by Ellie Seal</title
	><meta
		name="description"
		content={clothing.length
			? 'Art prints, framed prints, T-shirts and hoodies by Ellie Seal. Shop the Seal Stuff collection.'
			: 'Art prints, posters and framed prints by Ellie Seal. Shop the Seal Stuff collection.'}
	/></svelte:head
>
<main id="main-content" class="shop-page">
	<section class="home-hero">
		<div class="wrap hero-layout">
			<div class="hero-copy">
				<h1>Prints &<br />{clothing.length ? 'clothing.' : 'posters.'}</h1>
				<p>
					Artwork by Ellie Seal.<br />{clothing.length
						? 'Posters, framed prints and unisex clothing.'
						: 'Available unframed or ready to hang.'}
				</p>
				<div class="hero-links">
					<a class="button" href={resolve('/shop')}>Shop all <Icon name="arrow" size={18} /></a><a
						class="text-link"
						href={resolve('/about')}>About Ellie</a
					>
				</div>
				{#if sale}<a class="hero-sale" href={resolve('/shop?category=sale')}
						><Icon name="tag" size={18} /> Selected products on sale <Icon
							name="arrow"
							size={16}
						/></a
					>{/if}
			</div>
			<div class="hero-art">
				<LeafAccent side="right" size="large" />
				{#if prints[0]}<a
						class="hero-frame main-frame"
						href={resolve('/shop/[handle]', { handle: prints[0].handle })}
						aria-label={`Shop ${prints[0].title}`}
						><ProductMedia product={prints[0]} finish="Natural frame" eager /></a
					>{/if}
				{#if prints[3]}<a
						class="hero-frame second-frame"
						href={resolve('/shop/[handle]', { handle: prints[3].handle })}
						aria-label={`Shop ${prints[3].title}`}
						><ProductMedia product={prints[3]} finish="Black frame" eager /></a
					>{/if}
			</div>
		</div>
	</section>
	<div class="category-strip wrap">
		<a href={resolve('/shop?category=prints')}><Icon name="frame" size={21} /> Prints & posters</a
		><a href={resolve('/shop?finish=frame')}><Icon name="frame" size={21} /> Framed prints</a
		>{#if clothing.length}<a href={resolve('/shop?category=clothing')}
				><Icon name="shirt" size={21} /> T-shirts & hoodies</a
			>{/if}<a href={resolve('/help')}><Icon name="globe" size={21} /> International delivery</a>
	</div>
	<section class="section wrap">
		<div class="section-heading">
			<h2>Prints</h2>
			<a class="text-link" href={resolve('/shop?category=prints')}>View all prints</a>
		</div>
		{#if data.catalogError}<p class="error-message">
				Products could not be loaded. Please refresh to try again.
			</p>{:else if !prints.length}<p>No prints available.</p>{:else}<div class="product-grid">
				{#each prints.slice(0, 3) as product, index (product.id)}<ProductCard
						{product}
						{index}
					/>{/each}
			</div>{/if}
	</section>
	{#if clothing.length}<section class="clothing-section">
			<div class="section wrap">
				<div class="section-heading">
					<h2>T-shirts & hoodies</h2>
					<a class="text-link" href={resolve('/shop?category=clothing')}>View all clothing</a>
				</div>
				<div class="product-grid">
					{#each clothing.slice(0, 3) as product, index (product.id)}<ProductCard
							{product}
							{index}
						/>{/each}
				</div>
			</div>
		</section>{/if}
	<section class="mural-teaser wrap">
		<img src={mural} alt="Botanical kitchen mural painted by Ellie Seal" loading="lazy" />
		<div>
			<h2>Murals by<br />Ellie Seal</h2>
			<p>Hand-painted murals for homes and businesses.</p>
			<a class="button secondary" href={resolve('/murals')}
				>View murals <Icon name="external" size={18} /></a
			>
		</div>
	</section>
</main>

<style>
	.home-hero {
		overflow: hidden;
		border-bottom: 1px solid var(--line);
	}
	.hero-layout {
		display: grid;
		grid-template-columns: 0.85fr 1.15fr;
		align-items: center;
		min-height: 570px;
		gap: 2rem;
	}
	.hero-copy {
		padding-block: 3rem;
		position: relative;
		z-index: 1;
	}
	.hero-copy h1 {
		font-size: clamp(5rem, 8vw, 8rem);
		line-height: 0.9;
		margin: 0 0 1.6rem;
	}
	.hero-copy p {
		font-size: 0.9rem;
		color: var(--body);
		margin-bottom: 2rem;
	}
	.hero-links {
		display: flex;
		align-items: center;
		gap: 1.8rem;
	}
	.hero-sale {
		display: flex;
		gap: 0.65rem;
		align-items: center;
		text-decoration: none;
		font-family: var(--font-sans);
		font-size: 0.72rem;
		color: var(--sale);
		margin-top: 2rem;
	}
	.hero-art {
		position: relative;
		height: 520px;
	}
	.hero-frame {
		position: absolute;
		display: block;
		transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
	}
	.hero-frame:hover {
		transform: translateY(-5px) rotate(0);
	}
	.main-frame {
		width: 76%;
		left: 0;
		top: 12%;
		transform: rotate(-5deg);
	}
	.second-frame {
		width: 54%;
		right: -1%;
		bottom: 11%;
		transform: rotate(6deg);
	}
	.category-strip {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 1.3rem;
	}
	.category-strip a {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-sans);
		font-size: 0.7rem;
		text-decoration: none;
	}
	.category-strip a:hover {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.clothing-section {
		background: #eee9e0;
	}
	.mural-teaser {
		display: grid;
		grid-template-columns: 1fr 1fr;
		background: var(--sage-light);
		margin-block: 5rem;
	}
	.mural-teaser img {
		width: 100%;
		height: 320px;
		object-fit: cover;
	}
	.mural-teaser > div {
		padding: 2.5rem;
		align-self: center;
	}
	.mural-teaser p {
		font-size: 0.8rem;
		margin-bottom: 1.5rem;
	}
	@media (max-width: 760px) {
		.hero-layout {
			grid-template-columns: 1fr;
			gap: 0;
			min-height: 0;
		}
		.hero-copy {
			padding-block: 2.5rem 0;
		}
		.hero-copy h1 {
			font-size: 4.8rem;
		}
		.hero-copy p {
			margin-bottom: 1.5rem;
		}
		.hero-sale {
			margin-top: 1.3rem;
		}
		.hero-art {
			height: 340px;
			margin-top: 0.5rem;
		}
		.main-frame {
			width: 70%;
			top: 12%;
			left: 2%;
		}
		.second-frame {
			width: 48%;
			right: 3%;
			bottom: 12%;
		}
		.category-strip {
			flex-wrap: wrap;
			justify-content: flex-start;
			gap: 1.2rem 2rem;
		}
		.category-strip a {
			font-size: 0.68rem;
		}
		.category-strip a:last-child {
			display: none;
		}
		.mural-teaser {
			grid-template-columns: 1fr;
			margin-block: 3rem;
		}
		.mural-teaser img {
			height: 240px;
		}
		.mural-teaser > div {
			padding: 2rem;
		}
	}
</style>
