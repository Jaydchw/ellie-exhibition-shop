<script lang="ts">
	import { base } from '$app/paths';
	import type { PolicyNode } from '$lib/commerce/policies';
	import PolicyContent from './policy-content.svelte';
	let { nodes }: { nodes: PolicyNode[] } = $props();
</script>

{#each nodes as node, index (index)}
	{#if 'text' in node}
		{node.text}
	{:else if node.tag === 'br'}
		<br />
	{:else if node.tag === 'hr'}
		<hr />
	{:else}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Allowlisted component elements and validated links; local URLs include the configured base. -->
		<svelte:element
			this={node.tag}
			id={node.id}
			href={node.href?.startsWith('/') ? base + node.href : node.href}
			><PolicyContent nodes={node.children} /></svelte:element
		>
	{/if}
{/each}
