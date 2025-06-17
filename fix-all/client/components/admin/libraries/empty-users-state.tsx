'use client';

import { Users } from 'lucide-react';

export function EmptyUsersState() {
	return (
		<div className="text-center py-16 px-4">
			<div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
				<Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
			</div>
			<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
				Không có người dùng
			</h3>
			<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
				Không tìm thấy người dùng nào với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm.
			</p>
		</div>
	);
}
