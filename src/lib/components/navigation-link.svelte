<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { MenuLink } from '$lib/commerce/types';
	import { collectionUrl } from '$lib/commerce/collection-navigation';
	import NavigationLink from './navigation-link.svelte';
	let { link, depth = 0 }: { link: MenuLink; depth?: number } = $props();
	let details = $state<HTMLDetailsElement>();
	let localUrl = $derived(collectionUrl(link.url, page.data.collections ?? []));
	let href = $derived(localUrl.startsWith('/') ? resolve(localUrl as '/') : localUrl);
	let current = $derived(page.url.pathname + page.url.search === localUrl);
	$effect(() => {
		void page.url.href;
		if (details) details.open = false;
	});
</script>

{#if link.items.length && depth < 2}
	<details
		class="navigation-group"
		class:nested={depth > 0}
		name={depth === 0 ? 'main-navigation' : undefined}
		bind:this={details}
	>
		<summary>{link.title}<span aria-hidden="true">+</span></summary>
		<ul>
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Shopify URLs are normalized and internal URLs are resolved above. -->
				<a {href} aria-current={current ? 'page' : undefined}>View {link.title}</a>
			</li>
			{#each link.items as child (child.id)}
				<li><NavigationLink link={child} depth={depth + 1} /></li>
			{/each}
		</ul>
	</details>
{:else}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Shopify URLs are normalized and internal URLs are resolved above. -->
	<a {href} aria-current={current ? 'page' : undefined}>{link.title}</a>
{/if}

<style>
	a,
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		min-height: 44px;
		padding: 0.6rem 0;
		color: inherit;
		font-family: var(--font-sans);
		font-size: 0.74rem;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
	}
	a:hover,
	a[aria-current='page'],
	summary:hover {
		text-decoration: underline;
		text-underline-offset: 7px;
	}
	summary {
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary span {
		font-size: 1rem;
		line-height: 1;
		transition: transform 180ms;
	}
	details[open] > summary span {
		transform: rotate(45deg);
	}
	details {
		position: relative;
	}
	ul {
		position: absolute;
		top: 100%;
		left: -1.2rem;
		min-width: 13rem;
		max-width: min(22rem, 80vw);
		margin: 0;
		padding: 0.7rem 1.2rem;
		background: var(--paper);
		border: 1px solid var(--line);
		list-style: none;
	}
	ul a,
	.nested summary {
		white-space: normal;
	}
	.nested ul {
		position: static;
		min-width: 0;
		margin-left: 0.6rem;
		padding: 0 0 0 0.8rem;
		border: 0;
		border-left: 1px solid var(--line);
	}
	@media (max-width: 1050px) {
		a,
		summary {
			font-size: 0.9rem;
			white-space: normal;
		}
		ul {
			position: static;
			min-width: 0;
			max-width: none;
			margin: 0 0 0.5rem 0.3rem;
			padding: 0 0 0 1rem;
			border: 0;
			border-left: 1px solid var(--line);
		}
	}
</style>
