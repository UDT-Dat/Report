'use client';

import { Button } from '@/components/ui/button';
import type { LibraryItem } from '@/lib/types';
import { ArrowLeft, Library } from 'lucide-react';
import Link from 'next/link';

interface LibraryHeaderProps {
	library?: LibraryItem;
	totalUsers: number;
	grantedUsers: number;
}

export function LibraryHeader({ library, totalUsers, grantedUsers }: LibraryHeaderProps) {
	return (
		<div className="mb-8">
			<Link href="/dashboard/admin/libraries" className="inline-block mb-4">
				<Button variant="outline" className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
					<ArrowLeft className="h-4 w-4" />
					Quay lại danh sách thư viện
				</Button>
			</Link>

			<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border-0">
				<div className="flex items-start gap-4">
					<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
						<Library className="w-6 h-6 text-white" />
					</div>
					<div className="flex-1">
						<h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
							{library?.title || 'Quản lý người dùng'}
						</h1>
						{library?.description && (
							<p className="text-gray-600 dark:text-gray-300 mb-4">{library.description}</p>
						)}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
								<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</p>
							</div>
							<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
								<p className="text-2xl font-bold text-green-600 dark:text-green-400">
									{grantedUsers}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Đã có quyền</p>
							</div>
							<div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
								<p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
									{totalUsers - grantedUsers}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">Chưa có quyền</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
