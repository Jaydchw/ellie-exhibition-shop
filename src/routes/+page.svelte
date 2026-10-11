<script lang="ts">
	import { resolve } from '$app/paths';
	import ShoppingBag from 'phosphor-svelte/lib/ShoppingBag';
	import Palette from 'phosphor-svelte/lib/Palette';
	import InstagramLogo from 'phosphor-svelte/lib/InstagramLogo';
	import FacebookLogo from 'phosphor-svelte/lib/FacebookLogo';
	import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';
	import Button from '$lib/components/ui/button.svelte';
	import LeafAccent from '$lib/components/ui/leaf-accent.svelte';
	import SectionHeading from '$lib/components/ui/section-heading.svelte';
	import portrait from '$lib/assets/images/murals/ellie-seal-mural-artist.png';
	import { socialLinks } from '$lib/content/site';

	const socials = [
		{ ...socialLinks.instagram, icon: InstagramLogo },
		{ ...socialLinks.facebook, icon: FacebookLogo },
		{ ...socialLinks.email, icon: EnvelopeSimple }
	];
	const description =
		'Fine art and custom murals by Ellie Seal. Visit the Seal Stuff shop or get in touch.';
</script>

<svelte:head>
	<title>Ellie Seal — Fine Art & Murals</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Ellie Seal — Fine Art & Murals" />
	<meta property="og:description" content={description} />
</svelte:head>

<main id="main-content" class="index-page">
	<section class="artist-hero" aria-labelledby="artist-title">
		<LeafAccent side="right" size="large" />
		<div class="hero-word" aria-hidden="true">ARTIST</div>
		<div class="artist-hero__inner wrap">
			<div class="artist-hero__copy">
				<SectionHeading
					title="Ellie Seal"
					description="Fine artist & mural painter."
					level="h1"
					headingId="artist-title"
				/>
				<div class="destinations">
					<Button href={resolve('/murals')} size="lg">
						<Palette size={20} aria-hidden="true" />
						View murals
					</Button>
					<Button href={resolve('/shop')} variant="outline" size="lg">
						<ShoppingBag size={20} aria-hidden="true" />
						Visit shop
					</Button>
				</div>
				<nav class="socials" aria-label="Social media and contact">
					{#each socials as social (social.href)}
						<!-- eslint-disable svelte/no-navigation-without-resolve -- Existing external social and email destinations. -->
						<a
							href={social.href}
							target={social.label === 'Email' ? undefined : '_blank'}
							rel={social.label === 'Email' ? undefined : 'noreferrer'}
						>
							<social.icon size={20} aria-hidden="true" />
							<span>{social.label}</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/each}
				</nav>
			</div>
			<div class="artist-hero__portrait">
				<img
					src={portrait}
					alt="Ellie Seal holding a paintbrush"
					width="2400"
					height="1351"
					fetchpriority="high"
				/>
			</div>
		</div>
	</section>
</main>

<style>
	.index-page {
		min-height: 0;
		color: var(--navy);
	}

	.artist-hero {
		position: relative;
		height: 100%;
		overflow: clip;
	}

	.artist-hero__inner {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(0, 0.8fr);
		grid-template-rows: minmax(0, 1fr);
		align-items: center;
		gap: clamp(1rem, 5vw, 4rem);
		height: 100%;
		min-height: 0;
		padding-block: clamp(1rem, 4dvh, 3rem) 1rem;
	}

	.hero-word {
		position: absolute;
		top: 55%;
		right: max(-0.04em, calc((100vw - var(--content-width)) / 2));
		transform: translateY(-50%);
		color: color-mix(in srgb, var(--sage) 18%, transparent);
		font-family: var(--font-sans);
		font-size: clamp(8rem, 21vw, 20rem);
		font-weight: 850;
		letter-spacing: -0.08em;
		line-height: 0.72;
		white-space: nowrap;
		pointer-events: none;
	}

	.artist-hero__copy {
		position: relative;
		z-index: 2;
		min-width: 0;
	}

	.artist-hero__copy :global(h1) {
		max-width: 4ch;
		text-wrap: balance;
	}

	.artist-hero__copy :global(.section-description) {
		margin-top: 1rem;
	}

	.destinations {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.5rem;
		margin-top: 2rem;
	}

	.socials {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.6rem;
		margin-top: 2rem;
	}

	.socials a {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.5rem;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.78rem;
		font-weight: 600;
		text-decoration: none;
		touch-action: manipulation;
	}

	.socials a:hover,
	.socials a:focus-visible {
		color: var(--navy);
		text-decoration: underline;
		text-underline-offset: 5px;
	}

	.artist-hero__portrait {
		position: relative;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr);
		height: min(100%, 34rem);
		min-height: 0;
		place-items: end center;
	}

	.artist-hero__portrait img {
		position: relative;
		z-index: 1;
		display: block;
		width: 190%;
		max-width: none;
		height: 100%;
		object-fit: contain;
		object-position: bottom;
		transform: translateX(3%);
	}

	@media (max-width: 820px) {
		.artist-hero__inner {
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(0, 1fr);
			gap: 0;
			padding-block: clamp(1rem, 4dvh, 2.5rem) 0;
		}

		.artist-hero__copy :global(h1) {
			max-width: none;
			font-size: clamp(2.8rem, min(16vw, 10dvh), 4.4rem);
		}

		.artist-hero__portrait {
			height: 100%;
		}

		.artist-hero__portrait img {
			width: 150%;
			transform: translateX(4%);
		}

		.hero-word {
			top: auto;
			right: 50%;
			bottom: 8rem;
			transform: translateX(50%);
			font-size: clamp(5.2rem, 23vw, 11rem);
		}
	}

	@media (max-width: 560px) {
		.artist-hero__copy :global(.section-description) {
			margin-top: 0.5rem;
			font-size: 1rem;
		}

		.destinations {
			gap: 0.6rem 1rem;
			margin-top: 1.5rem;
		}

		.destinations :global(.ui-button) {
			padding-inline: 0.75rem;
			font-size: 0.82rem;
		}

		.socials {
			gap: 0.2rem 1.1rem;
			margin-top: 1.25rem;
		}

		.socials a {
			font-size: 0.72rem;
		}

		.artist-hero__portrait img {
			width: 160%;
			transform: translateX(2%);
		}

		.hero-word {
			bottom: 6rem;
		}
	}

	@media (max-height: 700px) {
		.artist-hero__copy :global(h1) {
			font-size: clamp(2.8rem, min(9vw, 12dvh), 5.5rem);
		}

		.artist-hero__copy :global(.section-description) {
			margin-top: 0.5rem;
		}

		.destinations,
		.socials {
			margin-top: 1rem;
		}
	}

	@media (max-height: 540px) {
		.artist-hero__copy :global(h1) {
			max-width: none;
			font-size: clamp(2rem, 10dvh, 3.5rem);
		}

		.artist-hero__copy :global(.section-description) {
			font-size: 0.9rem;
		}

		.destinations,
		.socials {
			margin-top: 0.5rem;
		}
	}

	@media (max-width: 820px) and (max-height: 540px) {
		.artist-hero__inner {
			grid-template-rows: minmax(0, 1fr);
			padding-block: 0.75rem;
		}

		.artist-hero__portrait {
			display: none;
		}
	}
</style>
