<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/seo.svelte';
	import MuralPage from '$lib/components/murals/mural-page.svelte';
	import { muralPageCopy } from '$lib/content/murals';
	import { absoluteImageUrl, breadcrumbStructuredData, canonicalUrl } from '$lib/seo';
	let siteUrl = $derived(page.data.siteUrl ?? page.url.origin);
	let structuredData = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'Service',
			'@id': canonicalUrl(siteUrl, '/murals') + '#service',
			name: 'Custom mural painting by Ellie Seal',
			serviceType: 'Mural painting',
			url: canonicalUrl(siteUrl, '/murals'),
			description: muralPageCopy.metaDescription,
			image: absoluteImageUrl(siteUrl, muralPageCopy.hero.image),
			provider: { '@type': 'Person', name: 'Ellie Seal', url: canonicalUrl(siteUrl) }
		},
		breadcrumbStructuredData(siteUrl, [
			{ name: 'Home', path: '/' },
			{ name: 'Murals', path: '/murals' }
		])
	]);
</script>

<Seo
	title="Custom murals & wall art | Ellie Seal"
	description={muralPageCopy.metaDescription}
	image={muralPageCopy.hero.image}
	{structuredData}
/>
<MuralPage />
