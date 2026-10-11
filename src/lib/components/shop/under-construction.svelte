<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ArrowUpRight from 'phosphor-svelte/lib/ArrowUpRight';
	import PaintBrush from 'phosphor-svelte/lib/PaintBrush';
	import Pause from 'phosphor-svelte/lib/Pause';
	import Play from 'phosphor-svelte/lib/Play';
	import ConstructionProducts from './construction-products.svelte';
	import { constructionMotion } from './construction-motion';

	const tapeLabels = Array.from({ length: 8 }, (_, index) => index);
	const tapeCopies = [0, 1];
	let section: HTMLElement;
	let topBand: HTMLDivElement;
	let bottomBand: HTMLDivElement;
	let topTrack: HTMLDivElement;
	let bottomTrack: HTMLDivElement;
	let notice: HTMLDivElement;
	let leftTab: HTMLSpanElement;
	let rightTab: HTMLSpanElement;
	let motionReady = $state(false);
	let motionPaused = $state(false);
	let reducedMotion = $state(false);
	let motion: ReturnType<typeof constructionMotion> | undefined;

	onMount(() => {
		if (typeof section.animate !== 'function') return;
		motion = constructionMotion(
			{ section, topBand, bottomBand, topTrack, bottomTrack, notice, leftTab, rightTab },
			({ paused, reduced }) => {
				motionPaused = paused;
				reducedMotion = reduced;
				motionReady = true;
			}
		);
		return () => motion?.destroy();
	});
</script>

<svelte:head>
	<title>Shop coming soon — Ellie Seal</title>
	<meta
		name="description"
		content="Ellie Seal’s online shop is under construction. View mural work or get in touch about a commission."
	/>
</svelte:head>

<main
	bind:this={section}
	id="main-content"
	class="shop-holding"
	aria-labelledby="shop-holding-title"
