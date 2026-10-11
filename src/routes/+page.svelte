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
		color: var(--navy);
	}

	.artist-hero {
		position: relative;
		overflow: clip;
	}

	.artist-hero__inner {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(0, 0.8fr);
		align-items: center;
		gap: clamp(1rem, 5vw, 4rem);
		min-height: max(39rem, calc(100svh - var(--site-header-height) - 4.5rem));
		padding-block: clamp(2.5rem, 6vw, 5rem) 1.5rem;
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
		height: min(66svh, 34rem);
		place-items: end center;
	}

	.artist-hero__portrait img {
		position: relative;
		z-index: 1;
		display: block;
		width: 190%;
		max-width: none;
		height: auto;
		transform: translateX(3%);
	}

	@media (max-width: 820px) {
		.artist-hero__inner {
			grid-template-columns: 1fr;
			gap: 0;
			min-height: auto;
			padding-block: 3rem 0;
		}

		.artist-hero__copy :global(h1) {
			max-width: none;
		}

		.artist-hero__portrait {
			height: auto;
			min-height: 17rem;
			margin-top: 1rem;
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
		.artist-hero__inner {
			padding-top: 2.5rem;
		}

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

		.artist-hero__portrait {
			min-height: 15rem;
		}

		.artist-hero__portrait img {
			width: 160%;
			transform: translateX(2%);
		}

		.hero-word {
			bottom: 6rem;
		}
	}
</style>
