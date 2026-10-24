<script lang="ts">
	import type { Product } from '$lib/commerce/types';
	import Select from '$lib/components/ui/select.svelte';
	let {
		product,
		choices,
		onchoose
	}: {
		product: Product;
		choices: Record<string, string>;
		onchoose: (name: string, value: string) => void;
	} = $props();
	const dimensions: Record<string, string> = {
		A4: '21 × 29.7 cm',
		A3: '29.7 × 42 cm'
	};
	let options = $derived(
		product.options.filter(
			(option) => !(option.name === 'Title' && option.values[0] === 'Default Title')
		)
	);
</script>

{#if options.length}
	<div class="variant-picker">
		{#each options as option (option.name)}
			<Select
				label={option.name}
				name={option.name}
				value={choices[option.name] ?? ''}
				options={option.values.map((value) => {
					const available = product.variants.some(
						(variant) =>
							variant.availableForSale &&
							variant.selectedOptions.some(
								(selected) => selected.name === option.name && selected.value === value
							)
					);
					return {
						value,
						label: `${value}${/size/i.test(option.name) && dimensions[value] ? ` · ${dimensions[value]}` : ''}${available ? '' : ' (unavailable)'}`,
						disabled: !available
					};
				})}
				onchange={(value) => onchoose(option.name, value)}
			/>
		{/each}
	</div>
{/if}

<style>
	.variant-picker {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin: 1.5rem 0 1rem;
	}
	@media (max-width: 400px) {
		.variant-picker {
			grid-template-columns: 1fr;
		}
	}
</style>
