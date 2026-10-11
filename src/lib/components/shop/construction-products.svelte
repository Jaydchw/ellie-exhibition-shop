<script lang="ts">
	import { artworks } from '$lib/art';
	import ArtDisplay from './art-display.svelte';

	const finishes = ['Natural frame', 'Black frame', 'White frame'];
</script>

<div class="construction-products" aria-hidden="true" inert>
	<div class="catalogue-wrap">
		<div class="catalogue-intro">
			<h2>Shop</h2>
			<p>Prints &amp; framed artwork</p>
		</div>
		<div class="catalogue-grid">
			{#each artworks as artwork, index (artwork.id)}
				<figure class="catalogue-card">
					<div class="artwork-mount">
						<ArtDisplay
							src={artwork.image}
							alt=""
							finish={finishes[index % finishes.length]}
							eager={index < 3}
						/>
					</div>
					<figcaption>
						{artwork.status === 'placeholder-title' ? 'Framed artwork' : artwork.title}
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</div>

<style>
	.construction-products {
		width: 100%;
		min-height: 100%;
		padding-block: 2.25rem 3rem;
		background: var(--paper);
		color: var(--navy);
		pointer-events: none;
		user-select: none;
	}

	.catalogue-wrap {
		width: min(1180px, calc(100% - 6rem));
		margin-inline: auto;
	}

	.catalogue-intro {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.5rem;
		padding-bottom: 1.5rem;
		margin-bottom: 1.75rem;
		border-bottom: 1px solid var(--line);
	}

	.catalogue-intro h2 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(3.5rem, 6vw, 5rem);
		font-weight: 500;
		letter-spacing: -0.045em;
		line-height: 1;
	}

	.catalogue-intro p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.5;
	}

	.catalogue-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 2rem 1.5rem;
	}

	.catalogue-card {
		min-width: 0;
		margin: 0;
	}

	.artwork-mount {
		display: grid;
		place-items: center;
		aspect-ratio: 1.08;
		padding: clamp(1.1rem, 3.1vw, 2.8rem);
		background: #eae5dc;
	}

	.catalogue-card:nth-child(3n + 2) .artwork-mount {
		background: #e0e5d8;
	}

	.catalogue-card:nth-child(3n) .artwork-mount {
		background: #ebe8e1;
	}

	figcaption {
		margin-top: 0.8rem;
		font-family: var(--font-serif);
		font-size: clamp(1rem, 1.55vw, 1.35rem);
		font-weight: 500;
		line-height: 1.2;
	}

	@media (max-width: 760px) {
		.catalogue-wrap {
			width: calc(100% - 2.5rem);
		}

		.catalogue-intro {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.65rem;
			padding-bottom: 1.25rem;
			margin-bottom: 1.25rem;
		}

		.catalogue-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1.5rem 0.85rem;
		}

		.artwork-mount {
			padding: clamp(0.7rem, 3vw, 1.4rem);
		}
	}
</style>
