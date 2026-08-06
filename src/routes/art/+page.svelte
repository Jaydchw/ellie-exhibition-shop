<script lang="ts">
	import { artworks } from '$lib/art';
	import artHero from '$lib/assets/images/art-3.png';
	import ArtworkCard from '$lib/components/ui/artwork-card.svelte';
	import LeafAccent from '$lib/components/ui/leaf-accent.svelte';
	import SectionHeading from '$lib/components/ui/section-heading.svelte';
	import { artPageCopy } from '$lib/content/site';
</script>

<svelte:head>
	<title>Fine Art — Ellie Seal</title>
	<meta name="description" content="View abstract movement originals and fine art by Ellie Seal." />
</svelte:head>

<main id="main-content" class="art-page">
	<section class="art-hero" aria-labelledby="art-title">
		<LeafAccent side="right" size="large" />
		<div class="hero-word" aria-hidden="true">ART</div>
		<div class="art-hero__inner">
			<div class="art-hero__copy">
				<SectionHeading
					eyebrow={artPageCopy.eyebrow}
					title={artPageCopy.title}
					description={artPageCopy.intro}
					level="h1"
					headingId="art-title"
				/>
			</div>
			<div class="art-hero__artwork">
				<img src={artHero} alt="Abstract black line artwork by Ellie Seal" />
			</div>
		</div>
	</section>

	<section class="gallery-section" aria-labelledby="gallery-title">
		<SectionHeading
			eyebrow={artPageCopy.galleryEyebrow}
			title={artPageCopy.galleryTitle}
			description={artPageCopy.galleryDescription}
		/>
		<div class="gallery-grid" id="gallery-title">
			{#each artworks as artwork (artwork.slug)}
				<ArtworkCard {artwork} />
			{/each}
		</div>
	</section>
</main>

<style>
	.art-page {
		position: relative;
		z-index: 1;
	}

	.art-hero__inner,
	.gallery-section {
		width: min(var(--content-width), calc(100% - 2rem));
		margin-inline: auto;
	}

	.art-hero {
		position: relative;
		min-height: 39rem;
		overflow: clip;
	}

	.art-hero__inner {
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(22rem, 0.8fr);
		gap: clamp(1rem, 5vw, 4rem);
		align-items: center;
		min-height: 39rem;
		padding: clamp(2.5rem, 6vw, 5rem) 0 0;
	}

	.hero-word {
		position: absolute;
		top: 55%;
		right: max(-0.04em, calc((100vw - var(--content-width)) / 2));
		transform: translateY(-50%);
		color: color-mix(in srgb, var(--sage) 18%, transparent);
		font-family: var(--font-sans);
		font-size: clamp(10rem, 22vw, 20rem);
		font-weight: 850;
		letter-spacing: -0.08em;
		line-height: 0.72;
		white-space: nowrap;
		pointer-events: none;
	}

	.art-hero__copy {
		position: relative;
		z-index: 2;
		animation: rise-in 620ms ease both;
	}

	.art-hero__copy :global(.section-description) {
		margin-top: 0.65rem;
	}

	.art-hero__artwork {
		position: relative;
		z-index: 1;
		display: grid;
		height: min(64svh, 32rem);
		place-items: center;
		animation: rise-in 700ms 80ms ease both;
	}

	.art-hero__artwork img {
		display: block;
		max-height: 100%;
		width: 100%;
		object-fit: contain;
	}

	.gallery-section {
		padding: clamp(3rem, 7vw, 5rem) 0 clamp(5rem, 10vw, 8rem);
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(1.5rem, 4vw, 3rem);
		margin-top: clamp(2rem, 5vw, 3.5rem);
	}

	@media (max-width: 900px) {
		.gallery-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.art-hero__inner,
		.gallery-section {
			width: min(var(--content-width), calc(100% - 1.25rem));
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 820px) {
		.art-hero {
			min-height: auto;
		}

		.art-hero__inner {
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(0, 1fr);
			gap: 1rem;
			min-height: auto;
			padding: 3rem 0 2.5rem;
		}

		.art-hero__artwork {
			height: auto;
			min-height: 16rem;
		}

		.hero-word {
			top: 68%;
			right: 50%;
			transform: translate(50%, -50%);
			font-size: clamp(7rem, 36vw, 11rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.art-hero__copy,
		.art-hero__artwork {
			animation: none;
		}
	}
</style>
