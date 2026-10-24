<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/seo.svelte';
	import MuralPage from '$lib/components/murals/mural-page.svelte';
	import { hullMuralCopy } from '$lib/content/hull-murals';
	import { absoluteImageUrl, breadcrumbStructuredData, canonicalUrl } from '$lib/seo';
	let siteUrl = $derived(page.data.siteUrl ?? page.url.origin);
	let structuredData = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'Service',
			'@id': canonicalUrl(siteUrl, '/murals/hull') + '#service',
			name: 'Custom mural painting in Hull',
			serviceType: 'Mural painting',
			url: canonicalUrl(siteUrl, '/murals/hull'),
			description: hullMuralCopy.metaDescription,
			image: absoluteImageUrl(siteUrl, hullMuralCopy.hero.image),
			provider: { '@type': 'Person', name: 'Ellie Seal', url: canonicalUrl(siteUrl) },
			areaServed: { '@type': 'City', name: 'Kingston upon Hull' }
		},
		breadcrumbStructuredData(siteUrl, [
			{ name: 'Home', path: '/' },
			{ name: 'Murals', path: '/murals' },
			{ name: 'Hull', path: '/murals/hull' }
		])
	]);
</script>

<Seo
	title="Mural artist in Hull | Custom wall art by Ellie Seal"
	description={hullMuralCopy.metaDescription}
	image={hullMuralCopy.hero.image}
	{structuredData}
/>
<MuralPage local />
