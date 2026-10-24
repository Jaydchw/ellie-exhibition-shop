<script lang="ts">
	import { resolve } from '$app/paths';
	import { socialLinks } from '$lib/content/site';
	import Seo from '$lib/components/seo.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	let { data } = $props();
</script>

<Seo
	title={data.contactSeo?.title?.trim() || 'Contact Ellie Seal | Seal Stuff'}
	description={data.contactSeo?.description?.trim() ||
		'Contact Ellie Seal about original paintings, prints, your order or a mural commission.'}
/>

<main id="main-content" class="shop-page wrap">
	<section class="contact-intro">
		<p class="eyebrow">Contact Ellie</p>
		<h1>{data.contactTitle}</h1>
		{#if data.contactParagraphs.length}
			{#each data.contactParagraphs as paragraph, index (index)}
				<p class="contact-copy">{paragraph}</p>
			{/each}
		{:else}
			<p class="contact-copy">
				A question about a piece, an order or a wall you have in mind? Send Ellie a message.
			</p>
		{/if}
	</section>

	<div class="contact-layout">
		<section class="contact-details" aria-labelledby="contact-email">
			<h2 id="contact-email">Say hello</h2>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Artist's external email address. -->
			<a class="contact-email" href={socialLinks.email.href}>{socialLinks.email.handle}</a>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Artist's external Instagram profile. -->
			<a class="social-link" href={socialLinks.instagram.href} target="_blank" rel="noreferrer">
				Instagram · {socialLinks.instagram.handle}<Icon name="arrow" size={17} />
			</a>
		</section>
		<section class="enquiries" aria-label="What can Ellie help with?">
			<div>
				<h2>Your order</h2>
				<p>Include your order number and the email used at checkout so Ellie can find it.</p>
				<a class="text-link" href={resolve('/help')}
					>Delivery & order help <Icon name="arrow" size={16} /></a
				>
			</div>
			<div>
				<h2>Murals & commissions</h2>
				<p>
					Tell Ellie about your space, its location and what you have in mind. Photos and wall
					measurements are a useful start.
				</p>
				<a class="text-link" href={resolve('/murals')}
					>Explore murals <Icon name="arrow" size={16} /></a
				>
			</div>
		</section>
	</div>
</main>

<style>
	.contact-intro {
		max-width: 43rem;
		padding-block: 3rem 2rem;
	}
	.eyebrow {
		font-family: var(--font-sans);
		font-size: 0.68rem;
		color: var(--moss);
		margin: 0 0 0.75rem;
	}
	h1 {
		font-size: clamp(2.5rem, 5vw, 4rem);
		line-height: 1.05;
		margin: 0 0 1.25rem;
	}
	.contact-copy {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		line-height: 1.9;
		color: var(--body);
		white-space: pre-line;
	}
	.contact-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: clamp(2rem, 7vw, 6rem);
		padding-block: 2rem 5rem;
		border-top: 1px solid var(--line);
	}
	h2 {
		font-size: 1.6rem;
		line-height: 1.2;
		margin: 0 0 0.8rem;
	}
	.contact-email {
		display: block;
		font-size: clamp(1.5rem, 3vw, 2.2rem);
		text-underline-offset: 7px;
		overflow-wrap: anywhere;
		margin-bottom: 1.25rem;
	}
	.social-link,
	.text-link {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 44px;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		text-underline-offset: 5px;
	}
	.enquiries {
		display: grid;
		gap: 2rem;
	}
	.enquiries p {
		font-family: var(--font-sans);
		font-size: 0.8rem;
		line-height: 1.85;
		color: var(--body);
		margin: 0 0 0.5rem;
	}
	@media (max-width: 700px) {
		.contact-intro {
			padding-top: 2rem;
		}
		.contact-layout {
			grid-template-columns: 1fr;
			padding-bottom: 3rem;
		}
	}
</style>
