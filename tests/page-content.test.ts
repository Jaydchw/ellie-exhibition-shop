import { describe, expect, it } from 'vitest';
import { pageParagraphs } from '../src/lib/commerce/page-content';

describe('Shopify page text', () => {
	it('preserves paragraphs and decodes merchant typography without rendering HTML', () => {
		expect(
			pageParagraphs('<h2>Delivery &amp; collection</h2><p>Ellie&#8217;s studio<br>Hull</p>')
		).toEqual(['Delivery & collection', 'Ellie’s studio\nHull']);
	});
	it('omits executable content and leaves escaped markup as plain text', () => {
		expect(pageParagraphs('<script>alert(1)</script><p>&lt;img onerror=alert(1)&gt;</p>')).toEqual([
			'<img onerror=alert(1)>'
		]);
	});
});
