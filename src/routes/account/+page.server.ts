import { fail } from '@sveltejs/kit';
import {
	accountConfigured,
	accountGraphql,
	accountQuery,
	accountSession,
	type AccountCustomer
} from '$lib/server/customer-account';
import { getAccountConfig } from '$lib/server/customer-account-config';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url, fetch }) => {
	const config = getAccountConfig();
	const configured = accountConfigured(config);
	const initial = {
		configured,
		customer: null as AccountCustomer | null,
		accountError: url.searchParams.has('error')
			? 'Sign-in could not be completed. Please try again.'
			: ''
	};
	if (!configured) return initial;
	const session = await accountSession(config, cookies, url, fetch);
	if (!session) return initial;
	try {
		const cursor = url.searchParams.get('after');
		const { customer } = await accountGraphql<{ customer: AccountCustomer }>(
			config,
			session,
			fetch,
			accountQuery,
			{ after: cursor && cursor.length <= 1000 ? cursor : null }
		);
		return { ...initial, customer };
	} catch {
		return {
			...initial,
			accountError: 'Your account could not be loaded. Please refresh to try again.'
		};
	}
};

const readText = (form: FormData, key: string, maximum = 200) => {
	const raw = form.get(key);
	const value = typeof raw === 'string' ? raw.trim() : '';
	if (value.length > maximum) throw new Error('Please shorten your account details.');
	return value;
};

export const actions: Actions = {
	profile: async ({ request, cookies, url, fetch }) => {
		if (request.headers.get('origin') !== url.origin)
			return fail(403, { error: 'Please save your details from this website.' });
		const config = getAccountConfig();
		const session = await accountSession(config, cookies, url, fetch);
		if (!session) return fail(401, { error: 'Please sign in again to update your account.' });
		try {
			const form = await request.formData();
			const input = {
				firstName: readText(form, 'firstName', 100),
				lastName: readText(form, 'lastName', 100)
			};
			const result = await accountGraphql<{
				customerUpdate: { userErrors: { message: string }[] };
			}>(
				config,
				session,
				fetch,
				'mutation Profile($input: CustomerUpdateInput!) { customerUpdate(input: $input) { userErrors { message } } }',
				{ input }
			);
			if (result.customerUpdate.userErrors.length)
				return fail(400, {
					error: result.customerUpdate.userErrors.map((e) => e.message).join(' ')
				});
			return { saved: 'profile' };
		} catch {
			return fail(400, { error: 'Your details could not be saved. Check them and try again.' });
		}
	},
	address: async ({ request, cookies, url, fetch }) => {
		if (request.headers.get('origin') !== url.origin)
			return fail(403, { error: 'Please save your address from this website.' });
		const config = getAccountConfig();
		const session = await accountSession(config, cookies, url, fetch);
		if (!session) return fail(401, { error: 'Please sign in again to update your address.' });
		try {
			const form = await request.formData();
			const address = {
				firstName: readText(form, 'firstName', 100),
				lastName: readText(form, 'lastName', 100),
				address1: readText(form, 'address1'),
				address2: readText(form, 'address2'),
				city: readText(form, 'city'),
				zip: readText(form, 'zip', 30),
				zoneCode: readText(form, 'zoneCode', 30),
				territoryCode: readText(form, 'territoryCode', 2).toUpperCase(),
				phoneNumber: readText(form, 'phoneNumber', 30)
			};
			if (
				!address.address1 ||
				!address.city ||
				!/^[A-Z]{2}$/.test(address.territoryCode) ||
				(address.phoneNumber && !/^\+[1-9]\d{5,14}$/.test(address.phoneNumber))
			)
				return fail(400, {
					error: 'Check your street, city, country and international phone number.'
				});
			// Use the authenticated customer's actual address, not an ID from the browser.
			const current = await accountGraphql<{ customer: { defaultAddress: { id: string } | null } }>(
				config,
				session,
				fetch,
				'query DefaultAddress { customer { defaultAddress { id } } }'
			);
			const addressId = current.customer.defaultAddress?.id;
			const query = addressId
				? 'mutation Address($address: CustomerAddressInput!, $addressId: ID!) { result: customerAddressUpdate(address: $address, addressId: $addressId, defaultAddress: true) { userErrors { message } } }'
				: 'mutation Address($address: CustomerAddressInput!) { result: customerAddressCreate(address: $address, defaultAddress: true) { userErrors { message } } }';
			const result = await accountGraphql<{ result: { userErrors: { message: string }[] } }>(
				config,
				session,
				fetch,
				query,
				{
					address: { ...address, phoneNumber: address.phoneNumber || null },
					...(addressId ? { addressId } : {})
				}
			);
			if (result.result.userErrors.length)
				return fail(400, { error: result.result.userErrors.map((e) => e.message).join(' ') });
			return { saved: 'address' };
		} catch {
			return fail(400, { error: 'Your address could not be saved. Check it and try again.' });
		}
	}
};
