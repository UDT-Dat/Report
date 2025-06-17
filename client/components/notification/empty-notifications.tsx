'use client';

import { Bell } from 'lucide-react';

export function EmptyNotifications() {
	return (
		<div className="text-center py-16 px-4">
			<div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
				<Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
			</div>
			<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
				Chưa có thông báo
			</h3>
			<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
				Khi bạn nhận được thông báo về bài viết, sự kiện hoặc hoạt động khác, chúng sẽ xuất hiện ở
				đây.
			</p>
		</div>
	);
}
