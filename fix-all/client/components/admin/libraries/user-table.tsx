'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import type { LibraryUser } from '@/lib/types';
import { AlertCircle, Loader2, Shield, ShieldOff } from 'lucide-react';

interface UserTableProps {
	users: LibraryUser[];
	loading: boolean;
	onGrantAccess: (userId: string) => void;
	onRevokeAccess: (userId: string) => void;
}

export function UserTable({ users, loading, onGrantAccess, onRevokeAccess }: UserTableProps) {
	const getRoleBadge = (role: string) => {
		switch (role) {
			case 'admin':
				return (
					<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
						Admin
					</Badge>
				);
			case 'bod':
				return (
					<Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
						BOD
					</Badge>
				);
			case 'member':
				return (
					<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
						Thành viên
					</Badge>
				);
			default:
				return (
					<Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
						Thành viên
					</Badge>
				);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Đang tải...</span>
			</div>
		);
	}

	if (users?.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-gray-500">
				<AlertCircle className="h-12 w-12 mb-4" />
				<p>Không có người dùng nào</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Người dùng</TableHead>
					<TableHead>Vai trò</TableHead>
					<TableHead>Trạng thái quyền</TableHead>
					<TableHead className="text-right">Thao tác</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users?.map((user) => (
					<TableRow key={user._id}>
						<TableCell className="font-medium">
							<div className="flex items-center space-x-3">
								<Avatar className="h-10 w-10">
									<AvatarImage
										src={parseImageUrl(user.avatar) || '/placeholder.svg'}
										alt={user.name}
									/>
									<AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-medium text-sm">{user.name}</p>
									<p className="text-xs text-gray-500">{user.email}</p>
								</div>
							</div>
						</TableCell>
						<TableCell>{getRoleBadge(user.role)}</TableCell>
						<TableCell>
							{user.hasAccess ? (
								<div className="flex items-center space-x-2">
									<div className="flex items-center space-x-1">
										<Shield className="h-4 w-4 text-green-500" />
										<span className="text-sm text-green-600 font-medium">Có quyền truy cập</span>
									</div>
									{user.permission && (
										<div className="text-xs text-gray-500">
											<span>Cấp bởi: {user.permission.grantedBy.name}</span>
										</div>
									)}
								</div>
							) : (
								<div className="flex items-center space-x-1">
									<ShieldOff className="h-4 w-4 text-gray-400" />
									<span className="text-sm text-gray-500">Chưa có quyền</span>
								</div>
							)}
						</TableCell>
						<TableCell className="text-right">
							{user.hasAccess ? (
								<Button
									size="sm"
									onClick={() => onRevokeAccess(user._id)}
									className="bg-red-600 hover:bg-red-700 text-white"
								>
									Gỡ quyền
								</Button>
							) : (
								<Button
									size="sm"
									onClick={() => onGrantAccess(user._id)}
									className="bg-green-600 hover:bg-green-700 text-white"
								>
									Cấp quyền
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
