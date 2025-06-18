'use client';

import { ArrowLeft, Library } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import PaginationClient from '@/components/pagination/PaginationClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import type { LibraryItem, LibraryUsersResponse } from '@/lib/types';

// Import the correct components
import { UserFilters } from '@/components/admin/libraries/user-filters';
import { UserTable } from '@/components/admin/libraries/user-table';

export default function LibraryDetailPage() {
	const { tokens } = useAuth();
	const { id } = useParams();
	const [library, setLibrary] = useState<LibraryItem | null>(null);
	const [usersLoading, setUsersLoading] = useState(false);
	const [libraryUsers, setLibraryUsers] = useState<LibraryUsersResponse | null>(null);
	const [totalUsers, setTotalUsers] = useState(0);
	const [grantedUsers, setGrantedUsers] = useState(0);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState({
		page: 1,
		limit: 10,
		search: '',
		status: 'all',
	});

	// Fetch library details
	const fetchLibraryDetails = async (libraryId: string) => {
		try {
			const response = await fetchApi(`/library/${libraryId}`, {}, tokens);
			if (response.status === 200) {
				setLibrary(response.result);
			}
		} catch (error) {
			console.error('Error fetching library details:', error);
			toast.error('Không thể tải thông tin thư viện');
		}
	};

	// Fetch library users
	const fetchLibraryUsers = async (libraryId: string) => {
		setUsersLoading(true);
		try {
			const queryParams = new URLSearchParams({
				page: filter.page.toString(),
				limit: filter.limit.toString(),
				...(filter.search && { search: filter.search }),
				...(filter.status !== 'all' && { status: filter.status }),
			});

			const response = await fetchApi(`/library/${libraryId}/users?${queryParams}`, {}, tokens);
			if (response.status === 200) {
				setLibraryUsers(response.result);
				setTotalUsers(response.result.pagination.total);
				setGrantedUsers(response.result.users.filter((user) => user.hasAccess).length);
			}
		} catch (error) {
			console.error('Error fetching library users:', error);
			toast.error('Không thể tải danh sách người dùng');
		} finally {
			setUsersLoading(false);
		}
	};

	// Grant access to user
	const grantAccess = async (userId: string) => {
		try {
			const response = await fetchApi(
				`/library/${id}/users/${userId}/grant-access`,
				{
					method: 'POST',
				},
				tokens
			);
			if (response.status === 201) {
				toast.success('Đã cấp quyền truy cập thành công');
				await fetchLibraryUsers(id as string);
			}
		} catch (error) {
			console.error('Error granting access:', error);
			toast.error('Không thể cấp quyền truy cập');
		}
	};

	// Revoke access from user
	const revokeAccess = async (userId: string) => {
		try {
			const response = await fetchApi(
				`/library/${id}/users/${userId}/revoke-access`,
				{
					method: 'DELETE',
				},
				tokens
			);
			if (response.status === 200) {
				toast.success('Đã gỡ quyền truy cập thành công');
				await fetchLibraryUsers(id as string);
			}
		} catch (error) {
			console.error('Error revoking access:', error);
			toast.error('Không thể gỡ quyền truy cập');
		}
	};

	// Handle search with debounce
	const handleSearch = useDebouncedCallback((value: string) => {
		setFilter((prev) => ({ ...prev, page: 1, search: value }));
	}, 500);

	// Handle status filter change
	const handleStatusChange = (status: string) => {
		setFilter((prev) => ({ ...prev, page: 1, status }));
	};

	// Handle pagination
	const handlePaginationChange = (newFilter: { page: number; limit: number }) => {
		setFilter((prev) => ({ ...prev, ...newFilter }));
	};

	useEffect(() => {
		if (id) {
			fetchLibraryDetails(id as string);
			fetchLibraryUsers(id as string);
		}
	}, [id, filter.page, filter.limit, filter.search, filter.status]);

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<Link href="/dashboard/admin/libraries" className="inline-block mb-4">
					<Button variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Quay lại danh sách thư viện
					</Button>
				</Link>
				<h1 className="text-3xl font-bold">Quản lý người dùng thư viện</h1>
				<p className="text-gray-500">Quản lý quyền truy cập thư viện cho người dùng</p>
			</div>

			{/* Library Info Card */}
			{library && (
				<Card className="mb-6">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
								<Library className="w-6 h-6 text-white" />
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
									{library.title}
								</h2>
								<p className="text-gray-600 dark:text-gray-300 mb-4">{library.description}</p>
								<div className="grid grid-cols-3 gap-4">
									<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
										<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
											{totalUsers}
										</p>
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
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div>
							<CardTitle>Danh sách người dùng</CardTitle>
							<CardDescription>
								Tổng cộng {totalUsers} người dùng - Trang {filter.page} /{' '}
								{Math.ceil(totalUsers / filter.limit)}
							</CardDescription>
						</div>
						<UserFilters
							search={search}
							onSearchChange={(value) => {
								setSearch(value);
								handleSearch(value);
							}}
							onStatusChange={handleStatusChange}
							currentStatus={filter.status}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<UserTable
						users={libraryUsers?.users || []}
						loading={usersLoading}
						onGrantAccess={grantAccess}
						onRevokeAccess={revokeAccess}
					/>

					{!usersLoading &&
						libraryUsers &&
						libraryUsers.users.length > 0 &&
						totalUsers > filter.limit && (
							<PaginationClient
								total={totalUsers}
								filter={{ page: filter.page, limit: filter.limit }}
								setFilter={handlePaginationChange}
								className="mt-6"
							/>
						)}
				</CardContent>
			</Card>
		</div>
	);
}
