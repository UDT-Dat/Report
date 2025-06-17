'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, Calendar, FileText, Filter, Search, User, X } from 'lucide-react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';

interface SearchHeaderProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	handleSearch: (e: React.FormEvent) => void;
	showFilters: boolean;
	setShowFilters: (show: boolean) => void;
	filters: {
		users: boolean;
		events: boolean;
		posts: boolean;
		library: boolean;
	};
	setFilters: React.Dispatch<
		React.SetStateAction<{
			users: boolean;
			events: boolean;
			posts: boolean;
			library: boolean;
		}>
	>;
	fuzzy: boolean;
	searchParams: ReadonlyURLSearchParams;
	router: AppRouterInstance;
	query: string;
}

export function SearchHeader({
	searchQuery,
	setSearchQuery,
	handleSearch,
	showFilters,
	setShowFilters,
	filters,
	setFilters,
	fuzzy,
	searchParams,
	router,
	query,
}: Readonly<SearchHeaderProps>) {
	return (
		<div className="text-center mb-8">
			<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
				<Search className="w-8 h-8 text-white" />
			</div>
			<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
				Tìm kiếm
			</h1>
			<p className="text-gray-600 dark:text-gray-300 mb-6">
				{query ? `Kết quả tìm kiếm cho "${query}"` : 'Nhập từ khóa để tìm kiếm'}
			</p>

			{/* Search Form */}
			<form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							type="search"
							placeholder="Tìm kiếm người dùng, sự kiện, bài viết..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
						/>
					</div>
					<Button
						type="button"
						variant="outline"
						className="h-12 px-4"
						onClick={() => setShowFilters(!showFilters)}
					>
						<Filter className="h-5 w-5 mr-2" />
						Bộ lọc
					</Button>
					<Button
						type="submit"
						className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl"
					>
						Tìm kiếm
					</Button>
				</div>

				{/* Filters */}
				{showFilters && (
					<Card className="mt-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
						<CardContent className="p-4">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-medium">Bộ lọc tìm kiếm</h3>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => setShowFilters(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="filter-users"
										checked={filters.users}
										onCheckedChange={(checked) =>
											setFilters((prev) => ({ ...prev, users: checked === true }))
										}
									/>
									<Label htmlFor="filter-users" className="flex items-center">
										<User className="h-4 w-4 mr-2 text-blue-500" />
										Người dùng
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="filter-events"
										checked={filters.events}
										onCheckedChange={(checked) =>
											setFilters((prev) => ({ ...prev, events: checked === true }))
										}
									/>
									<Label htmlFor="filter-events" className="flex items-center">
										<Calendar className="h-4 w-4 mr-2 text-purple-500" />
										Sự kiện
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="filter-posts"
										checked={filters.posts}
										onCheckedChange={(checked) =>
											setFilters((prev) => ({ ...prev, posts: checked === true }))
										}
									/>
									<Label htmlFor="filter-posts" className="flex items-center">
										<FileText className="h-4 w-4 mr-2 text-green-500" />
										Bài viết
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="filter-library"
										checked={filters.library}
										onCheckedChange={(checked) =>
											setFilters((prev) => ({ ...prev, library: checked === true }))
										}
									/>
									<Label htmlFor="filter-library" className="flex items-center">
										<Book className="h-4 w-4 mr-2 text-orange-500" />
										Thư viện
									</Label>
								</div>
							</div>
							<div className="flex items-center mt-4">
								<Checkbox
									id="filter-fuzzy"
									checked={fuzzy}
									onCheckedChange={(checked) => {
										const params = new URLSearchParams(searchParams);
										params.set('fuzzy', checked ? 'true' : 'false');
										router.push(`/search?${params.toString()}`);
									}}
								/>
								<Label htmlFor="filter-fuzzy" className="ml-2">
									Tìm kiếm mở rộng (fuzzy search)
								</Label>
							</div>
						</CardContent>
					</Card>
				)}
			</form>
		</div>
	);
}
