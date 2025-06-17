'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import PaginationClient from '@/components/pagination/PaginationClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { Post, PostStatus } from '@/lib/types';

// Import our new components
import { ConfirmationDialogs } from '@/components/admin/posts/confirmation-dialogs';
import { PostFilters } from '@/components/admin/posts/post-filters';
import { PostTable } from '@/components/admin/posts/post-table';
import { RejectReasonDialog } from '@/components/admin/posts/reject-reason-dialog';

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

	// Dialog states
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [postToDelete, setPostToDelete] = useState<Post | null>(null);

	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionType, setActionType] = useState<PostStatus | null>(null);
	const [postToAction, setPostToAction] = useState<Post | null>(null);

	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [postToReject, setPostToReject] = useState<Post | null>(null);

	const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
	const [postToPriority, setPostToPriority] = useState<Post | null>(null);

	// Fetch posts function
	const fetchPosts = useCallback(
		async (currentFilters: PostFilters) => {
			try {
				setLoading(true);

				const query = new URLSearchParams();
				query.append('page', currentFilters.page.toString());
				query.append('limit', currentFilters.limit.toString());

				if (currentFilters.title?.trim()) {
					query.append(`title_like`, currentFilters.title.trim());
				}

				if (currentFilters.status) {
					query.append('status_like', currentFilters.status);
				}

				const response = await fetchApi(
					`/posts/admin/all?${query.toString()}`,
					{ method: 'GET' },
					tokens
				);

				if (response.status === 200) {
					setPosts(response.result.posts ?? []);
					setTotal(response.result.pagination?.total ?? 0);
				} else {
					setPosts([]);
					setTotal(0);
				}
			} catch (error) {
				console.error('Error fetching posts:', error);
				setPosts([]);
				setTotal(0);
				toast.error('Không thể tải danh sách bài viết', { duration: 2000 });
			} finally {
				setLoading(false);
			}
		},
		[tokens]
	);

	useEffect(() => {
		fetchPosts(filters);
	}, [filters, fetchPosts]);

	// Handle filter change
	const handleFilterChange = (status: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			status: status === 'all' ? undefined : (status as PostStatus),
		}));
	};

	// Handle search
	const handleSearch = useDebouncedCallback((value: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			title: value,
		}));
	}, 500);

	// Handle pagination
	const handlePaginationChange = useCallback((newFilter: { page: number; limit: number }) => {
		setFilters((prev) => ({
			...prev,
			...newFilter,
		}));
	}, []);

	// Post actions
	const handleViewPost = (post: Post) => {
		router.push(`/dashboard/bod/posts/${post._id}`);
	};

	const handleApprovePost = (post: Post) => {
		setPostToAction(post);
		setActionType(PostStatus.Approved);
		setActionDialogOpen(true);
	};

	const handleRejectPost = (post: Post) => {
		setPostToReject(post);
		setRejectDialogOpen(true);
	};

	const handleDeletePost = (post: Post) => {
		setPostToDelete(post);
		setDeleteDialogOpen(true);
	};

	const handleTogglePriority = (post: Post) => {
		setPostToPriority(post);
		setPriorityDialogOpen(true);
	};

	// Confirm actions
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

			toast.success('Duyệt bài viết thành công!', { duration: 2000 });
			setActionDialogOpen(false);
			setPostToAction(null);
			setActionType(null);
		} catch (error) {
			console.error('Error updating post status:', error);
			toast.error('Không thể cập nhật trạng thái bài viết', { duration: 2000 });
		}
	};

	const confirmReject = async (reason: string) => {
		if (!postToReject) return;

		try {
			await fetchApi(
				`/posts/${postToReject._id}/status`,
				{
					method: 'PUT',
					body: JSON.stringify({
						status: PostStatus.Rejected,
						rejectReason: reason,
					}),
				},
				tokens
			);

			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postToReject._id ? { ...post, status: PostStatus.Rejected } : post
				)
			);

			toast.success('Từ chối bài viết thành công!', { duration: 2000 });
			setRejectDialogOpen(false);
			setPostToReject(null);
		} catch (error) {
			console.error('Error rejecting post:', error);
			toast.error('Không thể từ chối bài viết', { duration: 2000 });
		}
	};

	const confirmDeletePost = async () => {
		if (!postToDelete) return;

		try {
			await fetchApi(`/posts/${postToDelete._id}`, { method: 'DELETE' }, tokens);

			setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postToDelete._id));
			setTotal((prevTotal) => prevTotal - 1);

			toast.success('Xóa bài viết thành công!', { duration: 2000 });
			setDeleteDialogOpen(false);
			setPostToDelete(null);
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Không thể xóa bài viết', { duration: 2000 });
		}
	};

	const confirmTogglePriority = async () => {
		if (!postToPriority) return;

		try {
			await fetchApi(
				`/posts/${postToPriority._id}/priority`,
				{
					method: 'PUT',
					body: JSON.stringify({ priority: !postToPriority.priority }),
				},
				tokens
			);

			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post._id === postToPriority._id ? { ...post, priority: post.priority ? 0 : 1 } : post
				)
			);

			toast.success(
				postToPriority.priority ? 'Đã bỏ ưu tiên bài viết!' : 'Đã đặt bài viết ưu tiên!',
				{
					duration: 2000,
				}
			);
			setPriorityDialogOpen(false);
			setPostToPriority(null);
		} catch (error) {
			console.error('Error toggling post priority:', error);
			toast.error('Không thể cập nhật ưu tiên bài viết', { duration: 2000 });
		}
	};

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
						<PostFilters
							search={search}
							onSearchChange={(value) => {
								setSearch(value);
								handleSearch(value);
							}}
							onFilterChange={handleFilterChange}
						/>
					</div>
				</CardHeader>
				<CardContent>
					<PostTable
						posts={posts}
						loading={loading}
						onView={handleViewPost}
						onApprove={handleApprovePost}
						onReject={handleRejectPost}
						onDelete={handleDeletePost}
						onTogglePriority={handleTogglePriority}
					/>

					{!loading && posts.length > 0 && (
						<PaginationClient
							total={total}
							filter={{ page: filters.page, limit: filters.limit }}
							setFilter={handlePaginationChange}
							className="mt-6"
						/>
					)}
				</CardContent>
			</Card>

			{/* All confirmation dialogs */}
			<ConfirmationDialogs
				actionDialogOpen={actionDialogOpen}
				setActionDialogOpen={setActionDialogOpen}
				actionType={actionType}
				postToAction={postToAction}
				onConfirmAction={confirmAction}
				deleteDialogOpen={deleteDialogOpen}
				setDeleteDialogOpen={setDeleteDialogOpen}
				postToDelete={postToDelete}
				onConfirmDelete={confirmDeletePost}
				priorityDialogOpen={priorityDialogOpen}
				setPriorityDialogOpen={setPriorityDialogOpen}
				postToPriority={postToPriority}
				onConfirmPriority={confirmTogglePriority}
			/>

			{/* Reject reason dialog */}
			<RejectReasonDialog
				open={rejectDialogOpen}
				onOpenChange={setRejectDialogOpen}
				post={postToReject}
				onConfirm={confirmReject}
			/>
		</div>
	);
}
