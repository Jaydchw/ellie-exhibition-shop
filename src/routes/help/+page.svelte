<script lang="ts">
	import { resolve } from '$app/paths';
	import { shopCopy } from '$lib/content/shop';
	import Seo from '$lib/components/seo.svelte';
	let { data } = $props();
</script>

<Seo
	title="Delivery, print sizes & order help | Seal Stuff"
	description="Questions about art prints, original paintings and your order? Find delivery information, A4 and A3 print sizes, answers and contact details for Ellie Seal."
/>

<main id="main-content" class="shop-page wrap">
	<section class="page-intro"><h1>A little help.</h1></section>
	<div class="help-layout">
		<nav aria-label="Help topics">
			<a href="#questions">Your questions</a>
			<a href="#sizes">Print sizes</a>
			<a href="#contact">Get in touch</a>
			<a href={resolve('/policies')}>Shop policies</a>
		</nav>
		<div>
			<section id="questions" aria-label="Frequently asked questions">
				<dl class="faq-list">
					{#each data.content.faqs as faq (faq.id)}
						<div>
							<dt>{faq.title}</dt>
							<dd>{faq.body}</dd>
						</div>
					{/each}
				</dl>
			</section>
			<section id="sizes" class="size-guide">
				<div>
					<h2>Print sizes</h2>
					<table>
						<thead><tr><th>Size</th><th>Paper dimensions</th></tr></thead>
						<tbody
							><tr><td>A4</td><td>21 × 29.7 cm</td></tr><tr><td>A3</td><td>29.7 × 42 cm</td></tr
							></tbody
						>
					</table>
					<p class="size-note">
						Available sizes, finishes and original painting dimensions are listed on each piece.
					</p>
				</div>
				<div class="size-diagram" aria-hidden="true">
					<div class="a3">
						A3
						<div class="a4">A4</div>
					</div>
				</div>
			</section>
			<section id="contact" class="help-contact">
				<h2>Get in touch</h2>
				<a class="text-link" href={'mailto:' + shopCopy.email}>{shopCopy.email}</a>
			</section>
		</div>
	</div>
</main>

<style>
	.help-layout {
		display: grid;
		grid-template-columns: 12rem minmax(0, 1fr);
		gap: clamp(2rem, 7vw, 6rem);
		padding: 0 0 4rem;
	}
	.help-layout > nav {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
		align-self: start;
		position: sticky;
		top: 8rem;
	}
	.help-layout > nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		text-underline-offset: 5px;
	}
	.help-layout section {
		scroll-margin-top: 8rem;
	}
	.faq-list {
		margin: 0;
	}
	.faq-list > div {
		display: grid;
		grid-template-columns: 0.9fr 1.3fr;
		gap: 2rem;
		padding-block: 1.65rem;
		border-top: 1px solid var(--line);
	}
	.faq-list dt {
		font-size: 1.35rem;
		line-height: 1.3;
		text-wrap: pretty;
	}
	.faq-list dd {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.8rem;
		line-height: 1.85;
		color: var(--body);
		white-space: pre-line;
	}
	.size-guide {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 11rem;
		gap: 2rem;
		align-items: center;
		padding-block: 3rem;
		margin-top: 1.5rem;
		border-top: 1px solid var(--line);
	}
	.size-guide h2,
	.help-contact h2 {
		font-size: 2.3rem;
		margin-top: 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.75rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--line);
	}
	th {
		font-weight: 500;
		color: var(--muted);
	}
	.size-note {
		font-size: 0.72rem;
		color: var(--muted);
		margin: 1rem 0 0;
		max-width: 26rem;
	}
	.size-diagram {
		display: grid;
		place-items: center;
		font-family: var(--font-sans);
		font-size: 0.65rem;
	}
	.a3 {
		position: relative;
		width: 10rem;
		aspect-ratio: 297 / 420;
		background: var(--sage-light);
		border: 1px solid var(--moss);
		padding: 0.75rem;
		text-align: right;
	}
	.a4 {
		position: absolute;
		bottom: -1px;
		left: -1px;
		width: 71%;
		height: 71%;
		background: var(--paper);
		border: 1px solid var(--moss);
		padding: 0.75rem;
		text-align: left;
	}
	.help-contact {
		padding-block: 2rem;
		border-top: 1px solid var(--line);
	}
	.help-contact a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		overflow-wrap: anywhere;
	}
	@media (max-width: 900px) {
		.faq-list > div {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
	}
	@media (max-width: 760px) {
		.help-layout {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		.help-layout > nav {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0 1.5rem;
		}
		.size-guide {
			grid-template-columns: minmax(0, 1fr) 7rem;
			gap: 1.2rem;
		}
		.a3 {
			width: 7rem;
		}
		.size-guide h2,
		.help-contact h2 {
			font-size: 2rem;
		}
	}
</style>
