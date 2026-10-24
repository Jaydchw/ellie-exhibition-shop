<script lang="ts">
	import X from 'phosphor-svelte/lib/X';
	let {
		open = $bindable(false),
		src,
		alt,
		title = alt
	}: { open?: boolean; src: string; alt: string; title?: string } = $props();
	let dialog = $state<HTMLDialogElement>();
	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => (document.body.style.overflow = previous);
	});
</script>

<dialog
	class="image-viewer"
	bind:this={dialog}
	aria-label={title}
	oncancel={(event) => {
		event.preventDefault();
		open = false;
	}}
	onclose={() => (open = false)}
	onclick={(event) => {
		if (event.target !== dialog) return;
		const bounds = dialog.getBoundingClientRect();
		if (
			event.clientX < bounds.left ||
			event.clientX > bounds.right ||
			event.clientY < bounds.top ||
			event.clientY > bounds.bottom
		)
			open = false;
	}}
>
	<header>
		<p>{title}</p>
		<button type="button" aria-label="Close image" onclick={() => (open = false)}>
			<X size={22} aria-hidden="true" />
		</button>
	</header>
	{#if open}<img {src} {alt} />{/if}
</dialog>

<style>
	.image-viewer {
		width: min(96rem, calc(100vw - 2rem));
		height: 90dvh;
		max-width: none;
		max-height: 90dvh;
		margin: auto;
		padding: 0.75rem 1rem 1rem;
		border: 0;
		background: var(--paper);
		color: var(--navy);
	}
	.image-viewer[open] {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 0.5rem;
	}
	.image-viewer::backdrop {
		background: #101a26bf;
		backdrop-filter: blur(3px);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-width: 0;
	}
	p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.78rem;
	}
	button {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		flex-shrink: 0;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	img {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 0;
		object-fit: contain;
	}
	@media (max-width: 600px) {
		.image-viewer {
			width: calc(100vw - 1rem);
			padding-inline: 0.5rem;
		}
	}
</style>
