<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	let { shopUrl }: { shopUrl: string | null } = $props();
</script>

<nav class="artist-navigation wrap" aria-label="Artist website">
	<a class="home-link" href={resolve('/')}><span aria-hidden="true">←</span> Ellie Seal</a>
	<div class="destinations">
		<a
			href={resolve('/murals')}
			aria-current={page.url.pathname.startsWith('/murals') ? 'page' : undefined}>Murals</a
		>
		{#if shopUrl}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Validated native Shopify URL. -->
			<a href={shopUrl}>Shop <span aria-hidden="true">↗</span></a>
		{/if}
	</div>
</nav>

<style>
	.artist-navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 1rem;
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.78rem;
	}

	a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		text-decoration: none;
	}

	a:hover,
	a:focus-visible {
		text-decoration: underline;
		text-underline-offset: 5px;
	}

	.destinations {
		display: flex;
		gap: clamp(1rem, 4vw, 2rem);
	}

	.home-link {
		font-weight: 600;
	}
</style>
