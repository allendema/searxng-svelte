import type { PageServerLoad } from './$types';
import { API_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const q = url.searchParams.get('q');
	if (q === null || q === '') {
		return {
			query: '',
			results: []
		};
	}
	const apiUrl = `${API_URL}/search?q=${q}`;
	const response = await fetch(apiUrl);
	const results = await response.json();

	return {
		query: q,
		results: results
	};
};