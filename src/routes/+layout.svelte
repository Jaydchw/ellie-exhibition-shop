<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/images/mural-concepts/ladybird-illustration.png';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import SiteHeader from '$lib/components/site-header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<a class="skip-link" href="#main-content">Skip to content</a>
<div class="site-shell">
	<SiteHeader />
	{@render children()}
	<SiteFooter />
</div>
