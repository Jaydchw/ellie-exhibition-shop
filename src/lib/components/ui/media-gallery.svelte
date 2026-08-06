<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import ArrowsOut from 'phosphor-svelte/lib/ArrowsOut';
	import CaretLeft from 'phosphor-svelte/lib/CaretLeft';
	import CaretRight from 'phosphor-svelte/lib/CaretRight';
	import GridFour from 'phosphor-svelte/lib/GridFour';
	import MagnifyingGlassMinus from 'phosphor-svelte/lib/MagnifyingGlassMinus';
	import MagnifyingGlassPlus from 'phosphor-svelte/lib/MagnifyingGlassPlus';
	import Slideshow from 'phosphor-svelte/lib/Slideshow';
	import X from 'phosphor-svelte/lib/X';
	import type { GalleryItem } from '$lib/content/murals';

	let {
		items,
		label,
		imageFit = 'cover'
	}: {
		items: GalleryItem[];
		label: string;
		imageFit?: 'cover' | 'contain';
	} = $props();

	let view = $state<'carousel' | 'grid'>('carousel');
	let current = $state(0);
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let dragging = $state(false);
	let dragStartX = 0;
	let dragStartY = 0;
	let panStartX = 0;
	let panStartY = 0;
	const activePointers = new SvelteMap<number, { x: number; y: number }>();
	let pinchStartDistance = 0;
	let pinchStartZoom = 1;
	let pinchStartMidX = 0;
	let pinchStartMidY = 0;
	let pinchStartPanX = 0;
	let pinchStartPanY = 0;
	let scroller = $state<HTMLDivElement>();
	let dialog = $state<HTMLDialogElement>();

	function resetView() {
		zoom = 1;
		panX = 0;
		panY = 0;
		dragging = false;
		activePointers.clear();
	}

	function openItem(index: number) {
		current = index;
		resetView();
		dialog?.showModal();
	}

	function closeViewer() {
		dialog?.close();
	}

	function showItem(index: number) {
		current = (index + items.length) % items.length;
		resetView();
	}

	function scrollToItem(index: number) {
		current = (index + items.length) % items.length;
		const item = scroller?.querySelectorAll<HTMLElement>('[data-gallery-item]')[current];
		item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	}

	function updateCurrentFromScroll() {
		if (!scroller) return;
		const center = scroller.scrollLeft + scroller.clientWidth / 2;
		const galleryItems = [...scroller.querySelectorAll<HTMLElement>('[data-gallery-item]')];
		let nearest = 0;
		let nearestDistance = Number.POSITIVE_INFINITY;

		galleryItems.forEach((item, index) => {
			const itemCenter = item.offsetLeft + item.offsetWidth / 2;
			const distance = Math.abs(itemCenter - center);
			if (distance < nearestDistance) {
				nearest = index;
				nearestDistance = distance;
			}
		});

		current = nearest;
	}

	function changeZoom(amount: number) {
		zoom = Math.min(4, Math.max(1, Number((zoom + amount).toFixed(2))));
		if (zoom === 1) {
			panX = 0;
			panY = 0;
		}
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		changeZoom(event.deltaY < 0 ? 0.25 : -0.25);
	}

	function getPinchMetrics() {
		const [first, second] = [...activePointers.values()];
		if (!first || !second) return null;

		return {
			distance: Math.hypot(second.x - first.x, second.y - first.y),
			midX: (first.x + second.x) / 2,
			midY: (first.y + second.y) / 2
		};
	}

	function startPan(event: PointerEvent) {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (activePointers.size === 2) {
			const metrics = getPinchMetrics();
			if (!metrics) return;
			pinchStartDistance = metrics.distance;
			pinchStartMidX = metrics.midX;
			pinchStartMidY = metrics.midY;
			pinchStartZoom = zoom;
			pinchStartPanX = panX;
			pinchStartPanY = panY;
			dragging = false;
			return;
		}

		if (zoom > 1) {
			dragging = true;
			dragStartX = event.clientX;
			dragStartY = event.clientY;
			panStartX = panX;
			panStartY = panY;
		}
	}

	function movePan(event: PointerEvent) {
		if (!activePointers.has(event.pointerId)) return;
		activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (activePointers.size === 2) {
			const metrics = getPinchMetrics();
			if (!metrics || pinchStartDistance === 0) return;

			zoom = Math.min(4, Math.max(1, pinchStartZoom * (metrics.distance / pinchStartDistance)));
			if (zoom === 1) {
				panX = 0;
				panY = 0;
			} else {
				panX = pinchStartPanX + metrics.midX - pinchStartMidX;
				panY = pinchStartPanY + metrics.midY - pinchStartMidY;
			}
			return;
		}

		if (!dragging) return;
		panX = panStartX + event.clientX - dragStartX;
		panY = panStartY + event.clientY - dragStartY;
	}

	function stopPan(event: PointerEvent) {
		activePointers.delete(event.pointerId);

		if (activePointers.size === 1 && zoom > 1) {
			const remaining = [...activePointers.values()][0];
			dragging = true;
			dragStartX = remaining.x;
			dragStartY = remaining.y;
			panStartX = panX;
			panStartY = panY;
			return;
		}

		dragging = false;
		pinchStartDistance = 0;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') showItem(current - 1);
		if (event.key === 'ArrowRight') showItem(current + 1);
	}

	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialog) closeViewer();
	}
