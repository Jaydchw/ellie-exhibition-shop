<script lang="ts">
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/seo.svelte';
	import { openPrivacySettings, openDataSharingSettings } from '$lib/commerce/privacy';
	let { data } = $props();
</script>

<Seo
	title="Shop policies | Seal Stuff"
	description="Privacy, delivery, returns and terms for shopping with Ellie Seal."
	noindex={data.policies.length === 0}
/>
<main id="main-content" class="shop-page wrap">
	<section class="policy-index">
		<h1>Shop policies</h1>
		{#if data.policies.length}
			<nav aria-label="Shop policies">
				{#each data.policies as policy (policy.handle)}
					<a href={resolve('/policies/[handle]', { handle: policy.handle })}>
						{policy.title}<span aria-hidden="true">↗</span>
					</a>
				{/each}
			</nav>
		{:else}
			<p>
				Shop policies are not available yet. <a href={resolve('/help#contact')}>Contact Ellie</a>.
			</p>
		{/if}
		<div class="privacy-settings">
			<h2>Your privacy choices</h2>
			<button type="button" onclick={openPrivacySettings}>Cookie preferences</button>
			<button type="button" onclick={openDataSharingSettings}>Data sharing preferences</button>
		</div>
	</section>
</main>

<style>
	.policy-index {
		max-width: 42rem;
		padding-block: 2.5rem 5rem;
	}
	h1 {
		margin: 0 0 2rem;
		font-size: clamp(2rem, 4vw, 3rem);
	}
	nav {
		display: grid;
		border-top: 1px solid var(--line);
	}
	nav a {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.2rem 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		font-size: 1rem;
	}
	nav a:hover {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	nav span {
		color: var(--moss);
	}
	.privacy-settings {
		margin-top: 3rem;
	}
	h2 {
		font-size: 1.4rem;
	}
	button {
		display: block;
		min-height: 44px;
		border: 0;
		padding: 0.4rem 0;
		background: none;
		font: 400 0.8rem var(--font-sans);
		color: var(--navy);
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
	}
	p {
		color: var(--body);
		font-size: 0.85rem;
	}
</style>
