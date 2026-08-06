<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';
	import type { Artwork } from '$lib/art';

	let { artwork }: { artwork: Artwork } = $props();
</script>

<a class="art-card" href={resolve(`/art/${artwork.slug}`)} aria-label={`View ${artwork.title}`}>
	<figure>
		<img src={artwork.image} alt={artwork.alt} loading="lazy" />
	</figure>
	<div class="art-card__body">
		<div>
			<p class="eyebrow">Piece {artwork.id}</p>
			<h3>{artwork.title}</h3>
		</div>
		<p class="price">{artwork.price === null ? 'Price TBC' : `£${artwork.price}`}</p>
		<span class="open-link">
			View work
			<ArrowRight size={17} weight="bold" aria-hidden="true" />
		</span>
	</div>
</a>

<style>
	.art-card {
		position: relative;
		display: grid;
		overflow: visible;
		color: inherit;
		text-decoration: none;
		transition:
			transform 180ms ease,
			opacity 180ms ease;
		animation: rise-in 620ms ease both;
	}

	.art-card:hover {
		transform: translateY(-2px);
	}

	.art-card:hover h3 {
		text-decoration: underline;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.14em;
	}

	.art-card:hover .open-link {
		gap: 0.55rem;
	}

	.art-card:hover img {
		opacity: 0.9;
	}

	.art-card:focus-visible {
		outline: 3px solid color-mix(in srgb, var(--navy) 26%, transparent);
		outline-offset: 4px;
	}

	figure {
		aspect-ratio: 1.44;
		margin: 0;
		overflow: hidden;
		background: var(--stone);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		transition:
			opacity 180ms ease,
			transform 320ms ease;
	}

	.art-card:hover img {
		transform: scale(1.015);
	}

	.art-card__body {
		display: grid;
		gap: 0.8rem;
		padding: 0.9rem 0 0;
	}

	.eyebrow {
		margin: 0 0 0.24rem;
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.73rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h3 {
		margin: 0;
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: clamp(1.3rem, 2.1vw, 1.85rem);
		font-weight: 700;
		line-height: 1.03;
	}

	.open-link {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 800;
	}

	.price {
		width: fit-content;
		margin: 0;
		border-left: 3px solid var(--navy);
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 1.05rem;
		font-weight: 850;
		line-height: 1;
		padding: 0.18rem 0 0.18rem 0.55rem;
	}
</style>
