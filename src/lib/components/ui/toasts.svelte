<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import { toastEvent, type ToastMessage } from './toast';
	import Icon from '$lib/components/shop/icon.svelte';
	let messages = $state<(ToastMessage & { id: number })[]>([]);
	const timers = new SvelteMap<number, ReturnType<typeof setTimeout>>();
	let sequence = 0;
	let reduced = $state(false);
	function dismiss(id: number) {
		clearTimeout(timers.get(id));
		timers.delete(id);
		messages = messages.filter((item) => item.id !== id);
	}
	function resume(id: number) {
		clearTimeout(timers.get(id));
		timers.set(
			id,
			setTimeout(() => dismiss(id), 6500)
		);
	}
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		function receive(event: Event) {
			const detail = (event as CustomEvent<ToastMessage>).detail;
			if (!detail?.message || messages.some((item) => item.message === detail.message)) return;
			if (messages.length >= 3) dismiss(messages[0].id);
			const id = ++sequence;
			messages = [...messages, { ...detail, id }];
			resume(id);
		}
		window.addEventListener(toastEvent, receive);
		return () => {
			window.removeEventListener(toastEvent, receive);
			for (const timer of timers.values()) clearTimeout(timer);
		};
	});
</script>

<div class="toast-stack" aria-label="Notifications">
	{#each messages as item (item.id)}
		<div
			class="toast"
			class:error={item.kind === 'error'}
			role={item.kind === 'error' ? 'alert' : 'status'}
			aria-atomic="true"
			onmouseenter={() => clearTimeout(timers.get(item.id))}
			onmouseleave={() => resume(item.id)}
			onfocusin={() => clearTimeout(timers.get(item.id))}
			onfocusout={() => resume(item.id)}
			transition:fly={{ y: -8, duration: reduced ? 0 : 160 }}
		>
			<Icon name={item.kind === 'error' ? 'close' : 'check'} size={18} />
			<p>{item.message}</p>
			<button type="button" aria-label="Dismiss notification" onclick={() => dismiss(item.id)}
				><Icon name="close" size={16} /></button
			>
		</div>
	{/each}
</div>

<style>
	.toast-stack {
		position: fixed;
		z-index: 10000;
		top: calc(var(--site-header-height) + 1rem);
		right: 1rem;
		display: grid;
		gap: 0.65rem;
		width: min(25rem, calc(100vw - 2rem));
		pointer-events: none;
	}
	.toast {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--line);
		border-left: 3px solid var(--moss);
		border-radius: 5px;
		background: var(--paper);
		color: var(--navy);
		box-shadow: 0 4px 20px #102f5515;
		pointer-events: auto;
		font-family: var(--font-sans);
		font-size: 0.76rem;
	}
	.toast.error {
		border-left-color: var(--terracotta);
	}
	p {
		flex: 1;
		margin: 0;
		line-height: 1.5;
	}
	button {
		display: grid;
		place-items: center;
		min-width: 32px;
		min-height: 32px;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
</style>
