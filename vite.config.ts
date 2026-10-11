import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { parseConstructionBoolean } from './scripts/site-options.mjs';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'SHOP_');
	const underConstruction = parseConstructionBoolean(
		process.env.SHOP_UNDER_CONSTRUCTION ?? env.SHOP_UNDER_CONSTRUCTION ?? 'true',
		'SHOP_UNDER_CONSTRUCTION'
	);

	return {
		plugins: [tailwindcss(), sveltekit()],
		define: { __SHOP_UNDER_CONSTRUCTION__: JSON.stringify(underConstruction) }
	};
});
