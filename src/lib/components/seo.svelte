<script lang="ts">
	import { page } from '$app/state';
	import type { ProductImage } from '$lib/commerce/types';
	import {
		absoluteImageUrl,
		canonicalUrl,
		hasSearchFacets,
		safeJsonLd,
		searchDescription
	} from '$lib/seo';
	import fallbackImage from '$lib/assets/images/murals/ellie-seal-mural-artist.png';
	let {
		title,
		description,
		image = null,
		type = 'website',
		noindex = false,
		structuredData
	}: {
		title: string;
		description: string;
		image?: ProductImage | string | null;
		type?: 'website' | 'product' | 'article';
		noindex?: boolean;
		structuredData?: unknown;
	} = $props();
	let origin = $derived(page.data.siteUrl || page.url.origin);
	let canonical = $derived(canonicalUrl(origin, page.url.pathname));
	let summary = $derived(
		searchDescription(
			description,
			'Original paintings, art prints and custom murals by Ellie Seal.'
		)
	);
	let imageUrl = $derived(absoluteImageUrl(origin, image || fallbackImage));
	let imageAlt = $derived(typeof image === 'object' && image ? image.altText || title : title);
	let excluded = $derived(
		noindex ||
			page.data.indexableDeployment === false ||
			page.status >= 400 ||
			hasSearchFacets(page.url)
	);
	let jsonLd = $derived(
		structuredData
			? '<script type="application/ld+json">' + safeJsonLd(structuredData) + '</' + 'script>'
			: ''
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={summary} />
	<link rel="canonical" href={canonical} />
	<meta
		name="robots"
		content={excluded ? 'noindex, follow' : 'index, follow, max-image-preview:large'}
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={summary} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content="en_GB" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={summary} />
	{#if imageUrl}
		<meta property="og:image" content={imageUrl} />
		<meta property="og:image:alt" content={imageAlt} />
		<meta name="twitter:image" content={imageUrl} />
		<meta name="twitter:image:alt" content={imageAlt} />
	{/if}
	{#if jsonLd}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Serialized structured data escapes script delimiters. -->
		{@html jsonLd}
	{/if}
</svelte:head>
