'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { parseImageUrl } from '@/lib/parseImageUrl';
import type { LibraryItem } from '@/lib/types';
import { AlertCircle, Calendar, Edit, Loader2, Trash2, Users } from 'lucide-react';

interface LibraryTableProps {
	libraries: LibraryItem[];
	loading: boolean;
	onEdit: (library: LibraryItem) => void;
	onDelete: (library: LibraryItem) => void;
	onManageUsers: (library: LibraryItem) => void;
}

export function LibraryTable({
	libraries,
	loading,
	onEdit,
	onDelete,
	onManageUsers,
}: LibraryTableProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Đang tải...</span>
			</div>
		);
	}

	if (libraries?.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-gray-500">
				<AlertCircle className="h-12 w-12 mb-4" />
				<p>Không có thư viện nào</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Thông tin thư viện</TableHead>
					<TableHead>Người tạo</TableHead>
					<TableHead>Ngày tạo</TableHead>
					<TableHead className="text-right">Thao tác</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{libraries?.map((library) => (
					<TableRow key={library._id}>
						<TableCell className="font-medium">
							<div className="space-y-1">
								<p className="font-semibold">{library.title}</p>
								<p className="text-sm text-gray-500 line-clamp-2">{library.description}</p>
							</div>
						</TableCell>
						<TableCell>
							<div className="flex items-center space-x-3">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={parseImageUrl(library.createdBy?.avatar)}
										alt={library.createdBy?.name}
									/>
									<AvatarFallback>{library.createdBy?.name?.charAt(0) || 'U'}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium text-sm">{library.createdBy?.name || 'Unknown'}</p>
									<p className="text-xs text-gray-500">{library.createdBy?.email}</p>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div className="flex items-center text-sm text-gray-500">
								<Calendar className="mr-1 h-4 w-4" />
								{formatDate(library.createdAt)}
							</div>
						</TableCell>
						<TableCell className="text-right">
							<div className="flex items-end justify-end gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => onManageUsers(library)}
									className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
								>
									<Users className="h-4 w-4 mr-1" />
									Quản lý
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => onEdit(library)}
									className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
								>
									<Edit className="h-4 w-4 mr-1" />
									Sửa
								</Button>
								<Button
									size="sm"
									onClick={() => onDelete(library)}
									className="bg-red-600 hover:bg-red-700 text-white"
								>
									<Trash2 className="h-4 w-4 mr-1" />
									Xóa
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
