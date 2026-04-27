import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { parseMarkdown, generateSlug } from '$lib/parser';
import { supabase } from '$lib/server/supabase';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const markdown = data.get('markdown') as string;

		if (!markdown?.trim()) {
			return fail(400, { error: 'Please paste your Jeopardy markdown.' });
		}

		let board;
		try {
			board = parseMarkdown(markdown);
		} catch (e) {
			return fail(400, { error: e instanceof Error ? e.message : 'Failed to parse markdown.' });
		}

		const slug = generateSlug(board.title);

		const { error } = await supabase.from('boards').insert({
			slug,
			title: board.title,
			data: board
		});

		if (error) {
			return fail(500, { error: 'Failed to save board. Please try again.' });
		}

		redirect(303, `/board/${slug}`);
	}
};
