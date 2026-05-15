type MediaRange = { type: string; subtype: string; q: number };

function parseAcceptHeader(accept: string): MediaRange[] {
	if (!accept.trim()) return [];
	return accept.split(',').map((part) => {
		const [media, ...params] = part.trim().split(';');
		const [type = '*', subtype = '*'] = media.trim().toLowerCase().split('/');
		let q = 1;
		for (const param of params) {
			const [key, value] = param.trim().split('=');
			if (key === 'q' && value) {
				const parsed = Number.parseFloat(value);
				if (Number.isFinite(parsed)) q = parsed;
			}
		}
		return { type, subtype, q: q < 0 ? 0 : q };
	});
}

function matchQ(ranges: MediaRange[], type: string, subtype: string): number {
	let best = 0;
	for (const r of ranges) {
		const typeMatch = r.type === '*' || r.type === type;
		const subMatch = r.subtype === '*' || r.subtype === subtype;
		if (typeMatch && subMatch) best = Math.max(best, r.q);
	}
	return best;
}

/** Accept text/markdown con q-values; wildcard cuenta con peso menor que tipos explícitos. */
export function prefersMarkdown(accept: string): boolean {
	const ranges = parseAcceptHeader(accept);
	if (!ranges.length) return false;
	const md = matchQ(ranges, 'text', 'markdown');
	const html = matchQ(ranges, 'text', 'html');
	const any = matchQ(ranges, '*', '*');
	const mdScore = md > 0 ? md : any > 0 ? any * 0.01 : 0;
	const htmlScore = html > 0 ? html : any > 0 ? any * 0.01 : 0;
	return mdScore > htmlScore;
}

/** 406 cuando el cliente no acepta HTML ni Markdown ni wildcard. */
export function isNotAcceptable(accept: string): boolean {
	if (!accept.trim()) return false;
	const ranges = parseAcceptHeader(accept);
	if (!ranges.length) return false;
	const html = matchQ(ranges, 'text', 'html');
	const md = matchQ(ranges, 'text', 'markdown');
	const any = matchQ(ranges, '*', '*');
	return html <= 0 && md <= 0 && any <= 0;
}
