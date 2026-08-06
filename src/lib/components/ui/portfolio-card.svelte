<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRight from 'phosphor-svelte/lib/ArrowRight';

	let {
		eyebrow,
		title,
		description,
		href,
		linkLabel,
		image,
		alt,
		tone = 'sage'
	}: {
		eyebrow: string;
		title: string;
		description: string;
		href: '/art' | '/murals';
		linkLabel: string;
		image: string;
		alt: string;
		tone?: 'sage' | 'blush';
	} = $props();
</script>

<a class="portfolio-card portfolio-card--{tone}" href={resolve(href)} aria-label={linkLabel}>
	<div class="portfolio-card__image"><img src={image} {alt} /></div>
	<div class="portfolio-card__copy">
		<p class="eyebrow">{eyebrow}</p>
		<h2>{title}</h2>
		<p class="description">{description}</p>
		<span class="card-link"
			>{linkLabel} <ArrowRight size={19} weight="bold" aria-hidden="true" /></span
		>
	</div>
</a>

<style>
	.portfolio-card {
		display: grid;
		grid-template-rows: auto 1fr;
		color: inherit;
		text-decoration: none;
		transition: opacity 180ms ease;
	}

	.portfolio-card:hover {
		opacity: 0.92;
	}

	.portfolio-card__image {
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: var(--stone);
	}

	.portfolio-card__image img {
		display: block;
		height: 100%;
		width: 100%;
		object-fit: cover;
		transition: transform 500ms ease;
	}

	.portfolio-card:hover img {
		transform: scale(1.025);
	}

	.portfolio-card__copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: start;
		padding: 1.25rem 0 0;
	}

	.eyebrow,
	.description {
		margin: 0;
	}

	.eyebrow {
		color: var(--moss);
		font-family: var(--font-sans);
		font-size: 0.71rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0.45rem 0 0.7rem;
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: clamp(2.6rem, 5vw, 4.2rem);
		font-weight: 600;
		line-height: 0.85;
	}

	.description {
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.96rem;
		line-height: 1.65;
	}

	.card-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: 1.4rem;
		border-bottom: 1px solid currentColor;
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 800;
		padding-bottom: 0.22rem;
	}
</style>
