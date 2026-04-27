import type { JeopardyBoard, JeopardyCategory } from './types';

export function parseMarkdown(markdown: string): JeopardyBoard {
	const lines = markdown.split('\n').map((l) => l.trim());

	const titleLine = lines.find((l) => l.match(/^# .+/));
	const rawTitle =
		titleLine
			?.replace(/^# /, '')
			.replace(/ Jeopardy$/i, '')
			.trim() ?? 'Jeopardy';

	const categories: JeopardyCategory[] = [];
	let currentCat: JeopardyCategory | null = null;
	let pendingValue: number | null = null;
	let pendingQuestion: string | null = null;

	for (const line of lines) {
		if (line.startsWith('### ')) {
			if (currentCat) categories.push(currentCat);
			currentCat = { name: line.slice(4).trim(), questions: [] };
			pendingValue = null;
			pendingQuestion = null;
		} else if (/^\*\*\$\d+\*\*$/.test(line)) {
			const m = line.match(/\$(\d+)/);
			if (m) pendingValue = parseInt(m[1]);
			pendingQuestion = null;
		} else if (line.startsWith('Q: ') && pendingValue !== null && currentCat) {
			pendingQuestion = line.slice(3).trim();
		} else if (
			line.startsWith('A: ') &&
			pendingValue !== null &&
			pendingQuestion !== null &&
			currentCat
		) {
			currentCat.questions.push({
				value: pendingValue,
				question: pendingQuestion,
				answer: line.slice(3).trim()
			});
			pendingValue = null;
			pendingQuestion = null;
		}
	}

	if (currentCat) categories.push(currentCat);

	if (categories.length === 0) {
		throw new Error('No categories found. Make sure your markdown has ### Category headers.');
	}

	const empty = categories.filter((c) => c.questions.length === 0);
	if (empty.length > 0) {
		throw new Error(`Category "${empty[0].name}" has no questions.`);
	}

	return { title: rawTitle, categories };
}

export function generateSlug(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40);
	const suffix = Math.random().toString(36).slice(2, 6);
	return `${base}-${suffix}`;
}
