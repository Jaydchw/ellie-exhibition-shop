<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { MenuLink } from '$lib/commerce/types';
	import { openPrivacySettings, openDataSharingSettings } from '$lib/commerce/privacy';
	import Newsletter from './shop/newsletter.svelte';
	let artistPage = $derived(
		!!page.data.hostedShopUrl ||
			page.url.pathname === '/' ||
			page.url.pathname.startsWith('/murals')
	);
	let home = $derived(page.url.pathname === '/');
	let links = $derived(page.data.menus.footer);
	function menuUrl(url: string) {
		return url.startsWith('/') ? base + url : url;
	}
</script>

{#snippet menuItems(items: MenuLink[])}
	{#each items as link (link.id)}
		<li>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Shopify links are normalized and validated by the server; internal URLs include the configured base path. -->
			<a href={menuUrl(link.url)}>{link.title}</a>
			{#if link.items.length}<ul>{@render menuItems(link.items)}</ul>{/if}
		</li>
	{/each}
{/snippet}

{#if !artistPage}<Newsletter />{/if}
<footer class="studio-footer" class:home-footer={home}>
	<div class="footer-inner wrap">
		<div class="footer-identity">
			{#if !home}<a class="footer-wordmark" href={resolve('/')}>Ellie Seal</a>{/if}
			<span>© {new Date().getFullYear()} Ellie Seal</span>
		</div>
		{#if links.length}
			<nav aria-label="Footer"><ul>{@render menuItems(links)}</ul></nav>
		{/if}
		<a class="footer-contact" href={resolve('/contact')}>Get in touch ↗</a>
	</div>
	<div class="footer-bottom wrap">
		<nav class="privacy-links" aria-label="Privacy">
			<a href={resolve('/policies/privacy-policy')}>Privacy policy</a>
			{#if page.data.hostedShopUrl}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Validated native Shopify origin. -->
				<a href={page.data.hostedShopUrl + 'pages/data-sharing-opt-out'}>Your privacy choices</a>
			{:else}
				<button type="button" onclick={openPrivacySettings}>Cookie preferences</button>
				<button type="button" onclick={openDataSharingSettings}>Your privacy choices</button>
			{/if}
		</nav>
		<p class="footer-credit">
			Created by <a href="https://jaydchw.com">Jayden Holdsworth <span>· jaydchw.com</span></a>
		</p>
	</div>
</footer>

<style>
	.studio-footer {
		border-top: 1px solid var(--line);
		background: var(--paper);
		color: var(--navy);
		font-family: var(--font-sans);
	}
	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem 3rem;
		padding-block: 3rem;
	}
	.footer-identity {
		display: grid;
		gap: 1.25rem;
	}
	.footer-wordmark {
		font-family: var(--font-serif);
		font-size: 2.4rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.07em;
		text-decoration: none;
		white-space: nowrap;
	}
	.footer-identity span {
		font-size: 0.65rem;
		color: var(--muted);
	}
	nav {
		max-width: 40rem;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.75rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	ul ul {
		display: grid;
		gap: 0;
		padding-block: 0.25rem;
	}
	a:not(.footer-wordmark) {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: 0.72rem;
		line-height: 1.5;
		text-decoration: none;
	}
	a:hover,
	a:focus-visible {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.footer-contact {
		white-space: nowrap;
	}
	.footer-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 2rem;
		padding-block: 0.75rem;
		border-top: 1px solid var(--line);
	}
	.privacy-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1.25rem;
	}
	.privacy-links a,
	.privacy-links button,
	.footer-credit,
	.footer-credit a {
		font-family: var(--font-sans);
		font-size: 0.65rem;
		color: var(--muted);
	}
	.privacy-links button {
		min-height: 44px;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.privacy-links button:hover {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.footer-credit {
		margin: 0;
		white-space: nowrap;
	}
	.footer-credit a {
		display: inline;
		text-underline-offset: 4px;
	}
	.footer-credit span {
		white-space: nowrap;
	}
	.home-footer .footer-inner {
		align-items: center;
		padding-block: 1rem;
	}
	@media (max-width: 900px) {
		.footer-bottom {
			flex-wrap: wrap;
		}
		.footer-inner {
			flex-wrap: wrap;
			gap: 1.5rem 2rem;
		}
		nav {
			flex: 1;
		}
		.footer-contact {
			margin-left: auto;
		}
	}
	@media (max-width: 560px) {
		.footer-inner {
			padding-block: 2rem;
			gap: 1rem;
		}
		.footer-identity {
			flex-basis: 100%;
			gap: 0.75rem;
		}
		nav {
			flex-basis: 100%;
		}
		ul {
			gap: 0 1.35rem;
		}
		.footer-contact {
			margin-left: 0;
		}
		.footer-bottom {
			padding-block: 0.5rem 1rem;
			gap: 0.25rem;
		}
		.footer-credit {
			white-space: normal;
		}
	}
</style>
