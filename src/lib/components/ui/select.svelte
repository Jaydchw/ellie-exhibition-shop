<script module lang="ts">
	export type SelectOption = { value: string; label: string; disabled?: boolean };
</script>

<script lang="ts">
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	const fieldId = $props.id();
	let {
		label,
		value,
		options,
		onchange,
		id = fieldId,
		name,
		disabled = false,
		hideLabel = false,
		compact = false
	}: {
		label: string;
		value: string;
		options: SelectOption[];
		onchange: (value: string) => void;
		id?: string;
		name?: string;
		disabled?: boolean;
		hideLabel?: boolean;
		compact?: boolean;
	} = $props();
</script>

<div class="select-field" class:compact>
	<label for={id} class:sr-only={hideLabel}>{label}</label>
	<div class="select-control">
		<select
			{id}
			{name}
			{value}
			{disabled}
			onchange={(event) => onchange(event.currentTarget.value)}
		>
			{#each options as option (option.value)}
				<option value={option.value} disabled={option.disabled}>{option.label}</option>
			{/each}
		</select>
		<span class="select-chevron"><CaretDown size={16} aria-hidden="true" /></span>
	</div>
</div>

<style>
	.select-field {
		min-width: 0;
		font-family: var(--font-sans);
	}
	label {
		display: block;
		margin-bottom: 0.55rem;
		font-size: 0.76rem;
		font-weight: 500;
	}
	.select-control {
		position: relative;
	}
	select {
		appearance: none;
		display: block;
		width: 100%;
		min-height: 48px;
		padding: 0.8rem 2.6rem 0.8rem 0.9rem;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--paper);
		color: var(--navy);
		font: inherit;
		font-size: 0.76rem;
		text-overflow: ellipsis;
		cursor: pointer;
		transition: border-color 0.18s;
	}
	select:hover:not(:disabled) {
		border-color: var(--navy);
	}
	select:focus-visible {
		outline: 2px solid var(--moss);
		outline-offset: 3px;
	}
	select:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.select-chevron {
		position: absolute;
		top: 50%;
		right: 0.9rem;
		display: flex;
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--navy);
	}
	.compact select {
		min-height: 44px;
		padding-block: 0.65rem;
		border-color: transparent;
		background: transparent;
		font-size: 0.73rem;
	}
	.compact select:hover:not(:disabled) {
		border-color: var(--line);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
