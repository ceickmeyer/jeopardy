import katex from 'katex';

// Matches $$...$$, \[...\], \(...\), or $...$ (in that priority order).
// Inline $...$ follows the pandoc rule so currency like "$5 and $10" is left alone:
// the opening $ must not be followed by whitespace, the closing $ must not be
// preceded by whitespace or followed by a digit. Use \$ for a literal dollar sign.
const MATH_RE =
	/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<!\\)\$(?!\s)((?:\\.|[^$\\])+?)(?<!\s)\$(?!\d)/g;

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Converts text with embedded LaTeX into safe HTML. Non-math text is escaped. */
export function renderMath(text: string): string {
	let html = '';
	let last = 0;

	for (const m of text.matchAll(MATH_RE)) {
		html += escapeHtml(text.slice(last, m.index).replace(/\\\$/g, '$'));
		const [, display1, display2, inline1, inline2] = m;
		const tex = display1 ?? display2 ?? inline1 ?? inline2;
		html += katex.renderToString(tex, {
			displayMode: display1 !== undefined || display2 !== undefined,
			throwOnError: false
		});
		last = m.index + m[0].length;
	}

	return html + escapeHtml(text.slice(last).replace(/\\\$/g, '$'));
}
