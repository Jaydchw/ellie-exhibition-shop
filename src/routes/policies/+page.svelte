<script lang="ts">
	import { useShop } from '$lib/commerce/shop.svelte';
	import { shopCopy } from '$lib/content/shop';
	const shop = useShop();
</script>

<svelte:head><title>Privacy & shop policies — Seal Stuff</title></svelte:head>
<main id="main-content" class="shop-page wrap">
	<section class="page-intro">
		<h1>Shop policies</h1>
	</section>
	<div class="policy-content">
		<section>
			<h2>Shop policies</h2>
			{#if shop.config.live}<p>
					Our current delivery, refund, privacy and terms policies are published on our Shopify
					store and are available during checkout.
				</p>
				<ul>
					<li>
						<a href={`https://${shop.config.domain}/policies/refund-policy`}>Returns & refunds</a>
					</li>
					<li>
						<a href={`https://${shop.config.domain}/policies/shipping-policy`}>Shipping policy</a>
					</li>
					<li>
						<a href={`https://${shop.config.domain}/policies/privacy-policy`}>Privacy policy</a>
					</li>
					<li>
						<a href={`https://${shop.config.domain}/policies/terms-of-service`}>Terms of service</a>
					</li>
				</ul>{:else}<p>
					For delivery, returns or privacy questions, email <a href={'mailto:' + shopCopy.email}
						>{shopCopy.email}</a
					>.
				</p>{/if}
		</section>
		<section>
			<h2>Browser storage</h2>
			<p>
				We store your bag reference and saved artwork choices in your browser so they remain
				available when you return. Saved pieces stay on this device and are not synced to an
				account. You can remove saved items with the heart button, empty your bag, or clear this
				site’s browser storage.
			</p>
			<p>
				Shopify processes checkout, account access and newsletter signup on its hosted pages. These
				services have their own cookie and privacy information. This storefront does not include
				advertising or analytics trackers. Fonts are loaded from Google Fonts, which receives the
				connection information needed to serve them.
			</p>
		</section>
		<section>
			<h2>Questions?</h2>
			<p>
				For help with your information or an order, contact <a href={'mailto:' + shopCopy.email}
					>{shopCopy.email}</a
				>.
			</p>
		</section>
	</div>
</main>

<style>
	.policy-content {
		max-width: 800px;
		padding-bottom: 4rem;
	}
	.policy-content section {
		margin-bottom: 3rem;
	}
	.policy-content p,
	.policy-content li {
		font-size: 0.85rem;
		line-height: 1.9;
		color: var(--body);
	}
	.policy-content li {
		margin: 0.8rem 0;
	}
	.policy-content ul {
		padding-left: 1.2rem;
	}
</style>
