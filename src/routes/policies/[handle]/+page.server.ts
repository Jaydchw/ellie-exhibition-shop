import { error } from '@sveltejs/kit';
import { getPolicies, policyFields } from '$lib/commerce/policies';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, fetch }) => {
	if (!Object.hasOwn(policyFields, params.handle)) error(404, 'This policy could not be found.');
	const { config } = await parent();
	let policies;
	try {
		policies = await getPolicies(config, fetch);
	} catch {
		error(503, 'This policy is temporarily unavailable. Please try again.');
	}
	const policy = policies.find((entry) => entry.handle === params.handle);
	if (!policy) error(404, 'This policy has not been published yet.');
	return { policy, policies: policies.map(({ handle, title }) => ({ handle, title })) };
};
