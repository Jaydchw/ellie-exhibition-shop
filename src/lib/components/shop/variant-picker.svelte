<script lang="ts">
	import type { Product } from '$lib/commerce/types';
	import { colourHex } from '$lib/commerce/presentation';
	import Icon from './icon.svelte';
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
		A3: '29.7 × 42 cm',
		A2: '42 × 59.4 cm'
	};
	const details: Record<string, string> = {
		Poster: 'Unframed',
		'Fine art print': 'Matte giclée',
		'Black frame': 'Print + frame',
		'Natural frame': 'Print + frame',
		'White frame': 'Print + frame'
	};
</script>

{#each product.options.filter((o) => !(o.name === 'Title' && o.values[0] === 'Default Title')) as option (option.name)}
	<fieldset class="variant-field">
		<legend>{option.name}<span>{choices[option.name]}</span></legend>
		<div class="variant-values" class:finish-values={/finish|frame|format/i.test(option.name)}>
			{#each option.values as value (value)}
				{@const available = product.variants.some(
					(v) =>
						v.availableForSale &&
						v.selectedOptions.some((o) => o.name === option.name && o.value === value)
				)}
				<label
					class="variant-choice"
					class:chosen={choices[option.name] === value}
					class:unavailable={!available}
				>
					<input
						type="radio"
						name={option.name}
						{value}
						checked={choices[option.name] === value}
						disabled={!available}
						onchange={() => onchoose(option.name, value)}
					/>
					{#if /colou?r/i.test(option.name)}<span
							class="colour-dot"
							style:background={colourHex[value] ?? value.toLowerCase()}
						></span>{:else if /frame/i.test(value)}<span
							class="frame-sample"
							style:border-color={/black/i.test(value)
								? '#30312e'
								: /white/i.test(value)
									? '#fff'
									: '#b89465'}
						></span>{:else if /finish|format/i.test(option.name)}<Icon
							name="frame"
							size={20}
						/>{/if}
					<span
						>{value}{#if dimensions[value]}<small>{dimensions[value]}</small
							>{:else if /finish|format/i.test(option.name) && details[value]}<small
								>{details[value]}</small
							>{/if}</span
					>
					{#if /finish|frame|format/i.test(option.name)}<span class="choice-check"
							>{#if choices[option.name] === value}<Icon name="check" size={14} />{/if}</span
						>{/if}
				</label>
			{/each}
		</div>
	</fieldset>
{/each}

<style>
	.variant-field {
		border: 0;
		padding: 0;
		margin: 1.5rem 0;
		min-width: 0;
	}
	legend {
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 600;
		margin-bottom: 0.8rem;
	}
	legend span {
		font-weight: 400;
		color: var(--muted);
		margin-left: 0.75rem;
		font-size: 0.73rem;
	}
	.variant-values {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}
	.variant-choice {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.7rem;
		border: 1px solid var(--line);
		border-radius: 7px;
		min-height: 48px;
		min-width: 50px;
		padding: 0.8rem 1rem;
		font-size: 0.76rem;
		cursor: pointer;
		background: #fff4;
		transition:
			background 0.18s,
			border-color 0.18s,
			box-shadow 0.18s,
			transform 0.18s;
	}
	.variant-choice:hover {
		background: #e8e7dd;
		transform: translateY(-1px);
	}
	.variant-choice.chosen {
		border-color: var(--navy);
		background: #e8eadd;
		box-shadow: 0 0 0 1px var(--navy);
	}
	.variant-choice:has(input:focus-visible) {
		outline: 2px solid var(--moss);
		outline-offset: 4px;
	}
	.variant-choice input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}
	.variant-choice small {
		display: block;
		font-size: 0.6rem;
		color: var(--muted);
		margin-top: 0.2rem;
	}
	.variant-choice.unavailable {
		opacity: 0.4;
		text-decoration: line-through;
		cursor: not-allowed;
	}
	.finish-values {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.finish-values .variant-choice {
		justify-content: flex-start;
		padding: 0.8rem;
	}
	.colour-dot {
		width: 22px;
		height: 22px;
		border: 1px solid #0002;
		border-radius: 50%;
		box-shadow: 0 0 0 3px var(--paper);
	}
	.frame-sample {
		width: 21px;
		height: 26px;
		flex-shrink: 0;
		border: 3px solid;
		background: #f7f3ec;
		box-shadow: 0 1px 3px #0003;
	}
	.choice-check {
		margin-left: auto;
		min-width: 16px;
		width: 16px;
		height: 16px;
		border: 1px solid var(--line);
		border-radius: 50%;
		display: grid;
		place-items: center;
	}
	.chosen .choice-check {
		background: var(--navy);
		color: var(--paper);
		border-color: var(--navy);
	}
	@media (max-width: 400px) {
		.variant-choice {
			padding: 0.7rem 0.75rem;
		}
		.finish-values {
			gap: 0.5rem;
		}
		.finish-values .variant-choice {
			gap: 0.5rem;
			font-size: 0.69rem;
		}
	}
</style>
