/**
 * @param {string} value
 * @param {string} [source]
 */
export function parseConstructionBoolean(value, source = '--construction') {
	if (value === 'true') return true;
	if (value === 'false') return false;
	throw new Error(`${source} must be true or false (received ${JSON.stringify(value)}).`);
}

/** @param {string[]} args */
export function parseSiteOptions(args) {
	/** @type {boolean | undefined} */
	let construction;
	/** @type {string[]} */
	const viteArgs = [];

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === '--') {
			viteArgs.push(...args.slice(index));
			break;
		}
		if (arg !== '--construction' && !arg.startsWith('--construction=')) {
			viteArgs.push(arg);
			continue;
		}
		if (construction !== undefined) {
			throw new Error('Pass --construction only once.');
		}
		const value = arg === '--construction' ? args[++index] : arg.slice('--construction='.length);
		if (value === undefined) {
			throw new Error('Pass --construction=true or --construction=false.');
		}
		construction = parseConstructionBoolean(value);
	}

	return { construction, viteArgs };
}
