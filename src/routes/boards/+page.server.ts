import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const { data, error } = await supabase
		.from('boards')
		.select('slug, title, created_at')
		.order('created_at', { ascending: false });

	if (error) return { boards: [] };

	return { boards: data };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const slug = data.get('slug') as string;

		if (!slug) return fail(400, { error: 'Missing slug.' });

		const { error } = await supabase.from('boards').delete().eq('slug', slug);

		if (error) return fail(500, { error: 'Failed to delete board.' });
	}
};
