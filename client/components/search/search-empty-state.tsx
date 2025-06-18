'use client';

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchEmptyStateProps {
	type: 'initial' | 'no-results';
	query?: string;
}

export function SearchEmptyState({ type, query }: Readonly<SearchEmptyStateProps>) {
	const router = useRouter();

	if (type === 'initial') {
		return (
			<div className="text-center py-12">
				<Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
				<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
					Bắt đầu tìm kiếm
				</h2>
				<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
					Nhập từ khóa vào ô tìm kiếm để tìm người dùng, sự kiện, bài viết hoặc tài liệu trong thư
					viện.
				</p>
			</div>
		);
	}

	return (
		<div className="text-center py-12">
			<Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
			<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
				Không tìm thấy kết quả
			</h2>
			<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
				Không tìm thấy kết quả nào cho "{query}". Vui lòng thử lại với từ khóa khác hoặc điều chỉnh
				bộ lọc.
			</p>
			<Button onClick={() => router.push('/search')} variant="outline" className="mt-4">
				Xóa tìm kiếm
			</Button>
		</div>
	);
}
