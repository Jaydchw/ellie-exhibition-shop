<script lang="ts">
	import Check from 'phosphor-svelte/lib/Check';
	import ChatCenteredText from 'phosphor-svelte/lib/ChatCenteredText';
	import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';
	import FacebookLogo from 'phosphor-svelte/lib/FacebookLogo';
	import Images from 'phosphor-svelte/lib/Images';
	import InstagramLogo from 'phosphor-svelte/lib/InstagramLogo';
	import Palette from 'phosphor-svelte/lib/Palette';
	import X from 'phosphor-svelte/lib/X';
	import Button from '$lib/components/ui/button.svelte';
	import CommissionChat from '$lib/components/ui/commission-chat.svelte';
	import LeafAccent from '$lib/components/ui/leaf-accent.svelte';
	import MediaGallery from '$lib/components/ui/media-gallery.svelte';
	import SectionHeading from '$lib/components/ui/section-heading.svelte';
	import { muralConcepts, muralEnquiry, muralPageCopy, muralProjects } from '$lib/content/murals';
	import { socialLinks } from '$lib/content/site';
</script>

<svelte:head>
	<title>Murals — Ellie Seal</title>
	<meta name="description" content={muralPageCopy.metaDescription} />
</svelte:head>

<main id="main-content" class="murals-page">
	<section class="mural-hero" aria-labelledby="mural-title">
		<LeafAccent side="right" size="large" />
		<div class="hero-word" aria-hidden="true">MURALS</div>
		<div class="mural-hero__inner">
			<div class="mural-hero__copy">
				<SectionHeading
					eyebrow={muralPageCopy.hero.eyebrow}
					title={muralPageCopy.hero.title}
					description={muralPageCopy.hero.intro}
					level="h1"
					headingId="mural-title"
				/>
				<div class="hero-actions">
					<Button href={socialLinks.facebook.href} target="_blank" size="lg">
						<FacebookLogo size={19} weight="bold" aria-hidden="true" />
						{muralPageCopy.hero.primaryAction}
					</Button>
				</div>
			</div>

			<div class="mural-hero__portrait">
				<img src={muralPageCopy.hero.image} alt={muralPageCopy.hero.imageAlt} />
			</div>
		</div>
	</section>

	<nav class="section-nav" aria-label="Murals page sections">
		<div>
			{#each muralPageCopy.sections as section (section.href)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={section.href}>
					{#if section.icon === 'work'}
						<Images size={17} weight="bold" aria-hidden="true" />
					{:else if section.icon === 'examples'}
						<Palette size={17} weight="bold" aria-hidden="true" />
					{:else if section.icon === 'enquiry'}
						<ChatCenteredText size={17} weight="bold" aria-hidden="true" />
					{:else}
						<EnvelopeSimple size={17} weight="bold" aria-hidden="true" />
					{/if}
					<span class="section-label--full">{section.label}</span>
					<span class="section-label--short">{section.shortLabel}</span>
				</a>
			{/each}
		</div>
	</nav>

	<section id="previous-work" class="page-section">
		<div class="section-shell">
			<SectionHeading
				eyebrow={muralPageCopy.work.eyebrow}
				title={muralPageCopy.work.title}
				description={muralPageCopy.work.intro}
			/>
			<MediaGallery items={muralProjects} label="Previous murals" />
		</div>
	</section>

	<section id="artwork-examples" class="page-section page-section--tint">
		<div class="section-shell">
			<SectionHeading
				eyebrow={muralPageCopy.concepts.eyebrow}
				title={muralPageCopy.concepts.title}
				description={muralPageCopy.concepts.intro}
			/>
			<MediaGallery items={muralConcepts} label="Artwork examples" imageFit="contain" />
		</div>
	</section>

	<section id="commission-process" class="page-section page-section--chat">
		<div class="process-shell">
			<div class="process-intro">
				<SectionHeading
					eyebrow={muralPageCopy.process.eyebrow}
					title={muralPageCopy.process.title}
					description={muralPageCopy.process.intro}
				/>
				<div class="enquiry-guidance">
					<div class="preference-column preference-column--do">
						<h3>{muralPageCopy.preferences.dosTitle}</h3>
						<ul>
							{#each muralPageCopy.preferences.dos as item (item)}
								<li><Check size={18} weight="bold" aria-hidden="true" /><span>{item}</span></li>
							{/each}
						</ul>
					</div>
					<div class="preference-column preference-column--dont">
						<h3>{muralPageCopy.preferences.dontsTitle}</h3>
						<ul>
							{#each muralPageCopy.preferences.donts as item (item)}
								<li><X size={18} weight="bold" aria-hidden="true" /><span>{item}</span></li>
							{/each}
						</ul>
					</div>
					<p class="wall-note">{muralPageCopy.preferences.wallNote}</p>
				</div>
			</div>
			<CommissionChat messages={muralEnquiry} />
		</div>
	</section>

	<section id="contact" class="page-section contact-section">
		<div class="section-shell">
			<SectionHeading
				eyebrow={muralPageCopy.contact.eyebrow}
				title={muralPageCopy.contact.title}
				description={muralPageCopy.contact.intro}
			/>
			<div class="contact-links">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={socialLinks.facebook.href} target="_blank" rel="noreferrer">
					<FacebookLogo size={24} weight="duotone" aria-hidden="true" />
					<span>{socialLinks.facebook.label}</span><strong>{socialLinks.facebook.handle}</strong>
				</a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={socialLinks.instagram.href} target="_blank" rel="noreferrer">
					<InstagramLogo size={24} weight="duotone" aria-hidden="true" />
					<span>{socialLinks.instagram.label}</span><strong>{socialLinks.instagram.handle}</strong>
				</a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={socialLinks.email.href}>
					<EnvelopeSimple size={24} weight="duotone" aria-hidden="true" />
					<span>{socialLinks.email.label}</span><strong>{socialLinks.email.handle}</strong>
				</a>
			</div>
		</div>
	</section>
</main>

<style>
	.murals-page {
		position: relative;
		z-index: 1;
	}

	.mural-hero {
		position: relative;
		min-height: 39rem;
		overflow: clip;
	}

	.mural-hero__inner,
	.section-nav > div,
	.section-shell,
	.process-shell {
		width: min(var(--content-width), calc(100% - 2rem));
		margin-inline: auto;
	}

	.mural-hero__inner {
		position: relative;
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
		font-size: clamp(8rem, 21vw, 20rem);
		font-weight: 850;
		letter-spacing: -0.08em;
		line-height: 0.72;
		white-space: nowrap;
		pointer-events: none;
	}

	.mural-hero__copy {
		position: relative;
		z-index: 2;
		display: grid;
		gap: 1.5rem;
		animation: rise-in 620ms ease both;
	}

	.mural-hero__copy :global(.section-description) {
		margin-top: 0.65rem;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}

	.mural-hero__portrait {
		position: relative;
		display: grid;
		height: min(66svh, 34rem);
		place-items: end center;
		animation: rise-in 700ms 80ms ease both;
	}

	.mural-hero__portrait img {
		position: relative;
		z-index: 1;
		display: block;
		width: 190%;
		max-width: none;
		transform: translateX(3%);
	}

	.section-nav {
		position: sticky;
		z-index: 8;
		top: var(--site-header-height);
		background: color-mix(in srgb, var(--paper) 94%, transparent);
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, var(--navy) 5%, transparent);
		backdrop-filter: blur(14px);
	}

	.section-nav > div {
		display: flex;
		gap: clamp(1.2rem, 4vw, 2.5rem);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.section-nav > div::-webkit-scrollbar {
		display: none;
	}

	.section-nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		flex: 0 0 auto;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.78rem;
		font-weight: 750;
		padding: 1rem 0;
		text-decoration: none;
	}

	.section-nav a:hover {
		color: var(--navy);
	}

	.section-label--short {
		display: none;
	}

	.page-section {
		scroll-margin-top: 4rem;
		padding: clamp(5rem, 10vw, 9rem) 0;
	}

	.page-section--tint {
		background: #ece8df;
	}

	.section-shell > :global(.section-heading) {
		margin-bottom: clamp(2.5rem, 6vw, 4.5rem);
	}

	.enquiry-guidance {
		display: grid;
		gap: 1.6rem;
		margin-top: 2.25rem;
		border-top: 1px solid var(--line);
		padding-top: 1.75rem;
	}

	.preference-column h3 {
		margin: 0 0 0.9rem;
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: 1.45rem;
		font-weight: 650;
	}

	.preference-column ul {
		display: grid;
		gap: 0.7rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.preference-column li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.88rem;
		font-weight: 600;
	}

	.preference-column--do li :global(svg) {
		color: var(--moss);
	}
	.preference-column--dont li :global(svg) {
		color: var(--terracotta);
	}

	.wall-note {
		margin: 0;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.82rem;
		line-height: 1.6;
	}

	.page-section--chat {
		background: #f0ede6;
		padding-bottom: clamp(7rem, 14vw, 12rem);
	}

	.process-shell {
		display: grid;
		grid-template-columns: minmax(17rem, 0.58fr) minmax(0, 1fr);
		gap: clamp(3rem, 8vw, 8rem);
		align-items: start;
	}

	.process-intro {
		position: sticky;
		top: calc(var(--site-header-height) + 4.75rem);
	}

	.contact-section {
		background: var(--sage-light);
	}

	.contact-links {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(1.5rem, 5vw, 4rem);
		max-width: 60rem;
	}

	.contact-links a {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.25rem 0.75rem;
		align-items: center;
		color: var(--navy);
		text-decoration: none;
	}

	.contact-links a :global(svg) {
		grid-row: 1 / 3;
	}

	.contact-links span,
	.contact-links strong {
		font-family: var(--font-sans);
	}
	.contact-links span {
		color: var(--muted);
		font-size: 0.7rem;
		font-weight: 750;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.contact-links strong {
		font-size: 0.9rem;
		overflow-wrap: anywhere;
	}
	.contact-links a:hover strong {
		text-decoration: underline;
		text-underline-offset: 0.25rem;
	}

	@media (max-width: 820px) {
		.mural-hero {
			min-height: auto;
		}

		.mural-hero__inner,
		.section-shell,
		.process-shell {
			width: min(var(--content-width), calc(100% - 1.25rem));
		}

		.mural-hero__inner {
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(0, 1fr);
			gap: 0;
			min-height: auto;
			padding: 3rem 0 0;
		}

		.mural-hero__portrait {
			height: auto;
			min-height: 17rem;
		}
		.mural-hero__portrait img {
			width: 175%;
			transform: translateX(4%);
		}
		.hero-word {
			top: 68%;
			right: 50%;
			transform: translate(50%, -50%);
			font-size: clamp(5.2rem, 24vw, 8rem);
		}
		.process-shell {
			grid-template-columns: 1fr;
		}
		.process-intro {
			position: static;
		}
		.contact-links {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 560px) {
		.mural-hero__portrait {
			min-height: 15rem;
		}
		.mural-hero__portrait img {
			width: 160%;
			transform: translateX(5%);
		}
		.section-nav > div {
			width: 100%;
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 0.15rem;
			overflow: hidden;
			padding: 0.32rem 0.4rem;
		}
		.section-nav a {
			justify-content: center;
			gap: 0.28rem;
			min-width: 0;
			font-size: 0.64rem;
			padding: 0.52rem 0.15rem;
		}
		.section-nav a :global(svg) {
			height: 0.9rem;
			width: 0.9rem;
		}
		.section-label--full {
			display: none;
		}
		.section-label--short {
			display: inline;
		}
		.page-section {
			padding: 3.75rem 0;
		}
		.contact-links {
			grid-template-columns: 1fr;
		}
		.contact-links {
			gap: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mural-hero__copy,
		.mural-hero__portrait {
			animation: none;
		}
	}
</style>
