<script lang="ts">
	import { resolve } from '$app/paths';
	import { useShop } from '$lib/commerce/shop.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	const shop = useShop();
	let error = $state('');
</script>

<svelte:head
	><title>Your account — Seal Stuff</title><meta name="robots" content="noindex" /></svelte:head
>
<main id="main-content" class="shop-page wrap">
	<section class="account-panel">
		<Icon name="user" size={36} />

		<h1>Your account</h1>
		<p>View your orders, delivery updates and account details.</p>
		{#if shop.config.live && shop.config.accountUrl}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External hosted URL. -->
			<a class="button" href={shop.config.accountUrl}
				>Sign in or create an account <Icon name="arrow" size={18} /></a
			>
		{:else}<button
				class="button"
				onclick={() => (error = 'Sign-in is unavailable. Please try again later.')}
				>Sign in or create an account <Icon name="arrow" size={18} /></button
			>{/if}{#if error}<p class="error-message" role="alert">{error}</p>{/if}<a
			class="text-link"
			href={resolve('/help')}>Need help?</a
		>
	</section>
</main>

<style>
	.account-panel {
		max-width: 620px;
		margin: 5rem auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.account-panel h1 {
		margin: 0;
		font-size: 4.5rem;
	}
	.account-panel > p:not(.eyebrow) {
		font-size: 0.85rem;
		max-width: 31rem;
	}
	.account-panel .text-link {
		margin-top: 1rem;
	}
</style>
