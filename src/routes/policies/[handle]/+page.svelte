<script lang="ts">
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/seo.svelte';
	import PolicyContent from '$lib/components/ui/policy-content.svelte';
	import { openPrivacySettings, openDataSharingSettings } from '$lib/commerce/privacy';
	let { data } = $props();
</script>

<Seo title={`${data.policy.title} | Seal Stuff`} description={data.policy.description} />
<main id="main-content" class="shop-page wrap">
	<div class="policy-layout">
		<nav aria-label="Shop policies">
			<a href={resolve('/policies')}>All policies</a>
			{#each data.policies as policy (policy.handle)}
				<a
					href={resolve('/policies/[handle]', { handle: policy.handle })}
					aria-current={policy.handle === data.policy.handle ? 'page' : undefined}>{policy.title}</a
				>
			{/each}
		</nav>
		<article>
			<h1>{data.policy.title}</h1>
			<div class="policy-body"><PolicyContent nodes={data.policy.content} /></div>
			{#if data.policy.handle === 'privacy-policy'}
				<div class="privacy-settings">
					<button type="button" onclick={openPrivacySettings}>Cookie preferences</button>
					<button type="button" onclick={openDataSharingSettings}>Data sharing preferences</button>
				</div>
			{/if}
		</article>
	</div>
</main>

<style>
	.policy-layout {
		display: grid;
		grid-template-columns: 12rem minmax(0, 44rem);
		gap: clamp(2rem, 6vw, 6rem);
		padding-block: 2.5rem 5rem;
	}
	nav {
		align-self: start;
		display: grid;
		gap: 0.25rem;
		position: sticky;
		top: 8rem;
	}
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font: 400 0.75rem var(--font-sans);
		text-decoration: none;
	}
	nav a[aria-current],
	nav a:hover {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	h1 {
		margin: 0 0 2rem;
		font-size: clamp(2rem, 4vw, 3rem);
	}
	.policy-body {
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.85rem;
		line-height: 1.9;
		overflow-wrap: anywhere;
	}
	.policy-body :global(p) {
		margin: 0 0 1.2rem;
	}
	.policy-body :global(h2),
	.policy-body :global(h3),
	.policy-body :global(h4),
	.policy-body :global(h5),
	.policy-body :global(h6) {
		margin: 2rem 0 0.9rem;
		font-family: var(--font-serif);
		font-size: 1.5rem;
		color: var(--navy);
		line-height: 1.3;
	}
	.policy-body :global(li) {
		margin-block: 0.4rem;
	}
	.policy-body :global(a) {
		color: var(--navy);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.policy-body :global(table) {
		display: block;
		max-width: 100%;
		overflow-x: auto;
		border-collapse: collapse;
	}
	.policy-body :global(th),
	.policy-body :global(td) {
		padding: 0.65rem;
		text-align: left;
		border: 1px solid var(--line);
	}
	.policy-body :global(blockquote) {
		margin-inline: 0;
		padding-left: 1.25rem;
		border-left: 2px solid var(--line);
	}
	.privacy-settings {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		border-top: 1px solid var(--line);
		margin-top: 2rem;
		padding-top: 1rem;
	}
	button {
		min-height: 44px;
		border: 0;
		padding: 0.4rem 0;
		background: none;
		font: 400 0.75rem var(--font-sans);
		color: var(--navy);
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
	}
	@media (max-width: 760px) {
		.policy-layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
		nav {
			position: static;
			display: flex;
			flex-wrap: wrap;
			gap: 0 1.5rem;
		}
	}
</style>
