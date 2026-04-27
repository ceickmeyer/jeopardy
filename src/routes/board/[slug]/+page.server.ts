import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/supabase';
import type { JeopardyBoard } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const { data, error: err } = await supabase
		.from('boards')
		.select('title, data')
		.eq('slug', params.slug)
		.single();

	if (err || !data) {
		throw error(404, 'Board not found');
	}

	return {
		board: data.data as JeopardyBoard
	};
};
