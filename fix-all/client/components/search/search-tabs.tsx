'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchTabsProps {
	readonly activeTab: string;
	readonly setActiveTab: (tab: string) => void;
	readonly userCount: number;
	readonly eventCount: number;
	readonly postCount: number;
	readonly libraryCount: number;
	readonly totalCount: number;
}

export function SearchTabs({
	activeTab,
	setActiveTab,
	userCount,
	eventCount,
	postCount,
	libraryCount,
	totalCount,
}: SearchTabsProps) {
	return (
		<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
			<TabsList className="grid grid-cols-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
				<TabsTrigger
					value="all"
					className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
				>
					Tất cả ({totalCount})
				</TabsTrigger>
				<TabsTrigger
					value="users"
					className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
					disabled={userCount === 0}
				>
					Người dùng ({userCount})
				</TabsTrigger>
				<TabsTrigger
					value="events"
					className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
					disabled={eventCount === 0}
				>
					Sự kiện ({eventCount})
				</TabsTrigger>
				<TabsTrigger
					value="posts"
					className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
					disabled={postCount === 0}
				>
					Bài viết ({postCount})
				</TabsTrigger>
				<TabsTrigger
					value="library"
					className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
					disabled={libraryCount === 0}
				>
					Thư viện ({libraryCount})
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
