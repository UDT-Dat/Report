'use client';

import { useEffect, useState } from 'react';

import PaginationClient from '@/components/pagination/PaginationClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import { Comment as CommentType, PostStatus, Post as PostType } from '@/lib/types';
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Download,
	FileText,
	Heart,
	Loader2,
	Mail,
	MessageCircle,
	Search,
	Share2,
	Trash2,
	User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

// Sample data for demonstration
const SAMPLE_POST = {
	_id: '1',
	title: 'Hướng dẫn học React cho người mới bắt đầu',
	content: `
    <h2>Giới thiệu về React</h2>
    <p>React là một thư viện JavaScript phổ biến được phát triển bởi Facebook để xây dựng giao diện người dùng. React sử dụng component-based architecture, giúp developers tạo ra các ứng dụng web tương tác một cách hiệu quả.</p>

    <h3>Tại sao nên học React?</h3>
    <ul>
      <li>Component-based: Tái sử dụng code dễ dàng</li>
      <li>Virtual DOM: Hiệu suất cao</li>
      <li>Ecosystem phong phú</li>
      <li>Cộng đồng lớn và hỗ trợ tốt</li>
    </ul>

    <h3>Bắt đầu với React</h3>
    <p>Để bắt đầu học React, bạn cần có kiến thức cơ bản về:</p>
    <ol>
      <li>HTML/CSS</li>
      <li>JavaScript ES6+</li>
      <li>Node.js và npm</li>
    </ol>

    <p>Sau đó, bạn có thể tạo project React đầu tiên bằng Create React App:</p>
    <pre><code>npx create-react-app my-app
cd my-app
npm start</code></pre>
  `,
	status: 'approved',
	createdAt: '2024-01-15T10:30:00Z',
	updatedAt: '2024-01-15T10:30:00Z',
	createdBy: {
		_id: 'user1',
		name: 'Nguyễn Văn A',
		email: 'nguyenvana@vlu.edu.vn',
		avatar: 'avatar1.jpg',
		role: 'member',
	},
	likes: 25,
	comments: 8,
	views: 150,
	tags: ['React', 'JavaScript', 'Frontend', 'Tutorial'],
};

const SAMPLE_COMMENTS = [
	{
		_id: '1',
		content: 'Bài viết rất hữu ích! Cảm ơn bạn đã chia sẻ.',
		createdAt: '2024-01-15T11:00:00Z',
		createdBy: {
			_id: 'user2',
			name: 'Trần Thị B',
			email: 'tranthib@vlu.edu.vn',
			avatar: 'avatar2.jpg',
			role: 'member',
		},
	},
	{
		_id: '2',
		content: 'Mình đang học React và bài này giúp mình hiểu rõ hơn về component.',
		createdAt: '2024-01-15T12:30:00Z',
		createdBy: {
			_id: 'user3',
			name: 'Lê Văn C',
			email: 'levanc@vlu.edu.vn',
			avatar: 'avatar3.jpg',
			role: 'member',
		},
	},
	{
		_id: '3',
		content: 'Có thể viết thêm về React Hooks không ạ?',
		createdAt: '2024-01-15T14:15:00Z',
		createdBy: {
			_id: 'user4',
			name: 'Phạm Thị D',
			email: 'phamthid@vlu.edu.vn',
			avatar: 'avatar4.jpg',
			role: 'bod',
		},
	},
];

const SAMPLE_LIKES = [
	{
		_id: 'user2',
		name: 'Trần Thị B',
		email: 'tranthib@vlu.edu.vn',
		avatar: 'avatar2.jpg',
		role: 'member',
		likedAt: '2024-01-15T11:05:00Z',
	},
	{
		_id: 'user3',
		name: 'Lê Văn C',
		email: 'levanc@vlu.edu.vn',
		avatar: 'avatar3.jpg',
		role: 'member',
		likedAt: '2024-01-15T12:35:00Z',
	},
	{
		_id: 'user4',
		name: 'Phạm Thị D',
		email: 'phamthid@vlu.edu.vn',
		avatar: 'avatar4.jpg',
		role: 'bod',
		likedAt: '2024-01-15T14:20:00Z',
	},
];

