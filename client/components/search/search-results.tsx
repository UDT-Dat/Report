'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SearchResult, SearchResultType } from '@/lib/types';
import { ResultCard } from './result-card';

interface SearchResultsProps {
	activeTab: string;
	getFilteredResults: (type?: SearchResultType) => SearchResult[];
}

export function SearchResults({ activeTab, getFilteredResults }: Readonly<SearchResultsProps>) {
	return (
		<Tabs value={activeTab}>
			<TabsContent value="all" className="mt-6 space-y-4">
				{getFilteredResults().map((result) => (
					<ResultCard key={result._id} result={result} />
				))}
			</TabsContent>

			<TabsContent value="users" className="mt-6 space-y-4">
				{getFilteredResults('User').map((result) => (
					<ResultCard key={result._id} result={result} />
				))}
			</TabsContent>

			<TabsContent value="events" className="mt-6 space-y-4">
				{getFilteredResults('Event').map((result) => (
					<ResultCard key={result._id} result={result} />
				))}
			</TabsContent>

			<TabsContent value="posts" className="mt-6 space-y-4">
				{getFilteredResults('Post').map((result) => (
					<ResultCard key={result._id} result={result} />
				))}
			</TabsContent>

			<TabsContent value="library" className="mt-6 space-y-4">
				{getFilteredResults('Library').map((result) => (
					<ResultCard key={result._id} result={result} />
				))}
			</TabsContent>
		</Tabs>
	);
}
