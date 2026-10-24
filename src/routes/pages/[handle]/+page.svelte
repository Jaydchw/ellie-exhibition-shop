<script lang="ts">
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/seo.svelte';
	let { data } = $props();
</script>

<Seo
	title={data.merchantPage?.seo?.title?.trim() ||
		`${data.merchantPage?.title ?? 'Page'} - Seal Stuff`}
	description={data.merchantPage?.seo?.description?.trim() ||
		data.merchantPage?.paragraphs.join(' ') ||
		'Information from the Ellie Seal studio.'}
/>
<main id="main-content" class="shop-page wrap">
	{#if data.merchantPage}
		<article>
			<a class="text-link" href={resolve('/shop')}>Back to shop</a>
			<h1>{data.merchantPage.title}</h1>
			{#each data.merchantPage.paragraphs as paragraph, index (index)}<p>{paragraph}</p>{/each}
		</article>
	{/if}
</main>

<style>
	article {
		max-width: 45rem;
		padding-block: 4rem 6rem;
	}
	p {
		color: var(--body);
		font-size: 0.9rem;
		white-space: pre-line;
	}
</style>
