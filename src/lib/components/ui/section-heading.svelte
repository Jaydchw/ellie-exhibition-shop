<script lang="ts">
	let {
		eyebrow,
		title,
		description,
		align = 'left',
		level = 'h2',
		headingId
	}: {
		eyebrow?: string;
		title: string;
		description?: string;
		align?: 'left' | 'center';
		level?: 'h1' | 'h2' | 'h3';
		headingId?: string;
	} = $props();
</script>

<div class:section-heading--center={align === 'center'} class="section-heading">
	{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
	<svelte:element this={level} id={headingId}>{title}</svelte:element>
	{#if description}<p class="section-description">{description}</p>{/if}
</div>

<style>
	.section-heading {
		display: grid;
		gap: 0.72rem;
		max-width: 44rem;
	}

	.section-heading--center {
		margin-inline: auto;
		text-align: center;
	}

	.eyebrow,
	.section-description {
		margin: 0;
	}

	.eyebrow {
		color: var(--moss);
		font-family: var(--font-sans);
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3 {
		margin: 0;
		color: var(--navy);
		font-family: var(--font-serif);
		font-weight: 600;
		letter-spacing: -0.025em;
	}

	h1 {
		font-size: clamp(3.8rem, 9vw, 7.2rem);
		line-height: 0.82;
	}

	h2 {
		font-size: clamp(2.65rem, 6vw, 4.6rem);
		line-height: 0.9;
	}

	h3 {
		font-size: clamp(2rem, 4vw, 3rem);
		line-height: 0.95;
	}

	.section-description {
		color: var(--body);
		font-family: var(--font-sans);
		font-size: clamp(1rem, 2vw, 1.12rem);
		line-height: 1.7;
	}

	@media (max-width: 480px) {
		h1 {
			font-size: clamp(3.2rem, 16vw, 4.4rem);
			line-height: 0.86;
		}

		h2 {
			font-size: clamp(2.35rem, 13vw, 3rem);
		}
	}
</style>
