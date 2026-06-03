<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Bank from 'phosphor-svelte/lib/Bank';
	import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';
	import Ruler from 'phosphor-svelte/lib/Ruler';
	import Button from '$lib/components/ui/button.svelte';

	let { data } = $props();
	let artwork = $derived(data.artwork);
	let browserEmailLink = $derived(data.browserEmailLink);
	let mailtoLink = $derived(data.mailtoLink);

	const handleEmailClick: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> = (event) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		event.preventDefault();
		window.location.href = mailtoLink;

		window.setTimeout(() => {
			if (document.visibilityState === 'visible') {
				window.open(browserEmailLink, '_blank', 'noopener,noreferrer');
			}
		}, 900);
	};
</script>

<svelte:head>
	<title>Ellie Seal</title>
	<meta
		name="description"
		content={`View ${artwork.title}, an abstract movement artwork by Ellie Seal, and enquire about buying the original Fabriano paper piece.`}
	/>
</svelte:head>

<main class="detail-page">
	<nav class="detail-nav" aria-label="Artwork navigation">
		<Button href="/" variant="ghost">
			<ArrowLeft size={18} weight="bold" aria-hidden="true" />
			Back to gallery
		</Button>
	</nav>

	<section class="artwork-hero">
		<div class="artwork-frame">
			<img src={artwork.image} alt={artwork.alt} />
		</div>

		<aside class="artwork-panel" aria-labelledby="artwork-title">
			<p class="eyebrow">Ellie Seal exhibition original</p>
			<h1 id="artwork-title">{artwork.title}</h1>

			<div class="description">
				{#each artwork.description as paragraph (paragraph)}
					<p>
						{#each paragraph as segment (segment.text)}
							{#if segment.italic}
								<em>{segment.text}</em>
							{:else}
								{segment.text}
							{/if}
						{/each}
					</p>
				{/each}
				<p class="dimensions">
					<Ruler size={20} weight="bold" aria-hidden="true" />
					Fabriano paper size: {artwork.dimensions.height} height x {artwork.dimensions.width}
					width
				</p>
				<p class="price">{artwork.price === null ? 'Price TBC' : `£${artwork.price}`}</p>
			</div>
		</aside>
	</section>

	<section class="purchase-section" aria-labelledby="purchase-title">
		<div class="purchase-copy">
			<p class="eyebrow">Buying the original</p>
			<h2 id="purchase-title">Reserve by email</h2>
			<p>
				Each piece is the original artwork on Fabriano paper, so there is only one available. To buy
				it, send a bank transfer for the listed price, then email Ellie with the artwork name, proof
				of payment, and the delivery address.
			</p>
		</div>

		<div class="purchase-card">
			<div class="bank-details" aria-label="Ellie Seal bank details">
				<p class="bank-label">
					<Bank size={20} weight="bold" aria-hidden="true" />
					Bank transfer details
				</p>
				<dl>
					<div>
						<dt>Name</dt>
						<dd>E L SEAL</dd>
					</div>
					<div>
						<dt>Sort code</dt>
						<dd>20-89-68</dd>
					</div>
					<div>
						<dt>Account number</dt>
						<dd>43337731</dd>
					</div>
				</dl>
			</div>

			<ol>
				<li>
					<span><EnvelopeSimple size={20} weight="bold" aria-hidden="true" /></span>
					Email Ellie with the artwork title.
				</li>
				<li>
					<span><Bank size={20} weight="bold" aria-hidden="true" /></span>
					Transfer {artwork.price === null ? 'the agreed price' : `£${artwork.price}`} using the bank
					details above.
				</li>
				<li>
					<span><Ruler size={20} weight="bold" aria-hidden="true" /></span>
					Attach a screenshot showing proof of payment and include the delivery address.
				</li>
			</ol>

			<Button href={mailtoLink} variant="primary" onclick={handleEmailClick}>
				<EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
				Email Ellie
			</Button>
			<a class="email-fallback" href={browserEmailLink} target="_blank" rel="noreferrer"
				>Open in Gmail instead</a
			>
		</div>
	</section>
</main>

<style>
	.detail-page {
		min-height: 100vh;
		overflow: hidden;
		background: var(--paper);
		color: var(--ink);
	}

	.detail-nav,
	.artwork-hero,
	.purchase-section {
		width: min(1160px, calc(100% - 2rem));
		margin-inline: auto;
	}

	.detail-nav {
		padding: 1.2rem 0 0;
	}

	.artwork-hero {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
		gap: clamp(2rem, 5vw, 4rem);
		align-items: start;
		padding: clamp(1.8rem, 5vw, 4rem) 0;
	}

	.artwork-frame {
		animation: rise-in 620ms ease both;
	}

	.artwork-frame img {
		display: block;
		width: 100%;
		aspect-ratio: 1.44;
		object-fit: cover;
	}

	.artwork-panel {
		position: sticky;
		top: 1rem;
		display: grid;
		gap: 1.2rem;
		border-left: 1px solid color-mix(in srgb, var(--sage) 70%, white);
		padding: 0 0 0 clamp(1.2rem, 3vw, 2rem);
		animation: rise-in 680ms 120ms ease both;
	}

	.eyebrow {
		margin: 0;
		color: var(--muted);
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
		font-size: clamp(3rem, 6vw, 5.5rem);
		line-height: 0.9;
	}

	h2 {
		font-size: clamp(2.1rem, 4vw, 3.3rem);
		line-height: 0.95;
	}

	.description {
		display: grid;
		gap: 0.8rem;
	}

	.description p,
	.purchase-copy p {
		margin: 0;
		color: var(--body);
		font-size: 1.03rem;
		line-height: 1.72;
	}

	.dimensions {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--navy);
		font-family: var(--font-sans);
		font-weight: 800;
	}

	.price {
		width: fit-content;
		margin: 0;
		border-left: 4px solid var(--navy);
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: clamp(1.5rem, 3vw, 2.2rem);
		font-weight: 850;
		line-height: 1;
		padding-left: 0.75rem;
	}

	em {
		color: var(--navy);
		font-style: italic;
	}

	.purchase-section {
		display: grid;
		grid-template-columns: minmax(0, 0.85fr) minmax(320px, 1fr);
		gap: clamp(2rem, 5vw, 4rem);
		align-items: start;
		border-top: 1px solid color-mix(in srgb, var(--sage) 60%, white);
		padding: clamp(2rem, 6vw, 4.6rem) 0;
	}

	.purchase-copy {
		display: grid;
		gap: 0.9rem;
	}

	.purchase-card {
		display: grid;
		gap: 1.4rem;
	}

	.bank-details {
		display: grid;
		gap: 0.85rem;
	}

	.bank-label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--navy);
		font-family: var(--font-sans);
		font-weight: 800;
	}

	dl {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.8rem;
		margin: 0;
	}

	dl div {
		display: grid;
		gap: 0.25rem;
	}

	dt {
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 850;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	dd {
		margin: 0;
		color: var(--ink);
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 850;
	}

	ol {
		display: grid;
		gap: 0.85rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		color: var(--body);
		line-height: 1.5;
	}

	li span {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		height: 2rem;
		width: 2rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--sage) 28%, white);
		color: var(--navy);
	}

	.email-fallback {
		width: fit-content;
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.92rem;
		font-weight: 800;
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	@media (max-width: 860px) {
		.artwork-hero,
		.purchase-section {
			grid-template-columns: 1fr;
		}

		.artwork-panel {
			position: static;
			border-left: 0;
			border-top: 1px solid color-mix(in srgb, var(--sage) 70%, white);
			padding: 1.2rem 0 0;
		}

		dl {
			grid-template-columns: 1fr;
		}
	}
</style>
