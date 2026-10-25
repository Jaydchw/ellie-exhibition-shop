<script lang="ts">
	import { shopContactUrl } from '$lib/content/site';
	let { shopUrl }: { shopUrl: string | null } = $props();
</script>

<footer class="artist-footer">
	<div class="footer-inner wrap">
		<span class="copyright">© {new Date().getFullYear()} Ellie Seal</span>
		<nav aria-label="Contact and shop policies">
			<!-- eslint-disable svelte/no-navigation-without-resolve -- Requested Shopify contact page and validated native privacy destinations. -->
			<a href={shopContactUrl}>Contact Ellie</a>
			{#if shopUrl}
				<a href={shopUrl + 'policies/privacy-policy'}>Privacy policy</a>
				<a href={shopUrl + 'pages/data-sharing-opt-out'}>Your privacy choices</a>
			{/if}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</nav>
		<p class="credit">Created by <a href="https://jaydchw.com">Jayden Holdsworth</a></p>
	</div>
</footer>

<style>
	.artist-footer {
		border-top: 1px solid var(--line);
		background: var(--paper);
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.65rem;
		line-height: 1.6;
	}

	.footer-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1.5rem;
		padding-block: 0.75rem;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.25rem;
	}

	a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		text-decoration: none;
	}

	a:hover,
	a:focus-visible {
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.credit {
		margin: 0;
	}

	@media (max-width: 600px) {
		.footer-inner {
			justify-content: flex-start;
			gap: 0 1.5rem;
			padding-block: 1rem;
		}

		nav {
			flex-basis: 100%;
		}
	}
</style>
