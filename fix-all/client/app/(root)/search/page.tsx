'use client';

import { SearchEmptyState } from '@/components/search/search-empty-state';
import { SearchHeader } from '@/components/search/search-header';
import { SearchPagination } from '@/components/search/search-pagination';
import { SearchResults } from '@/components/search/search-results';
import { SearchTabs } from '@/components/search/search-tabs';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { SearchResponse, SearchResult, SearchResultType } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function SearchPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams.get('q') ?? '';
	const page = Number.parseInt(searchParams.get('page') ?? '1');
	const limit = Number.parseInt(searchParams.get('limit') ?? '10');
	const fuzzy = searchParams.get('fuzzy') !== 'false'; // Default to true if not specified

	const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState(query);
	const [activeTab, setActiveTab] = useState<string>('all');
	type Filters = {
		users: boolean;
		events: boolean;
		posts: boolean;
		library: boolean;
	};
	const [filters, setFilters] = useState<Filters>({
		users: true,
		events: true,
		posts: true,
		library: true,
	});
	const [showFilters, setShowFilters] = useState(false);

	// Helper to build type filters
	const buildTypeFilters = (activeTab: string, filters: Filters) => {
		const typeFilters: string[] = [];
		if (activeTab === 'all') {
			if (filters.users) typeFilters.push('User');
			if (filters.events) typeFilters.push('Event');
			if (filters.posts) typeFilters.push('Post');
			if (filters.library) typeFilters.push('Library');
		} else {
			const tabMap: { [key: string]: string } = {
				users: 'User',
				events: 'Event',
				posts: 'Post',
				library: 'Library',
			};
			if (tabMap[activeTab]) typeFilters.push(tabMap[activeTab]);
		}
		return typeFilters;
	};

	// Helper to process results and add URLs
	const processResults = (results: SearchResult[]) => {
		return results.map((result: SearchResult) => {
			const urlMap: { [key in SearchResultType]: string } = {
				User: `/profile/${result._id}`,
				Event: `/events/${result._id}`,
				Post: `/posts/${result._id}`,
				Library: `/library/${result._id}`,
			};
			return { ...result, url: urlMap[result.type] || '' };
		});
	};

	// Fetch search results
	useEffect(() => {
		setSearchQuery(query);
		setSearchResults(null);
		setLoading(true);
		setError(null);
		const fetchSearchResults = async () => {
			if (!query) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const typeFilters = buildTypeFilters(activeTab, filters);
				const typeParam = typeFilters.length > 0 ? `&types=${typeFilters.join(',')}` : '';

				const response = await fetchApi(
					`/search/global?q=${encodeURIComponent(
						query
					)}&page=${page}&limit=${limit}&fuzzy=${fuzzy}${typeParam}`
				);

				if (response.status === 200) {
					const processedResults = processResults(response.result.results);

					setSearchResults({
						...response.result,
						results: processedResults,
					});
				} else {
					setError('Không thể tìm kiếm. Vui lòng thử lại sau.');
				}
			} catch (err) {
				console.error('Search error:', err);
				setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
			} finally {
				setLoading(false);
			}
		};

		fetchSearchResults();
	}, [query, page, limit, fuzzy, activeTab, filters]);

	// Handle search form submission
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			const params = new URLSearchParams();
			params.set('q', searchQuery);
			params.set('page', '1');
			params.set('limit', limit.toString());
			params.set('fuzzy', fuzzy.toString());
			router.push(`/search?${params.toString()}`);
		}
	};

	// Handle pagination
	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', newPage.toString());
		router.push(`/search?${params.toString()}`);
	};

	// Fixed getFilteredResults function
	const getFilteredResults = (type?: SearchResultType) => {
		if (!searchResults?.results) return [];
		if (!type) return searchResults.results; // Return all results if no type specified
		return searchResults.results.filter((result) => result.type === type);
	};

	// Get total count for each type
	const getUserCount = () => getFilteredResults('User').length;
	const getEventCount = () => getFilteredResults('Event').length;
	const getPostCount = () => getFilteredResults('Post').length;
	const getLibraryCount = () => getFilteredResults('Library').length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl"></div>
			</div>

			<div className="container mx-auto px-4 py-8 relative">
				{/* Search Header */}
				<SearchHeader
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					handleSearch={handleSearch}
					showFilters={showFilters}
					setShowFilters={setShowFilters}
					filters={filters}
					setFilters={setFilters}
					fuzzy={fuzzy}
					searchParams={searchParams}
					router={router}
					query={query}
				/>

				{/* Search Results */}
				{(() => {
					let content: React.ReactNode = null;
					if (loading) {
						content = (
							<div className="flex flex-col items-center justify-center py-12">
								<Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
								<p className="text-gray-600 dark:text-gray-400">Đang tìm kiếm...</p>
							</div>
						);
					} else if (error) {
						content = (
							<div className="text-center py-12">
								<p className="text-red-500 mb-4">{error}</p>
								<Button onClick={() => router.push('/search')} variant="outline">
									Thử lại
								</Button>
							</div>
						);
					} else if (!query) {
						content = <SearchEmptyState type="initial" />;
					} else if (searchResults && searchResults.results.length === 0) {
						content = <SearchEmptyState type="no-results" query={query} />;
					} else if (searchResults) {
						content = (
							<div>
								<div className="mb-4">
									<p className="text-gray-600 dark:text-gray-400">
										Tìm thấy {searchResults.total} kết quả
									</p>
								</div>

								<SearchTabs
									activeTab={activeTab}
									setActiveTab={setActiveTab}
									userCount={getUserCount()}
									eventCount={getEventCount()}
									postCount={getPostCount()}
									libraryCount={getLibraryCount()}
									totalCount={searchResults.results.length}
								/>

								<SearchResults activeTab={activeTab} getFilteredResults={getFilteredResults} />

								{/* Pagination */}
								{searchResults.total > limit && (
									<SearchPagination
										total={searchResults.total}
										limit={limit}
										currentPage={page}
										onPageChange={handlePageChange}
									/>
								)}
							</div>
						);
					}
					return content;
				})()}
			</div>
		</div>
	);
}
