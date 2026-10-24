<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/seo.svelte';
	import Icon from '$lib/components/shop/icon.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import { toast } from '$lib/components/ui/toast';
	import { money } from '$lib/commerce/types';
	let { data, form } = $props();
	let saving = $state(false);
	let editingAddress = $state(false);
	const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
	const countryOptions =
		'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
			.split(' ')
			.map((value) => ({ value, label: countryNames.of(value) ?? value }))
			.sort((a, b) => a.label.localeCompare(b.label));
	let customer = $derived(data.customer);
	let country = $derived(customer?.defaultAddress?.territoryCode ?? 'GB');
	$effect(() => {
		if (form?.saved) {
			toast(
				form.saved === 'profile'
					? 'Your details have been saved.'
					: 'Your delivery address has been saved.',
				'success'
			);
			editingAddress = false;
		} else if (form?.error) toast(form.error, 'error');
	});
	const status = (value: string | null) =>
		value ? value.toLowerCase().replaceAll('_', ' ') : 'Processing';
	function safeOrderLink(value: string) {
		try {
			const url = new URL(value);
			return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
		} catch {
			return null;
		}
	}
</script>

<Seo
	title="Your account | Seal Stuff"
	description="Your Seal Stuff orders, account details and delivery address."
	noindex
/>