>
	<div class="products-behind" aria-hidden="true" inert>
		<ConstructionProducts />
	</div>
	<div class="construction-veil" aria-hidden="true"></div>
	<div class="construction-tape tape-top" aria-hidden="true">
		<div bind:this={topBand} class="tape-band">
			<div bind:this={topTrack} class="tape-track">
				{#each tapeCopies as copy (copy)}
					<div class="tape-copy">
						{#each tapeLabels as index (index)}
							<span>Under construction <b>///</b></span>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div class="construction-tape tape-bottom" aria-hidden="true">
		<div bind:this={bottomBand} class="tape-band">
			<div bind:this={bottomTrack} class="tape-track">
				{#each tapeCopies as copy (copy)}
					<div class="tape-copy">
						{#each tapeLabels as index (index)}
							<span>Under construction <b>///</b></span>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div bind:this={notice} class="holding-content">
		<span class="notice-tab tab-left" aria-hidden="true">
			<span bind:this={leftTab}></span>
		</span>
		<span class="notice-tab tab-right" aria-hidden="true">
			<span bind:this={rightTab}></span>
		</span>
		<div class="holding-label">
			<PaintBrush size={28} weight="light" aria-hidden="true" />
			<span>Online shop</span>
		</div>
		<div class="holding-message">
			<h1 id="shop-holding-title">Shop coming<br />soon.</h1>
			<div class="holding-details">
				<p>
					I’m getting the online shop ready. In the meantime, you can view my murals or get in touch
					about a commission.
				</p>
				<div class="holding-links">
					<a class="murals-link" href={resolve('/murals')}>
						View murals <ArrowUpRight size={19} weight="regular" aria-hidden="true" />
					</a>
					<a class="enquiry-link" href={resolve('/murals#contact')}>Mural enquiries</a>
				</div>
			</div>
		</div>
	</div>
	{#if motionReady && !reducedMotion}
		<button class="motion-toggle" type="button" onclick={() => motion?.togglePause()}>
			{#if motionPaused}
				<Play size={13} weight="fill" aria-hidden="true" /> Resume motion
			{:else}
				<Pause size={13} weight="fill" aria-hidden="true" /> Pause motion
			{/if}
		</button>
	{/if}
</main>

<style>
	.shop-holding {
		position: relative;
		isolation: isolate;
		display: grid;
		align-items: center;
		min-height: calc(100svh - var(--site-header-height));
		overflow: clip;
		padding-block: 6rem;
		background: var(--paper);
		color: var(--navy);
	}

	.products-behind,
	.construction-veil {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.products-behind {
		z-index: -3;
	}

	.construction-veil {
		z-index: -2;
		background: #f7f3ec66;
	}

	.construction-tape {
		position: absolute;
		z-index: -1;
		left: -20%;
		width: 140%;
		height: 3.4rem;
		color: var(--paper);
		font-family: var(--font-sans);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		white-space: nowrap;
		text-transform: uppercase;
		pointer-events: none;
	}

	.tape-band {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--navy);
	}

	.tape-track {
		display: flex;
		width: max-content;
		height: 100%;
	}

	.tape-copy {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: space-around;
		gap: 2.25rem;
		min-width: 140vw;
		padding-inline: 1.125rem;
	}

	.tape-band::before,
	.tape-band::after {
		position: absolute;
		inset-inline: 0;
		height: 4px;
		background: repeating-linear-gradient(135deg, var(--paper) 0 6px, transparent 6px 12px);
		opacity: 0.6;
		content: '';
	}

	.tape-band::before {
		top: 0;
	}

	.tape-band::after {
		bottom: 0;
	}

	.construction-tape span {
		display: inline-flex;
		align-items: center;
		gap: 2.25rem;
	}

	.construction-tape b {
		font-size: 1.2rem;
		letter-spacing: 0.15em;
	}

	.tape-top {
		top: 23%;
		transform: rotate(-7deg);
	}

	.tape-bottom {
		bottom: 16%;
		transform: rotate(6deg);
	}

	.holding-content {
		position: relative;
		width: min(35rem, calc(100% - 3rem));
		margin-inline: auto;
		padding: clamp(2rem, 4vw, 3rem);
		border: 1px solid var(--line);
		background: var(--paper);
		text-align: center;
	}

	.notice-tab {
		position: absolute;
		top: -0.6rem;
		width: 3.5rem;
		height: 1.2rem;
		pointer-events: none;
	}

	.notice-tab > span {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--navy);
		opacity: 0.8;
		transform-origin: left center;
	}

	.tab-left {
		left: 1.4rem;
		transform: rotate(-13deg);
	}

	.tab-right {
		right: 1.4rem;
		transform: rotate(11deg);
	}

	.tab-right > span {
		transform-origin: right center;
	}

	.motion-toggle {
		position: absolute;
		inset-inline-end: 1.25rem;
		bottom: 1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 2.75rem;
		padding: 0.5rem 0.7rem;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.65rem;
		cursor: pointer;
		transition: border-color 150ms ease;
	}

	.motion-toggle:hover {
		border-color: var(--navy);
	}

	.motion-toggle:focus-visible {
		outline: 2px solid var(--navy);
		outline-offset: 3px;
	}

	.holding-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		font-family: var(--font-sans);
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.holding-message {
		display: grid;
		gap: 1.5rem;
		padding-top: 1.5rem;
	}

	h1 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(3.3rem, 6.5vw, 5.5rem);
		font-weight: 500;
		letter-spacing: -0.05em;
		line-height: 0.94;
	}

	.holding-details {
		max-width: 25rem;
		margin-inline: auto;
	}

	.holding-details p {
		margin: 0;
		color: var(--body);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.85;
	}

	.holding-links {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem 1.5rem;
		margin-top: 1.75rem;
		font-family: var(--font-sans);
		font-size: 0.8rem;
	}

	.murals-link {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 2.5rem;
		min-height: 3.25rem;
		padding: 0.9rem 1.25rem;
		background: var(--navy);
		color: var(--paper);
		text-decoration: none;
		transition: background-color 150ms ease;
	}

	.murals-link:hover {
		background: var(--navy-soft);
	}

	.enquiry-link {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.3rem;
	}

	.enquiry-link:hover {
		text-decoration-thickness: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.motion-toggle,
		.murals-link {
			transition: none;
		}
	}

	@media (max-width: 760px) {
		.shop-holding {
			padding-block: 7rem;
		}

		.holding-content {
			width: min(35rem, calc(100% - 2rem));
			padding: 1.75rem 1.5rem;
		}

		h1 {
			font-size: clamp(2.85rem, 11vw, 4rem);
		}

		.construction-tape {
			height: 2.8rem;
			font-size: 0.6rem;
		}

		.tape-copy {
			gap: 1.5rem;
			padding-inline: 0.75rem;
		}

		.construction-tape span {
			gap: 1.5rem;
		}

		.tape-top {
			top: 16%;
			transform: rotate(-8deg);
		}

		.tape-bottom {
			bottom: 12%;
			transform: rotate(7deg);
		}

		.holding-links {
			flex-direction: column;
			margin-top: 1.5rem;
			gap: 0.5rem;
		}
	}
</style>