</script>

<div class="gallery" class:gallery--grid={view === 'grid'} aria-label={label}>
	<div class="gallery-toolbar">
		<p>{items.length} images</p>
		<button type="button" onclick={() => (view = view === 'carousel' ? 'grid' : 'carousel')}>
			{#if view === 'carousel'}
				<GridFour size={18} weight="bold" aria-hidden="true" /> View all
			{:else}
				<Slideshow size={18} weight="bold" aria-hidden="true" /> Carousel
			{/if}
		</button>
	</div>

	{#if view === 'carousel'}
		<div class="carousel-wrap">
			<button
				class="carousel-control carousel-control--left"
				type="button"
				onclick={() => scrollToItem(current - 1)}
				aria-label="Previous image"
			>
				<CaretLeft size={24} weight="bold" aria-hidden="true" />
			</button>
			<div class="carousel" bind:this={scroller} onscroll={updateCurrentFromScroll}>
				{#each items as item, index (item.image)}
					<article data-gallery-item>
						<button type="button" onclick={() => openItem(index)} aria-label={`Open ${item.title}`}>
							<img
								class:gallery-image--contain={imageFit === 'contain'}
								src={item.image}
								alt={item.alt}
								loading="lazy"
							/>
							<span class="open-hint"
								><ArrowsOut size={18} weight="bold" aria-hidden="true" /> Open</span
							>
						</button>
						<h3>{item.title}</h3>
					</article>
				{/each}
			</div>
			<button
				class="carousel-control carousel-control--right"
				type="button"
				onclick={() => scrollToItem(current + 1)}
				aria-label="Next image"
			>
				<CaretRight size={24} weight="bold" aria-hidden="true" />
			</button>
		</div>
		<div class="gallery-count" aria-live="polite">{current + 1} / {items.length}</div>
	{:else}
		<div class="gallery-grid">
			{#each items as item, index (item.image)}
				<article>
					<button type="button" onclick={() => openItem(index)} aria-label={`Open ${item.title}`}>
						<img
							class:gallery-image--contain={imageFit === 'contain'}
							src={item.image}
							alt={item.alt}
							loading="lazy"
						/>
					</button>
					<h3>{item.title}</h3>
				</article>
			{/each}
		</div>
	{/if}
</div>

<dialog
	bind:this={dialog}
	class="image-viewer"
	aria-label={`${label} image viewer`}
	onkeydown={handleKeydown}
	onclick={handleDialogClick}
	onclose={resetView}
>
	<div class="viewer-header">
		<div><strong>{items[current]?.title}</strong><span>{current + 1} / {items.length}</span></div>
		<button type="button" onclick={closeViewer} aria-label="Close image viewer">
			<X size={23} weight="bold" aria-hidden="true" />
		</button>
	</div>
	<div
		class:viewer-stage--dragging={dragging}
		class="viewer-stage"
		role="group"
		aria-label="Pan and zoom image"
		onwheel={handleWheel}
		onpointerdown={startPan}
		onpointermove={movePan}
		onpointerup={stopPan}
		onpointercancel={stopPan}
	>
		<img
			src={items[current]?.image}
			alt={items[current]?.alt}
			draggable="false"
			style:transform={`translate(${panX}px, ${panY}px) scale(${zoom})`}
		/>
	</div>
	<div class="viewer-controls">
		<button type="button" onclick={() => showItem(current - 1)} aria-label="Previous image"
			><CaretLeft size={22} weight="bold" /></button
		>
		<div>
			<button type="button" onclick={() => changeZoom(-0.25)} aria-label="Zoom out"
				><MagnifyingGlassMinus size={21} weight="bold" /></button
			>
			<button type="button" onclick={resetView} aria-label="Reset zoom"
				>{Math.round(zoom * 100)}%</button
			>
			<button type="button" onclick={() => changeZoom(0.25)} aria-label="Zoom in"
				><MagnifyingGlassPlus size={21} weight="bold" /></button
			>
		</div>
		<button type="button" onclick={() => showItem(current + 1)} aria-label="Next image"
			><CaretRight size={22} weight="bold" /></button
		>
	</div>
</dialog>

<style>
	.gallery-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.gallery-toolbar p,
	.gallery-count {
		margin: 0;
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.gallery-toolbar button,
	.carousel-control,
	.viewer-header button,
	.viewer-controls button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.gallery-toolbar button {
		border-radius: 999px;
		background: color-mix(in srgb, var(--sage-light) 72%, transparent);
		color: var(--navy);
		font-family: var(--font-sans);
		font-size: 0.84rem;
		font-weight: 800;
		padding: 0.58rem 0.8rem;
		transition:
			background 180ms ease,
			transform 180ms ease;
	}

	.gallery-toolbar button:hover {
		background: var(--sage-light);
		transform: translateY(-1px);
	}

	.carousel-wrap {
		position: relative;
	}

	.carousel {
		display: flex;
		gap: clamp(0.8rem, 2vw, 1.5rem);
		overflow-x: auto;
		scrollbar-width: none;
		scroll-snap-type: x mandatory;
		padding-inline: max(0px, calc((100% - min(86vw, 58rem)) / 2));
	}

	.carousel::-webkit-scrollbar {
		display: none;
	}

	.carousel article {
		flex: 0 0 min(86vw, 58rem);
		scroll-snap-align: center;
	}

	.carousel article > button,
	.gallery-grid article > button {
		position: relative;
		display: block;
		width: 100%;
		overflow: hidden;
		border: 0;
		background: var(--stone);
		padding: 0;
		cursor: zoom-in;
		border-radius: 0.35rem;
	}

	.carousel article > button {
		aspect-ratio: 16 / 9;
	}

	.carousel img,
	.gallery-grid img {
		display: block;
		height: 100%;
		width: 100%;
		object-fit: cover;
		transition:
			transform 350ms ease,
			opacity 200ms ease;
	}

	.carousel article > button:hover img,
	.gallery-grid article > button:hover img {
		transform: scale(1.015);
		opacity: 0.94;
	}

	.gallery-image--contain {
		object-fit: contain !important;
	}

	.open-hint {
		position: absolute;
		right: 0.8rem;
		bottom: 0.8rem;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: color-mix(in srgb, var(--navy) 88%, transparent);
		color: white;
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 750;
		border-radius: 999px;
		padding: 0.55rem 0.7rem;
	}

	.carousel h3,
	.gallery-grid h3 {
		margin: 0.75rem 0 0;
		color: var(--navy);
		font-family: var(--font-serif);
		font-size: clamp(1.45rem, 2.5vw, 2rem);
		font-weight: 650;
	}

	.carousel-control {
		position: absolute;
		z-index: 2;
		top: calc(50% - 2.3rem);
		height: 3rem;
		width: 3rem;
		border: 0;
		border-radius: 50%;
		background: var(--paper);
		color: var(--navy);
		box-shadow: 0 0.4rem 1.6rem color-mix(in srgb, var(--navy) 16%, transparent);
		transition:
			background 180ms ease,
			transform 180ms ease;
	}

	.carousel-control:hover {
		background: var(--sage-light);
		transform: scale(1.07);
	}

	.carousel-control:active {
		transform: scale(0.97);
	}

	.carousel-control--left {
		left: 0.8rem;
	}
	.carousel-control--right {
		right: 0.8rem;
	}

	.gallery-count {
		margin-top: 0.8rem;
		text-align: center;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(1rem, 3vw, 2rem);
	}

	.gallery-grid article > button {
		aspect-ratio: 4 / 3;
	}

	.image-viewer {
		height: 100dvh;
		max-height: none;
		width: 100vw;
		max-width: none;
		margin: 0;
		border: 0;
		background: #0a1119;
		color: white;
		padding: 0;
	}

	.image-viewer::backdrop {
		background: #0a1119;
	}

	.viewer-header,
	.viewer-controls {
		position: absolute;
		z-index: 2;
		left: 0;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(to bottom, rgba(5, 10, 16, 0.92), transparent);
		font-family: var(--font-sans);
		padding: 1rem;
	}

	.viewer-header {
		top: 0;
	}

	.viewer-header div {
		display: grid;
		gap: 0.15rem;
	}

	.viewer-header strong {
		font-size: 0.92rem;
	}
	.viewer-header span {
		color: #aeb8c2;
		font-size: 0.74rem;
	}

	.viewer-header button,
	.viewer-controls button {
		height: 2.7rem;
		min-width: 2.7rem;
		color: white;
	}

	.viewer-stage {
		display: grid;
		height: 100%;
		place-items: center;
		overflow: hidden;
		cursor: grab;
		touch-action: none;
	}

	.viewer-stage--dragging {
		cursor: grabbing;
	}

	.viewer-stage img {
		display: block;
		max-height: calc(100dvh - 8rem);
		max-width: min(92vw, 100rem);
		object-fit: contain;
		transform-origin: center;
		user-select: none;
		will-change: transform;
	}

	.viewer-controls {
		bottom: 0;
		background: linear-gradient(to top, rgba(5, 10, 16, 0.94), transparent);
		padding-top: 2.5rem;
	}

	.viewer-controls > div {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.viewer-controls > div button:nth-child(2) {
		width: 4.5rem;
		font-family: var(--font-sans);
		font-size: 0.76rem;
		font-weight: 700;
	}

	@media (max-width: 720px) {
		.carousel article {
			flex-basis: 90vw;
		}
		.carousel {
			padding-inline: 0;
		}
		.carousel-control {
			top: calc(50% - 2rem);
			height: 2.6rem;
			width: 2.6rem;
		}
		.carousel-control--left {
			left: 0.35rem;
		}
		.carousel-control--right {
			right: 0.35rem;
		}
		.gallery-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.8rem;
		}
		.gallery-grid h3 {
			font-size: 1.25rem;
		}
		.open-hint {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.carousel article {
			flex-basis: calc(100vw - 1.25rem);
		}

		.gallery-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.carousel {
			scroll-behavior: auto;
		}
		.carousel img,
		.gallery-grid img {
			transition: none;
		}
	}
</style>
