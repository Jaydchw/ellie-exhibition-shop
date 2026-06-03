<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
	type ButtonSize = 'sm' | 'md' | 'lg';

	let {
		href,
		variant = 'primary',
		size = 'md',
		type = 'button',
		target,
		rel,
		ariaLabel,
		onclick,
		class: className = '',
		children
	}: {
		href?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: 'button' | 'submit' | 'reset';
		target?: string;
		rel?: string;
		ariaLabel?: string;
		onclick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
		class?: string;
		children?: Snippet;
	} = $props();

	let classes = $derived(`ui-button ui-button--${variant} ui-button--${size} ${className}`.trim());
	let safeRel = $derived(target === '_blank' ? (rel ?? 'noreferrer') : rel);
</script>

{#if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a class={classes} {href} {target} rel={safeRel} aria-label={ariaLabel} {onclick}>
		{@render children?.()}
	</a>
{:else}
	<button class={classes} {type} aria-label={ariaLabel} {onclick}>
		{@render children?.()}
	</button>
{/if}

<style>
	.ui-button {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		border: 1px solid transparent;
		border-radius: 6px;
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
		transition:
			transform 180ms ease,
			border-color 180ms ease,
			background 180ms ease,
			color 180ms ease;
	}

	.ui-button:hover {
		transform: translateY(-1px);
	}

	.ui-button:focus-visible {
		outline: 3px solid color-mix(in srgb, var(--navy) 26%, transparent);
		outline-offset: 3px;
	}

	.ui-button--primary {
		background: var(--navy);
		color: var(--paper);
	}

	.ui-button--primary:hover {
		background: var(--navy-soft);
	}

	.ui-button--secondary {
		background: var(--ink);
		color: var(--paper);
	}

	.ui-button--secondary:hover {
		background: color-mix(in srgb, var(--ink) 86%, white);
	}

	.ui-button--outline {
		border-color: color-mix(in srgb, var(--navy) 32%, var(--stone));
		background: transparent;
		color: var(--navy);
	}

	.ui-button--ghost {
		background: transparent;
		color: var(--navy);
	}

	.ui-button--ghost:hover,
	.ui-button--text:hover {
		background: color-mix(in srgb, var(--navy) 7%, transparent);
	}

	.ui-button--text {
		min-height: auto;
		background: transparent;
		color: var(--navy);
		padding-inline: 0;
	}

	.ui-button--sm {
		min-height: 2.25rem;
		padding: 0.55rem 0.75rem;
		font-size: 0.82rem;
	}

	.ui-button--md {
		min-height: 2.65rem;
		padding: 0.7rem 0.95rem;
	}

	.ui-button--lg {
		min-height: 3rem;
		padding: 0.85rem 1.15rem;
		font-size: 0.96rem;
	}
</style>
