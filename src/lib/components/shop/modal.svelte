<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './icon.svelte';
	let {
		open = $bindable(false),
		title,
		drawer = false,
		hideTitle = false,
		children
	}: {
		open?: boolean;
		title: string;
		drawer?: boolean;
		hideTitle?: boolean;
		children: Snippet;
	} = $props();
	let dialog: HTMLDialogElement;
	let visible = $state(false);
	$effect(() => {
		if (!dialog) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const frames = drawer
			? [
					{ transform: 'translateX(100%)', opacity: 0.7 },
					{ transform: 'translateX(0)', opacity: 1 }
				]
			: [
					{ transform: 'translateY(16px) scale(.98)', opacity: 0 },
					{ transform: 'translateY(0) scale(1)', opacity: 1 }
				];
		let animation: Animation | undefined;
		if (open) {
			if (!dialog.open) {
				dialog.showModal();
				dialog.scrollTop = 0;
			}
			visible = true;
			animation = dialog.animate(frames, {
				duration: reduced ? 0 : 320,
				easing: 'cubic-bezier(.2,.8,.2,1)'
			});
		} else if (dialog.open) {
			animation = dialog.animate([...frames].reverse(), {
				duration: reduced ? 0 : 200,
				easing: 'ease-in',
				fill: 'forwards'
			});
			animation.finished
				.then(() => {
					dialog.close();
					visible = false;
				})
				.catch(() => {});
		}
		return () => animation?.cancel();
	});
	$effect(() => {
		if (!visible) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});
	function backdrop(event: MouseEvent) {
		if (event.target !== dialog) return;
		const r = dialog.getBoundingClientRect();
		if (
			event.clientX < r.left ||
			event.clientX > r.right ||
			event.clientY < r.top ||
			event.clientY > r.bottom
		)
			open = false;
	}
</script>

<dialog
	bind:this={dialog}
	class:drawer
	class:leaving={!open}
	aria-label={title}
	oncancel={(e) => {
		e.preventDefault();
		open = false;
	}}
	onclose={() => {
		open = false;
		visible = false;
	}}
	onclick={backdrop}
>
	<div class="modal-header" class:compact={hideTitle}>
		<h2 class:sr-only={hideTitle}>{title}</h2>
		<button class="icon-button" aria-label={`Close ${title}`} onclick={() => (open = false)}
			><Icon name="close" /></button
		>
	</div>
	{@render children()}
</dialog>

<style>
	.compact {
		border: 0;
		justify-content: flex-end;
		margin: 0;
		padding: 0;
	}
	dialog::backdrop {
		animation: backdrop-in 0.3s ease;
	}
	dialog.leaving::backdrop {
		animation: backdrop-out 0.2s ease forwards;
	}
	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
	}
</style>
