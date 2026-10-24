<script lang="ts">
	import { resolve } from '$app/paths';
	import { useShop } from '$lib/commerce/shop.svelte';
	import { shopCopy } from '$lib/content/shop';
	import Icon from './icon.svelte';
	const shop = useShop();
	let error = $state('');
</script>

<section class="newsletter">
	<div class="wrap newsletter-inner">
		<div>
			<h2>{shopCopy.newsletter.title}</h2>
			<p>{shopCopy.newsletter.description}</p>
		</div>
		<div>
			{#if shop.config.newsletterUrl}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- External hosted URL. -->
				<a class="button" href={shop.config.newsletterUrl}
					>Sign up <Icon name="arrow" size={18} /></a
				>
			{:else}
				<form
					action={shop.config.live
						? `https://${shop.config.domain}/contact#contact_form`
						: undefined}
					method="POST"
					onsubmit={(event) => {
						if (!shop.config.live) {
							event.preventDefault();
							error = 'Signup is unavailable. Please try again later.';
						}
					}}
				>
					<input type="hidden" name="form_type" value="customer" /><input
						type="hidden"
						name="utf8"
						value="✓"
					/><input type="hidden" name="contact[tags]" value="newsletter,seal-stuff" />
					<label for="newsletter-email" class="sr-only">Your email address</label>
					<div class="newsletter-input">
						<input
							id="newsletter-email"
							type="email"
							name="contact[email]"
							autocomplete="email"
							placeholder="Your email address"
							required
						/><button aria-label="Join newsletter"><Icon name="arrow" /></button>
					</div>
					<label class="consent"
						><input type="checkbox" required /> Email me new products and offers. Unsubscribe
						anytime. <a href={resolve('/policies/privacy-policy')}>Privacy</a></label
					>
					{#if error}<p class="error-message" role="alert">{error}</p>{/if}
				</form>
			{/if}
		</div>
	</div>
</section>
