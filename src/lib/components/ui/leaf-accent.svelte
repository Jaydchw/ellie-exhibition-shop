<script lang="ts">
	import leaf from '$lib/assets/images/svgs/leaf-svgrepo-com.svg';

	let {
		side = 'right',
		size = 'large'
	}: {
		side?: 'left' | 'right';
		size?: 'medium' | 'large';
	} = $props();
</script>

<div class="leaf-accent leaf-accent--{side} leaf-accent--{size}" aria-hidden="true">
	<img src={leaf} alt="" />
</div>

<style>
	.leaf-accent {
		position: absolute;
		z-index: 0;
		pointer-events: none;
	}

	.leaf-accent--right {
		top: 12%;
		right: -8%;
		transform: rotate(18deg);
	}

	.leaf-accent--left {
		bottom: 2%;
		left: -9%;
		transform: scaleX(-1) rotate(16deg);
	}

	.leaf-accent--medium {
		width: clamp(11rem, 25vw, 22rem);
	}

	.leaf-accent--large {
		width: clamp(16rem, 36vw, 34rem);
	}

	img {
		display: block;
		width: 100%;
		opacity: 0.11;
	}

	@media (max-width: 620px) {
		.leaf-accent--right {
			top: auto;
			right: -20%;
			bottom: 0;
		}

		.leaf-accent--left {
			bottom: -4%;
			left: -24%;
		}

		img {
			opacity: 0.09;
		}
	}
</style>
