import { env as envPubSearxng } from '$env/dynamic/public';
import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';

const isSearxng = envPubSearxng.PUBLIC_SEARXNG === 'true';

//export const csr = isSearxng ? true : false;
export const csr = isSearxng ? false : undefined; // works with searxng

//console.log("is csr: " + csr);

import { getCategoryFromQuery, getQueryWithoutCategory } from '$lib/functions/query/category';
import { concatSearchParams } from '$lib/functions/api/concatparams';
import { fetchResults } from '$lib/functions/api/fetchresults';

import { CategoryEnum, toCategoryType } from '$lib/types/search/category';
import { exchangery, extractExchangeQuery } from '$lib/functions/query/gadgets/exchange';
import { fetchCurrencies } from '$lib/functions/api/fetchcurrencies';

/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch }) {
	// Get query, current page, and max pages from URL.
	const query = url.searchParams.get('q') ?? '';
	const currentPage = parseInt(url.searchParams.get('start') ?? '1', 10);
	const maxPages = parseInt(url.searchParams.get('pages') ?? '1', 10);

	// Validate query, current page, and max pages.
	if (query === '') {
		// Bad Request.
		throw error(400, "Missing 'q' parameter");
	}
	if (isNaN(currentPage) || currentPage <= 0) {
		// Bad Request.
		throw error(400, "Invalid 'start' parameter");
	}
	if (isNaN(maxPages) || maxPages <= 0) {
		// Bad Request.
		throw error(400, "Invalid 'pages' parameter");
	}

	// Get category from URL or query (query takes precedence).
	const category = getCategory(query, url.searchParams);

	// Remove category from query if it exists.
	const queryWithoutCategory = getQueryWithoutCategory(query);
	if (queryWithoutCategory === '') {
		// Bad Request.
		throw error(400, "Only category specified in 'q' parameter");
	}

	var newSearchParams = null;
	// console.log("isSearxng: " + isSearxng);
	// console.log(toCategoryType(category));

	// newSearchParams if hearchco backend
	if (!isSearxng) {
		// Concatenate search params.
		var newSearchParams = concatSearchParams([
			['q', queryWithoutCategory],
			['category', category !== CategoryEnum.GENERAL ? category : ''],
			['start', currentPage !== 1 ? currentPage.toString() : ''],
			['pages', maxPages !== 1 ? maxPages.toString() : '']
		]);
	}

	// newSearchParams if isSearxng backend
	if (isSearxng) {
		// hearchco to searxng backend 'categories' conversions
		const categoryParamsMap = {
			[CategoryEnum.GENERAL]: () => [
				['categories', 'general'],
				['format', 'json']
			],
			[CategoryEnum.IMAGES]: () => [
				['categories', 'images'],
				['format', 'json']
			],
			[CategoryEnum.SCIENCE]: () => [
				['categories', 'science'],
				['format', 'json']
			],
			[CategoryEnum.THOROUGH]: () => [
				['categories', 'science,music,news,social_media,general'],
				['format', 'json']
			]
		};

		// Concatenate searxng search params.
		var newSearchParams = concatSearchParams([
			['q', queryWithoutCategory],
			['pageno', currentPage.toString()],
			...categoryParamsMap[category]()
		]);
	}
	// console.log(newSearchParams);

	// Fetch results.
	const respP = fetchResults(newSearchParams, fetch);

	// If category in CategoryEnum, return results.
	if (typeof toCategoryType(category) !== 'undefined') {
		const resp = await respP;
		return {
			browser: browser,
			query: queryWithoutCategory,
			currentPage: currentPage,
			maxPages: maxPages,
			category: category,
			results: resp.results,
			duration: resp.duration,
			exchange: null
		};
	}

	// exchange results
	if (exchangery(queryWithoutCategory)) {
		// Fetch exchange result.
		const { from, to, amount } = extractExchangeQuery(queryWithoutCategory);
		const currenciesP = fetchCurrencies();

		// Wait for all promises to resolve.
		const resp = await respP;
		const currencies = await currenciesP;

		return {
			browser: browser,
			query: queryWithoutCategory,
			currentPage: currentPage,
			maxPages: maxPages,
			category: category,
			results: resp.results,
			duration: resp.duration,
			exchange: {
				from: from,
				to: to,
				amount: amount,
				currencies: new Map(Object.entries(currencies.currencies))
			}
		};
	}
}
/**
 * Get category from URL or query.
 * @param {string} query - Query from URL.
 * @param {URLSearchParams} params - Parameters.
 * @returns {string} - Category.
 * @throws {Error} - If category is invalid.
 */
function getCategory(query, params) {
	const categoryFromQuery = getCategoryFromQuery(query);
	const categoryParam = params.get('category') ?? '';
	var category =
		categoryFromQuery !== ''
			? toCategoryType(categoryFromQuery)
			: categoryParam !== ''
				? toCategoryType(categoryParam)
				: CategoryEnum.GENERAL;

	// Check if category is valid.
	if (!category) {
		if (isSearxng) {
			category = CategoryEnum.GENERAL;
		} else {
			// Bad Request.
			throw error(400, "Invalid 'category' parameter in URL or query");
		}
	}
	return category;
}
