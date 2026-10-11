import { describe, expect, it } from 'vitest';
import { parseConstructionBoolean, parseSiteOptions } from '../scripts/site-options.mjs';

describe('construction command options', () => {
	it('leaves the default or environment setting in place without a flag', () => {
		expect(parseSiteOptions(['--host', '0.0.0.0'])).toEqual({
			construction: undefined,
			viteArgs: ['--host', '0.0.0.0']
		});
	});

	it.each([true, false])(
		'accepts an explicit %s setting and removes it from Vite arguments',
		(value) => {
			expect(parseSiteOptions(['--port', '5174', `--construction=${value}`, '--host'])).toEqual({
				construction: value,
				viteArgs: ['--port', '5174', '--host']
			});
		}
	);

	it('also accepts a space-separated boolean', () => {
		expect(parseSiteOptions(['--construction', 'false', '--mode', 'test'])).toEqual({
			construction: false,
			viteArgs: ['--mode', 'test']
		});
	});

	it.each(['', '0', '1', 'FALSE', 'yes'])(
		'rejects %j instead of accidentally opening the shop',
		(value) => {
			expect(() => parseSiteOptions([`--construction=${value}`])).toThrow('must be true or false');
		}
	);

	it('rejects a missing value or ambiguous duplicate flags', () => {
		expect(() => parseSiteOptions(['--construction'])).toThrow('Pass --construction=true');
		expect(() => parseSiteOptions(['--construction=false', '--construction=true'])).toThrow(
			'only once'
		);
	});

	it('preserves arguments after an explicit argument separator', () => {
		expect(parseSiteOptions(['--', '--construction=false'])).toEqual({
			construction: undefined,
			viteArgs: ['--', '--construction=false']
		});
	});

	it('uses the same strict boolean parser for build environment values', () => {
		expect(parseConstructionBoolean('true', 'SHOP_UNDER_CONSTRUCTION')).toBe(true);
		expect(parseConstructionBoolean('false', 'SHOP_UNDER_CONSTRUCTION')).toBe(false);
		expect(() => parseConstructionBoolean('no', 'SHOP_UNDER_CONSTRUCTION')).toThrow(
			'SHOP_UNDER_CONSTRUCTION must be true or false'
		);
	});
});
