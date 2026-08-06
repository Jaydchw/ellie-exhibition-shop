<script lang="ts">
	import artPreview from '$lib/assets/images/art-1.png';
	import muralPreview from '$lib/assets/images/murals/botanical-kitchen-mural.jpg';
	import { artistBio } from '$lib/bio';
	import LeafAccent from '$lib/components/ui/leaf-accent.svelte';
	import PortfolioCard from '$lib/components/ui/portfolio-card.svelte';
	import { siteCopy } from '$lib/content/site';
</script>

<svelte:head>
	<title>Ellie Seal — Artist and Mural Painter</title>
	<meta
		name="description"
		content="Explore fine art and custom murals by local artist Ellie Seal."
	/>
</svelte:head>

<main id="main-content" class="home-page">
	<section class="home-hero" aria-labelledby="home-title">
		<LeafAccent side="right" size="large" />
		<div class="home-hero__copy">
			<p class="eyebrow">{siteCopy.home.eyebrow}</p>
			<h1 id="home-title">{siteCopy.home.title}</h1>
			<p class="intro">{siteCopy.home.intro}</p>
		</div>
		<div class="portrait" aria-hidden="true">
			<img src={artistBio.profileImage} alt="" />
		</div>
	</section>

	<section class="portfolio-choices" aria-labelledby="portfolio-title">
		<p class="section-label" id="portfolio-title">{siteCopy.home.choicesLabel}</p>
		<div class="choice-grid">
			<PortfolioCard
				{...siteCopy.home.choices.murals}
				image={muralPreview}
				alt="Botanical mural painted by Ellie Seal"
				tone="blush"
			/>
			<PortfolioCard
				{...siteCopy.home.choices.art}
				image={artPreview}
				alt="Abstract black line artwork by Ellie Seal"
				tone="sage"
			/>
		</div>
	</section>
</main>

<style>
	.home-page {
		position: relative;
		z-index: 1;
	}

	.home-hero,
	.portfolio-choices {
		width: min(var(--content-width), calc(100% - 2rem));
		margin-inline: auto;
	}

	.home-hero {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.7fr);
		gap: clamp(1.5rem, 6vw, 5rem);
		align-items: center;
		min-height: min(43rem, calc(100vh - 4.8rem));
		padding: clamp(3rem, 8vw, 7rem) 0 2.5rem;
	}

	.home-hero__copy {
		position: relative;
		z-index: 2;
		display: grid;
		gap: 1rem;
		max-width: 48rem;
		animation: rise-in 620ms ease both;
	}

	.eyebrow,
	.intro,
	.section-label {
		margin: 0;
	}

	.eyebrow,
	.section-label {
		color: var(--moss);
		font-family: var(--font-sans);
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: clamp(5rem, 13vw, 10.5rem);
		font-weight: 600;
		letter-spacing: -0.055em;
		line-height: 0.72;
	}

	.intro {
		max-width: 38rem;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: clamp(1.08rem, 2.2vw, 1.35rem);
		line-height: 1.65;
	}

	.portrait {
		position: relative;
		display: grid;
		place-items: end center;
		align-self: stretch;
		min-height: 31rem;
		overflow: visible;
		animation: rise-in 700ms 100ms ease both;
	}

	.portrait img {
		position: relative;
		z-index: 1;
		display: block;
		width: 190%;
		max-width: none;
		transform: translateX(3%);
	}

	.portfolio-choices {
		padding: 2rem 0 clamp(4rem, 9vw, 7rem);
	}

	.section-label {
		margin-bottom: 1rem;
	}

	.choice-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(1.5rem, 5vw, 4rem);
	}

	@media (max-width: 760px) {
		.home-hero,
		.portfolio-choices {
			width: min(var(--content-width), calc(100% - 1.25rem));
		}

		.home-hero {
			grid-template-columns: 1fr;
			gap: 0.25rem;
			min-height: auto;
			padding: 2.75rem 0 0;
		}

		h1 {
			font-size: clamp(4.2rem, 22vw, 6rem);
			line-height: 0.76;
		}

		.intro {
			font-size: 1rem;
			line-height: 1.55;
		}

		.portrait {
			min-height: 19rem;
		}

		.portrait img {
			width: 165%;
			transform: translateX(5%);
		}

		.portfolio-choices {
			padding: 3rem 0 4.5rem;
		}

		.choice-grid {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.home-hero__copy,
		.portrait {
			animation: none;
		}
	}
</style>
