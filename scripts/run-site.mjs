import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { parseSiteOptions } from './site-options.mjs';

const [command, ...args] = process.argv.slice(2);

try {
	if (command !== 'dev' && command !== 'build') {
		throw new Error('Use this runner with dev or build. Preview uses the setting from the build.');
	}
	const { construction, viteArgs } = parseSiteOptions(args);
	const require = createRequire(import.meta.url);
	const vite = resolve(dirname(require.resolve('vite/package.json')), 'bin/vite.js');
	const child = spawn(process.execPath, [vite, command, ...viteArgs], {
		stdio: 'inherit',
		env: {
			...process.env,
			...(construction === undefined ? {} : { SHOP_UNDER_CONSTRUCTION: String(construction) })
		}
	});
	child.on('error', (error) => {
		console.error(`Unable to start Vite: ${error.message}`);
		process.exitCode = 1;
	});
	child.on('exit', (code, signal) => {
		process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1);
	});
	for (const signal of /** @type {const} */ (['SIGINT', 'SIGTERM'])) {
		process.on(signal, () => child.kill(signal));
	}
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}
