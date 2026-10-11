<script lang="ts">
	import { tick } from 'svelte';
	import Icon from './icon.svelte';
	let {
		value,
		min = 1,
		max = 99,
		disabled = false,
		label = 'Quantity',
		onchange
	}: {
		value: number;
		min?: number;
		max?: number;
		disabled?: boolean;
		label?: string;
		onchange: (value: number) => void;
	} = $props();
</script>

<div class="quantity" role="group" aria-label={label}>
	<button
		type="button"
		aria-label={`Decrease ${label.toLowerCase()}`}
		disabled={disabled || value <= min}
		onclick={() => onchange(value - 1)}><Icon name="minus" size={16} /></button
	>
	<input
		type="number"
		aria-label={label}
		{min}
		{max}
		{value}
		{disabled}
		inputmode="numeric"
		onblur={async (event) => {
			const input = event.currentTarget;
			const n = Number(input.value);
			input.value = String(value);
			if (Number.isInteger(n) && n >= min && n <= max && n !== value) await onchange(n);
			await tick();
			input.value = String(value);
		}}
	/>
	<button
		type="button"
		aria-label={`Increase ${label.toLowerCase()}`}
		disabled={disabled || value >= max}
		onclick={() => onchange(value + 1)}><Icon name="plus" size={16} /></button
	>
</div>
