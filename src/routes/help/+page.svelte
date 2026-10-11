<script lang="ts">
	import { resolve } from '$app/paths';
	import { shopCopy } from '$lib/content/shop';
	import { page } from '$app/state';
	import { isClothing } from '$lib/commerce/presentation';
	let hasClothing = $derived(page.data.products?.some(isClothing) ?? false);
	let faqs = $derived(shopCopy.faqs.filter((faq) => faq.category !== 'clothing' || hasClothing));
</script>

<svelte:head
	><title>Help — Delivery, sizes & finishes — Seal Stuff</title><meta
		name="description"
		content="Find your print size and finish, learn about international delivery, or get in touch with Seal Stuff."
	/></svelte:head
>
<main id="main-content" class="shop-page wrap">
	<section class="page-intro">
		<h1>Help</h1>
		<p>Delivery, sizes, product care and contact details.</p>
	</section>
	<div class="help-layout">
		<nav aria-label="Help topics">
			<a href="#questions">Your questions</a><a href="#sizes">Sizes & finishes</a><a href="#contact"
				>Get in touch</a
			><a href={resolve('/policies')}>Shop policies</a>
		</nav>
		<div>
			<section id="questions">
				<h2>Frequently asked questions</h2>
				{#each faqs as faq (faq.title)}<details class="help-details">
						<summary>{faq.title}</summary>
						<p>{faq.body}</p>
					</details>{/each}
			</section>
			<section id="sizes">
				<h2>Print sizes & finishes</h2>
				<p>
					Our starting collection offers three familiar paper sizes. Check each product for current
					options. The artwork may be landscape or portrait; the dimensions below are the short and
					long edges.
				</p>
				<div class="size-diagram" aria-hidden="true">
					<div class="a2">
						A2
						<div class="a3">
							A3
							<div class="a4">A4</div>
						</div>
					</div>
				</div>
				<table>
					<thead><tr><th>Size</th><th>Paper dimensions</th><th>Suggested use</th></tr></thead><tbody
						><tr><td>A4</td><td>21 × 29.7 cm</td><td>Shelves, desks, small walls</td></tr><tr
							><td>A3</td><td>29.7 × 42 cm</td><td>Gallery walls, reading corners</td></tr
						><tr><td>A2</td><td>42 × 59.4 cm</td><td>Feature walls, above furniture</td></tr></tbody
					>
				</table>
				<p class="small muted">
					Frames add to the outside measurements. Borders and image proportions depend on the
					artwork and approved print file. Check the product specification before ordering.
				</p>
				<div class="finish-guide">
					<div>
						<h3>Posters</h3>
						<p>Delivered unframed. Available in A4, A3 and A2.</p>
					</div>
					<div>
						<h3>Fine art prints</h3>
						<p>Giclée prints on matte art paper.</p>
					</div>
					<div>
						<h3>Framed prints</h3>
						<p>
							A print and frame together. Start with black, natural or white; find the available
							finishes on each piece.
						</p>
					</div>
				</div>
			</section>
			<section id="contact" class="help-contact">
				<h2>Contact</h2>
				<p>
					Questions about a piece or an order? Email Ellie. For an existing order, include your
					order number so we can help.
				</p>
				<a class="button" href={'mailto:' + shopCopy.email}>{shopCopy.email}</a>
			</section>
		</div>
	</div>
</main>

<style>
	.help-layout {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 5rem;
		padding: 1rem 0 5rem;
	}
	.help-layout > nav {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		align-self: start;
		position: sticky;
		top: 8rem;
	}
	.help-layout > nav a {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		text-underline-offset: 5px;
	}
	.help-layout section {
		scroll-margin-top: 8rem;
		margin-bottom: 4rem;
	}
	.help-layout p {
		font-size: 0.85rem;
		color: var(--body);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.75rem;
	}
	th,
	td {
		text-align: left;
		padding: 1rem 0.5rem;
		border-bottom: 1px solid var(--line);
	}
	.size-diagram {
		display: grid;
		place-items: center;
		background: var(--stone);
		padding: 2rem;
		margin: 2rem 0;
	}
	.a2 {
		position: relative;
		width: 220px;
		height: 280px;
		background: #b8c1a6;
		border: 1px solid #6f7a5d;
		padding: 1rem;
	}
	.a3 {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 71%;
		height: 71%;
		background: #e3e5d8;
		border: 1px solid #6f7a5d;
		padding: 1rem;
	}
	.a4 {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 71%;
		height: 71%;
		background: var(--paper);
		border: 1px solid #6f7a5d;
		padding: 1rem;
	}
	.finish-guide {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-top: 2rem;
	}
	.finish-guide p {
		font-size: 0.75rem;
	}
	.help-contact {
		background: var(--sage-light);
		padding: 2.5rem;
	}
	.help-contact .button {
		font-size: 0.75rem;
		padding-inline: 1rem;
	}
	@media (max-width: 760px) {
		.help-layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		.help-layout > nav {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 1rem;
		}
		.finish-guide {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		.help-contact {
			padding: 1.5rem;
		}
		th,
		td {
			font-size: 0.65rem;
			padding: 0.75rem 0.25rem;
		}
	}
</style>
