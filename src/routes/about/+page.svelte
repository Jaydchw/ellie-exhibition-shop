<script lang="ts">
	import { resolve } from '$app/paths';
	import { artistBio } from '$lib/bio';
	import Icon from '$lib/components/shop/icon.svelte';
	import Seo from '$lib/components/seo.svelte';
	import ImageViewer from '$lib/components/ui/image-viewer.svelte';
	let { data } = $props();
	let content = $derived(data.content);
	let zoom = $state(false);
	let paragraphs = $derived(
		content.aboutText.split(/\n\s*\n/).filter((text: string) => text.trim())
	);
</script>

<Seo
	title={`${content.aboutTitle} - About the artist | Seal Stuff`}
	description={content.aboutText}
	image={content.aboutImage || artistBio.profileImage}
/>

<main id="main-content" class="shop-page wrap">
	<section class="about-hero">
		<div class="about-copy">
			<p class="eyebrow">About the artist</p>
			<h1>{content.aboutTitle}</h1>
			<div class="about-text">
				{#each paragraphs as paragraph, index (index)}<p>{paragraph}</p>{/each}
			</div>
			<div class="about-links">
				<a class="text-link" href={resolve('/shop')}
					>Visit the shop <Icon name="arrow" size={17} /></a
				>
				<a class="text-link" href={resolve('/murals')}
					>Murals & commissions <Icon name="arrow" size={17} /></a
				>
			</div>
		</div>
		<figure class="portrait" class:uploaded={!!content.aboutImage}>
			<button
				type="button"
				class="portrait-image"
				aria-label="Enlarge artist portrait"
				onclick={() => (zoom = true)}
			>
				<img
					src={content.aboutImage?.url ?? artistBio.profileImage}
					alt={content.aboutImage
						? (content.aboutImage.altText ?? content.aboutTitle)
						: 'Ellie Seal, artist and mural painter'}
				/>
				<span><Icon name="zoom" size={20} /></span>
			</button>
		</figure>
	</section>
</main>
<ImageViewer
	bind:open={zoom}
	src={content.aboutImage?.url ?? artistBio.profileImage}
	alt={content.aboutImage?.altText ?? 'Ellie Seal, artist and mural painter'}
/>

<style>
	.about-hero {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		align-items: center;
		gap: clamp(2rem, 7vw, 7rem);
		padding-block: clamp(3rem, 7vw, 7rem) 6rem;
	}
	.about-copy {
		min-width: 0;
	}
	.about-hero h1 {
		font-size: clamp(3.5rem, 7vw, 7rem);
		max-width: 12ch;
		text-wrap: balance;
		overflow-wrap: anywhere;
		margin-bottom: 2rem;
	}
	.about-text {
		max-width: 33rem;
	}
	.about-text p {
		font-size: 0.88rem;
		color: var(--body);
		white-space: pre-line;
		margin: 0 0 1.35rem;
	}
	.about-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		margin-top: 2rem;
	}
	.about-links a {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		min-height: 44px;
	}
	.portrait {
		margin: 0;
		align-self: start;
		background: var(--sage-light);
		border-radius: 45% 45% 0 0;
		aspect-ratio: 0.82;
		overflow: hidden;
	}
	.portrait img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: bottom;
	}
	.portrait-image {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: zoom-in;
	}
	.portrait-image span {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: #f7f3ecdf;
		color: var(--navy);
	}
	.portrait.uploaded {
		background: none;
		border-radius: 0;
	}
	@media (max-width: 760px) {
		.about-hero {
			grid-template-columns: 1fr;
			gap: 2rem;
			padding-bottom: 3rem;
		}
		.portrait {
			max-width: 28rem;
			width: 100%;
		}
		.about-hero h1 {
			margin-bottom: 1.5rem;
		}
	}
</style>