interface LikeUser {
	_id: string;
	post: string;
	user: {
		_id: string;
		name: string;
		email: string;
		role: string;
		avatar?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const postId = params.id as string;

	const [post, setPost] = useState<PostType | null>(null);
	const [comments, setComments] = useState<CommentType[]>([]);
	const [likes, setLikes] = useState<LikeUser[]>([]);
	const [loading, setLoading] = useState(true);
	const { tokens } = useAuth();
	const [commentsLoading, setCommentsLoading] = useState(false);
	const [likesLoading, setLikesLoading] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);
	const [commentsTotal, setCommentsTotal] = useState(0);
	const [likesTotal, setLikesTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [activeTab, setActiveTab] = useState('details');
	const [commentsFilters, setCommentsFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
	});
	const [likesFilters, setLikesFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
	});

	const [actionLoading, setActionLoading] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [actionDialogOpen, setActionDialogOpen] = useState(false);
	const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

	// Fetch post details
	const fetchPost = async () => {
		try {
			setLoading(true);
			const postResponse = await fetchApi(
				`/posts/${postId}`,
				{
					method: 'GET',
				},
				tokens
			);
			console.log("🚀 ~ fetchPost ~ postResponse:", postResponse)
			if (postResponse.status === 200) {
				setPost(postResponse.result);
				setLikesTotal(postResponse.result.likes ?? 0);
				setCommentsTotal(postResponse.result.comments ?? 0);
			}
		} catch (error) {
			console.error('Error fetching post:', error);
			toast.error('Không thể tải thông tin bài viết', {
				duration: 2000,
			});
		} finally {
			setLoading(false);
		}
	};

	// Fetch comments
	const fetchComments = async () => {
		try {
			setCommentsLoading(true);
			const commentsResponse = await fetchApi(
				`/comments?postId=${postId}`,
				{
					method: 'GET',
				},
				tokens
			);
			console.log('🚀 ~ fetchComments ~ commentsResponse:', commentsResponse);
			if (commentsResponse.status === 200) {
				setComments(commentsResponse.result.comments);
				setCommentsTotal(commentsResponse.result.pagination.total);
			}

			// Filter sample data
		} catch (error) {
			console.error('Error fetching comments:', error);
			toast.error('Không thể tải danh sách bình luận', {
				duration: 2000,
			});
		} finally {
			setCommentsLoading(false);
		}
	};

	// Fetch likes
	const fetchLikes = async () => {
		try {
			setLikesLoading(true);
			const response = await fetchApi(
				`/likes/${postId}/getLikes`,
				{
					method: 'GET',
				},
				tokens
			);
			if (response.status === 200) {
				setLikes(response.result.likes);
				setLikesTotal(response.result.pagination.total);
			}
		} catch (error) {
			console.error('Error fetching likes:', error);
			toast.error('Không thể tải danh sách lượt thích', {
				duration: 2000,
			});
		} finally {
			setLikesLoading(false);
		}
	};

	useEffect(() => {
		if (postId) {
			fetchPost();
		}
	}, [postId]);

	useEffect(() => {
		if (postId && activeTab === 'comments') {
			console.log('Fetching comments for post:', postId);

			fetchComments();
		}
	}, [postId, commentsFilters, activeTab]);

	useEffect(() => {
		if (postId && activeTab === 'likes') {
			fetchLikes();
		}
	}, [postId, likesFilters, activeTab]);

	// Get status badge
	const getStatusBadge = (status: PostStatus) => {
		const statusConfig = {
			pending: { label: 'Chờ duyệt', variant: 'secondary' },
			approved: { label: 'Đã duyệt', variant: 'success' },
			rejected: { label: 'Từ chối', variant: 'destructive' },
		};

		const config = statusConfig[status] || statusConfig.approved;

		return (
			<Badge variant={config.variant as any} className="text-sm font-medium">
				{config.label}
			</Badge>
		);
	};

	// Format date
	const formatDateUtil = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Handle search for comments
	const handleCommentsSearch = useDebouncedCallback((value: string) => {
		setCommentsFilters((prev) => ({
			...prev,
			page: 1,
			search: value,
		}));
	}, 500);

	// Handle search for likes
	const handleLikesSearch = useDebouncedCallback((value: string) => {
		setLikesFilters((prev) => ({
			...prev,
			page: 1,
			search: value,
		}));
	}, 500);

	// Export comments to Excel
	const exportCommentsToExcel = async () => {
		try {
			setExportLoading(true);
			// TODO: Replace with actual API call
			// const response = await postService.exportPostComments(postId, commentsFilters, tokens)

			// Simulate export
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success('Xuất dữ liệu thành công', {
				description: 'Danh sách bình luận đã được xuất ra file Excel',
				duration: 3000,
			});
		} catch (error) {
			console.error('Error exporting comments:', error);
			toast.error('Có lỗi xảy ra khi xuất dữ liệu', {
				duration: 3000,
			});
		} finally {
			setExportLoading(false);
		}
	};

	// Share post
	const sharePost = () => {
		if (navigator.share) {
			navigator
				.share({
					title: post?.title,
					text: post?.title,
					url: window.location.href,
				})
				.then(() => console.log('Shared successfully'))
				.catch((error) => console.log('Error sharing:', error));
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Đã sao chép liên kết bài viết', {
				duration: 2000,
			});
		}
	};

	// Handle approve post
	const handleApprovePost = async () => {
		try {
			setActionLoading(true);

			await fetchApi(
				`/posts/${postId}/status`,
				{
					method: 'PUT',
					body: JSON.stringify({ status: PostStatus.Approved }),
				},
				tokens
			);

			// Update local state
			setPost((prev) => (prev ? { ...prev, status: PostStatus.Approved } : null));

			toast.success('Duyệt bài viết thành công!', {
				duration: 2000,
			});

			setActionDialogOpen(false);
			setActionType(null);
		} catch (error) {
			console.error('Error approving post:', error);
			toast.error('Không thể duyệt bài viết', {
				duration: 2000,
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Handle reject post
	const handleRejectPost = async () => {
		try {
			setActionLoading(true);

			await fetchApi(
				`/posts/${postId}/status`,
				{
					method: 'PUT',
					body: JSON.stringify({ status: PostStatus.Rejected }),
				},
				tokens
			);

			// Update local state
			setPost((prev) => (prev ? { ...prev, status: PostStatus.Rejected } : null));

			toast.success('Từ chối bài viết thành công!', {
				duration: 2000,
			});

			setActionDialogOpen(false);
			setActionType(null);
		} catch (error) {
			console.error('Error rejecting post:', error);
			toast.error('Không thể từ chối bài viết', {
				duration: 2000,
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Handle delete post
	const handleDeletePost = async () => {
		try {
			setActionLoading(true);

			await fetchApi(
				`/posts/${postId}`,
				{
					method: 'DELETE',
				},
				tokens
			);

			toast.success('Xóa bài viết thành công!', {
				duration: 2000,
			});

			setDeleteDialogOpen(false);

			// Redirect to posts list after successful deletion
			router.push('/admin/dashboard/bod/posts');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Không thể xóa bài viết', {
				duration: 2000,
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Open action dialogs
	const openApproveDialog = () => {
		setActionType('approve');
		setActionDialogOpen(true);
	};

	const openRejectDialog = () => {
		setActionType('reject');
		setActionDialogOpen(true);
	};

	const openDeleteDialog = () => {
		setDeleteDialogOpen(true);
	};

	// Confirm action
	const confirmAction = () => {
		if (actionType === 'approve') {
			handleApprovePost();
		} else if (actionType === 'reject') {
			handleRejectPost();
		}
	};

	// Check if user has admin permissions
	const hasAdminPermissions = () => {
		// TODO: Replace with actual role check from auth context
		// return user?.role === "admin" || user?.role === "bod"
		return true; // For demo purposes
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 space-y-8">
				<div className="flex items-center mb-4">
					<Button variant="ghost" disabled className="mr-2">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Quay lại
					</Button>
				</div>

				<div className="space-y-4">
					<Skeleton className="h-10 w-3/4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<div className="flex flex-wrap gap-4 mt-4">
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-6 w-40" />
					</div>
					<Skeleton className="h-8 w-24 mt-2" />
				</div>

				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex items-center space-x-4">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-2 flex-1">
										<Skeleton className="h-4 w-[200px]" />
										<Skeleton className="h-4 w-[150px]" />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="container mx-auto p-6">
				<Button variant="ghost" onClick={() => router.back()} className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại
				</Button>

				<Alert variant="destructive" className="max-w-2xl mx-auto">
					<AlertCircle className="h-5 w-5" />
					<AlertTitle>Không tìm thấy bài viết</AlertTitle>
					<AlertDescription>
						Bài viết này không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn hoặc quay lại
						trang trước.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<Button variant="ghost" onClick={() => router.back()} className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					Quay lại
				</Button>

				<div className="flex gap-2">
					{/* Admin Actions - Only show for pending posts and admin users */}
					{getStatusBadge(post.status)}

					{/* Delete button - Show for all admin users */}
					{hasAdminPermissions() && (
						<Button
							variant="outline"
							size="sm"
							onClick={openDeleteDialog}
							disabled={actionLoading}
							className="gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
						>
							{actionLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Trash2 className="h-4 w-4" />
							)}
							Xóa
						</Button>
					)}

					<Button variant="outline" size="sm" onClick={sharePost} className="gap-2">
						<Share2 className="h-4 w-4" />
						Chia sẻ
					</Button>
					{(activeTab === 'comments' || activeTab === 'likes') && (
						<Button
							variant="outline"
							size="sm"
							onClick={exportCommentsToExcel}
							disabled={exportLoading}
							className="gap-2"
						>
							{exportLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Đang xuất...
								</>
							) : (
								<>
									<Download className="h-4 w-4" />
									Xuất Excel
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Post Header Card */}
			<Card className="border-t-4 border-t-primary overflow-hidden">
				<CardContent className="pt-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="flex items-center p-3 rounded-lg bg-muted/50">
							<Calendar className="h-5 w-5 text-primary mr-3" />
							<div>
								<div className="text-sm font-medium">Ngày tạo</div>
								<div className="text-sm text-muted-foreground">
									{formatDateUtil(post.createdAt)}
								</div>
							</div>
						</div>

						<div className="flex items-center p-3 rounded-lg bg-muted/50">
							<Heart className="h-5 w-5 text-primary mr-3" />
							<div>
								<div className="text-sm font-medium">Lượt thích</div>
								<div className="text-sm text-muted-foreground">{post.likes} lượt thích</div>
							</div>
						</div>

						<div className="flex items-center p-3 rounded-lg bg-muted/50">
							<MessageCircle className="h-5 w-5 text-primary mr-3" />
							<div>
								<div className="text-sm font-medium">Bình luận</div>
								<div className="text-sm text-muted-foreground">{post.comments} bình luận</div>
							</div>
						</div>
					</div>

					<div className="flex items-center">
						<Avatar className="h-10 w-10 mr-3">
							<AvatarImage
								src={
									post.createdBy.avatar
										? `${process.env.NEXT_PUBLIC_API_URL}/${post.createdBy.avatar}`
										: '/placeholder.svg'
								}
								alt={post.createdBy.name}
							/>
							<AvatarFallback>{post.createdBy.name?.charAt(0) || 'A'}</AvatarFallback>
						</Avatar>
						<div>
							<div className="text-sm text-muted-foreground">Tác giả</div>
							<div className="font-medium">{post.createdBy.name}</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs
				defaultValue="details"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="grid grid-cols-3 md:w-[500px]">
					<TabsTrigger value="details" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Nội dung
					</TabsTrigger>
					<TabsTrigger value="comments" className="flex items-center gap-2">
						<MessageCircle className="h-4 w-4" />
						Bình luận ({commentsTotal})
					</TabsTrigger>
					<TabsTrigger value="likes" className="flex items-center gap-2">
						<Heart className="h-4 w-4" />
						Lượt thích ({likesTotal})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="mt-6 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">Nội dung bài viết</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose prose-sm max-w-none dark:prose-invert">
								<div dangerouslySetInnerHTML={{ __html: post.content }} />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="comments" className="mt-6">
					<Card>
						<CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
							<div>
								<CardTitle className="flex items-center">
									<MessageCircle className="mr-2 h-5 w-5" />
									Danh sách bình luận
								</CardTitle>
								<CardDescription>Tổng cộng {commentsTotal} bình luận</CardDescription>
							</div>
							<div className="flex flex-col sm:flex-row gap-3">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Tìm kiếm bình luận..."
										className="pl-8 w-full md:w-64"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											handleCommentsSearch(e.target.value);
										}}
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{commentsLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<span className="ml-2">Đang tải danh sách bình luận...</span>
								</div>
							) : comments.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
									<MessageCircle className="h-16 w-16 mb-4 opacity-20" />
									<p className="text-lg font-medium mb-1">
										{commentsFilters.search
											? 'Không tìm thấy bình luận nào'
											: 'Chưa có bình luận nào'}
									</p>
									<p className="text-sm">
										{commentsFilters.search
											? 'Thử tìm kiếm với từ khóa khác'
											: 'Bình luận sẽ xuất hiện ở đây'}
									</p>
								</div>
							) : (
								<>
									<div className="space-y-4">
										{comments.map((comment) => (
											<div key={comment._id} className="border rounded-lg p-4">
												<div className="flex items-start space-x-3">
													<Avatar className="h-8 w-8">
														<AvatarImage
															src={
																`${process.env.NEXT_PUBLIC_API_URL || '/placeholder.svg'}/${
																	comment.createdBy.avatar
																}` || '/placeholder.svg'
															}
															alt={comment.createdBy.name}
														/>
														<AvatarFallback>{comment.createdBy.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<span className="font-medium text-sm">{comment.createdBy.name}</span>
															<span className="text-xs text-muted-foreground">
																{formatDateUtil(comment.createdAt)}
															</span>
														</div>
														<p className="text-sm">{comment.content}</p>
													</div>
												</div>
											</div>
										))}
									</div>

									<div className="mt-6">
										<PaginationClient
											total={commentsTotal}
											filter={{ page: commentsFilters.page, limit: commentsFilters.limit }}
											setFilter={(newFilter) =>
												setCommentsFilters((prev) => ({ ...prev, ...newFilter }))
											}
										/>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="likes" className="mt-6">
					<Card>
						<CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
							<div>
								<CardTitle className="flex items-center">
									<Heart className="mr-2 h-5 w-5" />
									Danh sách lượt thích
								</CardTitle>
								<CardDescription>Tổng cộng {likesTotal} lượt thích</CardDescription>
							</div>
							<div className="flex flex-col sm:flex-row gap-3">
								<div className="relative">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Tìm kiếm người thích..."
										className="pl-8 w-full md:w-64"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
											handleLikesSearch(e.target.value);
										}}
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{likesLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
									<span className="ml-2">Đang tải danh sách lượt thích...</span>
								</div>
							) : likes.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
									<Heart className="h-16 w-16 mb-4 opacity-20" />
									<p className="text-lg font-medium mb-1">
										{likesFilters.search ? 'Không tìm thấy ai' : 'Chưa có lượt thích nào'}
									</p>
									<p className="text-sm">
										{likesFilters.search
											? 'Thử tìm kiếm với từ khóa khác'
											: 'Lượt thích sẽ xuất hiện ở đây'}
									</p>
								</div>
							) : (
								<>
									<div className="rounded-md border overflow-hidden">
										<Table>
											<TableHeader>
												<TableRow className="bg-muted/50">
													<TableHead>Tên</TableHead>
													<TableHead>Email</TableHead>
													<TableHead>Vai trò</TableHead>
													<TableHead>Thời gian thích</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{likes.map((like) => {
													let badgeVariant: 'destructive' | 'default' | 'secondary';
													let badgeLabel: string;
													if (like.user.role === 'admin') {
														badgeVariant = 'destructive';
														badgeLabel = 'Quản trị viên';
													} else if (like.user.role === 'bod') {
														badgeVariant = 'default';
														badgeLabel = 'Ban chủ nhiệm';
													} else {
														badgeVariant = 'secondary';
														badgeLabel = 'Thành viên';
													}
													return (
														<TableRow key={like._id} className="hover:bg-muted/50">
															<TableCell className="font-medium">
																<div className="flex items-center">
																	<Avatar className="h-8 w-8 mr-3">
																		<AvatarImage
																			src={
																				`${process.env.NEXT_PUBLIC_API_URL}/${like.user.avatar}` ||
																				'/placeholder.svg'
																			}
																			alt={like.user.name}
																		/>
																		<AvatarFallback className="bg-primary/10">
																			<User className="h-4 w-4 text-primary" />
																		</AvatarFallback>
																	</Avatar>
																	<span className="truncate max-w-[180px]">{like.user.name}</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center">
																	<Mail className="mr-2 h-4 w-4 text-muted-foreground" />
																	<span className="truncate max-w-[180px]">{like.user.email}</span>
																</div>
															</TableCell>
															<TableCell>
																<Badge variant={badgeVariant}>{badgeLabel}</Badge>
															</TableCell>
															<TableCell>{formatDateUtil(like.createdAt)}</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>

									<div className="mt-6">
										<PaginationClient
											total={likesTotal}
											filter={{ page: likesFilters.page, limit: likesFilters.limit }}
											setFilter={(newFilter) =>
												setLikesFilters((prev) => ({ ...prev, ...newFilter }))
											}
										/>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Action Confirmation Dialog (Approve/Reject) */}
			<AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{actionType === 'approve' ? 'Xác nhận duyệt bài viết' : 'Xác nhận từ chối bài viết'}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn {actionType === 'approve' ? 'duyệt' : 'từ chối'} bài viết "
							{post?.title}"?
							{actionType === 'reject' && ' Bài viết sẽ không được hiển thị công khai.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmAction}
							disabled={actionLoading}
							className={
								actionType === 'approve'
									? 'bg-green-600 hover:bg-green-700'
									: 'bg-orange-600 hover:bg-orange-700'
							}
						>
							{actionLoading ? (
								<div className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									{actionType === 'approve' ? 'Đang duyệt...' : 'Đang từ chối...'}
								</div>
							) : actionType === 'approve' ? (
								'Duyệt'
							) : (
								'Từ chối'
							)}
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
							Bạn có chắc chắn muốn xóa bài viết "{post?.title}"? Hành động này không thể hoàn tác
							và sẽ xóa tất cả bình luận, lượt thích liên quan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeletePost}
							disabled={actionLoading}
							className="bg-red-600 hover:bg-red-700"
						>
							{actionLoading ? (
								<div className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Đang xóa...
								</div>
							) : (
								'Xóa bài viết'
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
