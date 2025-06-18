'use client';

import type React from 'react';

import {
	CheckCircle,
	Clock,
	Download,
	Edit,
	Eye,
	FileText,
	Filter,
	GraduationCap,
	Plus,
	Search,
	Shield,
	Trash2,
	User,
	UserCheck,
	Users,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import PaginationClient from '@/components/pagination/PaginationClient';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { courseOptions } from '@/lib/constant';
import { parseImageUrl } from '@/lib/parseImageUrl';
import { userService } from '@/lib/services/userService';
import { type UserRole, UserStatus, type User as UserType } from '@/lib/types';

interface FormData {
	name: string;
	email: string;
	password: string;
	phone: string;
	address: string;
	role: UserRole;
	status: UserStatus;
	studentCode?: string;
	course?: string;
}

export default function UsersPage() {
	const [users, setUsers] = useState<UserType[]>([]);
	const { tokens } = useAuth();
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
	const [selectedUserForVerification, setSelectedUserForVerification] = useState<UserType | null>(
		null
	);
	const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
	const [searchTerm, setSearchTerm] = useState('');
	const [totalUsers, setTotalUsers] = useState(0);
	const [rejectionReason, setRejectionReason] = useState('');
	const [exportLoading, setExportLoading] = useState(false);
	const { toast } = useToast();
	const [filter, setFilter] = useState<{
		page: number;
		limit: number;
		search: string;
		role: string;
		status: string;
	}>({
		page: 1,
		limit: 10,
		search: '',
		role: 'all',
		status: 'all',
	});
	const [formData, setFormData] = useState<FormData>({
		name: '',
		email: '',
		password: '',
		phone: '',
		address: '',
		role: 'member',
		status: 'ACTIVE' as UserStatus,
		studentCode: '',
		course: '',
	});

	const fetchUsers = async ({
		page = 1,
		limit = 10,
		search = '',
		role = 'all',
		status = 'all',
	}: {
		page?: number;
		limit?: number;
		search?: string;
		role?: string;
		status?: string;
	}) => {
		try {
			setLoading(true);
			const usersData = await userService.getAllUsers(tokens, {
				page,
				limit,
				search,
				role,
				status,
			});
			setUsers(usersData.users);
			setTotalUsers(usersData.pagination?.total || 0);
		} catch (error) {
			console.error('Error fetching users:', error);
			toast({
				title: 'Lỗi',
				description: 'Không thể tải danh sách người dùng',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(filter);
	}, [filter]);

	const handleCreateUser = () => {
		setSelectedUser(null);
		setModalMode('create');
		setFormData({
			name: '',
			email: '',
			password: '',
			phone: '',
			address: '',
			role: 'member',
			status: UserStatus.PENDING,
		});
		setIsModalOpen(true);
	};

	const handleEditUser = (user: UserType) => {
		setSelectedUser(user);
		setModalMode('edit');
		setFormData({
			name: user.name || '',
			email: user.email || '',
			password: '',
			phone: user.phone || '',
			address: user.address || '',
			role: user.role || 'member',
			status: user.status || UserStatus.VERIFYING,
			studentCode: user.studentCode || '',
			course: user.course || '',
		});
		setIsModalOpen(true);
	};

	const handleDeleteUser = async (userId: string) => {
		try {
			await userService.deleteUser(userId, tokens);
			await fetchUsers(filter);
			toast({
				title: 'Thành công',
				description: 'Đã xóa người dùng thành công',
			});
		} catch (error) {
			console.error('Error deleting user:', error);
			toast({
				title: 'Lỗi',
				description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa người dùng',
				variant: 'destructive',
			});
		}
	};

	const handleApproveUser = async (userId: string) => {
		try {
			await userService.approveUser(userId, tokens);
			await fetchUsers(filter);
			toast({
				title: 'Thành công',
				description: 'Đã duyệt người dùng thành công',
			});
		} catch (error) {
			console.error('Error approving user:', error);
			toast({
				title: 'Lỗi',
				description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi duyệt người dùng',
				variant: 'destructive',
			});
		}
	};

	const handleAssignRole = async (userId: string, role: UserRole) => {
		try {
			await userService.assignMentorRole(userId, tokens);
			await fetchUsers(filter);
			toast({
				title: 'Thành công',
				description: 'Đã gán quyền thành công',
			});
		} catch (error) {
			console.error('Error assigning role:', error);
			toast({
				title: 'Lỗi',
				description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gán quyền',
				variant: 'destructive',
			});
		}
	};

	const handleVerifyStudentClick = async (user: UserType) => {
		setSelectedUserForVerification(user);
		setIsVerificationModalOpen(true);
		setRejectionReason('');
	};

	const handleAcceptVerification = async () => {
		if (!selectedUserForVerification) return;

		try {
			// Call your API to accept verification
			const res = await fetchApi(
				`/users/${selectedUserForVerification._id}/update-verification-status`,
				{
					body: JSON.stringify({
						status: UserStatus.ACTIVE,
					}),
					method: 'PUT',
				},
				tokens
			);
			if (!res || res.status !== 200) {
				toast({
					title: 'Lỗi',
					description: res?.result?.message || 'Có lỗi xảy ra khi xác thực sinh viên',
					variant: 'destructive',
				});
			}

			await fetchUsers(filter);
			setIsVerificationModalOpen(false);
			toast({
				title: 'Thành công',
				description: 'Đã xác thực sinh viên thành công',
			});
		} catch (error) {
			console.error('Error accepting verification:', error);
			toast({
				title: 'Lỗi',
				description:
					error instanceof Error ? error.message : 'Có lỗi xảy ra khi xác thực sinh viên',
				variant: 'destructive',
			});
		}
	};

	const handleRejectVerification = async () => {
		if (!selectedUserForVerification || !rejectionReason.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập lý do từ chối',
				variant: 'destructive',
			});
			return;
		}

		try {
			// Call your API to reject verification
			const res = await fetchApi(
				`/users/${selectedUserForVerification._id}/update-verification-status`,
				{
					body: JSON.stringify({
						status: UserStatus.REJECTED,
						rejectReason: rejectionReason,
					}),
					method: 'PUT',
				},
				tokens
			);

			await fetchUsers(filter);
			setIsVerificationModalOpen(false);
			toast({
				title: 'Thành công',
				description: 'Đã từ chối xác thực sinh viên',
			});
		} catch (error) {
			console.error('Error rejecting verification:', error);
			toast({
				title: 'Lỗi',
				description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi từ chối xác thực',
				variant: 'destructive',
			});
		}
	};

	const handleModalSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim() || !formData.email.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
				variant: 'destructive',
			});
			return;
		}

		if (modalMode === 'create' && !formData.password.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập mật khẩu',
				variant: 'destructive',
			});
			return;
		}

		try {
			const submitData: Partial<UserType> = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				address: formData.address,
				role: formData.role,
				status: formData.status,
				studentCode: formData.studentCode,
				course: formData.course,
			};

			if (modalMode === 'create' || formData.password) {
				submitData.password = formData.password;
			}

			if (modalMode === 'create') {
				await userService.createUser(submitData, tokens);
				toast({
					title: 'Thành công',
					description: 'Đã tạo người dùng mới thành công',
				});
			} else if (selectedUser) {
				await userService.updateUser(selectedUser._id, submitData, tokens);
				toast({
					title: 'Thành công',
					description: 'Đã cập nhật thông tin người dùng',
				});
			}
			setIsModalOpen(false);
			await fetchUsers(filter);
		} catch (error) {
			console.error('Error saving user:', error);
			toast({
				title: 'Lỗi',
				description:
					error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu thông tin người dùng',
				variant: 'destructive',
			});
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const clearFilters = () => {
		setSearchTerm('');
		setFilter({ ...filter, role: 'all', status: 'all', search: '', page: 1 });
	};

	const handleSearch = useDebouncedCallback((value: string) => {
		setFilter({ ...filter, search: value, page: 1 });
	}, 500);

	const getRoleBadge = (role: string) => {
		const variants = {
			admin: 'destructive',
			bod: 'default',
			member: 'secondary',
		} as const;

		const labels = {
			admin: 'Admin',
			bod: 'BOD',
			member: 'Thành viên',
		};

		return (
			<Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
				{labels[role as keyof typeof labels] || role}
			</Badge>
		);
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			active: 'default',
			pending: 'secondary',
			inactive: 'outline',
			verifying: 'outline',
		} as const;

		const labels = {
			active: 'Hoạt động',
			pending: 'Chờ duyệt',
			inactive: 'Không hoạt động',
			verifying: 'Đang xác thực',
		};

		return (
			<Badge
				variant={variants[status as keyof typeof variants] || 'outline'}
				className={
					status === UserStatus.VERIFYING
						? 'border-orange-500 text-orange-600 dark:text-orange-400'
						: ''
				}
			>
				{labels[status as keyof typeof labels] || status}
			</Badge>
		);
	};

	// Helper function to handle blob responses from API
	const fetchApiBlob = async (url: string, options: any = {}, tokens: any) => {
		try {
			const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
			const fullUrl = `${baseUrl}/api${url}`;

			const response = await fetch(fullUrl, {
				...options,
				headers: {
					...options.headers,
					Authorization: `Bearer ${tokens?.accessToken}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return {
					status: response.status,
					result: errorData,
					blob: null,
				};
			}

			const blob = await response.blob();
			return {
				status: response.status,
				blob,
				result: null,
			};
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	};

	// Function to export users to Excel via API
	const exportToExcel = async () => {
		try {
			setExportLoading(true);

			// Prepare export parameters based on current filters
			const exportParams = {
				search: filter.search,
				role: filter.role !== 'all' ? filter.role : undefined,
				status: filter.status !== 'all' ? filter.status : undefined,
			};

			// Remove undefined values
			const cleanParams = Object.fromEntries(
				Object.entries(exportParams).filter(([_, value]) => value !== undefined)
			);

			// Create query string
			const queryString = new URLSearchParams(cleanParams as Record<string, string>).toString();
			const url = `/users/export/data${queryString ? `?${queryString}` : ''}`;

			// Call the API to get the Excel file
			const response = await fetchApiBlob(
				url,
				{
					method: 'GET',
					headers: {
						Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					},
				},
				tokens
			);

			if (!response || response.status !== 200 || !response.blob) {
				throw new Error(response?.result?.message || 'Không thể xuất dữ liệu');
			}

			// Create download link
			const downloadUrl = window.URL.createObjectURL(response.blob);
			const link = document.createElement('a');
			link.href = downloadUrl;

			// Generate filename with current date
			const currentDate = new Date().toISOString().split('T')[0];
			link.download = `danh-sach-nguoi-dung-${currentDate}.xlsx`;

			// Trigger download
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the URL object
			window.URL.revokeObjectURL(downloadUrl);

			toast({
				title: 'Xuất dữ liệu thành công',
				description: 'Danh sách người dùng đã được xuất ra file Excel',
			});
		} catch (error) {
			console.error('Error exporting users:', error);
			toast({
				title: 'Lỗi',
				description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất dữ liệu',
				variant: 'destructive',
			});
		} finally {
			setExportLoading(false);
		}
	};

	const LoadingSkeleton = () => (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="h-4 w-20 mb-2" />
							<Skeleton className="h-8 w-16" />
						</CardContent>
					</Card>
				))}
			</div>
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-[200px]" />
									<Skeleton className="h-4 w-[150px]" />
								</div>
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-20" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-3xl font-bold">Quản lý người dùng</h1>
						<p className="text-muted-foreground">Quản lý thông tin và quyền hạn người dùng</p>
					</div>
					<Skeleton className="h-10 w-32" />
				</div>
				<LoadingSkeleton />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
					<p className="text-muted-foreground">
						Quản lý thông tin và quyền hạn người dùng trong hệ thống
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						onClick={exportToExcel}
						disabled={exportLoading || users.length === 0}
						className="gap-2"
					>
						{exportLoading ? (
							<>
								<span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
								Đang xuất...
							</>
						) : (
							<>
								<Download className="h-4 w-4" />
								Xuất Excel
							</>
						)}
					</Button>
					<Button onClick={handleCreateUser} className="gap-2 shrink-0">
						<Plus className="h-4 w-4" />
						Thêm người dùng
					</Button>
				</div>
			</div>

			{/* Search and Filter Section */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Tìm kiếm và lọc</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder="Tìm kiếm theo tên, email, số điện thoại..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									handleSearch(e.target.value);
								}}
								className="pl-10"
							/>
						</div>

						<Select
							value={filter.role}
							onValueChange={(value: UserRole | 'all') =>
								setFilter({ ...filter, role: value, page: 1 })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Lọc theo vai trò" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả vai trò</SelectItem>
								<SelectItem value="member">Thành viên</SelectItem>
								<SelectItem value="bod">BOD</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filter.status}
							onValueChange={(value: UserStatus | 'all') =>
								setFilter({ ...filter, status: value, page: 1 })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Lọc theo trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả trạng thái</SelectItem>
								<SelectItem value="PENDING">Chờ duyệt</SelectItem>
								<SelectItem value="ACTIVE">Hoạt động</SelectItem>
								<SelectItem value="INACTIVE">Không hoạt động</SelectItem>
								<SelectItem value="VERIFYING">Đang xác thực</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline" onClick={clearFilters} className="gap-2">
							<Filter className="h-4 w-4" />
							Xóa bộ lọc
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-blue-500" />
							<div className="text-sm font-medium text-muted-foreground">Tổng số người dùng</div>
						</div>
						<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
							<UserCheck className="h-4 w-4 text-green-500" />
							<div className="text-sm font-medium text-muted-foreground">Đang hoạt động</div>
						</div>
						<div className="text-2xl font-bold text-green-600 dark:text-green-400">
							{users.filter((u) => u.status === UserStatus.ACTIVE).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-yellow-500" />
							<div className="text-sm font-medium text-muted-foreground">Chờ duyệt</div>
						</div>
						<div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
							{users.filter((u) => u.status === UserStatus.PENDING).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
							<GraduationCap className="h-4 w-4 text-orange-500" />
							<div className="text-sm font-medium text-muted-foreground">Đang xác thực</div>
						</div>
						<div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
							{users.filter((u) => u.status === UserStatus.VERIFYING).length}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-2">
							<Eye className="h-4 w-4 text-purple-500" />
							<div className="text-sm font-medium text-muted-foreground">Kết quả hiện tại</div>
						</div>
						<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
							{users.length}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* User Table */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
					<div>
						<CardTitle>Danh sách người dùng</CardTitle>
						<CardDescription>Quản lý thông tin chi tiết của từng người dùng</CardDescription>
					</div>
					{users.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={exportToExcel}
							disabled={exportLoading}
							className="gap-2 self-start sm:self-auto"
						>
							{exportLoading ? (
								<>
									<span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
									Đang xuất...
								</>
							) : (
								<>
									<Download className="h-4 w-4" />
									Xuất danh sách
								</>
							)}
						</Button>
					)}
				</CardHeader>
				<CardContent>
					{users.length === 0 ? (
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium mb-2">Không có người dùng nào</h3>
							<p className="text-muted-foreground mb-4">
								{filter.search || filter.role !== 'all' || filter.status !== 'all'
									? 'Không tìm thấy người dùng phù hợp với bộ lọc'
									: 'Chưa có người dùng nào trong hệ thống'}
							</p>
							{filter.search || filter.role !== 'all' || filter.status !== 'all' ? (
								<Button variant="outline" onClick={clearFilters}>
									Xóa bộ lọc
								</Button>
							) : (
								<Button onClick={handleCreateUser}>Thêm người dùng đầu tiên</Button>
							)}
						</div>
					) : (
						<div className="space-y-4">
							<div className="rounded-md border">
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b bg-muted/50">
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Người dùng
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Liên hệ
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Vai trò
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Trạng thái
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Ngày tạo
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Hành động
												</th>
											</tr>
										</thead>
										<tbody>
											{users.map((user) => (
												<tr key={user._id} className="border-b hover:bg-muted/50 transition-colors">
													<td className="p-4">
														<div className="flex items-center gap-3">
															<Avatar className="h-10 w-10">
																<AvatarImage src={parseImageUrl(user.avatar)} alt={user.name} />
																<AvatarFallback>
																	{user.name
																		?.split(' ')
																		.map((n) => n[0])
																		.join('')
																		.toUpperCase() || 'U'}
																</AvatarFallback>
															</Avatar>
															<div>
																<div className="font-medium">{user.name}</div>
																<div className="text-sm text-muted-foreground">{user.email}</div>
															</div>
														</div>
													</td>
													<td className="p-4">
														<div className="text-sm">
															<div>{user.phone || 'Chưa cập nhật'}</div>
															<div className="text-muted-foreground">
																{user.address || 'Chưa cập nhật'}
															</div>
														</div>
													</td>
													<td className="p-4">{getRoleBadge(user.role || 'member')}</td>
													<td className="p-4">{getStatusBadge(user.status || 'PENDING')}</td>
													<td className="p-4">
														<div className="text-sm">
															{new Date(user.createdAt).toLocaleDateString('vi-VN')}
														</div>
													</td>
													<td className="p-4">
														<div className="flex items-center gap-2">
															<Button
																size="sm"
																variant="ghost"
																onClick={() => handleEditUser(user)}
															>
																<Edit className="h-4 w-4" />
															</Button>
															{user.status === UserStatus.PENDING && (
																<Button
																	size="sm"
																	variant="default"
																	onClick={() => handleApproveUser(user._id)}
																>
																	<CheckCircle className="h-4 w-4" />
																</Button>
															)}
															{user.status === UserStatus.VERIFYING && (
																<Button
																	size="sm"
																	variant="default"
																	onClick={() => handleVerifyStudentClick(user)}
																	className="bg-orange-600 hover:bg-orange-700"
																>
																	<GraduationCap className="h-4 w-4" />
																</Button>
															)}
															{user.role === 'member' && (
																<Button
																	size="sm"
																	variant="secondary"
																	onClick={() => handleAssignRole(user._id, 'bod')}
																>
																	<Shield className="h-4 w-4" />
																</Button>
															)}
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button
																		size="sm"
																		variant="ghost"
																		className="text-red-600 hover:text-red-700"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
																		<AlertDialogDescription>
																			Bạn có chắc chắn muốn xóa người dùng "{user.name}"? Hành động
																			này không thể hoàn tác.
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Hủy</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() => handleDeleteUser(user._id)}
																			className="bg-red-600 hover:bg-red-700"
																		>
																			Xóa
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
							<PaginationClient total={totalUsers} filter={filter} setFilter={setFilter} />
						</div>
					)}
				</CardContent>
			</Card>

			{/* User Modal */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{modalMode === 'create' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleModalSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Tên *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									placeholder="Nhập tên"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email *</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									placeholder="Nhập email"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">
								Mật khẩu {modalMode === 'create' ? '*' : '(để trống nếu không thay đổi)'}
							</Label>
							<Input
								id="password"
								type="password"
								value={formData.password}
								onChange={(e) => handleInputChange('password', e.target.value)}
								placeholder={modalMode === 'create' ? 'Nhập mật khẩu' : 'Nhập mật khẩu mới'}
								required={modalMode === 'create'}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="phone">Số điện thoại</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) => handleInputChange('phone', e.target.value)}
									placeholder="Nhập số điện thoại"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="address">Địa chỉ</Label>
								<Input
									id="address"
									value={formData.address}
									onChange={(e) => handleInputChange('address', e.target.value)}
									placeholder="Nhập địa chỉ"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Vai trò</Label>
							<Select
								value={formData.role}
								onValueChange={(value: UserRole) => handleInputChange('role', value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Chọn vai trò" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Thành viên</SelectItem>
									<SelectItem value="bod">BOD</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							{/* student code */}
							<div className="flex gap-4 flex-col">
								<Label htmlFor="studentCode">Mã sinh viên</Label>
								<Input
									id="studentCode"
									value={formData.studentCode}
									onChange={(e) => handleInputChange('studentCode', e.target.value)}
									placeholder="Nhập mã sinh viên"
								/>
							</div>
							<div className="flex gap-4 flex-col">
								<Label htmlFor="course">Khóa học</Label>
								<Select
									value={formData.course}
									onValueChange={(value) => handleInputChange('course', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn khóa học" />
									</SelectTrigger>
									<SelectContent>
										{courseOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
								Hủy
							</Button>
							<Button type="submit">{modalMode === 'create' ? 'Tạo' : 'Cập nhật'}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Student Verification Modal */}
			<Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5 text-orange-500" />
							Xác thực sinh viên
						</DialogTitle>
					</DialogHeader>

					{selectedUserForVerification && (
						<div className="space-y-6">
							{/* User Info */}
							<div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
								<Avatar className="h-12 w-12">
									<AvatarImage
										src={parseImageUrl(selectedUserForVerification.avatar)}
										alt={selectedUserForVerification.name}
									/>
									<AvatarFallback>
										<User className="h-6 w-6" />
									</AvatarFallback>
								</Avatar>
								<div>
									<h3 className="font-semibold">{selectedUserForVerification.name}</h3>
									<p className="text-sm text-muted-foreground">
										{selectedUserForVerification.email}
									</p>
								</div>
							</div>

							{/* Verification Details */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-sm font-medium">Mã sinh viên</Label>
									<div className="p-3 bg-muted/30 rounded-md">
										<p className="font-mono text-sm">
											{selectedUserForVerification.studentCode || 'SV12345'}
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium">Khóa học</Label>
									<div className="p-3 bg-muted/30 rounded-md">
										<p className="text-sm">
											{selectedUserForVerification.course || 'Khóa 2020-2024'}
										</p>
									</div>
								</div>
							</div>

							{/* Student Card */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">Thẻ sinh viên</Label>
								<div className="border rounded-lg p-4">
									<div className="flex items-center gap-3 mb-3">
										<FileText className="h-5 w-5 text-blue-500" />
										<span className="text-sm font-medium">Ảnh thẻ sinh viên</span>
									</div>
									<div className="relative group">
										<img
											src={parseImageUrl(selectedUserForVerification.studentCard)}
											alt="Student Card"
											className="w-full max-w-md mx-auto rounded-lg border shadow-sm"
										/>
										<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
									</div>
								</div>
							</div>

							{/* Rejection Reason (only show when rejecting) */}
							<div className="space-y-2">
								<Label htmlFor="rejectionReason">Lý do từ chối (nếu có)</Label>
								<Textarea
									id="rejectionReason"
									placeholder="Nhập lý do từ chối xác thực..."
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									className="min-h-[80px]"
								/>
							</div>
						</div>
					)}

					<DialogFooter className="gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsVerificationModalOpen(false)}
						>
							Hủy
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleRejectVerification}
							className="gap-2"
						>
							<X className="h-4 w-4" />
							Từ chối
						</Button>
						<Button
							type="button"
							onClick={handleAcceptVerification}
							className="gap-2 bg-green-600 hover:bg-green-700"
						>
							<CheckCircle className="h-4 w-4" />
							Chấp nhận
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
