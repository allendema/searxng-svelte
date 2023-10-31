import type { PageLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageLoad = async ({ fetch, url }) => {
	const q = url.searchParams.get('q');
	if (q === null || q === '') {
		return {
			query: '',
			results: []
		};
	}
	const apiUrl = `${env.PUBLIC_API_URL}/search?q=${q}`;
	const response = await fetch(apiUrl);
	const results = await response.json();

	return {
		query: q,
		results: results
	};
};
