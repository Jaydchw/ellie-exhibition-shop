<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { storefrontOpen } from '$lib/commerce/availability';
	import { socialLinks } from '$lib/content/site';
	import { shopCopy } from '$lib/content/shop';
	import Newsletter from './shop/newsletter.svelte';
	import { isClothing } from '$lib/commerce/presentation';
	let hasClothing = $derived(page.data.products?.some(isClothing) ?? false);
</script>

{#if !storefrontOpen}
	<footer class="artist-footer">
		<div class="artist-footer__inner wrap">
			<div class="artist-footer__brand">
				<a href={resolve('/murals')} class="artist-footer__wordmark">Ellie Seal</a>
				<p>Murals by Ellie Seal.</p>
			</div>
			<nav aria-label="Explore Ellie’s work">
				<h2>Explore</h2>
				<a href={resolve('/murals')}>Murals & commissions</a>
				<a href={resolve('/murals#contact')}>Mural enquiries ↗</a>
			</nav>
			<nav aria-label="Find Ellie online">
				<h2>Contact</h2>
				{#each Object.values(socialLinks) as social (social.href)}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- Artist's external social and email links. -->
					<a
						href={social.href}
						target={social.label === 'Email' ? undefined : '_blank'}
						rel={social.label === 'Email' ? undefined : 'noreferrer'}>{social.label} ↗</a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/each}
			</nav>
		</div>
		<div class="artist-footer__bottom wrap">© {new Date().getFullYear()} Ellie Seal</div>
	</footer>
{:else}
	{#if !page.url.pathname.startsWith('/murals')}<Newsletter />{/if}
	<footer class="shop-footer">
		<div class="wrap footer-grid">
			<div class="footer-brand">
				<a href={resolve('/')} class="wordmark">Seal Stuff<span>BY ELLIE SEAL</span></a>
				<p>Prints{hasClothing ? ' & clothing' : ' & posters'} by Ellie Seal.</p>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External hosted URL. -->
				<a class="text-link" href={shopCopy.instagram} target="_blank" rel="noreferrer"
					>Instagram ↗</a
				>
			</div>
			<div>
				<h2>Shop</h2>
				<a href={resolve('/shop')}>All products</a><a href={resolve('/shop?finish=Poster')}
					>Posters</a
				><a href={resolve('/shop?finish=frame')}>Framed prints</a>{#if hasClothing}<a
						href={resolve('/shop?category=clothing')}>Clothing</a
					>{/if}<a href={resolve('/saved')}>Saved products</a>
			</div>
			<div>
				<h2>Help</h2>
				<a href={resolve('/help')}>Delivery & returns</a><a href={resolve('/help#sizes')}
					>Size & finish guide</a
				><a href={resolve('/account')}>Your account & orders</a><a href={'mailto:' + shopCopy.email}
					>Get in touch</a
				>
			</div>
			<div>
				<h2>About</h2>
				<a href={resolve('/about')}>Meet Ellie</a><a href={resolve('/murals')}
					>Murals & commissions ↗</a
				><a href={resolve('/policies')}>Privacy & shop policies</a>
			</div>
		</div>
		<div class="wrap footer-bottom">
			<span>© {new Date().getFullYear()} Seal Stuff · Art by Ellie Seal</span><span
				>International delivery. <span class="footer-currency">GBP £</span></span
			>
		</div>
	</footer>
{/if}

<style>
	.artist-footer {
		padding: 3rem 0 1.5rem;
		background: var(--navy);
		color: var(--paper);
	}

	.artist-footer__inner {
		display: grid;
		grid-template-columns: 1.5fr 1fr 0.75fr;
		gap: 3rem;
	}

	.artist-footer__wordmark {
		font-size: 2.5rem;
		font-weight: 600;
		letter-spacing: -0.075em;
		line-height: 1;
		text-decoration: none;
	}

	.artist-footer__brand p {
		max-width: 23rem;
		margin: 1.25rem 0 0;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.8;
		color: var(--paper);
	}

	.artist-footer h2 {
		margin: 0 0 1.25rem;
		font-family: var(--font-sans);
		font-size: 0.6rem;
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--sage);
	}

	.artist-footer nav a {
		display: block;
		width: fit-content;
		padding-block: 0.6rem;
		font-family: var(--font-sans);
		font-size: 0.72rem;
		line-height: 1.6;
		text-decoration: none;
	}

	.artist-footer nav a:hover,
	.artist-footer nav a:focus-visible {
		text-decoration: underline;
		text-underline-offset: 5px;
	}

	.artist-footer__bottom {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #ffffff25;
		font-family: var(--font-sans);
		font-size: 0.6rem;
		opacity: 0.65;
	}

	@media (max-width: 900px) {
		.artist-footer__inner {
			grid-template-columns: 1fr 1fr;
			gap: 2.5rem;
		}

		.artist-footer__brand {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 600px) {
		.artist-footer {
			padding-top: 3rem;
		}

		.artist-footer__inner {
			gap: 2rem 1rem;
		}
	}
</style>