<main id="main-content" class="shop-page wrap">
	<header class="account-heading">
		<div>
			<p class="eyebrow">Seal Stuff</p>
			<h1>Your account</h1>
		</div>
		{#if customer}<form method="POST" action={resolve('/account/logout')}>
				<button class="text-button" type="submit">Sign out</button>
			</form>{/if}
	</header>
	{#if data.accountError}<p class="error-message" role="alert">{data.accountError}</p>{/if}
	{#if form?.error}<p class="error-message" role="alert">{form.error}</p>{/if}
	{#if customer}
		<div class="account-grid">
			<section class="account-orders" aria-labelledby="orders-heading">
				<h2 id="orders-heading">Your orders</h2>
				{#if customer.orders.nodes.length}
					<div class="orders-list">
						{#each customer.orders.nodes as order (order.id)}
							<article class="order-row">
								<div>
									<h3>{order.name}</h3>
									<p>
										{new Date(order.processedAt).toLocaleDateString('en-GB', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}
									</p>
								</div>
								<div>
									<p class="order-status">{status(order.fulfillmentStatus)}</p>
									<p>{status(order.financialStatus)}</p>
								</div>
								<div class="order-total">
									<strong>{money(order.totalPrice)}</strong
									>{#if safeOrderLink(order.statusPageUrl)}<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Shopify-authenticated HTTPS order status destination. --><a
											href={safeOrderLink(order.statusPageUrl)}>View delivery updates</a
										>{/if}
								</div>
							</article>
						{/each}
					</div>
					<div class="order-pagination">
						{#if customer.orders.pageInfo.hasNextPage}<a
								class="text-link"
								href={resolve(
									`/account?after=${encodeURIComponent(customer.orders.pageInfo.endCursor ?? '')}` as '/account'
								)}>Older orders <Icon name="arrow" size={16} /></a
							>{/if}
						<a class="text-link" href={resolve('/account')}>Latest orders</a>
					</div>
				{:else}<div class="account-empty">
						<Icon name="bag" size={30} />
						<p>Your orders will appear here.</p>
						<a class="text-link" href={resolve('/shop')}
							>Explore the shop <Icon name="arrow" size={16} /></a
						>
					</div>{/if}
			</section>
			<aside class="account-details">
				<section aria-labelledby="details-heading">
					<h2 id="details-heading">Your details</h2>
					<p class="account-email">{customer.emailAddress?.emailAddress}</p>
					<form
						method="POST"
						action="?/profile"
						use:enhance={() => {
							saving = true;
							return async ({ update }) => {
								await update();
								saving = false;
							};
						}}
					>
						<div class="field-pair">
							<label
								>First name<input
									name="firstName"
									autocomplete="given-name"
									maxlength="100"
									value={customer.firstName ?? ''}
								/></label
							><label
								>Last name<input
									name="lastName"
									autocomplete="family-name"
									maxlength="100"
									value={customer.lastName ?? ''}
								/></label
							>
						</div>
						<button class="button secondary" disabled={saving} type="submit"
							>{saving ? 'Saving…' : 'Save details'}</button
						>
					</form>
				</section>
				<section aria-labelledby="address-heading">
					<div class="address-heading">
						<h2 id="address-heading">Delivery address</h2>
						<button
							class="text-button"
							type="button"
							onclick={() => (editingAddress = !editingAddress)}
							>{editingAddress ? 'Cancel' : customer.defaultAddress ? 'Edit' : 'Add'}</button
						>
					</div>
					{#if editingAddress}
						<form
							method="POST"
							action="?/address"
							use:enhance={() => {
								saving = true;
								return async ({ update }) => {
									await update();
									saving = false;
								};
							}}
						>
							<div class="field-pair">
								<label
									>First name<input
										name="firstName"
										autocomplete="shipping given-name"
										maxlength="100"
										value={customer.defaultAddress?.firstName ?? customer.firstName ?? ''}
									/></label
								><label
									>Last name<input
										name="lastName"
										autocomplete="shipping family-name"
										maxlength="100"
										value={customer.defaultAddress?.lastName ?? customer.lastName ?? ''}
									/></label
								>
							</div>
							<label
								>Address<input
									name="address1"
									autocomplete="shipping address-line1"
									maxlength="200"
									required
									value={customer.defaultAddress?.address1 ?? ''}
								/></label
							>
							<label
								>Apartment, suite, etc. <span>(optional)</span><input
									name="address2"
									autocomplete="shipping address-line2"
									maxlength="200"
									value={customer.defaultAddress?.address2 ?? ''}
								/></label
							>
							<label
								>Town or city<input
									name="city"
									autocomplete="shipping address-level2"
									maxlength="200"
									required
									value={customer.defaultAddress?.city ?? ''}
								/></label
							>
							<div class="field-pair">
								<label
									>Postcode<input
										name="zip"
										autocomplete="shipping postal-code"
										maxlength="30"
										value={customer.defaultAddress?.zip ?? ''}
									/></label
								><label
									>State / province code <span>(if needed)</span><input
										name="zoneCode"
										autocomplete="shipping address-level1"
										maxlength="30"
										value={customer.defaultAddress?.zoneCode ?? ''}
									/></label
								>
							</div>
							<Select
								label="Country"
								name="territoryCode"
								value={country}
								options={countryOptions}
								onchange={(value) => (country = value)}
							/>
							<label
								>Phone <span>(optional, including + country code)</span><input
									type="tel"
									name="phoneNumber"
									autocomplete="shipping tel"
									maxlength="30"
									placeholder="+44…"
									value={customer.defaultAddress?.phoneNumber ?? ''}
								/></label
							>
							<button class="button secondary" disabled={saving} type="submit"
								>{saving ? 'Saving…' : 'Save address'}</button
							>
						</form>
					{:else if customer.defaultAddress}<address>
							{#each customer.defaultAddress.formatted as line, i (i)}<span>{line}</span>{/each}
						</address>{:else}<p class="muted">No address saved yet.</p>{/if}
				</section>
			</aside>
		</div>
	{:else}
		<section class="account-signin">
			<Icon name="user" size={30} />
			<h2>A little space for your orders.</h2>
			<p>Sign in to see your purchases and update your delivery details.</p>
			{#if data.configured}<a
					class="button"
					href={resolve('/account/login')}
					data-sveltekit-preload-data="off"
					data-sveltekit-reload>Sign in or create an account <Icon name="arrow" size={18} /></a
				>
				<p class="signin-note">Shopify securely verifies your email, then brings you back here.</p>
			{:else}<p class="connection-note">
					Account sign-in is being connected. For help with an order, please get in touch.
				</p>{/if}
			<a class="text-link" href={resolve('/help')}>Need a hand?</a>
		</section>
	{/if}
</main>

<style>
	.account-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 2.5rem 0 2rem;
		border-bottom: 1px solid var(--line);
	}
	.eyebrow {
		font: 500 0.65rem var(--font-sans);
		color: var(--muted);
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	h1 {
		font-size: clamp(2rem, 4vw, 2.75rem);
		line-height: 1.1;
		margin: 0;
	}
	h2 {
		font-size: 1.6rem;
		margin: 0 0 1.25rem;
		font-weight: 500;
	}
	h3 {
		font: 500 0.85rem var(--font-sans);
		margin: 0 0 0.5rem;
	}
	.account-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: clamp(2rem, 6vw, 5rem);
		padding: 2.5rem 0 4rem;
	}
	.account-details > section + section {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}
	.account-email,
	address,
	.account-details p {
		font: 400 0.8rem/1.75 var(--font-sans);
	}
	address {
		font-style: normal;
	}
	address span {
		display: block;
	}
	form {
		display: grid;
		gap: 1rem;
	}
	.account-heading form {
		display: block;
	}
	label {
		display: grid;
		gap: 0.5rem;
		min-width: 0;
		font: 500 0.75rem var(--font-sans);
	}
	label span {
		color: var(--muted);
		font-size: 0.65rem;
		font-weight: 400;
	}
	input {
		width: 100%;
		min-width: 0;
		min-height: 44px;
		padding: 0.7rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--paper);
		color: var(--navy);
		font: 400 0.8rem var(--font-sans);
	}
	.field-pair {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}
	.address-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}
	.button {
		justify-self: start;
	}
	.order-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 1.25rem;
		padding: 1.25rem 0;
		border-top: 1px solid var(--line);
		font-family: var(--font-sans);
	}
	.order-row p,
	.order-row a {
		margin: 0.3rem 0 0;
		font-size: 0.72rem;
		color: var(--muted);
	}
	.order-row .order-status {
		color: var(--navy);
		text-transform: capitalize;
	}
	.order-total {
		text-align: right;
	}
	.order-total strong {
		font-size: 0.8rem;
		font-weight: 500;
	}
	.order-total a {
		display: block;
		text-underline-offset: 3px;
	}
	.order-pagination {
		display: flex;
		gap: 1.5rem;
		padding-top: 1.5rem;
		font-size: 0.75rem;
	}
	.account-empty {
		display: grid;
		gap: 0.75rem;
		justify-items: start;
		padding: 2rem 0;
		font: 400 0.8rem var(--font-sans);
	}
	.account-signin {
		max-width: 34rem;
		margin: 3rem auto 5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.25rem;
	}
	.account-signin h2 {
		font-size: 2rem;
		margin: 0;
	}
	.account-signin p {
		font: 400 0.8rem/1.7 var(--font-sans);
		margin: 0;
		max-width: 28rem;
	}
	.account-signin .signin-note {
		font-size: 0.7rem;
		color: var(--muted);
	}
	.connection-note {
		padding: 1rem;
		background: var(--stone);
		border-radius: 4px;
	}
	.error-message {
		font: 400 0.8rem/1.6 var(--font-sans);
	}
	@media (max-width: 850px) {
		.account-grid {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
		.account-details {
			max-width: 34rem;
			width: 100%;
		}
	}
	@media (max-width: 500px) {
		.order-row {
			grid-template-columns: 1fr auto;
			gap: 1rem;
		}
		.order-row > div:nth-child(2) {
			grid-column: 1;
			grid-row: 2;
		}
		.order-total {
			grid-column: 2;
			grid-row: 1 / span 2;
		}
		.field-pair {
			grid-template-columns: 1fr;
		}
	}
</style>
