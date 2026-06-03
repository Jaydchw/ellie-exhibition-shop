<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';
	import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';
	import InstagramLogo from 'phosphor-svelte/lib/InstagramLogo';
	import { artworks } from '$lib/art';
	import { artistBio } from '$lib/bio';
	import ArtworkCard from '$lib/components/ui/artwork-card.svelte';
	import Button from '$lib/components/ui/button.svelte';

	const contactEmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
		artistBio.email
	)}&su=${encodeURIComponent('Ellie Seal enquiry')}`;
</script>

<svelte:head>
	<title>Ellie Seal</title>
	<meta
		name="description"
		content="Ellie Seal is a local artist working with oil paint, sculpting, dance, and abstract movement. View exhibition artworks and enquire about original Fabriano paper pieces."
	/>
</svelte:head>

<main class="home-page">
	<nav class="site-nav" aria-label="Main navigation">
		<a class="brand" href={resolve('/')} aria-label="Ellie Seal home">Ellie Seal</a>
		<div class="nav-links">
			<a href="#about">About</a>
			<a href="#work">Works</a>
		</div>
		<Button href={artistBio.instagram} target="_blank" variant="outline">
			<InstagramLogo size={18} weight="bold" aria-hidden="true" />
			Instagram
		</Button>
	</nav>

	<section id="about" class="hero-section" aria-labelledby="hero-title">
		<div class="hero-copy">
			<p class="eyebrow">{artistBio.location}</p>
			<h1 id="hero-title">{artistBio.name}</h1>
			<p class="hero-lede">{artistBio.shortIntro}</p>
			<div class="bio-copy">
				{#each artistBio.bio as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
			<div class="hero-actions">
				<Button href="#work">
					View artworks
					<ArrowRight size={18} weight="bold" aria-hidden="true" />
				</Button>
				<Button href={contactEmailLink} target="_blank" variant="outline">
					<EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
					Contact Ellie
				</Button>
			</div>
		</div>

		<div class="portrait-group">
			<img src={artistBio.profileImage} alt="Portrait of Ellie Seal" />
		</div>
	</section>

	<section id="work" class="gallery-section" aria-labelledby="gallery-title">
		<div class="section-heading">
			<p class="eyebrow">Exhibition works</p>
			<h2 id="gallery-title">Abstract Movement Originals</h2>
		</div>

		<div class="gallery-grid">
			{#each artworks as artwork (artwork.slug)}
				<ArtworkCard {artwork} />
			{/each}
		</div>
	</section>
</main>

<style>
	.home-page {
		min-height: 100vh;
		overflow: hidden;
		background: var(--paper);
		color: var(--ink);
	}

	.site-nav,
	.hero-section,
	.gallery-section {
		width: min(1180px, calc(100% - 2rem));
		margin-inline: auto;
	}

	.site-nav {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 1rem;
		align-items: center;
		padding: 1.15rem 0;
	}

	.brand {
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: 1.55rem;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: clamp(0.75rem, 2vw, 1.5rem);
		font-family: var(--font-sans);
		font-size: 0.88rem;
		font-weight: 800;
	}

	.nav-links a {
		color: var(--muted);
		text-decoration: none;
		transition: color 180ms ease;
	}

	.nav-links a:hover {
		color: var(--navy);
	}

	.hero-section {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(320px, 0.78fr);
		gap: clamp(2rem, 7vw, 6rem);
		align-items: end;
		border-top: 2px solid color-mix(in srgb, var(--navy) 34%, var(--sage));
		padding: clamp(2rem, 6vw, 4.5rem) 0 0;
	}

	.hero-copy {
		display: grid;
		gap: 1.25rem;
		padding-bottom: clamp(2rem, 6vw, 4rem);
		animation: rise-in 640ms ease both;
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.44rem;
		margin: 0;
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 850;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	h1,
	h2 {
		margin: 0;
		color: var(--navy);
		font-family: var(--font-serif);
		font-weight: 700;
		letter-spacing: 0;
	}

	h1 {
		max-width: 8ch;
		font-size: clamp(5rem, 12vw, 10.4rem);
		line-height: 0.78;
	}

	h2 {
		font-size: clamp(2.55rem, 5vw, 4.8rem);
		line-height: 0.88;
	}

	.hero-lede {
		max-width: 720px;
		margin: 0;
		color: var(--navy);
		font-size: clamp(1.45rem, 3vw, 2.4rem);
		font-weight: 600;
		line-height: 1.05;
	}

	.bio-copy {
		display: grid;
		gap: 0.75rem;
		max-width: 650px;
	}

	.bio-copy p,
	.section-heading p {
		margin: 0;
		color: var(--body);
		font-size: 1.04rem;
		line-height: 1.72;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}

	.portrait-group {
		position: relative;
		display: grid;
		align-items: end;
		align-self: end;
		margin-bottom: -1px;
		animation: rise-in 720ms 120ms ease both;
	}

	.portrait-group img {
		display: block;
		width: min(112%, 620px);
		height: auto;
		margin-inline: auto;
		margin-bottom: -1px;
	}

	.gallery-section {
		border-top: 1px solid color-mix(in srgb, var(--navy) 18%, var(--sage));
		padding: clamp(3rem, 8vw, 6rem) 0;
	}

	.section-heading {
		display: grid;
		gap: 0.8rem;
		max-width: 720px;
		margin-bottom: clamp(1.4rem, 3vw, 2.4rem);
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(1.4rem, 4vw, 3rem);
	}

	@media (max-width: 920px) {
		.site-nav {
			grid-template-columns: 1fr auto;
		}

		.nav-links {
			display: none;
		}

		.hero-section {
			grid-template-columns: 1fr;
		}

		.portrait-group {
			max-width: 540px;
		}

		.gallery-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.site-nav {
			align-items: start;
		}

		.hero-section {
			gap: 1.5rem;
		}

		h1 {
			font-size: clamp(4.35rem, 21vw, 7rem);
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
