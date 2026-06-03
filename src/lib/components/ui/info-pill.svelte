<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		value,
		children
	}: {
		label: string;
		value?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="info-pill">
	<span>{label}</span>
	<strong>{value}</strong>
	{@render children?.()}
</div>

<style>
	.info-pill {
		display: grid;
		gap: 0.18rem;
		border: 1px solid color-mix(in srgb, var(--sage) 55%, white);
		border-radius: 8px;
		background: color-mix(in srgb, var(--paper) 78%, white);
		padding: 0.85rem 0.95rem;
		box-shadow: 0 12px 28px color-mix(in srgb, var(--moss) 9%, transparent);
	}

	.info-pill span {
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.info-pill strong {
		color: var(--ink);
		font-size: 0.98rem;
		font-weight: 700;
	}
</style>
