<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import HouseSimple from 'phosphor-svelte/lib/HouseSimple';
	import PaintBrushBroad from 'phosphor-svelte/lib/PaintBrushBroad';
	import Palette from 'phosphor-svelte/lib/Palette';
	import { siteCopy } from '$lib/content/site';

	function isCurrent(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<header class="site-header">
	<div class="site-header__inner">
		<a class="brand" href={resolve('/')} aria-label="Ellie Seal home">
			<span>{siteCopy.name}</span>
		</a>
		<nav aria-label="Main navigation">
			{#each siteCopy.navigation as item (item.href)}
				<a
					href={resolve(item.href)}
					class:nav-link--active={isCurrent(item.href)}
					aria-current={isCurrent(item.href) ? 'page' : undefined}
				>
					{#if item.icon === 'home'}
						<HouseSimple size={17} weight="bold" aria-hidden="true" />
					{:else if item.icon === 'art'}
						<Palette size={17} weight="bold" aria-hidden="true" />
					{:else}
						<PaintBrushBroad size={17} weight="bold" aria-hidden="true" />
					{/if}
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		z-index: 30;
		top: 0;
		border-bottom: 1px solid var(--line);
		background: color-mix(in srgb, var(--paper) 96%, transparent);
		box-shadow: 0 0.35rem 1.4rem color-mix(in srgb, var(--navy) 6%, transparent);
		backdrop-filter: blur(16px);
	}

	.site-header__inner {
		display: flex;
		width: min(var(--content-width), calc(100% - 1.25rem));
		height: var(--site-header-height);
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		margin-inline: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: 1.08rem;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.36rem;
		border-radius: 999px;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.69rem;
		font-weight: 700;
		padding: 0.5rem 0.55rem;
		text-decoration: none;
	}

	nav a:hover,
	.nav-link--active {
		background: color-mix(in srgb, var(--sage-light) 72%, transparent);
		color: var(--navy);
	}

	@media (min-width: 600px) {
		.site-header__inner {
			width: min(var(--content-width), calc(100% - 2rem));
			gap: 1.5rem;
		}

		.brand {
			font-size: 1.5rem;
		}

		nav {
			gap: 0.4rem;
		}

		nav a {
			font-size: 0.84rem;
			padding: 0.62rem 0.85rem;
		}
	}

	@media (max-width: 390px) {
		nav a {
			padding-inline: 0.46rem;
		}
	}
</style>
