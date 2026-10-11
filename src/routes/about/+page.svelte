<script lang="ts">
	import { resolve } from '$app/paths';
	import { artistBio } from '$lib/bio';
	import { shopCopy } from '$lib/content/shop';
	import { page } from '$app/state';
	import { isClothing } from '$lib/commerce/presentation';
	let hasClothing = $derived(page.data.products?.some(isClothing) ?? false);
	import Icon from '$lib/components/shop/icon.svelte';
	import art from '$lib/assets/images/art-4.png';
</script>

<svelte:head
	><title>The story behind Seal Stuff — Meet Ellie Seal</title><meta
		name="description"
		content="Meet Ellie Seal, the artist behind Seal Stuff. Artwork inspired by dance and movement."
	/></svelte:head
>
<main id="main-content" class="shop-page wrap">
	<section class="about-hero section">
		<div>
			<h1>Ellie Seal</h1>
			<p>Ellie is an artist working across painting, sculpture and dance.</p>
			<p>
				Seal Stuff is her shop for {hasClothing
					? 'art prints, posters and clothing'
					: 'art prints, posters and framed artwork'}.
			</p>
			<a class="button" href={resolve('/shop')}>Shop prints <Icon name="arrow" size={18} /></a>
		</div>
		<div class="portrait">
			<img src={artistBio.profileImage} alt="Ellie Seal, artist and mural painter" />
		</div>
	</section>
	<section class="about-story section">
		<img src={art} alt="An abstract movement study by Ellie Seal" loading="lazy" />
		<div>
			<h2>About the artwork</h2>
			<p>
				Ellie’s practice moves between oil painting, sculpture and dance. Inspired by artists
				including Hilma af Klint and Wassily Kandinsky, her abstract work explores the energy and
				gesture of a body in motion.
			</p>
			<p>
				The Movement Collection brings those original studies to paper as prints, posters and framed
				pieces.
			</p>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External hosted URL. -->
			<a class="text-link" href={shopCopy.instagram} target="_blank" rel="noreferrer"
				>Follow the studio on Instagram ↗</a
			>
		</div>
	</section>
	<section class="about-contact">
		<h2>Mural commissions</h2>
		<p>Alongside prints, Ellie paints colourful murals for homes, businesses and shared spaces.</p>
		<a class="button secondary" href={resolve('/murals')}
			>Visit Ellie’s mural studio <Icon name="arrow" size={18} /></a
		>
	</section>
</main>

<style>
	.about-hero,
	.about-story {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		gap: 6rem;
	}
	.about-hero h1 {
		font-size: clamp(5rem, 9vw, 9rem);
	}

	.about-hero p:not(.eyebrow),
	.about-story p:not(.eyebrow) {
		font-size: 0.9rem;
		color: var(--body);
		max-width: 30rem;
		margin-bottom: 1.5rem;
	}
	.portrait {
		background: var(--sage-light);
		aspect-ratio: 0.9;
		position: relative;
		overflow: hidden;
	}
	.portrait img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: bottom;
	}

	.about-story {
		border-top: 1px solid var(--line);
	}
	.about-story img {
		background: var(--stone);
		padding: 2rem;
	}
	.about-contact {
		text-align: center;
		background: var(--blush);
		padding: 4rem 2rem;
		margin: 1rem 0 5rem;
	}
	.about-contact p:not(.eyebrow) {
		font-size: 0.85rem;
		margin-bottom: 2rem;
	}
	@media (max-width: 760px) {
		.about-hero,
		.about-story {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		.about-hero h1 {
			font-size: 5.5rem;
		}
		.about-contact {
			padding: 3rem 1.5rem;
		}
	}
</style>
