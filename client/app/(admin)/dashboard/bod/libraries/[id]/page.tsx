'use client'
import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  Search,
  Shield,
  ShieldOff,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import PaginationClient from '@/components/pagination/PaginationClient';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { LibraryUsersResponse } from '@/lib/types';

export default function LibraryDetailPage() {
	const { tokens } = useAuth()
	const { id } = useParams()
	const [usersLoading, setUsersLoading] = useState(false)
	const [libraryUsers, setLibraryUsers] = useState<LibraryUsersResponse | null>(null)
	const [totalUsers, setTotalUsers] = useState(0)
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState({
		page: 1,
		limit: 10,
		search: '',
		status: 'all'
	})
	// Fetch library users
	const fetchLibraryUsers = async (libraryId: string) => {
		setUsersLoading(true)
		try {
			const queryParams = new URLSearchParams({
				page: filter.page.toString(),
				limit: filter.limit.toString(),
				...(filter.search && { search: filter.search }),
				...(filter.status !== 'all' && { status: filter.status })
			})

			const response = await fetchApi(`/library/${libraryId}/users?${queryParams}`, {}, tokens)
			if (response.status === 200) {
				setLibraryUsers(response.result)
				setTotalUsers(response.result.pagination.total)
			}
		} catch (error) {
			console.error('Error fetching library users:', error)
		} finally {
			setUsersLoading(false)
		}
	}

	// Grant access to user
	const grantAccess = async (libraryId: string, userId: string) => {
		try {
			const response = await fetchApi(`/library/${libraryId}/users/${userId}/grant-access`, {
				method: 'POST'
			}, tokens)
			if (response.status === 201) {
				// Refresh users list
				await fetchLibraryUsers(libraryId)
			}
		} catch (error) {
			console.error('Error granting access:', error)
		}
	}

	// Revoke access from user
	const revokeAccess = async (libraryId: string, userId: string) => {
		try {
			const response = await fetchApi(`/library/${libraryId}/users/${userId}/revoke-access`, {
				method: 'DELETE'
			}, tokens)
			if (response.status === 200) {
				// Refresh users list
				await fetchLibraryUsers(libraryId)
			}
		} catch (error) {
			console.error('Error revoking access:', error)
		}
	}
	const handleSearch = useDebouncedCallback((value: string) => {
		setFilter({ ...filter, search: value })
	}, 500)
	useEffect(() => {
		fetchLibraryUsers(id as string)
	}, [filter.page, filter.limit, filter.search, filter.status])

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<Link
						href={`/dashboard/bod/libraries`}
						className="text-blue-600 hover:text-blue-800 mb-2"
					>
						<Button variant="outline">
							<ArrowLeft className="w-4 h-4" />
							Quay lại danh sách thư viện
						</Button>
					</Link>
					<h1 className="text-2xl font-bold text-gray-900">
						Quản lý người dùng
					</h1>
					{/* <p className="text-gray-600">{library.description}</p> */}
				</div>
			</div>

			{/* Search and Filter Controls */}
			<div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<input
							type="text"
							placeholder="Tìm kiếm theo tên hoặc email..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								handleSearch(e.target.value)
							}}
							className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div className="flex gap-2">
						<select
							value={filter.status}
							onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="all">Tất cả người dùng</option>
							<option value="granted">Đã có quyền</option>
							<option value="not_granted">Chưa có quyền</option>
						</select>
					</div>
				</div>
			</div>

			{/* Users List */}
			<div className="bg-white rounded-lg shadow-sm border">
				{usersLoading ? (
					<div className="p-8 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-2 text-gray-600">Đang tải danh sách người dùng...</p>
					</div>
				) : libraryUsers && libraryUsers.users.length > 0 ? (
					<>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Người dùng
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Vai trò
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Trạng thái quyền
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{libraryUsers.users.map((user) => (
										<tr key={user._id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="h-10 w-10 flex-shrink-0">
														<img
															className="h-10 w-10 rounded-full object-cover"
															src={`${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`}
															alt={user.name}
														/>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">{user.name}</div>
														<div className="text-sm text-gray-500">{user.email}</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
													user.role === 'bod' ? 'bg-purple-100 text-purple-800' :
														'bg-blue-100 text-blue-800'
													}`}>
													{user.role === 'admin' ? 'Admin' :
														user.role === 'bod' ? 'BOD' : 'Thành viên'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{user.hasAccess ? (
													<div className="flex items-center">
														<Shield className="h-4 w-4 text-green-500 mr-2" />
														<span className="text-sm text-green-600 font-medium">Có quyền truy cập</span>
														{user.permission && (
															<div className="ml-2 text-xs text-gray-500">
																Cấp bởi: {user.permission.grantedBy.name}
															</div>
														)}

													</div>
												) : (
													<div className="flex items-center">
														<ShieldOff className="h-4 w-4 text-gray-400 mr-2" />
														<span className="text-sm text-gray-500">Chưa có quyền</span>
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												{user.hasAccess ? (
													<button
														onClick={() => revokeAccess(id as string, user._id)}
														className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
													>
														Gỡ quyền truy cập
													</button>
												) : (
													<button
														onClick={() => grantAccess(id as string, user._id)}
														className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
													>
														Cấp quyền truy cập
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<PaginationClient
							className='my-4'
							total={totalUsers}
							filter={filter}
							setFilter={setFilter}
						/>
					</>
				) : (
					<div className="p-8 text-center">
						<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">Không có người dùng</h3>
						<p className="text-gray-500">Không tìm thấy người dùng nào với bộ lọc hiện tại.</p>
					</div>
				)}
			</div>
		</div>
	)
}