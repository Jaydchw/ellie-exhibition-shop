// Render merchant HTML as plain text. Svelte escapes the result; no merchant
// scripts, event handlers or embedded frames are inserted into this storefront.
export function pageParagraphs(html: string): string[] {
	const entities: Record<string, string> = {
		amp: '&',
		lt: '<',
		gt: '>',
		quot: '"',
		apos: "'",
		nbsp: ' ',
		ndash: '–',
		mdash: '—',
		lsquo: '‘',
		rsquo: '’',
		ldquo: '“',
		rdquo: '”'
	};
	return html
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
		.replace(/<br\s*\/?\s*>/gi, '\n')
		.replace(/<\/(?:p|div|h[1-6]|li|blockquote)\s*>/gi, '\n\n')
		.replace(/<[^>]*>/g, '')
		.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
			if (!key.startsWith('#')) return entities[key.toLowerCase()] ?? entity;
			const code = key.toLowerCase().startsWith('#x')
				? parseInt(key.slice(2), 16)
				: parseInt(key.slice(1), 10);
			return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
		})
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}
