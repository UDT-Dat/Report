'use client';

import { useCallback, useEffect, useState } from 'react';

import { AlertCircle, Check, Eye, Filter, Loader2, Search, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { PostStatus } from '@/lib/types';

interface Post {
	_id: string;
	title: string;
	content: string;
	status: PostStatus;
	createdAt: string;
	createdBy: {
		_id: string;
		name: string;
		email: string;
		avatar: string;
	};
}

interface PostFilters {
	page: number;
	limit: number;
	title: string;
	status?: PostStatus;
}

export default function PostsManagementPage() {
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const { tokens } = useAuth();
	const [filters, setFilters] = useState<PostFilters>({
		page: 1,
		limit: 10,
		title: '',
		status: undefined,
	});

	const [search, setSearch] = useState('');
	// Delete confirmation
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [postToDelete, setPostToDelete] = useState<Post | null>(null);

	// Action confirmation dialogs
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionType, setActionType] = useState<PostStatus | null>(null);
	const [postToAction, setPostToAction] = useState<Post | null>(null);

	// Fetch posts function
	const fetchPosts = useCallback(
		async (currentFilters: PostFilters) => {
			try {
				setLoading(true);

				// Build query parameters from current filters
				const query = new URLSearchParams();

				// Add pagination parameters
				query.append('page', currentFilters.page.toString());
				query.append('limit', currentFilters.limit.toString());

				// Add search filter if exists
				if (currentFilters.title?.trim()) {
					query.append(`title_like`, currentFilters.title.trim());
				}

				// Add status filter if exists
				if (currentFilters.status) {
					query.append('status_like', currentFilters.status);
				}

				console.log('Fetching posts with filters:', currentFilters);
				console.log('Query string:', query.toString());

				const response = await fetchApi(
					`/posts/admin/all?${query.toString()}`,
					{
						method: 'GET',
					},
					tokens
				);

				console.log('API Response:', response);

				if (response.status === 200) {
					setPosts(response.result.posts ?? []);
					setTotal(response.result.pagination?.total ?? 0);

					console.log(
						`Loaded ${response.result.posts?.length || 0} posts for page ${currentFilters.page}`
					);
				} else {
					setPosts([]);
					setTotal(0);
					console.error('Failed to fetch posts:', response);
				}
			} catch (error) {
				console.error('Error fetching posts:', error);
				setPosts([]);
				setTotal(0);
				toast.error('Không thể tải danh sách bài viết', {
					duration: 2000,
				});
			} finally {
				setLoading(false);
			}
		},
		[tokens]
	);

	// Effect to fetch posts when filters change
	useEffect(() => {
		fetchPosts(filters);
	}, [filters, fetchPosts]);

	// Get status badge
	const getStatusBadge = (status: PostStatus) => {
		const statusConfig = {
			pending: { label: 'Chờ duyệt', className: 'bg-yellow-50 text-yellow-700' },
			approved: { label: 'Đã duyệt', className: 'bg-green-50 text-green-700' },
			rejected: { label: 'Từ chối', className: 'bg-red-50 text-red-700' },
		};

		const config = statusConfig[status];

		return (
			<Badge variant="outline" className={config.className}>
				{config.label}
			</Badge>
		);
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Handle filter change
	const handleFilterChange = (status: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			status: status === 'all' ? undefined : (status as PostStatus),
		}));
	};

	// Handle view post details
	const handleViewPost = (post: Post) => {
		router.push(`/posts/${post._id}`);
	};

	// Handle approve post
	const handleApprovePost = (post: Post) => {
		setPostToAction(post);
		setActionType(PostStatus.Approved);
		setActionDialogOpen(true);
	};

	// Handle reject post
	const handleRejectPost = (post: Post) => {
		setPostToAction(post);
		setActionType(PostStatus.Rejected);
		setActionDialogOpen(true);
	};

	// Handle delete post
	const handleDeletePost = (post: Post) => {
		setPostToDelete(post);
		setDeleteDialogOpen(true);
	};

	// Confirm action (approve/reject)
	const confirmAction = async () => {
		if (!postToAction || !actionType) return;

		try {
			await fetchApi(
				`/posts/${postToAction._id}/status`,
				{
					method: 'PUT',
					body: JSON.stringify({ status: actionType }),
				},
				tokens
			);

			// Update local state for demo
			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postToAction._id
						? {
								...post,
								status:
									actionType === PostStatus.Approved ? PostStatus.Approved : PostStatus.Rejected,
						  }
						: post
				)
			);

			toast.success(
				actionType === PostStatus.Approved
					? 'Duyệt bài viết thành công!'
					: 'Từ chối bài viết thành công!',
				{
					duration: 2000,
				}
			);

			setActionDialogOpen(false);
			setPostToAction(null);
			setActionType(null);
		} catch (error) {
			console.error('Error updating post status:', error);
			toast.error('Không thể cập nhật trạng thái bài viết', {
				duration: 2000,
			});
		}
	};

	// Confirm delete post
	const confirmDeletePost = async () => {
		if (!postToDelete) return;

		try {
			await fetchApi(
				`/posts/${postToDelete._id}`,
				{
					method: 'DELETE',
				},
				tokens
			);

			// Update local state for demo
			setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postToDelete._id));
			setTotal((prevTotal) => prevTotal - 1);

			toast.success('Xóa bài viết thành công!', {
				duration: 2000,
			});

			setDeleteDialogOpen(false);
			setPostToDelete(null);
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Không thể xóa bài viết', {
				duration: 2000,
			});
		}
	};

	const handleSearch = useDebouncedCallback((value: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			title: value,
		}));
	}, 500);

	// Handle pagination filter change
	const handlePaginationChange = useCallback((newFilter: { page: number; limit: number }) => {
		setFilters((prev) => ({
			...prev,
			...newFilter,
		}));
	}, []);

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Quản lý bài viết</h1>
				<p className="text-gray-500">Quản lý và duyệt tất cả bài viết của thành viên</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div>
							<CardTitle>Danh sách bài viết</CardTitle>
							<CardDescription>
								Tổng cộng {total} bài viết - Trang {filters.page} /{' '}
								{Math.ceil(total / filters.limit)}
							</CardDescription>
						</div>
						<div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
								<Input
									type="search"
									placeholder="Tìm kiếm bài viết..."
									className="pl-8"
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										handleSearch(e.target.value);
									}}
								/>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<Filter className="mr-2 h-4 w-4" />
										Lọc
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => handleFilterChange('all')}>
										Tất cả
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleFilterChange('pending')}>
										Chờ duyệt
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleFilterChange('approved')}>
										Đã duyệt
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleFilterChange('rejected')}>
										Từ chối
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
							<span className="ml-2">Đang tải...</span>
						</div>
					) : posts?.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-gray-500">
							<AlertCircle className="h-12 w-12 mb-4" />
							<p>Không có bài viết nào</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Tiêu đề</TableHead>
										<TableHead>Tác giả</TableHead>
										<TableHead>Ngày tạo</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead className="text-right">Thao tác</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{posts?.map((post) => (
										<TableRow key={post._id}>
											<TableCell className="font-medium">
												<div className="space-y-1">
													<p className="font-semibold">{post.title}</p>
													<p
														className="text-sm text-gray-500 line-clamp-2"
														dangerouslySetInnerHTML={{
															__html: post.content.replace(/<[^>]*>/g, ''),
														}}
													/>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-3">
													<Avatar className="h-8 w-8">
														<AvatarImage
															src={
																`${process.env.NEXT_PUBLIC_API_URL}/${post.createdBy?.avatar}` ||
																'/placeholder.svg'
															}
															alt={post.createdBy?.name}
														/>
														<AvatarFallback>{post.createdBy?.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium text-sm">{post.createdBy?.name}</p>
														<p className="text-xs text-gray-500">{post.createdBy?.email}</p>
													</div>
												</div>
											</TableCell>
											<TableCell>{formatDate(post.createdAt)}</TableCell>
											<TableCell>
												<span className="inline-block w-max">{getStatusBadge(post.status)}</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-end justify-end gap-2">
													<Button
														size={'icon'}
														onClick={() => handleViewPost(post)}
														className="bg-green-600 hover:bg-green-700 flex items-center justify-center"
													>
														<Eye className="h-4 w-4" />
													</Button>
													{post.status === 'pending' && (
														<>
															<Button
																size={'icon'}
																onClick={() => handleApprovePost(post)}
																className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
															>
																<Check className="h-4 w-4" />
															</Button>
															<Button
																size={'icon'}
																onClick={() => handleRejectPost(post)}
																className="bg-orange-600 hover:bg-orange-700 flex items-center justify-center"
															>
																<X className="h-4 w-4" />
															</Button>
														</>
													)}
													<Button
														size={'icon'}
														onClick={() => handleDeletePost(post)}
														className="bg-red-600 hover:bg-red-700 flex items-center justify-center"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							<PaginationClient
								total={total}
								filter={{ page: filters.page, limit: filters.limit }}
								setFilter={handlePaginationChange}
								className="mt-6"
							/>
						</>
					)}
				</CardContent>
			</Card>

			{/* Action Confirmation Dialog (Approve/Reject) */}
			<AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{actionType === PostStatus.Approved
								? 'Xác nhận duyệt bài viết'
								: 'Xác nhận từ chối bài viết'}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn {actionType === PostStatus.Approved ? 'duyệt' : 'từ chối'} bài
							viết "{postToAction?.title}"?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmAction}
							className={
								actionType === PostStatus.Approved
									? 'bg-blue-600 hover:bg-blue-700'
									: 'bg-orange-600 hover:bg-orange-700'
							}
						>
							{actionType === PostStatus.Approved ? 'Duyệt' : 'Từ chối'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa bài viết "{postToDelete?.title}"? Hành động này không thể
							hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeletePost} className="bg-red-600 hover:bg-red-700">
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
