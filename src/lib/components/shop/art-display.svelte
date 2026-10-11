<script lang="ts">
	let {
		src,
		alt = '',
		finish = 'Natural frame',
		eager = false
	}: { src: string; alt?: string; finish?: string; eager?: boolean } = $props();
	let framed = $derived(finish.toLowerCase().includes('frame'));
</script>

<div
	class="art-display"
	class:framed
	class:black={finish.toLowerCase().includes('black')}
	class:white={finish.toLowerCase().includes('white')}
>
	<img {src} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
</div>

<style>
	.art-display {
		width: 100%;
		padding: 6%;
		background: #faf9f5;
		box-shadow: 1px 12px 22px #32291c20;
		transition: transform 0.4s ease;
	}
	.framed {
		border: clamp(5px, 0.65vw, 11px) solid #b8976d;
		box-shadow:
			2px 3px 2px #0002,
			8px 16px 25px #32291c24,
			inset 0 0 5px #0002;
	}
	.framed:not(.black):not(.white) {
		border-image: linear-gradient(115deg, #c4a37e, #a28056 25%, #d4b18a 50%, #9e7b52 80%, #c4a37e) 1;
	}
	.black {
		border-color: #272723;
	}
	.white {
		border-color: #f5f3ee;
	}
	img {
		display: block;
		width: 100%;
		height: auto;
	}
</style>
