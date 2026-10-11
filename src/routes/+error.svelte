<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head
	><title>{page.status} — Seal Stuff</title><meta name="robots" content="noindex" /></svelte:head
>
<main id="main-content" class="shop-page wrap">
	<div class="empty-state">
		<p class="eyebrow">{page.status}</p>
		<h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
		<p>{page.error?.message ?? 'Something went wrong. Please try again.'}</p>
		<a class="button" href={resolve('/shop')}>Back to shop</a>
	</div>
</main>
